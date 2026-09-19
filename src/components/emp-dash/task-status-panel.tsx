'use client';

import { useState, useTransition } from 'react';
import { updateTaskStatusAction, claimTaskReviewAction, releaseTaskReviewAction } from '@/app/emp-dash/actions';
import type { TaskStatus } from '@/lib/supabase/types';

interface TaskStatusPanelProps {
  taskId: string;
  currentStatus: TaskStatus;
  isAssignee: boolean;
  canVerify: boolean;
  reviewerName: string | null;
  currentUserId: string;
  reviewingBy: string | null;
  isReviewer: boolean;
  lockIsStale: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string; border: string }> = {
  draft:                { label: 'Draft',       color: '#6b7280', bg: '#f3f4f6',  dot: '#9ca3af', border: '#e5e7eb' },
  not_started:          { label: 'Not Started', color: '#6b7280', bg: '#f9fafb',  dot: '#9ca3af', border: '#e5e7eb' },
  in_progress:          { label: 'In Progress', color: '#2563eb', bg: '#eff6ff',  dot: '#3b82f6', border: '#bfdbfe' },
  submitted_for_review: { label: 'In Review',   color: '#d97706', bg: '#fffbeb',  dot: '#f59e0b', border: '#fde68a' },
  completed:            { label: 'Completed',   color: '#059669', bg: '#ecfdf5',  dot: '#10b981', border: '#a7f3d0' },
};

export function TaskStatusPanel({
  taskId, currentStatus, isAssignee, canVerify, reviewerName,
  currentUserId, reviewingBy, isReviewer, lockIsStale,
}: TaskStatusPanelProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [returnComment, setReturnComment] = useState('');
  const [showReturn, setShowReturn] = useState(false);

  const config = STATUS_CONFIG[currentStatus] ?? STATUS_CONFIG.not_started;

  function transition(newStatus: TaskStatus, comment?: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, newStatus, comment);
      if (result?.error) setError(result.error);
    });
  }

  function claimReview() {
    setError(null);
    startTransition(async () => {
      const result = await claimTaskReviewAction(taskId);
      if (result?.error) setError(result.error);
    });
  }

  function releaseReview() {
    setError(null);
    startTransition(async () => {
      const result = await releaseTaskReviewAction(taskId);
      if (result?.error) setError(result.error);
    });
  }

  const actionBtnBase: React.CSSProperties = {
    width:'100%', padding:'10px', borderRadius:'12px',
    fontSize:'13px', fontWeight:600, cursor:'pointer',
    fontFamily:"'Outfit','Inter',system-ui,sans-serif",
    display:'flex', alignItems:'center', justifyContent:'center', gap:'8px',
    border:'1px solid', transition:'background 0.12s, opacity 0.12s',
    opacity: isPending ? 0.5 : 1,
  };

  // Determine if this reviewer can claim despite lock (stale or unclaimed)
  const canClaim = canVerify && currentStatus === 'submitted_for_review' &&
    (!reviewingBy || lockIsStale) && !isReviewer;

  return (
    <div style={{
      background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)',
      borderRadius:'16px', border:'1px solid rgba(255,255,255,0.8)',
      padding:'20px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
      display:'flex', flexDirection:'column', gap:'14px',
    }}>
      <h3 style={{ fontSize:'10px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.06em', margin:0 }}>Status</h3>

      {/* Current status pill */}
      <div style={{
        display:'flex', alignItems:'center', gap:'10px',
        padding:'12px 16px', borderRadius:'12px',
        background:config.bg, border:`1px solid ${config.border}`, color:config.color,
      }}>
        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:config.dot }} />
        <span style={{ fontSize:'14px', fontWeight:700 }}>{config.label}</span>
      </div>

      {/* Reviewer notice (for non-reviewing viewer) */}
      {currentStatus === 'submitted_for_review' && reviewerName && !isReviewer && (
        <div style={{
          display:'flex', alignItems:'center', gap:'6px',
          fontSize:'12px', color:'#d97706', background:'#fffbeb',
          borderRadius:'10px', padding:'8px 12px', border:'1px solid #fde68a',
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          Under review by <strong style={{ marginLeft:'2px' }}>{reviewerName}</strong>
          {lockIsStale && <span style={{ color:'#dc2626', marginLeft:'4px' }}>(stale)</span>}
        </div>
      )}

      {error && (
        <div role="alert" style={{
          display:'flex', alignItems:'flex-start', gap:'6px',
          padding:'10px 12px', borderRadius:'10px',
          background:'#fff1f2', border:'1px solid #fecdd3', color:'#dc2626', fontSize:'12px',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop:'1px', flexShrink:0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Assignee actions */}
      {isAssignee && currentStatus === 'not_started' && (
        <button onClick={() => transition('in_progress')} disabled={isPending} id="status-start-btn"
          style={{ ...actionBtnBase, background:'#eff6ff', borderColor:'#bfdbfe', color:'#2563eb' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          Start Working
        </button>
      )}

      {isAssignee && currentStatus === 'in_progress' && (
        <button onClick={() => transition('submitted_for_review')} disabled={isPending} id="status-submit-btn"
          style={{ ...actionBtnBase, background:'#fffbeb', borderColor:'#fde68a', color:'#d97706' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          Submit for Review
        </button>
      )}

      {/* Domain Head / Admin actions */}
      {canVerify && currentStatus === 'submitted_for_review' && (
        <>
          {canClaim && (
            <button onClick={claimReview} disabled={isPending} id="claim-review-btn"
              style={{ ...actionBtnBase, background:'#f9fafb', borderColor:'#e5e7eb', color:'#6b7280' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              {lockIsStale ? 'Take Over Review' : 'Claim Review'}
            </button>
          )}

          {isReviewer && (
            <button onClick={releaseReview} disabled={isPending} id="release-review-btn"
              style={{ ...actionBtnBase, background:'#fff7ed', borderColor:'#fed7aa', color:'#ea580c' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>
              Release Lock
            </button>
          )}

          <button onClick={() => transition('completed')} disabled={isPending} id="approve-task-btn"
            style={{ ...actionBtnBase, background:'#ecfdf5', borderColor:'#a7f3d0', color:'#059669' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            Approve & Complete
          </button>

          {!showReturn ? (
            <button onClick={() => setShowReturn(true)} disabled={isPending} id="return-task-btn"
              style={{ ...actionBtnBase, background:'#fff1f2', borderColor:'#fecdd3', color:'#dc2626' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
              Request Changes
            </button>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              <textarea
                value={returnComment}
                onChange={e => setReturnComment(e.target.value)}
                placeholder="Explain what changes are needed (required)…"
                rows={3}
                id="return-comment-input"
                style={{
                  width:'100%', padding:'10px 14px', borderRadius:'10px',
                  border:'1px solid #fecdd3', background:'#fff8f8',
                  fontSize:'13px', color:'#111', outline:'none', resize:'none',
                  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                  boxSizing:'border-box',
                }}
              />
              <div style={{ display:'flex', gap:'8px' }}>
                <button type="button" onClick={() => setShowReturn(false)}
                  style={{ ...actionBtnBase, flex:1, background:'transparent', borderColor:'rgba(0,0,0,0.1)', color:'#6b7280' }}>
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (returnComment.trim()) { transition('in_progress', returnComment); setShowReturn(false); }
                    else setError('Comment is required when returning a task.');
                  }}
                  disabled={isPending}
                  id="confirm-return-btn"
                  style={{ ...actionBtnBase, flex:1, background:'#ef4444', borderColor:'#ef4444', color:'white' }}>
                  Send Back
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
