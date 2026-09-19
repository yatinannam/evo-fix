// @ts-nocheck
import { createEmpDashServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { MessagePanel } from '@/components/emp-dash/message-panel';

export default async function MessagesPage() {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/emp-dash/login');

  const { data: profile } = await supabase.from('emp_profiles').select('full_name').eq('id', user.id).single();
  if (!profile) redirect('/emp-dash/login');

  const { data: memberRows, error: memberErr } = await supabase
    .from('emp_channel_members')
    .select('channel_id, emp_channels(id, type, name, domain_id, emp_domains(name))')
    .eq('profile_id', user.id);

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
      type: ch.type as 'domain' | 'dm',
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
        <p style={{ fontSize:'14px', color:'#9ca3af', marginTop:'4px' }}>Domain channels and direct messages</p>
      </div>
      <MessagePanel
        channels={channels}
        initialChannelId={channels[0]?.id ?? null}
        currentUserId={user.id}
        currentUserName={profile.full_name}
      />
    </div>
  );
}
