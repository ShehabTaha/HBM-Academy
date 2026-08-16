/**
 * Main Supabase client export
 * For backward compatibility, exports a lazy browser client by default.
 *
 * Usage:
 * - Client components: import { supabase } from '@/lib/supabase'
 * - Server components: import { createClient } from '@/lib/supabase/server'
 * - Admin operations: import { createAdminClient } from '@/lib/supabase/admin'
 *
 * NOTE: The `supabase` export is a Proxy that lazily initializes the client on
 * first property access, so module-level imports are safe at build time even
 * when env vars are not yet available.
 */

import { createClient as createBrowserClient } from "@/lib/supabase/client";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

// Lazy singleton — only created on first property access, never at import time.
let _client: SupabaseClient<Database> | null = null;

function getClient(): SupabaseClient<Database> {
  if (!_client) {
    _client = createBrowserClient();
  }
  return _client;
}

export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return (getClient() as any)[prop];
  },
});

export default supabase;

// Re-export types for convenience
export type { Database } from "@/types/database.types";
