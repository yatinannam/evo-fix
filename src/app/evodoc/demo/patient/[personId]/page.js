"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { profiles } from "@/evodoc-data/profiles";
import { Activity, AlertTriangle, ArrowLeft, Droplet } from "lucide-react";
import Header from "@/evodoc-components/demo-components/Header";
import { Button } from "@/evodoc-components/ui/button";
import { Badge } from "@/evodoc-components/ui/badge";
import { Avatar, AvatarFallback } from "@/evodoc-components/ui/avatar";
import { Tabs, TabsList, TabsTab, TabsPanel } from "@/evodoc-components/ui/tabs";
import { Skeleton } from "@/evodoc-components/ui/skeleton";

const NEON = '#e1ff00';

const PatientProfile = () => {
    const { personId } = useParams();
    const router = useRouter();
    const [person, setPerson] = useState(null);
    const [activeTab, setActiveTab] = useState('overview');
    const [mobileView, setMobileView] = useState('chart');

    useEffect(() => {
        let found = null;
        Object.keys(profiles).forEach(deptId => {
            const p = profiles[deptId].find(p => p.id === personId);
            if (p) found = p;
        });
        setPerson(found);
        window.scrollTo(0, 0);
    }, [personId]);

    if (!person) return (
        <div style={{ minHeight: '100vh', backgroundColor: '#0d0d0d', color: '#fff', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <Skeleton className="h-8 w-48 bg-white/5" />
                <Skeleton className="h-32 w-full bg-white/5" />
                <Skeleton className="h-64 w-full bg-white/5" />
            </div>
        </div>
    );

    const mockData = {
        mrn: `MRN ${Math.floor(10000 + Math.random() * 90000)}`,
        registered: `15 Feb 2026`,
        allergies: person.contraindications.length > 0 ? person.contraindications[0].split(' ')[0] : 'None',
        vitals: {
            bp: person.vitals.bp || '120/80',
            hr: person.vitals.heartRate || '72',
            spo2: '98%',
        },
        medications: [
            { name: 'Metformin', dose: '500mg · BID', started: '02 Apr 2026' },
            { name: 'Amlodipine', dose: '5mg · OD', started: '10 May 2026' },
            ...(person.aiMedications || [])
        ],
        notes: {
            S: person.symptoms_simple || 'Patient reports standard symptoms.',
            O: `Vitals stable. BP ${person.vitals.bp}.`,
            A: person.diagnosis_hint || 'Pending further review.',
        },
    };

    const hasHighBp = parseInt((person.vitals.bp || '120').split('/')[0]) > 130;
    const isOlder = parseInt(person.age) > 50;
    const hasHistory = person.history && person.history.length > 0;

    const aiData = {
        diabetes: hasHighBp || isOlder
            ? { level: 'Elevated', prob: '68%', color: '#ef4444', barW: '68%' }
            : { level: 'Low', prob: '12%', color: '#10b981', barW: '12%' },
        readmission: hasHistory
            ? { level: 'Moderate', prob: '45%', color: '#f59e0b', barW: '45%' }
            : { level: 'Low', prob: '8%', color: '#10b981', barW: '8%' },
        interaction: person.contraindications.length > 0
            ? { level: 'Flagged', text: `Check for ${person.contraindications[0].split(' ')[0]}`, color: '#ef4444' }
            : { level: 'Clear', text: 'No known severe allergies', color: '#10b981' },
        adherence: (person.name.length % 2 === 0)
            ? { level: 'High', prob: '85%', text: 'Historical compliance good', color: '#10b981', barW: '85%' }
            : { level: 'Moderate', prob: '41%', text: 'Missed 1 of 4 past visits', color: '#f59e0b', barW: '41%' },
        summary: `${person.name} presents with ${person.symptoms.join(', ')}. Recent history indicates ${person.history[0] || 'no major issues'}. AI suggests monitoring for ${person.diagnosis_hint} given the current presentation.`,
    };

    const cardStyle = {
        backgroundColor: 'rgba(25, 25, 25, 0.5)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: 16,
    };

    const TABS = [
        { value: 'overview', label: 'Overview' },
        { value: 'vitals', label: 'Vitals' },
        { value: 'medications', label: 'Medications' },
        { value: 'labs', label: 'Labs' },
        { value: 'notes', label: 'Notes' },
    ];

    return (
        <div className="page-wrapper" style={{ width: '100%', backgroundColor: '#050505', color: '#fff', fontFamily: "'Outfit', sans-serif", display: 'flex', flexDirection: 'column' }}>
            <Header />

            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }} className="profile-layout">
                {/* -- Left Column -- */}
                <div className="scroll-column mobile-panel" data-hidden={mobileView !== 'chart'} style={{ padding: 'clamp(20px, 3vw, 40px)' }}>
                    <div style={{ maxWidth: 700, margin: '0 auto' }}>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.back()}
                            className="mb-5 -ml-2 text-zinc-400 hover:text-white gap-1.5"
                        >
                            <ArrowLeft size={16} /> Back
                        </Button>

                        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: NEON, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>Patient Record</p>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 900, marginBottom: 4 }}>Consultation Chart</h1>
                        <p style={{ fontSize: 16, color: '#d1d5db', fontWeight: 500, marginBottom: 24 }}>Structured record · editable by clinic staff</p>

                        {/* Patient Header Card */}
                        <div className="patient-header" style={{ ...cardStyle, padding: 'clamp(20px, 2.5vw, 32px)', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, right: 0, width: 150, height: 150, background: `radial-gradient(circle, ${NEON}15 0%, transparent 70%)`, pointerEvents: 'none' }} />
                            <Avatar className="size-16 rounded-xl border text-xl font-black" style={{ backgroundColor: 'rgba(225,255,0,0.1)', borderColor: `${NEON}33`, color: NEON, fontFamily: "'Space Grotesk', sans-serif" }}>
                                <AvatarFallback style={{ backgroundColor: 'transparent', color: NEON, fontWeight: 900, fontSize: 22 }}>
                                    {person.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                            </Avatar>
                            <div style={{ flex: 1 }}>
                                <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 28, fontWeight: 800, marginBottom: 6 }}>{person.name}</h3>
                                <p style={{ fontSize: 15, color: '#9ca3af', fontWeight: 500 }}>{person.age}{person.gender.charAt(0)} · {mockData.mrn} · Registered {mockData.registered}</p>
                            </div>
                            {mockData.allergies !== 'None' && (
                                <Badge variant="error" className="gap-1.5 text-xs font-semibold px-3 py-1 rounded-full">
                                    <AlertTriangle size={13} /> {mockData.allergies}
                                </Badge>
                            )}
                        </div>

                        {/* Mobile Segmented Toggle */}
                        <div className="mobile-toggle-container">
                            <button className={`mobile-toggle-btn ${mobileView === 'chart' ? 'active' : ''}`} onClick={() => setMobileView('chart')}>Chart</button>
                            <button className={`mobile-toggle-btn ${mobileView === 'insights' ? 'active' : ''}`} onClick={() => setMobileView('insights')}>AI insights</button>
                        </div>

                        {/* Tabs */}
                        <Tabs value={activeTab} onValueChange={setActiveTab}>
                            <TabsList
                                variant="underline"
                                className="w-full justify-start border-b border-white/8 rounded-none bg-transparent gap-0 overflow-x-auto"
                            >
                                {TABS.map(t => (
                                    <TabsTab
                                        key={t.value}
                                        value={t.value}
                                        className="shrink-0 px-4 h-11 rounded-none text-zinc-400 data-active:text-neon-green font-semibold text-base bg-transparent hover:text-white transition-colors"
                                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                    >
                                        {t.label}
                                    </TabsTab>
                                ))}
                            </TabsList>

                            {/* Overview */}
                            <TabsPanel value="overview">
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, paddingTop: 20, paddingBottom: 40 }}>
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                                            <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 900 }}>Vitals snapshot</h4>
                                            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>Recorded 11:20 AM</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16 }}>
                                            {[
                                                { label: 'Blood Pressure', val: mockData.vitals.bp, unit: 'mmHg', dot: '#f59e0b' },
                                                { label: 'Heart Rate', val: mockData.vitals.hr, unit: 'bpm', dot: '#10b981' },
                                                { label: 'SPO₂', val: mockData.vitals.spo2.replace('%',''), unit: '%', dot: '#10b981' },
                                            ].map(v => (
                                                <div key={v.label} className="vitals-card" style={{ ...cardStyle, padding: 20 }}>
                                                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 800, marginBottom: 10, display: 'flex', justifyContent: 'space-between' }}>
                                                        {v.label} <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: v.dot, display: 'inline-block' }} />
                                                    </p>
                                                    <p className="vitals-value" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, fontWeight: 900 }}>{v.val} <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: 14, color: '#6b7280', fontWeight: 600 }}>{v.unit}</span></p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Medications table */}
                                    <div style={{ ...cardStyle, padding: 20 }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                                            <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 900 }}>Current medications</h4>
                                            <Badge variant="outline" className="text-zinc-400 border-white/10">{mockData.medications.length} active</Badge>
                                        </div>
                                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                    {['Drug', 'Dose', 'Started'].map(h => (
                                                        <th key={h} style={{ paddingBottom: 12, fontSize: 12, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {mockData.medications.map((med, i) => (
                                                    <tr key={i} style={{ borderBottom: i < mockData.medications.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                                        <td style={{ paddingTop: 16, paddingBottom: 16, fontSize: 16, fontWeight: 700 }}>{med.name}</td>
                                                        <td style={{ paddingTop: 16, paddingBottom: 16, fontSize: 15, color: '#d1d5db' }}>{med.dose}</td>
                                                        <td style={{ paddingTop: 16, paddingBottom: 16, fontSize: 14, color: '#9ca3af' }}>{med.started}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    {/* Latest note */}
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                                            <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 900 }}>Latest note</h4>
                                            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>Today, 11:38 AM</span>
                                        </div>
                                        <div style={{ ...cardStyle, padding: 20, fontSize: 16, color: '#d1d5db', lineHeight: 1.6 }}>
                                            <p><span style={{ color: NEON, fontWeight: 700 }}>S:</span> {mockData.notes.S}</p>
                                            <p><span style={{ color: NEON, fontWeight: 700 }}>O:</span> {mockData.notes.O}</p>
                                            <p><span style={{ color: NEON, fontWeight: 700 }}>A:</span> {mockData.notes.A}</p>
                                        </div>
                                    </div>
                                </div>
                            </TabsPanel>

                            {/* Vitals Tab */}
                            <TabsPanel value="vitals">
                                <div style={{ paddingTop: 24, paddingBottom: 40 }}>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Historical Vitals Trend</h4>
                                    <div style={{ ...cardStyle, padding: 20 }}>
                                        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                                            <thead>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                                                    {['Date','BP','HR','SpO2'].map(h => (
                                                        <th key={h} style={{ paddingBottom: 8, fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                                                    <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 13, color: '#d1d5db' }}>Today</td>
                                                    <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 14, fontWeight: 600 }}>{mockData.vitals.bp}</td>
                                                    <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 14, fontWeight: 600 }}>{mockData.vitals.hr}</td>
                                                    <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 14, fontWeight: 600 }}>{mockData.vitals.spo2}</td>
                                                </tr>
                                                <tr>
                                                    <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 13, color: '#9ca3af' }}>Last Month</td>
                                                    <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 14, color: '#9ca3af' }}>118/76</td>
                                                    <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 14, color: '#9ca3af' }}>70</td>
                                                    <td style={{ paddingTop: 12, paddingBottom: 12, fontSize: 14, color: '#9ca3af' }}>99%</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </TabsPanel>

                            {/* Medications Tab */}
                            <TabsPanel value="medications">
                                <div style={{ paddingTop: 24, paddingBottom: 40 }}>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Active Prescriptions</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        {mockData.medications.map((med, i) => (
                                            <div key={i} style={{ ...cardStyle, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{med.name}</p>
                                                    <p style={{ fontSize: 13, color: '#9ca3af' }}>{med.dose} · Started {med.started}</p>
                                                </div>
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <Button variant="outline" size="xs" className="border-white/10 text-zinc-300 hover:bg-white/5">Refill</Button>
                                                    <Button variant="destructive-outline" size="xs">Stop</Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </TabsPanel>

                            {/* Labs Tab */}
                            <TabsPanel value="labs">
                                <div style={{ paddingTop: 24, paddingBottom: 40 }}>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Recent Laboratory Results</h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                        <div style={{ ...cardStyle, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Comprehensive Metabolic Panel</p>
                                                <p style={{ fontSize: 13, color: '#9ca3af' }}>Ordered 22 Jun 2026 · Status: <Badge variant="warning" size="sm" className="ml-1">Pending</Badge></p>
                                            </div>
                                            <Droplet size={20} color="#9ca3af" />
                                        </div>
                                        <div style={{ ...cardStyle, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div>
                                                <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Lipid Panel</p>
                                                <p style={{ fontSize: 13, color: '#9ca3af' }}>Ordered 10 May 2026 · Status: <Badge variant="success" size="sm" className="ml-1">Completed</Badge></p>
                                            </div>
                                            <Button variant="outline" size="xs" className="border-white/10 text-zinc-300 hover:bg-white/5">View Report</Button>
                                        </div>
                                    </div>
                                </div>
                            </TabsPanel>

                            {/* Notes Tab */}
                            <TabsPanel value="notes">
                                <div style={{ paddingTop: 24, paddingBottom: 40 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 16 }}>
                                        <h4 style={{ fontSize: 14, fontWeight: 700 }}>Clinical Notes History</h4>
                                        <Button size="xs" className="bg-neon-green text-black font-bold hover:bg-white">+ New Note</Button>
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        {person.aiNotes && person.aiNotes.map((note, i) => (
                                            <div key={'ai-'+i} style={{ backgroundColor: '#121416', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 12, padding: 20 }}>
                                                <p style={{ fontSize: 12, color: '#10b981', marginBottom: 12, fontWeight: 600 }}>{note.date} · AI Generated Treatment Plan</p>
                                                <div style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{note.text}</div>
                                            </div>
                                        ))}
                                        <div style={{ backgroundColor: '#121416', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: 20 }}>
                                            <p style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12, fontWeight: 600 }}>Today, 11:38 AM · Dr. Evo</p>
                                            <div style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.6 }}>
                                                <p><span style={{ color: '#10b981', fontWeight: 700 }}>S:</span> {mockData.notes.S}</p>
                                                <p><span style={{ color: '#10b981', fontWeight: 700 }}>O:</span> {mockData.notes.O}</p>
                                                <p><span style={{ color: '#10b981', fontWeight: 700 }}>A:</span> {mockData.notes.A}</p>
                                                <p><span style={{ color: '#10b981', fontWeight: 700 }}>P:</span> Review AI predictions and start diagnosis workflow.</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </TabsPanel>
                        </Tabs>
                    </div>
                </div>

                {/* -- Divider -- */}
                <div style={{ width: 2, background: 'linear-gradient(to bottom, transparent, rgba(225,255,0,0.3), transparent)', position: 'relative', zIndex: 10 }} className="divider-desktop">
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
                        <div style={{ width: 36, height: 36, backgroundColor: '#0d0d0d', border: `2px solid ${NEON}`, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 20px ${NEON}44` }}>
                            <Activity size={18} color={NEON} strokeWidth={3} />
                        </div>
                    </div>
                </div>

                {/* -- Right Column (AI Panel) -- */}
                <div className="scroll-column mobile-panel" data-hidden={mobileView !== 'insights'} style={{ padding: 'clamp(20px, 3vw, 40px)', backgroundColor: 'rgba(255,255,255,0.02)', position: 'relative' }}>
                    <div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', minHeight: '100%', paddingBottom: 100 }}>
                        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 12, color: '#8b5cf6', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 6 }}>EvoDoc AI</p>
                        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2rem, 3vw, 2.8rem)', fontWeight: 900, marginBottom: 4 }}>Intelligence Layer</h1>
                        <p style={{ fontSize: 16, color: '#d1d5db', fontWeight: 600, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3b82f6', boxShadow: '0 0 10px #3b82f6', animation: 'pulse 2s infinite', display: 'inline-block' }} />
                            Analyzing visit in real time
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                            <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 900 }}>Predictions</h4>
                            <span style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600 }}>Updated 11:41 AM</span>
                        </div>

                        <div className="predictions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 24 }}>
                            {[
                                { title: 'Type 2 diabetes risk', arrow: '✓', d: aiData.diabetes, sub: 'HbA1c trending up across last 3 visits' },
                                { title: '30-day readmission risk', arrow: '✓', d: aiData.readmission, sub: 'No acute indicators in current visit' },
                                { title: 'Drug interaction check', arrow: '!', d: aiData.interaction, sub: aiData.interaction.text },
                                { title: 'Follow-up adherence', arrow: '✓', d: aiData.adherence, sub: aiData.adherence.text || '' },
                            ].map((item, i) => (
                                <div key={i} style={{ backgroundColor: 'rgba(25,25,25,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 16 }}>
                                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 800, marginBottom: 14, display: 'flex', justifyContent: 'space-between' }}>
                                        {item.title} <span style={{ color: item.d.color }}>{item.arrow}</span>
                                    </p>
                                    <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 900, color: item.d.color, marginBottom: 4 }}>{item.d.level}</p>
                                    {item.d.prob && <p style={{ fontSize: 13, fontWeight: 600, color: '#9ca3af', marginBottom: 12 }}>{item.d.prob} confidence</p>}
                                    <div style={{ height: 6, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 3, marginBottom: 14, overflow: 'hidden' }}>
                                        <div style={{ width: item.d.barW || '100%', height: '100%', backgroundColor: item.d.color }} />
                                    </div>
                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#d1d5db' }}>{item.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* AI Summary */}
                        <div style={{ backgroundColor: 'rgba(25,25,25,0.5)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20, marginBottom: 24 }}>
                            <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 900, marginBottom: 4 }}>AI summary</h4>
                            <p style={{ fontSize: 13, color: '#9ca3af', fontWeight: 600, marginBottom: 12 }}>Generated from 5 visits · 2 lab reports</p>
                            <p style={{ fontSize: 16, color: '#fff', fontWeight: 600, lineHeight: 1.6 }}>{aiData.summary}</p>
                        </div>
                    </div>

                    {/* CTA sticky bottom */}
                    <div style={{ position: 'sticky', bottom: 0, padding: '20px 0 4px', background: 'linear-gradient(to top, rgba(5,5,5,1) 60%, transparent)', display: 'flex', justifyContent: 'center', zIndex: 10 }} className="cta-container">
                        <Button
                            size="lg"
                            onClick={() => router.push(`/evodoc/demo/diagnosis/${person.id}`)}
                            className="w-full max-w-[500px] bg-neon-green text-black font-black uppercase tracking-widest hover:bg-white gap-3 shadow-[0_0_30px_rgba(225,255,0,0.4)] h-12"
                            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                            <Activity size={18} strokeWidth={2.5} /> Start AI Diagnosis Workflow
                        </Button>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.4); } 100% { opacity:1; transform:scale(1); } }
                
                .page-wrapper { overflow: visible !important; height: auto !important; }
                .scroll-column { overflow-y: visible !important; flex: none !important; }
                
                .profile-layout { flex-direction: column; }
                .divider-desktop { display: none !important; }
                .cta-container { position: fixed !important; bottom: 0 !important; left: 0 !important; right: 0 !important; width: 100% !important; background: #0d0d0d !important; border-top: 1px solid rgba(255,255,255,0.08); padding: 16px !important; padding-bottom: calc(16px + env(safe-area-inset-bottom)) !important; }

                /* Mobile-specific components */
                .patient-header { position: sticky; top: 0; z-index: 5; background: #050505; margin-top: -20px; padding-top: 20px !important; border-top-left-radius: 0 !important; border-top-right-radius: 0 !important; }
                .mobile-toggle-container { display: flex; gap: 4px; background: rgba(255,255,255,0.06); padding: 4px; border-radius: 99px; margin-bottom: 24px; }
                .mobile-toggle-btn { flex: 1; border-radius: 99px; padding: 10px 0; font-family: 'Space Grotesk', sans-serif; font-size: 15px; font-weight: 700; color: #9ca3af; text-align: center; border: none; background: transparent; cursor: pointer; transition: 0.2s; }
                .mobile-toggle-btn.active { background: ${NEON}; color: #000; }
                .mobile-panel[data-hidden="true"] { display: none !important; }
                
                .predictions-grid { display: flex !important; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 12px; margin-right: -20px; padding-right: 20px; }
                .predictions-grid > div { min-width: 78vw; scroll-snap-align: start; }
                
                .vitals-card { padding: 16px !important; }
                .vitals-value { font-size: 28px !important; }

                @media (min-width: 960px) {
                    .page-wrapper { overflow: hidden !important; height: 100vh !important; }
                    .scroll-column { overflow-y: auto !important; flex: 1 !important; }
                    .profile-layout { flex-direction: row !important; }
                    .divider-desktop { display: flex !important; }
                    .cta-container { position: sticky !important; bottom: -40px !important; margin-left: -40px !important; margin-right: -40px !important; padding: 40px !important; padding-bottom: 40px !important; width: auto !important; background: linear-gradient(to top, rgba(13,13,13,1) 70%, transparent) !important; border-top: none !important; }
                    
                    /* Reset mobile-only components */
                    .patient-header { position: relative !important; top: auto !important; z-index: auto !important; background: rgba(25, 25, 25, 0.5) !important; margin-top: 0 !important; padding-top: clamp(20px, 2.5vw, 32px) !important; border-radius: 16px !important; }
                    .mobile-toggle-container { display: none !important; }
                    .mobile-panel[data-hidden="true"] { display: block !important; }
                    
                    .predictions-grid { display: grid !important; overflow-x: visible !important; margin-right: 0 !important; padding-right: 0 !important; }
                    .predictions-grid > div { min-width: 0 !important; }
                    
                    .vitals-card { padding: 20px !important; }
                    .vitals-value { font-size: 36px !important; }
                }
            `}</style>
        </div>
    );
};

export default PatientProfile;


