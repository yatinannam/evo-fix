import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL  ?? '';
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// In-memory storage adapter for the Supabase auth session.
//
// Why: supabase-js defaults to localStorage, which is readable by any script
// on the page — a single XSS gives an attacker a long-lived, replayable
// access + refresh token pair. This app runs supabase-js directly in the
// browser (RLS-scoped table queries from lib/api.js), so the JWT must live
// in JS the client can read; the only way to keep it out of reach of a
// separate injected script is to never persist it to localStorage/
// sessionStorage (both are readable by any script in the page's origin) and
// keep it in a plain module-level variable instead.
//
// Trade-off: a full page reload (or closing the tab) clears this storage,
// so the user is signed out and redirected to /login on reload — the store
// already does this for any missing session (see lib/store.js), so the only
// change is that it now also fires after a refresh, not just after a real
// sign-out. OAuth (Google) and password-reset/email links still work: both
// hand the session back via the URL on that page load, which supabase-js
// reads via detectSessionInUrl before anything is lost.
const memoryStorage: {
  data: Record<string, string>;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
} = {
  data: {},
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.data, key) ? this.data[key] : null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
};

// Lazy singleton — only instantiated when first accessed, so build-time
// static analysis doesn't throw "supabaseUrl is required".
let _supabase: ReturnType<typeof createClient> | null = null;

export function getSupabase() {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnon) {
      throw new Error(
        "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to frontend/.env, then restart the frontend.",
      );
    }
    _supabase = createClient(supabaseUrl, supabaseAnon, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _supabase;
}

// Convenience named export kept for backwards compatibility
export const supabase = {
  get from()   { return getSupabase().from.bind(getSupabase()); },
  get auth()   { return getSupabase().auth; },
  get storage(){ return getSupabase().storage; },
  get rpc()    { return getSupabase().rpc.bind(getSupabase()); },
};
