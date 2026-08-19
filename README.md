# Chaud Devant — le site

Next.js (App Router) + Tailwind, deployé sur Vercel.
Le contexte du projet et les règles d'écriture sont dans [`CLAUDE.md`](./CLAUDE.md) et
[`docs/CHAUD-DEVANT-QG.md`](./docs/CHAUD-DEVANT-QG.md). **À lire avant d'écrire la moindre
ligne de texte public.**

## Démarrer

```bash
npm install
cp .env.example .env.local   # puis remplir
npm run dev
```

## Avant de rendre le site public

Trois choses manquent, et le site n'est pas prêt à être partagé tant qu'elles ne sont pas faites.

1. **`DATABASE_URL`** — sans base, le formulaire d'inscription échoue et le compteur de
   Fondateurs se tait. Créer la base (Neon ou Supabase), puis appliquer `db/schema.sql`.
2. **`RESEND_API_KEY`** — sans clé, personne ne reçoit le mail de confirmation, donc personne
   n'est jamais confirmé, donc aucun numéro de Fondateur n'est attribué.
3. **Le carnet** — la home promet « 10 recettes de cocotte, tout de suite ». Le PDF doit exister
   avant que la promesse soit tenable.

Et deux textes attendent une main humaine : l'identité de l'éditeur et les conditions des 500
Fondateurs, dans `/mentions-legales`. Ces dernières engagent sur deux ans et doivent passer
devant un juriste (QG 7.2).

## Architecture

| Brique | Où | Pourquoi |
|---|---|---|
| Liste d'inscrits | Postgres, `lib/subscribers.ts` | La liste vit chez nous, pas dans l'outil d'emailing (QG 6.4) |
| Envoi d'emails | Resend, `lib/email.ts` | Resend n'envoie, il ne stocke pas |
| Recettes | Notion, `lib/notion.ts` | Aucune double saisie, aucune recette en dur dans le repo |
| Textes de marque | `lib/site.ts` | Un seul endroit à relire avant publication |

### Le numéro de Fondateur

Attribué **à la confirmation**, jamais à la soumission du formulaire. Dans une transaction, sous
verrou consultatif, plafonné à 500, et jamais réattribué : on prend `max + 1`, jamais un trou
libéré par une désinscription. Une désinscription ne remet donc jamais `founder_number` à `NULL`.

### Le champ « ville »

Ce n'est pas un champ décoratif. C'est lui qui répondra un jour à « où est-ce qu'on ouvre »
avec un chiffre. Il alimente la densité par ville affichée sur `/dossier`.

## Pages

| Route | État |
|---|---|
| `/` | Manifeste, capture email, compteur de Fondateurs |
| `/recettes` et `/recettes/[slug]` | Alimentées par Notion, balisage `Recipe` schema.org |
| `/le-concept` | L'univers. Ni date, ni ville, ni format du lieu |
| `/dossier` | Non listée, `noindex`. Chiffres lus dans Postgres uniquement |
| `/merci`, `/confirmation`, `/desinscription` | Parcours d'inscription en double opt-in |
| `/mentions-legales` | Données personnelles écrites ; identité et conditions à compléter |

## L'image de couverture

Le hero utilise un dégradé chaud tant qu'il n'y a pas de photo. Quand la vraie image existe
(cocotte ouverte, vapeur qui monte), la déposer dans `public/` et renseigner `HERO_IMAGE` dans
`lib/site.ts`. Même chose pour les photos de cocottes chinées de `/le-concept`, via
`COCOTTES_PHOTOS`.

## Commandes

```bash
npm run dev        # développement
npm run build      # build de production
npm run typecheck  # TypeScript
npm run lint       # ESLint
```
