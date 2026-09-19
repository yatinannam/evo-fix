'use client';

import { useState } from 'react';
import { TaskForm } from './task-form';
import type { EmpDomain, EmpProfile, FieldDef } from '@/lib/supabase/types';

interface NewTaskButtonProps {
  domains: EmpDomain[];
  profiles: Pick<EmpProfile, 'id' | 'full_name'>[];
  domainFieldMap: Record<string, FieldDef[]>;
}

export function NewTaskButton({ domains, profiles, domainFieldMap }: NewTaskButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        id="new-task-btn"
        onClick={() => setOpen(true)}
        style={{
          display:'inline-flex', alignItems:'center', gap:'6px',
          padding:'10px 20px', borderRadius:'12px',
          background:'linear-gradient(135deg,#f97316,#f43f5e)',
          color:'white', fontWeight:600, fontSize:'14px',
          border:'none', cursor:'pointer',
          fontFamily:"'Outfit','Inter',system-ui,sans-serif",
          boxShadow:'0 2px 8px rgba(249,115,22,0.3)',
          transition:'opacity 0.15s, transform 0.1s, box-shadow 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity='0.92'; (e.currentTarget as HTMLButtonElement).style.transform='translateY(-1px)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity='1'; (e.currentTarget as HTMLButtonElement).style.transform='translateY(0)'; }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Task
      </button>
      {open && (
        <TaskForm
          domains={domains}
          profiles={profiles}
          domainFieldMap={domainFieldMap}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
