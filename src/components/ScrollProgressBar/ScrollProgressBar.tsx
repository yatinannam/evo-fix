'use client';

import { useScroll, useSpring, motion } from 'framer-motion';

export default function ScrollProgressBar() {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 40,
    restDelta: 0.001,
  });

  return (
    <motion.div
      style={{
        scaleX,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: '#D6F303',
        transformOrigin: '0%',
        zIndex: 9999,
      }}
    />
  );
}
