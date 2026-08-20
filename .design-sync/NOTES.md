# design-sync — notes de ce repo

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
- **Deps du converter** (fresh clone) :
  `cd .ds-sync && npm i esbuild ts-morph @types/react playwright@1.56.0 @tailwindcss/cli@4.3.3`.
  playwright est épinglé 1.56.0 pour le chromium-1194 du cache machine
  (`/opt/pw-browsers`) — re-vérifier le pin sur une autre machine.
- **`guidelinesGlob` est surchargé exprès** : le défaut (`docs/*.md`)
  embarquerait `docs/CHAUD-DEVANT-QG.md` — stratégie privée — dans le projet
  design. Ne jamais revenir au défaut. La version distillée pour l'agent vit
  dans `.design-sync/guidelines/regles-de-marque.md`.
