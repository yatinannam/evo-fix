import { supabase } from "@/lib/supabase";

/**
 * lib/backend.js — helpers for the EvoDoc Express backend
 * (file encrypt/upload/preview, AI extraction, family OTP, phone claim,
 * welcome email, push). Metadata CRUD goes straight to Supabase (RLS); only
 * the secret-holding operations go through this backend.
 *
 * Env (frontend/.env.local):
 *   NEXT_PUBLIC_API_URL         backend base URL (http://localhost:4000 dev,
 *                               https://api.evodev.site prod)
 *   NEXT_PUBLIC_SHARE_BASE_URL  origin that hosts the public /share/:token page
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const SHARE_BASE_URL =
  process.env.NEXT_PUBLIC_SHARE_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

const API_TIMEOUT_MS = 12_000;

/** Authorization header carrying the caller's Supabase session token. */
export async function authHeader() {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`Could not read your sign-in session: ${error.message}`);
  }
  const token = data.session?.access_token;
  if (!token) throw new Error("Your sign-in session is missing or expired. Please sign in again.");
  return { Authorization: `Bearer ${token}` };
}

/** POST JSON to the backend, surfacing its error message on failure. */
export async function postJson(path, body) {
  // Resolve the session before entering the network-error handler. A missing
  // login must never be presented as an unavailable backend service.
  const headers = { ...(await authHeader()), "Content-Type": "application/json" };
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), API_TIMEOUT_MS);
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body ?? {}),
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error("EvoDoc services are taking too long to respond. Please try again shortly.");
    }
    throw new Error("EvoDoc services are unavailable right now. Please try again shortly.");
  } finally {
    window.clearTimeout(timeout);
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}
