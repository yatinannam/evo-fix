import { createClient } from '@supabase/supabase-js';

const supabaseUrl        = process.env.NEXT_PUBLIC_SUPABASE_URL        ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY        ?? '';

// Lazy singleton — only instantiated at runtime, not during build-time static analysis.
let _admin: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdmin() {
  if (!_admin) {
    _admin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }
  return _admin;
}

// Convenience named export for backwards compatibility
export const supabaseAdmin = {
  get from()   { return getSupabaseAdmin().from.bind(getSupabaseAdmin()); },
  get auth()   { return getSupabaseAdmin().auth; },
  get storage(){ return getSupabaseAdmin().storage; },
  get rpc()    { return getSupabaseAdmin().rpc.bind(getSupabaseAdmin()); },
};
