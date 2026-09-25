// emp-dash dedicated Supabase project — never swap these for the site's main NEXT_PUBLIC_SUPABASE_* credentials.
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { cache } from 'react';
import type { Database } from './types';
import type { EmpProfile, EmpRole } from './types';

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

/**
 * Per-request-deduplicated auth user lookup. React's cache() dedupes calls to
 * this exact function reference across every Server Component rendered in the
 * same request tree (e.g. a layout and its nested page both calling
 * getCachedUser() only hit Supabase once), avoiding the repeated
 * supabase.auth.getUser() call every emp-dash page previously made on its own.
 */
export const getCachedUser = cache(async () => {
  const supabase = await createEmpDashServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
});

/**
 * Per-request-deduplicated emp_profiles + role lookup — every emp-dash page
 * independently re-ran the identical select('*, emp_roles(name)') query;
 * this collapses all of them into one query per request per userId.
 */
export const getCachedProfile = cache(async (userId: string) => {
  const supabase = await createEmpDashServerClient();
  const { data: profile } = await supabase
    .from('emp_profiles')
    .select('*, emp_roles(name)')
    .eq('id', userId)
    .single();
  return profile as (EmpProfile & { emp_roles: Pick<EmpRole, 'name'> }) | null;
});
