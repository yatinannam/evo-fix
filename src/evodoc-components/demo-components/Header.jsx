"use client";
import React, { useState, useEffect } from 'react';
import { Home } from 'lucide-react';
import { useRouter } from "next/navigation";
import { Button } from '@/evodoc-components/ui/button';

const NEON = '#e1ff00';

const Header = () => {
    const router = useRouter();
    const [time, setTime] = useState(null);

    useEffect(() => {
        setTime(new Date());
        const timer = setInterval(() => setTime(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <nav suppressHydrationWarning style={{
            position: 'sticky', top: 0, zIndex: 50, width: '100%',
            background: 'rgba(30, 30, 32, 0.4)',
            backdropFilter: 'blur(60px) saturate(180%)',
            WebkitBackdropFilter: 'blur(60px) saturate(180%)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
            fontFamily: "'Outfit', sans-serif"
        }}>
            {/* Warning Banner */}
            <div style={{
                backgroundColor: NEON, color: '#000', textAlign: 'center',
                fontSize: 'clamp(10px, 1.5vw, 12px)', fontWeight: 800,
                padding: '6px 12px', letterSpacing: '0.1em', textTransform: 'uppercase', width: '100%',
                fontFamily: "'Space Grotesk', sans-serif"
            }}>
                ⚠️ This is a Demo System. All the data is mock Data
            </div>

            {/* Main Nav Bar */}
            <div style={{
                padding: 'clamp(10px, 1.5vw, 16px) clamp(16px, 3vw, 32px)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
                {/* Left: Logo & Clinic */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 1.5vw, 16px)' }}>
                    <div onClick={() => router.push('/')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                        <img src="/logo.png" alt="EvoDoc Logo" style={{ height: 'clamp(28px, 3vw, 36px)', width: 'auto', objectFit: 'contain' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <p style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 'clamp(11px, 1.3vw, 14px)', color: '#d1d5db', fontWeight: 600, margin: 0, letterSpacing: '0.05em' }}>
                            Sundaram Family Clinic
                        </p>
                        <p style={{ fontSize: 'clamp(10px, 1.1vw, 12px)', color: '#6b7280', fontWeight: 500, margin: 0 }}>
                            Consultation Room 2
                        </p>
                    </div>
                </div>

                {/* Right: Home Button */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 24px)' }}>
                    <div style={{ width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.1)' }} />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push('/')}
                        className="hidden-mobile gap-1.5 border-white/10 bg-transparent text-zinc-400 uppercase tracking-widest text-[10px] font-bold hover:bg-white/5 hover:text-white hover:border-white/30"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                        <Home size={14} />
                        <span className="hidden-mobile-text">Home</span>
                    </Button>
                </div>
            </div>
            <style>{`
                @media (max-width: 600px) {
                    .hidden-mobile-text { display: none; }
                }
            `}</style>
        </nav>
    );
};

export default Header;

