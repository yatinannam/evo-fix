'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { createPortal } from 'react-dom';
import { getEmpDashBrowserClient } from '@/lib/supabase/client';
import { markNotificationReadAction, markAllNotificationsReadAction } from '@/app/emp-dash/actions';
import type { EmpNotification, NotificationType } from '@/lib/supabase/types';
import { useRouter } from 'next/navigation';

interface NotificationBellProps {
  initialNotifications: EmpNotification[];
  currentUserId: string;
}

const TYPE_META: Record<NotificationType, { label: string; icon: React.ReactNode; color: string }> = {
  task_assigned: {
    label: 'Task assigned to you',
    color: '#3b82f6',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/></svg>,
  },
  status_changed: {
    label: 'Task status changed',
    color: '#f97316',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>,
  },
  comment_added: {
    label: 'New comment',
    color: '#8b5cf6',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
  },
  mention: {
    label: 'You were mentioned',
    color: '#ec4899',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/></svg>,
  },
  review_overdue: {
    label: 'Review overdue (48h+)',
    color: '#dc2626',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  },
  review_claimed: {
    label: 'Review taken over',
    color: '#d97706',
    icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  },
};

function formatTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day:'numeric', month:'short' });
}

function getTaskUrl(n: EmpNotification): string | null {
  const payload = n.payload as Record<string, unknown>;
  if (payload.task_id) return `/emp-dash/tasks/${payload.task_id}`;
  return null;
}

function getNotificationText(n: EmpNotification): string {
  const payload = n.payload as Record<string, string>;
  switch (n.type) {
    case 'task_assigned': return payload.task_title ?? 'A task was assigned to you';
    case 'status_changed': return `${payload.task_title ?? 'Task'}: ${payload.from_status ?? '?'} → ${payload.to_status ?? '?'}`;
    case 'comment_added': return `New comment on "${payload.task_title ?? 'task'}"`;
    case 'mention': return `You were mentioned in "${payload.task_title ?? 'task'}"`;
    case 'review_overdue': return `"${payload.task_title ?? 'Task'}" has been waiting review for 48h+`;
    case 'review_claimed': return `Your review of "${payload.task_title ?? 'task'}" was taken over`;
    default: return 'New notification';
  }
}

const PANEL_WIDTH = 360;

export function NotificationBell({ initialNotifications, currentUserId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<EmpNotification[]>(initialNotifications);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
  const [isPending, startTransition] = useTransition();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const unread = notifications.filter(n => !n.read).length;

  // Realtime subscription
  useEffect(() => {
    const supabase = getEmpDashBrowserClient();
    const channel = supabase
      .channel(`notifications-${currentUserId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'emp_notifications',
        filter: `profile_id=eq.${currentUserId}`,
      }, payload => {
        setNotifications(prev => [payload.new as EmpNotification, ...prev]);
      })
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'emp_notifications',
        filter: `profile_id=eq.${currentUserId}`,
      }, payload => {
        setNotifications(prev => prev.map(n => n.id === (payload.new as EmpNotification).id ? payload.new as EmpNotification : n));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentUserId]);

  // Close on outside click / scroll / resize. The panel is portaled to
  // document.body (see render below) so it isn't clipped by the sidebar's
  // own overflow:auto, and its position is clamped to the viewport so it
  // never renders off-screen to the left of the narrow sidebar column.
  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    // Only a real page/ancestor scroll invalidates the panel's fixed-position
    // coords — scrolling inside its own notification list fires a 'scroll'
    // event this capture-phase listener still sees, so it must be excluded
    // or the panel closes itself the instant its list is scrolled.
    function onScrollOrResize(e: Event) {
      if (panelRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) { if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus(); } }
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open]);

  function toggleOpen() {
    if (open) { setOpen(false); return; }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const left = Math.min(
        Math.max(8, rect.right - PANEL_WIDTH),
        window.innerWidth - PANEL_WIDTH - 8,
      );
      setCoords({ top: rect.bottom + 8, left });
    }
    setOpen(true);
  }

  function handleClick(n: EmpNotification) {
    if (!n.read) {
      startTransition(async () => {
        await markNotificationReadAction(n.id);
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
      });
    }
    const url = getTaskUrl(n);
    if (url) { setOpen(false); router.push(url); }
  }

  function handleMarkAllRead() {
    startTransition(async () => {
      await markAllNotificationsReadAction();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    });
  }

  return (
    <div style={{ position:'relative' }}>
      {/* Bell button */}
      <button
        ref={buttonRef}
        id="notification-bell"
        onClick={toggleOpen}
        style={{
          width:'36px', height:'36px', borderRadius:'10px',
          display:'flex', alignItems:'center', justifyContent:'center',
          background: open ? 'rgba(249,115,22,0.1)' : 'transparent',
          border: open ? '1px solid rgba(249,115,22,0.2)' : '1px solid transparent',
          cursor:'pointer', position:'relative', color: open ? '#f97316' : '#6b7280',
          transition:'all 0.12s',
        }}
        onMouseEnter={e => {
          if (!open) {
            (e.currentTarget as HTMLButtonElement).style.background='rgba(0,0,0,0.05)';
            (e.currentTarget as HTMLButtonElement).style.color='#374151';
          }
        }}
        onMouseLeave={e => {
          if (!open) {
            (e.currentTarget as HTMLButtonElement).style.background='transparent';
            (e.currentTarget as HTMLButtonElement).style.color='#6b7280';
          }
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        {unread > 0 && (
          <div style={{
            position:'absolute', top:'-4px', right:'-4px',
            minWidth:'18px', height:'18px', borderRadius:'9px',
            background:'linear-gradient(135deg,#f97316,#f43f5e)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'10px', fontWeight:700, color:'white', padding:'0 4px',
            border:'2px solid rgba(255,255,255,0.9)',
          }}>
            {unread > 99 ? '99+' : unread}
          </div>
        )}
      </button>

      {/* Dropdown — portaled to document.body so it can't be clipped by the
          sidebar's own overflow:auto, and positioned/clamped from the
          button's real screen coordinates so it never renders off-screen. */}
      {open && coords && createPortal(
        <div
          ref={panelRef}
          data-lenis-prevent
          style={{
          position:'fixed', top:coords.top, left:coords.left,
          width:PANEL_WIDTH, maxHeight:'480px',
          background:'rgba(255,255,255,0.96)', backdropFilter:'blur(20px)',
          borderRadius:'16px', border:'1px solid rgba(0,0,0,0.08)',
          boxShadow:'0 16px 48px rgba(0,0,0,0.12)',
          overflow:'hidden', zIndex:1000,
          fontFamily:"'Outfit','Inter',system-ui,sans-serif",
        }}>
          {/* Header */}
          <div style={{
            padding:'14px 16px', borderBottom:'1px solid rgba(0,0,0,0.06)',
            display:'flex', alignItems:'center', justifyContent:'space-between',
          }}>
            <span style={{ fontSize:'14px', fontWeight:700, color:'#111' }}>
              Notifications {unread > 0 && <span style={{ color:'#f97316' }}>({unread})</span>}
            </span>
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead} disabled={isPending}
                style={{
                  fontSize:'12px', color:'#f97316', background:'none', border:'none',
                  cursor:'pointer', fontWeight:500,
                  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                }}>
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY:'auto', maxHeight:'400px', overscrollBehavior:'contain' }}>
            {notifications.length === 0 ? (
              <div style={{ padding:'40px 20px', textAlign:'center' }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', margin:'0 auto 8px' }}>
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                </svg>
                <p style={{ fontSize:'13px', color:'#9ca3af', margin:0 }}>You&apos;re all caught up!</p>
              </div>
            ) : (
              notifications.map(n => {
                const meta = TYPE_META[n.type];
                const taskUrl = getTaskUrl(n);
                return (
                  <div
                    key={n.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleClick(n)}
                    onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleClick(n); } }}
                    style={{
                      padding:'12px 16px',
                      display:'flex', alignItems:'flex-start', gap:'12px',
                      borderBottom:'1px solid rgba(0,0,0,0.04)',
                      background: n.read ? 'transparent' : 'rgba(249,115,22,0.03)',
                      cursor: taskUrl ? 'pointer' : 'default',
                      transition:'background 0.12s',
                    }}
                    onMouseEnter={e => { if (taskUrl) (e.currentTarget as HTMLDivElement).style.background='rgba(0,0,0,0.02)'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = n.read ? 'transparent' : 'rgba(249,115,22,0.03)'; }}
                  >
                    {/* Icon */}
                    <div style={{
                      width:'32px', height:'32px', borderRadius:'8px', flexShrink:0,
                      background:`${meta.color}15`,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      color: meta.color,
                    }}>
                      {meta.icon}
                    </div>

                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'13px', color:'#111', lineHeight:1.4, fontWeight: n.read ? 400 : 600 }}>
                        {getNotificationText(n)}
                      </div>
                      <div style={{ fontSize:'11px', color:'#9ca3af', marginTop:'3px' }}>
                        {formatTime(n.created_at)}
                      </div>
                    </div>

                    {!n.read && (
                      <div style={{
                        width:'7px', height:'7px', borderRadius:'50%',
                        background:'#f97316', flexShrink:0, marginTop:'5px',
                      }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
