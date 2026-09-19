"use client";
/**
 * components/auth/AuthShell.js
 * Auth shell matching the EvoCare/EvoDoc pre-registration aesthetic:
 * white background, large heading, folder-tab card with teal gradient.
 */
import Link from "next/link";

export function AuthShell({ tagline, sub, children }) {
  return (
    <div className="auth-shell">

      {/* ── Page header (logo + nav-style) ─────────────────────────── */}
      <header className="auth-page-header">
        <Link href="/evocare" className="auth-page-logo">
          <img src="/evocare_logo.png" alt="EvoCare" style={{ height: "32px", width: "auto", display: "block" }} />
        </Link>
        <Link href="/evocare" className="auth-page-back-link">← Back to EvoCare</Link>
      </header>

      {/* ── Hero text ───────────────────────────────────────────────── */}
      <div className="auth-hero">
        <h1 className="auth-hero-title e-rise">{tagline}</h1>
        <p className="auth-hero-sub e-rise e-delay-1">{sub}</p>
      </div>

      {/* ── Folder-tab card ─────────────────────────────────────────── */}
      <div className="auth-folder-wrap e-rise e-delay-2">
        {/* The decorative tab at top-right */}
        <div className="auth-folder-tab" aria-hidden="true" />

        {/* The main card body */}
        <div className="auth-folder-card">
          {children}
        </div>
      </div>

    </div>
  );
}

