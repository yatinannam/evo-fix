'use client';

import { useState, useTransition } from 'react';
import { DomainFieldRenderer } from './domain-field-renderer';
import { Combobox } from './combobox';
import { useEscapeToClose } from './use-escape-to-close';
import { createTaskAction } from '@/app/emp-dash/actions';
import type { EmpDomain, EmpProfile, FieldDef, Priority } from '@/lib/supabase/types';

interface TaskFormProps {
  domains: EmpDomain[];
  profiles: Pick<EmpProfile, 'id' | 'full_name'>[];
  domainFieldMap: Record<string, FieldDef[]>;
  onClose?: () => void;
}

interface MilestoneDraft { title: string; due_date: string }

const PRIORITIES: { value: Priority; label: string; color: string; bg: string }[] = [
  { value: 'low',    label: 'Low',    color: '#6b7280', bg: '#f9fafb' },
  { value: 'medium', label: 'Medium', color: '#d97706', bg: '#fffbeb' },
  { value: 'high',   label: 'High',   color: '#ea580c', bg: '#fff7ed' },
  { value: 'urgent', label: 'Urgent', color: '#dc2626', bg: '#fff1f2' },
];

const labelStyle: React.CSSProperties = {
  display:'block', fontSize:'12px', fontWeight:600, color:'#374151',
  marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em',
  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
};

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'10px 14px', borderRadius:'10px',
  border:'1px solid rgba(0,0,0,0.1)', background:'rgba(255,255,255,0.8)',
  fontSize:'14px', color:'#111', outline:'none',
  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
  boxSizing:'border-box',
};

export function TaskForm({ domains, profiles, domainFieldMap, onClose }: TaskFormProps) {
  useEscapeToClose(true, onClose ?? (() => {}));
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [domainId, setDomainId] = useState(domains[0]?.id ?? '');
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [customFields, setCustomFields] = useState<Record<string, unknown>>({});
  const [tags, setTags] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([]);
  const [newMsTitle, setNewMsTitle] = useState('');
  const [newMsDate, setNewMsDate] = useState('');

  const domainFields = domainFieldMap[domainId] ?? [];

  function toggleAssignee(id: string) {
    setAssigneeIds(prev => prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]);
  }

  function addMilestone() {
    if (!newMsTitle.trim()) return;
    setMilestones(prev => [...prev, { title: newMsTitle.trim(), due_date: newMsDate }]);
    setNewMsTitle(''); setNewMsDate('');
  }

  function removeMilestone(idx: number) {
    setMilestones(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set('domain_id', domainId);
    fd.set('priority', priority);
    fd.set('custom_fields', JSON.stringify(customFields));
    fd.set('tags', tags);
    fd.set('milestones', JSON.stringify(milestones));
    assigneeIds.forEach(id => fd.append('assignee_ids', id));

    startTransition(async () => {
      const result = await createTaskAction(fd);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div style={{
      position:'fixed', inset:0, zIndex:50,
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'24px 16px',
      background:'rgba(0,0,0,0.2)', backdropFilter:'blur(4px)',
    }}>
      <div role="dialog" aria-modal="true" aria-labelledby="task-form-title" style={{
        width:'100%', maxWidth:'640px', maxHeight:'calc(100vh - 48px)',
        background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)',
        borderRadius:'20px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
        border:'1px solid rgba(255,255,255,0.7)',
        fontFamily:"'Outfit','Inter',system-ui,sans-serif",
        display:'flex', flexDirection:'column',
        overflow:'hidden',
      }}>
        {/* Header — pinned */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'22px 24px', borderBottom:'1px solid rgba(0,0,0,0.06)',
          flexShrink:0,
        }}>
          <div>
            <h2 id="task-form-title" style={{ fontSize:'18px', fontWeight:700, color:'#111', margin:0 }}>New Task</h2>
            <p style={{ fontSize:'12px', color:'#9ca3af', margin:'2px 0 0' }}>Created as draft, published when saved</p>
          </div>
          {onClose && (
            <button onClick={onClose} style={{
              width:'32px', height:'32px', borderRadius:'8px', border:'none',
              cursor:'pointer', background:'transparent',
              display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af',
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', minHeight:0, flex:1 }}>
        {/* Scrollable body — the header and footer below stay pinned regardless
            of how tall the domain-specific fields make this form */}
        <div style={{ padding:'24px', display:'flex', flexDirection:'column', gap:'20px', overflowY:'auto', overscrollBehavior:'contain', minHeight:0, flex:1 }}>
          {/* Title */}
          <div>
            <label htmlFor="task-title" style={labelStyle}>Title <span style={{ color:'#ef4444' }}>*</span></label>
            <input id="task-title" name="title" required placeholder="What needs to be done?" style={inputStyle} />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="task-desc" style={labelStyle}>Description</label>
            <textarea id="task-desc" name="description" rows={3}
              placeholder="Optional details, context, or links…"
              style={{ ...inputStyle, resize:'vertical', minHeight:'80px' }} />
          </div>

          {/* Domain + Priority */}
          <div className="ed-modal-field-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
            <div>
              <label htmlFor="task-domain" style={labelStyle}>Domain <span style={{ color:'#ef4444' }}>*</span></label>
              <Combobox
                id="task-domain"
                options={domains.map(d => ({ id: d.id, label: d.name }))}
                value={domainId}
                onChange={v => { setDomainId(v); setCustomFields({}); }}
                hideEmptyOption
              />
            </div>
            <div>
              <label style={labelStyle}>Priority</label>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {PRIORITIES.map(p => (
                  <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                    style={{
                      padding:'6px 12px', borderRadius:'8px', fontSize:'12px', fontWeight:600,
                      cursor:'pointer', fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                      border: priority === p.value ? `1.5px solid ${p.color}` : '1px solid rgba(0,0,0,0.1)',
                      color: priority === p.value ? p.color : '#6b7280',
                      background: priority === p.value ? p.bg : 'rgba(255,255,255,0.8)',
                      transition:'all 0.12s',
                    }}>
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label htmlFor="task-deadline" style={labelStyle}>Deadline</label>
            <input id="task-deadline" name="deadline" type="datetime-local"
              style={{ ...inputStyle, maxWidth:'280px' }} />
          </div>

          {/* Assignees */}
          <div>
            <label style={labelStyle}>Assignees</label>
            <div style={{ display:'flex', flexWrap:'wrap', gap:'8px', maxHeight:'144px', overflowY:'auto', overscrollBehavior:'contain' }}>
              {profiles.map(p => (
                <button key={p.id} type="button" onClick={() => toggleAssignee(p.id)}
                  style={{
                    padding:'6px 14px', borderRadius:'20px', fontSize:'13px',
                    cursor:'pointer', fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                    border: assigneeIds.includes(p.id) ? '1.5px solid #f97316' : '1px solid rgba(0,0,0,0.1)',
                    color: assigneeIds.includes(p.id) ? '#f97316' : '#6b7280',
                    background: assigneeIds.includes(p.id) ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.8)',
                    fontWeight: assigneeIds.includes(p.id) ? 600 : 400,
                    transition:'all 0.12s',
                  }}>
                  {p.full_name}
                </button>
              ))}
              {profiles.length === 0 && (
                <p style={{ fontSize:'13px', color:'#9ca3af', margin:0 }}>No team members available</p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div>
            <label htmlFor="task-tags" style={labelStyle}>
              Tags <span style={{ fontWeight:400, color:'#9ca3af', textTransform:'none', letterSpacing:0 }}>(comma-separated)</span>
            </label>
            <input id="task-tags" value={tags} onChange={e => setTags(e.target.value)}
              placeholder="launch, q3, backend" style={inputStyle} />
          </div>

          {/* Milestones */}
          <div>
            <label style={labelStyle}>Milestones</label>
            {milestones.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'10px' }}>
                {milestones.map((m, i) => (
                  <div key={i} style={{
                    display:'flex', alignItems:'center', gap:'8px',
                    padding:'8px 12px', borderRadius:'10px',
                    background:'rgba(249,115,22,0.04)', border:'1px solid rgba(249,115,22,0.12)',
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span style={{ flex:1, fontSize:'13px', color:'#374151', fontWeight:500 }}>{m.title}</span>
                    {m.due_date && <span style={{ fontSize:'11px', color:'#9ca3af' }}>{new Date(m.due_date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>}
                    <button type="button" onClick={() => removeMilestone(i)}
                      style={{ background:'none', border:'none', cursor:'pointer', color:'#d1d5db', padding:'2px' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#ef4444'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#d1d5db'}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <input
                value={newMsTitle} onChange={e => setNewMsTitle(e.target.value)}
                placeholder="Milestone title"
                style={{ ...inputStyle, flex:1 }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addMilestone(); } }}
              />
              <input type="date" value={newMsDate} onChange={e => setNewMsDate(e.target.value)}
                style={{ ...inputStyle, width:'150px' }} />
              <button type="button" onClick={addMilestone}
                style={{
                  padding:'10px 14px', borderRadius:'10px', border:'none',
                  background:'rgba(249,115,22,0.1)', color:'#f97316',
                  cursor:'pointer', fontWeight:600, fontSize:'13px', flexShrink:0,
                  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                }}>
                Add
              </button>
            </div>
          </div>

          {/* Domain-specific fields */}
          {domainFields.length > 0 && (
            <DomainFieldRenderer fields={domainFields} value={customFields} onChange={setCustomFields} />
          )}
        </div>

        {/* Footer — pinned, always reachable regardless of form length */}
        <div style={{
          display:'flex', flexDirection:'column', gap:'12px',
          padding:'16px 24px', borderTop:'1px solid rgba(0,0,0,0.06)',
          flexShrink:0,
        }}>
          {error && (
            <div role="alert" style={{
              padding:'12px 16px', borderRadius:'12px',
              background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px',
            }}>
              {error}
            </div>
          )}

          <div style={{ display:'flex', gap:'12px' }}>
            {onClose && (
              <button type="button" onClick={onClose} style={{
                flex:1, padding:'11px', borderRadius:'12px',
                border:'1px solid rgba(0,0,0,0.1)', background:'transparent',
                fontSize:'14px', color:'#6b7280', cursor:'pointer',
                fontFamily:"'Outfit','Inter',system-ui,sans-serif",
              }}>
                Cancel
              </button>
            )}
            <button type="submit" disabled={isPending} id="create-task-submit"
              style={{
                flex:1, padding:'11px', borderRadius:'12px',
                background: isPending ? 'rgba(249,115,22,0.5)' : 'linear-gradient(135deg,#f97316,#f43f5e)',
                color:'white', fontWeight:600, fontSize:'14px',
                border:'none', cursor: isPending ? 'not-allowed' : 'pointer',
                fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
                boxShadow: isPending ? 'none' : '0 2px 8px rgba(249,115,22,0.3)',
                transition:'all 0.12s',
              }}>
              {isPending ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation:'spin 1s linear infinite' }}><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                  Creating…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  Create Task
                </>
              )}
            </button>
          </div>
        </div>
        </form>
      </div>
    </div>
  );
}
