'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export interface ComboboxOption {
  id: string;
  label: string;
  /** Initials to render in a small avatar circle (people). Omit for plain rows (domains, roles, tasks). */
  avatarText?: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  emptyOptionLabel?: string;
  id?: string;
  disabled?: boolean;
  /** Suppress the pinned "clear selection" row — use for mandatory fields (e.g. a required 2-option choice) where there's no real empty state. */
  hideEmptyOption?: boolean;
}

/**
 * The one dropdown component for all of emp-dash — type-to-filter, consistent
 * styling everywhere. Renders its open popup through a portal into
 * document.body, positioned with getBoundingClientRect(), specifically to
 * avoid a real CSS bug: several emp-dash cards use backdrop-filter for the
 * glass effect, and backdrop-filter/filter create a new stacking context —
 * so a plain position:absolute + z-index popup nested inside one of those
 * cards can never paint above a later sibling card, no matter how high its
 * z-index is (the z-index only wins *within* that stacking context). A
 * portal sidesteps this entirely by rendering outside all of it.
 */
export function Combobox({ options, value, onChange, placeholder, emptyOptionLabel = 'Select…', id, disabled, hideEmptyOption }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.id === value);
  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  function openDropdown() {
    if (disabled) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    setOpen(true);
  }

  function close() {
    setOpen(false);
    setQuery('');
  }

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (buttonRef.current?.contains(target)) return;
      if (popupRef.current?.contains(target)) return;
      close();
    }
    function onScrollOrResize() { close(); }
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('scroll', onScrollOrResize, true);
    window.addEventListener('resize', onScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('scroll', onScrollOrResize, true);
      window.removeEventListener('resize', onScrollOrResize);
    };
  }, [open]);

  function select(id: string) {
    onChange(id);
    close();
  }

  return (
    <div style={{ position:'relative', fontFamily:"'Outfit','Inter',system-ui,sans-serif" }}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => (open ? close() : openDropdown())}
        style={{
          width:'100%', padding:'10px 12px', borderRadius:'10px', boxSizing:'border-box',
          border:'1px solid rgba(0,0,0,0.1)', background: disabled ? '#f3f4f6' : 'white',
          fontSize:'14px', color: selected ? '#111' : '#9ca3af', textAlign:'left',
          cursor: disabled ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', gap:'8px',
          fontFamily:"'Outfit','Inter',system-ui,sans-serif",
        }}
      >
        <span style={{ display:'flex', alignItems:'center', gap:'8px', overflow:'hidden' }}>
          {selected?.avatarText && (
            <span style={{
              width:'20px', height:'20px', borderRadius:'50%', flexShrink:0,
              background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'9px', fontWeight:700, color:'#f97316',
            }}>{selected.avatarText}</span>
          )}
          <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {selected ? selected.label : (placeholder ?? emptyOptionLabel)}
          </span>
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, transform: open ? 'rotate(180deg)' : 'none', transition:'transform 0.12s' }}><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {open && coords && createPortal(
        <div
          ref={popupRef}
          style={{
            position:'fixed', top:coords.top, left:coords.left, width:coords.width, zIndex:1000,
            background:'white', borderRadius:'12px', border:'1px solid rgba(0,0,0,0.1)',
            boxShadow:'0 8px 24px rgba(0,0,0,0.15)', overflow:'hidden',
            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
          }}
        >
          <div style={{ padding:'8px', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
            <input
              autoFocus
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder={placeholder ?? 'Search…'}
              style={{
                width:'100%', padding:'8px 10px', borderRadius:'8px',
                border:'1px solid rgba(0,0,0,0.08)', background:'#f9fafb',
                fontSize:'13px', color:'#111', outline:'none', boxSizing:'border-box',
                fontFamily:"'Outfit','Inter',system-ui,sans-serif",
              }}
            />
          </div>
          <div style={{ maxHeight:'220px', overflowY:'auto' }}>
            {!hideEmptyOption && (
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
            )}
            {filtered.length === 0 && (
              <div style={{ padding:'14px', textAlign:'center', fontSize:'12px', color:'#9ca3af' }}>No matches.</div>
            )}
            {filtered.map(o => (
              <button
                key={o.id}
                type="button"
                onClick={() => select(o.id)}
                style={{
                  width:'100%', padding:'8px 14px', textAlign:'left',
                  display:'flex', alignItems:'center', gap:'8px',
                  border:'none', background: value === o.id ? 'rgba(249,115,22,0.06)' : 'transparent',
                  color: value === o.id ? '#f97316' : '#374151', cursor:'pointer', fontSize:'13px',
                  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                }}
                onMouseEnter={e => { if (value !== o.id) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0.03)'; }}
                onMouseLeave={e => { if (value !== o.id) (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
              >
                {o.avatarText && (
                  <span style={{
                    width:'20px', height:'20px', borderRadius:'50%', flexShrink:0,
                    background:'linear-gradient(135deg,#ffedd5,#ffe4e6)',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'9px', fontWeight:700, color:'#f97316',
                  }}>{o.avatarText}</span>
                )}
                {o.label}
              </button>
            ))}
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
}

/** Convenience wrapper for the common "pick a person" case. */
export function PersonCombobox({ people, value, onChange, placeholder, emptyOptionLabel, id, disabled }: {
  people: { id: string; full_name: string }[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  emptyOptionLabel?: string;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <Combobox
      id={id}
      options={people.map(p => ({ id: p.id, label: p.full_name, avatarText: getInitials(p.full_name) }))}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      emptyOptionLabel={emptyOptionLabel ?? 'Select…'}
      disabled={disabled}
    />
  );
}
