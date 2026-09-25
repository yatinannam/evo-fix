import { createEmpDashServerClient, getCachedUser, getCachedProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminClient } from '@/components/emp-dash/admin-client';
import type { EmpProfile, EmpRole, EmpDomain } from '@/lib/supabase/types';

export default async function AdminPage() {
  const user = await getCachedUser();
  if (!user) redirect('/emp-dash/login');

  const actorProfile = await getCachedProfile(user.id);
  if (!actorProfile) redirect('/emp-dash/login');
  const roleName: string = (actorProfile as EmpProfile & { emp_roles: Pick<EmpRole, 'name'> }).emp_roles.name;

  // Only admin+ can access this page
  if (roleName !== 'admin' && roleName !== 'super_admin') redirect('/emp-dash');

  const supabase = await createEmpDashServerClient();

  const [
    { data: domainAdminMap, error: domainAdminMapErr },
    { data: domains, error: domainsErr },
    { data: adminProfiles, error: adminProfilesErr },
    { data: statusHistory, error: statusHistoryErr },
    { data: userDomains, error: userDomainsErr },
    { data: auditLogEntries, error: auditLogErr },
  ] = await Promise.all([
    supabase.from('emp_domain_admin_map').select('*, emp_domains(name), emp_profiles!admin_profile_id(full_name, email)'),
    supabase.from('emp_domains').select('*').order('name'),
    supabase.from('emp_profiles').select('id, full_name, email, emp_roles(name)').order('full_name'),
    supabase.from('emp_task_status_history').select('*, emp_profiles!changed_by(full_name), emp_tasks(title, emp_domains(name))').order('created_at', { ascending: false }).limit(50),
    supabase.from('emp_user_domains').select('*, emp_profiles(full_name), emp_domains(name)').order('created_at', { ascending: false }),
    // The real audit log — profile creation, role changes, domain reassignment,
    // super-admin creation. RLS (audit_log_read) already scopes this: admins
    // never see super_admin_created rows, super admins see everything.
    supabase.from('emp_audit_log').select('*, emp_profiles!actor_id(full_name)').order('created_at', { ascending: false }).limit(50),
  ]);

  const loadErr = domainAdminMapErr || domainsErr || adminProfilesErr || statusHistoryErr || userDomainsErr || auditLogErr;
  if (loadErr) {
    return (
      <div role="alert" style={{ padding:'12px 16px', borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>
        Failed to load admin data: {loadErr.message}
      </div>
    );
  }

  return (
    <AdminClient
      domainAdminMap={(domainAdminMap ?? []) as Parameters<typeof AdminClient>[0]['domainAdminMap']}
      domains={(domains ?? []) as EmpDomain[]}
      adminProfiles={(adminProfiles ?? []) as (EmpProfile & { emp_roles: Pick<EmpRole, 'name'> })[]}
      statusHistory={(statusHistory ?? []) as Parameters<typeof AdminClient>[0]['statusHistory']}
      userDomains={(userDomains ?? []) as Parameters<typeof AdminClient>[0]['userDomains']}
      auditLogEntries={(auditLogEntries ?? []) as Parameters<typeof AdminClient>[0]['auditLogEntries']}
      isSuperAdmin={roleName === 'super_admin'}
    />
  );
}
