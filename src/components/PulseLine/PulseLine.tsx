'use client';
import styles from './PulseLine.module.css';

/**
 * PulseLine — animated ECG heartbeat that spans the full hero row.
 *
 * SVG viewBox: 0 0 1000 200   (preserveAspectRatio="none" → stretches to fit)
 * Baseline: y = 100
 *
 * Layout (in 1000-unit space):
 *   0   – 240  : flat across EvoDoc card area
 *   240 – 420  : three PQRST complexes (left side)
 *   420 – 580  : flat baseline through heart
 *   580 – 760  : three PQRST complexes (right side)
 *   760 – 1000 : flat across EvoCare card area
 */

const BASE = 100; // baseline y

/** One PQRST cardiac cycle, 60 units wide, baseline = BASE */
function pqrst(x: number): string {
  const b = BASE;
  return [
    // ── P wave (small positive bump) ──
    `L ${x},${b}`,
    `C ${x + 4},${b} ${x + 5},${b - 7} ${x + 9},${b - 7}`,
    `C ${x + 13},${b - 7} ${x + 14},${b} ${x + 18},${b}`,
    // ── PR segment (flat) ──
    `L ${x + 22},${b}`,
    // ── Q (small dip) ──
    `L ${x + 23},${b + 5}`,
    // ── R (sharp tall spike up) ──
    `L ${x + 26},${b - 52}`,
    // ── S (sharp dip below baseline) ──
    `L ${x + 29},${b + 14}`,
    // ── ST segment back to baseline ──
    `L ${x + 32},${b}`,
    // ── T wave (smooth positive bump) ──
    `L ${x + 36},${b}`,
    `C ${x + 38},${b} ${x + 40},${b - 15} ${x + 44},${b - 15}`,
    `C ${x + 48},${b - 15} ${x + 50},${b} ${x + 54},${b}`,
    // ── TP flat ──
    `L ${x + 60},${b}`,
  ].join(' ');
}

// Three complexes on left: starting x = 240, 300, 360
// Three on right: starting x = 580, 640, 700
const ECG_PATH = [
  `M 0,${BASE}`,
  `L 240,${BASE}`,          // flat across left card
  pqrst(240),               // left complex 1
  pqrst(300),               // left complex 2
  pqrst(360),               // left complex 3
  `L 580,${BASE}`,          // flat across heart gap (420→580)
  pqrst(580),               // right complex 1
  pqrst(640),               // right complex 2
  pqrst(700),               // right complex 3
  // path ends at ~x=760 where the last complex finishes — no trailing flat
].join(' ');

// Estimated path length — used for stroke-dasharray
const PATH_LEN = 2600;

export default function PulseLine() {
  return (
    <div className={styles.wrapper} aria-hidden="true">
      <svg
        className={styles.svg}
        viewBox="0 0 1000 200"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        overflow="visible"
      >
        <defs>
          {/* Soft glow on main line */}
          <filter id="ecgGlow" x="-20%" y="-300%" width="140%" height="700%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Strong bloom on the traveling head */}
          <filter id="ecgHeadGlow" x="-60%" y="-600%" width="220%" height="1400%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b1" />
            <feGaussianBlur in="SourceGraphic" stdDeviation="2" result="b2" />
            <feMerge>
              <feMergeNode in="b1" />
              <feMergeNode in="b2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Edge fade mask — fades into the cards at both sides */}
          <linearGradient id="ecgFadeGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"   stopColor="white" stopOpacity="0" />
            <stop offset="14%"  stopColor="white" stopOpacity="0.6" />
            <stop offset="26%"  stopColor="white" stopOpacity="1" />
            <stop offset="74%"  stopColor="white" stopOpacity="1" />
            <stop offset="86%"  stopColor="white" stopOpacity="0.6" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <mask id="ecgFadeMask">
            <rect x="0" y="-500" width="1000" height="1200" fill="url(#ecgFadeGrad)" />
          </mask>
        </defs>

        {/* ── 1. Dim permanent trail ── */}
        <path
          d={ECG_PATH}
          fill="none"
          stroke="rgba(120,10,10,0.4)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          mask="url(#ecgFadeMask)"
        />

        {/* ── 2. Animated ECG line (draws L→R, then loops) ── */}
        <path
          className={styles.ecgLine}
          d={ECG_PATH}
          fill="none"
          stroke="#8b1a1a"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ecgGlow)"
          strokeDasharray={PATH_LEN}
          strokeDashoffset={PATH_LEN}
          mask="url(#ecgFadeMask)"
        />

        {/* ── 3. Bright glowing head traveling along the line ── */}
        <path
          className={styles.ecgHead}
          d={ECG_PATH}
          fill="none"
          stroke="#ff2222"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#ecgHeadGlow)"
          strokeDasharray={`20 ${PATH_LEN}`}
          strokeDashoffset={PATH_LEN}
          mask="url(#ecgFadeMask)"
        />
      </svg>
    </div>
  );
}
