import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import DocumentView from "@/components/DocumentView";

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
    .select("id, title, description, modules, created_at, user_id")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[documents/:id] db error", error.message ?? error);
    throw new Error("Database error");
  }
  if (!doc) return notFound();

  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <DocumentView doc={doc} />
        <div className="mt-6">
          <a href="/" className="lw-btn">Retour modules</a>
        </div>
      </div>
    </main>
  );
}
