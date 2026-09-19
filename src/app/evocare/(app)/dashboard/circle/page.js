"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Heart, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { Rise } from "@/components/dashboard/Rise";
import { Pill } from "@/components/dashboard/Pill";
import { CtaButton } from "@/components/dashboard/CtaButton";
import { withBasePath } from "@/lib/basePath";

const RELATIONS = ["Relation (optional)", "Parent", "Child", "Spouse", "Sibling", "Guardian", "Other"];

export default function CirclePage() {
  const { profiles, invitations, incomingInvitations, sendInvite, confirmInvite, respondToInvitation, setActiveProfile } = useStore();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [relation, setRelation] = useState(RELATIONS[0]);
  const [activeInvite, setActiveInvite] = useState(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSend() {
    if (!email.trim()) return;
    setBusy(true); setError("");
    try {
      const invite = await sendInvite(email.trim(), relation === RELATIONS[0] ? "—" : relation);
      setActiveInvite(invite); setEmail(""); setRelation(RELATIONS[0]);
    } catch (err) { setError(err.message || "Could not send a verification code."); }
    finally { setBusy(false); }
  }

  async function handleConfirm() {
    if (!activeInvite || !code.trim()) return;
    setBusy(true); setError("");
    try { await confirmInvite(activeInvite.id, code.trim()); setActiveInvite(null); setCode(""); }
    catch (err) { setError(err.message || "The code could not be verified."); }
    finally { setBusy(false); }
  }

  function openDashboard(id) { 
    setActiveProfile(id); 
    router.push(withBasePath("/dashboard")); 
  }

  return (
    <div className="dash-grid-layout" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <Rise delay={0.02}>
        <div className="dash-header-row">
          <div className="dash-greeting-area">
            <h1 className="dash-greeting-title">Your Circle</h1>
            <p className="dash-greeting-subtitle">The people you care for, and who care for you — switch between them in a tap, help out where it counts.</p>
          </div>
        </div>
      </Rise>

      <Rise delay={0.08}>
        <div>
          <p style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '16px' }}>People in your Circle</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {profiles.map((person) => { 
              const alert = person.focus.find((item) => item.attention); 
              return (
                <div key={person.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--brand-deep)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: '600' }}>
                      {person.initial}
                    </div>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>{person.isSelf ? "You" : person.name}</span>
                        {person.isSelf && <Pill tone="mint">You</Pill>}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--muted-warm)', marginTop: '2px' }}>
                        {person.isSelf ? person.name : person.relation}
                      </div>
                    </div>
                  </div>

                  <div style={{ padding: '12px', borderRadius: '12px', background: alert ? 'rgba(220, 38, 38, 0.05)' : 'rgba(42, 157, 143, 0.05)' }}>
                    {alert ? (
                      <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>
                        {person.isSelf ? "Your" : `${person.name.split(" ")[0]}'s`} {alert.label.toLowerCase()} needs attention.
                      </p>
                    ) : (
                      <p style={{ color: '#2a9d8f', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', margin: 0 }}>
                        <Heart size={14} aria-hidden /> Everything is looking steady today.
                      </p>
                    )}
                  </div>

                  <button 
                    onClick={() => openDashboard(person.id)} 
                    style={{ 
                      width: '100%', 
                      marginTop: 'auto', 
                      padding: '10px', 
                      borderRadius: '8px', 
                      border: person.isSelf ? '1px solid rgba(0,0,0,0.05)' : 'none', 
                      background: person.isSelf ? 'white' : 'var(--brand-deep)', 
                      color: person.isSelf ? 'var(--ink)' : 'white', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px', 
                      cursor: 'pointer',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {person.isSelf ? "Go to your dashboard" : `View ${person.name.split(" ")[0]}'s dashboard`}
                    <ArrowRight size={16} aria-hidden />
                  </button>
                </div>
              ); 
            })}
          </div>
        </div>
      </Rise>

      {incomingInvitations.length > 0 && (
        <Rise delay={0.12}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '12px' }}>Incoming Invitations</h3>
            <p style={{ fontSize: "14px", color: "var(--muted-warm)", marginBottom: "20px" }}>
              The following people have invited you to their circle.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {incomingInvitations.map((inv) => (
                <div key={inv.id} className="glass-panel" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: '16px', borderRadius: '16px' }}>
                  <div>
                    <span style={{ fontWeight: 600, color: "var(--ink)", display: "block" }}>{inv.requester?.full_name || inv.requester?.email}</span>
                    {inv.requester?.full_name && <span style={{ fontSize: "13px", color: "var(--muted-warm)" }}>{inv.requester.email}</span>}
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.05)', background: 'white', color: 'var(--ink)', cursor: 'pointer', fontWeight: '500' }} onClick={() => respondToInvitation(inv.id, false)}>Decline</button>
                    <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: 'var(--brand-deep)', color: 'white', cursor: 'pointer', fontWeight: '500' }} onClick={() => respondToInvitation(inv.id, true)}>Accept</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Rise>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
        <Rise delay={0.16}>
          <div className="glass-card" style={{ padding: "32px", height: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-deep)' }}>
                <UserPlus size={20} aria-hidden />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)' }}>Invite someone you look after</h3>
            </div>
            
            <p style={{ fontSize: "14px", lineHeight: 1.6, color: "var(--muted-warm)", marginBottom: '24px' }}>
              We email a one-time code to their existing EvoCare account. Enter the code they share back before the invitation is sent.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }}>Their account email</label>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="mom@example.com" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }}>How are they related?</label>
                <select value={relation} onChange={(event) => setRelation(event.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}>
                  {RELATIONS.map((item) => <option key={item}>{item}</option>)}
                </select>
              </div>
              <div style={{ marginTop: '8px' }}>
                <CtaButton successLabel="Code sent" onClick={handleSend} disabled={busy}>Send code</CtaButton>
              </div>
            </div>

            {activeInvite && (
              <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }}>Enter the code they received</label>
                  <input inputMode="numeric" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="6-digit code" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }} />
                </div>
                <div>
                  <CtaButton successLabel="Invitation sent" onClick={handleConfirm} disabled={busy}>Verify and send invitation</CtaButton>
                </div>
              </div>
            )}
            {error && <p style={{ marginTop: "16px", color: 'red', fontSize: '14px' }}>{error}</p>}
          </div>
        </Rise>

        <Rise delay={0.22}>
          <div className="glass-card" style={{ padding: "32px", height: '100%' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '24px' }}>Invitations you've started</h3>
            
            {invitations.length === 0 ? (
              <div style={{ padding: '20px 0', textAlign: 'center' }}>
                <p style={{ fontSize: "14px", color: "var(--muted-warm)" }}>Nothing pending — invite someone whenever you are ready.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {invitations.map((invite) => (
                  <div key={invite.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', borderRadius: '16px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--ink)' }}>{invite.email}</span>
                    <Pill tone="peach">Awaiting verification</Pill>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Rise>
      </div>
    </div>
  );
}
