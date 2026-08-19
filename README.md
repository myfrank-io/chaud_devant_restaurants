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

Deux branchements manquent, et le site n'est pas prêt à être partagé tant qu'ils ne sont pas
faits.

1. **`DATABASE_URL`** — sans base, le formulaire d'inscription échoue.
2. **`RESEND_API_KEY`** — sans clé, personne ne reçoit le mail de confirmation, donc personne
   n'est jamais confirmé, donc personne n'ouvre droit au menu offert. Le site fonctionne sans :
   l'adresse est bien enregistrée, la page de remerciement le dit sans mentir, et la confirmation
   attend. Mais tant que la clé manque, aucun inscrit n'ouvre droit au menu.

### La base Supabase

Le projet est `Chaud-Devant-Restaurants` (`abrppxmowjspqjbpgmfb`, région `eu-west-1`). La table
`subscribers` y est déjà créée, RLS activée sans aucune politique : PostgREST est ouvert au public
par la clé publishable, et rien ne doit pouvoir y lire les adresses. Le site n'utilise pas
PostgREST — il ouvre une connexion Postgres directe, qui n'est pas soumise à RLS.

`DATABASE_URL` se récupère dans le dashboard Supabase, bouton **Connect**, onglet
**Transaction pooler** — pas la chaîne `db.<ref>.supabase.co:5432`, qui est en IPv6 seul et garde
une connexion ouverte par requête, ce que l'exécution serverless de Vercel ne supporte pas. La
chaîne à coller ressemble à :

```
postgresql://postgres.abrppxmowjspqjbpgmfb:MOT_DE_PASSE@aws-N-eu-west-1.pooler.supabase.com:6543/postgres?sslmode=require
```

Elle se colle dans Vercel → Settings → Environment Variables, sur les trois environnements. Le mot
de passe ne transite jamais par une conversation ni par le repo.

Et deux textes attendent une main humaine dans `/mentions-legales` : l'identité de l'éditeur, et
les conditions du menu offert. Ces dernières sont le seul endroit où l'étendue de l'engagement se
borne, puisque l'avantage n'est pas plafonné en nombre de bénéficiaires — elles doivent passer
devant un juriste avant le lancement.

## Architecture

| Brique | Où | Pourquoi |
|---|---|---|
| Liste d'inscrits | Postgres, `lib/subscribers.ts` | La liste vit chez nous, pas dans l'outil d'emailing (QG 6.4) |
| Envoi d'emails | Resend, `lib/email.ts` | Resend n'envoie, il ne stocke pas |
| Recettes | Notion, `lib/notion.ts` | Aucune double saisie, aucune recette en dur dans le repo |
| Textes de marque | `lib/site.ts` | Un seul endroit à relire avant publication |

### La promesse

Un seul avantage, sans palier : tout inscrit **confirmé** reçoit un menu offert le jour de
l'ouverture, à utiliser quand il veut. Le droit se lit en base — `confirmed_at` renseigné et
`unsubscribed_at` nul — et nulle part ailleurs.

C'est un écart assumé par rapport à la section 7.2 du QG, qui borne tout cadeau. Conséquence à
garder en tête : l'engagement grandit avec la liste. `/dossier` affiche le nombre de menus dus.

### Le champ « ville »

Ce n'est pas un champ décoratif. C'est lui qui répondra un jour à « où est-ce qu'on ouvre »
avec un chiffre. Il alimente la densité par ville affichée sur `/dossier`.

## Pages

| Route | État |
|---|---|
| `/` | Le nom, la promesse, la capture email, puis les recettes |
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
