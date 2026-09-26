'use client';

import { useState, useTransition } from 'react';
import { createPersonalNoteAction, deletePersonalNoteAction } from '@/app/emp-dash/actions';
import { Combobox, PersonCombobox } from './combobox';
import { useEscapeToClose } from './use-escape-to-close';
import type { EmpPersonalNote, EmpProfile, EmpTask, NoteVisibility } from '@/lib/supabase/types';

type NoteWithRelations = EmpPersonalNote & {
  about_profile: Pick<EmpProfile, 'id' | 'full_name'> | null;
  task: Pick<EmpTask, 'id' | 'title'> | null;
};

interface NotesClientProps {
  notes: NoteWithRelations[];
  profiles: Pick<EmpProfile, 'id' | 'full_name'>[];
  tasks: Pick<EmpTask, 'id' | 'title'>[];
  currentUserId: string;
}

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'10px 14px', borderRadius:'10px', boxSizing:'border-box',
  border:'1px solid rgba(0,0,0,0.1)', background:'white',
  fontSize:'14px', color:'#111', outline:'none',
  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day:'numeric', month:'short', year:'2-digit', hour:'2-digit', minute:'2-digit' });
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function NotesClient({ notes, profiles, tasks, currentUserId }: NotesClientProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [body, setBody] = useState('');
  const [aboutProfileId, setAboutProfileId] = useState('');
  const [taskId, setTaskId] = useState('');
  const [visibility, setVisibility] = useState<NoteVisibility>('private');
  const [filterProfile, setFilterProfile] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  useEscapeToClose(showCreate, () => { setShowCreate(false); setError(null); });

  const filtered = notes.filter(n => {
    if (filterProfile && n.about_profile_id !== filterProfile) return false;
    return true;
  });

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createPersonalNoteAction(
        body,
        aboutProfileId || null,
        taskId || null,
        visibility,
      );
      if (result?.error) { setError(result.error); return; }
      setBody(''); setAboutProfileId(''); setTaskId(''); setVisibility('private');
      setShowCreate(false);
    });
  }

  function handleDelete(noteId: string) {
    startTransition(async () => {
      const result = await deletePersonalNoteAction(noteId);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <h1 style={{ fontSize:'22px', fontWeight:700, color:'#111', letterSpacing:'-0.3px', margin:0 }}>Personal Notes</h1>
          <p style={{ fontSize:'14px', color:'#9ca3af', marginTop:'4px' }}>
            Private notes about team members and tasks. Only visible to you and senior staff.
          </p>
        </div>
        <button
          id="new-note-btn"
          onClick={() => setShowCreate(true)}
          style={{
            display:'inline-flex', alignItems:'center', gap:'6px',
            padding:'10px 20px', borderRadius:'12px',
            background:'linear-gradient(135deg,#f97316,#f43f5e)',
            color:'white', fontWeight:600, fontSize:'14px',
            border:'none', cursor:'pointer',
            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
            boxShadow:'0 2px 8px rgba(249,115,22,0.3)',
          }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Note
        </button>
      </div>

      {/* Privacy reminder */}
      <div style={{
        padding:'12px 16px', borderRadius:'14px',
        background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)',
        fontSize:'13px', color:'#92400e', display:'flex', alignItems:'flex-start', gap:'10px',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:'1px' }}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        <span>
          Notes are <strong>never visible to the person they're about</strong>, even if their role changes later. 
          &lsquo;Upward&rsquo; visibility means senior staff in the same domain can also see the note.
        </span>
      </div>

      {/* Filter */}
      {profiles.length > 0 && (
        <div style={{ maxWidth:'280px' }}>
          <PersonCombobox
            id="notes-filter-person"
            people={profiles}
            value={filterProfile}
            onChange={setFilterProfile}
            emptyOptionLabel="All people"
            placeholder="Filter by person…"
          />
        </div>
      )}

      {error && (
        <div role="alert" style={{ padding:'12px 16px', borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>
          {error}
        </div>
      )}

      {/* Notes list */}
      {filtered.length === 0 ? (
        <div style={{
          textAlign:'center', padding:'60px 20px',
          background:'rgba(255,255,255,0.5)', borderRadius:'16px', border:'1px dashed rgba(0,0,0,0.1)',
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display:'block', margin:'0 auto 12px' }}>
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          <p style={{ fontSize:'14px', color:'#9ca3af', margin:0 }}>No notes yet. Create one to get started.</p>
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
          {filtered.map(note => (
            <NoteCard
              key={note.id}
              note={note}
              isOwn={note.author_id === currentUserId}
              onDelete={() => handleDelete(note.id)}
              isPending={isPending}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div style={{
          position:'fixed', inset:0, zIndex:50,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.2)', backdropFilter:'blur(4px)',
          padding:'24px 16px',
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="note-form-title" style={{
            width:'100%', maxWidth:'500px', maxHeight:'calc(100vh - 48px)',
            background:'rgba(255,255,255,0.92)', backdropFilter:'blur(20px)',
            borderRadius:'20px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
            border:'1px solid rgba(255,255,255,0.7)',
            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
            display:'flex', flexDirection:'column', overflow:'hidden',
          }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'28px 28px 0', flexShrink:0 }}>
              <h2 id="note-form-title" style={{ fontSize:'18px', fontWeight:700, color:'#111', margin:0 }}>New Personal Note</h2>
              <button onClick={() => { setShowCreate(false); setError(null); }}
                style={{ width:'32px', height:'32px', borderRadius:'8px', border:'none', cursor:'pointer', background:'transparent', display:'flex', alignItems:'center', justifyContent:'center', color:'#9ca3af' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', minHeight:0, flex:1 }}>
            <div style={{ padding:'20px 28px 28px', display:'flex', flexDirection:'column', gap:'16px', overflowY:'auto', overscrollBehavior:'contain', minHeight:0, flex:1 }}>
              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Note
                </label>
                <textarea
                  id="note-body"
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  rows={4}
                  required
                  placeholder="Write your note…"
                  style={{ ...inputStyle, resize:'vertical', minHeight:'100px' }}
                />
              </div>

              <div className="ed-modal-field-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    About Person (optional)
                  </label>
                  <PersonCombobox
                    id="note-about"
                    people={profiles}
                    value={aboutProfileId}
                    onChange={setAboutProfileId}
                    emptyOptionLabel="Nobody specific"
                  />
                </div>

                <div>
                  <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                    Linked Task (optional)
                  </label>
                  <Combobox
                    id="note-task"
                    options={tasks.map(t => ({ id: t.id, label: t.title }))}
                    value={taskId}
                    onChange={setTaskId}
                    emptyOptionLabel="No task"
                  />
                </div>
              </div>

              <div>
                <label style={{ display:'block', fontSize:'12px', fontWeight:600, color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                  Visibility
                </label>
                <div style={{ display:'flex', gap:'8px' }}>
                  {(['private', 'upward'] as NoteVisibility[]).map(v => (
                    <button
                      key={v} type="button"
                      onClick={() => setVisibility(v)}
                      style={{
                        flex:1, padding:'8px 12px', borderRadius:'10px', fontSize:'13px', fontWeight:500,
                        cursor:'pointer', fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                        display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'6px',
                        border: visibility === v ? '1.5px solid #f97316' : '1px solid rgba(0,0,0,0.1)',
                        background: visibility === v ? 'rgba(249,115,22,0.06)' : 'white',
                        color: visibility === v ? '#f97316' : '#6b7280',
                        transition:'all 0.12s',
                      }}
                    >
                      {v === 'private' ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      ) : (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
                      )}
                      {v === 'private' ? 'Private' : 'Upward'}
                    </button>
                  ))}
                </div>
                <p style={{ fontSize:'11px', color:'#9ca3af', marginTop:'6px' }}>
                  {visibility === 'private'
                    ? 'Only you and admin+ can see this note.'
                    : 'You, admin+, and domain heads of your domain can see this note.'}
                </p>
              </div>
            </div>

            <div style={{ padding:'0 28px 28px', flexShrink:0, display:'flex', flexDirection:'column', gap:'12px' }}>
              {error && (
                <div role="alert" style={{ padding:'10px 14px', borderRadius:'12px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>
                  {error}
                </div>
              )}

              <div style={{ display:'flex', gap:'12px' }}>
                <button type="button" onClick={() => setShowCreate(false)}
                  style={{
                    flex:1, padding:'10px', borderRadius:'12px',
                    border:'1px solid rgba(0,0,0,0.1)', background:'transparent',
                    fontSize:'14px', color:'#6b7280', cursor:'pointer',
                    fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                  }}>
                  Cancel
                </button>
                <button type="submit" disabled={isPending || !body.trim()} id="save-note-btn"
                  style={{
                    flex:1, padding:'10px', borderRadius:'12px',
                    background:'linear-gradient(135deg,#f97316,#f43f5e)',
                    color:'white', fontWeight:600, fontSize:'14px',
                    border:'none', cursor:'pointer',
                    fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                    opacity: (isPending || !body.trim()) ? 0.6 : 1,
                  }}>
                  {isPending ? 'Saving…' : 'Save Note'}
                </button>
              </div>
            </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NoteCard({ note, isOwn, onDelete, isPending }: {
  note: NoteWithRelations; isOwn: boolean;
  onDelete: () => void; isPending: boolean;
}) {
  const [hover, setHover] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setConfirmDelete(false); }}
      style={{
        background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)',
        borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)',
        padding:'20px', transition:'box-shadow 0.15s',
        boxShadow: hover ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 4px rgba(0,0,0,0.05)',
      }}
    >
      <div style={{ display:'flex', alignItems:'flex-start', gap:'12px' }}>
        <div style={{ flex:1 }}>
          {/* Meta row */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap', marginBottom:'10px' }}>
            {note.about_profile && (
              <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                <div style={{
                  width:'22px', height:'22px', borderRadius:'50%',
                  background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'9px', fontWeight:700, color:'#f97316',
                }}>
                  {getInitials(note.about_profile.full_name)}
                </div>
                <span style={{ fontSize:'12px', fontWeight:600, color:'#374151' }}>
                  Re: {note.about_profile.full_name}
                </span>
              </div>
            )}
            {note.task && (
              <span style={{
                display:'inline-flex', alignItems:'center', gap:'4px',
                fontSize:'11px', padding:'2px 8px', borderRadius:'6px',
                background:'rgba(249,115,22,0.08)', color:'#f97316', fontWeight:500,
                border:'1px solid rgba(249,115,22,0.15)',
              }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                {note.task.title}
              </span>
            )}
            <span style={{
              display:'inline-flex', alignItems:'center', gap:'4px',
              fontSize:'10px', padding:'2px 8px', borderRadius:'6px',
              background: note.visibility_scope === 'private' ? '#f9fafb' : '#fffbeb',
              color: note.visibility_scope === 'private' ? '#6b7280' : '#d97706',
              border: `1px solid ${note.visibility_scope === 'private' ? '#e5e7eb' : '#fde68a'}`,
              fontWeight:600,
            }}>
              {note.visibility_scope === 'private' ? (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              ) : (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>
              )}
              {note.visibility_scope === 'private' ? 'Private' : 'Upward'}
            </span>
          </div>

          {/* Body */}
          <p style={{ fontSize:'14px', color:'#374151', lineHeight:1.6, margin:0, whiteSpace:'pre-wrap' }}>
            {note.body}
          </p>

          {/* Footer */}
          <div style={{ marginTop:'10px', fontSize:'11px', color:'#9ca3af' }}>
            {formatDate(note.created_at)}
          </div>
        </div>

        {/* Delete (own notes only) */}
        {isOwn && hover && (
          !confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              disabled={isPending}
              style={{
                padding:'6px', borderRadius:'8px', border:'none',
                cursor:'pointer', background:'transparent', color:'#d1d5db',
                transition:'color 0.12s', flexShrink:0,
              }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#ef4444'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#d1d5db'}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          ) : (
            <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
              <button onClick={onDelete} disabled={isPending}
                style={{
                  padding:'4px 10px', borderRadius:'8px', border:'none',
                  background:'#ef4444', color:'white', fontSize:'12px', fontWeight:600,
                  cursor:'pointer', fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                }}>
                Delete
              </button>
              <button onClick={() => setConfirmDelete(false)}
                style={{
                  padding:'4px 10px', borderRadius:'8px',
                  border:'1px solid rgba(0,0,0,0.1)', background:'white',
                  fontSize:'12px', color:'#6b7280', cursor:'pointer',
                  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                }}>
                Cancel
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
