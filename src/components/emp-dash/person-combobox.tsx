'use client';

import { useEffect, useRef, useState } from 'react';

interface PersonOption {
  id: string;
  full_name: string;
}

interface PersonComboboxProps {
  people: PersonOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  emptyOptionLabel?: string;
  id?: string;
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

/**
 * Type-to-filter person picker — replaces plain <select> lists of names,
 * which become unusable once there are more than a handful of people.
 * An empty `value` renders as `emptyOptionLabel` (e.g. "Nobody specific").
 */
export function PersonCombobox({ people, value, onChange, placeholder, emptyOptionLabel = 'Select…', id }: PersonComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef<HTMLDivElement>(null);

  const selected = people.find(p => p.id === value);
  const filtered = query.trim()
    ? people.filter(p => p.full_name.toLowerCase().includes(query.trim().toLowerCase()))
    : people;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  function select(id: string) {
    onChange(id);
    setOpen(false);
    setQuery('');
  }

  return (
    <div ref={rootRef} style={{ position:'relative', fontFamily:"'Outfit','Inter',system-ui,sans-serif" }}>
      <button
        type="button"
        id={id}
        onClick={() => setOpen(o => !o)}
        style={{
          width:'100%', padding:'10px 12px', borderRadius:'10px',
          border:'1px solid rgba(0,0,0,0.1)', background:'white',
          fontSize:'14px', color: selected ? '#111' : '#9ca3af', textAlign:'left',
          cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px',
          fontFamily:"'Outfit','Inter',system-ui,sans-serif",
        }}
      >
        <span style={{ display:'flex', alignItems:'center', gap:'8px', overflow:'hidden' }}>
          {selected && (
            <span style={{
              width:'20px', height:'20px', borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'9px', fontWeight:700, color:'#f97316',
            }}>{getInitials(selected.full_name)}</span>
          )}
          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {selected ? selected.full_name : emptyOptionLabel}
          </span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.12s' }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && (
        <div style={{
          position:'absolute', top:'calc(100% + 4px)', left:0, right:0, zIndex:60,
          background:'white', borderRadius:'12px', border:'1px solid rgba(0,0,0,0.1)',
          boxShadow:'0 8px 24px rgba(0,0,0,0.12)', overflow:'hidden',
        }}>
          <div style={{ padding:'8px', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={placeholder ?? 'Search by name…'}
              style={{
                width:'100%', padding:'8px 10px', borderRadius:'8px',
                border:'1px solid rgba(0,0,0,0.08)', background:'#f9fafb',
                fontSize:'13px', color:'#111', outline:'none', boxSizing:'border-box',
                fontFamily:"'Outfit','Inter',system-ui,sans-serif",
              }}
            />
          </div>
          <div style={{ maxHeight:'220px', overflowY:'auto' }}>
            <button
              type="button"
              onClick={() => select('')}
              style={{
                width:'100%', padding:'9px 14px', textAlign:'left', fontSize:'13px',
                border:'none', background: value === '' ? 'rgba(249,115,22,0.06)' : 'transparent',
                color: value === '' ? '#f97316' : '#9ca3af', cursor:'pointer',
                fontFamily:"'Outfit','Inter',system-ui,sans-serif",
              }}
              onMouseEnter={e => { if (value !== '') (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.03)'; }}
              onMouseLeave={e => { if (value !== '') (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
            >
              {emptyOptionLabel}
            </button>
            {filtered.length === 0 && (
              <div style={{ padding:'14px', textAlign:'center', fontSize:'12px', color:'#9ca3af' }}>No matches.</div>
            )}
            {filtered.map(p => (
              <button
                key={p.id}
                type="button"
                onClick={() => select(p.id)}
                style={{
                  width:'100%', padding:'8px 14px', textAlign:'left',
                  display:'flex', alignItems:'center', gap:'8px',
                  border:'none', background: value === p.id ? 'rgba(249,115,22,0.06)' : 'transparent',
                  color: value === p.id ? '#f97316' : '#374151', cursor:'pointer', fontSize:'13px',
                  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                }}
                onMouseEnter={e => { if (value !== p.id) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={e => { if (value !== p.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                <span style={{
                  width:'20px', height:'20px', borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'9px', fontWeight:700, color:'#f97316',
                }}>{getInitials(p.full_name)}</span>
                {p.full_name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
