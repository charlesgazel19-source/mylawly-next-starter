import { supabaseServer } from "@/lib/supabase";

export async function GET() {
  const supabase = supabaseServer();
  if (!supabase) {
    console.error("[GET /api/modules] Supabase environment variables are missing.");
    return new Response(
      JSON.stringify({ error: "Configuration Supabase manquante." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8" },
      }
    );
  }

  const { data, error } = await supabase
    .from("modules")
    .select("id,title,category,description,version,meta,updated_at,published")
    .eq("published", true)
    .order("updated_at", { ascending: false });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json; charset=utf-8" },
    });
  }

  return new Response(JSON.stringify({ modules: data ?? [] }), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
