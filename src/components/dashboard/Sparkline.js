"use client";
/**
 * components/dashboard/Sparkline.js
 * Minimal SVG sparkline with optional normal-range band.
 * No gradients, no area fill — clinical context, not decoration.
 */
export function Sparkline({
  values = [],
  band,
  bandFill = "#f1f5f9",
  width = 220,
  height = 56,
  stroke = "#3D8E99",
  strokeWidth = 2,
  className = "",
}) {
  if (values.length < 2) return null;

  const pad = 4;
  const domainMin = Math.min(...values, band?.min ?? Infinity);
  const domainMax = Math.max(...values, band?.max ?? -Infinity);
  const range = domainMax - domainMin || 1;
  const stepX = (width - pad * 2) / (values.length - 1);

  const y = (v) => pad + (height - pad * 2) * (1 - (v - domainMin) / range);
  const points = values.map((v, i) => [pad + i * stepX, y(v)]);
  const line = points.map(([px, py]) => `${px},${py}`).join(" ");
  const last = points[points.length - 1];

  return (
    <svg
      className={className}
      width="100%"
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {band && (
        <rect
          x={0}
          y={y(band.max)}
          width={width}
          height={Math.max(0, y(band.min) - y(band.max))}
          fill={bandFill}
        />
      )}
      <polyline
        points={line}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r={2.5} fill={stroke} />
    </svg>
  );
}
