// @ts-nocheck
import { createEmpDashServerClient, getCachedUser, getCachedProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TaskBoard } from '@/components/emp-dash/task-board';
import { NewTaskButton } from '@/components/emp-dash/new-task-button';
import type { EmpProfile, EmpRole, EmpDomain, EmpUserDomain, FieldDef } from '@/lib/supabase/types';

interface PageProps {
  searchParams: Promise<{ domain?: string; view?: string; assignee?: string }>;
}

export default async function TasksPage({ searchParams }: PageProps) {
  const { domain: domainFilter, view } = await searchParams;

  const user = await getCachedUser();
  if (!user) redirect('/emp-dash/login');

  const profile = await getCachedProfile(user.id);
  if (!profile) redirect('/emp-dash/login');

  const roleName: string = (profile as EmpProfile & { emp_roles: Pick<EmpRole, 'name'> }).emp_roles.name;
  const isAdminPlus = roleName === 'admin' || roleName === 'super_admin';

  const supabase = await createEmpDashServerClient();

  // Fixed: Use explicit FK hint to avoid "more than one relationship" error
  let taskQuery = supabase
    .from('emp_tasks')
    .select(`
      *,
      emp_domains(name, slug),
      emp_task_assignees(profile_id, emp_profiles:profile_id(id, full_name))
    `)
    .order('created_at', { ascending: false });

  if (domainFilter) taskQuery = taskQuery.eq('domain_id', domainFilter);

  // None of these five queries depend on any other's result — batch them.
  const [
    { data: userDomains },
    { data: allDomains },
    { data: allProfiles },
    { data: rawTasks, error: tasksErr },
    { data: templates },
  ] = await Promise.all([
    supabase.from('emp_user_domains').select('domain_id, role_in_domain, emp_domains(id, name, slug)').eq('profile_id', user.id),
    supabase.from('emp_domains').select('*').order('name'),
    supabase.from('emp_profiles').select('id, full_name').order('full_name'),
    taskQuery,
    supabase.from('emp_domain_field_templates').select('domain_id, schema'),
  ]);

  const headDomainIds = (userDomains ?? []).filter(ud => ud.role_in_domain === 'head').map(ud => ud.domain_id);

  const domainFieldMap: Record<string, FieldDef[]> = {};
  for (const t of templates ?? []) {
    domainFieldMap[t.domain_id] = Array.isArray(t.schema) ? (t.schema as FieldDef[]) : [];
  }

  const tasks = (rawTasks ?? []).map(t => ({
    ...t,
    assignees: ((t as { emp_task_assignees?: { emp_profiles: { id: string; full_name: string } }[] }).emp_task_assignees ?? []).map(a => a.emp_profiles),
  }));

  // Social Media tasks default to calendar view; every other domain defaults
  // to kanban. An explicit ?view= param (from the view-toggle buttons) always
  // wins over the domain-based default.
  const selectedDomainSlug = domainFilter ? (allDomains ?? []).find(d => d.id === domainFilter)?.slug : undefined;
  const defaultView: 'kanban' | 'list' | 'calendar' = selectedDomainSlug === 'social_media' ? 'calendar' : 'kanban';
  const viewMode = (view === 'list' || view === 'calendar' || view === 'kanban') ? view as 'kanban' | 'list' | 'calendar' : defaultView;
  const canCreateTask = isAdminPlus || (userDomains ?? []).some(ud => ud.role_in_domain === 'head');

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:700, color:'#111', letterSpacing:'-0.3px', margin:0 }}>Tasks</h1>
          <p style={{ fontSize:'14px', color:'#9ca3af', marginTop:'4px' }}>Manage and track work across your domains</p>
        </div>
        {canCreateTask && (
          <NewTaskButton
            domains={allDomains ?? []}
            profiles={(allProfiles ?? []) as Pick<EmpProfile, 'id' | 'full_name'>[]}
            domainFieldMap={domainFieldMap}
          />
        )}
      </div>

      {/* Filters + View toggle */}
      <div style={{ display:'flex', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <a href="/emp-dash/tasks" style={{
            fontSize:'12px', padding:'6px 14px', borderRadius:'20px', fontWeight:600,
            textDecoration:'none', transition:'all 0.15s',
            background: !domainFilter ? 'linear-gradient(135deg,#f97316,#f43f5e)' : 'rgba(255,255,255,0.6)',
            color: !domainFilter ? 'white' : '#6b7280',
            border: !domainFilter ? 'none' : '1px solid rgba(0,0,0,0.08)',
            boxShadow: !domainFilter ? '0 2px 8px rgba(249,115,22,0.3)' : 'none',
          }}>All</a>
          {(allDomains ?? []).map(d => (
            <a key={d.id} href={`/emp-dash/tasks?domain=${d.id}`}
              style={{
                fontSize:'12px', padding:'6px 14px', borderRadius:'20px', fontWeight:600,
                textDecoration:'none', transition:'all 0.15s',
                background: domainFilter === d.id ? 'linear-gradient(135deg,#f97316,#f43f5e)' : 'rgba(255,255,255,0.6)',
                color: domainFilter === d.id ? 'white' : '#6b7280',
                border: domainFilter === d.id ? 'none' : '1px solid rgba(0,0,0,0.08)',
                boxShadow: domainFilter === d.id ? '0 2px 8px rgba(249,115,22,0.3)' : 'none',
              }}>
              {d.name}
            </a>
          ))}
        </div>

        <div style={{ marginLeft:'auto', display:'flex', gap:'4px', background:'rgba(255,255,255,0.6)', border:'1px solid rgba(0,0,0,0.08)', borderRadius:'12px', padding:'4px' }}>
          {(['kanban', 'list', 'calendar'] as const).map(v => (
            <a key={v} href={`/emp-dash/tasks?${domainFilter ? `domain=${domainFilter}&` : ''}view=${v}`}
              style={{
                fontSize:'12px', padding:'6px 14px', borderRadius:'8px', fontWeight:600,
                textDecoration:'none', textTransform:'capitalize', transition:'all 0.15s',
                background: viewMode === v ? 'white' : 'transparent',
                color: viewMode === v ? '#111' : '#9ca3af',
                boxShadow: viewMode === v ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              }}>
              {v}
            </a>
          ))}
        </div>
      </div>

      {/* Error */}
      {tasksErr && (
        <div role="alert" style={{ padding:'12px 16px', borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>
          Failed to load tasks: {tasksErr.message}
        </div>
      )}

      {/* Empty */}
      {!tasksErr && tasks.length === 0 && (
        <div style={{ textAlign:'center', padding:'64px 0', color:'#9ca3af', fontSize:'14px' }}>
          {canCreateTask ? 'No tasks yet. Create the first one!' : 'No tasks assigned to your domains yet.'}
        </div>
      )}

      {/* Board */}
      {tasks.length > 0 && (
        <TaskBoard
          tasks={tasks as Parameters<typeof TaskBoard>[0]['tasks']}
          viewMode={viewMode}
          currentUserId={user.id}
          isAdminPlus={isAdminPlus}
          headDomainIds={headDomainIds}
        />
      )}
    </div>
  );
}
