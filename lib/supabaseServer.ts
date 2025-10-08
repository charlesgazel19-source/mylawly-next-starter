// lib/supabase.ts
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Les 2 variables doivent exister dans .env.local :
 * NEXT_PUBLIC_SUPABASE_URL=...
 * NEXT_PUBLIC_SUPABASE_ANON_KEY=...
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  // On crash côté serveur s'il manque les vars pour éviter des 500 silencieux
  throw new Error(
    "[Supabase] Variables manquantes. Vérifie NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY dans .env.local"
  );
}

/* -------------------------------------------------------------------------- */
/*                               SINGLETON CACHE                              */
/* -------------------------------------------------------------------------- */
let _serverClient: SupabaseClient | null = null;
let _browserClient: SupabaseClient | null = null;

/* -------------------------------------------------------------------------- */
/*                          SERVER: routes API / RSC                           */
/* -------------------------------------------------------------------------- */
/**
 * Client côté serveur (routes API, server actions, RSC).
 * Sans cookies/auth avancée pour l’instant (MVP anonyme).
 */
export function supabaseServer(): SupabaseClient {
  if (_serverClient) return _serverClient;
  _serverClient = createClient(SUPABASE_URL!, SUPABASE_ANON!, {
    auth: { persistSession: false },
    global: { headers: { "X-Lawly-Env": "server" } },
  });
  return _serverClient;
}

/* -------------------------------------------------------------------------- */
/*                        BROWSER: composants "use client"                     */
/* -------------------------------------------------------------------------- */
/**
 * Client côté navigateur (composants React client).
 * Utiliser UNIQUEMENT dans des fichiers avec "use client".
 */
export function supabaseBrowser(): SupabaseClient {
  if (typeof window === "undefined") {
    // Sécurité : on évite un usage involontaire côté serveur
    throw new Error("[Supabase] supabaseBrowser() appelé côté serveur.");
  }
  if (_browserClient) return _browserClient;
  _browserClient = createClient(SUPABASE_URL!, SUPABASE_ANON!, {
    auth: { persistSession: true, autoRefreshToken: true },
    global: { headers: { "X-Lawly-Env": "browser" } },
  });
  return _browserClient;
}

/* -------------------------------------------------------------------------- */
/*                            TYPES PRATIQUES (DX)                             */
/* -------------------------------------------------------------------------- */
export type { SupabaseClient };