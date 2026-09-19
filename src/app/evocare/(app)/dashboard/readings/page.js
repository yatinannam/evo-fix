"use client";
/**
 * app/dashboard/readings/page.js — Health Readings
 *
 * Backend hookup points (see lib/api.js):
 *   getReadings(userId, metric) → list readings for active metric
 *   addReading(userId, r)       → add new reading
 */
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Rise } from "@/components/dashboard/Rise";
import { Pill } from "@/components/dashboard/Pill";
import { CtaButton } from "@/components/dashboard/CtaButton";
import { Sparkline } from "@/components/dashboard/Sparkline";
import { withBasePath } from "@/lib/basePath";

const METRIC_TONE = {
  "blood-sugar": "mint",
  "blood-pressure": "peach",
  "weight": "sand",
  "heart-rate": "mint",
  "temperature": "peach",
  "oxygen": "sand",
};

const TONE_STYLES = {
  mint: { background: "var(--mint-card)", color: "var(--mint-text)" },
  peach: { background: "var(--peach-card)", color: "var(--peach-text)" },
  sand: { background: "var(--sand-card)", color: "var(--sand-text)" },
};

function verdictFor(label, level, delta) {
  const move =
    delta === undefined || delta === 0
      ? "holding steady since your last reading"
      : `${Math.abs(delta)} ${delta > 0 ? "up from" : "down from"} your last reading`;
  if (level === "in") return `${label} is right where it should be — ${move}.`;
  if (level === "borderline") return `A little outside your usual range, ${move}. Nothing urgent — worth a gentle look.`;
  return `Higher than usual today, ${move}. It's worth keeping an eye on it this week.`;
}

function HealthReadingsContent() {
  const { readingsFor, addReading, METRICS, METRIC_RANGES, statusFor } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const paramMetric = searchParams.get("metric");
  
  const active = paramMetric && METRICS.some((m) => m.key === paramMetric) ? paramMetric : "blood-sugar";
  const meta = METRICS.find((m) => m.key === active);
  const range = METRIC_RANGES[active];

  const [value, setValue] = useState("");
  const [when, setWhen] = useState("");
  const [note, setNote] = useState("");

  const readings = readingsFor(active);
  const values = readings.map((r) => r.value);
  const last = values.at(-1);
  const prev = values.at(-2);
  const delta = last !== undefined && prev !== undefined ? +(last - prev).toFixed(1) : undefined;
  const status = last !== undefined ? statusFor(active, last) : undefined;

  function setActive(k) {
    router.push(withBasePath(`/dashboard/readings?metric=${k}`));
  }

  function handleSave() {
    const num = parseFloat(value);
    if (Number.isNaN(num)) return;
    addReading({ metric: active, value: num, at: when || new Date().toISOString(), note: note || undefined });
    setValue(""); setWhen(""); setNote("");
  }

  return (
    <div className="dash-grid-layout" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <Rise>
        <div className="dash-header-row">
          <div className="dash-greeting-area">
            <h1 className="dash-greeting-title">Health Readings</h1>
            <p className="dash-greeting-subtitle">A gentle record of how you're doing — sugar, pressure, weight and more.</p>
          </div>
        </div>
      </Rise>

      {/* ── Condition cards (metric selector) ───────────────────────────── */}
      <Rise delay={0.08}>
        <div className="glass-card" style={{ padding: '32px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '16px' }}>What would you like to log?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '16px' }}>
            {METRICS.map((m) => {
              const isActive = m.key === active;
              const l = readingsFor(m.key).at(-1);
              return (
                <button
                  key={m.key}
                  onClick={() => setActive(m.key)}
                  style={{
                    padding: '16px',
                    borderRadius: '16px',
                    border: isActive ? '2px solid var(--brand-deep)' : '1px solid rgba(0,0,0,0.05)',
                    background: isActive ? 'rgba(62, 157, 247, 0.05)' : 'white',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isActive ? '0 4px 12px rgba(62, 157, 247, 0.1)' : '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: '600', color: isActive ? 'var(--brand-deep)' : 'var(--muted-warm)' }}>{m.label}</span>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ink)' }}>{l ? l.value : "—"}</span>
                </button>
              );
            })}
          </div>
        </div>
      </Rise>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        {/* ── Add reading form ──────────────────────────────────────────── */}
        <Rise delay={0.16}>
          <div className="glass-card" style={{ padding: "32px", height: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '24px' }}>Add a {meta.label.toLowerCase()} reading</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }} htmlFor="read-val">Value ({meta.unit})</label>
                <input id="read-val" value={value} onChange={(e) => setValue(e.target.value)} inputMode="decimal" placeholder="e.g. 110" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }} htmlFor="read-when">When was it taken?</label>
                <input id="read-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }} />
                <p style={{ marginTop: "6px", fontSize: "13px", color: "var(--muted-warm)" }}>Leave empty for right now.</p>
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }} htmlFor="read-note">A note (optional)</label>
              <input id="read-note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. felt dizzy, after morning walk" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }} />
            </div>

            <CtaButton successLabel="Reading saved" onClick={handleSave}>Save reading</CtaButton>
          </div>
        </Rise>

        {/* ── Trend + verdict ───────────────────────────────────────────── */}
        <Rise delay={0.22}>
          <div className="glass-card" style={{ padding: "32px", height: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '16px' }}>{meta.label} trend</h3>

            {values.length < 2 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)', marginBottom: '8px' }}>Nothing to chart just yet.</div>
                <p style={{ fontSize: '14px', color: 'var(--muted-warm)' }}>Log a couple of readings and your trend will grow here.</p>
              </div>
            ) : (
              <>
                <div style={{ marginTop: "12px", display: "flex", alignItems: "baseline", gap: "8px" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: "36px", fontWeight: 700, color: "var(--ink)", letterSpacing: '-0.5px' }}>{last}</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--muted-warm)" }}>{meta.unit}</span>
                  {status && <Pill tone={status.level === "in" ? "mint" : "coral"} style={{ marginLeft: '8px' }}>{status.word}</Pill>}
                </div>

                <div style={{ marginTop: "24px", marginBottom: "24px", background: 'rgba(0,0,0,0.02)', borderRadius: '16px', padding: '16px' }}>
                  <Sparkline values={values} band={{ min: range.min, max: range.max }} stroke="#3D8E99" height={110} />
                </div>

                {status && (
                  <p style={{ marginTop: "16px", marginBottom: "24px", fontSize: "14px", lineHeight: 1.6, color: "var(--ink)" }}>
                    {verdictFor(meta.label, status.level, delta)}
                  </p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[...readings].reverse().slice(0, 5).map((r) => (
                    <div
                      key={r.id}
                      className="glass-panel"
                      style={{ animationDuration: "0.2s", display: 'flex', justifyContent: 'space-between', padding: '12px 16px', borderRadius: '12px' }}
                    >
                      <span style={{ fontSize: '14px', color: 'var(--muted-warm)' }}>
                        {new Date(r.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        {r.note && <span style={{ color: 'var(--ink)', marginLeft: '8px' }}>· {r.note}</span>}
                      </span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>{r.value} {meta.unit}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </Rise>
      </div>
    </div>
  );
}

export default function HealthReadingsPage() {
  return (
    <Suspense fallback={<div className="d-page-header"><h1>Loading readings...</h1></div>}>
      <HealthReadingsContent />
    </Suspense>
  );
}

