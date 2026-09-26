// @ts-nocheck
import { createEmpDashServerClient, getCachedUser, getCachedProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { checkOverdueReviewsAction } from '@/app/emp-dash/actions';
import type { EmpTask, EmpProfile, EmpRole, EmpDomain } from '@/lib/supabase/types';

type TaskWithDomain   = EmpTask & { emp_domains: Pick<EmpDomain, 'name' | 'slug'> };
type TaskWithProfile  = EmpTask & { emp_domains: Pick<EmpDomain, 'name' | 'slug'>; emp_profiles: Pick<EmpProfile, 'full_name'> };

const STATUS_META: Record<string, { label: string; dot: string; badge: string; badgeText: string }> = {
  not_started:          { label:'Not Started',  dot:'#9ca3af', badge:'#f9fafb',  badgeText:'#6b7280' },
  in_progress:          { label:'In Progress',  dot:'#3b82f6', badge:'#eff6ff',  badgeText:'#2563eb' },
  submitted_for_review: { label:'In Review',    dot:'#f59e0b', badge:'#fffbeb',  badgeText:'#d97706' },
  completed:            { label:'Completed',    dot:'#10b981', badge:'#ecfdf5',  badgeText:'#059669' },
};
const PRIORITY_DOT: Record<string, string> = {
  urgent:'#ef4444', high:'#f97316', medium:'#f59e0b', low:'#d1d5db',
};

function isOverdue48h(updatedAt: string) {
  return (Date.now() - new Date(updatedAt).getTime()) > 48 * 60 * 60 * 1000;
}
function greeting(name: string) {
  const h = new Date().getHours();
  const tod = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${tod}, ${name.split(' ')[0]}`;
}
function fmt(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

export default async function EmpDashMyDayPage() {
  const user = await getCachedUser();
  if (!user) redirect('/emp-dash/login');

  const profile = await getCachedProfile(user.id);
  if (!profile) redirect('/emp-dash/login');

  const roleName: string = (profile as EmpProfile & { emp_roles: Pick<EmpRole,'name'> }).emp_roles.name;
  const isReviewer = roleName !== 'employee';

  const supabase = await createEmpDashServerClient();

  // myTasks, awaitingReview (if applicable), and recentComments are all
  // independent given user.id/profile — batch them.
  const [
    { data: myTasks, error: myTasksErr },
    awaitingReviewResult,
    { data: recentComments },
  ] = await Promise.all([
    supabase
      .from('emp_tasks')
      .select('*, emp_domains(name, slug), emp_task_assignees!inner(profile_id)')
      .eq('emp_task_assignees.profile_id', user.id)
      .neq('status', 'completed')
      .order('deadline', { ascending: true })
      .limit(10),
    isReviewer
      ? supabase
          .from('emp_tasks')
          .select('*, emp_domains(name, slug), emp_profiles!created_by(full_name)')
          .eq('status', 'submitted_for_review').limit(5)
      : Promise.resolve({ data: null }),
    supabase
      .from('emp_task_comments')
      .select('id, body, created_at, task_id')
      .ilike('body', `%@${profile.full_name.split(' ')[0]}%`)
      .neq('author_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
    // Generates review_overdue notifications for tasks this viewer can
    // verify that have sat in review 48h+ — was previously never called
    // from anywhere. Scoped to the viewer's own domains inside the action,
    // so cheap to run on every My Day load.
    isReviewer ? checkOverdueReviewsAction() : Promise.resolve(null),
  ]);

  const awaitingReview: TaskWithProfile[] = isReviewer ? ((awaitingReviewResult.data ?? []) as TaskWithProfile[]) : [];

  const myTasksList = (myTasks ?? []) as unknown as TaskWithDomain[];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>

      {/* Hero greeting */}
      <div style={{
        borderRadius:'20px', overflow:'hidden', position:'relative',
        background:'linear-gradient(135deg, rgba(249,115,22,0.12) 0%, rgba(244,63,94,0.06) 60%, rgba(167,139,250,0.06) 100%)',
        border:'1px solid rgba(255,255,255,0.8)',
        padding:'32px',
        boxShadow:'0 4px 24px rgba(0,0,0,0.06)',
        backdropFilter:'blur(10px)',
      }}>
        {/* Decorative circle */}
        <div style={{ position:'absolute', top:'-40px', right:'-30px', width:'180px', height:'180px', borderRadius:'50%', background:'radial-gradient(circle, rgba(249,115,22,0.15), transparent 70%)', pointerEvents:'none' }} />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'16px' }}>
          <div>
            <div style={{ fontSize:'28px', fontWeight:800, color:'#111', letterSpacing:'-0.5px', marginBottom:'4px' }}>
              {greeting(profile.full_name)}
            </div>
            <p style={{ fontSize:'15px', color:'#6b7280' }}>
              {myTasksList.length === 0
                ? "You're all caught up! Enjoy the quiet."
                : `You have ${myTasksList.length} active task${myTasksList.length !== 1 ? 's' : ''} today.`}
            </p>
          </div>

          {/* Quick stats */}
          <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
            <Stat n={myTasksList.length}    label="Active"    color="#f97316" />
            {isReviewer && <Stat n={awaitingReview.length} label="Pending Review" color="#f59e0b" />}
            <Stat n={recentComments?.length ?? 0} label="Mentions"  color="#8b5cf6" />
          </div>
        </div>
      </div>

      {/* My Active Tasks */}
      <Section
        title="My Active Tasks"
        icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>}
        action={
          <Link href="/emp-dash/tasks" style={{ display:'inline-flex', alignItems:'center', gap:'2px', fontSize:'13px', color:'#f97316', fontWeight:600, textDecoration:'none' }}>
            View all <ChevronRightIcon />
          </Link>
        }
      >
        {myTasksErr && <ErrorBox>Failed to load tasks. Please refresh.</ErrorBox>}
        {!myTasksErr && myTasksList.length === 0 && (
          <EmptyBox>No active tasks assigned to you.</EmptyBox>
        )}
        {myTasksList.map(task => {
          const overdue = task.status === 'submitted_for_review' && isOverdue48h(task.updated_at);
          const sm = STATUS_META[task.status];
          return (
            <Link key={task.id} href={`/emp-dash/tasks/${task.id}`} style={{ textDecoration:'none' }}>
              <div style={{
                display:'flex', alignItems:'center', gap:'14px',
                background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)',
                borderRadius:'14px', border:'1px solid rgba(255,255,255,0.8)',
                padding:'14px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
                transition:'box-shadow 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; }}
              >
                <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:PRIORITY_DOT[task.priority], flexShrink:0 }} title={task.priority} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'14px', fontWeight:600, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{task.title}</div>
                  <div style={{ fontSize:'12px', color:'#9ca3af', marginTop:'2px' }}>{task.emp_domains.name}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
                  {overdue && (
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', fontSize:'11px', color:'#dc2626', background:'#fff1f2', padding:'2px 8px', borderRadius:'6px', border:'1px solid #fecdd3', fontWeight:600 }}>
                      <WarningIcon />
                      Overdue
                    </span>
                  )}
                  <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'8px', background:sm?.badge, color:sm?.badgeText }}>{sm?.label}</span>
                  <span style={{ fontSize:'12px', color:'#9ca3af', minWidth:'50px', textAlign:'right' }}>{fmt(task.deadline)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </Section>

      {/* Awaiting Review */}
      {isReviewer && awaitingReview.length > 0 && (
        <Section
          title="Awaiting Your Review"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>}
        >
          {awaitingReview.map(task => {
            const stale = isOverdue48h(task.updated_at);
            return (
              <Link key={task.id} href={`/emp-dash/tasks/${task.id}`} style={{ textDecoration:'none' }}>
                <div style={{
                  display:'flex', alignItems:'center', gap:'14px',
                  background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)',
                  borderRadius:'14px', border:'1px solid rgba(245,158,11,0.15)',
                  padding:'14px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
                  transition:'box-shadow 0.15s, transform 0.1s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; }}
                >
                  <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:PRIORITY_DOT[task.priority], flexShrink:0 }} />
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'14px', fontWeight:600, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{task.title}</div>
                    <div style={{ fontSize:'12px', color:'#9ca3af', marginTop:'2px' }}>
                      by {task.emp_profiles?.full_name ?? 'Unknown'} · {task.emp_domains.name}
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                    {stale && (
                      <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', fontSize:'11px', color:'#dc2626', background:'#fff1f2', padding:'2px 8px', borderRadius:'6px', border:'1px solid #fecdd3', fontWeight:600 }}>
                        <WarningIcon />
                        Overdue
                      </span>
                    )}
                    <span style={{ display:'inline-flex', alignItems:'center', gap:'2px', fontSize:'11px', fontWeight:700, color:'#d97706', background:'#fffbeb', padding:'3px 8px 3px 10px', borderRadius:'8px', border:'1px solid rgba(245,158,11,0.2)' }}>
                      Review <ChevronRightIcon size={11} />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </Section>
      )}

      {/* Mentions */}
      {(recentComments ?? []).length > 0 && (
        <Section
          title="Recent Mentions"
          icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
        >
          {(recentComments ?? []).map(comment => (
            <Link key={comment.id} href={`/emp-dash/tasks/${comment.task_id}`} style={{ textDecoration:'none' }}>
              <div style={{
                display:'flex', alignItems:'flex-start', gap:'12px',
                background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)',
                borderRadius:'14px', border:'1px solid rgba(255,255,255,0.8)',
                padding:'14px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
                transition:'box-shadow 0.15s, transform 0.1s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; }}
              >
                <div style={{ width:'28px', height:'28px', borderRadius:'8px', background:'#f5f3ff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:'1px' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                </div>
                <div style={{ minWidth:0 }}>
                  <p style={{ fontSize:'14px', color:'#374151', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{comment.body}</p>
                  <p style={{ fontSize:'11px', color:'#9ca3af', marginTop:'3px' }}>{fmt(comment.created_at)}</p>
                </div>
              </div>
            </Link>
          ))}
        </Section>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function WarningIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
  );
}

function ChevronRightIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18"/></svg>
  );
}

function Stat({ n, label, color }: { n: number; label: string; color: string }) {
  return (
    <div style={{ textAlign:'center', padding:'12px 18px', borderRadius:'14px', background:'rgba(255,255,255,0.6)', backdropFilter:'blur(8px)', border:'1px solid rgba(255,255,255,0.7)', minWidth:'80px' }}>
      <div style={{ fontSize:'26px', fontWeight:800, color, lineHeight:1.1 }}>{n}</div>
      <div style={{ fontSize:'11px', color:'#6b7280', marginTop:'3px', fontWeight:500 }}>{label}</div>
    </div>
  );
}

function Section({ title, icon, action, children }: { title:string; icon:React.ReactNode; action?:React.ReactNode; children:React.ReactNode }) {
  return (
    <section>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
        <h2 style={{ display:'flex', alignItems:'center', gap:'8px', fontSize:'15px', fontWeight:700, color:'#111', margin:0 }}>
          {icon}{title}
        </h2>
        {action}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>{children}</div>
    </section>
  );
}

function EmptyBox({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ borderRadius:'14px', background:'rgba(255,255,255,0.5)', border:'1px solid rgba(0,0,0,0.06)', padding:'32px', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>{children}</div>
  );
}

function ErrorBox({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" style={{ borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', padding:'12px 16px', color:'#dc2626', fontSize:'14px' }}>{children}</div>
  );
}
