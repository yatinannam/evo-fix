import { createEmpDashServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { AdminClient } from '@/components/emp-dash/admin-client';
import type { EmpProfile, EmpRole, EmpDomain, EmpUserDomain, EmpTaskHistory } from '@/lib/supabase/types';

export default async function AdminPage() {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/emp-dash/login');

  const { data: actorProfile } = await supabase
    .from('emp_profiles')
    .select('*, emp_roles(name)')
    .eq('id', user.id)
    .single();

  if (!actorProfile) redirect('/emp-dash/login');
  const roleName: string = (actorProfile as EmpProfile & { emp_roles: Pick<EmpRole, 'name'> }).emp_roles.name;

  // Only admin+ can access this page
  if (roleName !== 'admin' && roleName !== 'super_admin') redirect('/emp-dash');

  const [
    { data: domainAdminMap },
    { data: domains },
    { data: adminProfiles },
    { data: auditLog },
    { data: userDomains },
  ] = await Promise.all([
    supabase.from('emp_domain_admin_map').select('*, emp_domains(name), emp_profiles!admin_profile_id(full_name, email)'),
    supabase.from('emp_domains').select('*').order('name'),
    supabase.from('emp_profiles').select('id, full_name, email, emp_roles(name)').order('full_name'),
    supabase.from('emp_task_status_history').select('*, emp_profiles!changed_by(full_name), emp_tasks(title, emp_domains(name))').order('created_at', { ascending: false }).limit(50),
    supabase.from('emp_user_domains').select('*, emp_profiles(full_name), emp_domains(name)').order('created_at', { ascending: false }),
  ]);

  return (
    <AdminClient
      domainAdminMap={(domainAdminMap ?? []) as Parameters<typeof AdminClient>[0]['domainAdminMap']}
      domains={(domains ?? []) as EmpDomain[]}
      adminProfiles={(adminProfiles ?? []) as (EmpProfile & { emp_roles: Pick<EmpRole, 'name'> })[]}
      auditLog={(auditLog ?? []) as Parameters<typeof AdminClient>[0]['auditLog']}
      userDomains={(userDomains ?? []) as Parameters<typeof AdminClient>[0]['userDomains']}
      isSuperAdmin={roleName === 'super_admin'}
    />
  );
}
