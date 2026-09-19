"use client";
/**
 * app/dashboard/page.js — Dashboard (Home)
 *
 * Shows: greeting + next-dose countdown, hero health metric card with
 * profile switcher, conditions grid, insight card, medications + recent
 * documents lists, reference stats footer.
 */
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, Heart, FileText, Pill, TrendingUp, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { Rise } from "@/components/dashboard/Rise";
import { Pill as PillBadge, docTagTone } from "@/components/dashboard/Pill";
import { CtaButton } from "@/components/dashboard/CtaButton";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { ProfileSwitcher } from "@/components/dashboard/ProfileSwitcher";
import { withBasePath } from "@/lib/basePath";

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function heroGreeting(profile) {
  if (!profile.isSelf) return profile.greeting;
  const h = new Date().getHours();
  const part = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${part}, ${profile.name.split(" ")[0]}.`;
}

function nextDoseCountdown(hour, minute) {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour, minute, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  const diff = Math.max(0, +target - +now);
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return `${h}h ${m < 10 ? "0" : ""}${m}m`;
}

function conditionToneClass(tone) {
  switch (tone) {
    case "mint":  return "bg-mint";
    case "peach": return "bg-peach";
    default:      return "bg-sand";
  }
}

/* ── Component ────────────────────────────────────────────────────────────── */
export default function DashboardPage() {
  const store = useStore();
  const { activeProfile, docs, meds, shareLinks, takenDoses } = store;
  const router = useRouter();
  const [focusIdx, setFocusIdx] = useState(0);

  const focus = activeProfile.focus[Math.min(focusIdx, activeProfile.focus.length - 1)];

  const recentDocs = [...docs]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, 3);

  const doseRows = activeProfile.isSelf
    ? meds.flatMap((m) =>
        m.times.map((t) => ({
          name: m.name, dose: m.dose, time: t,
          taken: takenDoses.includes(`${m.id}@${t}`),
        }))
      )
    : activeProfile.nextDose
      ? [{ name: activeProfile.nextDose.name, dose: activeProfile.nextDose.dose,
            time: `${String(activeProfile.nextDose.hour).padStart(2,"0")}:${String(activeProfile.nextDose.minute).padStart(2,"0")}`,
            taken: false }]
      : [];

  const conditionsLabel = activeProfile.isSelf
    ? "Your conditions"
    : `${activeProfile.relation}'s conditions`;

  // Hero status pill style
  const statusStyle = focus.attention
    ? { backgroundColor: "var(--coral-bg)", color: "var(--coral)" }
    : { backgroundColor: "var(--brand-mid)", color: "var(--ink-soft)" };

  // Hero sparkline stroke
  const heroStroke = focus.attention ? "#C96A3E" : "#3D8E99";

  return (
    <div className="dash-grid-layout">
      {/* ── Greeting row ────────────────────────────────────────────────── */}
      <Rise delay={0.02}>
        <div className="dash-header-row">
          <div className="dash-greeting-area">
            <h1 className="dash-greeting-title">
              {heroGreeting(activeProfile)}
            </h1>
            {doseRows.length === 0 ? (
              <p className="dash-greeting-subtitle">
                All caught up for today ✓
              </p>
            ) : (
              <p className="dash-greeting-subtitle">
                You have{" "}
                <span className="highlight-text">{doseRows.length}</span>{" "}
                upcoming dose{doseRows.length !== 1 ? "s" : ""}{" "}
                <span className="sub-text">/ Today</span>
              </p>
            )}
          </div>

          {doseRows.length === 0 && (
            <div className="dash-header-actions">
              <div className="ec-empty" style={{ padding: "12px 16px", background: "var(--bg-card)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-warm)", boxShadow: "var(--shadow-sm)", minWidth: "180px" }}>
                <div className="ec-empty-icon" style={{ width: "40px", height: "40px" }}>
                  <Pill size={20} aria-hidden />
                </div>
                <p className="ec-empty-title" style={{ fontSize: "14px" }}>No reminders today</p>
                <Link href={withBasePath("/dashboard/medications")} className="ec-empty-cta" style={{ fontSize: "13px", padding: "9px 16px" }}>
                  <Plus size={14} aria-hidden /> Add medication
                </Link>
              </div>
            </div>
          )}
        </div>
      </Rise>

      {/* ── Horizontal Cards Row (Medications mapped to Medinest Cards) ─── */}
      <Rise delay={0.08}>
        {doseRows.length > 0 && (
          <div className="dash-horizontal-scroll">
            {doseRows.map((d, i) => (
              <div key={d.name + d.time + i} className="glass-card medinest-card">
                <div className="mc-header">
                  <div className="mc-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.5 20.5l-6-6a4.5 4.5 0 0 1 6.5-6.5l6 6a4.5 4.5 0 0 1-6.5 6.5z"/><path d="M10.5 8.5l5 5"/></svg>
                  </div>
                  <div className="mc-date">
                    <span className="mc-month">Today</span>
                    <span className="mc-day">{d.time.split(':')[0]}</span>
                  </div>
                </div>
                <h3 className="mc-title">{d.name}</h3>
                <p className="mc-subtitle">{d.dose}</p>
                <div className="mc-footer">
                  <div className="mc-avatar">
                    {d.name.charAt(0)}
                  </div>
                  <div className="mc-time">
                    {d.time} {Number(d.time.split(':')[0]) >= 12 ? 'PM' : 'AM'}
                  </div>
                  <div className="mc-actions">
                    <button className="mc-action-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg></button>
                    <button className="mc-action-btn"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Rise>

      {/* ── Main Layout Split (Analytics Left, List Right) ──────────────── */}
      <Rise delay={0.16}>
        <div className="dash-split-layout">
          
          {/* Left: Analytics */}
          <div className="dash-analytics glass-card">
            {/* Toolbar row: title + chips (never overlap) */}
            <div className="ec-toolbar">
              <h2>Analytics</h2>
              <div className="ec-toolbar-chips">
                <ProfileSwitcher />
                <button className="ec-chip ec-chip-active">
                  This Year
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
              </div>
            </div>

            {focus.value === "--" ? (
              <div className="ec-empty">
                <div className="ec-empty-icon">
                  <TrendingUp size={24} aria-hidden />
                </div>
                <p className="ec-empty-title">No readings yet</p>
                <p className="ec-empty-sub">Log your first reading to see trends here.</p>
                <Link href={withBasePath("/dashboard/readings")} className="ec-empty-cta">
                  <Plus size={16} aria-hidden /> Log today's reading
                </Link>
              </div>
            ) : (
                  <div key={activeProfile.id + focusIdx} className="d-rise" style={{ animationDuration: "0.18s" }}>
                    <p className="d-hero-metric-label">{focus.label}</p>
                    <div className="d-hero-value-row">
                      <span className="d-hero-value" style={{ color: focus.attention ? '#e63946' : '#2a9d8f' }}>{focus.value}</span>
                      <span className="d-hero-unit">{focus.unit}</span>
                      <span className="d-hero-status-pill" style={statusStyle}>
                        {focus.statusWord}
                      </span>
                    </div>
                    <p className="d-hero-verdict">{focus.verdict}</p>

                    <Sparkline
                      values={focus.trend}
                      band={focus.band}
                      bandFill="rgba(255,255,255,0.3)"
                      stroke={heroStroke}
                      strokeWidth={2.5}
                      height={100}
                      style={{ maxWidth: "100%", marginTop: "20px" }}
                    />
                    
                <div style={{ marginTop: '16px' }}>
                  <Link href={withBasePath("/dashboard/readings")} style={{ display: 'block', textDecoration: 'none', width: '100%' }}>
                    <button className="primary-action-btn" style={{ width: '100%' }}>Log today&apos;s reading</button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right: Unpaid Bills (mapped to Recent Documents) */}
          <div className="dash-right-list glass-card">
            <div className="list-header">
              <h2>Recent Documents</h2>
              <Link href={withBasePath("/dashboard/documents")} className="refresh-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
              </Link>
            </div>
            
            <div className="list-items" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {activeProfile.isSelf ? (
                  recentDocs.length === 0 ? (
                    <div className="ec-empty">
                      <div className="ec-empty-icon">
                        <FileText size={24} aria-hidden />
                      </div>
                      <p className="ec-empty-title">No records yet</p>
                      <p className="ec-empty-sub">Upload your first medical document to get started.</p>
                      <Link href={withBasePath("/dashboard/documents")} className="ec-empty-cta">
                        <Plus size={16} aria-hidden /> Upload a record
                      </Link>
                    </div>
                  ) : (
                    recentDocs.slice(0, 3).map((d) => (
                      <div key={d.id} className="list-item-card glass-panel">
                        <div className="list-item-top">
                          <div className="list-item-icon">
                            <FileText size={18} aria-hidden />
                          </div>
                          <div className="list-item-info">
                            <div className="list-item-title">{d.name}</div>
                            <div className="list-item-sub">For {activeProfile.name}</div>
                          </div>
                          <div className="list-item-meta">
                            <div className="list-item-date">{new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</div>
                            <div className="list-item-price"><PillBadge tone={docTagTone(d.type)}>{d.type}</PillBadge></div>
                          </div>
                        </div>
                        <div className="list-item-actions">
                          <button className="primary-action-btn">View Document</button>
                          <button className="cancel-action-btn">Share</button>
                        </div>
                      </div>
                    ))
                  )
                ) : (
                  <p className="empty-text">You're viewing {activeProfile.name.split(" ")[0]}'s records.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Rise>

      {/* ── Launching Next ─────────────────────────────────────────────────── */}
      <Rise delay={0.24}>
        <div style={{ marginTop: '32px', paddingBottom: '24px' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'var(--font-display), serif', fontSize: 'clamp(20px, 4vw, 26px)', fontWeight: '700', color: 'var(--ink)', letterSpacing: '-0.02em', margin: '0 0 6px' }}>Launching Next</h2>
            <p style={{ color: 'var(--muted-warm)', fontSize: '14px', margin: 0 }}>Here’s what’s coming to your EvoCare dashboard — built with real patients and doctors.</p>
          </div>
          <div className="launch-grid">
            {[
              { label: 'Prescription Safety Cross-Checking', body: 'Every new prescription is automatically scanned against your history to catch drug interactions, allergies, and health risks before they become a problem.' },
              { label: 'The Insurance Vault', body: 'Enter your coverage details once. EvoCare automatically maps what’s covered, what isn’t, and what to expect before a procedure.' },
              { label: 'Doctor-Ready Summary Reports', body: 'Log your symptoms before your appointment. EvoCare builds a structured, chronological timeline for your doctor — plus an AI-curated list of questions worth asking.' },
              { label: 'Disease-Specific Entry Metrics', body: 'Daily tracking fields tailored to your exact condition — giving your doctor high-fidelity structured data at every appointment.' },
              { label: 'Personalised Health Education & Coaching', body: 'Curated, disease-specific tips, learning content, and lifestyle suggestions built around your health profile.' },
              { label: 'Lockscreen Emergency QR Widget', body: 'Critical medical details, right on your lock screen. In an emergency, anyone can scan and access life-saving information in seconds — no unlocking required.' },
            ].map(({ label, body }) => (
              <div key={label} className="launch-card">
                <div className="launch-card-label">{label}</div>
                <p className="launch-card-body">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </Rise>
    </div>
  );
}
