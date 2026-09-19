"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { profiles } from "@/evodoc-data/profiles";
import ChatInterface from "@/evodoc-components/demo-components/ChatInterface";
import { Activity, AlertTriangle, ArrowLeft } from "lucide-react";
import Header from "@/evodoc-components/demo-components/Header";
import { Button } from "@/evodoc-components/ui/button";
import { Badge } from "@/evodoc-components/ui/badge";

const NEON = '#e1ff00';

const Diagnosis = () => {
    const { personId } = useParams();
    const router = useRouter();
    const [person, setPerson] = useState(null);
    const [headerH, setHeaderH] = useState(90);
    const [showMobileData, setShowMobileData] = useState(false);

    useEffect(() => {
        let found = null;
        Object.keys(profiles).forEach(deptId => {
            const p = profiles[deptId].find(p => p.id === personId);
            if (p) found = p;
        });
        setPerson(found);
        window.scrollTo(0, 0);
    }, [personId]);

    // Measure header height after mount
    useEffect(() => {
        const nav = document.querySelector('nav');
        if (nav) setHeaderH(nav.offsetHeight);
    }, [person]);

    if (!person) return (
        <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#0d0d0d', color: NEON, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '0.1em' }}>
            LOADING PATIENT DATA...
        </div>
    );

    const Chip = ({ children }) => (
        <Badge variant="outline" className="border-white/15 bg-white/15 text-white font-extrabold uppercase tracking-wider text-xs rounded-md">
            {children}
        </Badge>
    );

    const StatBox = ({ label, val }) => (
        <div style={{ backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 10, padding: 'clamp(10px, 1.5vw, 16px)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.15em', fontWeight: 800, marginBottom: 6 }}>{label}</p>
            <p style={{ fontWeight: 900, color: '#fff', fontSize: 'clamp(1.2rem, 1.8vw, 1.5rem)', fontFamily: 'monospace' }}>{val}</p>
        </div>
    );

    return (
        <div className="diagnosis-root" style={{ width: '100%', backgroundColor: '#050505', color: '#fff', fontFamily: "'Outfit', sans-serif", display: 'flex', flexDirection: 'column' }}>
            {/* Background */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: `radial-gradient(ellipse at top right, ${NEON}08 0%, transparent 55%)` }} />

            <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }} id="main-header">
                <Header />
            </div>

            {/* Page body "· side by side on desktop, stacked on mobile */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column', // overridden by media query via class
                gap: 'clamp(12px, 1.5vw, 16px)',
                padding: 'clamp(12px, 1.5vw, 18px) clamp(12px, 2.5vw, 28px)',
                position: 'relative', zIndex: 5,
                width: '100%',
                maxWidth: 1600,
                margin: '0 auto',
                boxSizing: 'border-box',
            }} className="diagnosis-page-body">

                {/* Left: Sidebar Stack */}
                <div className="sidebar-col" style={{
                    display: 'flex', flexDirection: 'column', gap: 'clamp(12px, 1.5vw, 16px)',
                    overflowY: 'auto', position: 'relative', flexShrink: 0,
                    paddingRight: 4, // for scrollbar
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="-ml-2 mb-1 text-zinc-400 hover:text-white gap-1.5 w-fit"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                            <ArrowLeft size={16} strokeWidth={3} /> Back
                        </Button>
                        <Button 
                            className="mobile-data-toggle"
                            onClick={() => setShowMobileData(!showMobileData)}
                            style={{ 
                                backgroundColor: '#e1ff00', 
                                color: '#000',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                padding: '8px 18px',
                                boxShadow: '0 4px 14px 0 rgba(225, 255, 0, 0.25)',
                                borderRadius: '8px'
                            }}
                        >
                            {showMobileData ? "Hide Patient Data" : "Show Patient Data"}
                        </Button>
                    </div>
                    
                    <div className={`sidebar-content ${showMobileData ? 'show' : ''}`}>
                    {/* Patient Summary Card (Compact) */}
                    <div style={{
                        backgroundColor: 'rgba(25, 25, 25, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 18,
                        padding: 'clamp(12px, 1.5vw, 16px)',
                        position: 'relative',
                        overflow: 'hidden',
                        flexShrink: 0,
                    }}>
                        <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, background: `radial-gradient(circle, ${NEON}0d 0%, transparent 70%)`, pointerEvents: 'none', borderRadius: 18 }} />

                        {/* Avatar + Name */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'clamp(10px, 1.5vw, 14px)' }}>
                            <div style={{
                                width: 'clamp(44px, 5vw, 54px)', height: 'clamp(44px, 5vw, 54px)',
                                backgroundColor: '#121416', borderRadius: '50%',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 'clamp(1.1rem, 1.8vw, 1.4rem)', fontWeight: 900, color: '#d1d5db',
                                border: '2px solid rgba(255,255,255,0.08)', flexShrink: 0,
                            }}>
                                {person.name.charAt(0)}
                            </div>
                            <div>
                                <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(1.1rem, 1.8vw, 1.3rem)', fontWeight: 800, color: '#fff', marginBottom: 6 }}>{person.name}</h2>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    <Chip>{person.gender}</Chip>
                                    <Chip>{person.age} Yrs</Chip>
                                </div>
                            </div>
                        </div>

                        {/* Vitals */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 'clamp(10px, 1.5vw, 14px)' }}>
                            <StatBox label="BP" val={person.vitals.bp} />
                            <StatBox label="Heart Rate" val={`${person.vitals.heartRate} BPM`} />
                            <StatBox label="Temp" val={person.vitals.temp} />
                            <StatBox label="Weight" val={person.vitals.weight} />
                        </div>

                        {/* Medical History */}
                        <div style={{ marginBottom: 'clamp(10px, 1.5vw, 14px)' }}>
                            <p style={{ fontSize: 11, color: NEON, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Activity size={14} /> Medical History
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                {person.history.slice(0, 3).map((h, i) => (
                                    <div key={i} style={{ paddingLeft: 12, borderLeft: `3px solid ${NEON}`, fontSize: 'clamp(0.95rem, 1.3vw, 1.1rem)', color: '#fff', fontWeight: 700, lineHeight: 1.4 }}>{h}</div>
                                ))}
                            </div>
                        </div>

                        {/* Risk Factors */}
                        {person.contraindications.length > 0 && (
                            <div>
                                <p style={{ fontSize: 11, color: '#ef4444', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <AlertTriangle size={14} /> Risk Factors
                                </p>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {person.contraindications.map((c, i) => (
                                        <Badge key={i} variant="error" className="text-xs font-bold px-3 py-1 rounded-lg">{c}</Badge>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline Card */}
                    <div style={{
                        backgroundColor: 'rgba(25, 25, 25, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderRadius: 18,
                        padding: 'clamp(16px, 2vw, 24px)',
                        flexShrink: 0,
                    }}>
                        <p style={{ fontSize: 12, color: '#8b5cf6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 16, paddingBottom: 10, borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Activity size={16} /> Clinical Timeline
                        </p>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            <div style={{ display: 'flex', gap: 14 }}>
                                <div style={{ width: 3, backgroundColor: '#8b5cf6', borderRadius: 3, flexShrink: 0 }} />
                                <div>
                                    <p style={{ fontSize: 16, fontWeight: 800, color: '#e5e7eb', marginBottom: 4 }}>Today</p>
                                    <p style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.5 }}>AI-Assisted Consultation in Progress. Evaluating symptoms: {person.symptoms.slice(0, 2).join(', ')}.</p>
                                </div>
                            </div>
                            
                            {person.history.length > 0 && (
                                <div style={{ display: 'flex', gap: 14 }}>
                                    <div style={{ width: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: 16, fontWeight: 800, color: '#d1d5db', marginBottom: 4 }}>Past Medical History</p>
                                        <p style={{ fontSize: 14, color: '#9ca3af', lineHeight: 1.5 }}>{person.history[0]}. Monitored continuously.</p>
                                    </div>
                                </div>
                            )}
                            
                            {person.contraindications.length > 0 && (
                                <div style={{ display: 'flex', gap: 14 }}>
                                    <div style={{ width: 3, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, flexShrink: 0 }} />
                                    <div>
                                        <p style={{ fontSize: 16, fontWeight: 800, color: '#d1d5db', marginBottom: 4 }}>Safety Alert Logged</p>
                                        <p style={{ fontSize: 14, color: '#ef4444', lineHeight: 1.5 }}>{person.contraindications[0]} flagged in system.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    </div>
                </div>

                {/* Right: Chat */}
                <div className="chat-col" style={{
                        backgroundColor: 'rgba(25, 25, 25, 0.5)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: 18,
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    minHeight: 'clamp(420px, 55vh, 700px)',
                }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(to right, transparent, ${NEON}55, transparent)` }} />
                    <ChatInterface person={person} />
                </div>
            </div>

            <style>{`
                .diagnosis-root {
                    min-height: 100vh;
                }
                .mobile-data-toggle {
                    display: flex !important;
                }
                .sidebar-content {
                    display: none;
                    flex-direction: column;
                    gap: clamp(12px, 1.5vw, 16px);
                }
                .sidebar-content.show {
                    display: flex;
                }
                .diagnosis-page-body {
                    flex-direction: column;
                }
                .sidebar-col {
                    width: 100%;
                    max-height: none;
                }
                .chat-col {
                    width: 100%;
                }
                @media (min-width: 960px) {
                    .mobile-data-toggle {
                        display: none !important;
                    }
                    .sidebar-content {
                        display: flex !important;
                    }
                    .diagnosis-root {
                        height: 100vh !important;
                        overflow: hidden !important;
                    }
                    .diagnosis-page-body {
                        flex-direction: row !important;
                        align-items: stretch;
                        height: calc(100vh - ${headerH}px) !important;
                        overflow: hidden;
                    }
                    .sidebar-col {
                        width: clamp(260px, 28vw, 380px) !important;
                        flex-shrink: 0 !important;
                        min-height: 0 !important;
                        height: 100%;
                        overflow-y: auto;
                    }
                    .chat-col {
                        flex: 1 !important;
                        min-width: 0 !important;
                        min-height: 0 !important;
                        height: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default Diagnosis;

