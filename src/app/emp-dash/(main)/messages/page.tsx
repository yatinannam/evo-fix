// @ts-nocheck
import { createEmpDashServerClient, getCachedUser, getCachedProfile } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MessagePanel } from '@/components/emp-dash/message-panel';

export default async function MessagesPage() {
  const user = await getCachedUser();
  if (!user) redirect('/emp-dash/login');

  const profile = await getCachedProfile(user.id);
  if (!profile) redirect('/emp-dash/login');

  const supabase = await createEmpDashServerClient();
  const roleName = profile.emp_roles.name;
  const isAdminPlus = roleName === 'admin' || roleName === 'super_admin';

  const [
    { data: memberRows, error: memberErr },
    { data: headRows },
    { data: allProfiles },
  ] = await Promise.all([
    supabase.from('emp_channel_members').select('channel_id, emp_channels(id, type, name, domain_id, emp_domains(name))').eq('profile_id', user.id),
    isAdminPlus ? Promise.resolve({ data: null }) : supabase.from('emp_user_domains').select('domain_id').eq('profile_id', user.id).eq('role_in_domain', 'head').limit(1),
    supabase.from('emp_profiles').select('id, full_name').neq('id', user.id).order('full_name'),
  ]);

  const canCreateChannel = isAdminPlus || (headRows?.length ?? 0) > 0;

  if (memberErr) {
    return (
      <div role="alert" style={{ padding:'12px 16px', borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>
        Failed to load channels: {memberErr.message}
      </div>
    );
  }

  const channels = (memberRows ?? []).map(row => {
    const ch = row.emp_channels as { id: string; type: string; name: string | null; domain_id: string | null; emp_domains?: { name: string } | null };
    return {
      id: ch.id,
      type: ch.type as 'domain' | 'dm' | 'group',
      name: ch.name,
      domain_id: ch.domain_id,
      created_at: '',
      domain_name: ch.emp_domains?.name ?? null,
    };
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      <div>
        <h1 style={{ fontSize:'22px', fontWeight:700, color:'#111', letterSpacing:'-0.3px', margin:0 }}>Messages</h1>
        <p style={{ fontSize:'14px', color:'#9ca3af', marginTop:'4px' }}>Domain channels, group channels, and direct messages</p>
      </div>
      <MessagePanel
        channels={channels}
        initialChannelId={channels[0]?.id ?? null}
        currentUserId={user.id}
        currentUserName={profile.full_name}
        canCreateChannel={canCreateChannel}
        allProfiles={(allProfiles ?? [])}
      />
    </div>
  );
}
