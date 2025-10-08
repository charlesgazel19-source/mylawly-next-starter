import { supabaseServer } from "@/lib/supabase";

// Helpers
const ALLOWED_STATUS = new Set(["draft", "completed"]);
const MAX_ANSWERS_BYTES = 200_000; // ~200 KB de réponses max par soumission

function json(res: unknown, init?: number | ResponseInit) {
  const opts: ResponseInit = typeof init === "number" ? { status: init } : init || {};
  return new Response(JSON.stringify(res), {
    ...opts,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(opts.headers || {}) },
  });
}

function badRequest(msg: string) {
  return json({ error: msg }, 400);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/** Validate minimal shape of incoming body */
function validateBody(body: any) {
  if (!body || typeof body !== "object") return "Body JSON invalide.";
  const { module_id, answers, status } = body;

  if (!module_id || typeof module_id !== "string")
    return "Paramètre 'module_id' requis (string).";

  if (
    answers === null ||
    answers === undefined ||
    typeof answers !== "object" ||
    Array.isArray(answers)
  )
    return "Paramètre 'answers' requis (objet JSON).";

  const size = Buffer.from(JSON.stringify(answers)).byteLength;
  if (size > MAX_ANSWERS_BYTES)
    return `Paramètre 'answers' trop volumineux (${size}o). Limite ${MAX_ANSWERS_BYTES}o.`;

  if (status && !ALLOWED_STATUS.has(status))
    return "Paramètre 'status' invalide (draft|completed).";

  return null;
}

// POST /api/documents — créer un document
export async function POST(req: Request) {
  const supabase = supabaseServer();
  if (!supabase) {
    console.error("[POST /documents] Supabase environment variables are missing.");
    return json({ error: "Configuration Supabase manquante." }, 500);
  }

  try {
    // Sécurité simple: on refuse du non-JSON explicite
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return badRequest("Content-Type 'application/json' requis.");
    }

    const body = await req.json();
    const err = validateBody(body);
    if (err) return badRequest(err);

    const { module_id, answers } = body;
    const status: "draft" | "completed" = ALLOWED_STATUS.has(body.status) ? body.status : "draft";

    const { data, error } = await supabase
      .from("documents")
      .insert([
        {
          module_id,
          answers,
          status,
          // updated_at: now() sera mis par trigger SQL (cf. plus bas)
        },
      ])
      .select("id, module_id, status, created_at, updated_at")
      .single();

    if (error) {
      console.error("[POST /documents] Supabase error:", error);
      return json({ error: error.message }, 500);
    }

    return json(data, {
      status: 201,
      headers: {
        Location: `/api/documents/${data.id}`,
        "Cache-Control": "no-store",
      },
    });
  } catch (e: any) {
    console.error("[POST /documents] Unexpected:", e?.message || e);
    return json({ error: "Erreur serveur" }, 500);
  }
}

// GET /api/documents?limit=10&offset=0 — lister (pagination simple)
export async function GET(req: Request) {
  const supabase = supabaseServer();
  if (!supabase) {
    console.error("[GET /documents] Supabase environment variables are missing.");
    return json({ error: "Configuration Supabase manquante." }, 500);
  }

  try {
    const url = new URL(req.url);
    const limit = clamp(Number(url.searchParams.get("limit") ?? "10"), 1, 50);
    const offset = clamp(Number(url.searchParams.get("offset") ?? "0"), 0, 10_000);

    const { data, error } = await supabase
      .from("documents")
      .select("id, module_id, status, created_at, updated_at")
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error("[GET /documents] Supabase error:", error);
      return json({ error: error.message }, 500);
    }

    return json({ documents: data, limit, offset }, { status: 200, headers: { "Cache-Control": "no-store" } });
  } catch (e: any) {
    console.error("[GET /documents] Unexpected:", e?.message || e);
    return json({ error: "Erreur serveur" }, 500);
  }
}
