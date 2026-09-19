"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Printer, ArrowRight, X } from 'lucide-react';
import { useRouter } from "next/navigation";
import { Button } from '@/evodoc-components/ui/button';

const NEON = '#e1ff00';
const BLUE = '#1a4fa8';

const PrescriptionPage = ({ person, diagnosis, treatment, verifiedSymptoms, onClose }) => {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [today, setToday] = useState('');

    useEffect(() => {
        setMounted(true);
        setToday(new Date().toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric'
        }));
    }, []);

    const handlePrint = () => {
        const el = document.querySelector('.rx-paper');
        if (!el) return;
        const w = window.open('', '_blank', 'width=900,height=700');
        w.document.write(`<!DOCTYPE html><html><head>
            <title>Prescription "· ${person.name}</title>
            <style>@page{margin:1.5cm;size:A4}body{font-family:Georgia,serif;margin:0;background:#fff}*{box-sizing:border-box}</style>
        </head><body>${el.innerHTML}</body></html>`);
        w.document.close(); w.focus();
        setTimeout(() => { w.print(); w.close(); }, 300);
    };

    // Parse treatment
    const lines = (treatment || '').split('\n').filter(l => l.trim());
    const meds = [], labs = [], advice = [];
    let sec = 'med'; // Default section if no header is found
    
    lines.forEach(line => {
        const t = line.trim();
        
        // Check for section headers (lines that don't start with a bullet)
        if (!t.startsWith('-') && !t.startsWith('·')) {
            if (/lab|test|invest|diagn/i.test(t)) sec = 'lab';
            else if (/pharm|medic|drug|presc/i.test(t)) sec = 'med';
            else if (/life|support|advice|diet|care/i.test(t)) sec = 'advice';
            else if (/history|contra|safety|plan/i.test(t)) sec = 'skip';
        }
        
        // Extract items
        if (t.startsWith('-') || t.startsWith('·') || (t.startsWith('*') && !t.endsWith('*'))) {
            const c = t.replace(/^[-·*]+/, '').replace(/\*\*/g, '').trim();
            if (!c) return;
            if (sec === 'lab') labs.push(c); 
            else if (sec === 'med') meds.push(c);
            else if (sec === 'advice') advice.push(c);
        } else if (!t.startsWith('*') && !t.startsWith('#') && t.length > 5 && sec !== 'skip') {
            // For items that might not have bullets but are in a valid section
            if (sec === 'lab') labs.push(t);
            else if (sec === 'med') meds.push(t);
            else if (sec === 'advice') advice.push(t);
        }
    });

    if (!mounted || typeof document === 'undefined') return null;

    return createPortal(
        <div suppressHydrationWarning style={{
            position: 'fixed', inset: 0, zIndex: 100,
            display: 'flex', flexDirection: 'column',
            backgroundColor: '#1e1e1e',
            fontFamily: "'Inter', -apple-system, sans-serif",
            overflow: 'hidden',
        }}>
            {/* -- iOS/Android style PDF toolbar -- */}
            <div style={{
                background: 'linear-gradient(180deg, #2a2a2a 0%, #222 100%)',
                borderBottom: '1px solid #111',
                display: 'flex', alignItems: 'center',
                padding: '8px 12px',
                gap: 8, flexShrink: 0,
                boxShadow: '0 2px 12px rgba(0,0,0,0.5)',
            }}>
                {/* Close */}
                <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={onClose}
                    className="text-zinc-400 hover:text-white hover:bg-white/10 shrink-0"
                >
                    <X size={18} strokeWidth={2} />
                </Button>

                {/* File name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, color: '#e5e7eb', fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {person.name}_Prescription.pdf
                    </p>
                    <p style={{ margin: 0, color: '#6b7280', fontSize: 11, marginTop: 1 }}>
                        Medical Prescription · 1 page
                    </p>
                </div>

                {/* Print */}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                    className="shrink-0 border-white/12 bg-white/8 text-zinc-400 hover:bg-white/15 hover:text-white gap-1.5"
                >
                    <Printer size={14} /> Print
                </Button>

                {/* Restart */}
                <Button
                    size="sm"
                    onClick={() => router.push('/')}
                    className="shrink-0 bg-neon-green text-black font-black uppercase tracking-wider hover:bg-white gap-1.5 shadow-[0_0_12px_rgba(225,255,0,0.4)]"
                >
                    Restart <ArrowRight size={13} strokeWidth={3} />
                </Button>
            </div>

            {/* -- PDF page count bar -- */}
            <div style={{
                background: '#1a1a1a', borderBottom: '1px solid #111',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                padding: '5px 0', flexShrink: 0,
            }}>
                <span style={{ color: '#4b5563', fontSize: 11, fontWeight: 500, letterSpacing: '0.05em' }}>
                    Page 1 of 1
                </span>
            </div>

            {/* -- Fixed PDF canvas -- */}
            <div style={{
                flex: 1, overflow: 'hidden',
                background: 'linear-gradient(180deg, #1e1e1e 0%, #262626 100%)',
                padding: 'clamp(12px,3vw,28px) clamp(8px,3vw,20px)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
            }}>
                {/* White A4 paper */}
                <div className="rx-paper" style={{
                    width: '100%', maxWidth: 640,
                    height: '100%',
                    display: 'flex', flexDirection: 'column',
                    background: '#ffffff',
                    borderRadius: 4,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3), 0 10px 40px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
                    overflow: 'hidden',
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    color: '#111',
                }}>
                    {/* Letterhead */}
                    <div style={{
                        padding: 'clamp(16px,4vw,28px)',
                        background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 50%, #fff 100%)',
                        borderBottom: `4px solid ${BLUE}`,
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                            <div>
                                <h1 style={{ margin: 0, color: BLUE, fontSize: 'clamp(1.1rem,4.5vw,1.7rem)', fontWeight: 800, lineHeight: 1.1 }}>
                                    Dr. Arun Prasad
                                </h1>
                                <p style={{ margin: '4px 0 0', color: '#1e3a8a', fontSize: 'clamp(11px,2.5vw,13px)', fontWeight: 600 }}>MBBS, MD (Internal Medicine)</p>
                                <p style={{ margin: '2px 0', color: '#1e3a8a', fontSize: 'clamp(10px,2vw,12px)', fontWeight: 600 }}>Reg. No: TNMC-45678</p>
                                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #bfdbfe' }}>
                                    <p style={{ margin: 0, color: '#3b5998', fontSize: 'clamp(9px,1.8vw,11px)' }}>SRM Global Hospital, Kattankulathur</p>
                                    <p style={{ margin: '2px 0 0', color: '#3b5998', fontSize: 'clamp(9px,1.8vw,11px)' }}>+91 98765 43210 | dr.arun@srmhospital.com</p>
                                </div>
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <p style={{ margin: 0, color: '#6b7280', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'sans-serif' }}>Date</p>
                                <p style={{ margin: '3px 0 0', color: '#111', fontSize: 'clamp(11px,2.5vw,14px)', fontWeight: 700, fontFamily: 'sans-serif' }}>{today}</p>
                            </div>
                        </div>
                    </div>

                    {/* Patient details */}
                    <div style={{ padding: 'clamp(12px,3.5vw,20px)', borderBottom: '1px solid #e5e7eb' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <tbody>
                                {[
                                    ['Patient Name', person.name],
                                    ['Age / Gender', `${person.age} Yrs / ${person.gender}`],
                                    ['Occupation', person.occupation],
                                    ['Location', person.location],
                                ].map(([l, v]) => (
                                    <tr key={l}>
                                        <td style={{ padding: 'clamp(3px,1vw,5px) clamp(4px,1.5vw,8px) clamp(3px,1vw,5px) 0', width: '38%', fontSize: 'clamp(10px,2.2vw,12px)', fontWeight: 700, color: '#374151', fontFamily: 'sans-serif', verticalAlign: 'top' }}>{l}:</td>
                                        <td style={{ padding: 'clamp(3px,1vw,5px) 0', fontSize: 'clamp(10px,2.2vw,12px)', color: '#1f2937', fontFamily: 'sans-serif', fontWeight: 500 }}>{v}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Vitals */}
                    <div style={{ padding: 'clamp(8px,2.5vw,14px) clamp(12px,3.5vw,20px)', background: '#f8fafc', borderBottom: '1px solid #e5e7eb', display: 'flex', flexWrap: 'wrap', gap: 'clamp(10px,3vw,20px)' }}>
                        {[
                            ['BP', person.vitals.bp],
                            ['Pulse', `${person.vitals.heartRate} BPM`],
                            ['Temp', person.vitals.temp],
                            ['Weight', person.vitals.weight],
                        ].map(([l, v]) => (
                            <div key={l} style={{ fontFamily: 'sans-serif' }}>
                                <span style={{ fontWeight: 700, fontSize: 'clamp(10px,2vw,12px)', color: '#374151' }}>{l}: </span>
                                <span style={{ fontSize: 'clamp(10px,2vw,12px)', color: '#111' }}>{v}</span>
                            </div>
                        ))}
                    </div>

                    {/* Chief Complaints */}
                    <div style={{ padding: 'clamp(10px,3vw,16px) clamp(12px,3.5vw,20px)', borderBottom: '1px solid #e5e7eb' }}>
                        <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 'clamp(10px,2.2vw,12px)', color: '#111', fontFamily: 'sans-serif' }}>Chief Complaints:</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {verifiedSymptoms.map((s, i) => (
                                <span key={i} style={{
                                    fontSize: 'clamp(9px,1.8vw,11px)', color: '#1d4ed8',
                                    background: '#eff6ff', border: '1px solid #bfdbfe',
                                    borderRadius: 99, padding: '3px 10px',
                                    fontWeight: 500, fontFamily: 'sans-serif',
                                }}>{s}</span>
                            ))}
                        </div>
                    </div>

                    {/* Diagnosis */}
                    <div style={{ padding: 'clamp(10px,3vw,16px) clamp(12px,3.5vw,20px)', background: '#fafbff', borderBottom: '1px solid #e5e7eb' }}>
                        <p style={{ margin: '0 0 4px', fontWeight: 700, fontSize: 'clamp(10px,2.2vw,12px)', color: '#374151', fontFamily: 'sans-serif' }}>Diagnosis:</p>
                        <p style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(12px,3vw,16px)', color: '#111' }}>{diagnosis || person.diagnosis_hint}</p>
                    </div>

                    {/* Rx Prescription */}
                    <div style={{ padding: 'clamp(12px,3.5vw,20px)', borderBottom: '2px solid #374151' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 10, borderBottom: '1px solid #e5e7eb' }}>
                            <span style={{ fontSize: 'clamp(2rem,7vw,2.8rem)', fontWeight: 900, color: BLUE, lineHeight: 1 }}>✓</span>
                            <span style={{ fontWeight: 900, fontSize: 'clamp(12px,3vw,16px)', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#111', fontFamily: 'sans-serif' }}>PRESCRIPTION</span>
                        </div>

                        {meds.length > 0 && (
                            <div style={{ marginBottom: 14 }}>
                                <p style={{ fontWeight: 700, fontSize: 'clamp(10px,2vw,12px)', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', margin: '0 0 8px', fontFamily: 'sans-serif' }}>Medications</p>
                                <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e5e7eb' }}>
                                    {meds.map((med, i) => {
                                        const parts = med.split(/(?=\d+mg|Once|Twice|Thrice|Morning|Evening|Night|Before|After)/i);
                                        return (
                                            <div key={i} style={{ display: 'flex', gap: 10, padding: 'clamp(8px,2vw,12px)', background: i % 2 === 0 ? '#fff' : '#f8fafc', borderTop: i > 0 ? '1px solid #f1f5f9' : 'none', alignItems: 'flex-start' }}>
                                                <span style={{ width: 22, height: 22, borderRadius: '50%', background: '#dbeafe', color: '#1e40af', fontSize: 10, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontFamily: 'sans-serif' }}>{i + 1}</span>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 700, fontSize: 'clamp(10px,2.2vw,12px)', color: '#111', fontFamily: 'sans-serif' }}>{parts[0]}</p>
                                                    <p style={{ margin: '2px 0 0', fontSize: 'clamp(9px,1.8vw,11px)', color: '#6b7280', fontFamily: 'sans-serif' }}>{parts.slice(1).join(' ') || 'As directed'}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {labs.length > 0 && (
                            <div>
                                <p style={{ fontWeight: 700, fontSize: 'clamp(10px,2vw,12px)', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#374151', margin: '0 0 8px', fontFamily: 'sans-serif' }}>Investigations</p>
                                <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    {labs.map((t, i) => <li key={i} style={{ fontSize: 'clamp(10px,2.2vw,12px)', color: '#374151', fontFamily: 'sans-serif' }}>{t}</li>)}
                                </ul>
                            </div>
                        )}

                        {meds.length === 0 && labs.length === 0 && (
                            <p style={{ fontStyle: 'italic', color: '#6b7280', fontSize: 'clamp(10px,2.2vw,12px)', fontFamily: 'sans-serif', margin: 0 }}>
                                {treatment || 'Prescription as per clinical evaluation'}
                            </p>
                        )}
                    </div>

                    {/* Advice */}
                    <div style={{ padding: 'clamp(10px,3vw,16px) clamp(12px,3.5vw,20px)', borderBottom: '1px solid #e5e7eb' }}>
                        <p style={{ margin: '0 0 8px', fontWeight: 700, fontSize: 'clamp(10px,2.2vw,12px)', color: '#111', fontFamily: 'sans-serif' }}>Advice:</p>
                        <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 5 }}>
                            {(advice.length > 0 ? advice : ['Take medications as prescribed', 'Follow up after 7 days or if symptoms worsen', 'Maintain adequate hydration and rest']).map((a, i) => (
                                <li key={i} style={{ fontSize: 'clamp(10px,2.2vw,12px)', color: '#374151', fontFamily: 'sans-serif' }}>{a}</li>
                            ))}
                        </ul>
                    </div>

                    {/* Signature */}
                    <div style={{ marginTop: 'auto', padding: 'clamp(14px,3.5vw,24px)', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ textAlign: 'right', paddingTop: 10, borderTop: '2px solid #374151' }}>
                            <p style={{ margin: 0, fontWeight: 800, fontSize: 'clamp(11px,2.5vw,14px)', color: '#111' }}>Dr. Arun Prasad</p>
                            <p style={{ margin: '2px 0 0', fontSize: 'clamp(9px,1.8vw,11px)', color: '#6b7280', fontFamily: 'sans-serif' }}>MBBS, MD (Internal Medicine)</p>
                            <p style={{ margin: 0, fontSize: 'clamp(9px,1.8vw,11px)', color: '#6b7280', fontFamily: 'sans-serif' }}>Reg. No: TNMC-45678</p>
                        </div>
                    </div>
                </div>

                {/* Ghost extra page shadow for depth */}
                <div style={{
                    width: '95%', maxWidth: 620, height: 10,
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '0 0 4px 4px',
                    boxShadow: '0 3px 12px rgba(0,0,0,0.3)',
                }} />
            </div>

            {/* -- Bottom action bar  -- */}
            <div style={{
                background: 'linear-gradient(0deg, #1a1a1a 0%, #222 100%)',
                borderTop: '1px solid #111',
                padding: 'clamp(10px,2vw,16px) clamp(16px,3vw,28px)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12,
                flexShrink: 0, flexWrap: 'wrap',
                boxShadow: '0 -2px 20px rgba(0,0,0,0.5)',
            }}>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button onClick={handlePrint} style={{
                        padding: '10px 18px', background: '#2563eb', color: '#fff',
                        border: 'none', borderRadius: 10, fontWeight: 700,
                        fontSize: 'clamp(11px,2vw,13px)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 6,
                        fontFamily: 'inherit', transition: 'all 0.2s',
                    }}><Printer size={14} /> Print</button>
                    <button onClick={onClose} style={{
                        padding: '10px 18px', background: 'rgba(255,255,255,0.08)',
                        color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: 10, fontWeight: 600,
                        fontSize: 'clamp(11px,2vw,13px)', cursor: 'pointer',
                        fontFamily: 'inherit',
                    }}>Close</button>
                </div>
                <button onClick={() => router.push('/')} style={{
                    padding: '11px 22px', background: NEON, color: '#000',
                    border: 'none', borderRadius: 10, fontWeight: 900,
                    fontSize: 'clamp(11px,2vw,13px)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 7,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    fontFamily: 'inherit', boxShadow: `0 0 20px ${NEON}44`,
                    transition: 'all 0.2s',
                }}>
                    Restart Demo <ArrowRight size={15} strokeWidth={3} />
                </button>
            </div>

            <style>{`@media print{@page{margin:1.5cm;size:A4}.rx-paper{box-shadow:none!important;border-radius:0!important;max-width:100%!important}}`}</style>
        </div>,
        document.body
    );
};

export default PrescriptionPage;


