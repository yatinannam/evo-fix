"use client";
/**
 * components/dashboard/ShareDialog.js
 * Create a time-bound public share link for the given files. Calls
 * onCreate(files, { label, expiresInHours }) (→ store.createShareLink) and
 * shows the resulting URL with a copy button.
 */
import { useState } from "react";
import { X, Copy, Check } from "lucide-react";

const EXPIRY = [
  { hours: 1, label: "1 hour" },
  { hours: 24, label: "24 hours" },
  { hours: 72, label: "3 days" },
  { hours: 168, label: "7 days" },
];

export function ShareDialog({ files, onCreate, onClose }) {
  const [label, setLabel] = useState("");
  const [hours, setHours] = useState(24);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleCreate() {
    setError(""); setBusy(true);
    try {
      const link = await onCreate(files, { label: label.trim() || null, expiresInHours: hours });
      setResult(link);
    } catch (err) {
      setError(err.message || "Could not create the link.");
    } finally {
      setBusy(false);
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard may be blocked; user can select manually */ }
  }

  return (
    <div
      className="d-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Share documents"
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(21,48,54,0.4)", padding: "16px" }}
      onClick={onClose}
    >
      <div
        className="d-card"
        style={{ width: "100%", maxWidth: "480px", padding: "24px" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div>
            <h3 className="d-card-title">Share {files.length} document{files.length > 1 ? "s" : ""}</h3>
            <p style={{ fontSize: "13px", color: "var(--muted-warm)", marginTop: "4px" }}>
              Anyone with the link can view until it expires. No login needed.
            </p>
          </div>
          <button className="d-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>

        <ul style={{ maxHeight: "112px", overflowY: "auto", margin: "0 0 16px", padding: "10px 12px", listStyle: "none", background: "var(--cream-bg)", borderRadius: "10px", fontSize: "13px", color: "var(--ink-soft)" }}>
          {files.map((f) => <li key={f.id} className="d-truncate">• {f.name}</li>)}
        </ul>

        {result ? (
          <div>
            <p style={{ fontSize: "13px", color: "var(--mint-text)", marginBottom: "8px" }}>
              Link created — expires {new Date(result.expiresAt).toLocaleString()}.
            </p>
            <div style={{ display: "flex", gap: "8px" }}>
              <input readOnly value={result.url} className="d-input" onFocus={(e) => e.target.select()} aria-label="Share URL" />
              <button className="d-primary-pill" onClick={copy}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <button className="d-ghost-pill" style={{ width: "100%", justifyContent: "center", marginTop: "14px" }} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <div className="d-form-col" style={{ marginBottom: "14px" }}>
              <label className="d-form-label" htmlFor="share-label">Label (optional)</label>
              <input id="share-label" className="d-input" placeholder="e.g. Records for Dr. Menon" value={label} maxLength={120} onChange={(e) => setLabel(e.target.value)} />
            </div>
            <div className="d-form-col" style={{ marginBottom: "16px" }}>
              <span className="d-form-label">Link expires after</span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "8px" }}>
                {EXPIRY.map((o) => (
                  <button
                    key={o.hours}
                    type="button"
                    onClick={() => setHours(o.hours)}
                    className={hours === o.hours ? "d-primary-pill" : "d-ghost-pill"}
                    style={{ justifyContent: "center", padding: "8px 4px", fontSize: "13px" }}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="auth-error-text" style={{ marginBottom: "10px" }}>{error}</p>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
              <button className="d-ghost-pill" onClick={onClose}>Cancel</button>
              <button className="d-primary-pill" onClick={handleCreate} disabled={busy}>
                {busy ? "Creating…" : "Create secure link"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
