"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */
type Step = { id: string; label: string; type?: "text" | "textarea" };
type Module = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  meta?: { duration?: string };
  steps?: Step[];
  validations?: Record<string, string>;
};

type FormData = Record<string, string>;

/* -------------------------------------------------------------------------- */
/*                              Composant principal                           */
/* -------------------------------------------------------------------------- */
export default function ModulePage() {
  const { id } = useParams();
  const router = useRouter();

  /* ----------------------------- États principaux ---------------------------- */
  const [module, setModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  /* -------------------------------------------------------------------------- */
  /*                            Chargement du module                            */
  /* -------------------------------------------------------------------------- */
  useEffect(() => {
    const fetchModule = async () => {
      try {
        const res = await fetch(`/api/modules/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("Erreur serveur");
        const json = await res.json();
        setModule(json.module ?? null);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Impossible de charger le module.");
      } finally {
        setLoading(false);
      }
    };
    fetchModule();
  }, [id]);

  /* -------------------------------------------------------------------------- */
  /*                            Gestion des changements                         */
  /* -------------------------------------------------------------------------- */
  const handleChange = useCallback(
    (field: string, value: string) =>
      setFormData((prev) => ({ ...prev, [field]: value })),
    []
  );

  /* -------------------------------------------------------------------------- */
  /*                         Validation intelligente (realtime)                 */
  /* -------------------------------------------------------------------------- */
  const validateForm = useCallback(() => {
    if (!module?.validations) return true;
    for (const [field, rules] of Object.entries(module.validations)) {
      const value = formData[field];
      if (rules.includes("required") && !value)
        return `Le champ "${field}" est obligatoire.`;
      if (rules.includes("email") && value && !/^[^@]+@[^@]+\.[^@]+$/.test(value))
        return `Le champ "${field}" doit être un email valide.`;
      if (rules.includes("number") && value && isNaN(Number(value)))
        return `Le champ "${field}" doit être un nombre.`;
    }
    return true;
  }, [formData, module]);

  /* -------------------------------------------------------------------------- */
  /*                         Requête Supabase (insert)                          */
  /* -------------------------------------------------------------------------- */
  const submitToAPI = useCallback(
    async (statusType: "draft" | "completed") => {
      setSaving(true);
      setStatus("idle");
      setMessage("");

      const validation = validateForm();
      if (validation !== true) {
        setStatus("error");
        setMessage(validation as string);
        setSaving(false);
        return;
      }

      try {
        const res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            module_id: id,
            answers: formData,
            status: statusType,
          }),
        });

        if (!res.ok) throw new Error("Erreur serveur");
        const json = await res.json();
        console.log("POST /api/documents response", json);

        setStatus("success");
        setMessage(
          statusType === "draft"
            ? "💾 Brouillon enregistré avec succès."
            : "✅ Document généré avec succès."
        );

        // Safe extraction of document id
        if (statusType === "completed") {
          const docId = (json?.id as string | undefined) ?? (json?.document?.id as string | undefined);
          console.log("computed docId", docId);
          if (!docId) {
            console.error("Missing document id in POST response", json);
            setStatus("error");
            setMessage("Erreur : identifiant du document manquant. Veuillez réessayer.");
          } else {
            setTimeout(() => router.push(`/documents/${docId}`), 800);
          }
        }

        console.info("Document créé :", json.document ?? json);
      } catch (err: any) {
        setStatus("error");
        setMessage(err.message || "Erreur lors de la sauvegarde.");
      } finally {
        setSaving(false);
      }
    },
    [formData, id, validateForm, router]
  );

  /* -------------------------------------------------------------------------- */
  /*                                Rendu UI                                   */
  /* -------------------------------------------------------------------------- */
  if (loading) {
    return (
      <main className="p-10 text-center text-sub animate-pulse">
        <Topbar />
        <p>Chargement du module...</p>
      </main>
    );
  }

  if (status === "error" && !module) {
    return (
      <main className="p-10 text-center text-sub">
        <Topbar />
        <p className="text-red-400">{message}</p>
        <button className="lw-btn mt-4" onClick={() => router.push("/")}>
          Retour à l’accueil
        </button>
      </main>
    );
  }

  /* -------------------------------------------------------------------------- */
  /*                              Formulaire principal                          */
  /* -------------------------------------------------------------------------- */
  return (
    <main className="min-h-screen bg-[#080c16] text-text transition-all">
      <Topbar />

      <section className="lw-panel mt-6 animate-fadeIn">
        <header className="flex flex-wrap items-center justify-between mb-4">
          <div>
            <h2 className="lw-h">{module?.title}</h2>
            {module?.meta?.duration && (
              <span className="lw-badge text-xs mt-1 block">
                ⏱ {module.meta.duration}
              </span>
            )}
          </div>
          <button
            className="lw-btn text-sm"
            onClick={() => router.push("/")}
          >
            ← Retour
          </button>
        </header>

        <p className="text-sub text-sm mb-4">{module?.description ?? "—"}</p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitToAPI("completed");
          }}
          className="flex flex-col gap-5"
          autoComplete="off"
        >
          {(module?.steps?.length ?? 0) > 0 ? (
            module!.steps!.map((step) => (
              <div key={step.id} className="flex flex-col gap-1">
                <label className="text-sm text-sub font-medium">
                  {step.label}
                </label>
                {step.type === "textarea" || step.id === "faits" ? (
                  <textarea
                    rows={5}
                    className="lw-input resize-none"
                    placeholder={`Saisir ${step.label.toLowerCase()}...`}
                    value={formData[step.id] || ""}
                    onChange={(e) => handleChange(step.id, e.target.value)}
                  />
                ) : (
                  <input
                    type={step.type || "text"}
                    className="lw-input"
                    placeholder={`Saisir ${step.label.toLowerCase()}...`}
                    value={formData[step.id] || ""}
                    onChange={(e) => handleChange(step.id, e.target.value)}
                  />
                )}
              </div>
            ))
          ) : (
            <>
              <label className="text-sm text-sub">Identité du demandeur</label>
              <input
                className="lw-input"
                placeholder="Nom, prénom, email..."
                value={formData["identite"] || ""}
                onChange={(e) => handleChange("identite", e.target.value)}
              />

              <label className="text-sm text-sub">Partie adverse</label>
              <input
                className="lw-input"
                placeholder="Nom / entreprise..."
                value={formData["adverse"] || ""}
                onChange={(e) => handleChange("adverse", e.target.value)}
              />

              <label className="text-sm text-sub">Les faits</label>
              <textarea
                rows={5}
                className="lw-input resize-none"
                placeholder="Expliquez votre situation..."
                value={formData["faits"] || ""}
                onChange={(e) => handleChange("faits", e.target.value)}
              />
            </>
          )}

          {/* Feedback utilisateur */}
          {status !== "idle" && (
            <p
              className={`text-sm p-2 rounded-md transition-all duration-300 ${
                status === "success"
                  ? "text-green-400 bg-green-900/20"
                  : "text-red-400 bg-red-900/20"
              }`}
            >
              {message}
            </p>
          )}

          {/* Boutons d’action */}
          <div className="flex flex-wrap gap-3 mt-3">
            <button
              type="button"
              onClick={() => submitToAPI("draft")}
              disabled={saving}
              className="lw-btn disabled:opacity-50"
            >
              {saving ? "Sauvegarde..." : "Enregistrer"}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="lw-btn lw-btn-primary disabled:opacity-50"
            >
              {saving ? "Génération..." : "Générer le document"}
            </button>
          </div>

          <p className="text-sub text-xs mt-2 leading-snug">
            ⚠️ Vérifiez vos informations avant envoi. Données anonymisées et
            conservées <strong>30 jours maximum</strong> (RGPD).
          </p>
        </form>
      </section>
    </main>
  );
}
