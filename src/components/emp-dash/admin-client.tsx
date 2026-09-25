// @ts-nocheck
'use client';

import { useState, useTransition } from 'react';
import { getEmpDashBrowserClient } from '@/lib/supabase/client';
import type { EmpDomain, EmpProfile, EmpRole, AuditAction } from '@/lib/supabase/types';
import { useRouter } from 'next/navigation';

interface DomainAdminRow {
  id: string; domain_id: string; admin_profile_id: string;
  emp_domains: { name: string }; emp_profiles: { full_name: string; email: string };
}
interface StatusHistoryRow {
  id: string; from_status: string | null; to_status: string; created_at: string; comment: string | null;
  emp_profiles: { full_name: string } | null;
  emp_tasks: { title: string; emp_domains: { name: string } } | null;
}
interface AuditLogRow {
  id: string; actor_id: string; action: AuditAction; target: Record<string, unknown>; created_at: string;
  emp_profiles: { full_name: string } | null;
}
interface UserDomainRow {
  id: string; profile_id: string; domain_id: string; role_in_domain: string; created_at: string;
  emp_profiles: { full_name: string } | null;
  emp_domains: { name: string } | null;
}

interface AdminClientProps {
  domainAdminMap: DomainAdminRow[]; domains: EmpDomain[];
  adminProfiles: (EmpProfile & { emp_roles: Pick<EmpRole, 'name'> })[];
  statusHistory: StatusHistoryRow[]; userDomains: UserDomainRow[];
  auditLogEntries: AuditLogRow[]; isSuperAdmin: boolean;
}

const STATUS_LABEL: Record<string, string> = {
  not_started: 'Not started', in_progress: 'In progress',
  submitted_for_review: 'In review', completed: 'Completed',
};

const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  profile_created: 'created a profile',
  role_changed: "changed a profile's role",
  super_admin_created: 'created a new Super Admin',
  domain_reassigned: 'reassigned a domain',
  task_created: 'created a task',
  status_changed: 'changed a task status',
};

function describeAuditTarget(entry: AuditLogRow): string {
  const t = entry.target ?? {};
  switch (entry.action) {
    case 'role_changed':
      return `${(t.old_role as string) ?? '—'} → ${(t.new_role as string) ?? '—'}`;
    case 'profile_created':
    case 'super_admin_created':
      return `${(t.email as string) ?? '—'} (${(t.role as string) ?? '—'})`;
    case 'task_created':
      return `"${(t.title as string) ?? '—'}"`;
    case 'status_changed':
      return `${(t.from_status as string) ?? '—'} → ${(t.to_status as string) ?? '—'}`;
    case 'domain_reassigned':
      return '';
    default:
      return '';
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day:'numeric', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit' });
}

const selectStyle: React.CSSProperties = {
  width:'100%', padding:'8px 12px', borderRadius:'10px',
  border:'1px solid rgba(0,0,0,0.1)', background:'white',
  fontSize:'13px', color:'#111', outline:'none',
  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
  WebkitAppearance:'none', appearance:'none',
};

export function AdminClient({ domainAdminMap, domains, adminProfiles, statusHistory, userDomains, auditLogEntries, isSuperAdmin }: AdminClientProps) {
  const [tab, setTab] = useState<'domain-map' | 'user-domains' | 'status-history' | 'audit-log'>('domain-map');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const [newDomainId, setNewDomainId] = useState(domains[0]?.id ?? '');
  const [newAdminId, setNewAdminId] = useState('');
  const [newMemberProfileId, setNewMemberProfileId] = useState('');
  const [newMemberDomainId, setNewMemberDomainId]   = useState(domains[0]?.id ?? '');
  const [newMemberRole, setNewMemberRole] = useState<'head' | 'member'>('member');

  const adminAndAbove = adminProfiles.filter(p => p.emp_roles.name === 'admin' || p.emp_roles.name === 'super_admin');

  function feedback(msg: string, isError = false) {
    if (isError) { setError(msg); setSuccess(null); }
    else { setSuccess(msg); setError(null); }
    setTimeout(() => { setError(null); setSuccess(null); }, 4000);
  }

  function addDomainAdmin() {
    if (!newDomainId || !newAdminId) return;
    setError(null);
    startTransition(async () => {
      const supabase = getEmpDashBrowserClient();
      const { error: err } = await supabase.from('emp_domain_admin_map').insert({ domain_id: newDomainId, admin_profile_id: newAdminId });
      if (err) feedback(err.message, true); else { feedback('Mapping added'); router.refresh(); }
    });
  }

  function removeDomainAdmin(id: string) {
    startTransition(async () => {
      const supabase = getEmpDashBrowserClient();
      const { error: err } = await supabase.from('emp_domain_admin_map').delete().eq('id', id);
      if (err) feedback(err.message, true); else { feedback('Mapping removed'); router.refresh(); }
    });
  }

  function addUserDomain() {
    if (!newMemberProfileId || !newMemberDomainId) return;
    startTransition(async () => {
      const supabase = getEmpDashBrowserClient();
      const { error: err } = await supabase.from('emp_user_domains').insert({
        profile_id: newMemberProfileId, domain_id: newMemberDomainId, role_in_domain: newMemberRole,
      });
      if (err) feedback(err.message, true); else { feedback('Member added to domain'); router.refresh(); }
    });
  }

  function removeUserDomain(id: string) {
    startTransition(async () => {
      const supabase = getEmpDashBrowserClient();
      const { error: err } = await supabase.from('emp_user_domains').delete().eq('id', id);
      if (err) feedback(err.message, true); else { feedback('Removed'); router.refresh(); }
    });
  }

  const TAB_ITEMS = [
    { key: 'domain-map' as const, label: 'Domain → Admin' },
    { key: 'user-domains' as const, label: 'Domain Members' },
    { key: 'status-history' as const, label: 'Status Changes' },
    { key: 'audit-log' as const, label: 'Audit Log' },
  ];

  const addBtnStyle: React.CSSProperties = {
    display:'inline-flex', alignItems:'center', gap:'6px',
    padding:'8px 16px', borderRadius:'10px',
    background:'rgba(249,115,22,0.1)', color:'#f97316',
    border:'1px solid rgba(249,115,22,0.2)',
    fontSize:'13px', fontWeight:600, cursor:'pointer',
    fontFamily:"'Outfit','Inter',system-ui,sans-serif",
    transition:'background 0.12s',
    opacity: isPending ? 0.5 : 1,
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize:'22px', fontWeight:700, color:'#111', letterSpacing:'-0.3px', margin:0 }}>Admin</h1>
        <p style={{ fontSize:'14px', color:'#9ca3af', marginTop:'4px' }}>Domain ownership, membership, and audit log</p>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', background:'rgba(255,255,255,0.6)', border:'1px solid rgba(0,0,0,0.08)', borderRadius:'12px', padding:'4px', width:'fit-content' }}>
        {TAB_ITEMS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            style={{
              fontSize:'12px', padding:'8px 16px', borderRadius:'8px', fontWeight:600,
              cursor:'pointer', border:'none',
              fontFamily:"'Outfit','Inter',system-ui,sans-serif",
              background: tab === t.key ? 'white' : 'transparent',
              color: tab === t.key ? '#111' : '#9ca3af',
              boxShadow: tab === t.key ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
              transition:'all 0.15s',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Notifications */}
      {error && <div role="alert" style={{ padding:'12px 16px', borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>{error}</div>}
      {success && <div style={{ padding:'12px 16px', borderRadius:'14px', background:'#ecfdf5', border:'1px solid #a7f3d0', color:'#059669', fontSize:'13px' }}>{success}</div>}

      {/* Domain → Admin tab */}
      {tab === 'domain-map' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <p style={{ fontSize:'13px', color:'#6b7280' }}>Which admin owns each domain. Editable here — never hardcoded.</p>

          <div style={{
            display:'flex', gap:'12px', alignItems:'flex-end',
            background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)',
            borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)',
            padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ flex:1 }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:'#9ca3af', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Domain</label>
              <select value={newDomainId} onChange={e => setNewDomainId(e.target.value)} style={selectStyle}>
                {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div style={{ flex:1 }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:'#9ca3af', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Admin</label>
              <select value={newAdminId} onChange={e => setNewAdminId(e.target.value)} style={selectStyle}>
                <option value="">Select admin…</option>
                {adminAndAbove.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <button onClick={addDomainAdmin} disabled={isPending || !newAdminId} id="add-domain-admin-btn" style={addBtnStyle}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(249,115,22,0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(249,115,22,0.1)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add
            </button>
          </div>

          {/* Table */}
          <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <table style={{ width:'100%', fontSize:'13px', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(249,250,251,0.8)' }}>
                  <th style={{ padding:'12px 20px', textAlign:'left', fontSize:'10px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>Domain</th>
                  <th style={{ padding:'12px 20px', textAlign:'left', fontSize:'10px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>Admin</th>
                  <th style={{ padding:'12px 20px', textAlign:'left', fontSize:'10px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>Email</th>
                  <th style={{ padding:'12px', width:'40px' }} />
                </tr>
              </thead>
              <tbody>
                {domainAdminMap.length === 0 && <tr><td colSpan={4} style={{ padding:'32px 20px', textAlign:'center', color:'#9ca3af' }}>No mappings yet.</td></tr>}
                {domainAdminMap.map(row => (
                  <tr key={row.id} style={{ borderTop:'1px solid rgba(0,0,0,0.05)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background='rgba(0,0,0,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background='transparent'}
                  >
                    <td style={{ padding:'12px 20px', fontWeight:600, color:'#111' }}>{row.emp_domains.name}</td>
                    <td style={{ padding:'12px 20px', color:'#374151' }}>{row.emp_profiles.full_name}</td>
                    <td style={{ padding:'12px 20px', color:'#9ca3af', fontSize:'12px' }}>{row.emp_profiles.email}</td>
                    <td style={{ padding:'12px' }}>
                      <button onClick={() => removeDomainAdmin(row.id)} disabled={isPending}
                        style={{ padding:'6px', borderRadius:'6px', border:'none', cursor:'pointer', background:'transparent', color:'#d1d5db', transition:'color 0.12s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#ef4444'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#d1d5db'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User → Domain tab */}
      {tab === 'user-domains' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{
            display:'flex', gap:'12px', alignItems:'flex-end',
            background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)',
            borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)',
            padding:'16px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
          }}>
            <div style={{ flex:1 }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:'#9ca3af', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Person</label>
              <select value={newMemberProfileId} onChange={e => setNewMemberProfileId(e.target.value)} style={selectStyle}>
                <option value="">Select person…</option>
                {adminProfiles.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <div style={{ flex:1 }}>
              <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:'#9ca3af', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Domain</label>
              <select value={newMemberDomainId} onChange={e => setNewMemberDomainId(e.target.value)} style={selectStyle}>
                {domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display:'block', fontSize:'11px', fontWeight:600, color:'#9ca3af', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>Role</label>
              <select value={newMemberRole} onChange={e => setNewMemberRole(e.target.value as 'head' | 'member')} style={selectStyle}>
                <option value="member">Member</option>
                <option value="head">Head</option>
              </select>
            </div>
            <button onClick={addUserDomain} disabled={isPending || !newMemberProfileId} id="add-domain-member-btn" style={addBtnStyle}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(249,115,22,0.15)'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background='rgba(249,115,22,0.1)'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add
            </button>
          </div>

          <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
            <table style={{ width:'100%', fontSize:'13px', borderCollapse:'collapse' }}>
              <thead>
                <tr style={{ background:'rgba(249,250,251,0.8)' }}>
                  <th style={{ padding:'12px 20px', textAlign:'left', fontSize:'10px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>Person</th>
                  <th style={{ padding:'12px 20px', textAlign:'left', fontSize:'10px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>Domain</th>
                  <th style={{ padding:'12px 20px', textAlign:'left', fontSize:'10px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>Role</th>
                  <th style={{ padding:'12px', width:'40px' }} />
                </tr>
              </thead>
              <tbody>
                {userDomains.length === 0 && <tr><td colSpan={4} style={{ padding:'32px 20px', textAlign:'center', color:'#9ca3af' }}>No assignments yet.</td></tr>}
                {userDomains.map(row => (
                  <tr key={row.id} style={{ borderTop:'1px solid rgba(0,0,0,0.05)' }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background='rgba(0,0,0,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background='transparent'}
                  >
                    <td style={{ padding:'12px 20px', fontWeight:600, color:'#111' }}>{row.emp_profiles?.full_name}</td>
                    <td style={{ padding:'12px 20px', color:'#374151' }}>{row.emp_domains?.name}</td>
                    <td style={{ padding:'12px 20px' }}>
                      <span style={{
                        fontSize:'11px', padding:'3px 10px', borderRadius:'8px', fontWeight:600,
                        background: row.role_in_domain === 'head' ? '#fffbeb' : '#f9fafb',
                        color: row.role_in_domain === 'head' ? '#d97706' : '#6b7280',
                        border: row.role_in_domain === 'head' ? '1px solid #fde68a' : '1px solid #e5e7eb',
                      }}>
                        {row.role_in_domain}
                      </span>
                    </td>
                    <td style={{ padding:'12px' }}>
                      <button onClick={() => removeUserDomain(row.id)} disabled={isPending}
                        style={{ padding:'6px', borderRadius:'6px', border:'none', cursor:'pointer', background:'transparent', color:'#d1d5db', transition:'color 0.12s' }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#ef4444'}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#d1d5db'}
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Status Changes tab (emp_task_status_history) */}
      {tab === 'status-history' && (
        <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(0,0,0,0.05)', fontSize:'10px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            Last 50 Status Changes
          </div>
          <div>
            {statusHistory.length === 0 && <div style={{ padding:'40px 20px', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>No activity yet.</div>}
            {statusHistory.map(entry => (
              <div key={entry.id}
                style={{ padding:'14px 20px', display:'flex', alignItems:'flex-start', gap:'12px', borderTop:'1px solid rgba(0,0,0,0.04)', transition:'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background='rgba(0,0,0,0.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background='transparent'}
              >
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#f43f5e)', marginTop:'8px', flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'13px', color:'#374151', lineHeight:1.5 }}>
                    <span style={{ fontWeight:600, color:'#111' }}>{entry.emp_profiles?.full_name ?? 'Unknown'}</span>{' '}
                    changed <span style={{ fontWeight:600, color:'#111' }}>{entry.emp_tasks?.title ?? '—'}</span>
                    {' '}<span style={{ color:'#9ca3af' }}>({entry.emp_tasks?.emp_domains?.name ?? '—'})</span>
                    {entry.from_status && <> from <em style={{ color:'#6b7280' }}>{STATUS_LABEL[entry.from_status]}</em></>}
                    {' '}→ <strong style={{ color:'#f97316' }}>{STATUS_LABEL[entry.to_status]}</strong>
                  </div>
                  {entry.comment && <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'2px', fontStyle:'italic' }}>&ldquo;{entry.comment}&rdquo;</div>}
                  <div style={{ fontSize:'10px', color:'#9ca3af', marginTop:'3px' }}>{formatDate(entry.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log tab (emp_audit_log — the real audit trail) */}
      {tab === 'audit-log' && (
        <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)', borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)', overflow:'hidden', boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(0,0,0,0.05)', fontSize:'10px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em' }}>
            Last 50 Audit Entries
          </div>
          <div>
            {auditLogEntries.length === 0 && <div style={{ padding:'40px 20px', textAlign:'center', color:'#9ca3af', fontSize:'14px' }}>No activity yet.</div>}
            {auditLogEntries.map(entry => (
              <div key={entry.id}
                style={{ padding:'14px 20px', display:'flex', alignItems:'flex-start', gap:'12px', borderTop:'1px solid rgba(0,0,0,0.04)', transition:'background 0.12s' }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background='rgba(0,0,0,0.02)'}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background='transparent'}
              >
                <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'linear-gradient(135deg,#f97316,#f43f5e)', marginTop:'8px', flexShrink:0 }} />
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'13px', color:'#374151', lineHeight:1.5 }}>
                    <span style={{ fontWeight:600, color:'#111' }}>{entry.emp_profiles?.full_name ?? 'Unknown'}</span>{' '}
                    {AUDIT_ACTION_LABEL[entry.action] ?? entry.action}
                    {describeAuditTarget(entry) && <> — <strong style={{ color:'#f97316' }}>{describeAuditTarget(entry)}</strong></>}
                  </div>
                  <div style={{ fontSize:'10px', color:'#9ca3af', marginTop:'3px' }}>{formatDate(entry.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
