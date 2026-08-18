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
6. **Vocabulaire banni** : healthy, light, détox, protéiné, gourmet, gastronomique, revisité, déconstruit, foodie, food porn, yummy.

Principe qui les résume : **précis sur l'univers, muet sur les specs.** Montrer n'est pas promettre.

## Ton d'écriture (section 11.2)

Français, chaleureux, direct, un peu vanné. Phrases courtes. On raconte, on ne dicte pas.
Une vanne régulièrement, jamais aux dépens du lecteur. Tutoiement partout, site comme emails.
Pas d'emoji dans les textes de site.

Territoire : cocotte, fonte, mijoté, à partager, chez ma grand-mère, le dimanche, généreux, régressif, franc.

## Réflexes techniques (section 11.3)

- Tout contenu recette vient de Notion, jamais écrit en dur dans le repo.
- Le compteur de Fondateurs et la carte des villes se lisent dans Postgres, jamais dans Resend.
- Le numéro de Fondateur s'attribue à la confirmation, en transaction, plafonné à 500, jamais réattribué.
- Balisage `Recipe` schema.org obligatoire sur chaque fiche recette.
- Médias en 9:16, images optimisées, pas de dépendance lourde.
- Double opt-in et lien de désinscription dès le premier email.

## Stack cible (section 6.3)

Next.js (App Router) + Tailwind · Vercel · Notion comme CMS recettes (ISR) · Postgres (Neon/Supabase)
· Resend + React Email · domaine chauddevant.fr via OVH · Vercel Analytics.

## Les deux tests avant de publier (section 11.4)

1. Est-ce que ça pourrait être servi dans le resto Chaud Devant ?
2. Est-ce que je promets quelque chose que je ne contrôle pas ?

## État actuel du repo

Page de garde statique (`index.html`) — le nom, rien d'autre. Déployée sur Vercel.
Le site V1 (Next.js) reste à construire, voir section 6.
