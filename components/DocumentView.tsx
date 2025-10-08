import React from "react";
import Link from "next/link";
import ModuleCard from "./ModuleCard";

export type DocumentType = {
  id: string;
  title?: string;
  description?: string;
  modules?: any[];
  created_at?: string;
};

export default function DocumentView({ doc }: { doc: DocumentType }) {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-2">{doc.title ?? `Document ${doc.id}`}</h1>
      {doc.description && (
        <p className="text-gray-600 mb-4">{doc.description}</p>
      )}
      <p className="text-sm text-gray-400 mb-2">
        Créé le {doc.created_at ? new Date(doc.created_at).toLocaleString() : "—"}
      </p>
      {Array.isArray(doc.modules) && doc.modules.length > 0 ? (
        <div className="space-y-4">
          {doc.modules.map((mod: any) => (
            <ModuleCard key={mod.id} module={mod} />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Aucun module associé.</p>
      )}
      <div className="mt-6">
        <Link
          href={`/api/documents/${doc.id}/pdf`}
          target="_blank"
          className="lw-btn"
        >
          Télécharger le PDF
        </Link>
      </div>
    </div>
  );
}
