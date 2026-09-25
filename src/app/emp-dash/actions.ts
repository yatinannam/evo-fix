// @ts-nocheck
'use server';

import { createEmpDashServerClient, createEmpDashAdminClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { backendChecklistComplete } from '@/lib/emp-dash/domain-fields';
import type { TaskStatus, Priority, NoteVisibility, NotificationType } from '@/lib/supabase/types';

// ── Internal helpers ──────────────────────────────────────────────────────────

async function getActorProfile(supabase: Awaited<ReturnType<typeof createEmpDashServerClient>>, userId: string) {
  const { data } = await supabase
    .from('emp_profiles')
    .select('*, emp_roles(name)')
    .eq('id', userId)
    .single();
  return data as (typeof data & { emp_roles: { name: string } }) | null;
}

// Uses the service-role client — emp_notifications' INSERT policy is
// WITH CHECK (false) for the authenticated role (see migration_v4_hardening.sql),
// so any user impersonating another user's notifications via a direct client
// call is rejected; only this server-side path can write notification rows.
async function writeNotification(
  profileId: string,
  type: NotificationType,
  payload: Record<string, unknown>,
) {
  const admin = createEmpDashAdminClient();
  await admin.from('emp_notifications').insert({ profile_id: profileId, type, payload });
}

async function writeAuditLog(
  supabase: Awaited<ReturnType<typeof createEmpDashServerClient>>,
  actorId: string,
  action: string,
  target: Record<string, unknown>,
) {
  await supabase.from('emp_audit_log').insert({ actor_id: actorId, action, target });
}

// ── Create task ───────────────────────────────────────────────────────────────

export async function createTaskAction(formData: FormData) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const domainId    = formData.get('domain_id') as string;
  const title       = (formData.get('title') as string)?.trim();
  const description = (formData.get('description') as string)?.trim() || null;
  const priority    = (formData.get('priority') as Priority) ?? 'medium';
  const deadline    = (formData.get('deadline') as string) || null;
  const assigneeIds = formData.getAll('assignee_ids') as string[];
  const tagsRaw     = (formData.get('tags') as string) ?? '';
  const tags        = tagsRaw.split(',').map(t => t.trim()).filter(Boolean);
  const customFieldsRaw = formData.get('custom_fields') as string;
  const milestonesRaw   = formData.get('milestones') as string;

  if (!title || !domainId) return { error: 'Title and domain are required' };

  let customFields: Record<string, unknown> = {};
  try { customFields = customFieldsRaw ? JSON.parse(customFieldsRaw) : {}; }
  catch { return { error: 'Invalid custom fields JSON' }; }

  let milestonesData: { title: string; due_date: string | null }[] = [];
  try { milestonesData = milestonesRaw ? JSON.parse(milestonesRaw) : []; }
  catch { return { error: 'Invalid milestones JSON' }; }

  // Create in draft first — DB trigger enforces the rest
  const { data: task, error: taskErr } = await supabase
    .from('emp_tasks')
    .insert({
      title, description, domain_id: domainId, priority, deadline,
      tags, custom_fields: customFields,
      status: 'draft',
      created_by: user.id,
    })
    .select('id')
    .single();

  if (taskErr || !task) return { error: taskErr?.message ?? 'Failed to create task' };

  // Insert assignees
  if (assigneeIds.length > 0) {
    const assignees = assigneeIds.map(pid => ({ task_id: task.id, profile_id: pid, assigned_by: user.id }));
    const { error: assignErr } = await supabase.from('emp_task_assignees').insert(assignees);
    if (assignErr) return { error: `Task created but failed to assign: ${assignErr.message}` };
  }

  // Transition draft → not_started now that it's set up.
  // enforce_task_status_transition() writes the emp_task_status_history row
  // itself (from_status='draft') — no manual history insert needed here.
  const { error: transErr } = await supabase
    .from('emp_tasks')
    .update({ status: 'not_started' })
    .eq('id', task.id);

  if (transErr) return { error: `Task created but failed to publish: ${transErr.message}` };

  // Insert milestones
  if (milestonesData.length > 0) {
    const milestoneRows = milestonesData
      .filter(m => m.title.trim())
      .map((m, i) => ({ task_id: task.id, title: m.title.trim(), due_date: m.due_date || null, sort_order: i }));
    if (milestoneRows.length > 0) {
      await supabase.from('emp_task_milestones').insert(milestoneRows);
    }
  }

  // Notify assignees
  for (const pid of assigneeIds) {
    await writeNotification(pid, 'task_assigned', {
      task_id: task.id, task_title: title, assigned_by: user.id,
    });
  }

  // Write audit log
  await writeAuditLog(supabase, user.id, 'task_created', { task_id: task.id, title, domain_id: domainId });

  revalidatePath('/emp-dash');
  revalidatePath('/emp-dash/tasks');
  redirect(`/emp-dash/tasks/${task.id}`);
}

// ── Update task status ────────────────────────────────────────────────────────

export async function updateTaskStatusAction(
  taskId: string,
  newStatus: TaskStatus,
  comment?: string,
) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: task, error: fetchErr } = await supabase
    .from('emp_tasks')
    .select('*, emp_task_assignees(profile_id)')
    .eq('id', taskId)
    .single();

  if (fetchErr || !task) return { error: 'Task not found' };

  const currentStatus = task.status as TaskStatus;

  // Backend dev checklist gate (app-layer, before DB trigger fires)
  if (newStatus === 'submitted_for_review') {
    const { data: domainRow } = await supabase.from('emp_domains').select('slug').eq('id', task.domain_id).single();
    if (domainRow?.slug === 'backend_dev') {
      const cf = task.custom_fields as Record<string, unknown>;
      if (!backendChecklistComplete(cf)) {
        return { error: 'Complete the pre-submit checklist (Tests written, Peer reviewed, No linter errors) before submitting for review.' };
      }
    }
  }

  // Require comment when returning a task
  if (currentStatus === 'submitted_for_review' && newStatus === 'in_progress') {
    if (!comment?.trim()) {
      return { error: 'A comment explaining the required changes is mandatory when returning a task.' };
    }
  }

  // Clear reviewing state on status change away from submitted_for_review
  const reviewingBy = (newStatus === 'submitted_for_review') ? null
    : (currentStatus === 'submitted_for_review') ? null
    : task.reviewing_by;

  // status_change_comment travels in the same UPDATE that changes `status` so
  // enforce_task_status_transition() can validate it (mandatory on return)
  // and write the emp_task_status_history row atomically — not bypassable via
  // a raw client update that skips this server action's own pre-checks above.
  const { error: updateErr } = await supabase
    .from('emp_tasks')
    .update({
      status: newStatus,
      reviewing_by: reviewingBy,
      reviewing_since: reviewingBy ? task.reviewing_since : null,
      status_change_comment: comment?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', taskId);

  if (updateErr) return { error: updateErr.message };

  // Notify: assignees + creator on status change
  const assigneeIds = ((task as { emp_task_assignees: { profile_id: string }[] }).emp_task_assignees ?? []).map(a => a.profile_id);
  const notifyIds = new Set([...assigneeIds, task.created_by].filter(id => id !== user.id));
  for (const pid of notifyIds) {
    await writeNotification(pid, 'status_changed', {
      task_id: taskId, task_title: task.title, from_status: currentStatus, to_status: newStatus, comment: comment?.trim() || null,
    });
  }

  // Write audit log
  await writeAuditLog(supabase, user.id, 'status_changed', {
    task_id: taskId, from_status: currentStatus, to_status: newStatus,
  });

  revalidatePath('/emp-dash');
  revalidatePath('/emp-dash/tasks');
  revalidatePath(`/emp-dash/tasks/${taskId}`);
  return { success: true };
}

// ── Claim task review ─────────────────────────────────────────────────────────

export async function claimTaskReviewAction(taskId: string) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: task } = await supabase
    .from('emp_tasks')
    .select('reviewing_by, reviewing_since, title')
    .eq('id', taskId)
    .single();
  if (!task) return { error: 'Task not found' };

  const twoHours = 2 * 60 * 60 * 1000;
  const staleCutoffIso = new Date(Date.now() - twoHours).toISOString();
  const wasHeldByOther = !!task.reviewing_by && task.reviewing_by !== user.id;

  // Fast-fail pre-check for a friendly message (not the security boundary —
  // the conditional UPDATE below is the actual compare-and-swap).
  if (wasHeldByOther) {
    const lockAge = task.reviewing_since
      ? Date.now() - new Date(task.reviewing_since).getTime()
      : Infinity;
    if (lockAge < twoHours) {
      const { data: reviewer } = await supabase.from('emp_profiles').select('full_name').eq('id', task.reviewing_by!).single();
      return { error: `Already under review by ${reviewer?.full_name ?? 'another Domain Head'}` };
    }
  }

  const now = new Date().toISOString();

  // Compare-and-swap: only succeeds if the row still matches "unclaimed,
  // already mine, or stale" at write time — closes the race where two heads
  // both pass the read-check above before either writes.
  const { data: claimed, error: claimErr } = await supabase
    .from('emp_tasks')
    .update({ reviewing_by: user.id, reviewing_since: now })
    .eq('id', taskId)
    .or(`reviewing_by.is.null,reviewing_by.eq.${user.id},reviewing_since.lt.${staleCutoffIso}`)
    .select('id')
    .maybeSingle();

  if (claimErr) return { error: claimErr.message };

  if (!claimed) {
    // Someone else won the race between our read and our write.
    const { data: current } = await supabase.from('emp_tasks').select('reviewing_by').eq('id', taskId).single();
    const { data: reviewer } = current?.reviewing_by
      ? await supabase.from('emp_profiles').select('full_name').eq('id', current.reviewing_by).single()
      : { data: null };
    return { error: `Already under review by ${reviewer?.full_name ?? 'another Domain Head'}` };
  }

  // Notify previous reviewer if we took over a stale lock
  if (wasHeldByOther) {
    await writeNotification(task.reviewing_by!, 'review_claimed', {
      task_id: taskId, task_title: task.title, claimed_by: user.id,
    });
  }

  revalidatePath(`/emp-dash/tasks/${taskId}`);
  return { success: true };
}

// ── Release task review lock ──────────────────────────────────────────────────

export async function releaseTaskReviewAction(taskId: string) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: task } = await supabase.from('emp_tasks').select('reviewing_by').eq('id', taskId).single();
  if (!task) return { error: 'Task not found' };
  if (task.reviewing_by !== user.id) return { error: 'You are not currently reviewing this task' };

  await supabase.from('emp_tasks').update({ reviewing_by: null, reviewing_since: null }).eq('id', taskId);
  revalidatePath(`/emp-dash/tasks/${taskId}`);
  return { success: true };
}

// ── Add comment ───────────────────────────────────────────────────────────────

export async function addCommentAction(taskId: string, body: string) {
  if (!body.trim()) return { error: 'Comment cannot be empty' };
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('emp_task_comments').insert({
    task_id: taskId, author_id: user.id, body: body.trim(),
  });
  if (error) return { error: error.message };

  // Notify task participants (assignees + creator), excluding commenter
  const { data: task } = await supabase
    .from('emp_tasks')
    .select('title, created_by, emp_task_assignees(profile_id)')
    .eq('id', taskId)
    .single();

  if (task) {
    const assigneeIds = ((task as { emp_task_assignees: { profile_id: string }[] }).emp_task_assignees ?? []).map(a => a.profile_id);
    const notifyIds = new Set([...assigneeIds, task.created_by].filter(id => id !== user.id));
    for (const pid of notifyIds) {
      await writeNotification(pid, 'comment_added', {
        task_id: taskId, task_title: task.title, commenter_id: user.id,
      });
    }

    // Mention detection: @mentions in the body
    const mentionedNames = body.match(/@[\w\s]+/g)?.map(m => m.slice(1).trim()) ?? [];
    if (mentionedNames.length > 0) {
      const { data: mentionedProfiles } = await supabase
        .from('emp_profiles')
        .select('id, full_name')
        .in('full_name', mentionedNames);
      for (const p of mentionedProfiles ?? []) {
        if (p.id !== user.id) {
          await writeNotification(p.id, 'mention', {
            task_id: taskId, task_title: task.title, commenter_id: user.id, body: body.trim(),
          });
        }
      }
    }
  }

  revalidatePath(`/emp-dash/tasks/${taskId}`);
  return { success: true };
}

// ── Milestones ────────────────────────────────────────────────────────────────

export async function addMilestoneAction(taskId: string, title: string, dueDate?: string) {
  if (!title.trim()) return { error: 'Milestone title is required' };
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: existing } = await supabase
    .from('emp_task_milestones')
    .select('id')
    .eq('task_id', taskId)
    .order('sort_order', { ascending: false })
    .limit(1);
  const nextOrder = existing && existing.length > 0 ? ((existing[0] as { sort_order?: number }).sort_order ?? 0) + 1 : 0;

  const { error } = await supabase.from('emp_task_milestones').insert({
    task_id: taskId, title: title.trim(), due_date: dueDate || null, sort_order: nextOrder,
  });
  if (error) return { error: error.message };

  revalidatePath(`/emp-dash/tasks/${taskId}`);
  return { success: true };
}

export async function toggleMilestoneAction(milestoneId: string, done: boolean) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('emp_task_milestones').update({ done }).eq('id', milestoneId);
  if (error) return { error: error.message };

  // Revalidate — we need the task_id; fetch it first
  const { data: ms } = await supabase.from('emp_task_milestones').select('task_id').eq('id', milestoneId).single();
  if (ms) revalidatePath(`/emp-dash/tasks/${ms.task_id}`);
  return { success: true };
}

export async function deleteMilestoneAction(milestoneId: string) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: ms } = await supabase.from('emp_task_milestones').select('task_id').eq('id', milestoneId).single();
  const { error } = await supabase.from('emp_task_milestones').delete().eq('id', milestoneId);
  if (error) return { error: error.message };

  if (ms) revalidatePath(`/emp-dash/tasks/${ms.task_id}`);
  return { success: true };
}

// ── Personal notes ────────────────────────────────────────────────────────────

export async function createPersonalNoteAction(
  body: string,
  aboutProfileId: string | null,
  taskId: string | null,
  visibility: NoteVisibility = 'private',
) {
  if (!body.trim()) return { error: 'Note body is required' };
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase.from('emp_personal_notes').insert({
    author_id: user.id,
    about_profile_id: aboutProfileId || null,
    task_id: taskId || null,
    body: body.trim(),
    visibility_scope: visibility,
  });
  if (error) return { error: error.message };

  revalidatePath('/emp-dash/notes');
  return { success: true };
}

export async function deletePersonalNoteAction(noteId: string) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('emp_personal_notes')
    .delete()
    .eq('id', noteId)
    .eq('author_id', user.id); // server-side confirm: only author can delete
  if (error) return { error: error.message };

  revalidatePath('/emp-dash/notes');
  return { success: true };
}

// ── Notifications ─────────────────────────────────────────────────────────────

export async function markNotificationReadAction(notificationId: string) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('emp_notifications')
    .update({ read: true })
    .eq('id', notificationId)
    .eq('profile_id', user.id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function markAllNotificationsReadAction() {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { error } = await supabase
    .from('emp_notifications')
    .update({ read: true })
    .eq('profile_id', user.id)
    .eq('read', false);
  if (error) return { error: error.message };
  return { success: true };
}

// ── Review overdue check (scoped to current viewer's domain tasks) ─────────────
// Called on page load — only queries tasks relevant to the viewer.

export async function checkOverdueReviewsAction() {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const { data: profile } = await supabase
    .from('emp_profiles')
    .select('role_id, emp_roles(name)')
    .eq('id', user.id)
    .single();

  const roleName = (profile as { emp_roles: { name: string } } | null)?.emp_roles?.name;
  const isAdminPlus = roleName === 'admin' || roleName === 'super_admin';

  // Get the domains this user can verify (head or admin+)
  let domainIds: string[] = [];
  if (isAdminPlus) {
    const { data: domains } = await supabase.from('emp_domains').select('id');
    domainIds = (domains ?? []).map(d => d.id);
  } else {
    const { data: headDomains } = await supabase
      .from('emp_user_domains')
      .select('domain_id')
      .eq('profile_id', user.id)
      .eq('role_in_domain', 'head');
    domainIds = (headDomains ?? []).map(d => d.domain_id);
  }

  if (domainIds.length === 0) return { success: true, overdue: [] };

  const cutoff = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  // Only query tasks in the viewer's domains that are overdue — NOT a full table scan
  const { data: overdueTasks, error } = await supabase
    .from('emp_tasks')
    .select('id, title, domain_id, updated_at')
    .eq('status', 'submitted_for_review')
    .in('domain_id', domainIds)
    .lt('updated_at', cutoff);

  if (error) return { error: error.message };

  // Write overdue notifications (deduped — only if no recent review_overdue notification exists)
  for (const task of overdueTasks ?? []) {
    const { data: existing } = await supabase
      .from('emp_notifications')
      .select('id')
      .eq('profile_id', user.id)
      .eq('type', 'review_overdue')
      .eq('payload->>task_id', task.id)
      .gte('created_at', cutoff)
      .limit(1);

    if (!existing || existing.length === 0) {
      await writeNotification(user.id, 'review_overdue', {
        task_id: task.id, task_title: task.title, domain_id: task.domain_id,
      });
    }
  }

  return { success: true, overdue: overdueTasks ?? [] };
}

// ── Create profile (Admin+ only) ──────────────────────────────────────────────

export async function createProfileAction(formData: FormData) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const actorProfile = await getActorProfile(supabase, user.id);
  const actorRole = actorProfile?.emp_roles?.name;
  if (actorRole !== 'admin' && actorRole !== 'super_admin') {
    return { error: 'Only Admins can create profiles' };
  }

  const email    = formData.get('email') as string;
  const fullName = formData.get('full_name') as string;
  const roleId   = formData.get('role_id') as string;
  const password = formData.get('password') as string;

  if (!email || !fullName || !roleId || !password) {
    return { error: 'All fields are required' };
  }

  // Validate target role
  const { data: targetRole } = await supabase.from('emp_roles').select('name').eq('id', roleId).single();
  if (!targetRole) return { error: 'Invalid role' };

  // Super admin creation requires a confirmation step and audit trail
  if (targetRole.name === 'super_admin') {
    if (actorRole !== 'super_admin') return { error: 'Only Super Admins can create other Super Admins' };
    // This action is logged as super_admin_created in the audit log below
  }

  if (actorRole === 'admin' && (targetRole.name === 'super_admin' || targetRole.name === 'admin')) {
    return { error: 'Admins can only create Domain Head or Employee profiles' };
  }

  const adminClient = createEmpDashAdminClient();
  const { data: authUser, error: authErr } = await adminClient.auth.admin.createUser({
    email, password, email_confirm: true,
  });

  if (authErr || !authUser?.user) return { error: authErr?.message ?? 'Failed to create auth user' };

  const { error: profileErr } = await supabase.from('emp_profiles').insert({
    id: authUser.user.id, full_name: fullName, email, role_id: roleId, created_by: user.id,
  });

  if (profileErr) {
    await adminClient.auth.admin.deleteUser(authUser.user.id);
    return { error: profileErr.message };
  }

  // Audit log
  const auditAction = targetRole.name === 'super_admin' ? 'super_admin_created' : 'profile_created';
  await writeAuditLog(supabase, user.id, auditAction, {
    new_profile_id: authUser.user.id, email, role: targetRole.name,
  });

  revalidatePath('/emp-dash/people');
  return { success: true };
}

// ── Change an existing profile's role (Admin+ only) ───────────────────────────

export async function changeProfileRoleAction(profileId: string, newRoleId: string) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  // Redundant with the DB-level enforce_profile_role_change trigger, but gives
  // a friendly error instead of a raw Postgres exception.
  if (profileId === user.id) return { error: 'You cannot change your own role.' };

  const actorProfile = await getActorProfile(supabase, user.id);
  const actorRole = actorProfile?.emp_roles?.name;
  if (actorRole !== 'admin' && actorRole !== 'super_admin') {
    return { error: 'Only Admins can change roles' };
  }

  const { data: target } = await supabase
    .from('emp_profiles')
    .select('role_id, emp_roles(name)')
    .eq('id', profileId)
    .single();
  if (!target) return { error: 'Profile not found' };
  const targetCurrentRole = (target as { emp_roles: { name: string } }).emp_roles.name;

  // Admins may never touch an existing Admin's or Super Admin's role — only a Super Admin can.
  if (actorRole === 'admin' && (targetCurrentRole === 'admin' || targetCurrentRole === 'super_admin')) {
    return { error: 'Only a Super Admin can change the role of an existing Admin or Super Admin' };
  }

  const { data: newRole } = await supabase.from('emp_roles').select('name').eq('id', newRoleId).single();
  if (!newRole) return { error: 'Invalid role' };

  if (actorRole === 'admin' && newRole.name !== 'domain_head' && newRole.name !== 'employee') {
    return { error: 'Admins can only assign Domain Head or Employee roles' };
  }

  const { error: updateErr } = await supabase.from('emp_profiles').update({ role_id: newRoleId }).eq('id', profileId);
  if (updateErr) return { error: updateErr.message };

  await writeAuditLog(supabase, user.id, 'role_changed', {
    profile_id: profileId, old_role: targetCurrentRole, new_role: newRole.name,
  });

  revalidatePath('/emp-dash/people');
  return { success: true };
}

// ── Update a profile's position/title (Admin+ only) ───────────────────────────

export async function updateProfilePositionAction(profileId: string, position: string) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const actorProfile = await getActorProfile(supabase, user.id);
  const actorRole = actorProfile?.emp_roles?.name;
  if (actorRole !== 'admin' && actorRole !== 'super_admin') {
    return { error: 'Only Admins can edit a profile' };
  }

  const { error } = await supabase
    .from('emp_profiles')
    .update({ position: position.trim() || null })
    .eq('id', profileId);
  if (error) return { error: error.message };

  revalidatePath('/emp-dash/people');
  return { success: true };
}

// ── Create a domain (Admin+ only) ─────────────────────────────────────────────
// Also creates the domain's channel (so it auto-appears in Messages once
// members join it) and an empty field-template row (custom fields for a new
// domain default to none until an Admin edits the template directly).

export async function createDomainAction(name: string) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const actorProfile = await getActorProfile(supabase, user.id);
  const actorRole = actorProfile?.emp_roles?.name;
  if (actorRole !== 'admin' && actorRole !== 'super_admin') {
    return { error: 'Only Admins can create domains' };
  }

  const trimmedName = name.trim();
  if (!trimmedName) return { error: 'Domain name is required' };

  const slug = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  if (!slug) return { error: 'Domain name must contain at least one letter or number' };

  const admin = createEmpDashAdminClient();

  const { data: domain, error: domainErr } = await admin
    .from('emp_domains')
    .insert({ name: trimmedName, slug })
    .select('id')
    .single();
  if (domainErr || !domain) return { error: domainErr?.message ?? 'Failed to create domain (the name may already be in use)' };

  await admin.from('emp_channels').insert({ domain_id: domain.id, type: 'domain', name: null });
  await admin.from('emp_domain_field_templates').insert({ domain_id: domain.id, schema: [] });

  revalidatePath('/emp-dash/admin');
  revalidatePath('/emp-dash/tasks');
  return { success: true };
}

// ── Create a named group channel (Admin+ or any Domain Head) ─────────────────
// Uses the service-role client after an app-layer permission check — mirrors
// createProfileAction's pattern. Not tied to a single domain, so it can't
// piggyback on is_head_or_above_for_domain(); the check here is simply
// "admin+, or head of at least one domain."

export async function createGroupChannelAction(name: string, memberProfileIds: string[]) {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated' };

  const trimmedName = name.trim();
  if (!trimmedName) return { error: 'Channel name is required' };

  const actorProfile = await getActorProfile(supabase, user.id);
  const actorRole = actorProfile?.emp_roles?.name;
  const isAdminPlus = actorRole === 'admin' || actorRole === 'super_admin';

  if (!isAdminPlus) {
    const { data: headRows } = await supabase
      .from('emp_user_domains')
      .select('domain_id')
      .eq('profile_id', user.id)
      .eq('role_in_domain', 'head')
      .limit(1);
    if (!headRows || headRows.length === 0) {
      return { error: 'Only Admins or Domain Heads can create a channel' };
    }
  }

  const admin = createEmpDashAdminClient();

  const { data: channel, error: channelErr } = await admin
    .from('emp_channels')
    .insert({ type: 'group', name: trimmedName, domain_id: null })
    .select('id')
    .single();
  if (channelErr || !channel) return { error: channelErr?.message ?? 'Failed to create channel' };

  const memberIds = Array.from(new Set([user.id, ...memberProfileIds]));
  const { error: membersErr } = await admin
    .from('emp_channel_members')
    .insert(memberIds.map(profile_id => ({ channel_id: channel.id, profile_id })));
  if (membersErr) return { error: membersErr.message };

  revalidatePath('/emp-dash/messages');
  return { success: true, channel_id: channel.id };
}
