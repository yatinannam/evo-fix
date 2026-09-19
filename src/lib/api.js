/**
 * lib/api.js — EvoCare data layer (REAL implementation, wired to the live stack)
 *
 *   - Supabase (Mumbai): auth + RLS-scoped metadata CRUD (profiles,
 *     medical_files, reminders, health_readings, file_bundles, shared_links,
 *     family_connections).
 *   - Express backend (lib/backend.js): encrypted file upload, document
 *     preview, AI extraction, family invite/confirm, phone claim, welcome email.
 *
 * Function signatures match the original demo stubs so the store and pages
 * needed only minimal changes.
 */
import { supabase } from "@/lib/supabase";
import { postJson, authHeader, API_URL, SHARE_BASE_URL } from "@/lib/backend";
import { withBasePath } from "@/lib/basePath";

/* ── Metric metadata (unchanged from the demo UI) ─────────────────────────── */
export const METRICS = [
  { key: "blood-sugar", label: "Blood sugar", emoji: "🩸", unit: "mg/dL" },
  { key: "blood-pressure", label: "Blood pressure", emoji: "❤️", unit: "mmHg" },
  { key: "weight", label: "Weight", emoji: "⚖️", unit: "kg" },
  { key: "heart-rate", label: "Heart rate", emoji: "💓", unit: "bpm" },
];

export const METRIC_RANGES = {
  "blood-sugar": { min: 70, max: 140 },
  "blood-pressure": { min: 90, max: 120 },
  "weight": { min: 40, max: 120, target: true },
  "heart-rate": { min: 60, max: 100 },
};

export function statusFor(metric, value) {
  const r = METRIC_RANGES[metric];
  if (!r) return { level: "in", word: "In range" };
  const margin = (r.max - r.min) * 0.15;
  if (value >= r.min && value <= r.max)
    return { level: "in", word: r.target ? "On target" : "In range" };
  const above = value > r.max;
  if (value < r.min - margin || value > r.max + margin)
    return { level: "out", word: r.target ? (above ? "Above target" : "Below target") : above ? "Above range" : "Below range" };
  return { level: "borderline", word: r.target ? "Near target" : "Borderline" };
}

/* ── Shape adapters (DB rows ⇄ demo UI shapes) ────────────────────────────── */
const CATEGORY_TO_LABEL = {
  prescription: "Prescription",
  lab_report: "Lab Report",
  imaging: "Scan",
  discharge_summary: "Discharge Summary",
  other: "Other",
};
const LABEL_TO_CATEGORY = Object.fromEntries(
  Object.entries(CATEGORY_TO_LABEL).map(([k, v]) => [v.toLowerCase(), k])
);

const metricToDb = (m) => String(m || "").replace(/-/g, "_");
const dbToMetric = (t) => String(t || "").replace(/_/g, "-");

const mapDoc = (r) => ({
  id: r.id, name: r.file_name, type: CATEGORY_TO_LABEL[r.category] || "Other",
  date: r.uploaded_at, storagePath: r.storage_path, category: r.category, bundleId: r.bundle_id || null,
});
const mapMed = (r) => ({
  id: r.id, name: r.medication_name, dose: r.dosage || "—",
  times: r.times_of_day || [], reminders: r.is_active !== false,
});
const mapReading = (r) => ({
  id: r.id, metric: dbToMetric(r.reading_type), value: Number(r.value_primary), at: r.measured_at,
});
const mapEvent = (r) => ({
  id: r.id, name: r.name, description: r.description || "",
  date: r.event_date || r.created_at, docCount: r.medical_files?.[0]?.count ?? 0,
});
function mapShareLink(r) {
  const count = r.shared_link_files?.[0]?.count ?? 0;
  return {
    id: r.id, label: r.label || "Shared documents",
    scope: `${count} document${count === 1 ? "" : "s"}`,
    createdAt: r.created_at, expiresAt: r.expires_at, revoked: r.revoked,
    url: `${SHARE_BASE_URL}/share/${r.token}`,
  };
}

/* ── Session / profile helpers ────────────────────────────────────────────── */
async function requireUser() {
  const { data } = await supabase.auth.getSession();
  const user = data.session?.user;
  if (!user) { const e = new Error("NOT_SIGNED_IN"); e.code = "NOT_SIGNED_IN"; throw e; }
  return user;
}
async function fetchProfile(userId) {
  const { data } = await supabase
    .from("profiles").select("*")
    .eq("id", userId).maybeSingle();
  return data;
}

/* ══ DATA ═══════════════════════════════════════════════════════════════════ */

export async function getCurrentUser() {
  const user = await requireUser();
  const p = await fetchProfile(user.id);

  // Use first_name and last_name if available, fallback to full_name or email
  const name = p?.first_name
    ? [p.first_name, p.last_name].filter(Boolean).join(" ")
    : (p?.full_name || user.email);

  const firstName = p?.first_name || (p?.full_name ? p.full_name.split(" ")[0] : "");
  const lastName = p?.last_name || (p?.full_name ? p.full_name.split(" ").slice(1).join(" ") : "");

  return {
    id: user.id,
    email: user.email,
    name,
    firstName,
    lastName,
    phoneVerified: !!p?.phone_verified || !!user.user_metadata?.phone_verified,
    // blood_group is optional in the UI — don't block onboarding completion on it
    detailsMissing: !firstName || !p?.age || !p?.gender,
    needsPasswordSetup: !user.user_metadata?.password_setup_done,
    ...p
  };
}

export async function updateAdvancedProfile(payload) {
  const user = await requireUser();
  const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
  if (error) throw error;
}

export async function uploadAvatar(file) {
  const user = await requireUser();
  const ext = file.name.split('.').pop();
  const filePath = `${user.id}/avatar_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

  const { error: updateError } = await supabase.from('profiles')
    .update({ avatar_url: data.publicUrl })
    .eq('id', user.id);

  if (updateError) throw updateError;
  return data.publicUrl;
}

export async function deleteAvatar() {
  const user = await requireUser();
  const { error } = await supabase.from('profiles')
    .update({ avatar_url: null })
    .eq('id', user.id);
  if (error) throw error;
}

export async function getDocs(ownerId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("medical_files").select("*")
    .eq("user_id", ownerId || user.id).order("uploaded_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapDoc);
}

/** Upload a document — backend encrypts (AES-256-GCM) before storage. doc.file = File. */
export async function addDoc(ownerId, doc) {
  const user = await requireUser();
  if (!doc?.file) throw new Error("Choose a file to upload.");
  const form = new FormData();
  form.append("file", doc.file);
  form.append("category", LABEL_TO_CATEGORY[String(doc.type || "").toLowerCase()] || "other");
  if (ownerId && ownerId !== user.id) form.append("for_user", ownerId);
  if (doc.bundleId) form.append("bundle_id", doc.bundleId);
  const res = await fetch(`${API_URL}/api/files`, { method: "POST", headers: await authHeader(), body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Upload failed (${res.status})`);
  return mapDoc(data);
}

/** Owner/family preview — backend decrypts + streams; returns a blob object URL. */
export async function getDocumentPreview(id) {
  const res = await fetch(`${API_URL}/api/files/${id}/view`, { headers: await authHeader() });
  if (!res.ok) {
    const b = await res.json().catch(() => ({}));
    throw new Error(b.error || "Could not open this document.");
  }
  return URL.createObjectURL(await res.blob());
}

export async function getMeds(ownerId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("reminders").select("*")
    .eq("user_id", ownerId || user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapMed);
}

export async function addMed(ownerId, med) {
  const user = await requireUser();
  const { data, error } = await supabase.from("reminders").insert({
    user_id: ownerId || user.id,
    medication_name: med.name,
    dosage: med.dose === "—" ? null : med.dose,
    frequency: "daily",
    times_of_day: med.times || [],
    source: med.source || "manual",
    source_file_id: med.sourceFileId || null,
  }).select().single();
  if (error) throw error;
  return mapMed(data);
}

export async function removeMed(_ownerId, id) {
  const { error } = await supabase.from("reminders").delete().eq("id", id);
  if (error) throw error;
}

export async function getReadings(ownerId, metric) {
  const user = await requireUser();
  let q = supabase.from("health_readings").select("*")
    .eq("user_id", ownerId || user.id).order("measured_at", { ascending: true }).limit(500);
  if (metric) q = q.eq("reading_type", metricToDb(metric));
  const { data, error } = await q;
  if (error) throw error;
  return (data || []).map(mapReading);
}

export async function addReading(ownerId, reading) {
  const user = await requireUser();
  const meta = METRICS.find((m) => m.key === reading.metric);
  const { data, error } = await supabase.from("health_readings").insert({
    user_id: ownerId || user.id,
    reading_type: metricToDb(reading.metric),
    value_primary: reading.value,
    unit: meta?.unit || "",
    notes: reading.note || null,
    measured_at: reading.at || new Date().toISOString(),
  }).select().single();
  if (error) throw error;
  return mapReading(data);
}

export async function getEvents(ownerId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("file_bundles").select("*, medical_files(count)")
    .eq("user_id", ownerId || user.id).order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapEvent);
}

export async function addEvent(_ownerId, event) {
  const user = await requireUser(); // bundles are owner-only under RLS
  const { data, error } = await supabase.from("file_bundles").insert({
    user_id: user.id,
    name: event.name,
    description: event.description || null,
    event_date: event.date ? String(event.date).slice(0, 10) : null,
  }).select().single();
  if (error) throw error;
  return mapEvent(data);
}

export async function getShareLinks(ownerId) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("shared_links").select("*, shared_link_files(count)")
    .eq("user_id", ownerId || user.id).eq("revoked", false)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(mapShareLink);
}

/** Create a time-bound share link for the given files (owner or family). */
export async function createShareLink(ownerId, files, { label, expiresInHours = 24 } = {}) {
  const user = await requireUser();
  if (!files?.length) throw new Error("Select at least one document to share.");
  const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000).toISOString();
  const { data: link, error } = await supabase.from("shared_links").insert({
    user_id: ownerId || user.id, label: label || null, expires_at: expiresAt,
  }).select("*").single();
  if (error) throw error;
  const { error: jerr } = await supabase.from("shared_link_files")
    .insert(files.map((f) => ({ link_id: link.id, file_id: f.id })));
  if (jerr) {
    await supabase.from("shared_links").delete().eq("id", link.id); // roll back
    throw jerr;
  }
  return mapShareLink({ ...link, shared_link_files: [{ count: files.length }] });
}

export async function revokeLink(_ownerId, id) {
  const { error } = await supabase.from("shared_links").update({ revoked: true }).eq("id", id);
  if (error) throw error;
}

/* ── AI extraction ────────────────────────────────────────────────────────── */
/** Extract medications from an already-stored file (returns suggested drafts). */
export async function extractMedications(storagePath) {
  const data = await postJson("/api/ai/extract-medications", { storage_path: storagePath });
  return data.medications || [];
}

/* ── Circle (family) ──────────────────────────────────────────────────────── */
async function buildFocus(ownerId) {
  const { data } = await supabase
    .from("health_readings").select("reading_type, value_primary, measured_at")
    .eq("user_id", ownerId).order("measured_at", { ascending: false }).limit(64);
  const rows = data || [];
  const focus = [];
  for (const M of METRICS) {
    const series = rows.filter((r) => r.reading_type === metricToDb(M.key)).slice(0, 8).reverse();
    if (!series.length) continue;
    const last = Number(series[series.length - 1].value_primary);
    const s = statusFor(M.key, last);
    focus.push({
      metric: M.key, label: M.label, value: String(last), unit: M.unit,
      statusWord: s.word, attention: s.level !== "in",
      verdict: s.level === "in" ? "Right where it should be."
        : s.level === "borderline" ? "Slightly outside the usual range — worth keeping an eye on."
          : "Outside the usual range — consider checking in.",
      trend: series.map((r) => Number(r.value_primary)), band: METRIC_RANGES[M.key],
    });
  }
  if (!focus.length) focus.push({
    metric: "blood-sugar", label: "No readings yet", value: "—", unit: "",
    statusWord: "No data", attention: false, verdict: "Log a first reading to see trends here.",
    trend: [0, 0], band: { min: 0, max: 1 },
  });
  return focus;
}

async function buildNextDose(ownerId) {
  const { data } = await supabase
    .from("reminders").select("medication_name, dosage, times_of_day, is_active").eq("user_id", ownerId);
  const meds = (data || []).filter((m) => m.is_active !== false);
  let best = null;
  const now = new Date(); const nowMin = now.getHours() * 60 + now.getMinutes();
  for (const m of meds) for (const t of m.times_of_day || []) {
    const [h, mi] = String(t).split(":").map(Number);
    if (Number.isNaN(h)) continue;
    const mins = h * 60 + (mi || 0);
    const delta = mins >= nowMin ? mins - nowMin : mins - nowMin + 1440;
    if (!best || delta < best.delta) best = { delta, name: m.medication_name, dose: m.dosage || "", hour: h, minute: mi || 0 };
  }
  if (!best) return null;
  const { name, dose, hour, minute } = best;
  return { name, dose, hour, minute };
}

/** Self + accepted family members, each with real focus cards + next dose. */
export async function getCircle() {
  const user = await requireUser();
  const p = await fetchProfile(user.id);
  const { data: conns, error } = await supabase.from("family_connections").select(`
      *,
      requester:profiles!family_connections_requester_id_fkey (id, full_name, email),
      recipient:profiles!family_connections_recipient_id_fkey (id, full_name, email)
    `).eq("status", "accepted");
  if (error) throw error;
  const members = (conns || []).map((c) => {
    const isReq = c.requester?.id === user.id;
    const other = isReq ? c.recipient : c.requester;
    if (!other) return null;
    const label = isReq ? c.requester_label : c.recipient_label;
    return { id: other.id, name: other.full_name || other.email, relation: label || "Family", connectionId: c.id, isSelf: false };
  }).filter(Boolean);

  const first = (p?.full_name || "").split(" ")[0];
  const people = [
    { id: user.id, name: p?.full_name || user.email, relation: "You", isSelf: true, greeting: first ? `Good to see you, ${first}.` : "Good to see you." },
    ...members.map((m) => ({ ...m, greeting: `Here's how ${m.name.split(" ")[0]} is doing.` })),
  ];
  return Promise.all(people.map(async (person) => ({
    ...person, initial: (person.name || "?").charAt(0).toUpperCase(),
    focus: await buildFocus(person.id), nextDose: await buildNextDose(person.id),
    streakDays: 0, lastActive: "", conditions: [], insight: "",
  })));
}

/** Pending invitations addressed to ME (recipient), awaiting accept/decline. */
export async function getIncomingInvitations() {
  const user = await requireUser();
  const { data, error } = await supabase.from("family_connections").select(`
      id, status,
      requester:profiles!family_connections_requester_id_fkey (id, full_name, email)
    `).eq("status", "pending").eq("recipient_id", user.id);
  if (error) throw error;
  return data || [];
}

/** Recipient accepts/declines a revealed invitation (RLS-guarded direct update). */
export async function respondToInvitation(connectionId, accept) {
  const { error } = await supabase.from("family_connections")
    .update({ status: accept ? "accepted" : "declined", responded_at: new Date().toISOString() })
    .eq("id", connectionId);
  if (error) throw error;
}

/** Start an invite — backend emails a code to the recipient. */
export async function sendInvite(_ownerId, email, relation) {
  const data = await postJson("/api/family/invite", {
    email, relation: relation && relation !== "—" ? relation : undefined,
  });
  return { id: data.connection_id, email, relation: relation || "—", needsCode: !!data.needs_code, message: data.message };
}

/** Sender enters the code the recipient read back → invitation goes live. */
export async function confirmInvite(connectionId, code) {
  return postJson("/api/family/confirm-code", { connection_id: connectionId, code });
}

/** Remove a connection entirely (cancel / disconnect). */
export async function removeConnection(connectionId) {
  const { error } = await supabase.from("family_connections").delete().eq("id", connectionId);
  if (error) throw error;
}

/* ══ AUTH ═══════════════════════════════════════════════════════════════════ */

export async function checkEmail(email) {
  const res = await fetch(`/api/check-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Failed to check email.");
  return data;
}

export async function checkPhone(phone) {
  const res = await fetch(`/api/check-phone`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Could not check phone number.");
  }
  return res.json();
}

export async function savePhone(phone) {
  const user = await requireUser();
  const { error } = await supabase.from("profiles").update({ phone, phone_verified: true }).eq("id", user.id);
  if (error) throw error;
  await supabase.auth.updateUser({
    data: {
      phone,
      phone_verified: true,
    },
  });
}

export async function signInWithEmailOtp(email) {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw new Error(error.message);
}

export async function verifyEmailOtp(email, token) {
  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw new Error(error.message);
  const p = await fetchProfile(data.user.id);
  postJson("/api/account/welcome", {}).catch(() => { });
  // Do NOT set evocare_logged_in here — the user still needs to complete onboarding.
  // The flag is set by completeOnboarding() (new users) or store.js bootstrap (returning users).
  return { id: data.user.id, email: data.user.email, phoneVerified: !!p?.phone_verified };
}

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  const p = await fetchProfile(data.user.id);
  postJson("/api/account/welcome", {}).catch(() => { }); // one-time, server dedupes
  const phoneVerified = !!p?.phone_verified || !!data.user.user_metadata?.phone_verified;
  const firstName = p?.first_name || (p?.full_name ? p.full_name.split(" ")[0] : "");
  const detailsMissing = !firstName || !p?.age || !p?.gender;
  // Only cache the logged-in state for users who have fully completed onboarding.
  // Partially-onboarded returning users will have the flag set by completeOnboarding().
  if (typeof window !== "undefined" && phoneVerified && !detailsMissing) {
    localStorage.setItem("evocare_logged_in", "true");
  }
  return { id: data.user.id, email: data.user.email, phoneVerified };
}

export async function signInWithGoogle() {
  const redirectTo = `${window.location.origin}${withBasePath("/dashboard")}`;
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });
  if (error) throw new Error(error.message);
}

export async function signupUser(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { password_setup_done: true }
    }
  });
  if (error) throw new Error(error.message);
  if (!data.session) throw new Error("Check your inbox to confirm your email, then sign in.");
  postJson("/api/account/welcome", {}).catch(() => { });
  // Do NOT set evocare_logged_in here — user still needs phone + details steps.
  // The flag is set only after completeOnboarding() succeeds.
  return { id: data.user.id, email, phoneVerified: false };
}

export async function requestPasswordReset(email) {
  const redirectTo = `${window.location.origin}${withBasePath("/update-password")}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(error.message);
}

export async function updatePassword(password) {
  const { error } = await supabase.auth.updateUser({
    password,
    data: { password_setup_done: true }
  });
  if (error) throw error;
}

export async function skipPasswordSetup() {
  const { error } = await supabase.auth.updateUser({
    data: { password_setup_done: true }
  });
  if (error) throw error;
}

/**
 * PRE-LAUNCH: claim a phone number directly (validated + unique, no SMS).
 * The backend's OTP flow stays available for when SMS is enabled.
 */
export async function sendOtp(phone) {
  const data = await postJson("/api/phone/claim", { phone });
  return { sent: true, phone: data.phone };
}

export async function enablePushNotifications() {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    throw new Error("This browser does not support push notifications.");
  }
  // The worker file lives at the site root (public/evocare-sw.js), NOT under
  // the /evocare app prefix — withBasePath() here would 404 the registration.
  const registration = await navigator.serviceWorker.register("/evocare-sw.js");
  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("Notification permission was not granted.");
  const keyResponse = await fetch(`${API_URL}/api/push/public-key`, { headers: await authHeader() });
  const keyData = await keyResponse.json().catch(() => ({}));
  if (!keyResponse.ok) throw new Error(keyData.error || "Notifications are not configured yet.");
  const decodeKey = (value) => {
    const padded = value + "=".repeat((4 - (value.length % 4)) % 4);
    const raw = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return Uint8Array.from(raw, (char) => char.charCodeAt(0));
  };
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true, applicationServerKey: decodeKey(keyData.publicKey),
  });
  await postJson("/api/push/subscribe", subscription.toJSON());
  return subscription;
}

/** Pre-launch: no code step — treated as verified once claimed. */
export async function verifyOtp() {
  return { verified: true };
}

export async function completeOnboarding(profileData) {
  const user = await requireUser();
  const full_name = [profileData.firstName, profileData.lastName].filter(Boolean).join(" ").trim();

  const updatePayload = {};
  if (full_name) updatePayload.full_name = full_name;
  if (profileData.firstName) updatePayload.first_name = profileData.firstName;
  if (profileData.lastName) updatePayload.last_name = profileData.lastName;
  if (profileData.age) updatePayload.age = parseInt(profileData.age, 10);
  if (profileData.gender) updatePayload.gender = profileData.gender;
  if (profileData.bloodGroup) updatePayload.blood_group = profileData.bloodGroup;

  if (profileData.phone) {
    updatePayload.phone = profileData.phone;
    updatePayload.phone_verified = true;
  }

  if (Object.keys(updatePayload).length > 0) {
    const { error } = await supabase.from("profiles").update(updatePayload).eq("id", user.id);
    if (error) throw error;
  }

  await supabase.auth.updateUser({
    data: {
      full_name: full_name || undefined,
      first_name: profileData.firstName || undefined,
      last_name: profileData.lastName || undefined,
      age: profileData.age ? parseInt(profileData.age, 10) : undefined,
      gender: profileData.gender || undefined,
      blood_group: profileData.bloodGroup || undefined,
      phone: profileData.phone || undefined,
      phone_verified: !!profileData.phone,
    },
  });
  // All onboarding steps are done — now it's safe to cache the logged-in state.
  // This is the single source of truth for new users completing setup.
  if (typeof window !== "undefined") {
    localStorage.setItem("evocare_logged_in", "true");
  }
  return { ...profileData, id: user.id };
}

export async function logoutUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("evocare_logged_in");
    document.cookie.split(";").forEach((c) => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }
  await supabase.auth.signOut();
}
