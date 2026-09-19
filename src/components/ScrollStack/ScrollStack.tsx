'use client';

import { useLayoutEffect, useRef, useCallback, ReactNode } from 'react';
import Lenis from 'lenis';
import { getGlobalLenis } from '@/components/LenisProvider';
import './ScrollStack.css';

interface ScrollStackItemProps {
  children: ReactNode;
  itemClassName?: string;
}

export const ScrollStackItem = ({ children, itemClassName = '' }: ScrollStackItemProps) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

interface ScrollStackProps {
  children: ReactNode;
  className?: string;
  itemDistance?: number;
  itemScale?: number;
  itemStackDistance?: number;
  stackPosition?: string;
  scaleEndPosition?: string;
  baseScale?: number;
  scaleDuration?: number;
  rotationAmount?: number;
  blurAmount?: number;
  useWindowScroll?: boolean;
  onStackComplete?: () => void;
}

const ScrollStack = ({
  children,
  className = '',
  itemDistance = 100,
  itemScale = 0.03,
  itemStackDistance = 30,
  stackPosition = '20%',
  scaleEndPosition = '10%',
  baseScale = 0.85,
  scaleDuration = 0.5,
  rotationAmount = 0,
  blurAmount = 0,
  useWindowScroll = false,
  onStackComplete,
}: ScrollStackProps) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const stackCompletedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const cardsRef = useRef<HTMLElement[]>([]);
  // Cache natural (pre-transform) offsets so getBoundingClientRect
  // feedback loops don't cause jitter
  const cardOffsetsRef = useRef<number[]>([]);
  const endOffsetRef = useRef<number>(0);

  const calculateProgress = useCallback((scrollTop: number, start: number, end: number) => {
    if (scrollTop < start) return 0;
    if (scrollTop > end) return 1;
    return (scrollTop - start) / (end - start);
  }, []);

  const parsePercentage = useCallback((value: string | number, containerHeight: number) => {
    if (typeof value === 'string' && value.includes('%')) {
      return (parseFloat(value) / 100) * containerHeight;
    }
    return parseFloat(value as string);
  }, []);

  // Cache all card offsets BEFORE any transforms are applied
  const cacheOffsets = useCallback(() => {
    const cards = cardsRef.current;
    if (!cards.length) return;

    if (useWindowScroll) {
      // Temporarily reset all transforms so we read natural positions
      cards.forEach(c => { c.style.transform = 'none'; });

      cardOffsetsRef.current = cards.map(card => {
        const rect = card.getBoundingClientRect();
        return rect.top + window.scrollY;
      });

      const endEl = document.querySelector('.scroll-stack-end') as HTMLElement | null;
      if (endEl) {
        const endRect = endEl.getBoundingClientRect();
        endOffsetRef.current = endRect.top + window.scrollY;
      }

      // Restore transforms (they'll be recalculated immediately)
      cards.forEach(c => { c.style.transform = 'translateZ(0)'; });
    } else {
      cardOffsetsRef.current = cards.map(card => card.offsetTop);
      const endEl = scrollerRef.current?.querySelector('.scroll-stack-end') as HTMLElement | null;
      endOffsetRef.current = endEl?.offsetTop ?? 0;
    }
  }, [useWindowScroll]);

  const updateCardTransforms = useCallback(() => {
    if (!cardsRef.current.length) return;

    const scrollTop = useWindowScroll ? window.scrollY : (scrollerRef.current?.scrollTop ?? 0);
    const containerHeight = useWindowScroll ? window.innerHeight : (scrollerRef.current?.clientHeight ?? 0);

    const stackPositionPx = parsePercentage(stackPosition, containerHeight);
    const scaleEndPositionPx = parsePercentage(scaleEndPosition, containerHeight);
    const endElementTop = endOffsetRef.current;

    cardsRef.current.forEach((card, i) => {
      if (!card) return;

      // Use cached natural offset — not affected by transforms
      const cardTop = cardOffsetsRef.current[i] ?? 0;

      const triggerStart = cardTop - stackPositionPx - itemStackDistance * i;
      const triggerEnd   = cardTop - scaleEndPositionPx;
      const pinStart     = triggerStart;
      const pinEnd       = endElementTop - containerHeight / 2;

      const scaleProgress = calculateProgress(scrollTop, triggerStart, triggerEnd);
      const targetScale   = baseScale + i * itemScale;
      const scale         = 1 - scaleProgress * (1 - targetScale);
      const rotation      = rotationAmount ? i * rotationAmount * scaleProgress : 0;

      let blur = 0;
      if (blurAmount) {
        let topCardIndex = 0;
        for (let j = 0; j < cardsRef.current.length; j++) {
          const jTriggerStart = (cardOffsetsRef.current[j] ?? 0) - stackPositionPx - itemStackDistance * j;
          if (scrollTop >= jTriggerStart) topCardIndex = j;
        }
        if (i < topCardIndex) blur = Math.max(0, (topCardIndex - i) * blurAmount);
      }

      let translateY = 0;
      if (scrollTop >= pinStart && scrollTop <= pinEnd) {
        translateY = scrollTop - cardTop + stackPositionPx + itemStackDistance * i;
      } else if (scrollTop > pinEnd) {
        translateY = pinEnd - cardTop + stackPositionPx + itemStackDistance * i;
      }

      card.style.transform = `translate3d(0, ${translateY}px, 0) scale(${scale}) rotate(${rotation}deg)`;
      if (blurAmount) {
        card.style.filter = blur > 0 ? `blur(${blur}px)` : '';
      }

      if (i === cardsRef.current.length - 1) {
        const isInView = scrollTop >= pinStart && scrollTop <= pinEnd;
        if (isInView && !stackCompletedRef.current) {
          stackCompletedRef.current = true;
          onStackComplete?.();
        } else if (!isInView && stackCompletedRef.current) {
          stackCompletedRef.current = false;
        }
      }
    });
  }, [
    itemScale, itemStackDistance, stackPosition, scaleEndPosition,
    baseScale, rotationAmount, blurAmount, useWindowScroll,
    onStackComplete, calculateProgress, parsePercentage,
  ]);

  useLayoutEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const cards = Array.from(
      useWindowScroll
        ? scroller.querySelectorAll('.scroll-stack-card')
        : scroller.querySelectorAll('.scroll-stack-card')
    ) as HTMLElement[];

    cardsRef.current = cards;

    // Set up card styles before caching offsets
    cards.forEach((card, i) => {
      if (i < cards.length - 1) card.style.marginBottom = `${itemDistance}px`;
      card.style.willChange      = 'transform';
      card.style.transformOrigin = 'top center';
      card.style.backfaceVisibility = 'hidden';
    });

    // Cache natural offsets (no transforms applied yet)
    cacheOffsets();

    // Re-cache on resize so layout shifts don't cause jitter
    const handleResize = () => cacheOffsets();
    window.addEventListener('resize', handleResize);

    // Set up Lenis smooth scroll + RAF loop
    let lenis: Lenis;
    let ownedLenis = false;

    if (useWindowScroll) {
      // Tap into the global Lenis instance created by LenisProvider
      const global = getGlobalLenis();
      if (global) {
        lenis = global;
      } else {
        // Fallback: create our own if provider isn't mounted
        lenis = new Lenis({
          duration: 1.2,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          wheelMultiplier: 1,
          lerp: 0.1,
          syncTouch: true,
          syncTouchLerp: 0.075,
        });
        ownedLenis = true;
      }
    } else {
      lenis = new Lenis({
        wrapper: scroller,
        content: scroller.querySelector('.scroll-stack-inner') as HTMLElement,
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 1,
        lerp: 0.1,
        syncTouch: true,
        syncTouchLerp: 0.075,
      });
      ownedLenis = true;
    }

    lenisRef.current = lenis;

    // Subscribe to scroll events — updateCardTransforms runs on every lenis tick
    lenis.on('scroll', updateCardTransforms);

    // Only own the RAF loop if we created this Lenis instance
    if (ownedLenis) {
      const raf = (time: number) => {
        lenis.raf(time);
        animationFrameRef.current = requestAnimationFrame(raf);
      };
      animationFrameRef.current = requestAnimationFrame(raf);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      lenis.off('scroll', updateCardTransforms);
      if (ownedLenis) {
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        lenis.destroy();
      }
      stackCompletedRef.current = false;
      cardsRef.current = [];
      cardOffsetsRef.current = [];
    };
  }, [
    itemDistance, itemScale, itemStackDistance, stackPosition, scaleEndPosition,
    baseScale, scaleDuration, rotationAmount, blurAmount, useWindowScroll,
    onStackComplete, cacheOffsets, updateCardTransforms,
  ]);

  return (
    <div className={`scroll-stack-scroller ${className}`.trim()} ref={scrollerRef}>
      <div className="scroll-stack-inner">
        {children}
        <div className="scroll-stack-end" />
      </div>
    </div>
  );
};

export default ScrollStack;
