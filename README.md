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

## API Endpoints

- `POST /api/documents` : Crée un document
- `GET /api/documents/[id]` : Récupère un document
- `GET /api/documents/[id]/pdf` : Génère le PDF du document

## Prochaines étapes

- Brancher les **modules** (CRUD) sur Supabase.
- Ajouter l'API `/api/modules` (liste, création, publication).
- Intégrer génération PDF / Docassemble.
- Mettre en place Auth + rôles (admin / user).
- RGPD : TTL 30j, anonymisation, export/suppression.

## Contrat API

### POST /api/documents

Crée un document et retourne :

```json
{
  "id": "<uuid>",
  "module_id": "...",
  "status": "...",
  "answers": { ... },
  "title": "...",
  "modules": [ ... ],
  "user_id": "...",
  "created_at": "..."
}
```

Note : le champ `description` n’existe plus dans la table documents. La description affichée est générée dynamiquement à partir des titres des modules.

Headers :
- `Location: /api/documents/{id}`
- `Content-Type: application/json; charset=utf-8`
- `Cache-Control: no-store`

### GET /api/documents/[id]

Retourne le document complet ou 404 si introuvable.

Exemple d’erreur :
```json
{
  "error": "Document introuvable."
}
```

Le frontend affiche un spinner lors du chargement et un message d’erreur si le document est absent.

---

© MyLawly — prototype technique.
