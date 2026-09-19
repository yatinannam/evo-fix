'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import './glow-border-card.css';

export interface GlowBorderCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  width?: string;
  height?: string;
  aspectRatio?: string;
  borderRadius?: string;
  animationDuration?: number;
  gradientColors?: string[];
  borderWidth?: string;
  blurAmount?: string;
  inset?: string;
  colorPreset?: 'nature' | 'ocean' | 'sunset' | 'aurora' | 'neon' | 'custom';
  paused?: boolean;
}

const colorPresets: Record<string, string[]> = {
  nature:  ['#669900','#88bb22','#99cc33','#aaddaa','#ccee66','#006699','#228888','#3399cc','#55aacc','#669900'],
  ocean:   ['#006699','#1177aa','#2288bb','#3399cc','#44aadd','#55bbee','#66ccff','#44bbee','#2299cc','#006699'],
  sunset:  ['#ff6600','#ff7711','#ff8822','#ff9900','#ffaa22','#ffbb44','#ffcc00','#ff9933','#ff7722','#ff6600'],
  aurora:  ['#00ff87','#22ffaa','#44ffcc','#60efff','#88ddff','#bb99ff','#dd77ee','#ff68f0','#ff55cc','#00ff87'],
  // neon yellow theme matching EvoDoc
  neon:    ['#D6F303','#c8e500','#aacb00','#D6F303','#f2ff5e','#D6F303','#b8d400','#D6F303','#e8ff3a','#D6F303'],
  custom:  ['#669900','#99cc33','#ccee66','#006699','#3399cc','#990066','#cc3399','#ff6600','#ff9900','#ffcc00'],
};

export const GlowBorderCard = React.forwardRef<HTMLDivElement, GlowBorderCardProps>(
  (
    {
      children,
      className,
      width = '100%',
      height,
      aspectRatio,
      borderRadius = '1rem',
      animationDuration = 4,
      gradientColors,
      borderWidth = '1.5em',
      blurAmount = '0.75em',
      inset = '-1em',
      colorPreset = 'neon',
      paused = false,
      style,
      ...props
    },
    ref
  ) => {
    const colors = gradientColors || colorPresets[colorPreset] || colorPresets.neon;
    const colorVars: Record<string, string> = {};
    for (let i = 0; i < 10; i++) {
      colorVars[`--glow-color-${i + 1}`] = colors[i % colors.length];
    }

    return (
      <div
        ref={ref}
        className={cn('relative overflow-hidden isolate', className)}
        style={{
          width,
          height: height ?? 'auto',
          ...(aspectRatio ? { aspectRatio } : {}),
          borderRadius,
          '--glow-animation-duration': `${animationDuration}s`,
          ...colorVars,
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        {/* Rotating glow border */}
        <div
          className={cn('absolute -z-10 rounded-[inherit] glow-conic', paused && '[animation-play-state:paused]')}
          style={{
            inset,
            borderWidth,
            borderStyle: 'solid',
            filter: `blur(${blurAmount})`,
          }}
        />
        {/* Content */}
        <div className="relative z-10 w-full h-full">{children}</div>
      </div>
    );
  }
);

GlowBorderCard.displayName = 'GlowBorderCard';
export default GlowBorderCard;
