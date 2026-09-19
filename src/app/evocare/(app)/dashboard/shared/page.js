"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link2, Trash2, Check, Copy } from "lucide-react";
import { useStore } from "@/lib/store";
import { Rise } from "@/components/dashboard/Rise";
import { Pill } from "@/components/dashboard/Pill";
import { CtaButton } from "@/components/dashboard/CtaButton";
import { withBasePath } from "@/lib/basePath";

export default function SharedLinksPage() {
  const { shareLinks, revokeLink } = useStore();
  const [copiedId, setCopiedId] = useState(null);
  const router = useRouter();

  function copy(id, url) {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <div className="dash-grid-layout" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <Rise delay={0.02}>
        <div className="dash-header-row">
          <div className="dash-greeting-area">
            <h1 className="dash-greeting-title">Shared Links</h1>
            <p className="dash-greeting-subtitle">Links you've sent to doctors or family. Revoke access anytime — once a link is gone, it never works again.</p>
          </div>
        </div>
      </Rise>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <Rise delay={0.08}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '24px' }}>Active links</h2>
            
            {shareLinks.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--ink)', marginBottom: '8px' }}>Nothing shared right now.</div>
                <p style={{ color: 'var(--muted-warm)' }}>
                  When you share a document, the active link will appear here so you can revoke it later.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {shareLinks.map((l) => (
                  <div key={l.id} className="glass-panel" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "16px", padding: '16px', borderRadius: '16px' }}>
                    <div style={{ flex: 1, minWidth: "200px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <Link2 size={16} aria-hidden style={{ color: "var(--brand-deep)" }} />
                        <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--ink)" }}>{l.label}</span>
                        <Pill tone="mint">{l.scope}</Pill>
                      </div>
                      <div style={{ fontSize: "13px", color: "var(--muted-warm)" }}>
                        Created {new Date(l.createdAt).toLocaleDateString()} · 
                        {l.expiresAt ? ` Expires ${new Date(l.expiresAt).toLocaleDateString()}` : " Never expires"}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button
                        onClick={() => copy(l.id, l.url)}
                        style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid rgba(0,0,0,0.05)", background: "white", color: "var(--ink)", display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                      >
                        {copiedId === l.id ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy link</>}
                      </button>
                      <button
                        onClick={() => revokeLink(l.id)}
                        style={{ padding: "8px", borderRadius: "8px", border: "1px solid rgba(220, 38, 38, 0.2)", background: "white", color: "#dc2626", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                        aria-label={`Revoke link for ${l.label}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Rise>

        <Rise delay={0.16}>
          <div className="glass-card" style={{ padding: "32px", textAlign: "center", background: 'rgba(62, 157, 247, 0.05)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '8px' }}>Need to share something?</h3>
            <p style={{ fontSize: "14px", color: "var(--muted-warm)", marginBottom: "24px" }}>
              Head over to My Documents to create a new secure link.
            </p>
            <div style={{ display: "flex", justifyContent: "center" }}>
              <CtaButton onClick={() => router.push(withBasePath("/dashboard/documents"))}>
                Share a document
              </CtaButton>
            </div>
          </div>
        </Rise>
      </div>
    </div>
  );
}
