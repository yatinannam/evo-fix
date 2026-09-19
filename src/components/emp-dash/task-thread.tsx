'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import { addCommentAction } from '@/app/emp-dash/actions';
import type { EmpTaskComment, EmpProfile } from '@/lib/supabase/types';
import { getEmpDashBrowserClient } from '@/lib/supabase/client';

type CommentWithAuthor = EmpTaskComment & { emp_profiles: Pick<EmpProfile, 'full_name'> };

interface TaskThreadProps {
  taskId: string;
  initialComments: CommentWithAuthor[];
  currentUserId: string;
  currentUserName: string;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' });
}

function initials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

export function TaskThread({ taskId, initialComments, currentUserId, currentUserName }: TaskThreadProps) {
  const [comments, setComments] = useState<CommentWithAuthor[]>(initialComments);
  const [body, setBody] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = getEmpDashBrowserClient();
    const channel = supabase
      .channel(`task-comments-${taskId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'emp_task_comments', filter: `task_id=eq.${taskId}`,
      }, async payload => {
        const { data: author } = await supabase.from('emp_profiles').select('full_name').eq('id', payload.new.author_id).single();
        const newComment = { ...payload.new, emp_profiles: author ?? { full_name: 'Unknown' } } as CommentWithAuthor;
        setComments(prev => {
          if (prev.find(c => c.id === newComment.id)) return prev;
          return [...prev, newComment];
        });
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [taskId]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setError(null);

    const optimistic: CommentWithAuthor = {
      id: `opt-${Date.now()}`,
      task_id: taskId, author_id: currentUserId, body: body.trim(),
      attachments: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
      emp_profiles: { full_name: currentUserName },
    };
    setComments(prev => [...prev, optimistic]);
    const draft = body;
    setBody('');

    startTransition(async () => {
      const result = await addCommentAction(taskId, draft);
      if (result?.error) {
        setError(result.error);
        setComments(prev => prev.filter(c => c.id !== optimistic.id));
        setBody(draft);
      }
    });
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      <h3 style={{ fontSize:'13px', fontWeight:700, color:'#374151', margin:0 }}>Thread</h3>

      {/* Comments list */}
      <div style={{ display:'flex', flexDirection:'column', gap:'12px', maxHeight:'300px', overflowY:'auto', paddingRight:'4px' }}>
        {comments.length === 0 && (
          <p style={{ fontSize:'14px', color:'#9ca3af', textAlign:'center', padding:'20px 0' }}>No comments yet. Start the discussion.</p>
        )}
        {comments.map(comment => {
          const isOwn = comment.author_id === currentUserId;
          return (
            <div key={comment.id} style={{ display:'flex', gap:'10px', flexDirection: isOwn ? 'row-reverse' : 'row' }}>
              <div style={{
                width:'28px', height:'28px', borderRadius:'50%', flexShrink:0,
                background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:'11px', fontWeight:700, color:'#f97316',
              }}>
                {initials(comment.emp_profiles.full_name)}
              </div>
              <div style={{ maxWidth:'75%', display:'flex', flexDirection:'column', gap:'2px', alignItems: isOwn ? 'flex-end' : 'flex-start' }}>
                <span style={{ fontSize:'10px', color:'#9ca3af' }}>{isOwn ? 'You' : comment.emp_profiles.full_name} · {formatTime(comment.created_at)}</span>
                <div style={{
                  padding:'10px 14px', borderRadius:'16px', fontSize:'14px', lineHeight:1.5, color:'#111',
                  background: isOwn ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.82)',
                  border: isOwn ? '1px solid rgba(249,115,22,0.15)' : '1px solid rgba(0,0,0,0.06)',
                  borderTopRightRadius: isOwn ? '4px' : '16px',
                  borderTopLeftRadius: isOwn ? '16px' : '4px',
                  boxShadow: isOwn ? 'none' : '0 1px 3px rgba(0,0,0,0.04)',
                }}>
                  {comment.body}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Compose */}
      {error && (
        <div role="alert" style={{ padding:'8px 12px', borderRadius:'10px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#dc2626', fontSize:'12px' }}>{error}</div>
      )}
      <form onSubmit={handleSubmit} style={{ display:'flex', gap:'8px' }}>
        <input
          value={body}
          onChange={e => setBody(e.target.value)}
          disabled={isPending}
          id="task-comment-input"
          placeholder="Add a comment… (use @name to mention)"
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent); } }}
          style={{
            flex:1, padding:'10px 14px', borderRadius:'12px',
            border:'1px solid rgba(0,0,0,0.1)', background:'white',
            fontSize:'14px', color:'#111', outline:'none',
            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
            opacity: isPending ? 0.5 : 1,
          }}
        />
        <button
          type="submit" disabled={isPending || !body.trim()} id="task-comment-submit"
          style={{
            padding:'10px 16px', borderRadius:'12px',
            background:'linear-gradient(135deg,#f97316,#f43f5e)',
            color:'white', border:'none', cursor:'pointer',
            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
            opacity: (isPending || !body.trim()) ? 0.5 : 1,
            transition:'opacity 0.15s',
          }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
      </form>
    </div>
  );
}
