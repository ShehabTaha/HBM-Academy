/**
 * Main Supabase client export
 * For backward compatibility, exports browser client by default
 *
 * Usage:
 * - Client components: import { supabase } from '@/lib/supabase'
 * - Server components: import { createClient } from '@/lib/supabase/server'
 * - Admin operations: import { createAdminClient } from '@/lib/supabase/admin'
 */

import { createClient as createBrowserClient } from "@/lib/supabase/client";

// Export browser client as default for backward compatibility
export const supabase = createBrowserClient();

export default supabase;

// Re-export types for convenience
export type { Database } from "@/types/database.types";
