import Link from 'next/link';
import styles from './EvoDocCard.module.css';

export default function EvoDocCard() {
  return (
    <article className={`${styles.card} ${styles.cardLeft}`}>
      <div className={styles.illo} aria-hidden="true">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="-10 0 160 240.75" className={styles.illoSvg}>
          {/* Ground shadow */}
          <ellipse cx="70" cy="220" rx="33" ry="6" fill="rgba(225,255,0,0.12)"/>

          {/* Left earpiece */}
          <line className={styles.steth}
            x1="68.72" y1="15.21" x2="64.95" y2="2"/>

          {/* Left arm */}
          <path className={styles.steth}
            d="M66.44,8.55l-18,5.36S37.31,16.8,42.57,29.52C47.2,40.71,69.2,93.64,69.2,93.64s3.52,6,9.18,6h11"/>

          {/* Right earpiece */}
          <line className={styles.steth}
            x1="108.68" y1="15.21" x2="112.45" y2="2"/>

          {/* Right arm */}
          <path className={styles.steth}
            d="M112.72,8.55l18,5.36s11.15,2.89,5.89,15.61C132,40.71,110,93.64,110,93.64s-3.52,6-9.18,6h-11"/>

          {/* Main tube */}
          <path className={styles.steth}
            d="M89.34,99.61,89.56,190s-.9,26.36-19.67,28.6"/>

          {/* Hose */}
          <path className={styles.steth}
            d="M69.89,218.57s-11.69,2.59-18.77-12C45.51,195,26.8,127.34,26.8,127.34"/>

          {/* Disc */}
          <ellipse className={styles.steth}
            cx="20.99" cy="108.95" rx="18.99" ry="19.31"/>
        </svg>
      </div>



      <h2 className={styles.cardTitle}>
        <span className={styles.a}>Evo</span><span className={styles.b}>Doc</span>
      </h2>
      <p className={styles.cardSub}>
        Real-time insights, smarter documentation, better decisions.
      </p>

      <ul className={styles.features} role="list">
        <li className={styles.feature}>
          <span className={styles.glassIcon}>
            <svg viewBox="0 0 24 24">
              <rect x="4" y="3" width="16" height="18" rx="2" />
              <line x1="8" y1="8" x2="16" y2="8" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="16" x2="13" y2="16" />
            </svg>
          </span>
          Patient context at a glance
        </li>
        <li className={styles.feature}>
          <span className={styles.glassIcon}>
            <svg viewBox="0 0 24 24">
              <line x1="6" y1="20" x2="6" y2="13" />
              <line x1="12" y1="20" x2="12" y2="8" />
              <line x1="18" y1="20" x2="18" y2="11" />
              <line x1="3" y1="20" x2="21" y2="20" />
            </svg>
          </span>
          Smart timeline &amp; summaries
        </li>
        <li className={styles.feature}>
          <span className={styles.glassIcon}>
            <svg viewBox="0 0 24 24">
              <polygon points="13 2 4 14 11 14 10 22 20 9 13 9 13 2" />
            </svg>
          </span>
          Instant insights
        </li>
        <li className={styles.feature}>
          <span className={styles.glassIcon}>
            <svg viewBox="0 0 24 24">
              <path d="M9 3v6l-5 9a2 2 0 0 0 1.8 3h12.4a2 2 0 0 0 1.8-3l-5-9V3" />
              <line x1="8" y1="3" x2="16" y2="3" />
              <line x1="7" y1="15" x2="17" y2="15" />
            </svg>
          </span>
          Lab report analysis
        </li>
      </ul>

      <a href="/evodoc" className={styles.cardCta} style={{ textDecoration: 'none' }}>
        Explore EvoDoc
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <line x1="4" y1="12" x2="20" y2="12" />
          <polyline points="14 6 20 12 14 18" />
        </svg>
      </a>
    </article>
  );
}
