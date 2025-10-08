import { supabaseServer } from "@/lib/supabase";

function json(body: unknown, init?: number | ResponseInit) {
  const options: ResponseInit =
    typeof init === "number" ? { status: init } : init || {};

  return new Response(JSON.stringify(body), {
    ...options,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...(options.headers || {}),
    },
  });
}

export async function GET(
  _request: Request,
  context: { params: { id: string } }
) {
  const id = context?.params?.id;

  if (!id) {
    return json({ error: "Paramètre 'id' requis." }, 400);
  }

  const supabase = supabaseServer();
  if (!supabase) {
    console.error(
      "[GET /api/modules/:id] Supabase environment variables are missing."
    );
    return json({ error: "Configuration Supabase manquante." }, 500);
  }

  // Try the full projection first (includes optional JSONB cols).
  let data: any = null;
  let error: any = null;
  try {
    const res = await supabase
      .from("modules")
      .select(
        "id,title,category,description,meta,steps,validations,published,updated_at"
      )
      .eq("id", id)
      .maybeSingle();
    data = res.data;
    error = res.error;
  } catch (e: any) {
    // supabase client may throw for unexpected issues; capture for fallback handling below
    error = e;
  }

  // If Postgres complains about missing columns (undefined column = 42703), retry without optional JSONB fields.
  const isUndefinedColumn = (err: any) => {
    if (!err) return false;
    if (err.code === "42703") return true; // postgres undefined_column
    const msg = String(err.message || err);
    return /column .* does not exist/i.test(msg);
  };

  if (error && isUndefinedColumn(error)) {
    try {
      const res2 = await supabase
        .from("modules")
        .select("id,title,category,description,published,updated_at")
        .eq("id", id)
        .maybeSingle();
      data = res2.data;
      error = res2.error;
    } catch (e: any) {
      error = e;
    }
  }

  if (error) {
    console.error("[GET /api/modules/:id] Supabase error:", error);
    return json({ error: "Erreur serveur Supabase." }, 500);
  }

  if (!data || data.published !== true) {
    return json({ error: "Module introuvable." }, 404);
  }

  return json(
    { module: data },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
