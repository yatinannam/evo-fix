"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { API_URL } from "@/lib/backend";

const cardStyle = { background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: 20 };
const linkStyle = { background: "#0f766e", borderRadius: 8, color: "#fff", padding: "10px 14px", textDecoration: "none", whiteSpace: "nowrap" };

export default function SharedRecordsPage() {
  const { token } = useParams();
  const [state, setState] = useState({ loading: true, share: null });

  useEffect(() => {
    if (typeof token !== "string") return;
    let cancelled = false;
    fetch(`${API_URL}/api/share/${encodeURIComponent(token)}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("Share unavailable");
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setState({ loading: false, share: data.share || null });
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, share: null });
      });
    return () => { cancelled = true; };
  }, [token]);

  const fileUrl = (fileId) => `${API_URL}/api/share/${encodeURIComponent(token)}/files/${encodeURIComponent(fileId)}`;

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", color: "#0f172a", fontFamily: "Arial, sans-serif" }}>
      <header style={{ borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "18px 20px" }}>
          <strong>EvoDoc</strong><span style={{ color: "#64748b", marginLeft: 10 }}>Securely shared medical records</span>
        </div>
      </header>
      <section style={{ maxWidth: 900, margin: "0 auto", padding: "34px 20px" }}>
        {state.loading ? <p>Verifying secure link…</p> : !state.share ? (
          <div style={cardStyle}><h1>This link is not available</h1><p>It may have expired or been revoked. Please ask the owner for a new link.</p></div>
        ) : (
          <>
            <h1 style={{ margin: "0 0 8px" }}>{state.share.label || "Shared medical documents"}</h1>
            <p style={{ color: "#475569", marginTop: 0 }}>{state.share.files.length} document{state.share.files.length === 1 ? "" : "s"} · access expires {new Date(state.share.expires_at).toLocaleString()}</p>
            <div style={{ display: "grid", gap: 16, marginTop: 24 }}>
              {state.share.files.map((file) => {
                const url = fileUrl(file.id);
                return <article key={file.id} style={cardStyle}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div><strong>{file.file_name}</strong><p style={{ color: "#64748b", marginBottom: 0 }}>{file.category.replace(/_/g, " ")} · uploaded {new Date(file.uploaded_at).toLocaleDateString()}</p></div>
                    <a href={url} target="_blank" rel="noreferrer" style={linkStyle}>Open document</a>
                  </div>
                  {file.file_type.startsWith("image/") && (
                    // The image is decrypted dynamically by the Express API, so Next's image optimizer cannot fetch it.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={url} alt={file.file_name} style={{ display: "block", maxWidth: "100%", maxHeight: 520, marginTop: 16, border: "1px solid #e2e8f0", borderRadius: 8 }} />
                  )}
                  {file.file_type === "application/pdf" && <iframe src={url} title={file.file_name} style={{ display: "block", width: "100%", height: 520, border: "1px solid #e2e8f0", borderRadius: 8, marginTop: 16 }} />}
                </article>;
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
