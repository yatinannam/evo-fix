'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { getEmpDashBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import type { EmpProfile, EmpRole, EmpUserDomain, EmpDomain } from '@/lib/supabase/types';

interface SidebarProps {
  profile: EmpProfile & { emp_roles: Pick<EmpRole, 'name'> };
  userDomains: (EmpUserDomain & { emp_domains: Pick<EmpDomain, 'id' | 'name' | 'slug'> })[];
  notificationBell?: React.ReactNode;
}

const NAV_ITEMS = [
  {
    label: 'My Day',
    href: '/emp-dash',
    exact: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    label: 'Tasks',
    href: '/emp-dash/tasks',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },
  {
    label: 'Messages',
    href: '/emp-dash/messages',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    ),
  },
  {
    label: 'Notes',
    href: '/emp-dash/notes',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    label: 'People',
    href: '/emp-dash/people',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
];

const ADMIN_ITEMS = [
  {
    label: 'Admin',
    href: '/emp-dash/admin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
];

const ROLE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  super_admin: { label: 'Super Admin', color: '#dc2626', bg: '#fff1f2' },
  admin:       { label: 'Admin',       color: '#ea580c', bg: '#fff7ed' },
  domain_head: { label: 'Domain Head', color: '#d97706', bg: '#fffbeb' },
  employee:    { label: 'Employee',    color: '#6b7280', bg: '#f9fafb' },
};

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function EmpDashSidebar({ profile, userDomains, notificationBell }: SidebarProps) {
  const pathname = usePathname();
  const router   = useRouter();
  const [signingOut, setSigningOut] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Close the drawer on route change so tapping a nav item navigates AND closes
  // it. Adjusted during render (not an effect) per React's "storing information
  // from previous renders" pattern — avoids the extra render an effect causes.
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setMobileOpen(false);
  }
  const roleName = profile.emp_roles.name;
  const isAdminPlus = roleName === 'admin' || roleName === 'super_admin';
  const roleInfo = ROLE_LABEL[roleName] ?? ROLE_LABEL.employee;

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  async function handleSignOut() {
    setSigningOut(true);
    try {
      const supabase = getEmpDashBrowserClient();
      await supabase.auth.signOut();
      router.replace('/emp-dash/login');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <>
      {/* Mobile-only top bar: hamburger trigger + brand. Hidden on desktop via CSS. */}
      <div className="ed-mobile-topbar" style={{
        alignItems: 'center', gap: '10px', padding: '12px 16px',
        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,0,0,0.07)',
        fontFamily: "'Outfit','Inter',system-ui,sans-serif",
      }}>
        <button
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          aria-expanded={mobileOpen}
          style={{
            width: '36px', height: '36px', borderRadius: '10px', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'transparent', border: '1px solid rgba(0,0,0,0.08)', cursor: 'pointer', color: '#374151',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
        </button>
        <div style={{ fontWeight: 700, fontSize: '14px', color: '#111' }}>EvoDoc Workspace</div>
      </div>

      {/* Backdrop — mobile only, dims content behind the open drawer */}
      {mobileOpen && (
        <div className="ed-sidebar-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <nav className={`ed-sidebar${mobileOpen ? ' ed-sidebar-open' : ''}`} style={{
        width: '240px', minWidth: '240px', height: '100vh',
        position: 'sticky', top: 0,
        display: 'flex', flexDirection: 'column',
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(0,0,0,0.07)',
        boxShadow: '2px 0 20px rgba(0,0,0,0.04)',
        padding: '0',
        fontFamily: "'Outfit','Inter',system-ui,sans-serif",
        zIndex: 50, overflowY: 'auto',
      }}>
      {/* Brand + notification bell */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          <div style={{
            width:'36px', height:'36px', borderRadius:'10px',
            background:'linear-gradient(135deg,#f97316,#f43f5e)',
            display:'flex', alignItems:'center', justifyContent:'center',
            boxShadow:'0 4px 12px rgba(249,115,22,0.3)', flexShrink: 0,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z"/>
              <path d="M12 12h.01M8 12h.01M16 12h.01"/>
            </svg>
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontWeight:700, fontSize:'15px', color:'#111', lineHeight:1.2 }}>EvoDoc</div>
            <div style={{ fontSize:'10px', color:'#f97316', fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase' }}>Workspace</div>
          </div>
          {/* Notification bell slot */}
          {notificationBell}
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex:1, padding:'12px 10px', display:'flex', flexDirection:'column', gap:'2px' }}>
        <div style={{ fontSize:'10px', fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', padding:'8px 10px 6px' }}>
          Navigation
        </div>
        {NAV_ITEMS.map(item => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display:'flex', alignItems:'center', gap:'10px',
                padding:'9px 12px', borderRadius:'10px',
                color: active ? '#f97316' : '#4b5563',
                background: active ? 'rgba(249,115,22,0.08)' : 'transparent',
                fontWeight: active ? 600 : 500,
                fontSize:'14px',
                textDecoration:'none',
                transition:'background 0.12s, color 0.12s',
                borderLeft: active ? '2px solid #f97316' : '2px solid transparent',
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background='rgba(0,0,0,0.04)'; } }}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLAnchorElement).style.background='transparent'; } }}
            >
              <span style={{ opacity: active ? 1 : 0.7, flexShrink:0 }}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}

        {/* Domains section */}
        {userDomains.length > 0 && (
          <>
            <div style={{ fontSize:'10px', fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', padding:'16px 10px 6px' }}>
              My Domains
            </div>
            {userDomains.map(ud => (
              <div key={ud.domain_id} style={{
                display:'flex', alignItems:'center', gap:'8px',
                padding:'7px 12px', borderRadius:'8px', color:'#6b7280', fontSize:'13px', fontWeight:500,
              }}>
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#f43f5e)', flexShrink:0 }} />
                <span style={{ flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{ud.emp_domains.name}</span>
                {ud.role_in_domain === 'head' && (
                  <span style={{ fontSize:'9px', fontWeight:700, color:'#f97316', background:'#fff7ed', padding:'1px 5px', borderRadius:'4px', border:'1px solid rgba(249,115,22,0.2)' }}>HEAD</span>
                )}
              </div>
            ))}
          </>
        )}

        {/* Admin */}
        {isAdminPlus && (
          <>
            <div style={{ fontSize:'10px', fontWeight:700, color:'#9ca3af', letterSpacing:'0.08em', textTransform:'uppercase', padding:'16px 10px 6px' }}>
              Administration
            </div>
            {ADMIN_ITEMS.map(item => {
              const active = isActive(item.href);
              return (
                <Link key={item.href} href={item.href} style={{
                  display:'flex', alignItems:'center', gap:'10px', padding:'9px 12px', borderRadius:'10px',
                  color: active ? '#f97316' : '#4b5563',
                  background: active ? 'rgba(249,115,22,0.08)' : 'transparent',
                  fontWeight: active ? 600 : 500, fontSize:'14px', textDecoration:'none',
                  transition:'background 0.12s, color 0.12s',
                  borderLeft: active ? '2px solid #f97316' : '2px solid transparent',
                }}>
                  <span style={{ opacity: active ? 1 : 0.7 }}>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* Profile footer */}
      <div style={{ padding:'12px', borderTop:'1px solid rgba(0,0,0,0.06)' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:'10px',
          padding:'10px', borderRadius:'12px',
          background:'rgba(249,115,22,0.04)', border:'1px solid rgba(249,115,22,0.08)',
        }}>
          <div style={{
            width:'34px', height:'34px', borderRadius:'10px', flexShrink:0,
            background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'13px', fontWeight:700, color:'#f97316',
          }}>
            {initials(profile.full_name)}
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'13px', fontWeight:600, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{profile.full_name}</div>
            <div style={{ fontSize:'10px', fontWeight:600, color:roleInfo.color, background:roleInfo.bg, display:'inline-block', padding:'1px 6px', borderRadius:'4px', marginTop:'2px' }}>{roleInfo.label}</div>
          </div>
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            title="Sign out"
            style={{
              width:'28px', height:'28px', borderRadius:'8px', flexShrink:0,
              display:'flex', alignItems:'center', justifyContent:'center',
              background:'transparent', border:'none', cursor:'pointer', color:'#9ca3af',
              transition:'background 0.12s, color 0.12s',
              opacity: signingOut ? 0.5 : 1,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color='#ef4444'; (e.currentTarget as HTMLButtonElement).style.background='#fff1f2'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color='#9ca3af'; (e.currentTarget as HTMLButtonElement).style.background='transparent'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        </div>
      </div>
      </nav>
    </>
  );
}
