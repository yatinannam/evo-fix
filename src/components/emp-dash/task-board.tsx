'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  DndContext, DragOverlay, useDraggable, useDroppable,
  useSensor, useSensors, MouseSensor, TouchSensor,
  type DragStartEvent, type DragEndEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { updateTaskStatusAction } from '@/app/emp-dash/actions';
import { useEscapeToClose } from './use-escape-to-close';
import { backendChecklistComplete } from '@/lib/emp-dash/domain-fields';
import type { EmpTask, EmpDomain, EmpProfile, TaskStatus } from '@/lib/supabase/types';

type TaskWithRelations = EmpTask & {
  emp_domains: Pick<EmpDomain, 'name' | 'slug'>;
  assignees: Pick<EmpProfile, 'id' | 'full_name'>[];
};

interface TaskBoardProps {
  tasks: TaskWithRelations[];
  viewMode: 'kanban' | 'list' | 'calendar';
  currentUserId: string;
  isAdminPlus: boolean;
  /** Domains where the current user's role_in_domain is 'head' — distinct from
   * plain membership, since only heads (or admins) can verify/approve tasks. */
  headDomainIds: string[];
}

// ── Drag-and-drop transition rules ─────────────────────────────────────────
// Mirrors enforce_task_status_transition()'s WHO/WHAT rules exactly, purely
// for UI purposes (which columns a card can be dropped on, and whether a
// drag should even be allowed to start) — the DB trigger remains the actual
// security boundary regardless of what this computes.

function canVerifyTaskDomain(domainId: string, isAdminPlus: boolean, headDomainIds: string[]) {
  return isAdminPlus || headDomainIds.includes(domainId);
}

/** Statuses this task could legally be dropped on, for this user, right now. */
function possibleNextStatuses(
  task: TaskWithRelations,
  currentUserId: string,
  isAdminPlus: boolean,
  headDomainIds: string[],
): TaskStatus[] {
  const isAssignee = task.assignees.some(a => a.id === currentUserId);
  const canVerify = canVerifyTaskDomain(task.domain_id, isAdminPlus, headDomainIds);

  switch (task.status) {
    case 'not_started':
      return (isAssignee || canVerify) ? ['in_progress'] : [];
    case 'in_progress': {
      if (!isAssignee) return [];
      // Backend Dev's pre-submit checklist gate — same rule the DB trigger
      // enforces, checked here too so an incomplete card can't even start a
      // drag toward "In Review" only to be rejected on drop.
      if (task.emp_domains.slug === 'backend_dev' && !backendChecklistComplete(task.custom_fields as Record<string, unknown>)) {
        return [];
      }
      return ['submitted_for_review'];
    }
    case 'submitted_for_review': {
      if (!canVerify) return [];
      // A live (non-stale, <2h) claim held by someone else blocks non-admins.
      const lockedByOther = !isAdminPlus && task.reviewing_by && task.reviewing_by !== currentUserId
        && task.reviewing_since && (Date.now() - new Date(task.reviewing_since).getTime()) < 2 * 60 * 60 * 1000;
      if (lockedByOther) return [];
      return ['completed', 'in_progress'];
    }
    default:
      return [];
  }
}

const COLUMNS: { status: TaskStatus; label: string; dotColor: string; bgColor: string; headerColor: string }[] = [
  { status: 'not_started',          label: 'Not Started', dotColor: '#9ca3af', bgColor: 'rgba(249,250,251,0.6)', headerColor: '#6b7280' },
  { status: 'in_progress',          label: 'In Progress', dotColor: '#3b82f6', bgColor: 'rgba(239,246,255,0.6)', headerColor: '#2563eb' },
  { status: 'submitted_for_review', label: 'In Review',   dotColor: '#f59e0b', bgColor: 'rgba(255,251,235,0.6)', headerColor: '#d97706' },
  { status: 'completed',            label: 'Completed',   dotColor: '#10b981', bgColor: 'rgba(236,253,245,0.6)', headerColor: '#059669' },
];

const PRIORITY_DOT: Record<string, string> = {
  urgent: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#d1d5db',
};

function isOverdue48h(updatedAt: string) {
  return (Date.now() - new Date(updatedAt).getTime()) > 48 * 60 * 60 * 1000;
}

// Deadline-urgency traffic light — layered on top of the status badges/
// priority dots/48h-in-review badge above, never replacing them. Both can
// show on the same card at once (e.g. a stale review that's also overdue).
type DeadlineUrgency = 'overdue' | 'completed' | 'normal';
function deadlineUrgency(task: Pick<EmpTask, 'deadline' | 'status'>): DeadlineUrgency {
  if (task.status === 'completed') return 'completed';
  if (task.deadline && new Date(task.deadline).getTime() < Date.now()) return 'overdue';
  return 'normal';
}
const URGENCY_STYLE: Record<DeadlineUrgency, { bg: string; border: string }> = {
  overdue:   { bg: '#fff1f2', border: '#fecdd3' },
  completed: { bg: '#ecfdf5', border: '#a7f3d0' },
  normal:    { bg: '', border: '' }, // unchanged — caller keeps its own default
};

function formatDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const STATUS_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  not_started:          { label: 'Not Started',  color: '#6b7280', bg: '#f9fafb' },
  in_progress:          { label: 'In Progress',  color: '#2563eb', bg: '#eff6ff' },
  submitted_for_review: { label: 'In Review',    color: '#d97706', bg: '#fffbeb' },
  completed:            { label: 'Completed',    color: '#059669', bg: '#ecfdf5' },
};

// ── Task Card (shared between kanban + list) ──────────────────────────────────
function TaskCard({ task, mode }: { task: TaskWithRelations; mode: 'kanban' | 'list' }) {
  const stale = task.status === 'submitted_for_review' && isOverdue48h(task.updated_at);
  const sm = STATUS_LABEL[task.status];
  const urgency = deadlineUrgency(task);
  const us = URGENCY_STYLE[urgency];

  if (mode === 'list') {
    return (
      <Link href={`/emp-dash/tasks/${task.id}`} style={{ textDecoration:'none' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:'14px',
          background: urgency === 'normal' ? 'rgba(255,255,255,0.72)' : us.bg,
          backdropFilter:'blur(8px)',
          borderRadius:'14px', border: `1px solid ${urgency === 'normal' ? 'rgba(255,255,255,0.8)' : us.border}`,
          padding:'14px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
          transition:'box-shadow 0.15s, transform 0.1s', cursor:'pointer',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; }}
        >
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:PRIORITY_DOT[task.priority], flexShrink:0 }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{
              fontSize:'14px', fontWeight:600, color: urgency === 'completed' ? '#6b7280' : '#111',
              textDecoration: urgency === 'completed' ? 'line-through' : 'none',
              overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
            }}>{task.title}</div>
            <div style={{ fontSize:'12px', color:'#9ca3af', marginTop:'2px' }}>{task.emp_domains.name}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
            {stale && (
              <span style={{ display:'inline-flex', alignItems:'center', gap:'3px', fontSize:'11px', color:'#dc2626', background:'#fff1f2', padding:'2px 8px', borderRadius:'6px', border:'1px solid #fecdd3', fontWeight:600 }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Overdue
              </span>
            )}
            <span style={{ fontSize:'11px', fontWeight:600, padding:'3px 10px', borderRadius:'8px', background:sm?.bg, color:sm?.color }}>{sm?.label}</span>
            <span style={{ fontSize:'12px', color:'#9ca3af', minWidth:'50px', textAlign:'right' }}>{formatDate(task.deadline)}</span>
          </div>
        </div>
      </Link>
    );
  }

  // Kanban card
  return (
    <Link href={`/emp-dash/tasks/${task.id}`} style={{ textDecoration:'none', display:'block' }}>
      <div style={{
        background: urgency === 'normal' ? 'rgba(255,255,255,0.82)' : us.bg,
        backdropFilter:'blur(8px)',
        borderRadius:'12px', border: `1px solid ${urgency === 'normal' ? 'rgba(255,255,255,0.8)' : us.border}`,
        padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
        transition:'box-shadow 0.15s, transform 0.1s', cursor:'pointer',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; }}
      >
        {/* Top row: priority dot + domain */}
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:PRIORITY_DOT[task.priority], flexShrink:0 }} />
          {stale && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          )}
          <span style={{ fontSize:'10px', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 }}>{task.emp_domains.name}</span>
        </div>
        <div style={{
          fontSize:'13px', fontWeight:600, color: urgency === 'completed' ? '#6b7280' : '#111',
          textDecoration: urgency === 'completed' ? 'line-through' : 'none',
          lineHeight:1.4, marginBottom:'8px',
        }}>{task.title}</div>
        {/* Bottom row: date + assignees */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {task.deadline && (
            <div style={{ display:'flex', alignItems:'center', gap:'4px', fontSize:'11px', color:'#9ca3af' }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {formatDate(task.deadline)}
            </div>
          )}
          {task.assignees.length > 0 && (
            <div style={{ display:'flex' }}>
              {task.assignees.slice(0, 3).map((a, i) => (
                <div key={a.id} title={a.full_name} style={{
                  width:'22px', height:'22px', borderRadius:'50%',
                  background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
                  border:'2px solid white',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'9px', fontWeight:700, color:'#f97316',
                  marginLeft: i > 0 ? '-6px' : '0',
                  zIndex: 3 - i,
                  position:'relative',
                }}>
                  {a.full_name[0]}
                </div>
              ))}
              {task.assignees.length > 3 && (
                <div style={{ width:'22px', height:'22px', borderRadius:'50%', background:'#f3f4f6', border:'2px solid white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'9px', color:'#6b7280', marginLeft:'-6px' }}>
                  +{task.assignees.length - 3}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Drag-and-drop wrappers (kanban only) ──────────────────────────────────────

function DraggableTaskCard({ task, canDrag }: { task: TaskWithRelations; canDrag: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !canDrag,
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        opacity: isDragging ? 0.4 : 1,
        touchAction: canDrag ? 'none' : undefined, // let ungrabbable cards keep native touch-scroll
        cursor: canDrag ? 'grab' : undefined,
      }}
    >
      <TaskCard task={task} mode="kanban" />
    </div>
  );
}

function DroppableColumn({ status, isDropTarget, isDraggingAny, children }: {
  status: TaskStatus; isDropTarget: boolean; isDraggingAny: boolean; children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  return (
    <div
      ref={setNodeRef}
      style={{
        outline: isOver && isDropTarget ? '2px solid #f97316' : isOver && isDraggingAny ? '2px solid #fecaca' : 'none',
        outlineOffset: '-2px',
        borderRadius: '16px',
        opacity: isDraggingAny && !isDropTarget ? 0.55 : 1,
        transition: 'opacity 0.15s, outline-color 0.15s',
      }}
    >
      {children}
    </div>
  );
}

// ── Calendar view ─────────────────────────────────────────────────────────────
function CalendarView({ tasks }: { tasks: TaskWithRelations[] }) {
  const today = new Date();
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });

  function tasksForDay(day: Date) {
    return tasks.filter(t => t.deadline && new Date(t.deadline).toDateString() === day.toDateString());
  }

  return (
    <div className="ed-calendar-grid" style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'8px' }}>
      {days.map(day => {
        const dayTasks = tasksForDay(day);
        const isToday = day.toDateString() === today.toDateString();
        return (
          <div key={day.toDateString()} style={{ minHeight:'120px' }}>
            <div style={{
              textAlign:'center', padding:'8px', borderRadius:'10px', marginBottom:'8px',
              background: isToday ? 'rgba(249,115,22,0.1)' : 'transparent',
            }}>
              <div style={{ fontSize:'11px', fontWeight:600, color: isToday ? '#f97316' : '#9ca3af' }}>
                {day.toLocaleDateString('en-IN', { weekday: 'short' })}
              </div>
              <div style={{ fontSize:'16px', fontWeight:700, color: isToday ? '#f97316' : '#374151' }}>
                {day.getDate()}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
              {dayTasks.map(t => {
                const urgency = deadlineUrgency(t);
                const us = URGENCY_STYLE[urgency];
                return (
                  <Link key={t.id} href={`/emp-dash/tasks/${t.id}`}
                    style={{
                      fontSize:'10px', padding:'4px 8px', borderRadius:'8px',
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                      textDecoration: urgency === 'completed' ? 'line-through' : 'none',
                      color: urgency === 'completed' ? '#6b7280' : '#374151', fontWeight:500,
                      background: urgency === 'normal' ? 'rgba(255,255,255,0.7)' : us.bg,
                      border: `1px solid ${urgency === 'normal' ? 'rgba(0,0,0,0.06)' : us.border}`,
                      display:'block',
                    }}
                    title={t.title}
                  >
                    <span style={{ display:'inline-block', width:'5px', height:'5px', borderRadius:'50%', background:PRIORITY_DOT[t.priority], marginRight:'4px', verticalAlign:'middle' }} />
                    {t.title}
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Board ────────────────────────────────────────────────────────────────
export function TaskBoard({ tasks, viewMode, currentUserId, isAdminPlus, headDomainIds }: TaskBoardProps) {
  const router = useRouter();
  const [optimisticTasks, setOptimisticTasks] = useState(tasks);
  const [dragError, setDragError] = useState<string | null>(null);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  // Set when a drop targets the "return to in_progress" transition, which
  // requires a mandatory comment (enforced at the DB level) — collected via
  // a small prompt instead of submitting immediately on drop.
  const [pendingReturn, setPendingReturn] = useState<{ taskId: string; taskTitle: string } | null>(null);
  const [returnComment, setReturnComment] = useState('');
  useEscapeToClose(!!pendingReturn, () => { setPendingReturn(null); setReturnComment(''); });

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    // Delay-based (not distance-based) for touch so a normal scroll gesture
    // isn't mistaken for a drag — the standard dnd-kit pattern for mobile.
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  function getTasksByStatus(status: TaskStatus) {
    return optimisticTasks.filter(t => t.status === status);
  }

  const activeTask = activeTaskId ? optimisticTasks.find(t => t.id === activeTaskId) ?? null : null;
  const validTargets = activeTask ? possibleNextStatuses(activeTask, currentUserId, isAdminPlus, headDomainIds) : [];

  function applyStatusChange(taskId: string, newStatus: TaskStatus, comment?: string) {
    const previous = optimisticTasks;
    setOptimisticTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
    setDragError(null);
    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, newStatus, comment);
      if (result?.error) {
        setOptimisticTasks(previous); // revert the optimistic move
        setDragError(result.error);
      } else {
        router.refresh();
      }
    });
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTaskId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    const taskId = String(event.active.id);
    setActiveTaskId(null);
    const task = optimisticTasks.find(t => t.id === taskId);
    if (!task || !event.over) return;

    const targetStatus = event.over.id as TaskStatus;
    if (targetStatus === task.status) return; // dropped back on its own column
    if (!possibleNextStatuses(task, currentUserId, isAdminPlus, headDomainIds).includes(targetStatus)) return; // invalid — snaps back automatically

    if (task.status === 'submitted_for_review' && targetStatus === 'in_progress') {
      setPendingReturn({ taskId, taskTitle: task.title });
      return;
    }
    applyStatusChange(taskId, targetStatus);
  }

  function confirmReturn() {
    if (!pendingReturn || !returnComment.trim()) return;
    applyStatusChange(pendingReturn.taskId, 'in_progress', returnComment.trim());
    setPendingReturn(null);
    setReturnComment('');
  }

  if (viewMode === 'calendar') return <CalendarView tasks={optimisticTasks} />;

  if (viewMode === 'list') {
    return (
      <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
        {dragError && <div role="alert" style={{ padding:'12px 16px', borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px' }}>{dragError}</div>}
        {optimisticTasks.length === 0 && <div style={{ textAlign:'center', color:'#9ca3af', padding:'48px 0' }}>No tasks yet.</div>}
        {optimisticTasks.map(t => <TaskCard key={t.id} task={t} mode="list" />)}
      </div>
    );
  }

  // Kanban — a flex row that scrolls horizontally when columns don't fit
  // (any viewport width, not just a breakpoint): flex:'1 0 240px' lets
  // columns grow to fill wide screens but never shrink below 240px, so a
  // narrow/mobile viewport naturally becomes a swipeable strip instead of
  // cramming 4 columns into no space.
  return (
    <div>
      {dragError && <div role="alert" style={{ padding:'12px 16px', borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px', marginBottom:'16px' }}>{dragError}</div>}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div style={{ display:'flex', gap:'16px', overflowX:'auto', paddingBottom:'8px' }}>
          {COLUMNS.map(col => {
            const colTasks = getTasksByStatus(col.status);
            const isDropTarget = validTargets.includes(col.status);
            return (
              <div key={col.status} style={{ flex:'1 0 240px', minWidth:0 }}>
                <DroppableColumn status={col.status} isDropTarget={isDropTarget} isDraggingAny={!!activeTask}>
                  <div style={{ borderRadius:'16px', padding:'12px', minHeight:'200px', background:col.bgColor }}>
                    <div style={{
                      display:'flex', alignItems:'center', justifyContent:'space-between',
                      padding:'4px 8px', marginBottom:'12px',
                    }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:col.dotColor }} />
                        <span style={{ fontSize:'12px', fontWeight:700, color:col.headerColor, textTransform:'uppercase', letterSpacing:'0.05em' }}>{col.label}</span>
                      </div>
                      <span style={{ fontSize:'11px', fontWeight:600, background:'rgba(255,255,255,0.6)', borderRadius:'12px', padding:'2px 8px', color:'#6b7280' }}>{colTasks.length}</span>
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                      {colTasks.map(t => (
                        <DraggableTaskCard
                          key={t.id}
                          task={t}
                          canDrag={possibleNextStatuses(t, currentUserId, isAdminPlus, headDomainIds).length > 0}
                        />
                      ))}
                    </div>
                  </div>
                </DroppableColumn>
              </div>
            );
          })}
        </div>
        <DragOverlay>
          {activeTask ? (
            <div style={{ width:'240px', boxShadow:'0 12px 32px rgba(0,0,0,0.18)', borderRadius:'12px', cursor:'grabbing' }}>
              <TaskCard task={activeTask} mode="kanban" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Mandatory-comment prompt for the "return to in progress" drop */}
      {pendingReturn && (
        <div style={{
          position:'fixed', inset:0, zIndex:50,
          display:'flex', alignItems:'center', justifyContent:'center',
          background:'rgba(0,0,0,0.2)', backdropFilter:'blur(4px)', padding:'16px',
        }}>
          <div role="dialog" aria-modal="true" aria-labelledby="return-comment-title" style={{
            width:'100%', maxWidth:'420px',
            background:'rgba(255,255,255,0.95)', backdropFilter:'blur(20px)',
            borderRadius:'20px', boxShadow:'0 20px 60px rgba(0,0,0,0.15)',
            border:'1px solid rgba(255,255,255,0.7)', padding:'24px',
            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
          }}>
            <h2 id="return-comment-title" style={{ fontSize:'16px', fontWeight:700, color:'#111', margin:'0 0 6px' }}>
              Return &ldquo;{pendingReturn.taskTitle}&rdquo; for changes
            </h2>
            <p style={{ fontSize:'12px', color:'#9ca3af', margin:'0 0 14px' }}>A comment explaining what&apos;s needed is required.</p>
            <textarea
              autoFocus
              value={returnComment}
              onChange={e => setReturnComment(e.target.value)}
              placeholder="Explain what changes are needed…"
              rows={3}
              style={{
                width:'100%', padding:'10px 14px', borderRadius:'10px',
                border:'1px solid #fecdd3', background:'#fff8f8', boxSizing:'border-box',
                fontSize:'13px', color:'#111', outline:'none', resize:'none',
                fontFamily:"'Outfit','Inter',system-ui,sans-serif",
              }}
            />
            <div style={{ display:'flex', gap:'10px', marginTop:'14px' }}>
              <button type="button" onClick={() => { setPendingReturn(null); setReturnComment(''); }}
                style={{
                  flex:1, padding:'10px', borderRadius:'12px',
                  border:'1px solid rgba(0,0,0,0.1)', background:'transparent',
                  fontSize:'13px', color:'#6b7280', cursor:'pointer',
                  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                }}>
                Cancel
              </button>
              <button type="button" onClick={confirmReturn} disabled={isPending || !returnComment.trim()}
                style={{
                  flex:1, padding:'10px', borderRadius:'12px', border:'none',
                  background:'#ef4444', color:'white', fontWeight:600, fontSize:'13px',
                  cursor:'pointer', fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                  opacity: (isPending || !returnComment.trim()) ? 0.6 : 1,
                }}>
                Send Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
