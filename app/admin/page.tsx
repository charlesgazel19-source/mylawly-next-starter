import Topbar from "@/components/Topbar";

export default function AdminPage(){
  return (
    <main>
      <Topbar/>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mt-4">
        <section className="lw-panel md:col-span-8">
          <h2 className="lw-h">Catalogue des modules</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
            {[
              {cat:"Logement", title:"Restitution de caution", meta:"v1.0 • Dernière maj : 2025‑09‑20 • 2 143 utilisations"},
              {cat:"Consommation", title:"Remboursement e‑commerce", meta:"v1.1 • Dernière maj : 2025‑09‑28 • 1 120 utilisations"},
              {cat:"Travail", title:"Solde de tout compte", meta:"v0.9 • Brouillon • 84 tests"}
            ].map((m,i)=>(
              <div key={i} className="lw-card">
                <span className="lw-badge">{m.cat}</span>
                <h3 className="text-lg font-semibold">{m.title}</h3>
                <p className="text-sub text-sm">{m.meta}</p>
                <div className="flex gap-2 mt-auto">
                  <button className="lw-btn">Éditer</button>
                  <button className="lw-btn">Désactiver</button>
                  <button className="lw-btn lw-btn-primary">{i===2 ? "Publier" : "Dupliquer"}</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="lw-panel md:col-span-4">
          <h2 className="lw-h">Lancements & KPI</h2>
          <div className="flex flex-wrap gap-3">
            <div className="border border-muted rounded-xl bg-[#0b1220] p-3 min-w-[160px]">
              <h3 className="text-sm text-sub font-semibold">Modules actifs</h3>
              <p className="text-2xl font-extrabold">12</p>
            </div>
            <div className="border border-muted rounded-xl bg-[#0b1220] p-3 min-w-[160px]">
              <h3 className="text-sm text-sub font-semibold">Conversion globale</h3>
              <p className="text-2xl font-extrabold">41%</p>
            </div>
            <div className="border border-muted rounded-xl bg-[#0b1220] p-3 min-w。[160px]">
              <h3 className="text-sm text-sub font-semibold">NPS (30j)</h3>
              <p className="text-2xl font-extrabold">62</p>
            </div>
          </div>
          <table className="w-full border-collapse mt-2 text-sm">
            <thead>
              <tr className="bg-[#0b1220] text-sub">
                <th className="border border-muted p-2 text-left">Date</th>
                <th className="border border-muted p-2 text-left">Événement</th>
                <th className="border border-muted p-2 text-left">Version</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-muted p-2">2025‑10‑01</td><td className="border border-muted p-2">Ajout “Injonction de payer”</td><td className="border border-muted p-2">v1.2</td></tr>
              <tr><td className="border border-muted p-2">2025‑09‑28</td><td className="border border-muted p-2">MAJ “E‑commerce” (art. Code conso)</td><td className="border border-muted p-2">v1.1</td></tr>
              <tr><td className="border border-muted p-2">2025‑09‑20</td><td className="border border-muted p-2">Publication “Caution”</td><td className="border border-muted p-2">v1.0</td></tr>
            </tbody>
          </table>
        </aside>

        <section className="lw-panel md:col-span-12">
          <h2 className="lw-h">Créer / Éditer un module</h2>
          <div className="grid gap-2">
            <label className="text-sub text-sm">Nom du module</label>
            <input className="px-3 py-2 rounded-lg border border-muted bg-[#0b1220] text-text" placeholder="Ex : Injonction de payer" />
            <label className="text-sub text-sm">Catégorie</label>
            <select className="px-3 py-2 rounded-lg border border-muted bg-[#0b1220] text-text">
              <option>Logement</option>
              <option>Consommation</option>
              <option>Travail</option>
              <option>Entreprise</option>
              <option>Autre</option>
            </select>
            <label className="text-sub text-sm">Objectif utilisateur (1 phrase)</label>
            <input className="px-3 py-2 rounded-lg border border-muted bg-[#0b1220] text-text" placeholder="Ex : Aider l’utilisateur à constituer un dossier d’injonction de payer" />
            <label className="text-sub text-sm">Étapes de l’interview (JSON court)</label>
            <textarea rows={5} className="px-3 py-2 rounded-lg border border-muted bg-[#0b1220] text-text" placeholder='[{"id":"identite","label":"Vos informations"}, {"id":"adverse","label":"Partie adverse"}, {"id":"faits","label":"Les faits & dates"}, {"id":"pieces","label":"Pièces jointes"}]'></textarea>
            <label className="text-sub text-sm">Variables / validations (pseudo‑YAML)</label>
            <textarea rows={5} className="px-3 py-2 rounded-lg border border-muted bg-[#0b1220] text-text" placeholder={"nom: required\nemail: required|email\nmontant: required|number|min:1\nville_tribunal: optional"}></textarea>
            <label className="text-sub text-sm">Modèle de document (DOCX)</label>
            <input type="file" className="px-3 py-2 rounded-lg border border-muted bg-[#0b1220] text-text" />
            <div className="flex gap-2 flex-wrap">
              <button className="lw-btn">Enregistrer brouillon</button>
              <button className="lw-btn">Prévisualiser</button>
              <button className="lw-btn lw-btn-primary">Publier</button>
            </div>
            <p className="text-sub text-xs">Versionning automatique (vSemVer). Les changements majeurs créent une vX.Y.</p>
          </div>
        </section>

        <section className="lw-panel md:col-span-12">
          <h2 className="lw-h">Conformité & Risques</h2>
          <table className="w-full border-collapse mt-2 text-sm">
            <thead>
              <tr className="bg-[#0b1220] text-sub">
                <th className="border border-muted p-2 text-left">Cadre</th>
                <th className="border border-muted p-2 text-left">Statut</th>
                <th className="border border-muted p-2 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-muted p-2">Mentions légales & disclaimers</td><td className="border border-muted p-2"><span className="lw-pill lw-pill-ok">OK</span></td><td className="border border-muted p-2"><button className="lw-btn">Voir</button></td></tr>
              <tr><td className="border border-muted p-2">RGPD (TTL 30j, DPO, droits)</td><td className="border border-muted p-2"><span className="lw-pill lw-pill-warn">À vérifier</span></td><td className="border border-muted p-2"><button className="lw-btn">Paramètres</button></td></tr>
              <tr><td className="border border-muted p-2">Veille juridique (mises à jour)</td><td className="border border-muted p-2"><span className="lw-pill">En cours</span></td><td className="border border-muted p-2"><button className="lw-btn">Planifier</button></td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </main>
  );
}
