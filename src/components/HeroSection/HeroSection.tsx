import styles from './HeroSection.module.css';
import HeartAnimation from '@/components/HeartAnimation/HeartAnimation';
import EvoDocCard from '@/components/EvoDocCard/EvoDocCard';
import EvoCareCard from '@/components/EvoCareCard/EvoCareCard';

export default function HeroSection() {
  return (
    <section className={styles.hero} id="hero">
      {/* Deep red ambient radial glow behind heart */}
      <div className={styles.ambientGlow} aria-hidden="true" />

      {/* ── Top tagline ── */}
      <header className={styles.heroHeader}>
        <h1 className={styles.headline}>
          Better care starts with
          <span className={styles.accent}>better tools.</span>
        </h1>
      </header>

      {/* ── Main row: Card | ECG | Card ── */}
      <div className={styles.centerRow}>
        {/* Left — EvoDoc */}
        <div className={styles.leftSlot}>
          <EvoDocCard />
        </div>

        {/* Center — Heart & Pulse Lines */}
        <div className={styles.centerSlot}>
          <HeartAnimation />
        </div>

        {/* Right — EvoCare */}
        <div className={styles.rightSlot}>
          <EvoCareCard />
        </div>
      </div>

      {/* ── Bottom tagline ── */}
      <div className={styles.taglineBottom}>
        <p className={styles.taglineSub}>
          One platform. Two experiences. Zero compromise.
        </p>
      </div>
    </section>
  );
}
