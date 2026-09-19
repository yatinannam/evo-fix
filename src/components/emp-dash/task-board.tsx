'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import { updateTaskStatusAction } from '@/app/emp-dash/actions';
import type { EmpTask, EmpDomain, EmpProfile, TaskStatus } from '@/lib/supabase/types';

type TaskWithRelations = EmpTask & {
  emp_domains: Pick<EmpDomain, 'name' | 'slug'>;
  assignees: Pick<EmpProfile, 'id' | 'full_name'>[];
};

interface TaskBoardProps {
  tasks: TaskWithRelations[];
  viewMode: 'kanban' | 'list' | 'calendar';
  currentUserId: string;
  roleName: string;
  userDomainIds: string[];
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

  if (mode === 'list') {
    return (
      <Link href={`/emp-dash/tasks/${task.id}`} style={{ textDecoration:'none' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:'14px',
          background:'rgba(255,255,255,0.72)', backdropFilter:'blur(8px)',
          borderRadius:'14px', border:'1px solid rgba(255,255,255,0.8)',
          padding:'14px 18px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
          transition:'box-shadow 0.15s, transform 0.1s', cursor:'pointer',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; }}
        >
          <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:PRIORITY_DOT[task.priority], flexShrink:0 }} />
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:'14px', fontWeight:600, color:'#111', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{task.title}</div>
            <div style={{ fontSize:'12px', color:'#9ca3af', marginTop:'2px' }}>{task.emp_domains.name}</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'8px', flexShrink:0 }}>
            {stale && <span style={{ fontSize:'11px', color:'#dc2626', background:'#fff1f2', padding:'2px 8px', borderRadius:'6px', border:'1px solid #fecdd3', fontWeight:600 }}>⚠ Overdue</span>}
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
        background:'rgba(255,255,255,0.82)', backdropFilter:'blur(8px)',
        borderRadius:'12px', border:'1px solid rgba(255,255,255,0.8)',
        padding:'14px', boxShadow:'0 1px 4px rgba(0,0,0,0.05)',
        transition:'box-shadow 0.15s, transform 0.1s', cursor:'pointer',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 4px 12px rgba(0,0,0,0.1)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(-1px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow='0 1px 4px rgba(0,0,0,0.05)'; (e.currentTarget as HTMLDivElement).style.transform='translateY(0)'; }}
      >
        {/* Top row: priority dot + domain */}
        <div style={{ display:'flex', alignItems:'center', gap:'6px', marginBottom:'8px' }}>
          <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:PRIORITY_DOT[task.priority], flexShrink:0 }} />
          {stale && <span style={{ fontSize:'10px', color:'#dc2626' }}>⚠</span>}
          <span style={{ fontSize:'10px', color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.05em', fontWeight:600 }}>{task.emp_domains.name}</span>
        </div>
        <div style={{ fontSize:'13px', fontWeight:600, color:'#111', lineHeight:1.4, marginBottom:'8px' }}>{task.title}</div>
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

// ── Calendar view ─────────────────────────────────────────────────────────────
function CalendarView({ tasks }: { tasks: TaskWithRelations[] }) {
  const today = new Date();
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - today.getDay());
  const days = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d; });

  function tasksForDay(day: Date) {
    return tasks.filter(t => t.deadline && new Date(t.deadline).toDateString() === day.toDateString());
  }

  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(7, 1fr)', gap:'8px' }}>
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
              {dayTasks.map(t => (
                <Link key={t.id} href={`/emp-dash/tasks/${t.id}`}
                  style={{
                    fontSize:'10px', padding:'4px 8px', borderRadius:'8px',
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap',
                    textDecoration:'none', color:'#374151', fontWeight:500,
                    background:'rgba(255,255,255,0.7)', border:'1px solid rgba(0,0,0,0.06)',
                    display:'block',
                  }}
                  title={t.title}
                >
                  <span style={{ display:'inline-block', width:'5px', height:'5px', borderRadius:'50%', background:PRIORITY_DOT[t.priority], marginRight:'4px', verticalAlign:'middle' }} />
                  {t.title}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Main Board ────────────────────────────────────────────────────────────────
export function TaskBoard({ tasks, viewMode, currentUserId, roleName, userDomainIds }: TaskBoardProps) {
  const [optimisticTasks, setOptimisticTasks] = useState(tasks);
  const [dragError, setDragError] = useState<string | null>(null);

  function getTasksByStatus(status: TaskStatus) {
    return optimisticTasks.filter(t => t.status === status);
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

  // Kanban
  return (
    <div>
      {dragError && <div role="alert" style={{ padding:'12px 16px', borderRadius:'14px', background:'#fff1f2', border:'1px solid #fecdd3', color:'#e11d48', fontSize:'13px', marginBottom:'16px' }}>{dragError}</div>}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:'16px' }}>
        {COLUMNS.map(col => {
          const colTasks = getTasksByStatus(col.status);
          return (
            <div key={col.status} style={{ borderRadius:'16px', padding:'12px', minHeight:'200px', background:col.bgColor }}>
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
                {colTasks.map(t => <TaskCard key={t.id} task={t} mode="kanban" />)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
