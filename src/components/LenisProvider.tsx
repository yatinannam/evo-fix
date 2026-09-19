'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';

// Singleton so any component can access the global Lenis instance
let globalLenis: Lenis | null = null;
export const getGlobalLenis = () => globalLenis;

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      return;
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1,
      lerp: 0.1,
      syncTouch: true,
      syncTouchLerp: 0.075,
    });

    lenisRef.current = lenis;
    globalLenis = lenis;

    let rafId: number | null = null;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };

    const startRaf = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(raf);
    };

    const stopRaf = () => {
      if (rafId === null) return;
      cancelAnimationFrame(rafId);
      rafId = null;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopRaf();
      } else {
        startRaf();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startRaf();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      stopRaf();
      lenis.destroy();
      lenisRef.current = null;
      globalLenis = null;
    };
  }, []);

  return <>{children}</>;
}
