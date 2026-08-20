# design-sync — notes de ce repo

## Montage

- Le repo est une **app Next.js 16**, pas un paquet de librairie : pas de
  `dist/`, pas de `.d.ts` publiés. L'entrée du bundle est le barrel committé
  `.design-sync/entry.ts` (cfg.entry) — c'est aussi ce qui fait pointer
  `PKG_DIR` sur la racine du repo. Les 21 composants sont épinglés dans
  `componentSrcMap` ; la découverte automatique ne trouverait rien.
- **Frontières serveur doublées** via `tsconfig.sync.json` (le plugin paths
  d'esbuild résout les clés exactes avant `@/*`) : `next/link` → ancre simple
  (DOM identique), `@/app/actions` → mock (la soumission montre l'état
  « envoyé »), `@/app/login/actions` → mock inerte, `@/lib/db` → stub,
  `server-only` → module vide. Les composants eux-mêmes sont les vrais.
- **CSS** : Tailwind v4 compilé par `cfg.buildCmd` vers
  `.design-sync/.cache/tailwind.css` (gitignoré) — TOUJOURS lancer buildCmd
  avant le converter, sinon `cssEntry` n'existe pas. La safelist des
  utilitaires de marque vit dans `.design-sync/tailwind.entry.css`
  (`@source inline(...)`) : une classe token absente de cette liste et non
  utilisée dans le repo n'existera pas dans le CSS livré.
- **Fonts** : Fraunces + Karla variables (sous-ensemble latin, committées
  sous `.design-sync/fonts/`). `--font-fraunces`/`--font-karla` sont définies
  dans `tailwind.entry.css` parce que next/font ne tourne pas hors de l'app.
- **`.d.ts` : l'extracteur ne lit que des arbres `.d.ts` publiés — ce repo
  n'en a pas, donc TOUTES les props viennent de `cfg.dtsPropsFor` (écrites à
  la main depuis la source). Si les props d'un composant changent, mettre à
  jour son entrée `dtsPropsFor`, sinon le contrat lu par l'agent de design
  ment.**
- **Deps du converter** (fresh clone) :
  `cd .ds-sync && npm i esbuild ts-morph @types/react playwright@1.56.0 @tailwindcss/cli@4.3.3`.
  playwright est épinglé 1.56.0 pour le chromium-1194 du cache machine
  (`/opt/pw-browsers`) — re-vérifier le pin sur une autre machine.
- **`guidelinesGlob` est surchargé exprès** : le défaut (`docs/*.md`)
  embarquerait `docs/CHAUD-DEVANT-QG.md` — stratégie privée — dans le projet
  design. Ne jamais revenir au défaut. La version distillée pour l'agent vit
  dans `.design-sync/guidelines/regles-de-marque.md`.
- La regex d'accents de `components/RecipeFilters.tsx` doit rester en
  échappements `\u0300-\u036f` : en caractères combinants bruts, le bundle
  casse dès qu'il est servi sans charset UTF-8 explicite (vécu au premier
  validate).

## Aperçus (previews) — acquis des vagues

- Artefact de planche : chaque cellule des sheets de review est suivie d'un
  grand bloc crème vide (fond de page du story) et les tuiles croppent vers
  ~570px — vérifier une cellule haute par screenshot pleine page avant de la
  dégrader ; ce n'est pas un rendu cassé.
- SVG de marque : sans classe `w-*` ils prennent toute la largeur. Largeurs
  éprouvées : Embleme/Rond w-40, Logo portrait w-52/56, Tampon w-64,
  LogoHorizontal w-96.
- `embleme-vivant` anime la vapeur : l'opacité des volutes varie d'une
  capture à l'autre selon la phase de l'animation — pas un signal de
  régression.
- ChampRelu en démo : choisir des mots bannis à entrée unique
  (`gastronomique`, `gourmet`…) — `revisité`/`déconstruit`/`protéiné` ont une
  variante désaccentuée dans `lib/garde-fous.ts` et déclenchent une double
  alerte quasi identique.
- LoginForm se preview sans PageSimple (son `min-h-svh` fait une cellule
  immense) : porter la composition de `app/login/page.tsx` à la main.
- `Liste` : dimensionner `lignes` sur le contenu (les pages réelles utilisent
  10 pour les étapes) — sinon la dernière entrée wrappée est coupée au cadre.
- `Bouton` n'a pas de style `disabled` (rend identique à l'état normal — fidèle
  à la source) et la variante `contour` n'est pas employée dans `app/`.
- `app/merci` n'existe plus (CLAUDE.md le mentionne encore) : la composition
  canonique de PageSimple est `app/confirmation/page.tsx`.
- Compositions atelier : libellés/aides/placeholders réels dans
  `app/atelier/post/[id]/page.tsx` et `app/atelier/recettes/[id]/page.tsx`.

## Known render warns (triés, légitimes)

- `[RENDER_THIN]` sur **Embleme** et **Rond** : SVG sans texte HTML — attendu,
  sans gravité.

## Re-sync risks (ce qui peut pourrir en silence)

- **`cfg.dtsPropsFor` est écrit à la main** : une évolution des props d'un
  composant ne casse rien au build — le contrat devient juste faux. À relire
  à chaque re-sync qui touche `components/`.
- Les données de démo des previews (recettes, valeurs atelier) sont inlinées
  dans `.design-sync/previews/*.tsx` : un changement du type `Recipe` ou des
  unions `Statut`/`Format` les périme (le capture/grade le verra au rendu,
  pas au type).
- Les previews s'appuient sur des classes présentes dans la source de l'app
  (`space-y-*`, `leading-[1.05]`, CADRE…) : une refonte CSS de l'app peut
  orphaniner des classes de preview sans erreur de build.
- Le pin playwright 1.56.0 est lié au cache chromium de CETTE machine.
- Les polices sont figées (woff2 committés) : si `app/layout.tsx` change de
  familles next/font, re-télécharger les woff2 et mettre à jour
  `fonts/fonts.css` + les variables dans `tailwind.entry.css`.
- `conventions.md` énumère classes et tokens : re-valider ces noms contre le
  build frais à chaque re-sync (règle standard du skill).
