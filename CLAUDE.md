# Chaud Devant — instructions projet

Contexte complet (stratégie, charte, bible éditoriale, spéc technique) :
**`docs/CHAUD-DEVANT-QG.md`** — à lire en entier avant toute tâche sur le projet.
Le QG Notion est la source de vérité vivante ; ce fichier en est un instantané.

Où chercher quoi :
- Construire le site → sections 6, 7, 11
- Écrire du contenu, une légende, un email, un texte de page → sections 2, 3, 11
- Prioriser → section 9 (roadmap)

## Les 6 interdits absolus (section 11.1)

À vérifier avant toute production de texte public — site, email, légende.

1. **Jamais de date d'ouverture.** Ni année, ni saison, ni « bientôt ».
2. **Jamais de ville** comme lieu d'implantation. C'est le champ « ville » du formulaire qui répond à cette question.
3. **Jamais décrire le futur lieu au futur** : pas de nombre de couverts, pas de véranda, pas de cheminée, pas de plan de salle, pas de carte figée. Ça vit ici et sur `/dossier`, pas en public.
4. **Jamais conditionner une récompense à un follow Instagram.**
5. **Jamais promettre un avantage non plafonné.** Tout cadeau est borné et écrit.
   → *Écart en vigueur, décidé par Joseph le 19/08 : le menu offert à l'ouverture vaut pour tous les inscrits confirmés, sans plafond. Ne pas le « recorriger » sans lui demander.*
6. **Vocabulaire banni** : healthy, light, détox, protéiné, gourmet, gastronomique, revisité, déconstruit, foodie, food porn, yummy.

Principe qui les résume : **précis sur l'univers, muet sur les specs.** Montrer n'est pas promettre.

## Ton d'écriture (section 11.2)

Français, chaleureux, direct, un peu vanné. Phrases courtes. On raconte, on ne dicte pas.
Une vanne régulièrement, jamais aux dépens du lecteur. Tutoiement partout, site comme emails.
Pas d'emoji dans les textes de site.

Territoire : cocotte, fonte, mijoté, à partager, chez ma grand-mère, le dimanche, généreux, régressif, franc.

### Interdit de forme : le phrasé haché

**Jamais de « X. Y. Z. T. »** — quatre bouts secs à la suite, dans quoi que ce soit de généré
pour ce projet : texte de site, légende, email, hook, script, message. C'est le tic d'écriture
qui trahit une machine, et il passe entre les gouttes parce que chaque morceau respecte
« phrases courtes ».

```
✗ 6 ingrédients. Compte-les. Il y en a 6. C'est tout.
✓ J'ai compté trois fois parce que j'y croyais pas, mais ouais, 6 ingrédients.
```

On écrit comme on parle à un pote : **une phrase d'un souffle, la chute au bout**, avec des
liaisons — « et », « mais », « alors », « franchement », « en vrai ». La vanne tombe à la fin,
pas à chaque point.

Le seuil est à quatre et pas à trois : la punchline maison — « C'est pas beau. C'est bon. C'est
pas pareil. » — en compte trois, et c'est du Chaud Devant. Trois temps voulus, ça se garde ;
quatre bouts alignés par réflexe, jamais.

`lib/garde-fous.ts` le signale à l'écran, au même titre que le vocabulaire banni. C'est un
avertissement, pas un blocage — mais pour du texte généré, la règle est absolue.

## Réflexes techniques (section 11.3)

- Tout contenu recette s'écrit dans `/atelier`, jamais en dur dans le repo.
  → *Écart en vigueur, décidé par Joseph le 19/08 : les recettes vivent en base, pas dans Notion.
  Notion n'avait jamais été branché. Le principe que la règle protégeait tient : rien en dur.*
- Le compteur d'inscrits et la carte des villes se lisent dans Postgres, jamais dans Resend.
- Le droit au menu offert se lit en base : `confirmed_at` renseigné et `unsubscribed_at` nul. Le double opt-in est ce qui l'ouvre — une adresse jamais confirmée n'engage à rien.
- Balisage `Recipe` schema.org obligatoire sur chaque fiche recette.
- Médias en 9:16, images optimisées, pas de dépendance lourde.
- Double opt-in et lien de désinscription dès le premier email.

## Stack cible (section 6.3)

Next.js (App Router) + Tailwind · Vercel · Postgres (Supabase) pour la liste, les recettes et
l'atelier · Resend + React Email · domaine chauddevant.fr via OVH · Vercel Analytics.

## Les deux tests avant de publier (section 11.4)

1. Est-ce que ça pourrait être servi dans le resto Chaud Devant ?
2. Est-ce que je promets quelque chose que je ne contrôle pas ?

## État actuel du repo

Site V1 en Next.js (App Router) + Tailwind, déployé sur Vercel. Pages en place : `/`,
`/recettes` et `/recettes/[slug]`, `/le-concept`, `/dossier`, `/merci`, `/confirmation`,
`/desinscription`, `/mentions-legales`.

L'offre a été simplifiée sur décision de Joseph : **un seul avantage, sans plafond** — tout
inscrit confirmé reçoit un menu offert le jour de l'ouverture, à utiliser quand il veut. La
mécanique des 500 Fondateurs a été retirée. C'est un écart assumé par rapport à l'interdit n° 5
ci-dessus, arbitré en connaissance de cause ; le reste des interdits continue de s'appliquer.

Deux branchements manquent avant de rendre le site public — détail dans le README :
`DATABASE_URL` et `RESEND_API_KEY`. Deux textes attendent aussi une main humaine dans
`/mentions-legales` : l'identité de l'éditeur et les conditions du menu offert, ces dernières
devant passer devant un juriste.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
