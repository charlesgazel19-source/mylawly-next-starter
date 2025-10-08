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

  const { data, error } = await supabase
    .from("modules")
    .select(
      "id,title,category,description,meta,steps,validations,published,updated_at"
    )
    .eq("id", id)
    .maybeSingle();

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
