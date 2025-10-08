"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Topbar from "@/components/Topbar";

/* ---------------------------------- Types --------------------------------- */
type Module = {
  id: string;
  title: string;
  category: string;
  description: string | null;
  meta: { duration?: string } | null;
  updated_at?: string;
};

/* ---------------------------- Petits composants --------------------------- */
function SkeletonCard() {
  return (
    <div className="lw-card animate-pulse">
      <div className="h-5 w-20 bg-[#0f1627] rounded mb-2" />
      <div className="h-5 w-3/4 bg-[#0f1627] rounded mb-2" />
      <div className="h-4 w-full bg-[#0f1627] rounded mb-4" />
      <div className="flex gap-2">
        <div className="h-9 w-24 bg-[#0f1627] rounded" />
        <div className="h-9 w-28 bg-[#0f1627] rounded" />
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="border border-dashed border-muted rounded-xl p-6 text-center text-sub">
      {text}
    </div>
  );
}

function ModuleCard({ m }: { m: Module }) {
  return (
    <div className="lw-card flex flex-col justify-between hover:scale-[1.02] transition-transform duration-150">
      <div>
        <span className="lw-badge">{m.category}</span>
        <h3 className="text-lg font-semibold mt-1">{m.title}</h3>
        <p className="text-sub text-sm mt-1 leading-snug">
          {m.description ?? "—"} {m.meta?.duration ? `• ${m.meta.duration} ⏱` : ""}
        </p>
      </div>
      <div className="flex gap-2 mt-3">
        <Link href={`/modules/${m.id}`} className="lw-btn" prefetch>
          Aperçu
        </Link>
        <Link href={`/modules/${m.id}`} className="lw-btn lw-btn-primary" prefetch>
          Commencer
        </Link>
      </div>
    </div>
  );
}

/* --------------------------------- Page ----------------------------------- */
export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // état UI
  const [query, setQuery] = useState<string>(searchParams.get("q") ?? "");
  const [category, setCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"recent" | "alpha">("recent");

  // ---- Fetch modules (avec abort + erreurs propres)
  useEffect(() => {
    const ac = new AbortController();

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/modules", {
          cache: "no-store",
          signal: ac.signal,
        });
        if (!res.ok) throw new Error("Impossible de charger les modules.");
        const json = await res.json();
        setModules(json.modules ?? []);
      } catch (e: any) {
        if (e?.name !== "AbortError") setError(e?.message || "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => ac.abort();
  }, []);

  // ---- Debounce + sync URL (?q=)
  useEffect(() => {
    const t = setTimeout(() => {
      const sp = new URLSearchParams(searchParams.toString());
      if (query) sp.set("q", query);
      else sp.delete("q");
      router.replace(`/?${sp.toString()}`, { scroll: false });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // ---- Catégories distinctes (auto)
  const categories = useMemo(() => {
    const set = new Set<string>();
    modules.forEach((m) => set.add(m.category));
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [modules]);

  // ---- Filtrage + tri (performant)
  const filteredModules = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = modules.filter((m) => {
      const matchQ =
        !q ||
        m.title.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q) ||
        (m.description ?? "").toLowerCase().includes(q);
      const matchCat = category === "all" || m.category === category;
      return matchQ && matchCat;
    });

    if (sortBy === "alpha") {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    } else {
      list = [...list].sort(
        (a, b) =>
          new Date(b.updated_at ?? 0).getTime() - new Date(a.updated_at ?? 0).getTime()
      );
    }
    return list;
  }, [modules, query, category, sortBy]);

  return (
    <main className="min-h-screen">
      <Topbar />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-6 p-4">
        {/* ----------- Colonne principale ----------- */}
        <section className="lw-panel md:col-span-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="lw-h">Démarrer une démarche</h2>
            <p className="text-xs text-sub opacity-70">
              {modules.length} modules disponibles
            </p>
          </div>

          {/* Filtres & recherche */}
          <div className="flex flex-col sm:flex-row gap-2 sm:items-center mb-4">
            <div className="flex gap-2 flex-1">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setQuery("");
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-muted bg-[#0b1220] text-text"
                placeholder="🔎 Rechercher un module (ex: Caution, Facture, E-commerce, Travail)…"
                aria-label="Rechercher un module"
              />
              <button
                onClick={() => setQuery("")}
                className="px-3 py-2 rounded-lg border border-muted text-[#a0a0a0] hover:text-white"
                aria-label="Effacer la recherche"
                title="Effacer"
              >
                ✖
              </button>
            </div>

            <div className="flex gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-2 rounded-lg border border-muted bg-[#0b1220] text-text"
                aria-label="Filtrer par catégorie"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Toutes les catégories" : c}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "alpha" | "recent")}
                className="px-3 py-2 rounded-lg border border-muted bg-[#0b1220] text-text"
                aria-label="Trier"
              >
                <option value="recent">Récents d’abord</option>
                <option value="alpha">Alphabétique</option>
              </select>
            </div>
          </div>

          {/* États */}
          {error && <EmptyState text={`⚠️ ${error}`} />}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : filteredModules.length === 0 ? (
            <EmptyState text="Aucun module ne correspond à ta recherche." />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModules.map((m) => (
                <ModuleCard key={m.id} m={m} />
              ))}
            </div>
          )}
        </section>

        {/* ----------- Colonne latérale ----------- */}
        <aside className="lw-panel md:col-span-4">
          <h2 className="lw-h">Mes documents récents</h2>
          <div className="flex flex-wrap gap-3">
            <div className="border border-muted rounded-xl bg-[#0b1220] p-3 min-w-[160px]">
              <h3 className="text-sm text-sub font-semibold">Documents générés</h3>
              <p className="text-2xl font-extrabold">12</p>
            </div>
            <div className="border border-muted rounded-xl bg-[#0b1220] p-3 min-w-[160px]">
              <h3 className="text-sm text-sub font-semibold">Taux de finalisation</h3>
              <p className="text-2xl font-extrabold">86%</p>
            </div>
            <div className="border border-muted rounded-xl bg-[#0b1220] p-3 min-w-[160px]">
              <h3 className="text-sm text-sub font-semibold">Temps moyen</h3>
              <p className="text-2xl font-extrabold">3m45s</p>
            </div>
          </div>

          <table className="w-full border-collapse mt-2 text-sm">
            <thead>
              <tr className="bg-[#0b1220] text-sub">
                <th className="border border-muted p-2 text-left">Module</th>
                <th className="border border-muted p-2 text-left">Statut</th>
                <th className="border border-muted p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-muted p-2">Restitution de caution</td>
                <td className="border border-muted p-2">
                  <span className="lw-pill lw-pill-ok">Terminé</span>
                </td>
                <td className="border border-muted p-2">
                  <button className="lw-btn">Télécharger</button>
                </td>
              </tr>
              <tr>
                <td className="border border-muted p-2">Remboursement e-commerce</td>
                <td className="border border-muted p-2">
                  <span className="lw-pill lw-pill-warn">Incomplet</span>
                </td>
                <td className="border border-muted p-2">
                  <button className="lw-btn">Reprendre</button>
                </td>
              </tr>
              <tr>
                <td className="border border-muted p-2">Solde de tout compte</td>
                <td className="border border-muted p-2">
                  <span className="lw-pill">Brouillon</span>
                </td>
                <td className="border border-muted p-2">
                  <button className="lw-btn">Continuer</button>
                </td>
              </tr>
            </tbody>
          </table>

          <p className="text-sub text-xs mt-2">
            Les documents sont conservés 30 jours (RGPD). Ensuite, ils sont supprimés automatiquement.
          </p>
        </aside>
      </div>
    </main>
  );
}
