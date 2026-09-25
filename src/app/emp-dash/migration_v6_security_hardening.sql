-- =============================================================================
-- emp-dash migration v6 — security hardening (round 2)
-- Run after migration_v5_profile_and_channels.sql has committed.
-- Idempotent (DROP POLICY/TRIGGER IF EXISTS + recreate, CREATE OR REPLACE).
-- =============================================================================

-- ── 1. emp_files had no DELETE/UPDATE RLS policy at all ────────────────────
-- deleteFileAction deletes the storage object successfully, then its
-- emp_files row delete silently matches 0 rows under RLS (no error) — the
-- storage bytes are gone but the metadata row survives forever, pointing at
-- nothing. Mirrors the same owner-or-admin rule already enforced in the
-- server action's own pre-check.

CREATE POLICY "files_delete" ON emp_files
  FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR is_admin_or_above());

CREATE POLICY "files_update" ON emp_files
  FOR UPDATE TO authenticated
  USING (uploaded_by = auth.uid() OR is_admin_or_above());

-- ── 2. channels_read leaked every group channel's name/existence ───────────
-- The old "domain_id is null" clause was written when only DMs had a null
-- domain_id, with message content separately protected by messages_read.
-- migration_v5 added the 'group' channel type, which also has domain_id
-- null — any authenticated user could read every group channel's row
-- (including its name) whether or not they're a member. Fix: domain_id-null
-- rows (DM or group) now require actual channel membership.

DROP POLICY IF EXISTS "channels_read" ON emp_channels;
CREATE POLICY "channels_read" ON emp_channels
  FOR SELECT TO authenticated
  USING (
    get_my_role_name() = 'super_admin'
    OR (domain_id IS NOT NULL AND is_domain_member(domain_id))
    OR EXISTS (
      SELECT 1 FROM emp_channel_members
      WHERE channel_id = emp_channels.id AND profile_id = auth.uid()
    )
  );

-- ── 3. emp_task_status_history was still client-writable ───────────────────
-- enforce_task_status_transition() (migration_v4) is meant to be the sole
-- writer, but the original permissive INSERT policy was never revoked — any
-- authenticated user could forge a fake status-change/approval entry for
-- any task. The trigger runs SECURITY DEFINER, which bypasses RLS, so this
-- is safe to lock down entirely (same pattern already used for
-- emp_notifications' insert policy in migration_v4).

DROP POLICY IF EXISTS "task_history_insert" ON emp_task_status_history;
CREATE POLICY "task_history_insert_deny_client" ON emp_task_status_history
  FOR INSERT TO authenticated
  WITH CHECK (false);

-- ── 4. Review-claim lock was never actually enforced ────────────────────────
-- Only the UI's "Claim Review" button was gated by lock state; Approve/
-- Reject rendered regardless of who (if anyone) held the claim, and neither
-- RLS nor the trigger ever compared reviewing_by to the acting user. A
-- second Domain Head could approve/reject a task another head had already
-- claimed. Extend the trigger: a non-admin head may only complete/return a
-- task if no one else currently holds a live (non-stale, <2h) claim on it —
-- matching claimTaskReviewAction's own staleness threshold. Admins can
-- always override, consistent with their existing full-override authority.

CREATE OR REPLACE FUNCTION enforce_task_status_transition()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_uid         uuid := auth.uid();
  v_old         task_status := OLD.status;
  v_new         task_status := NEW.status;
  v_is_admin    boolean;
  v_is_head     boolean;
  v_is_assignee boolean;
  v_is_creator  boolean;
  v_domain_slug text;
  v_required    text[] := ARRAY['Tests written','Peer reviewed','No linter errors'];
  v_checked     text[];
BEGIN
  IF v_old = v_new THEN RETURN NEW; END IF;

  v_is_admin    := is_admin_or_above();
  v_is_head     := is_head_or_above_for_domain(NEW.domain_id);
  v_is_assignee := is_task_assignee(NEW.id);
  v_is_creator  := (NEW.created_by = v_uid);

  IF v_old = 'draft' AND v_new = 'not_started' THEN
    IF NOT (v_is_creator OR v_is_admin) THEN
      RAISE EXCEPTION 'Only the task creator or an admin can publish a draft task.';
    END IF;

  ELSIF v_old = 'not_started' AND v_new = 'in_progress' THEN
    IF NOT (v_is_assignee OR v_is_head) THEN
      RAISE EXCEPTION 'Only an assignee or domain head can start this task.';
    END IF;

  ELSIF v_old = 'in_progress' AND v_new = 'submitted_for_review' THEN
    IF NOT v_is_assignee THEN
      RAISE EXCEPTION 'Only an assignee can submit a task for review.';
    END IF;

    SELECT slug INTO v_domain_slug FROM emp_domains WHERE id = NEW.domain_id;
    IF v_domain_slug = 'backend_dev' THEN
      SELECT array_agg(value) INTO v_checked
      FROM jsonb_array_elements_text(coalesce(NEW.custom_fields->'pre_submit_checklist', '[]'::jsonb));
      IF NOT (v_required <@ coalesce(v_checked, ARRAY[]::text[])) THEN
        RAISE EXCEPTION 'Complete the pre-submit checklist (%) before submitting for review.', array_to_string(v_required, ', ');
      END IF;
    END IF;

  ELSIF v_old = 'submitted_for_review' AND v_new = 'completed' THEN
    IF NOT v_is_head THEN
      RAISE EXCEPTION 'Only a domain head or admin can approve and complete a task.';
    END IF;
    IF NOT v_is_admin AND OLD.reviewing_by IS NOT NULL AND OLD.reviewing_by <> v_uid
       AND OLD.reviewing_since IS NOT NULL AND (now() - OLD.reviewing_since) < interval '2 hours'
    THEN
      RAISE EXCEPTION 'This task is currently under review by another domain head.';
    END IF;

  ELSIF v_old = 'submitted_for_review' AND v_new = 'in_progress' THEN
    IF NOT v_is_head THEN
      RAISE EXCEPTION 'Only a domain head or admin can return a task for changes.';
    END IF;
    IF NOT v_is_admin AND OLD.reviewing_by IS NOT NULL AND OLD.reviewing_by <> v_uid
       AND OLD.reviewing_since IS NOT NULL AND (now() - OLD.reviewing_since) < interval '2 hours'
    THEN
      RAISE EXCEPTION 'This task is currently under review by another domain head.';
    END IF;
    IF NEW.status_change_comment IS NULL OR btrim(NEW.status_change_comment) = '' THEN
      RAISE EXCEPTION 'A comment explaining the required changes is mandatory when returning a task.';
    END IF;

  ELSE
    RAISE EXCEPTION 'Invalid status transition: % → %', v_old::text, v_new::text;
  END IF;

  INSERT INTO emp_task_status_history (task_id, changed_by, from_status, to_status, comment)
  VALUES (NEW.id, v_uid, v_old, v_new, NEW.status_change_comment);
  NEW.status_change_comment := NULL;

  RETURN NEW;
END;
$$;

-- ── 5. tasks_update RLS had no column scoping ───────────────────────────────
-- A plain assignee (not head/admin) could target their task's row (RLS's
-- USING clause already allows it) and rewrite ANY column directly — domain,
-- priority, deadline, custom_fields, title, description, or even forcibly
-- null another head's reviewing_by/reviewing_since — none of which requires
-- touching `status`, so enforce_task_status_transition (BEFORE UPDATE OF
-- status only) never runs and never blocks it. No legitimate app flow
-- today lets an assignee edit those fields post-creation, so this trigger
-- simply denies any such change for non-head/non-admin actors, and denies
-- a non-head/non-admin from ever setting reviewing_by to a real value
-- (they may only ever leave it unchanged or null it, matching what
-- updateTaskStatusAction's own status-transition side effects already do).

CREATE OR REPLACE FUNCTION enforce_task_update_columns()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF is_admin_or_above() OR is_head_or_above_for_domain(OLD.domain_id) THEN
    RETURN NEW;
  END IF;

  IF NEW.domain_id IS DISTINCT FROM OLD.domain_id
     OR NEW.priority IS DISTINCT FROM OLD.priority
     OR NEW.deadline IS DISTINCT FROM OLD.deadline
     OR NEW.title IS DISTINCT FROM OLD.title
     OR NEW.description IS DISTINCT FROM OLD.description
     OR NEW.tags IS DISTINCT FROM OLD.tags
     OR NEW.links IS DISTINCT FROM OLD.links
     OR NEW.custom_fields IS DISTINCT FROM OLD.custom_fields
     OR NEW.created_by IS DISTINCT FROM OLD.created_by
  THEN
    RAISE EXCEPTION 'Only a domain head or admin can edit task details.';
  END IF;

  IF NEW.reviewing_by IS NOT NULL AND NEW.reviewing_by IS DISTINCT FROM OLD.reviewing_by THEN
    RAISE EXCEPTION 'Only a domain head or admin can claim a task for review.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS task_update_column_scope_check ON emp_tasks;
CREATE TRIGGER task_update_column_scope_check
  BEFORE UPDATE ON emp_tasks
  FOR EACH ROW EXECUTE FUNCTION enforce_task_update_columns();

-- ── 6. emp_audit_log had no action values for domain/channel creation ──────
-- createDomainAction and createGroupChannelAction (this session's newest
-- Admin/Domain-Head-gated mutations) never wrote an audit entry, and the
-- CHECK constraint didn't even have a value for either action yet.

ALTER TABLE emp_audit_log DROP CONSTRAINT IF EXISTS emp_audit_log_action_check;
ALTER TABLE emp_audit_log ADD CONSTRAINT emp_audit_log_action_check CHECK (action IN (
  'profile_created','role_changed','super_admin_created',
  'domain_reassigned','task_created','status_changed',
  'domain_created','channel_created'
));

-- ── Done ─────────────────────────────────────────────────────────────────────
-- Run this file in the Supabase SQL editor for the emp-dash project.
