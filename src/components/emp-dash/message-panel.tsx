// @ts-nocheck
'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { getEmpDashBrowserClient } from '@/lib/supabase/client';
import type { EmpMessage, EmpChannel, EmpProfile } from '@/lib/supabase/types';

type ChannelWithDomain = EmpChannel & { domain_name: string | null };
type MessageWithSender = EmpMessage & { emp_profiles: Pick<EmpProfile, 'full_name'> };

interface MessagePanelProps {
  channels: ChannelWithDomain[];
  initialChannelId: string | null;
  currentUserId: string;
  currentUserName: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function MessagePanel({ channels, initialChannelId, currentUserId, currentUserName }: MessagePanelProps) {
  const [activeChannelId, setActiveChannelId] = useState<string | null>(initialChannelId ?? channels[0]?.id ?? null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeChannelId) return;
    setLoading(true);
    setError(null);
    const supabase = getEmpDashBrowserClient();

    supabase
      .from('emp_messages')
      .select('*, emp_profiles!sender_id(full_name)')
      .eq('channel_id', activeChannelId)
      .order('created_at', { ascending: true })
      .limit(100)
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); return; }
        setMessages((data ?? []) as MessageWithSender[]);
        setLoading(false);
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'auto' }), 50);
      });

    const channel = supabase
      .channel(`messages-${activeChannelId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'emp_messages',
        filter: `channel_id=eq.${activeChannelId}`,
      }, async payload => {
        const { data: sender } = await supabase.from('emp_profiles').select('full_name').eq('id', payload.new.sender_id).single();
        const msg = { ...payload.new, emp_profiles: sender ?? { full_name: 'Unknown' } } as MessageWithSender;
        setMessages(prev => {
          if (prev.find(m => m.id === msg.id)) return prev;
          return [...prev, msg];
        });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [activeChannelId]);

  function sendMessage() {
    if (!body.trim() || !activeChannelId) return;
    const draft = body;
    setBody('');

    const optimistic: MessageWithSender = {
      id: `opt-${Date.now()}`, channel_id: activeChannelId, sender_id: currentUserId,
      body: draft, attachments: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      emp_profiles: { full_name: currentUserName },
    };
    setMessages(prev => [...prev, optimistic]);

    startTransition(async () => {
      const supabase = getEmpDashBrowserClient();
      const { error: sendErr } = await supabase.from('emp_messages').insert({
        channel_id: activeChannelId, sender_id: currentUserId, body: draft,
      });
      if (sendErr) {
        setError(sendErr.message);
        setMessages(prev => prev.filter(m => m.id !== optimistic.id));
        setBody(draft);
      }
    });
  }

  const activeChannel = channels.find(c => c.id === activeChannelId);

  return (
    <div style={{
      display:'flex', height:'calc(100vh - 8rem)',
      background:'rgba(255,255,255,0.5)', backdropFilter:'blur(12px)',
      borderRadius:'20px', border:'1px solid rgba(255,255,255,0.7)',
      overflow:'hidden', boxShadow:'0 4px 24px rgba(0,0,0,0.06)',
    }}>
      {/* Channel list */}
      <aside style={{
        width:'220px', flexShrink:0,
        borderRight:'1px solid rgba(0,0,0,0.06)',
        display:'flex', flexDirection:'column',
        background:'rgba(255,255,255,0.4)',
      }}>
        <div style={{ padding:'16px 18px', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize:'10px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em', margin:0 }}>Channels</h3>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'8px' }}>
          {channels.length === 0 && <p style={{ fontSize:'12px', color:'#9ca3af', padding:'8px 12px' }}>No channels yet.</p>}
          {channels.map(ch => {
            const active = ch.id === activeChannelId;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannelId(ch.id)}
                style={{
                  width:'100%', display:'flex', alignItems:'center', gap:'8px',
                  padding:'10px 12px', borderRadius:'10px', fontSize:'13px', fontWeight: active ? 600 : 500,
                  textAlign:'left', border:'none', cursor:'pointer',
                  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                  color: active ? '#f97316' : '#4b5563',
                  background: active ? 'rgba(249,115,22,0.08)' : 'transparent',
                  borderLeft: active ? '2px solid #f97316' : '2px solid transparent',
                  transition:'background 0.12s, color 0.12s',
                }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background='rgba(0,0,0,0.03)'; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.background='transparent'; }}
              >
                {ch.type === 'domain' ? (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                ) : (
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                )}
                <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ch.domain_name ?? ch.name ?? 'DM'}</span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* Message area */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Channel header */}
        <div style={{
          padding:'14px 20px', borderBottom:'1px solid rgba(0,0,0,0.06)',
          display:'flex', alignItems:'center', gap:'8px',
        }}>
          {activeChannel?.type === 'domain' ? (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
          ) : (
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          )}
          <span style={{ fontSize:'14px', fontWeight:600, color:'#111' }}>{activeChannel?.domain_name ?? activeChannel?.name ?? 'Select a channel'}</span>
        </div>

        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px', display:'flex', flexDirection:'column', gap:'12px' }}>
          {loading && (
            <div style={{ display:'flex', justifyContent:'center', padding:'32px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation:'spin 0.8s linear infinite' }}>
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
            </div>
          )}
          {error && <div role="alert" style={{ padding:'12px 16px', borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>{error}</div>}
          {!loading && messages.length === 0 && (
            <p style={{ textAlign:'center', fontSize:'14px', color:'#9ca3af', padding:'48px 0' }}>No messages yet. Say hi! 👋</p>
          )}

          {messages.map(msg => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div key={msg.id} style={{ display:'flex', gap:'10px', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
                <div style={{
                  width:'28px', height:'28px', borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'11px', fontWeight:700, color:'#f97316',
                }}>
                  {initials(msg.emp_profiles.full_name)}
                </div>
                <div style={{ maxWidth:'70%', display:'flex', flexDirection:'column', gap:'2px', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                  <span style={{ fontSize:'10px', color:'#9ca3af' }}>{isOwn ? 'You' : msg.emp_profiles.full_name} · {formatTime(msg.created_at)}</span>
                  <div style={{
                    padding:'10px 14px', borderRadius:'16px', fontSize:'14px', lineHeight:1.5, color:'#111',
                    background: isOwn ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.82)',
                    border: isOwn ? '1px solid rgba(249,115,22,0.15)' : '1px solid rgba(0,0,0,0.06)',
                    borderTopRightRadius: isOwn ? '4px' : '16px',
                    borderTopLeftRadius: isOwn ? '16px' : '4px',
                    boxShadow: isOwn ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                  }}>
                    {msg.body}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Compose */}
        <div style={{ padding:'16px 20px', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', gap:'8px' }}>
            <input
              value={body}
              onChange={e => setBody(e.target.value)}
              disabled={!activeChannelId || isPending}
              id="message-input"
              placeholder={activeChannelId ? `Message ${activeChannel?.domain_name ?? 'channel'}…` : 'Select a channel'}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              style={{
                flex:1, padding:'10px 16px', borderRadius:'12px',
                border:'1px solid rgba(0,0,0,0.1)', background:'white',
                fontSize:'14px', color:'#111', outline:'none',
                fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                opacity: (!activeChannelId || isPending) ? 0.5 : 1,
              }}
            />
            <button
              onClick={sendMessage}
              disabled={!activeChannelId || !body.trim() || isPending}
              id="send-message-btn"
              style={{
                padding:'10px 16px', borderRadius:'12px',
                background:'linear-gradient(135deg,#f97316,#f43f5e)',
                color:'white', border:'none', cursor:'pointer',
                fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                opacity: (!activeChannelId || !body.trim() || isPending) ? 0.5 : 1,
                transition:'opacity 0.15s',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
