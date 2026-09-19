import styles from './HeartAnimation.module.css';
import { HEART_SVG } from './heartSvg';

const BASE = 100;

function pqrst(x: number): string {
  const b = BASE;
  return [
    `L ${x},${b}`,
    `C ${x + 4},${b} ${x + 5},${b - 7} ${x + 9},${b - 7}`,
    `C ${x + 13},${b - 7} ${x + 14},${b} ${x + 18},${b}`,
    `L ${x + 22},${b}`,
    `L ${x + 23},${b + 5}`,
    `L ${x + 26},${b - 45}`,
    `L ${x + 29},${b + 14}`,
    `L ${x + 32},${b}`,
    `L ${x + 36},${b}`,
    `C ${x + 38},${b} ${x + 40},${b - 15} ${x + 44},${b - 15}`,
    `C ${x + 48},${b - 15} ${x + 50},${b} ${x + 54},${b}`,
    `L ${x + 60},${b}`,
  ].join(' ');
}

function pqrstRev(x: number): string {
  const b = BASE;
  return [
    `L ${x},${b}`,
    `C ${x - 4},${b} ${x - 5},${b - 7} ${x - 9},${b - 7}`,
    `C ${x - 13},${b - 7} ${x - 14},${b} ${x - 18},${b}`,
    `L ${x - 22},${b}`,
    `L ${x - 23},${b + 5}`,
    `L ${x - 26},${b - 45}`,
    `L ${x - 29},${b + 14}`,
    `L ${x - 32},${b}`,
    `L ${x - 36},${b}`,
    `C ${x - 38},${b} ${x - 40},${b - 15} ${x - 44},${b - 15}`,
    `C ${x - 48},${b - 15} ${x - 50},${b} ${x - 54},${b}`,
    `L ${x - 60},${b}`,
  ].join(' ');
}

const LEFT_PATH = `M 300,${BASE} L 180,${BASE} ${pqrstRev(180)} L 0,${BASE}`;
const RIGHT_PATH = `M 300,${BASE} L 420,${BASE} ${pqrst(420)} L 600,${BASE}`;

export default function HeartAnimation() {
  return (
    <div className={styles.container}>
      {/* Background SVG connecting the cards */}
      <svg className={styles.pulseSvg} viewBox="0 0 600 200" preserveAspectRatio="none">
        {/* Dim trace of the paths so they connect constantly */}
        <path className={styles.traceLine} d={LEFT_PATH} />
        <path className={styles.traceLine} d={RIGHT_PATH} />

        {/* Animated sparks shooting outwards */}
        <path className={styles.pulseSpark} d={LEFT_PATH} />
        <path className={styles.pulseSpark} d={RIGHT_PATH} />
      </svg>

      {/* Center Heart */}
      <div className={styles.heartWrapper}>
        <div
          className={`${styles.wrapper} heartWrap`}
          dangerouslySetInnerHTML={{ __html: HEART_SVG }}
          aria-label="Beating heart animation"
          role="img"
        />
      </div>
    </div>
  );
}
