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
 *
 * Keyboard: ArrowDown/ArrowUp move the highlight (wrapping), Enter selects
 * the highlighted row, Escape closes and returns focus to the trigger.
 */
export function Combobox({ options, value, onChange, placeholder, emptyOptionLabel = 'Select…', id, disabled, hideEmptyOption }: ComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [highlight, setHighlight] = useState(0);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const listboxId = id ? `${id}-listbox` : undefined;

  const selected = options.find(o => o.id === value);
  const filtered = query.trim()
    ? options.filter(o => o.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;
  // Rows in on-screen order: the pinned "clear" row (if shown) is index 0.
  const rowIds = [...(hideEmptyOption ? [] : ['']), ...filtered.map(o => o.id)];
  // Derived, not stored — clamped every render as filtering narrows rowIds,
  // rather than synced via a setState-in-effect (an anti-pattern here).
  const clampedHighlight = Math.min(highlight, Math.max(0, rowIds.length - 1));

  function openDropdown() {
    if (disabled) return;
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    setHighlight(Math.max(0, rowIds.findIndex(id => id === value)));
    setOpen(true);
  }

  function close(returnFocus = false) {
    setOpen(false);
    setQuery('');
    if (returnFocus) buttonRef.current?.focus();
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
    close(true);
  }

  function onSearchKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight(h => (rowIds.length === 0 ? 0 : (h + 1) % rowIds.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight(h => (rowIds.length === 0 ? 0 : (h - 1 + rowIds.length) % rowIds.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const id = rowIds[clampedHighlight];
      if (id !== undefined) select(id);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close(true);
    } else if (e.key === 'Tab') {
      close();
    }
  }

  return (
    <div style={{ position:'relative', fontFamily:"'Outfit','Inter',system-ui,sans-serif" }}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listboxId}
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
          data-lenis-prevent
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
              role="combobox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-activedescendant={rowIds[clampedHighlight] ? `${listboxId}-opt-${rowIds[clampedHighlight]}` : undefined}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder={placeholder ?? 'Search…'}
              style={{
                width:'100%', padding:'8px 10px', borderRadius:'8px',
                border:'1px solid rgba(0,0,0,0.08)', background:'#f9fafb',
                fontSize:'13px', color:'#111', outline:'none', boxSizing:'border-box',
                fontFamily:"'Outfit','Inter',system-ui,sans-serif",
              }}
            />
          </div>
          <div role="listbox" id={listboxId} style={{ maxHeight:'220px', overflowY:'auto' }}>
            {!hideEmptyOption && (
              <button
                type="button"
                role="option"
                id={listboxId ? `${listboxId}-opt-` : undefined}
                aria-selected={value === ''}
                onClick={() => select('')}
                onMouseEnter={() => setHighlight(0)}
                style={{
                  width:'100%', padding:'9px 14px', textAlign:'left', fontSize:'13px',
                  border:'none', cursor:'pointer',
                  background: clampedHighlight === 0 ? 'rgba(0,0,0,0.05)' : value === '' ? 'rgba(249,115,22,0.06)' : 'transparent',
                  color: value === '' ? '#f97316' : '#9ca3af',
                  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                }}
              >
                {emptyOptionLabel}
              </button>
            )}
            {filtered.length === 0 && (
              <div style={{ padding:'14px', textAlign:'center', fontSize:'12px', color:'#9ca3af' }}>No matches.</div>
            )}
            {filtered.map((o, i) => {
              const rowIndex = hideEmptyOption ? i : i + 1;
              return (
                <button
                  key={o.id}
                  type="button"
                  role="option"
                  id={listboxId ? `${listboxId}-opt-${o.id}` : undefined}
                  aria-selected={value === o.id}
                  onClick={() => select(o.id)}
                  onMouseEnter={() => setHighlight(rowIndex)}
                  style={{
                    width:'100%', padding:'8px 14px', textAlign:'left',
                    display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'13px',
                    border:'none',
                    background: clampedHighlight === rowIndex ? 'rgba(0,0,0,0.05)' : value === o.id ? 'rgba(249,115,22,0.06)' : 'transparent',
                    color: value === o.id ? '#f97316' : '#374151',
                    fontFamily:"'Outfit','Inter',system-ui,sans-serif",
                  }}
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
              );
            })}
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
