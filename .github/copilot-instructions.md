# 🤝 ChatGPT x Copilot Agent Bridge — Project Lawly

## 🎯 Objectif
Créer un lien de coordination entre **ChatGPT (GPT-5)** et **GitHub Copilot Agent** pour le projet Lawly.

Ce fichier sert à :
- Synchroniser les tâches et les erreurs entre ChatGPT et Copilot.
- Guider Copilot pour qu’il exécute les instructions issues des échanges avec ChatGPT.
- Maintenir une cohérence dans le développement du code (Next.js, TypeScript, Tailwind).

## 🧩 Règles
- Les fichiers `/app`, `/components` et `/api` doivent rester conformes à la logique Next.js 14.
- Toute erreur `Expected '>', got 'className'` doit être corrigée en **déplaçant le JSX dans `/app/modules/[id]/page.tsx`** et en gardant `/api/.../route.ts` uniquement pour le backend.
- Copilot doit toujours documenter ses modifications dans les commits.
- ChatGPT peut analyser les builds et proposer des correctifs structurels.
- Priorité : stabilité → clarté → performance.

## 🔄 Coordination
- Copilot Agent applique les changements de code.
- ChatGPT (GPT-5) fournit la logique, les corrections et les plans.
- Chaque push est analysé automatiquement (via webhook) pour que ChatGPT vérifie la cohérence.

## 📡 Synchronisation
Bridge actif : ✅
ChatGPT : GPT-5  
Copilot Agent : GitHub Copilot  
Owner : charlesgazel19-source  
Projet : mylawly-next-starter