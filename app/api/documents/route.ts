
import { supabaseServer } from "@/lib/supabase";

const ALLOWED_STATUS = new Set(["draft", "completed"]);
const MAX_ANSWERS_BYTES = 200_000;

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

function validateBody(body: any) {
  if (!body || typeof body !== "object") return "Body JSON invalide.";
  const { module_id, answers, status } = body;
  if (!module_id || typeof module_id !== "string") return "Paramètre 'module_id' requis (string).";
  if (answers === null || answers === undefined || typeof answers !== "object" || Array.isArray(answers)) return "Paramètre 'answers' requis (objet JSON).";
  const size = Buffer.from(JSON.stringify(answers)).byteLength;
  if (size > MAX_ANSWERS_BYTES) return `Paramètre 'answers' trop volumineux (${size}o). Limite ${MAX_ANSWERS_BYTES}o.`;
  if (status && !ALLOWED_STATUS.has(status)) return "Paramètre 'status' invalide (draft|completed).";
  return null;
}

export async function POST(req: Request) {
  const supabase = supabaseServer();
  if (!supabase) {
    console.error("[POST /documents] Supabase environment variables are missing.");
    return json({ error: "Configuration Supabase manquante." }, 500);
  }
  try {
    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) return badRequest("Content-Type 'application/json' requis.");
    const body = await req.json();
    const err = validateBody(body);
    if (err) return badRequest(err);
    const { module_id, answers } = body;
    const status: "draft" | "completed" = ALLOWED_STATUS.has(body.status) ? body.status : "draft";
    console.log("[POST /documents] incoming body:", { module_id, status, answersType: typeof answers, hasAnswers: !!answers });
    // Align payload with Supabase schema
    const insertPayload: Record<string, any> = { module_id, answers, status };
    if (body.user_id) insertPayload.user_id = body.user_id;
    // Insert document
    const { data, error } = await supabase
      .from("documents")
      .insert([insertPayload])
      .select("id, module_id, status, created_at, updated_at, user_id")
      .single();
    console.log("[POST /documents] insert result:", { data, error, insertPayload });
    if (error) {
      console.error("[POST /documents] Supabase error:", error);
      return json({ error: error.message || "supabase error", debug: { code: error.code, payload: insertPayload } }, 500);
    }
    return json(
      {
        id: data.id,
        module_id: data.module_id,
        status: data.status,
        created_at: data.created_at,
        updated_at: data.updated_at,
        user_id: data.user_id,
      },
      {
        status: 201,
        headers: {
          Location: `/api/documents/${data.id}`,
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (e: any) {
    console.error("[POST /documents] Unexpected:", e?.message || e);
    return json({ error: "Erreur serveur" }, 500);
  }
}
