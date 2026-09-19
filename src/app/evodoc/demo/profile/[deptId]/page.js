"use client";

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { profiles, departments } from '@/evodoc-data/profiles';
import { ArrowRight, Activity, AlertCircle } from 'lucide-react';
import Header from '@/evodoc-components/demo-components/Header';
import { Button } from '@/evodoc-components/ui/button';
import { Badge } from '@/evodoc-components/ui/badge';

const NEON = '#e1ff00';

const ProfileSelect = () => {
    const { deptId } = useParams();
    const router = useRouter();

    const departmentName = departments.find(d => d.id === deptId)?.name || 'Department';
    const patients = profiles[deptId] || [];

    return (
        <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#0d0d0d', color: '#fff', fontFamily: 'Inter, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <div style={{ flex: 1, maxWidth: 1200, margin: '0 auto', width: '100%', padding: 'clamp(24px, 4vw, 56px) clamp(16px, 4vw, 40px)' }}>
                {/* Page Header */}
                <div style={{ marginBottom: 'clamp(24px, 4vw, 48px)', paddingBottom: 'clamp(16px, 3vw, 32px)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', gap: 16, position: 'relative' }}>
                    <div style={{ position: 'absolute', bottom: 0, left: 0, width: 80, height: 2, backgroundColor: NEON, boxShadow: `0 0 15px ${NEON}` }} />
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: NEON, animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: 11, fontWeight: 900, color: NEON, textTransform: 'uppercase', letterSpacing: '0.15em' }}>Live Environment</span>
                        </div>
                        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 8 }}>
                            {departmentName} <span style={{ color: '#374151' }}>Cases</span>
                        </h2>
                        <p style={{ color: '#9ca3af', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', fontWeight: 300 }}>
                            Select a patient profile to initiate the automated diagnosis workflow.
                        </p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/evodoc/demo/department')}
                        className="text-zinc-500 hover:text-white uppercase tracking-wider text-xs font-bold"
                    >
                        ← Change Specialty
                    </Button>
                </div>

                {/* Patient Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 480px), 1fr))', gap: 'clamp(16px, 3vw, 32px)' }}>
                    {patients.map(patient => (
                        <div
                            key={patient.id}
                            style={{ backgroundColor: '#1a1d1f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 24, padding: 'clamp(20px, 3vw, 36px)', position: 'relative', overflow: 'hidden', transition: 'all 0.3s' }}
                            onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${NEON}55`; e.currentTarget.style.boxShadow = `0 0 50px ${NEON}18`; }}
                            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
                        >
                            {/* Patient Name */}
                            <div style={{ marginBottom: 'clamp(16px, 3vw, 28px)' }}>
                                <h3 style={{ fontSize: 'clamp(1.4rem, 2.5vw, 1.9rem)', fontWeight: 800, color: '#fff', marginBottom: 10 }}>{patient.name}</h3>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    <Badge variant="outline" className="border-white/10 text-zinc-300 bg-white/5">{patient.age} Years</Badge>
                                    <Badge variant="outline" className="border-white/10 text-zinc-300 bg-white/5">{patient.gender}</Badge>
                                </div>
                            </div>

                            {/* Symptoms */}
                            <div style={{ backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 14, padding: 'clamp(12px, 2vw, 20px)', border: '1px solid rgba(255,255,255,0.05)', marginBottom: 16 }}>
                                <h4 style={{ fontSize: 10, color: NEON, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Activity size={11} /> Reported Symptoms
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                    {patient.symptoms.map((s, i) => (
                                        <Badge key={i} variant="outline" className="border-white/8 text-zinc-300 bg-white/5 font-medium">{s}</Badge>
                                    ))}
                                </div>
                            </div>

                            {/* Risk Factor */}
                            {patient.contraindications.length > 0 && (
                                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: 'clamp(10px, 2vw, 16px)', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 14, marginBottom: 16 }}>
                                    <div style={{ padding: 8, backgroundColor: 'rgba(239,68,68,0.1)', borderRadius: 8, flexShrink: 0 }}>
                                        <AlertCircle color="#ef4444" size={15} />
                                    </div>
                                    <div>
                                        <h4 style={{ fontSize: 10, color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Risk Factor Identified</h4>
                                        <p style={{ fontSize: 'clamp(0.75rem, 1.2vw, 0.875rem)', color: '#9ca3af', fontWeight: 500 }}>{patient.contraindications[0]}</p>
                                    </div>
                                </div>
                            )}

                            {/* CTA Button */}
                            <Button
                                onClick={() => router.push(`/evodoc/demo/patient/${patient.id}`)}
                                variant="outline"
                                size="lg"
                                className="w-full border-neon-green/30 text-neon-green bg-transparent hover:bg-neon-green hover:text-black uppercase tracking-wider text-sm font-bold gap-2 rounded-2xl mt-1"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                View Patient Profile <ArrowRight size={16} strokeWidth={3} />
                            </Button>
                        </div>
                    ))}
                </div>
            </div>

            <style>{`@keyframes pulse { 0%,100% { opacity:1 } 50% { opacity:0.4 } }`}</style>
        </div>
    );
};

export default ProfileSelect;
