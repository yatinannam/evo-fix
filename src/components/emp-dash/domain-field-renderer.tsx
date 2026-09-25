'use client';

/**
 * Generic renderer that turns a domain's JSON field schema into real form inputs.
 * This is the ONLY place per-domain UI logic lives — do not add per-domain
 * conditionals anywhere else in the codebase.
 *
 * All styles are inline to prevent global CSS interference from the main site.
 */

import { useState, useEffect } from 'react';
import { Combobox } from './combobox';
import type { FieldDef } from '@/lib/supabase/types';

interface DomainFieldRendererProps {
  fields: FieldDef[];
  value: Record<string, unknown>;
  onChange: (updated: Record<string, unknown>) => void;
  readonly?: boolean;
}

const inputStyle: React.CSSProperties = {
  width:'100%', padding:'9px 12px', borderRadius:'10px',
  border:'1px solid rgba(0,0,0,0.1)', background:'rgba(255,255,255,0.8)',
  fontSize:'13px', color:'#111', outline:'none',
  fontFamily:"'Outfit','Inter',system-ui,sans-serif",
  boxSizing:'border-box',
};

// ── Sub-renderers ─────────────────────────────────────────────────────────────

function TextField({ def, val, onChange, readonly }: { def: FieldDef; val: unknown; onChange: (v: unknown) => void; readonly?: boolean }) {
  return (
    <input type="text" value={String(val ?? '')} onChange={e => onChange(e.target.value)}
      readOnly={readonly} id={`field-${def.key}`} style={{ ...inputStyle, background: readonly ? '#f9fafb' : 'rgba(255,255,255,0.8)' }} />
  );
}

function TextareaField({ def, val, onChange, readonly }: { def: FieldDef; val: unknown; onChange: (v: unknown) => void; readonly?: boolean }) {
  return (
    <textarea value={String(val ?? '')} onChange={e => onChange(e.target.value)}
      readOnly={readonly} id={`field-${def.key}`} rows={4}
      style={{ ...inputStyle, resize:'vertical', minHeight:'80px', background: readonly ? '#f9fafb' : 'rgba(255,255,255,0.8)' }} />
  );
}

function NumberField({ def, val, onChange, readonly }: { def: FieldDef; val: unknown; onChange: (v: unknown) => void; readonly?: boolean }) {
  return (
    <input type="number" value={String(val ?? '')}
      onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      readOnly={readonly} id={`field-${def.key}`}
      style={{ ...inputStyle, background: readonly ? '#f9fafb' : 'rgba(255,255,255,0.8)' }} />
  );
}

function UrlField({ def, val, onChange, readonly }: { def: FieldDef; val: unknown; onChange: (v: unknown) => void; readonly?: boolean }) {
  return (
    <div style={{ display:'flex', gap:'8px' }}>
      <input type="url" value={String(val ?? '')} onChange={e => onChange(e.target.value)}
        readOnly={readonly} id={`field-${def.key}`} placeholder="https://"
        style={{ ...inputStyle, flex:1, background: readonly ? '#f9fafb' : 'rgba(255,255,255,0.8)' }} />
      {typeof val === 'string' && val && (
        <a href={String(val)} target="_blank" rel="noopener noreferrer"
          style={{
            padding:'9px 14px', borderRadius:'10px', fontSize:'12px', fontWeight:500,
            background:'rgba(249,115,22,0.08)', color:'#f97316',
            border:'1px solid rgba(249,115,22,0.15)',
            textDecoration:'none', whiteSpace:'nowrap', display:'flex', alignItems:'center',
          }}>
          Open ↗
        </a>
      )}
    </div>
  );
}

function DateField({ def, val, onChange, readonly }: { def: FieldDef; val: unknown; onChange: (v: unknown) => void; readonly?: boolean }) {
  return (
    <input type="datetime-local" value={String(val ?? '')} onChange={e => onChange(e.target.value)}
      readOnly={readonly} id={`field-${def.key}`}
      style={{ ...inputStyle, maxWidth:'280px', background: readonly ? '#f9fafb' : 'rgba(255,255,255,0.8)' }} />
  );
}

function SelectField({ def, val, onChange, readonly }: { def: FieldDef; val: unknown; onChange: (v: unknown) => void; readonly?: boolean }) {
  return (
    <Combobox
      id={`field-${def.key}`}
      options={(def.options ?? []).map(opt => ({ id: opt, label: opt }))}
      value={String(val ?? '')}
      onChange={v => onChange(v)}
      disabled={readonly}
    />
  );
}

function MultiSelectField({ def, val, onChange, readonly }: { def: FieldDef; val: unknown; onChange: (v: unknown) => void; readonly?: boolean }) {
  const selected = Array.isArray(val) ? (val as string[]) : [];
  function toggle(opt: string) {
    if (readonly) return;
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt]);
  }
  return (
    <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }} id={`field-${def.key}`}>
      {(def.options ?? []).map(opt => (
        <button key={opt} type="button" onClick={() => toggle(opt)} disabled={readonly}
          style={{
            padding:'6px 14px', borderRadius:'20px', fontSize:'12px', cursor: readonly ? 'default' : 'pointer',
            fontFamily:"'Outfit','Inter',system-ui,sans-serif",
            border: selected.includes(opt) ? '1.5px solid #f97316' : '1px solid rgba(0,0,0,0.1)',
            color: selected.includes(opt) ? '#f97316' : '#6b7280',
            background: selected.includes(opt) ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.8)',
            fontWeight: selected.includes(opt) ? 600 : 400,
            transition:'all 0.12s',
          }}>
          {opt}
        </button>
      ))}
    </div>
  );
}

function ChecklistField({ def, val, onChange, readonly }: { def: FieldDef; val: unknown; onChange: (v: unknown) => void; readonly?: boolean }) {
  const checked = Array.isArray(val) ? (val as string[]) : [];
  function toggle(item: string) {
    if (readonly) return;
    onChange(checked.includes(item) ? checked.filter(c => c !== item) : [...checked, item]);
  }
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }} id={`field-${def.key}`}>
      {(def.options ?? []).map(item => (
        <label key={item} style={{ display:'flex', alignItems:'center', gap:'10px', cursor: readonly ? 'default' : 'pointer' }}>
          <div
            onClick={() => toggle(item)}
            style={{
              width:'18px', height:'18px', borderRadius:'5px', flexShrink:0,
              border: checked.includes(item) ? '1.5px solid #f97316' : '1.5px solid rgba(0,0,0,0.15)',
              background: checked.includes(item) ? 'rgba(249,115,22,0.12)' : 'white',
              display:'flex', alignItems:'center', justifyContent:'center', cursor: readonly ? 'default' : 'pointer',
              transition:'all 0.12s',
            }}>
            {checked.includes(item) && (
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="2 6 5 9 10 3"/></svg>
            )}
          </div>
          <span style={{
            fontSize:'13px',
            color: checked.includes(item) ? '#9ca3af' : '#374151',
            textDecoration: checked.includes(item) ? 'line-through' : 'none',
            transition:'all 0.12s',
          }}>
            {item}
          </span>
        </label>
      ))}
    </div>
  );
}

function KeyValueField({ def, val, onChange, readonly }: { def: FieldDef; val: unknown; onChange: (v: unknown) => void; readonly?: boolean }) {
  const entries = typeof val === 'object' && val !== null && !Array.isArray(val) ? (val as Record<string, string>) : {};
  const [pairs, setPairs] = useState(() => Object.entries(entries));

  useEffect(() => {
    const obj: Record<string, string> = {};
    pairs.forEach(([k, v]) => { if (k) obj[k] = v; });
    onChange(obj);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pairs]);

  function updatePair(idx: number, key: string, value: string) {
    setPairs(prev => prev.map((p, i) => i === idx ? [key, value] : p));
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'8px' }} id={`field-${def.key}`}>
      {pairs.map(([k, v], idx) => (
        <div key={idx} style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <input type="text" value={k} placeholder="Metric name" readOnly={readonly}
            onChange={e => updatePair(idx, e.target.value, v)}
            style={{ ...inputStyle, flex:1 }} />
          <input type="text" value={v} placeholder="Value" readOnly={readonly}
            onChange={e => updatePair(idx, k, e.target.value)}
            style={{ ...inputStyle, flex:1 }} />
          {!readonly && (
            <button type="button" onClick={() => setPairs(prev => prev.filter((_, i) => i !== idx))}
              style={{ padding:'6px', background:'none', border:'none', cursor:'pointer', color:'#d1d5db', flexShrink:0 }}
              onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#ef4444'}
              onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#d1d5db'}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          )}
        </div>
      ))}
      {!readonly && (
        <button type="button" onClick={() => setPairs(prev => [...prev, ['', '']])}
          style={{
            display:'inline-flex', alignItems:'center', gap:'6px',
            fontSize:'12px', color:'#f97316', background:'none', border:'none',
            cursor:'pointer', fontFamily:"'Outfit','Inter',system-ui,sans-serif",
            fontWeight:500, padding:'2px 0',
          }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add metric
        </button>
      )}
    </div>
  );
}

function TableField({ def, val, onChange, readonly }: { def: FieldDef; val: unknown; onChange: (v: unknown) => void; readonly?: boolean }) {
  const cols = def.columns ?? [];
  const rows: Record<string, string>[] = Array.isArray(val) ? (val as Record<string, string>[]) : [];

  function updateCell(rowIdx: number, col: string, cellVal: string) {
    onChange(rows.map((r, i) => i === rowIdx ? { ...r, [col]: cellVal } : r));
  }
  function addRow() {
    onChange([...rows, Object.fromEntries(cols.map(c => [c, '']))]);
  }
  function removeRow(rowIdx: number) {
    onChange(rows.filter((_, i) => i !== rowIdx));
  }

  // Response-rate rollup for outreach domain
  const isOutreach = def.key === 'contacts';
  const responseRate = isOutreach && rows.length > 0
    ? Math.round(rows.filter(r => r['Response'] && r['Response'].trim() !== '').length / rows.length * 100)
    : null;

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
      {isOutreach && rows.length > 0 && (
        <div style={{
          display:'flex', gap:'16px', fontSize:'12px', color:'#6b7280',
          background:'rgba(249,115,22,0.04)', borderRadius:'10px',
          padding:'10px 14px', border:'1px solid rgba(249,115,22,0.1)',
        }}>
          <span><strong style={{ color:'#374151' }}>{rows.length}</strong> contacts</span>
          <span><strong style={{ color:'#f97316' }}>{responseRate}%</strong> response rate</span>
        </div>
      )}
      <div style={{ overflowX:'auto', borderRadius:'12px', border:'1px solid rgba(0,0,0,0.08)' }}>
        <table style={{ fontSize:'12px', width:'100%', borderCollapse:'collapse' }} id={`field-${def.key}`}>
          <thead>
            <tr style={{ background:'rgba(0,0,0,0.02)' }}>
              {cols.map(c => (
                <th key={c} style={{ padding:'8px 12px', textAlign:'left', fontWeight:600, color:'#6b7280', whiteSpace:'nowrap', borderBottom:'1px solid rgba(0,0,0,0.06)' }}>
                  {c}
                </th>
              ))}
              {!readonly && <th style={{ padding:'8px', width:'32px', borderBottom:'1px solid rgba(0,0,0,0.06)' }} />}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={cols.length + 1} style={{ padding:'16px', textAlign:'center', color:'#9ca3af', fontSize:'12px' }}>No rows yet</td></tr>
            )}
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} style={{ borderTop:'1px solid rgba(0,0,0,0.04)' }}>
                {cols.map(col => (
                  <td key={col} style={{ padding:'4px' }}>
                    <input type="text" value={row[col] ?? ''} readOnly={readonly}
                      onChange={e => updateCell(rowIdx, col, e.target.value)}
                      style={{
                        width:'100%', padding:'5px 8px', fontSize:'12px', border:'1px solid transparent',
                        borderRadius:'6px', background:'transparent', outline:'none', minWidth:'80px',
                        fontFamily:"'Outfit','Inter',system-ui,sans-serif", color:'#374151',
                      }}
                      onFocus={e => { (e.target as HTMLInputElement).style.border='1px solid rgba(249,115,22,0.3)'; (e.target as HTMLInputElement).style.background='white'; }}
                      onBlur={e => { (e.target as HTMLInputElement).style.border='1px solid transparent'; (e.target as HTMLInputElement).style.background='transparent'; }}
                    />
                  </td>
                ))}
                {!readonly && (
                  <td style={{ padding:'4px' }}>
                    <button type="button" onClick={() => removeRow(rowIdx)}
                      style={{ padding:'4px', background:'none', border:'none', cursor:'pointer', color:'#d1d5db' }}
                      onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color='#ef4444'}
                      onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color='#d1d5db'}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!readonly && (
        <button type="button" onClick={addRow}
          style={{
            display:'inline-flex', alignItems:'center', gap:'6px',
            fontSize:'12px', color:'#f97316', background:'none', border:'none',
            cursor:'pointer', fontFamily:"'Outfit','Inter',system-ui,sans-serif", fontWeight:500,
          }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add row
        </button>
      )}
    </div>
  );
}

// ── Main renderer ─────────────────────────────────────────────────────────────

export function DomainFieldRenderer({ fields, value, onChange, readonly }: DomainFieldRendererProps) {
  if (fields.length === 0) return null;

  function updateField(key: string, fieldVal: unknown) {
    onChange({ ...value, [key]: fieldVal });
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      <div style={{ borderTop:'1px dashed rgba(0,0,0,0.1)', paddingTop:'20px' }}>
        <h3 style={{ fontSize:'11px', fontWeight:700, color:'#9ca3af', textTransform:'uppercase', letterSpacing:'0.08em', marginBottom:'16px' }}>
          Domain-Specific Fields
        </h3>
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          {fields.map(def => (
            <div key={def.key}>
              <label htmlFor={`field-${def.key}`}
                style={{ display:'block', fontSize:'12px', fontWeight:600, color:'#374151', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'0.05em' }}>
                {def.label}
                {def.required && <span style={{ color:'#ef4444', marginLeft:'4px' }}>*</span>}
              </label>
              {def.type === 'text'        && <TextField        def={def} val={value[def.key]} onChange={v => updateField(def.key, v)} readonly={readonly} />}
              {def.type === 'textarea'    && <TextareaField    def={def} val={value[def.key]} onChange={v => updateField(def.key, v)} readonly={readonly} />}
              {def.type === 'number'      && <NumberField      def={def} val={value[def.key]} onChange={v => updateField(def.key, v)} readonly={readonly} />}
              {def.type === 'url'         && <UrlField         def={def} val={value[def.key]} onChange={v => updateField(def.key, v)} readonly={readonly} />}
              {def.type === 'date'        && <DateField        def={def} val={value[def.key]} onChange={v => updateField(def.key, v)} readonly={readonly} />}
              {def.type === 'select'      && <SelectField      def={def} val={value[def.key]} onChange={v => updateField(def.key, v)} readonly={readonly} />}
              {def.type === 'multiselect' && <MultiSelectField def={def} val={value[def.key]} onChange={v => updateField(def.key, v)} readonly={readonly} />}
              {def.type === 'checklist'   && <ChecklistField   def={def} val={value[def.key]} onChange={v => updateField(def.key, v)} readonly={readonly} />}
              {def.type === 'keyvalue'    && <KeyValueField    def={def} val={value[def.key]} onChange={v => updateField(def.key, v)} readonly={readonly} />}
              {def.type === 'table'       && <TableField       def={def} val={value[def.key]} onChange={v => updateField(def.key, v)} readonly={readonly} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
