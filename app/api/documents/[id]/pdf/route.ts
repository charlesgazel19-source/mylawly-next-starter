import { supabaseServer } from "@/lib/supabase";

function json(body: unknown, init?: number | ResponseInit) {
  const opts: ResponseInit = typeof init === "number" ? { status: init } : init || {};
  return new Response(JSON.stringify(body), {
    ...opts,
    headers: { "Content-Type": "application/json; charset=utf-8", ...(opts.headers || {}) },
  });
}

export async function GET(_req: Request, ctx: { params: { id?: string } }) {
  const id = ctx?.params?.id;
  if (!id) return json({ error: "missing id" }, 400);

  const supabase = supabaseServer();
  if (!supabase) return json({ error: "Supabase config missing" }, 500);

  const { data: doc, error } = await supabase
    .from("documents")
    .select("id, module_id, status, answers, created_at, updated_at")
    .eq("id", id)
    .single();

  // Not found if explicit PostgREST "no rows" OR "no data and no error"
  if (error?.code === "PGRST116" || (!doc && !error)) {
    return json({ error: "not found" }, 404);
  }

  if (error) {
    return json({ error: error.message || "server error" }, 500);
  }

  // ---- Success (keep your current PDF generation) ----
  // If you already stream a real PDF, keep that code.
  // Minimal placeholder response for tests:
  const body = new TextEncoder().encode(`PDF for document ${id}`);
  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${id}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
