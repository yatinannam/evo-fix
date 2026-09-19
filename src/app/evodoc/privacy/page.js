"use client";

import { useState, useRef, useEffect } from "react";
import { Ban, Menu, X, Lock, ShieldCheck, EyeOff, Share2 } from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";
import styles from "./privacy.module.css";

const LOGO_URL = "/logo.png";

const trustMarks = [
  { top: "AES", bottom: "256", icon: Lock, rotate: -6 },
  { top: "DPDP", bottom: "2023", icon: ShieldCheck, rotate: 4 },
  { top: "ABDM", bottom: "READY", icon: Share2, rotate: -3 },
  { top: "ZERO", bottom: "ACCESS", icon: EyeOff, rotate: 5 },
];

const journeySteps = ["Uploaded", "Encrypted", "Stored in India", "Shared with consent"];

const neverItems = [
  "Sell patient data — to anyone, ever.",
  "Let staff view a record without a logged, specific reason.",
  "Store patient data outside India.",
  "Share a record without the patient's explicit consent.",
];

const fadeIn = {
  hidden: { opacity: 0, y: 34 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.72, ease: [0.22, 1, 0.36, 1] },
  },
};

function Reveal({ children, className = "", delay = 0 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      variants={reduceMotion ? undefined : fadeIn}
      initial={reduceMotion ? false : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, amount: 0.24 }}
      transition={{ delay }}
    >
      {children}
    </motion.div>
  );
}

function JourneySection() {
  const reduceMotion = useReducedMotion();
  const [activeStep, setActiveStep] = useState(reduceMotion ? 3 : 0);
  const hasPlayed = useRef(false);

  function startSequence() {
    if (hasPlayed.current || reduceMotion) return;
    hasPlayed.current = true;
    let step = 0;
    const interval = setInterval(() => {
      step += 1;
      setActiveStep(step);
      if (step >= journeySteps.length - 1) clearInterval(interval);
    }, 450);
  }

  return (
    <motion.div
      className={styles.journeySection}
      onViewportEnter={startSequence}
      viewport={{ once: true, amount: 0.5 }}
    >
      <p className={styles.journeyLabel}>A RECORD&rsquo;S JOURNEY</p>
      <div className={styles.journeyTabs}>
        {journeySteps.map((step, i) => (
          <span key={step} className={styles.journeyItem}>
            <span
              className={
                i === activeStep
                  ? `${styles.tab} ${styles.tabActive}`
                  : styles.tab
              }
            >
              {step}
            </span>
            {i < journeySteps.length - 1 && (
              <span
                className={styles.arrow}
                aria-hidden="true"
                style={{
                  color: i < activeStep
                    ? "rgba(214,243,3,0.45)"
                    : "rgba(255,255,255,0.25)",
                  transition: "color 0.35s ease",
                }}
              >
                →
              </span>
            )}
          </span>
        ))}
      </div>
    </motion.div>
  );
}



function MobileMenu({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="mobile-menu-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.nav
            className="mobile-menu"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Mobile navigation"
          >
            <button className="mobile-menu-close" onClick={onClose} aria-label="Close menu">
              <X size={24} />
            </button>
            <div className="mobile-menu-links">
              <a href="/#about" onClick={onClose}>About Us</a>
              <a href="/evodoc/contact" onClick={onClose}>Contact Us</a>
              <a href="/evodoc/privacy" onClick={onClose} aria-current="page" className={styles.navActive}>
                Privacy
              </a>
              <a href="/#faq" onClick={onClose}>FAQs</a>
              <a href="/evodoc/blog" onClick={onClose}>Blogs</a>
            </div>
            <a className="mobile-menu-cta" href="/evodoc#pre-register" onClick={onClose}>
              Pre-Register
            </a>
          </motion.nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <p>
            The next generation of clinical intelligence. Empowering modern
            physicians with AI-assisted diagnostics and high-fidelity insights.
          </p>
        </div>
        <nav aria-label="Footer platform links">
          <strong>Platform</strong>
          <a href="/#about">About Us</a>
          <a href="/">Log In</a>
        </nav>
        <nav aria-label="Footer connect links">
          <strong>Connect</strong>
          <a href="/">About Founder</a>
          <a href="/evodoc/contact">Contact Us</a>
          <a href="/evodoc#pre-register">Feedback</a>
        </nav>
      </div>
      <div className="footer-bottom">
        <span>© 2026 EvoDoc AI. All rights reserved.</span>
        <a href="/evodoc/privacy">Privacy Policy</a>
        <a href="#">Terms of Service</a>
        <a href="#">Cookies</a>
      </div>
      <strong className="footer-wordmark">EVODOC</strong>
    </footer>
  );
}

export default function PrivacyPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main id="top" className="page-shell">
      <header className="site-header">
        <a className="logo" href="/" aria-label="EvoDoc home" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={LOGO_URL} alt="EvoDoc" style={{ height: '100%', width: 'auto', objectFit: 'contain', maxHeight: 42 }} />
        </a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="/#about">About Us</a>
          <a href="/evodoc/contact">Contact Us</a>
          <a href="/evodoc/privacy" aria-current="page" className={styles.navActive}>
            Privacy
          </a>
          <a href="/#faq">FAQs</a>
          <a href="/evodoc/blog">Blogs</a>
        </nav>
        <a className="nav-cta" href="/evodoc#pre-register">
          Pre-Register
        </a>
        <button
          className="hamburger"
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          aria-expanded={menuOpen}
        >
          <Menu size={24} />
        </button>
      </header>

      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      <section className={styles.hero}>
        <Reveal className={styles.heroCopy}>
          <span className={styles.eyebrow}>YOUR PRIVACY</span>
          <h1 className={styles.heroTitle}>
            Every record.
            <br />
            Sealed the moment it lands.
          </h1>
          <p className={styles.heroSub}>
            AES-256 locks each file on upload. DPDP Act 2023 aligned, ABDM
            interoperable — and readable by exactly one person: the treating
            doctor.
          </p>
        </Reveal>

        <Reveal className={styles.docStage} delay={0.15}>
          <div className={styles.docBack} aria-hidden="true" />
          <div className={styles.docCard}>
            <p className={styles.docLabel}>PATIENT RECORD · #4471</p>
            <p className={styles.docLegible}>
              Patient reports mild chest discomfort, onset 3 days. BP 128/82 ·
              HR 76bpm.
            </p>
            <div className={styles.sealLine}>
              <Lock size={22} aria-hidden="true" />
              <span>AES-256 · SEALED HERE</span>
            </div>
            <div className={styles.docCipher}>
              <p>
                X9$kA2::LP#0d8Zq
                <br />
                m4@JJ1—QW3::9vTk
                <br />
                0Z#pL7$$eR2::Ax9
              </p>
            </div>
            <p className={styles.docFooter}>
              Only the treating doctor holds the key.
            </p>
          </div>
        </Reveal>
      </section>

      <Reveal className={styles.stampsRow}>
        {trustMarks.map(({ top, bottom, icon: Icon, rotate }) => (
          <div
            key={top + bottom}
            className={styles.stamp}
            style={{ transform: `rotate(${rotate}deg)` }}
          >
            <Icon size={36} strokeWidth={2.5} aria-hidden="true" className={styles.stampIcon} />
            <span>
              {top}
              <br />
              {bottom}
            </span>
          </div>
        ))}
      </Reveal>

      <JourneySection />

      <Reveal className={styles.neverSection}>
        <p className={styles.journeyLabel}>WHAT WE NEVER DO</p>
        <ul className={styles.neverList}>
          {neverItems.map((item) => (
            <li key={item} className={styles.neverRow}>
              <Ban size={22} aria-hidden="true" className={styles.neverIcon} />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Reveal>

      <Footer />
    </main>
  );
}
