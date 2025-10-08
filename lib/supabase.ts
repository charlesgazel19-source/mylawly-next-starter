import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    "[Supabase] Missing env. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local"
  );
}

let _serverClient: SupabaseClient | null = null;
let _browserClient: SupabaseClient | null = null;

export function supabaseServer(): SupabaseClient {
  if (_serverClient) return _serverClient;
  _serverClient = createClient(SUPABASE_URL!, SUPABASE_ANON!, {
    auth: { persistSession: false },
    global: { headers: { "X-Lawly-Env": "server" } },
  });
  return _serverClient;
}

export function supabaseBrowser(): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("[Supabase] supabaseBrowser() called on server.");
  }
  if (_browserClient) return _browserClient;
  _browserClient = createClient(SUPABASE_URL!, SUPABASE_ANON!, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { "X-Lawly-Env": "browser" } },
  });
  return _browserClient;
}

export type { SupabaseClient };
