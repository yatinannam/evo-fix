// @ts-nocheck
import { createEmpDashServerClient } from '@/lib/supabase/server';
import { redirect, notFound } from 'next/navigation';
import { TaskStatusPanel } from '@/components/emp-dash/task-status-panel';
import { TaskThread } from '@/components/emp-dash/task-thread';
import { DomainFieldRenderer } from '@/components/emp-dash/domain-field-renderer';
import { FileUploader } from '@/components/emp-dash/file-uploader';
import type { EmpProfile, EmpRole, EmpTaskHistory, EmpDomain, EmpTaskMilestone, EmpFile, FieldDef } from '@/lib/supabase/types';

interface PageProps { params: Promise<{ id: string }> }

const PRIORITY_META: Record<string, { color: string; bg: string; border: string }> = {
  urgent: { color:'#dc2626', bg:'#fff1f2', border:'#fecdd3' },
  high:   { color:'#ea580c', bg:'#fff7ed', border:'#fed7aa' },
  medium: { color:'#d97706', bg:'#fffbeb', border:'#fde68a' },
  low:    { color:'#6b7280', bg:'#f9fafb', border:'#e5e7eb' },
};

const STATUS_LABEL: Record<string, string> = {
  draft: 'Draft',
  not_started: 'Not started', in_progress: 'In progress',
  submitted_for_review: 'Submitted for Review', completed: 'Completed',
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function formatDuration(isoStart: string) {
  const mins = Math.floor((Date.now() - new Date(isoStart).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ${mins % 60}m`;
  return `${Math.floor(hours / 24)}d ${hours % 24}h`;
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/emp-dash/login');

  const { data: profile } = await supabase.from('emp_profiles').select('*, emp_roles(name)').eq('id', user.id).single();
  if (!profile) redirect('/emp-dash/login');
  const roleName: string = (profile as EmpProfile & { emp_roles: Pick<EmpRole, 'name'> }).emp_roles.name;
  const isAdminPlus = roleName === 'admin' || roleName === 'super_admin';

  const { data: task, error: taskErr } = await supabase
    .from('emp_tasks')
    .select(`*, emp_domains(id, name, slug), emp_task_assignees(profile_id, emp_profiles:profile_id(id, full_name)), emp_profiles!created_by(full_name)`)
    .eq('id', id)
    .single();

  if (taskErr || !task) notFound();

  const taskDomainId = task.domain_id;
  const assignees = ((task as { emp_task_assignees?: { emp_profiles: { id: string; full_name: string } }[] }).emp_task_assignees ?? []).map(a => a.emp_profiles);
  const creatorName = (task as { emp_profiles?: { full_name: string } }).emp_profiles?.full_name ?? 'Unknown';
  const domainName = (task.emp_domains as unknown as EmpDomain).name;
  const isAssignee = assignees.some(a => a.id === user.id);

  const { data: ud } = await supabase
    .from('emp_user_domains')
    .select('role_in_domain')
    .eq('profile_id', user.id)
    .eq('domain_id', taskDomainId)
    .single();
  const isDomainHead = ud?.role_in_domain === 'head';
  const canVerify = isAdminPlus || isDomainHead;
  const isReviewer = task.reviewing_by === user.id;

  let reviewerName: string | null = null;
  if (task.reviewing_by && task.reviewing_by !== user.id) {
    const { data: reviewer } = await supabase.from('emp_profiles').select('full_name').eq('id', task.reviewing_by).single();
    reviewerName = reviewer?.full_name ?? null;
  }

  const { data: history } = await supabase
    .from('emp_task_status_history')
    .select('*, emp_profiles!changed_by(full_name)')
    .eq('task_id', id)
    .order('created_at', { ascending: true });

  const { data: comments } = await supabase
    .from('emp_task_comments')
    .select('*, emp_profiles!author_id(full_name)')
    .eq('task_id', id)
    .order('created_at', { ascending: true });

  const { data: milestones } = await supabase
    .from('emp_task_milestones')
    .select('*')
    .eq('task_id', id)
    .order('sort_order', { ascending: true });

  const { data: files } = await supabase
    .from('emp_files')
    .select('*')
    .eq('task_id', id)
    .order('created_at', { ascending: false });

  const { data: template } = await supabase
    .from('emp_domain_field_templates')
    .select('schema')
    .eq('domain_id', taskDomainId)
    .single();

  const domainFields: FieldDef[] = Array.isArray(template?.schema) ? (template.schema as FieldDef[]) : [];
  const customFieldsData = (task.custom_fields ?? {}) as Record<string, unknown>;

  const isOverdue48h = task.status === 'submitted_for_review' &&
    (Date.now() - new Date(task.updated_at).getTime()) > 48 * 60 * 60 * 1000;

  const reviewAge = task.reviewing_since ? formatDuration(task.reviewing_since) : null;
  const lockIsStale = task.reviewing_since
    ? (Date.now() - new Date(task.reviewing_since).getTime()) > 2 * 60 * 60 * 1000
    : false;

  const pm = PRIORITY_META[task.priority] ?? PRIORITY_META.low;

  return (
    <div style={{ maxWidth:'900px', display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Header */}
      <div>
        <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px', flexWrap:'wrap' }}>
          <span style={{
            fontSize:'11px', padding:'4px 10px', borderRadius:'20px', fontWeight:600,
            color:pm.color, background:pm.bg, border:`1px solid ${pm.border}`,
            display:'inline-flex', alignItems:'center', gap:'4px',
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            {task.priority}
          </span>
          <span style={{ fontSize:'12px', color:'#9ca3af' }}>{domainName}</span>
          {task.status === 'draft' && (
            <span style={{ fontSize:'11px', padding:'4px 10px', borderRadius:'20px', fontWeight:600, color:'#6b7280', background:'#f3f4f6', border:'1px solid #e5e7eb' }}>
              Draft
            </span>
          )}
          {isOverdue48h && (
            <span style={{
              fontSize:'11px', padding:'4px 10px', borderRadius:'20px', fontWeight:600,
              color:'#dc2626', background:'#fff1f2', border:'1px solid #fecdd3',
              display:'inline-flex', alignItems:'center', gap:'4px',
            }}>
              ⚠ Awaiting review 48h+
            </span>
          )}
        </div>
        <h1 style={{ fontSize:'24px', fontWeight:700, color:'#111', letterSpacing:'-0.3px', lineHeight:1.3, margin:0 }}>{task.title}</h1>
        {task.description && <p style={{ color:'#6b7280', marginTop:'8px', fontSize:'14px', lineHeight:1.6 }}>{task.description}</p>}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'16px', marginTop:'12px', fontSize:'12px', color:'#9ca3af' }}>
          <span style={{ display:'flex', alignItems:'center', gap:'4px' }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            Due: {formatDate(task.deadline)}
          </span>
          <span>Created by {creatorName}</span>
          <span>{formatDate(task.created_at)}</span>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'24px' }}>
        {/* Left — details */}
        <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
          {/* Assignees */}
          <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize:'13px', fontWeight:700, color:'#374151', margin:'0 0 12px' }}>Assignees</h3>
            {assignees.length === 0 ? (
              <p style={{ fontSize:'13px', color:'#9ca3af', margin:0 }}>Unassigned</p>
            ) : (
              <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                {assignees.map(a => (
                  <div key={a.id} style={{
                    display:'flex', alignItems:'center', gap:'8px',
                    padding:'6px 12px', borderRadius:'20px',
                    background:'rgba(249,115,22,0.06)', border:'1px solid rgba(249,115,22,0.12)',
                    fontSize:'13px', color:'#9a3412',
                  }}>
                    <div style={{
                      width:'22px', height:'22px', borderRadius:'50%',
                      background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
                      display:'flex', alignItems:'center', justifyContent:'center',
                      fontSize:'10px', fontWeight:700, color:'#f97316',
                    }}>{a.full_name[0]}</div>
                    {a.full_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Milestones */}
          {(milestones ?? []).length > 0 && (
            <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'16px' }}>
                <h3 style={{ fontSize:'13px', fontWeight:700, color:'#374151', margin:0 }}>Milestones</h3>
                <span style={{ fontSize:'11px', color:'#9ca3af' }}>
                  {(milestones ?? []).filter(m => m.done).length}/{(milestones ?? []).length} done
                </span>
              </div>
              {/* Progress bar */}
              <div style={{ height:'4px', borderRadius:'2px', background:'rgba(0,0,0,0.08)', marginBottom:'16px', overflow:'hidden' }}>
                <div style={{
                  height:'100%', borderRadius:'2px',
                  background:'linear-gradient(90deg,#f97316,#f43f5e)',
                  width:`${(milestones ?? []).length > 0 ? Math.round((milestones ?? []).filter(m => m.done).length / (milestones ?? []).length * 100) : 0}%`,
                  transition:'width 0.4s',
                }} />
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {(milestones ?? []).map((m: EmpTaskMilestone) => (
                  <div key={m.id} style={{
                    display:'flex', alignItems:'center', gap:'10px',
                    padding:'10px 14px', borderRadius:'12px',
                    background: m.done ? 'rgba(16,185,129,0.04)' : 'rgba(249,115,22,0.03)',
                    border: `1px solid ${m.done ? 'rgba(16,185,129,0.15)' : 'rgba(249,115,22,0.1)'}`,
                  }}>
                    <div style={{
                      width:'18px', height:'18px', borderRadius:'50%', flexShrink:0,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      background: m.done ? '#10b981' : 'rgba(249,115,22,0.1)',
                      border: m.done ? 'none' : '1.5px solid rgba(249,115,22,0.3)',
                    }}>
                      {m.done && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>
                      )}
                    </div>
                    <span style={{
                      flex:1, fontSize:'13px', fontWeight:500,
                      color: m.done ? '#6b7280' : '#374151',
                      textDecoration: m.done ? 'line-through' : 'none',
                    }}>{m.title}</span>
                    {m.due_date && (
                      <span style={{ fontSize:'11px', color: m.done ? '#9ca3af' : '#d97706', flexShrink:0 }}>
                        {new Date(m.due_date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags + Links */}
          {(task.tags.length > 0 || (task.links as { label: string; url: string }[]).length > 0) && (
            <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)', display:'flex', flexDirection:'column', gap:'12px' }}>
              {task.tags.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {task.tags.map(tag => (
                    <span key={tag} style={{
                      fontSize:'11px', padding:'4px 10px', borderRadius:'20px',
                      background:'#f9fafb', border:'1px solid #e5e7eb', color:'#4b5563',
                    }}>#{tag}</span>
                  ))}
                </div>
              )}
              {(task.links as { label: string; url: string }[]).map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display:'flex', alignItems:'center', gap:'6px', fontSize:'13px', color:'#f97316', textDecoration:'none', fontWeight:500 }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                  {link.label || link.url}
                </a>
              ))}
            </div>
          )}

          {/* Files */}
          <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize:'13px', fontWeight:700, color:'#374151', margin:'0 0 16px' }}>Files</h3>
            <FileUploader
              domainId={taskDomainId}
              taskId={id}
              existingFiles={(files ?? []) as EmpFile[]}
            />
          </div>

          {/* Domain-specific fields */}
          {domainFields.length > 0 && (
            <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
              <DomainFieldRenderer fields={domainFields} value={customFieldsData} onChange={() => {}} readonly />
            </div>
          )}

          {/* Thread */}
          <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <TaskThread
              taskId={id}
              initialComments={(comments ?? []) as Parameters<typeof TaskThread>[0]['initialComments']}
              currentUserId={user.id}
              currentUserName={profile.full_name}
            />
          </div>
        </div>

        {/* Right — status panel + review lock info + history */}
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <TaskStatusPanel
            taskId={id}
            currentStatus={task.status}
            isAssignee={isAssignee}
            canVerify={canVerify}
            reviewerName={reviewerName}
            currentUserId={user.id}
            reviewingBy={task.reviewing_by}
            isReviewer={isReviewer}
            lockIsStale={lockIsStale}
          />

          {/* Review lock info */}
          {task.reviewing_by && (
            <div style={{
              background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)',
              borderRadius:'16px', border: lockIsStale ? '1px solid #fecdd3' : '1px solid rgba(249,115,22,0.15)',
              padding:'14px 16px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
            }}>
              <div style={{ fontSize:'11px', fontWeight:700, color: lockIsStale ? '#dc2626' : '#d97706', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:'6px' }}>
                {lockIsStale ? '⚠ Stale Review Lock' : '🔒 Under Review'}
              </div>
              <p style={{ fontSize:'12px', color:'#6b7280', margin:0, lineHeight:1.5 }}>
                {isReviewer ? 'You are reviewing this task.' : `${reviewerName ?? 'A domain head'} is reviewing.`}
                {reviewAge && <span style={{ color: lockIsStale ? '#dc2626' : '#9ca3af' }}> ({reviewAge})</span>}
              </p>
              {lockIsStale && (
                <p style={{ fontSize:'11px', color:'#dc2626', margin:'4px 0 0' }}>Lock exceeded 2 hours — can be claimed by any eligible reviewer.</p>
              )}
            </div>
          )}

          {/* Status history */}
          <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize:'10px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 12px' }}>Activity</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {(history ?? []).length === 0 && (
                <p style={{ fontSize:'12px', color:'#9ca3af', margin:0 }}>No status changes yet.</p>
              )}
              {(history ?? []).map(h => {
                const histWithProfile = h as EmpTaskHistory & { emp_profiles: { full_name: string } };
                return (
                  <div key={h.id} style={{ paddingLeft:'14px', position:'relative' }}>
                    <div style={{ position:'absolute', left:0, top:'6px', width:'6px', height:'6px', borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#f43f5e)' }} />
                    <div style={{ fontSize:'12px', color:'#4b5563' }}>
                      <span style={{ fontWeight:600, color:'#111' }}>{histWithProfile.emp_profiles?.full_name}</span>{' '}changed status
                      {h.from_status && <> from <span style={{ fontStyle:'italic' }}>{STATUS_LABEL[h.from_status]}</span></>}
                      {' '}to <span style={{ fontWeight:600, color:'#f97316' }}>{STATUS_LABEL[h.to_status]}</span>
                    </div>
                    {h.comment && <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'2px', fontStyle:'italic' }}>&ldquo;{h.comment}&rdquo;</div>}
                    <div style={{ fontSize:'10px', color:'#9ca3af', marginTop:'2px' }}>{formatDate(h.created_at)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
