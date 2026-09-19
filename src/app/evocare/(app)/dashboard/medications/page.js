"use client";

import { useState } from "react";
import { Bell, Check, Loader2, ScanLine, Trash2, Plus } from "lucide-react";
import { useStore } from "@/lib/store";
import { enablePushNotifications } from "@/lib/api";
import { Rise } from "@/components/dashboard/Rise";
import { Pill } from "@/components/dashboard/Pill";
import { CtaButton } from "@/components/dashboard/CtaButton";

export default function MedicationsPage() {
  const { meds, docs, takenDoses, addMed, removeMed, extractPrescription } = useStore();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [time, setTime] = useState("08:00");
  const [selectedRx, setSelectedRx] = useState("");
  const [extraction, setExtraction] = useState("idle");
  const [message, setMessage] = useState("");
  const [drafts, setDrafts] = useState([]);
  const prescriptions = docs.filter((doc) => doc.type === "Prescription");

  async function handleRxSelect(id) {
    setSelectedRx(id); setMessage(""); setDrafts([]);
    if (!id) return;
    const prescription = prescriptions.find((doc) => doc.id === id);
    setExtraction("loading");
    try {
      const medications = await extractPrescription(prescription.storagePath);
      setDrafts(medications.map((med, index) => ({
        id: `${index}-${med.name}`, name: med.name || "", dose: med.dosage || "",
        times: med.times_of_day?.length ? med.times_of_day : ["09:00"], sourceFileId: prescription.id,
      })));
      setExtraction("done");
      setMessage(medications.length
        ? `Found ${medications.length} medicine${medications.length === 1 ? "" : "s"}. Review each reminder before saving.`
        : "No medicines could be read from this document.");
    } catch (error) {
      setExtraction("error");
      setMessage(error.message || "Could not read this prescription.");
    }
  }

  async function handleAdd() {
    if (!name.trim()) return;
    await addMed({ name: name.trim(), dose: dose.trim() || "—", times: [time], reminders: true });
    setName(""); setDose(""); setTime("08:00"); setShowForm(false);
  }

  async function saveDraft(draft) {
    if (!draft.name.trim()) return;
    try {
      await addMed({ name: draft.name.trim(), dose: draft.dose.trim() || "—", times: draft.times, reminders: true, source: "ai", sourceFileId: draft.sourceFileId });
      setDrafts((items) => items.filter((item) => item.id !== draft.id));
      setMessage(`${draft.name} reminder saved.`);
    } catch (error) { setMessage(error.message || "Could not save the reminder."); }
  }

  async function turnOnReminders() {
    try { await enablePushNotifications(); setMessage("Medication notifications are on for this device."); }
    catch (error) { setMessage(error.message || "Could not turn on notifications."); }
  }

  return (
    <div className="dash-grid-layout" style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
      <Rise delay={0.02}>
        <div className="dash-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="dash-greeting-area">
            <h1 className="dash-greeting-title">Medications</h1>
            <p className="dash-greeting-subtitle">Add reminders yourself, or let us read a prescription and fill a reviewable draft for you.</p>
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button style={{ background: 'white', border: '1px solid rgba(0,0,0,0.05)', padding: '10px 16px', borderRadius: '99px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: '600', color: 'var(--ink)' }} onClick={turnOnReminders}>
              <Bell size={16} aria-hidden /> Turn on reminders
            </button>
            <CtaButton successLabel="Form open" onClick={() => setShowForm((open) => !open)}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Plus size={16} /> Add manually
              </span>
            </CtaButton>
          </div>
        </div>
      </Rise>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        <Rise delay={0.08}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'var(--brand-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-deep)' }}>
                <ScanLine size={20} aria-hidden />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ink)' }}>Smart setup from a prescription</h2>
            </div>
            <p style={{ color: 'var(--muted-warm)', fontSize: '14px', marginBottom: '24px' }}>Pick an uploaded prescription and we'll pre-fill the reminders. Nothing is saved until you review it.</p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <select 
                value={selectedRx} 
                onChange={(event) => handleRxSelect(event.target.value)} 
                disabled={extraction === "loading"}
                style={{ flex: 1, minWidth: '240px', maxWidth: '320px', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', background: 'white' }}
              >
                <option value="">Choose a prescription to read...</option>
                {prescriptions.map((doc) => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
              </select>
              
              {extraction === "loading" && <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--ink)' }}><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Reading prescription...</span>}
              {extraction === "done" && <span style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2a9d8f' }}><Check size={16} />{message}</span>}
              {extraction === "error" && <span style={{ color: 'red' }}>{message}</span>}
            </div>
            {prescriptions.length === 0 && <p style={{ marginTop: "16px", fontSize: "14px", color: "var(--muted-warm)" }}>Upload a prescription in My Documents first, and it will appear here.</p>}
          </div>
        </Rise>

        {drafts.length > 0 && (
          <Rise>
            <div className="glass-card" style={{ padding: "32px", background: 'rgba(62, 157, 247, 0.05)' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--ink)', marginBottom: '24px' }}>Review extracted reminders</h2>
              {drafts.map((draft) => (
                <div key={draft.id} style={{ display: 'flex', gap: '16px', alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: '16px', padding: '16px', background: 'white', borderRadius: '16px' }}>
                  <div style={{ flex: 1, minWidth: "180px" }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }}>Medication name</label>
                    <input style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }} value={draft.name} onChange={(event) => setDrafts((items) => items.map((item) => item.id === draft.id ? { ...item, name: event.target.value } : item))} />
                  </div>
                  <div style={{ flex: 1, minWidth: "140px" }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }}>Dose</label>
                    <input style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }} value={draft.dose} onChange={(event) => setDrafts((items) => items.map((item) => item.id === draft.id ? { ...item, dose: event.target.value } : item))} />
                  </div>
                  <div style={{ minWidth: "130px" }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }}>Time</label>
                    <input type="time" style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }} value={draft.times[0] || "09:00"} onChange={(event) => setDrafts((items) => items.map((item) => item.id === draft.id ? { ...item, times: [event.target.value] } : item))} />
                  </div>
                  <div>
                    <CtaButton successLabel="Reminder saved" onClick={() => saveDraft(draft)}>Save reminder</CtaButton>
                  </div>
                </div>
              ))}
            </div>
          </Rise>
        )}

        {message && extraction === "idle" && <p style={{ color: "#2a9d8f", marginBottom: "16px" }}>{message}</p>}

        {showForm && (
          <Rise>
            <div className="glass-card" style={{ padding: "32px", display: "flex", flexWrap: "wrap", alignItems: "flex-end", gap: "16px", background: 'rgba(0,0,0,0.02)' }}>
              <div style={{ minWidth: "180px", flex: 1 }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }}>Medication name</label>
                <input value={name} onChange={(event) => setName(event.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div style={{ width: "128px" }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }}>Dose</label>
                <input value={dose} onChange={(event) => setDose(event.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div style={{ width: "128px" }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px', color: 'var(--ink)' }}>Time</label>
                <input type="time" value={time} onChange={(event) => setTime(event.target.value)} style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)' }} />
              </div>
              <div>
                <CtaButton successLabel="Reminder saved" onClick={handleAdd}>Save reminder</CtaButton>
              </div>
            </div>
          </Rise>
        )}

        <Rise delay={0.16}>
          <div className="glass-card" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: 'var(--ink)', marginBottom: '24px' }}>Your reminders</h2>
            {meds.length === 0 ? (
              <div style={{ padding: '40px 0', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '600', color: 'var(--ink)', marginBottom: '8px' }}>No reminders yet — add one whenever you are ready.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {meds.flatMap((med) => med.times.map((at) => (
                  <div key={med.id + at} className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', borderRadius: '16px' }}>
                    <div>
                      <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)' }}>{med.name}</div>
                      <div style={{ fontSize: '14px', color: 'var(--muted-warm)', marginTop: '4px' }}>{med.dose}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '16px', fontWeight: '600', color: 'var(--ink)' }}>{at}</span>
                      <Pill tone={takenDoses.includes(`${med.id}@${at}`) ? "mint" : "neutral"}>
                        {takenDoses.includes(`${med.id}@${at}`) ? "Taken" : "Pending"}
                      </Pill>
                      <button onClick={() => removeMed(med.id)} style={{ background: 'white', border: '1px solid rgba(220, 38, 38, 0.2)', color: '#dc2626', borderRadius: '8px', padding: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }} aria-label={`Remove ${med.name}`}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )))}
              </div>
            )}
          </div>
        </Rise>
      </div>
      <style jsx global>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
