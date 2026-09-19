import { createEmpDashServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PeopleClient } from '@/components/emp-dash/people-client';
import type { EmpProfile, EmpRole, EmpDomain, EmpUserDomain } from '@/lib/supabase/types';

export default async function PeoplePage() {
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
  const isAdminPlus = roleName === 'admin' || roleName === 'super_admin';

  const { data: profiles, error: profilesErr } = await supabase
    .from('emp_profiles')
    .select('*, emp_roles(name)')
    .order('full_name');

  if (profilesErr) {
    return (
      <div role="alert" style={{ padding:'12px 16px', borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>
        Failed to load people: {profilesErr.message}
      </div>
    );
  }

  const { data: allUserDomains } = await supabase
    .from('emp_user_domains')
    .select('*, emp_domains(id, name, slug)');

  const { data: allRoles } = await supabase.from('emp_roles').select('*').order('name');
  const { data: allDomains } = await supabase.from('emp_domains').select('*').order('name');

  return (
    <PeopleClient
      profiles={(profiles ?? []) as (EmpProfile & { emp_roles: Pick<EmpRole, 'name'> })[]}
      allUserDomains={(allUserDomains ?? []) as (EmpUserDomain & { emp_domains: Pick<EmpDomain, 'id' | 'name' | 'slug'> })[]}
      allRoles={(allRoles ?? []) as EmpRole[]}
      allDomains={(allDomains ?? []) as EmpDomain[]}
      isAdminPlus={isAdminPlus}
      isSuperAdmin={roleName === 'super_admin'}
    />
  );
}
