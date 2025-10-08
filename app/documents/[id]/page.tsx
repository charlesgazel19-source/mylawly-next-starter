import { notFound } from "next/navigation";
import { supabaseServer } from "@/lib/supabaseServer";
import DocumentView from "@/components/DocumentView";
import Link from "next/link";

type Props = { params: { id: string } };

export default async function Page({ params }: Props) {
  const id = params?.id;
  if (!id) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-lg text-red-500">Identifiant du document manquant.</p>
          <a href="/" className="lw-btn mt-4">Retour modules</a>
        </div>
      </main>
    );
  }

  const supabase = supabaseServer();
  if (!supabase) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-lg text-red-500">Erreur de configuration serveur.</p>
          <a href="/" className="lw-btn mt-4">Retour modules</a>
        </div>
      </main>
    );
  }

  const { data: doc, error } = await supabase
    .from("documents")
    .select("id, title, status, created_at, updated_at, user_id")
    .eq("id", id)
    .single();

  if (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[doc-view] supabase error", error);
    }
    return notFound();
  }
  if (!doc) {
    return notFound();
  }


  return (
    <main className="min-h-screen p-6 bg-slate-50">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">{doc.title ?? `Document ${doc.id}`}</h1>
        <p className="text-gray-600 mb-2">Statut : <span className="font-mono">{doc.status}</span></p>
        <p className="text-sm text-gray-400 mb-4">Créé le {doc.created_at ? new Date(doc.created_at).toLocaleString() : "—"}</p>
        <div className="mt-6 flex gap-3">
          <a
            href={`/api/documents/${doc.id}/pdf`}
            className="lw-btn lw-btn-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            Télécharger le PDF
          </a>
          <a href="/" className="lw-btn">Retour modules</a>
        </div>
      </div>
    </main>
  );
}
