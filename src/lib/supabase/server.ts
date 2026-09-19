// emp-dash dedicated Supabase project — never swap these for the site's main NEXT_PUBLIC_SUPABASE_* credentials.
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './types';

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing ${name} — set it in .env.local / Vercel before running emp-dash.`
    );
  }
  return value;
}

/** Anon-key server client — respects RLS, safe for Server Components. */
export async function createEmpDashServerClient() {
  const URL = getEnv('NEXT_PUBLIC_EMPDASH_SUPABASE_URL');
  const ANON = getEnv('NEXT_PUBLIC_EMPDASH_SUPABASE_ANON_KEY');
  const cookieStore = await cookies();
  return createServerClient<Database>(URL, ANON, {
    cookies: {
      getAll:    () => cookieStore.getAll(),
      setAll(toSet) {
        try {
          toSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll is called in Server Components where cookies are read-only;
          // the middleware refreshes the session, so this is safe to ignore.
        }
      },
    },
  });
}

/** Service-role client — bypasses RLS. Server-side only (mutations / admin actions). */
export function createEmpDashAdminClient() {
  const { createClient } = require('@supabase/supabase-js');
  const url = getEnv('NEXT_PUBLIC_EMPDASH_SUPABASE_URL');
  const srk = getEnv('EMPDASH_SUPABASE_SERVICE_ROLE_KEY');
  return createClient<Database>(url, srk, { auth: { persistSession: false } });
}
