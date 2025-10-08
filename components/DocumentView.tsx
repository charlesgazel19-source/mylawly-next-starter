"use client";
import React, { useState, useEffect } from "react";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Description dynamique : concatène les titres des modules
  let description = "Pas de description fournie.";
  if (Array.isArray(doc.modules) && doc.modules.length > 0) {
    const desc = doc.modules.map((m: any) => m.title).filter(Boolean).join(", ");
    if (desc) description = `Modules : ${desc}`;
  }

  useEffect(() => {
    if (!doc) {
      setError("Document introuvable.");
    }
  }, [doc]);

  if (error) return <div className="text-red-600 p-4">{error}</div>;
  if (!doc || loading) return (
    <div className="flex items-center justify-center h-32">
      <svg className="animate-spin h-8 w-8 text-blue-600 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
      </svg>
      <span>Chargement du document...</span>
    </div>
  );
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h1 className="text-2xl font-bold mb-2">{doc.title ?? `Document ${doc.id}`}</h1>
      <p className="text-gray-600 mb-4">{description}</p>
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
        <a
          href={`/api/documents/${doc.id}/pdf`}
          target="_blank"
          className="lw-btn"
          rel="noopener noreferrer"
          onClick={() => setLoading(true)}
        >
          Télécharger le PDF
        </a>
      </div>
    </div>
  );
}
