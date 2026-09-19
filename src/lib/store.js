"use client";

/**
 * lib/store.js — EvoCare React Context Store (wired to the real backend)
 *
 * Wraps lib/api.js so components never call API functions directly.
 * Bootstraps from the signed-in Supabase session; switching the active profile
 * (self ⇄ connected family member) re-fetches that person's data — Row Level
 * Security decides what the caller may see. Redirects to login if signed out.
 */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getCurrentUser,
  getDocs,
  addDoc as apiAddDoc,
  getDocumentPreview as apiGetDocumentPreview,
  getMeds,
  addMed as apiAddMed,
  removeMed as apiRemoveMed,
  getReadings,
  addReading as apiAddReading,
  getEvents,
  addEvent as apiAddEvent,
  getShareLinks,
  createShareLink as apiCreateShareLink,
  revokeLink as apiRevokeLink,
  extractMedications as apiExtractMedications,
  getCircle,
  getIncomingInvitations,
  respondToInvitation as apiRespondToInvitation,
  sendInvite as apiSendInvite,
  confirmInvite as apiConfirmInvite,
  statusFor,
  METRICS,
  METRIC_RANGES,
} from "./api";
import { withBasePath } from "./basePath";

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const router = useRouter();
  const [user, setUser]           = useState({ id: null, name: "...", email: "" });
  const [docs, setDocs]           = useState([]);
  const [meds, setMeds]           = useState([]);
  const [readings, setReadings]   = useState([]);
  const [events, setEvents]       = useState([]);
  const [shareLinks, setShareLinks] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [incomingInvitations, setIncomingInvitations] = useState([]);
  const [takenDoses, setTakenDoses]   = useState([]);
  const [activeProfileId, setActiveProfileId] = useState(null);
  const [profiles, setProfiles]   = useState([]);
  const [loading, setLoading]     = useState(true);

  async function loadDataFor(ownerId) {
    const [d, m, r, e, sl] = await Promise.all([
      getDocs(ownerId), getMeds(ownerId), getReadings(ownerId),
      getEvents(ownerId), getShareLinks(ownerId),
    ]);
    setDocs(d); setMeds(m); setReadings(r); setEvents(e); setShareLinks(sl);
  }

  // ── Bootstrap: session → circle + incoming invites → self data ────────────
  useEffect(() => {
    async function bootstrap() {
      try {
        const u = await getCurrentUser();
        if (!u.phoneVerified) {
          // router.push, not window.location.assign: a full reload would
          // clear the in-memory Supabase session before /onboarding/phone
          // can read it (see lib/supabase.ts).
          router.push(withBasePath("/onboarding/phone"));
          return;
        }
        if (typeof window !== "undefined") localStorage.setItem("evocare_logged_in", "true");
        setUser(u);
        setActiveProfileId(u.id);
        const [circle, incoming] = await Promise.all([
          getCircle(), getIncomingInvitations(), loadDataFor(u.id),
        ]);
        setProfiles(circle);
        setIncomingInvitations(incoming);
      } catch (err) {
        if (err?.code === "NOT_SIGNED_IN" || err?.message === "NOT_SIGNED_IN") {
          window.location.assign(withBasePath("/login/"));
          return;
        }
        console.error("EvoCare store bootstrap error:", err);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  // ── Switch whose records we're viewing (self or family) ───────────────────
  async function setActiveProfile(id) {
    if (!id || id === activeProfileId) return;
    setActiveProfileId(id);
    setLoading(true);
    try { await loadDataFor(id); }
    catch (err) { console.error("Profile switch error:", err); }
    finally { setLoading(false); }
  }

  async function refreshCircle() {
    try {
      const [circle, incoming] = await Promise.all([getCircle(), getIncomingInvitations()]);
      setProfiles(circle);
      setIncomingInvitations(incoming);
    } catch (err) { console.error("Circle refresh error:", err); }
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeProfile =
    profiles.find((p) => p.id === activeProfileId) ?? profiles[0] ?? {
      id: activeProfileId, name: user.name, relation: "You", isSelf: true,
      initial: (user.name || "?").charAt(0).toUpperCase(), greeting: "Good to see you.",
      focus: [{
        metric: "blood-sugar", label: "No readings yet", value: "—", unit: "",
        statusWord: "No data", attention: false,
        verdict: "Log a first reading to see trends here.", trend: [0, 0], band: { min: 0, max: 1 },
      }],
      nextDose: null, streakDays: 0, lastActive: "", conditions: [], insight: "",
    };

  // ── Actions ─────────────────────────────────────────────────────────────
  async function addDoc(doc) {
    // Real upload hits the backend first (file is encrypted there) — no
    // optimistic insert; the page shows its own busy state.
    const saved = await apiAddDoc(activeProfileId, doc);
    setDocs((prev) => [saved, ...prev]);
    if (saved.bundleId) {
      setEvents((prev) => prev.map((e) =>
        e.id === saved.bundleId ? { ...e, docCount: (e.docCount || 0) + 1 } : e
      ));
    }
    return saved;
  }

  function openDocument(id) { return apiGetDocumentPreview(id); }

  function extractPrescription(storagePath) { return apiExtractMedications(storagePath); }

  async function addMed(med) {
    const tmp = { ...med, id: `tmp-${Math.random().toString(36).slice(2)}` };
    setMeds((prev) => [tmp, ...prev]);
    try {
      const saved = await apiAddMed(activeProfileId, med);
      setMeds((prev) => prev.map((m) => (m.id === tmp.id ? saved : m)));
      return saved;
    } catch (err) {
      setMeds((prev) => prev.filter((m) => m.id !== tmp.id));
      console.error("Add medication failed:", err);
      throw err;
    }
  }

  async function removeMed(id) {
    const before = meds;
    setMeds((prev) => prev.filter((m) => m.id !== id));
    try { await apiRemoveMed(activeProfileId, id); }
    catch (err) { setMeds(before); console.error("Remove medication failed:", err); }
  }

  async function addReading(reading) {
    const tmp = { ...reading, id: `tmp-${Math.random().toString(36).slice(2)}` };
    setReadings((prev) => [...prev, tmp]);
    try {
      const saved = await apiAddReading(activeProfileId, reading);
      setReadings((prev) => prev.map((r) => (r.id === tmp.id ? saved : r)));
    } catch (err) {
      setReadings((prev) => prev.filter((r) => r.id !== tmp.id));
      console.error("Add reading failed:", err);
    }
  }

  async function addEvent(event) {
    const tmp = { ...event, id: `tmp-${Math.random().toString(36).slice(2)}`, docCount: 0 };
    setEvents((prev) => [tmp, ...prev]);
    try {
      const saved = await apiAddEvent(user.id, event);
      setEvents((prev) => prev.map((e) => (e.id === tmp.id ? saved : e)));
    } catch (err) {
      setEvents((prev) => prev.filter((e) => e.id !== tmp.id));
      console.error("Add event failed:", err);
    }
  }

  async function createShareLink(files, options) {
    const link = await apiCreateShareLink(activeProfileId, files, options);
    setShareLinks((prev) => [link, ...prev]);
    return link;
  }

  async function revokeLink(id) {
    const before = shareLinks;
    setShareLinks((prev) => prev.filter((l) => l.id !== id));
    try { await apiRevokeLink(activeProfileId, id); }
    catch (err) { setShareLinks(before); console.error("Revoke failed:", err); }
  }

  async function sendInvite(email, relation) {
    const inv = await apiSendInvite(user.id, email, relation);
    setInvitations((prev) => [inv, ...prev]);
    return inv;
  }

  async function confirmInvite(connectionId, code) {
    const result = await apiConfirmInvite(connectionId, code);
    setInvitations((prev) => prev.filter((i) => i.id !== connectionId));
    await refreshCircle();
    return result;
  }

  async function respondToInvitation(id, accept) {
    await apiRespondToInvitation(id, accept);
    await refreshCircle();
  }

  function markDose(key) {
    setTakenDoses((prev) => (prev.includes(key) ? prev : [...prev, key]));
  }

  function readingsFor(metric) {
    return readings.filter((r) => r.metric === metric).sort((a, b) => new Date(a.at) - new Date(b.at));
  }

  const value = useMemo(
    () => ({
      user, loading, docs, meds, readings, events, shareLinks,
      invitations, incomingInvitations, takenDoses, profiles,
      activeProfileId, activeProfile,
      setActiveProfile, refreshCircle,
      addDoc, openDocument, extractPrescription,
      addMed, removeMed, addReading, addEvent,
      createShareLink, revokeLink,
      sendInvite, confirmInvite, respondToInvitation,
      markDose, readingsFor,
      METRICS, METRIC_RANGES, statusFor,
    }),
    [user, loading, docs, meds, readings, events, shareLinks, invitations, incomingInvitations, takenDoses, profiles, activeProfileId]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
