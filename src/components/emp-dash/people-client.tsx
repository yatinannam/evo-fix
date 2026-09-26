'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createProfileAction, changeProfileRoleAction, updateProfilePositionAction } from '@/app/emp-dash/actions';
import { getEmpDashBrowserClient } from '@/lib/supabase/client';
import { Combobox } from './combobox';
import { useEscapeToClose } from './use-escape-to-close';
import type { EmpProfile, EmpRole, EmpDomain, EmpUserDomain, RoleInDomain, Database } from '@/lib/supabase/types';

type ProfileWithRole = EmpProfile & { emp_roles: Pick<EmpRole, 'name'> };
type UserDomainWithDomain = EmpUserDomain & { emp_domains: Pick<EmpDomain, 'id' | 'name' | 'slug'> };

interface PeopleClientProps {
  profiles: ProfileWithRole[];
  allUserDomains: UserDomainWithDomain[];
  allRoles: EmpRole[];
  allDomains: EmpDomain[];
  isAdminPlus: boolean;
  isSuperAdmin: boolean;
  currentUserId: string;
}

const ROLE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  super_admin: { label: 'Super Admin', color: '#dc2626', bg: '#fff1f2', border: '#fecdd3' },
  admin:       { label: 'Admin',       color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  domain_head: { label: 'Domain Head', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
  employee:    { label: 'Employee',    color: '#6b7280', bg: '#f9fafb', border: '#e5e7eb' },
};

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function PeopleClient({ profiles, allUserDomains, allRoles, allDomains, isAdminPlus, isSuperAdmin, currentUserId }: PeopleClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  useEscapeToClose(showCreate, () => closeCreateModal());
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = profiles.filter(p =>
    p.full_name.toLowerCase().includes(search.toLowerCase()) ||
    p.email.toLowerCase().includes(search.toLowerCase())
  );

  const allowedRoles = isSuperAdmin
    ? allRoles
    : allRoles.filter(r => r.name === 'domain_head' || r.name === 'employee');

  function domainsForProfile(profileId: string) {
    return allUserDomains.filter(ud => ud.profile_id === profileId);
  }

  // ── Create profile (incl. Super Admin confirmation gate) ───────────────────

  const [roleId, setRoleId] = useState(allowedRoles[0]?.id ?? '');
  const [confirmSuperAdmin, setConfirmSuperAdmin] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  const selectedRoleName = allRoles.find(r => r.id === roleId)?.name;
  const isSuperAdminSelected = selectedRoleName === 'super_admin';

  function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    // Combobox is a button, not a native form field, so role_id doesn't
    // auto-populate into FormData the way a <select name="role_id"> would.
    fd.set('role_id', roleId);

    if (isSuperAdminSelected && !confirmSuperAdmin) {
      // Super Admin is the most powerful role in the system — require an
      // explicit second confirmation step before actually submitting.
      setPendingFormData(fd);
      setConfirmSuperAdmin(true);
      return;
    }

    startTransition(async () => {
      const result = await createProfileAction(pendingFormData ?? fd);
      if (result?.error) { setError(result.error); }
      else { setShowCreate(false); setConfirmSuperAdmin(false); setPendingFormData(null); }
    });
  }

  function closeCreateModal() {
    setShowCreate(false);
    setError(null);
    setConfirmSuperAdmin(false);
    setPendingFormData(null);
  }

  // ── Person detail / edit panel ────────────────────────────────────────────

  const [viewingPersonId, setViewingPersonId] = useState<string | null>(null);
  useEscapeToClose(!!viewingPersonId, () => closePersonPanel());
  const [editRoleId, setEditRoleId] = useState('');
  const [confirmRoleSuperAdmin, setConfirmRoleSuperAdmin] = useState(false);
  const [positionDraft, setPositionDraft] = useState('');
  const [newDomainId, setNewDomainId] = useState(allDomains[0]?.id ?? '');
  const [newDomainRole, setNewDomainRole] = useState<RoleInDomain>('member');
  const [panelError, setPanelError] = useState<string | null>(null);

  const viewingPerson = profiles.find(p => p.id === viewingPersonId) ?? null;

  function canEditRole(person: ProfileWithRole) {
    if (!isAdminPlus) return false;
    if (person.id === currentUserId) return false;
    if (isSuperAdmin) return true;
    return person.emp_roles.name !== 'admin' && person.emp_roles.name !== 'super_admin';
  }

  function openPersonPanel(person: ProfileWithRole) {
    setPanelError(null);
    setViewingPersonId(person.id);
    setPositionDraft(person.position ?? '');
    setEditRoleId(allRoles.find(r => r.name === person.emp_roles.name)?.id ?? '');
    setConfirmRoleSuperAdmin(false);
    setNewDomainId(allDomains[0]?.id ?? '');
    setNewDomainRole('member');
  }

  function closePersonPanel() {
    setViewingPersonId(null);
    setPanelError(null);
    setConfirmRoleSuperAdmin(false);
  }

  const editRoleName = allRoles.find(r => r.id === editRoleId)?.name;
  const isPromotingToSuperAdmin = editRoleName === 'super_admin';

  function saveRoleChange() {
    if (!viewingPerson || !editRoleId) return;
    setPanelError(null);

    if (isPromotingToSuperAdmin && !confirmRoleSuperAdmin) {
      // Same principle as the create-profile flow — the most powerful role
      // in the system needs an explicit second confirmation, whether
      // granted at creation or via an edit.
      setConfirmRoleSuperAdmin(true);
      return;
    }

    startTransition(async () => {
      const result = await changeProfileRoleAction(viewingPerson.id, editRoleId);
      if (result?.error) { setPanelError(result.error); }
      else { setConfirmRoleSuperAdmin(false); router.refresh(); }
    });
  }

  function savePosition() {
    if (!viewingPerson) return;
    setPanelError(null);
    startTransition(async () => {
      const result = await updateProfilePositionAction(viewingPerson.id, positionDraft);
      if (result?.error) { setPanelError(result.error); }
      else { router.refresh(); }
    });
  }

  function addDomainMembership() {
    if (!viewingPerson || !newDomainId) return;
    setPanelError(null);
    startTransition(async () => {
      const supabase = getEmpDashBrowserClient();
      // TS resolves .from('emp_user_domains').insert()'s parameter to `never`
      // here specifically (a supabase-js generic-inference limitation on this
      // table, not a real type error — the object below is independently
      // verified against the same Database['...']['Insert'] type one line up).
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { error: err } = await (supabase.from('emp_user_domains').insert as any)({
        profile_id: viewingPerson.id, domain_id: newDomainId, role_in_domain: newDomainRole,
      } satisfies Database['public']['Tables']['emp_user_domains']['Insert']);
      if (err) setPanelError(err.code === '23505' ? `${viewingPerson.full_name} is already a member of that domain.` : err.message);
      else router.refresh();
    });
  }

  function removeDomainMembership(userDomainId: string) {
    setPanelError(null);
    // Look up who/where before deleting, so any review-claim lock they hold
    // in that domain can be released too — see removeUserDomain in
    // admin-client.tsx for the full rationale.
    const row = allUserDomains.find(ud => ud.id === userDomainId);
    startTransition(async () => {
      const supabase = getEmpDashBrowserClient();
      const { error: err } = await supabase.from('emp_user_domains').delete().eq('id', userDomainId);
      if (err) { setPanelError(err.message); return; }
      if (row) {
        // Same supabase-js generic-inference quirk as the emp_user_domains
        // insert above — TS resolves .update()'s parameter to `never` for
        // this table in this file specifically.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('emp_tasks').update as any)({
          reviewing_by: null, reviewing_since: null,
        } satisfies Database['public']['Tables']['emp_tasks']['Update'])
          .eq('domain_id', row.domain_id)
          .eq('reviewing_by', row.profile_id);
      }
      router.refresh();
    });
  }

  const inputStyle: React.CSSProperties = {
    width:'100%', padding:'10px 14px', borderRadius:'10px', boxSizing:'border-box',
    border:'1px solid rgba(0,0,0,0.12)', background:'white',
    fontSize:'14px', color:'#111', outline:'none',
    fontFamily:"'Outfit','Inter',system-ui,sans-serif",
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:700, color:'#111', letterSpacing:'-0.3px', margin:0 }}>People</h1>
          <p style={{ fontSize:'14px', color:'#9ca3af', marginTop:'4px' }}>{profiles.length} team member{profiles.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdminPlus && (
          <button onClick={() => setShowCreate(true)} id="invite-member-btn"
            style={{
              display:'inline-flex', alignItems:'center', gap:'6px',
              padding:'10px 20px', borderRadius:'12px',
              background:'linear-gradient(135deg,#f97316,#f43f5e)',
              color:'white', fontWeight:600, fontSize:'14px',
              border:'none', cursor:'pointer',
              fontFamily:"'Outfit','Inter',system-ui,sans-serif",
              boxShadow:'0 2px 8px rgba(249,115,22,0.3)',
              transition:'opacity 0.15s, transform 0.1s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity='0.92'; (e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity='1'; (e.currentTarget as HTMLButtonElement).style.transform='translateY(0)'; }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
            Invite Member
          </button>
        )}
      </div>

      {/* Search */}
      <div style={{ position:'relative' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          style={{ position:'absolute', left:'14px', top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}>
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          id="people-search"
          placeholder="Search by name or email…"
          style={{
            width:'100%', padding:'10px 14px 10px 38px', borderRadius:'14px',
            border:'1px solid rgba(0,0,0,0.08)', background:'rgba(255,255,255,0.6)',
            fontSize:'14px', color:'#111', outline:'none',
            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
            backdropFilter:'blur(8px)',
          }}
        />
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:'16px' }}>
        {filtered.map(person => {
          const domains = domainsForProfile(person.id);
          const ini = getInitials(person.full_name);
          const rm = ROLE_META[person.emp_roles.name] ?? ROLE_META.employee;
          return (
            <button key={person.id} type="button" onClick={() => openPersonPanel(person)} style={{
              background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)',
              borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)',
              padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
              transition:'box-shadow 0.15s, transform 0.1s',
              cursor:'pointer', textAlign:'left', width:'100%',
              fontFamily:"'Outfit','Inter',system-ui,sans-serif",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLButtonElement).style.transform='translateY(-2px)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLButtonElement).style.transform='translateY(0)'; }}
            >
              <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
                <div style={{
                  width:'42px', height:'42px', borderRadius:'12px', flexShrink:0,
                  background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'14px', fontWeight:700, color:'#f97316',
                }}>
                  {ini}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'14px', fontWeight:600, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{person.full_name}</div>
                  <div style={{ fontSize:'12px', color:'#9ca3af', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {person.position || person.email}
                  </div>
                  <div style={{ marginTop:'8px' }}>
                    <span style={{
                      display:'inline-block',
                      fontSize:'10px', fontWeight:600, padding:'2px 8px', borderRadius:'6px',
                      color:rm.color, background:rm.bg, border:`1px solid ${rm.border}`,
                    }}>
                      {rm.label}
                    </span>
                  </div>
                </div>
              </div>
              {domains.length > 0 && (
                <div style={{ marginTop:'12px', display:'flex', flexWrap:'wrap', gap:'4px' }}>
                  {domains.map(ud => (
                    <span key={ud.domain_id} style={{
                      fontSize:'10px', padding:'3px 8px', borderRadius:'6px',
                      background:'#f9fafb', border:'1px solid #e5e7eb', color:'#4b5563',
                      display:'inline-flex', alignItems:'center', gap:'4px',
                    }}>
                      {ud.emp_domains.name}
                      {ud.role_in_domain === 'head' && (
                        <span style={{ color:'#f97316', fontWeight:700, fontSize:'9px' }}>HEAD</span>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ gridColumn:'1 / -1', textAlign:'center', padding:'48px 0', color:'#9ca3af', fontSize:'14px' }}>No people match your search.</div>
        )}
      </div>

      {/* Create profile modal */}
      {showCreate && (
        <div style={{
          position:'fixed', inset:0, zIndex:50,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.2)', backdropFilter:'blur(4px)',
          padding:'24px 16px',
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="invite-form-title" style={{
            width:'100%', maxWidth:'440px', maxHeight:'calc(100vh - 48px)',
            background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)',
            borderRadius:'20px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
            border:'1px solid rgba(255,255,255,0.7)',
            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
            display:'flex', flexDirection:'column', overflow:'hidden',
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'28px 28px 0', flexShrink:0 }}>
              <h2 id="invite-form-title" style={{ fontSize:'18px', fontWeight:700, color:'#111', margin:0 }}>Invite Team Member</h2>
              <button onClick={closeCreateModal}
                style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', cursor:'pointer', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', transition:'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(0,0,0,0.05)'}
                onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='transparent'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', minHeight:0, flex:1 }}>
            <div style={{ padding:'20px 28px 28px', display:'flex', flexDirection:'column', gap:'16px', overflowY:'auto', overscrollBehavior:'contain', minHeight:0, flex:1 }}>
              <div>
                <label htmlFor="invite-name" style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'6px' }}>Full Name</label>
                <input id="invite-name" name="full_name" required style={inputStyle} />
              </div>
              <div>
                <label htmlFor="invite-email" style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'6px' }}>Email</label>
                <input id="invite-email" name="email" type="email" required style={inputStyle} />
              </div>
              <div>
                <label htmlFor="invite-password" style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'6px' }}>Temporary Password</label>
                <input id="invite-password" name="password" type="password" required minLength={8} style={inputStyle} />
              </div>
              <div>
                <label htmlFor="invite-role" style={{ display:'block', fontSize:'13px', fontWeight:600, color:'#374151', marginBottom:'6px' }}>Role</label>
                <Combobox
                  id="invite-role"
                  options={allowedRoles.map(r => ({ id: r.id, label: ROLE_META[r.name]?.label ?? r.name }))}
                  value={roleId}
                  onChange={v => { setRoleId(v); setConfirmSuperAdmin(false); }}
                  hideEmptyOption
                />
              </div>
            </div>

            <div style={{ padding:'0 28px 28px', flexShrink:0, display:'flex', flexDirection:'column', gap:'12px' }}>
              {error && <div role="alert" style={{ padding:'10px 14px', borderRadius:'12px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>{error}</div>}

              {confirmSuperAdmin ? (
                <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                  <div style={{ padding:'12px 14px', borderRadius:'12px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#dc2626', fontSize:'13px', lineHeight:1.5 }}>
                    You are about to create a new <strong>Super Admin</strong> — the most powerful role in the system, with full access to everything. This action is recorded in the audit log.
                  </div>
                  <div style={{ display:'flex', gap:'12px' }}>
                    <button type="button" onClick={() => { setConfirmSuperAdmin(false); setPendingFormData(null); }}
                      style={{
                        flex:1, padding:'10px', borderRadius:'12px',
                        border:'1px solid rgba(0,0,0,0.1)', background:'transparent',
                        fontSize:'14px', color:'#6b7280', cursor:'pointer',
                        fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                      }}
                    >Go back</button>
                    <button type="submit" disabled={isPending} id="confirm-super-admin-btn"
                      style={{
                        flex:1, padding:'10px', borderRadius:'12px',
                        background:'linear-gradient(135deg,#dc2626,#f43f5e)',
                        color:'white', fontWeight:600, fontSize:'13px',
                        border:'none', cursor:'pointer',
                        fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                        opacity: isPending ? 0.6 : 1,
                      }}
                    >
                      {isPending ? 'Creating…' : 'Yes, create a new Super Admin'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display:'flex', gap:'12px', marginTop:'8px' }}>
                  <button type="button" onClick={closeCreateModal}
                    style={{
                      flex:1, padding:'10px', borderRadius:'12px',
                      border:'1px solid rgba(0,0,0,0.1)', background:'transparent',
                      fontSize:'14px', color:'#6b7280', cursor:'pointer',
                      fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                      transition:'background 0.12s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(0,0,0,0.03)'}
                    onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='transparent'}
                  >Cancel</button>
                  <button type="submit" disabled={isPending} id="confirm-invite-btn"
                    style={{
                      flex:1, padding:'10px', borderRadius:'12px',
                      background:'linear-gradient(135deg,#f97316,#f43f5e)',
                      color:'white', fontWeight:600, fontSize:'14px',
                      border:'none', cursor:'pointer',
                      fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                      display:'flex', alignItems:'center', justifyContent:'center', gap:'6px',
                      opacity: isPending ? 0.6 : 1,
                    }}
                  >
                    {isPending ? (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation:'spin 0.8s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Inviting…</>
                    ) : (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> Invite</>
                    )}
                  </button>
                </div>
              )}
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Person detail / edit panel */}
      {viewingPerson && (
        <div style={{
          position:'fixed', inset:0, zIndex:50,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.2)', backdropFilter:'blur(4px)',
          padding:'16px',
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="person-panel-title" style={{
            width:'100%', maxWidth:'480px', maxHeight:'calc(100vh - 48px)',
            background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)',
            borderRadius:'20px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
            border:'1px solid rgba(255,255,255,0.7)',
            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
            display:'flex', flexDirection:'column', overflow:'hidden',
          }}>
            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', gap:'14px', padding:'24px', borderBottom:'1px solid rgba(0,0,0,0.06)', flexShrink:0 }}>
              <div style={{
                width:'48px', height:'48px', borderRadius:'14px', flexShrink:0,
                background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'16px', fontWeight:700, color:'#f97316',
              }}>
                {getInitials(viewingPerson.full_name)}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div id="person-panel-title" style={{ fontSize:'16px', fontWeight:700, color:'#111' }}>{viewingPerson.full_name}</div>
                <div style={{ fontSize:'12px', color:'#9ca3af', marginTop:'2px' }}>{viewingPerson.email}</div>
              </div>
              <button onClick={closePersonPanel}
                style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', cursor:'pointer', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af', flexShrink:0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <div style={{ padding:'24px', overflowY:'auto', overscrollBehavior:'contain', display:'flex', flexDirection:'column', gap:'20px', flex:1, minHeight:0 }}>
              {/* Position */}
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Position / Title
                </label>
                {isAdminPlus ? (
                  <div style={{ display:'flex', gap:'8px' }}>
                    <input
                      value={positionDraft}
                      onChange={e => setPositionDraft(e.target.value)}
                      placeholder="e.g. Senior Backend Engineer"
                      style={inputStyle}
                    />
                    <button type="button" onClick={savePosition} disabled={isPending}
                      style={{
                        padding:'0 16px', borderRadius:'10px', border:'none', flexShrink:0,
                        background:'rgba(249,115,22,0.1)', color:'#f97316', fontWeight:600, fontSize:'13px',
                        cursor:'pointer', fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                        opacity: isPending ? 0.6 : 1,
                      }}
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <p style={{ fontSize:'14px', color:'#374151', margin:0 }}>{viewingPerson.position || '—'}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Role
                </label>
                {canEditRole(viewingPerson) ? (
                  confirmRoleSuperAdmin ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                      <div style={{ padding:'10px 12px', borderRadius:'10px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#dc2626', fontSize:'12px', lineHeight:1.5 }}>
                        You are about to promote {viewingPerson.full_name} to <strong>Super Admin</strong> — the most powerful role in the system.
                      </div>
                      <div style={{ display:'flex', gap:'8px' }}>
                        <button type="button" onClick={() => setConfirmRoleSuperAdmin(false)}
                          style={{
                            flex:1, padding:'8px', borderRadius:'10px', border:'1px solid rgba(0,0,0,0.1)',
                            background:'transparent', color:'#6b7280', fontSize:'13px', cursor:'pointer',
                            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                          }}>
                          Go back
                        </button>
                        <button type="button" onClick={saveRoleChange} disabled={isPending}
                          style={{
                            flex:1, padding:'8px', borderRadius:'10px', border:'none',
                            background:'linear-gradient(135deg,#dc2626,#f43f5e)', color:'white', fontWeight:600, fontSize:'13px',
                            cursor:'pointer', fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                            opacity: isPending ? 0.6 : 1,
                          }}>
                          {isPending ? 'Saving…' : 'Yes, promote'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:'flex', gap:'8px' }}>
                      <div style={{ flex:1 }}>
                        <Combobox
                          options={allowedRoles.map(r => ({ id: r.id, label: ROLE_META[r.name]?.label ?? r.name }))}
                          value={editRoleId}
                          onChange={setEditRoleId}
                          hideEmptyOption
                        />
                      </div>
                      <button type="button" onClick={saveRoleChange} disabled={isPending}
                        style={{
                          padding:'0 16px', borderRadius:'10px', border:'none', flexShrink:0,
                          background:'rgba(249,115,22,0.1)', color:'#f97316', fontWeight:600, fontSize:'13px',
                          cursor:'pointer', fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                          opacity: isPending ? 0.6 : 1,
                        }}
                      >
                        Save
                      </button>
                    </div>
                  )
                ) : (
                  <span style={{
                    display:'inline-block',
                    fontSize:'11px', fontWeight:600, padding:'4px 10px', borderRadius:'6px',
                    color:(ROLE_META[viewingPerson.emp_roles.name] ?? ROLE_META.employee).color,
                    background:(ROLE_META[viewingPerson.emp_roles.name] ?? ROLE_META.employee).bg,
                    border:`1px solid ${(ROLE_META[viewingPerson.emp_roles.name] ?? ROLE_META.employee).border}`,
                  }}>
                    {(ROLE_META[viewingPerson.emp_roles.name] ?? ROLE_META.employee).label}
                  </span>
                )}
                {viewingPerson.id === currentUserId && isAdminPlus && (
                  <p style={{ fontSize:'11px', color:'#9ca3af', marginTop:'6px' }}>You cannot change your own role.</p>
                )}
              </div>

              {/* Domain access */}
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Domain Access
                </label>
                <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom: isAdminPlus ? '10px' : 0 }}>
                  {domainsForProfile(viewingPerson.id).length === 0 && (
                    <p style={{ fontSize:'13px', color:'#9ca3af', margin:0 }}>Not a member of any domain.</p>
                  )}
                  {domainsForProfile(viewingPerson.id).map(ud => (
                    <div key={ud.domain_id} style={{
                      display:'flex', alignItems:'center', gap:'8px',
                      padding:'8px 12px', borderRadius:'10px',
                      background:'rgba(0,0,0,0.02)', border:'1px solid rgba(0,0,0,0.06)',
                    }}>
                      <span style={{ flex:1, fontSize:'13px', color:'#374151', fontWeight:500 }}>{ud.emp_domains.name}</span>
                      <span style={{
                        fontSize:'10px', padding:'2px 8px', borderRadius:'6px', fontWeight:600,
                        background: ud.role_in_domain === 'head' ? '#fffbeb' : '#f9fafb',
                        color: ud.role_in_domain === 'head' ? '#d97706' : '#6b7280',
                        border: `1px solid ${ud.role_in_domain === 'head' ? '#fde68a' : '#e5e7eb'}`,
                      }}>
                        {ud.role_in_domain}
                      </span>
                      {isAdminPlus && (
                        <button type="button" onClick={() => removeDomainMembership(ud.id)} disabled={isPending}
                          style={{ background:'none', border:'none', cursor:'pointer', color:'#d1d5db', padding:'2px' }}
                          onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#ef4444'}
                          onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#d1d5db'}>
                          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                {isAdminPlus && allDomains.length > 0 && (
                  <div style={{ display:'flex', gap:'6px' }}>
                    <div style={{ flex:1 }}>
                      <Combobox
                        options={allDomains.map(d => ({ id: d.id, label: d.name }))}
                        value={newDomainId}
                        onChange={setNewDomainId}
                        emptyOptionLabel="Select domain…"
                      />
                    </div>
                    <div style={{ width:'120px' }}>
                      <Combobox
                        options={[{ id:'member', label:'Member' }, { id:'head', label:'Head' }]}
                        value={newDomainRole}
                        onChange={v => setNewDomainRole(v as RoleInDomain)}
                        hideEmptyOption
                      />
                    </div>
                    <button type="button" onClick={addDomainMembership} disabled={isPending}
                      style={{
                        padding:'0 14px', borderRadius:'10px', border:'none', flexShrink:0,
                        background:'rgba(249,115,22,0.1)', color:'#f97316', fontWeight:600, fontSize:'13px',
                        cursor:'pointer', fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                        opacity: isPending ? 0.6 : 1,
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}
              </div>

              {panelError && (
                <div role="alert" style={{ padding:'10px 14px', borderRadius:'12px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>
                  {panelError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
