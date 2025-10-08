# MyLawly — Next.js Starter (UI fidèle au prototype)

Ce starter reproduit la **même UI** que la maquette : *Vue Utilisateur* + *Vue Admin*.
Il est prêt à lancer en local (Next 14 + Tailwind).

## Démarrage

1. Node.js >= 18
2. `npm install`
3. `npm run dev`
4. Ouvrir http://localhost:3000

## Structure

- `app/` : pages (app router)
  - `/` : Vue utilisateur
  - `/admin` : Vue admin
- `components/Topbar.tsx` : barre supérieure + tabs
- `app/globals.css` : styles (variables & classes utilitaires)

## Prochaines étapes

- Brancher les **modules** (CRUD) sur Supabase.
- Ajouter l'API `/api/modules` (liste, création, publication).
- Intégrer génération PDF / Docassemble.
- Mettre en place Auth + rôles (admin / user).
- RGPD : TTL 30j, anonymisation, export/suppression.

---

© MyLawly — prototype technique.
