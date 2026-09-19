"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Activity, ArrowRight } from 'lucide-react';
import Header from '@/evodoc-components/demo-components/Header';
import { departments } from '@/evodoc-data/profiles';
import { Button } from '@/evodoc-components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectPopup,
    SelectItem,
} from '@/evodoc-components/ui/select';

const NEON = '#e1ff00';

const Welcome = () => {
    const router = useRouter();
    const [selectedDept, setSelectedDept] = useState('');

    return (
        <div suppressHydrationWarning style={{ height: '100vh', width: '100%', backgroundColor: '#050505', color: '#fff', fontFamily: "'Outfit', 'Inter', -apple-system, sans-serif", display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            {/* Backgrounds */}
            <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60%', height: '80%', background: `radial-gradient(circle, ${NEON}15 0%, transparent 70%)`, filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '60%', height: '80%', background: `radial-gradient(circle, ${NEON}08 0%, transparent 70%)`, filter: 'blur(80px)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, pointerEvents: 'none', backgroundImage: `linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)`, backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)', WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)' }} />

            <div style={{ position: 'relative', zIndex: 10, flexShrink: 0 }}>
                <Header />
            </div>

            <div className="demo-main-container" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'clamp(16px, 4vw, 80px) clamp(12px, 4vw, 60px)', position: 'relative', zIndex: 5, width: '100%', maxWidth: 1400, margin: '0 auto' }}>
                <div className="hero-grid" style={{ display: 'flex', flexDirection: 'column', gap: 60, width: '100%' }}>

                    {/* Text Column */}
                    <div className="hero-text-col" style={{ display: 'flex', flexDirection: 'column', gap: 28, alignItems: 'center', textAlign: 'center', flex: 1.2 }}>

                        <h1 className="hero-h1" style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(2.5rem, 10vw, 8rem)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', textTransform: 'uppercase' }}>
                            Next-Gen
                            <br />
                            <span style={{ color: 'transparent', WebkitTextStroke: `1px ${NEON}`, backgroundImage: `linear-gradient(135deg, ${NEON}, #fff)`, WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                                Clinical AI
                            </span>
                        </h1>

                        <p className="hero-subtext-desktop" style={{ color: '#a1a1aa', fontSize: 'clamp(1.1rem, 1.5vw, 1.3rem)', lineHeight: 1.6, maxWidth: 540, fontWeight: 400, letterSpacing: '0.01em' }}>
                            Experience the future of offline medical diagnostics. A unified support system designed to assist doctors with secure, reliable, and intelligent predictions.
                        </p>
                        <p className="hero-subtext-mobile" style={{ color: '#a1a1aa', fontSize: '1.35rem', lineHeight: 1.4, fontWeight: 500, letterSpacing: '0.01em' }}>
                            Try It Yourself
                        </p>
                    </div>

                    {/* Interaction Card */}
                    <div style={{ display: 'flex', justifyContent: 'center', flex: 1, width: '100%' }}>
                        <div style={{ width: '100%', maxWidth: 460, background: 'rgba(30, 30, 32, 0.4)', backdropFilter: 'blur(60px) saturate(180%)', WebkitBackdropFilter: 'blur(60px) saturate(180%)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: 32, padding: 'clamp(24px, 5vw, 48px)', boxShadow: '0 30px 60px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1)', position: 'relative', overflow: 'hidden' }}>
                            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, transparent, ${NEON}, transparent)` }} />

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, backgroundColor: 'rgba(225,255,0,0.1)', borderRadius: 20, marginBottom: 24 }}>
                                <Activity size={32} color={NEON} strokeWidth={2.5} />
                            </div>

                            <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: '2.2rem', fontWeight: 700, color: '#fff', marginBottom: 12, lineHeight: 1.2 }}>Begin Demo</h3>
                            <p style={{ color: '#9ca3af', fontSize: 15, marginBottom: 32, lineHeight: 1.5, fontWeight: 400 }}>
                                Select a medical specialty below to load simulated patient profiles and explore the AI diagnostic workflow.
                            </p>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                <Select value={selectedDept} onValueChange={setSelectedDept}>
                                    <SelectTrigger
                                        className="w-full min-h-[52px] rounded-2xl text-base font-medium border-white/20 bg-black/40 text-white px-5 hover:border-white/30 focus-visible:border-neon-green/60 focus-visible:ring-neon-green/20"
                                        style={{ fontFamily: "'Outfit', sans-serif" }}
                                    >
                                        <SelectValue placeholder="Choose Specialty" className="text-zinc-500" />
                                    </SelectTrigger>
                                    <SelectPopup className="bg-[#1a1d1f] border-white/10">
                                        {departments.map(dept => (
                                            <SelectItem key={dept.id} value={dept.id} className="text-white hover:bg-white/8 data-highlighted:bg-white/8 data-highlighted:text-white">
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectPopup>
                                </Select>

                                <Button
                                    size="xl"
                                    onClick={() => router.push(`/evodoc/demo/profile/${selectedDept}`)}
                                    disabled={!selectedDept}
                                    className="w-full rounded-2xl bg-neon-green text-black font-extrabold uppercase tracking-wider hover:bg-white disabled:opacity-30 gap-3 shadow-[0_10px_30px_rgba(225,255,0,0.4)] disabled:shadow-none"
                                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                                >
                                    Proceed to Dashboard <ArrowRight size={20} strokeWidth={3} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes pulse { 0% { opacity:1; transform:scale(1); } 50% { opacity:0.5; transform:scale(1.2); } 100% { opacity:1; transform:scale(1); } }
                .hero-subtext-desktop { display: none; }
                .hero-subtext-mobile { display: block; }
                @media (max-width: 1023px) {
                    .demo-main-container { padding-top: 12px !important; padding-bottom: 24px !important; }
                    .hero-grid { gap: 16px !important; }
                    .hero-text-col { gap: 8px !important; }
                    .hero-h1 { font-size: clamp(2.3rem, 9vw, 3.2rem) !important; margin-bottom: 4px !important; }
                }
                @media (min-width: 1024px) {
                    .hero-subtext-desktop { display: block; }
                    .hero-subtext-mobile { display: none; }
                    .hero-grid { flex-direction: row !important; justify-content: space-between; align-items: center; gap: 60px !important; }
                    .hero-text-col { align-items: flex-start !important; text-align: left !important; gap: 28px !important; }
                }
            `}</style>
        </div>
    );
};

export default Welcome;
