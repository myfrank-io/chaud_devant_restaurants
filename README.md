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

### Le schéma : posé par l'application

**Il n'y a aucune migration à jouer à la main.** Le schéma vit dans
[`db/schema.ts`](./db/schema.ts), il est idempotent de bout en bout, et l'application le pose
elle-même avant sa première requête. Déployer suffit.

Ce n'était pas le cas avant, et ça a coûté deux pannes le même jour : du code lisant une colonne
partait en production pendant que la migration qui crée la colonne restait dans un dossier que
personne ne jouait. Chaque requête tombait en `42703`, et tout l'atelier cassait d'un coup sans
rapport visible avec ce qu'on venait de faire. La cause n'était pas l'étourderie mais la
structure : poser une migration ici demandait un geste humain hors du déploiement, donc le code
et la base pouvaient diverger — et divergeaient.

**Pour ajouter une colonne**, dans `db/schema.ts` et nulle part ailleurs :

1. dans le `CREATE TABLE`, pour une base neuve ;
2. en `ALTER TABLE … ADD COLUMN IF NOT EXISTS` juste en dessous, pour les bases qui existent déjà ;
3. incrémenter `VERSION`.

La pose ne bloque jamais : si elle échoue (droits manquants), l'application continue avec la base
telle qu'elle est plutôt que de s'éteindre.

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
| Recettes | Postgres, `lib/recipes.ts` | Écrites dans `/atelier`, aucune recette en dur dans le repo |
| Atelier | `/login` + `/atelier` | Lignes directrices, posts, idées, recettes — voir plus bas |
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

## L'atelier

`/login` ouvre l'espace privé. Un seul mot de passe partagé, dans `ADMIN_PASSWORD` — pas de
comptes : on est deux, et un annuaire d'identités serait plus de surface à garder que de
problème résolu. La clé qui signe la session dérive du mot de passe, donc le changer
déconnecte tout le monde, ce qu'on veut d'un secret partagé.

Quatre vues sous `/atelier` :

| Vue | À quoi ça sert |
|---|---|
| **Calendrier** | Les posts calés, mois par mois. En bas, ceux qui attendent une date. |
| **À préparer** | Les lignes directrices, chacune un dossier de posts. Ce qui manque à un post se lit dans la liste, sans l'ouvrir. |
| **Idées** | Une case à cocher par idée. Cocher archive au lieu de supprimer : une idée écartée reste une trace de ce à quoi on a déjà pensé. |
| **Recettes du site** | Ce qui paraît sur `/recettes`. `published_at` décide seule ; un brouillon n'existe que dans l'atelier. |

### La fiche recette naît avec le post

Créer un post ouvre sa fiche recette du même geste, avec le même titre, en brouillon. Une case
décochable pour les posts qui ne racontent pas un plat. Deux posts sur le même plat obtiennent
deux adresses distinctes (`/blanquette`, `/blanquette-2`) : la colonne est unique, et échouer sur
une contrainte n'aurait aucun sens à l'écran.

### La parution se déclenche toute seule

Caler au calendrier un post qui porte une recette fixe la date de parution de cette recette. Le
jour venu, elle apparaît sur `/recettes` sans que personne n'ait rien à relancer.

**Sauf si la fiche est vide.** Une recette sans ingrédients ni étapes ne paraît jamais, même sa
date passée — la fiche naît vide en même temps que le post, et sans ce garde-fou caler un post
publierait une page blanche. Le calendrier l'annonce en rouge (« ⚠ fiche vide »), et la liste des
recettes la range sous « À finir — elles ne paraîtront pas ».

Il n'y a **aucune tâche planifiée** derrière : `published_at` peut être dans le futur, et les
lectures publiques filtrent sur `published_at <= now()`. La parution est donc dans la requête, pas
dans un travail de fond — elle ne peut pas « ne pas s'être déclenchée », et rien ne se rattrape
après une panne puisqu'il n'y a rien à rattraper.

Ce que ça coûte : les pages publiques sont en cache, revalidées toutes les 15 minutes. C'est le
retard maximum d'une parution programmée.

Trois règles, et elles comptent :

- Une recette **déjà en ligne** n'est jamais retirée par un décalage du post. Une page partagée
  reste une page partagée.
- Une recette **encore programmée** redevient brouillon si son post perd sa date.
- Changer la recette liée d'un post **relâche l'ancienne**, pour qu'elle ne reste pas programmée
  par un post qui ne la porte plus.

Chaque post porte un hook, un script, un son (voix off **ou** musique), une description et un
format. Les champs de texte se relisent pendant la frappe : le vocabulaire banni, les dates
d'ouverture et les descriptions du futur lieu sont signalés (`lib/garde-fous.ts`). C'est un
avertissement, jamais un blocage — la règle a déjà connu un écart assumé, et un outil qui refuse
d'enregistrer force à le contourner.

### Importer une recette depuis un lien — sans un centime

Presque tous les sites de cuisine publient un balisage `Recipe` schema.org dans leur page — le
même que celui qu'on émet nous-mêmes. `lib/lien.ts` le lit : titre, ingrédients, étapes, durée,
photo, déjà séparés. C'est exact là où un modèle rendrait une approximation, et ça ne coûte rien.
Quand le balisage manque, on le dit et on n'invente pas.

Le serveur va chercher la page avec la vue réseau du serveur : les adresses privées, la boucle
locale et les protocoles autres que http/https sont refusés, la taille et le délai sont bornés.
Sans ça, un lien vers une adresse interne ferait de l'application un relais pour lire ce qu'elle
seule peut atteindre.

**Le texte importé appartient à quelqu'un d'autre.** Il sert de base, il se réécrit. La fiche naît
sans date de parution, donc rien ne la met en ligne tant que personne ne lui en donne une.

Ce garde-fou est plus faible que celui qu'on avait tenté : une colonne `reviewed_at` marquant la
relecture, qui aurait empêché la parution même en cas de calage au calendrier. Elle avait été
retirée faute de pouvoir appliquer sa migration. Ce n'est plus un obstacle depuis que
l'application pose son schéma elle-même — la colonne peut revenir quand on le décide.

### Ne pas partir de la page blanche : un lien, ou une photo

Deux chemins mènent à un post rempli. Ils ne remplissent pas les mêmes champs, et c'est voulu.

**Un lien**, depuis l'atelier. Le bouton *Remplir depuis ce lien*, sur `/atelier/post/nouveau`,
lit le balisage de la page, crée la fiche recette avec ce qu'elle publiait — ingrédients, étapes,
durées, photo — et rouvre le formulaire avec le titre et la fiche déjà rattachée. Le hook, le
script, le son et la légende restent vides : un balisage ne contient pas notre voix. La ligne
directrice et la date du calendrier suivent le lien jusqu'au formulaire.

**Une photo**, par la conversation. On envoie la photo du plat à Claude, il rend une adresse qui
rouvre le formulaire tout écrit. C'est le seul chemin qui remplit la voix, et il ne coûte rien non
plus — aucune clé d'API n'est appelée, le travail se fait dans la conversation.

Les deux fiches acceptent leurs champs par l'adresse :

```
/atelier/post/nouveau?titre=…&format=…&channel=…&status=…&hook=…&script=…
                     &son_type=…&son=…&caption=…&media_url=…&ligne=…&date=…&recette=…
/atelier/recettes/nouvelle?titre=…&slug=…&angle=…&categorie=…&prep=…&cuisson=…
                          &difficulte=…&saisons=automne,hiver&intro=…&ingredients=…&etapes=…
```

`intro`, `ingredients` et `etapes` prennent une entrée par ligne ; `saisons` prend des virgules.
Une valeur inconnue dans un menu déroulant — un `status` qui n'existe pas — est ignorée plutôt
qu'injectée.

Dans les deux cas **rien n'est écrit en base tant qu'on n'a pas cliqué sur Enregistrer**, et une
fiche pré-remplie naît sans date de parution : elle ne peut pas paraître toute seule.

La limite est la longueur d'une adresse : un script de plus de mille mots ne passera pas. Au-delà,
le texte se colle à la main.

La garde de session est posée deux fois, et il le faut : dans `app/atelier/layout.tsx` pour
l'affichage, et dans chaque action serveur via `exigeLaSession()`. Une action serveur est une URL
à part entière, appelable sans jamais charger la page qui la contient.
