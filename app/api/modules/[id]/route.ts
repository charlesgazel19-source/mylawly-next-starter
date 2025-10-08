"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Topbar from "@/components/Topbar";

/* ------------------------------ Types & Utils ------------------------------ */
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
const isEmail = (s: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s);
const lc = (s?: string | null) => (s ?? "").toLowerCase();

/* -------------------------------------------------------------------------- */
export default function ModuleWizard() {
  const router = useRouter();
  const params = useParams();
  const id =
    typeof params?.id === "string"
      ? params.id
      : Array.isArray(params?.id)
      ? params.id[0]
      : "";

  /* ------------------------------ States ------------------------------ */
  const [module, setModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState<FormData>({});
  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const abortRef = useRef<AbortController | null>(null);
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  /* ------------------------------ Load module ------------------------------ */
  useEffect(() => {
    if (!id) return; // évite les fetch prématurés

    abortRef.current?.abort(); // annule la requête précédente
    const ac = new AbortController();
    abortRef.current = ac;

    const fetchModule = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`/api/modules/${id}`, {
          cache: "no-store",
          signal: ac.signal,
        });

        if (!res.ok) {
          if (res.status === 404)
            throw new Error("Module introuvable ou supprimé.");
          throw new Error(`Erreur serveur (${res.status})`);
        }

        const json = await res.json();
        setModule(json.module ?? null);
      } catch (e: any) {
        if (e.name !== "AbortError")
          setError(e.message || "Erreur réseau lors du chargement.");
      } finally {
        setLoading(false);
      }
    };

    fetchModule();
    return () => ac.abort();
  }, [id]);

  /* -------------------------- Local draft restore -------------------------- */
  const draftKey = id ? `mylawly:draft:${id}` : "";
  useEffect(() => {
    if (!draftKey) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (raw) setFormData(JSON.parse(raw));
    } catch {
      console.warn("Erreur de récupération du brouillon local");
    }
  }, [draftKey]);

  /* --------------------------- Field change handler --------------------------- */
  const handleChange = useCallback((field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setMessage("");
  }, []);

  /* ------------------------------ Step validation ----------------------------- */
  const validateCurrentStep = useCallback(() => {
    if (!module?.steps?.length) return true;
    const s = module.steps[stepIndex];
    const v = (formData[s.id] || "").trim();
    const rules = (module.validations?.[s.id] ?? "").split("|").map(lc);

    if (rules.includes("required") && !v)
      return `Veuillez remplir le champ « ${s.label} ».`;
    if (rules.includes("email") && v && !isEmail(v))
      return `Le champ « ${s.label} » doit être un email valide.`;
    if (rules.includes("number") && v && Number.isNaN(Number(v)))
      return `Le champ « ${s.label} » doit être un nombre.`;
    return true;
  }, [module, stepIndex, formData]);

  /* ---------------------------- AutoSave (debounced) --------------------------- */
  useEffect(() => {
    if (!id) return;
    try {
      localStorage.setItem(draftKey, JSON.stringify(formData));
    } catch {}

    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            module_id: id,
            answers: formData,
            status: "draft",
          }),
        });
      } catch {
        /* offline */
      }
    }, 700);

    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [formData, id, draftKey]);

  /* ------------------------------ Final Submit ----------------------------- */
  const handleGenerate = useCallback(async () => {
    const check = validateCurrentStep();
    if (check !== true) return setMessage(String(check));

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          module_id: id,
          answers: formData,
          status: "completed",
        }),
      });

      if (!res.ok) throw new Error("Erreur de génération du document.");
      const json = await res.json();
      localStorage.removeItem(draftKey);

      setMessage("✅ Document généré avec succès !");
      const docId = json?.id ?? json?.document?.id;
      if (docId) setTimeout(() => router.push(`/documents/${docId}`), 700);
    } catch (e: any) {
      setError(e.message || "Erreur inattendue.");
    } finally {
      setSaving(false);
    }
  }, [id, formData, validateCurrentStep, router, draftKey]);

  //* ------------------------------- Render UI ------------------------------- */
if (loading)
  return (
    <main className="p-10 text-center text-sub">
      <Topbar />
      <p className="animate-pulse">Chargement du module…</p>
    </main>
  );


  if (!module)
    return (
      <main className="p-10 text-center text-sub">
        <Topbar />
        <p>{error || "Module introuvable."}</p>
        <button className="lw-btn mt-4" onClick={() => router.push("/")}>
          Retour
        </button>
      </main>
    );

  const steps = module.steps?.length
    ? module.steps
    : [
        { id: "identite", label: "Identité du demandeur" },
        { id: "adverse", label: "Partie adverse" },
        { id: "faits", label: "Les faits", type: "textarea" },
      ];

  const current = steps[stepIndex];
  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <main className="min-h-screen bg-[#080c16] text-text transition-all">
      <Topbar />

      <section className="lw-panel mt-6 animate-fadeIn">
        <header className="flex flex-col mb-6">
          <div className="flex justify-between items-center">
            <h2 className="lw-h">{module.title}</h2>
            <button className="lw-btn text-sm" onClick={() => router.push("/")}>
              ← Retour
            </button>
          </div>
          <p className="text-sub text-sm mt-1 mb-3">
            {module.description ?? "—"}
          </p>
          <div className="h-2 w-full bg-[#101621] rounded-full overflow-hidden">
            <div
              className="h-full bg-[color:var(--accent)] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-sub mt-1 text-right">
            Étape {stepIndex + 1} / {steps.length}
          </p>
        </header>

        {/* Étape courante */}
        <div className="transition-all animate-slideIn">
          <label className="text-sm text-sub font-medium">
            {current.label}
          </label>
          {current.type === "textarea" ? (
            <textarea
              rows={5}
              className="lw-input resize-none mt-2"
              placeholder={`Saisir ${lc(current.label)}…`}
              value={formData[current.id] || ""}
              onChange={(e) => handleChange(current.id, e.target.value)}
            />
          ) : (
            <input
              className="lw-input mt-2"
              placeholder={`Saisir ${lc(current.label)}…`}
              value={formData[current.id] || ""}
              onChange={(e) => handleChange(current.id, e.target.value)}
            />
          )}
        </div>

        {/* Messages */}
        {error && (
          <p className="text-red-400 bg-red-900/20 p-2 rounded-md mt-3 text-sm">
            {error}
          </p>
        )}
        {message && !error && (
          <p className="text-green-400 bg-green-900/20 p-2 rounded-md mt-3 text-sm">
            {message}
          </p>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-5">
          <button
            className="lw-btn"
            onClick={() => setStepIndex((s) => Math.max(0, s - 1))}
            disabled={stepIndex === 0}
          >
            ← Précédent
          </button>

          {stepIndex < steps.length - 1 ? (
            <button
              className="lw-btn lw-btn-primary"
              onClick={() => {
                const check = validateCurrentStep();
                if (check === true) setStepIndex((s) => s + 1);
                else setMessage(String(check));
              }}
            >
              Suivant →
            </button>
          ) : (
            <button
              className="lw-btn lw-btn-primary disabled:opacity-50"
              disabled={saving}
              onClick={handleGenerate}
            >
              {saving ? "Génération…" : "Générer le document"}
            </button>
          )}
        </div>

        <p className="text-sub text-xs mt-3">
          ⚠️ Vérifiez vos informations avant envoi. Données anonymisées,
          conservées 30 jours (RGPD).
        </p>
      </section>
    </main>
  );
}
