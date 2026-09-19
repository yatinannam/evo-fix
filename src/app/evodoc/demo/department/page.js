"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { departments } from '@/evodoc-data/profiles';
import { ChevronRight } from 'lucide-react';
import Header from '@/evodoc-components/demo-components/Header';
import { Button } from '@/evodoc-components/ui/button';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectPopup,
    SelectItem,
} from '@/evodoc-components/ui/select';

const NEON = '#e1ff00';

const DepartmentSelect = () => {
    const router = useRouter();
    const [selectedDept, setSelectedDept] = useState('');

    return (
        <div style={{ minHeight: '100vh', width: '100%', backgroundColor: '#0d0d0d', color: '#fff', fontFamily: 'Inter, -apple-system, sans-serif', display: 'flex', flexDirection: 'column' }}>
            <Header />

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: 'clamp(32px, 6vw, 80px) clamp(16px, 4vw, 32px)', width: '100%' }}>
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: 'clamp(24px, 4vw, 48px)', position: 'relative' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 300, background: `radial-gradient(ellipse, ${NEON}18 0%, transparent 70%)`, pointerEvents: 'none', zIndex: 0 }} />
                    <div style={{ position: 'relative', zIndex: 1 }}>
                        <h2 style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', fontWeight: 900, letterSpacing: '-0.03em', color: '#fff', marginBottom: 12 }}>Select Your Specialty</h2>
                        <p style={{ color: '#9ca3af', fontSize: 'clamp(0.9rem, 1.5vw, 1.1rem)', maxWidth: 500, margin: '0 auto', lineHeight: 1.6 }}>
                            Choose a department to analyze curated patient scenarios with real-time decision support.
                        </p>
                    </div>
                </div>

                {/* Card */}
                <div style={{ width: '100%', maxWidth: 520, backgroundColor: '#1a1d1f', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 24, padding: 'clamp(24px, 4vw, 40px)', boxShadow: '0 0 60px rgba(0,0,0,0.5)' }}>
                    <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', fontWeight: 700, color: '#fff', textAlign: 'center', marginBottom: 24, lineHeight: 1.4 }}>
                        Select from the following specialities to try demo
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <Select value={selectedDept} onValueChange={setSelectedDept}>
                            <SelectTrigger
                                className="w-full min-h-[44px] rounded-xl text-base font-medium border-white/15 bg-[#121416] text-white data-placeholder:text-zinc-500 hover:border-white/25 focus-visible:border-neon-green/60 focus-visible:ring-neon-green/20"
                                style={{ fontFamily: 'Inter, sans-serif' }}
                            >
                                <SelectValue placeholder="-- Choose Specialty --" />
                            </SelectTrigger>
                            <SelectPopup className="bg-[#1a1d1f] border-white/10">
                                {departments.map(dept => (
                                    <SelectItem key={dept.id} value={dept.id} className="text-white data-highlighted:bg-white/8 data-highlighted:text-white">
                                        {dept.name}
                                    </SelectItem>
                                ))}
                            </SelectPopup>
                        </Select>

                        <Button
                            size="lg"
                            onClick={() => router.push(`/evodoc/demo/profile/${selectedDept}`)}
                            disabled={!selectedDept}
                            className="w-full rounded-xl bg-neon-green text-black font-black uppercase tracking-widest hover:bg-white disabled:opacity-20 gap-2 shadow-[0_0_30px_rgba(225,255,0,0.4)] disabled:shadow-none"
                            style={{ fontFamily: 'Inter, sans-serif' }}
                        >
                            Next <ChevronRight size={18} strokeWidth={3} />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentSelect;
