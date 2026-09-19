"use client";
/**
 * app/dashboard/documents/page.js — My Documents
 *
 * Real backend: the chosen file is uploaded via the EvoDoc API, which
 * AES-256-GCM encrypts it before it reaches storage (store.addDoc → api.addDoc).
 * Open = decrypt-and-stream preview; Share = time-bound public link.
 */
import { useRef, useState } from "react";
import { Eye, FileText, Link2, UploadCloud } from "lucide-react";
import { useStore } from "@/lib/store";
import { Rise } from "@/components/dashboard/Rise";
import { Pill, docTagTone } from "@/components/dashboard/Pill";
import { CtaButton } from "@/components/dashboard/CtaButton";
import { ShareDialog } from "@/components/dashboard/ShareDialog";

const DOC_TYPES = ["Prescription", "Lab Report", "Scan", "Discharge Summary", "Other"];

export default function DocumentsPage() {
  const { docs, addDoc, openDocument, createShareLink } = useStore();
  const [type, setType] = useState("Prescription");
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const [shareFiles, setShareFiles] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const fileInputRef = useRef(null);

  function toggleSelect(id) {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  }

  function handleShareSelected() {
    const selected = docs.filter(d => selectedIds.has(d.id));
    if (selected.length > 0) setShareFiles(selected);
  }

  async function handleUpload() {
    setError("");
    if (!file) { setError("Choose a file to upload."); return; }
    setBusy(true);
    try {
      await addDoc({ name: file.name, type, date: new Date().toISOString(), file });
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError(err.message || "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleOpen(id) {
    setError("");
    try { window.open(await openDocument(id), "_blank", "noopener"); }
    catch (err) { setError(err.message || "Could not open this document."); }
  }

  return (
    <div className="dash-grid-layout" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <Rise delay={0.02}>
        <div className="dash-header-row">
          <div className="dash-greeting-area">
            <h1 className="dash-greeting-title">My Documents</h1>
            <p className="dash-greeting-subtitle">Keep every record in one calm place, and share only what you choose.</p>
          </div>
        </div>
      </Rise>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* ── Upload zone ─────────────────────────────────────────────────── */}
        <Rise delay={0.08}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-deep)' }}>
                <UploadCloud size={20} aria-hidden />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ink)' }}>Add a document</h2>
            </div>
            <p style={{ color: 'var(--muted-warm)', fontSize: '14px', marginBottom: '24px' }}>PDF or image, up to 20 MB. Encrypted before it's stored — it's yours until you share it.</p>

            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flex: "0 0 auto", minWidth: "200px" }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }} htmlFor="doc-type">Document type</label>
                <select id="doc-type" value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}>
                  {DOC_TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }} htmlFor="doc-file">File</label>
                <input
                  id="doc-file" ref={fileInputRef} type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp,image/heic"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  style={{ width: '100%', padding: '10px 16px', borderRadius: '12px', border: '1px dashed rgba(0,0,0,0.2)', background: 'rgba(0,0,0,0.02)' }}
                />
              </div>

              <div>
                <CtaButton successLabel="Uploaded" onClick={handleUpload} disabled={busy}>
                  {busy ? "Uploading…" : "Upload"}
                </CtaButton>
              </div>
            </div>
            {error && <p className="auth-error-text" style={{ marginTop: "16px", color: 'red', fontSize: '14px' }}>{error}</p>}
          </div>
        </Rise>

        {/* ── Documents list ───────────────────────────────────────────────── */}
        <Rise delay={0.16}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ink)' }}>Your documents</h2>
              {selectedIds.size > 0 && (
                <button style={{ padding: "8px 16px", background: 'var(--ink)', color: 'white', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: "13px" }} onClick={handleShareSelected}>
                  Share {selectedIds.size} selected
                </button>
              )}
            </div>

            {docs.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--ink)', marginBottom: '8px' }}>Add your first record whenever you're ready.</div>
                <p style={{ color: 'var(--muted-warm)' }}>A prescription, a lab result, a scan — it all belongs in one place.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {docs.map((d) => (
                  <div key={d.id} className="glass-panel" style={{ display: "flex", alignItems: "center", gap: "16px", padding: '16px', borderRadius: '16px' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedIds.has(d.id)} 
                      onChange={() => toggleSelect(d.id)} 
                      style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "var(--brand-deep)" }}
                    />
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(0,0,0,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted-warm)' }}>
                      <FileText size={20} aria-hidden />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="d-truncate" style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)" }}>{d.name}</div>
                      <div className="d-truncate" style={{ fontSize: "13px", color: "var(--muted-warm)", marginTop: '4px' }}>
                        {new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </div>
                    </div>
                    <Pill tone={docTagTone(d.type)}>{d.type}</Pill>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => handleOpen(d.id)} aria-label={`Open ${d.name}`}><Eye size={16} /></button>
                      <button style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShareFiles([d])} aria-label={`Share ${d.name}`}><Link2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Rise>
      </div>

      {shareFiles && (
        <ShareDialog files={shareFiles} onCreate={createShareLink} onClose={() => { setShareFiles(null); setSelectedIds(new Set()); }} />
      )}
    </div>
  );
}
