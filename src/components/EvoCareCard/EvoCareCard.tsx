import Link from 'next/link';
import styles from './EvoCareCard.module.css';

export default function EvoCareCard() {
  return (
    <article className={`${styles.card} ${styles.cardRight}`}>
      {/* ── Caring hands + heart illustration ── */}
      <div className={styles.illo} aria-hidden="true">
        <svg viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.illoSvg}>
          <defs>
            <radialGradient id="heartGrad" cx="50%" cy="38%" r="62%">
              <stop offset="0%" stopColor="#ffb3c6"/>
              <stop offset="45%" stopColor="#f0476b"/>
              <stop offset="100%" stopColor="#b5193e"/>
            </radialGradient>
            <radialGradient id="glowRing" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(116,211,224,0.14)"/>
              <stop offset="100%" stopColor="rgba(116,211,224,0)"/>
            </radialGradient>
            <filter id="heartGlow">
              <feGaussianBlur stdDeviation="3" result="blur"/>
              <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
            </filter>
          </defs>

          {/* Soft ambient glow */}
          <circle cx="110" cy="125" r="78" fill="url(#glowRing)"/>
          {/* Dashed orbit */}
          <circle cx="110" cy="125" r="68" stroke="rgba(116,211,224,0.18)" strokeWidth="1" strokeDasharray="4 9"/>

          {/* Heart shape */}
          <path
            d="M110 170 C110 170 68 142 68 114 C68 98 79 87 93 87 C100 87 106 91 110 97 C114 91 120 87 127 87 C141 87 152 98 152 114 C152 142 110 170 110 170Z"
            fill="url(#heartGrad)"
            filter="url(#heartGlow)"
          />
          {/* ECG pulse inside heart */}
          <path d="M86 128 L93 128 L97 117 L102 139 L107 124 L111 128 L134 128"
            stroke="rgba(255,255,255,0.65)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>

          {/* Sparkle dots */}
          <circle cx="68" cy="70" r="3.5" fill="#74d3e0" opacity="0.45"/>
          <circle cx="152" cy="66" r="2.5" fill="#74d3e0" opacity="0.35"/>
          <circle cx="55" cy="98" r="2" fill="#f0476b" opacity="0.5"/>
          <circle cx="165" cy="94" r="2" fill="#f0476b" opacity="0.5"/>
          <circle cx="88" cy="52" r="2" fill="#74d3e0" opacity="0.3"/>
          <circle cx="132" cy="50" r="1.5" fill="#f0476b" opacity="0.38"/>
          <circle cx="44" cy="128" r="1.5" fill="#74d3e0" opacity="0.3"/>
          <circle cx="176" cy="124" r="1.5" fill="#74d3e0" opacity="0.3"/>
        </svg>
      </div>

      <h2 className={styles.cardTitle}>
        <span className={styles.a}>Evo</span><span className={styles.b}>Care</span>
      </h2>
      <p className={styles.cardSub}>Your health companion</p>
      <p className={styles.featureDesc}>
        Store records, get reminders, track health — all in one place.
      </p>

      <ul className={styles.features} role="list">
        <li className={styles.feature}>
          <span className={styles.glassIcon}>
            <svg viewBox="0 0 24 24">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
          </span>
          Unified medical records
        </li>
        <li className={styles.feature}>
          <span className={styles.glassIcon}>
            <svg viewBox="0 0 24 24">
              <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
              <polyline points="14 3 14 8 19 8" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
          </span>
          AI document summaries
        </li>
        <li className={styles.feature}>
          <span className={styles.glassIcon}>
            <svg viewBox="0 0 24 24">
              <circle cx="9" cy="8" r="3" />
              <circle cx="17" cy="9" r="2.4" />
              <path d="M3 20v-1a5 5 0 0 1 10 0v1" />
              <path d="M14.5 20v-1a4 4 0 0 1 6.5-3.1" />
            </svg>
          </span>
          Family health tracking
        </li>
        <li className={styles.feature}>
          <span className={styles.glassIcon}>
            <svg viewBox="0 0 24 24">
              <path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7 2.5 7H3.5S6 15 6 9z" />
              <path d="M10 20a2 2 0 0 0 4 0" />
            </svg>
          </span>
          Smart reminders
        </li>
      </ul>

      <a href="/evocare" className={styles.cardCta}>
        Explore EvoCare
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="4" y1="12" x2="20" y2="12" />
          <polyline points="14 6 20 12 14 18" />
        </svg>
      </a>
    </article>
  );
}
