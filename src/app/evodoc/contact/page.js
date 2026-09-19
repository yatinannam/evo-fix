"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import "./contact.css";

const LOGO_URL = "/logo.png";

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
              <a href="/evodoc/contact" onClick={onClose} style={{ color: "#d6f303" }}>Contact Us</a>
              <a href="/evodoc/privacy" onClick={onClose}>Privacy</a>
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
          <a href="/evodoc/contact" style={{ color: "var(--acid-soft, #f2ff93)" }}>Contact Us</a>
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

export default function ContactPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main id="top" className="page-shell">
      <header className="site-header">
        <a className="logo" href="/" aria-label="EvoDoc home" style={{ display: 'flex', alignItems: 'center' }}>
          <img src={LOGO_URL} alt="EvoDoc" style={{ height: '100%', width: 'auto', objectFit: 'contain', maxHeight: 42 }} />
        </a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="/#about">About Us</a>
          <a href="/evodoc/contact" style={{ color: "#d6f303" }}>Contact Us</a>
          <a href="/evodoc/privacy">Privacy</a>
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

      <section className="contactRxSection">
        <div className="sectionIntro">
          <span className="eyebrow">EVERY WAY TO REACH US</span>
        </div>

        <div className="rxStage rxStageWide">
          <div className="rxPaper">

            <div className="rx-letterhead">
              <div>
                <h2>EvoDoc Clinic</h2>
                <p className="role">Contact, Support &amp; Implementation</p>
              </div>
              <div className="rightcol">
                <p className="lbl">Hours</p>
                <p className="val">9:30–18:30 IST</p>
              </div>
            </div>

            <div className="rx-infogrid">
              <div className="rx-field">
                <span className="flabel">Email</span>
                <span className="fval">contact@evodoc.site</span>
              </div>
              <div className="rx-field">
                <span className="flabel">Location</span>
                <span className="fval">EvoDoc, Chennai, Tamil Nadu</span>
              </div>
              <div className="rx-field">
                <span className="flabel">Phone</span>
                <span className="fval">+91 9696767289</span>
              </div>
              <div className="rx-field">
                <span className="flabel">Best reached for</span>
                <span className="fval">Demos · Partnerships · Implementation</span>
              </div>
            </div>

            <div className="rx-actions">
              <a className="rx-action-btn rx-action-call" href="tel:+919696767289">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Call Now
              </a>
              <a className="rx-action-btn rx-action-whatsapp" href="https://wa.me/919696767289" target="_blank" rel="noopener">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.79.47 3.47 1.29 4.93L2 22l5.29-1.39a9.9 9.9 0 0 0 4.75 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2Zm0 18.13c-1.5 0-2.97-.4-4.24-1.16l-.3-.18-3.14.82.84-3.06-.2-.32a8.15 8.15 0 0 1-1.26-4.32c0-4.5 3.66-8.16 8.16-8.16 4.5 0 8.16 3.66 8.16 8.16 0 4.5-3.66 8.16-8.02 8.16Zm4.48-6.12c-.24-.12-1.44-.71-1.66-.79-.22-.08-.38-.12-.55.12-.16.24-.63.79-.77.95-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.19-.71-.63-1.2-1.42-1.34-1.66-.14-.24-.02-.37.11-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.55-1.32-.75-1.81-.2-.48-.4-.41-.55-.42-.14-.01-.3-.01-.46-.01-.16 0-.42.06-.64.3-.22.24-.84.82-.84 2s.86 2.32.98 2.48c.12.16 1.7 2.6 4.12 3.64.58.25 1.03.4 1.38.51.58.18 1.11.16 1.53.1.47-.07 1.44-.59 1.64-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28Z"/></svg>
                WhatsApp
              </a>
              <a className="rx-action-btn rx-action-email" href="mailto:contact@evodoc.site">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
                Email Us
              </a>
            </div>

            <div className="rx-stats">
              <span><span className="l">Response: </span><span className="v">&lt; 24 hrs</span></span>
              <span><span className="l">Channels: </span><span className="v">Call · WhatsApp · Email</span></span>
              <span><span className="l">Languages: </span><span className="v">EN · HI · TA</span></span>
            </div>

            <div className="rx-block">
              <div className="rx-block-head">
                <span className="check">✓</span>
                <span className="title">How We Can Help</span>
              </div>
              <div className="rx-item">
                <span className="num">1</span>
                <div><p className="t">CMS software for clinics</p><p className="s">Set up EvoDoc's clinic management system — patient records, scheduling, and prescriptions in one place.</p></div>
              </div>
              <div className="rx-item">
                <span className="num">2</span>
                <div><p className="t">HMS software for hospitals</p><p className="s">Roll out full hospital management workflows across departments, from OPD to discharge.</p></div>
              </div>
              <div className="rx-item">
                <span className="num">3</span>
                <div><p className="t">Implementation, end to end</p><p className="s">We help you bring EvoDoc into your clinic or hospital — setup, staff training, and migration handled for you.</p></div>
              </div>
            </div>

            <div className="rx-pills">
              <p>Best for:</p>
              <div className="row">
                <span className="pill">CMS Software</span>
                <span className="pill">HMS Software</span>
                <span className="pill">Clinic Implementation</span>
                <span className="pill">Hospital Implementation</span>
                <span className="pill">Demo Requests</span>
                <span className="pill">Partnerships</span>
              </div>
            </div>

            <div className="rx-social">
              <p className="lbl">Follow our journey</p>
              <div className="row">
                <a href="https://www.instagram.com/evodoc.in/" target="_blank" rel="noopener">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/></svg>
                  Instagram
                </a>
                <a href="https://www.linkedin.com/company/evodoc-in" target="_blank" rel="noopener">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
                  LinkedIn
                </a>
              </div>
            </div>

            <div className="rx-sign">
              <div className="box">
                <p className="name">The EvoDoc Team</p>
                <p className="sub">Chennai, Tamil Nadu</p>
                <p className="sub">contact@evodoc.site</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
