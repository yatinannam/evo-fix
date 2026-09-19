"use client";
/**
 * components/dashboard/Rise.js
 * Pure-CSS staggered fade-up entrance — zero JS overhead.
 * Respects prefers-reduced-motion via CSS media query in globals.css.
 */
export function Rise({ children, delay = 0, className = "" }) {
  return (
    <div
      className={`d-rise ${className}`}
      style={delay ? { animationDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
