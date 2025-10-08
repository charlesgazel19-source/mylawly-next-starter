import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabase";

type Props = { params: { id: string } };

export default async function Page({ params }: Props) {
  const id = params?.id;
  if (!id) notFound();

  const supabase = supabaseServer();
  if (!supabase) {
    console.error("[documents/:id] supabase missing");
    throw new Error("Supabase configuration missing");
  }

  const { data: doc, error } = await supabase
    .from("documents")
    .select("id, module_id, status, answers, created_at, updated_at")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[documents/:id] db error", error.message ?? error);
    throw new Error("Database error");
  }

  if (!doc) return notFound();

  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded-md shadow">
        <h1 className="text-xl font-semibold mb-4">Document — {doc.id}</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-sm text-sub">Status</p>
            <p className="font-medium">{String(doc.status ?? "—")}</p>
          </div>

          <div>
            <p className="text-sm text-sub">Module</p>
            <p className="font-medium">{String(doc.module_id ?? "—")}</p>
          </div>

          <div>
            <p className="text-sm text-sub">Created</p>
            <p className="font-medium">{String(doc.created_at ?? "—")}</p>
          </div>

          <div>
            <p className="text-sm text-sub">Updated</p>
            <p className="font-medium">{String(doc.updated_at ?? "—")}</p>
          </div>
        </div>

        <section>
          <h2 className="text-sm font-medium mb-2">Answers</h2>
          <pre className="bg-slate-100 rounded-md p-4 overflow-auto text-sm whitespace-pre-wrap">
            {JSON.stringify(doc.answers ?? {}, null, 2)}
          </pre>
        </section>

        <div className="mt-4">
          <a href="/" className="lw-btn">Retour à l'accueil</a>
        </div>
      </div>
    </main>
  );
}
