import { createEmpDashServerClient, getCachedUser, getCachedProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { PeopleClient } from '@/components/emp-dash/people-client';
import type { EmpProfile, EmpRole, EmpDomain, EmpUserDomain } from '@/lib/supabase/types';

export default async function PeoplePage() {
  const user = await getCachedUser();
  if (!user) redirect('/emp-dash/login');

  const actorProfile = await getCachedProfile(user.id);
  if (!actorProfile) redirect('/emp-dash/login');
  const roleName: string = (actorProfile as EmpProfile & { emp_roles: Pick<EmpRole, 'name'> }).emp_roles.name;
  const isAdminPlus = roleName === 'admin' || roleName === 'super_admin';

  const supabase = await createEmpDashServerClient();

  // profiles, allUserDomains, allRoles, allDomains are all independent — batch them.
  const [
    { data: profiles, error: profilesErr },
    { data: allUserDomains },
    { data: allRoles },
    { data: allDomains },
  ] = await Promise.all([
    supabase.from('emp_profiles').select('*, emp_roles(name)').order('full_name'),
    supabase.from('emp_user_domains').select('*, emp_domains(id, name, slug)'),
    supabase.from('emp_roles').select('*').order('name'),
    supabase.from('emp_domains').select('*').order('name'),
  ]);

  if (profilesErr) {
    return (
      <div role="alert" style={{ padding:'12px 16px', borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>
        Failed to load people: {profilesErr.message}
      </div>
    );
  }

  return (
    <PeopleClient
      profiles={(profiles ?? []) as (EmpProfile & { emp_roles: Pick<EmpRole, 'name'> })[]}
      allUserDomains={(allUserDomains ?? []) as (EmpUserDomain & { emp_domains: Pick<EmpDomain, 'id' | 'name' | 'slug'> })[]}
      allRoles={(allRoles ?? []) as EmpRole[]}
      allDomains={(allDomains ?? []) as EmpDomain[]}
      isAdminPlus={isAdminPlus}
      isSuperAdmin={roleName === 'super_admin'}
      currentUserId={user.id}
    />
  );
}
