// emp-dash dedicated Supabase project — never swap these for the site's main NEXT_PUBLIC_SUPABASE_* credentials.
'use client';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types';

let _client: ReturnType<typeof createBrowserClient<Database>> | null = null;

/** Browser Supabase singleton — used by Client Components in emp-dash only. */
export function getEmpDashBrowserClient() {
  if (!_client) {
    const url  = process.env.NEXT_PUBLIC_EMPDASH_SUPABASE_URL;
    const anon = process.env.NEXT_PUBLIC_EMPDASH_SUPABASE_ANON_KEY;
    if (!url || !anon) {
      throw new Error(
        'Missing NEXT_PUBLIC_EMPDASH_SUPABASE_URL or NEXT_PUBLIC_EMPDASH_SUPABASE_ANON_KEY — set them in .env.local / Vercel before running emp-dash.'
      );
    }
    _client = createBrowserClient<Database>(url, anon);
  }
  return _client;
}
