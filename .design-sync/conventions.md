# Construire avec Chaud Devant

## Socle de page

Pas de provider : les composants s'importent et se rendent tels quels. Pose
chaque écran sur le papier de la maison et l'encre par défaut :

```jsx
<div className="papier grain min-h-svh text-fonte">…</div>
```

Le crème est le sol, jamais le noir. Les liens rendent des ancres simples.
Les polices (Fraunces, Karla) sont embarquées — rien à charger.

## L'idiome de style : Tailwind + tokens de marque

Couleurs (utilisables en `bg-*`, `text-*`, `border-*`) : `creme`,
`creme-fonce`, `papier`, `rouge`, `rouge-sombre`, `rouge-clair`, `fonte`
(brun profond — l'encre), `bois`, `vert`. Exemples réels : `bg-rouge`,
`text-fonte/70`, `border-fonte/15`, `hover:bg-rouge-sombre`.

Typo : `font-display` (Fraunces — titres, boutons, wordmark, souvent
`font-black`) et `font-sans` (Karla — corps de texte). Étiquettes de champ :
`text-xs font-bold uppercase tracking-[0.15em] text-bois`.

La feuille livrée est compilée : les classes du site et les familles
courantes (couleurs de marque, tailles de texte, `w-*`, `max-w-*`, `p-*`,
`gap-*`, `grid-cols-*`) existent. Pour une valeur hors de ce socle, passe par
les variables — toujours définies : `style={{ background: 'var(--color-creme-fonce)' }}`
ou `bg-[var(--color-rouge)]`.

Classes maison (toujours disponibles) : `papier` (fond crème dégradé),
`grain` (grain de nappe en papier, sur un parent `relative`), `nappe`
(vichy rouge — un bandeau `h-3`/`h-4`, jamais tout l'écran), `fonte-chaude`
(bloc sombre chaleureux pour pieds de page et encarts), `embleme-vivant`
(anime la vapeur d'un `Embleme`/`Logo` enfant), `defile` + `defile-piste`
(défilé horizontal en boucle).

Le dessin de la maison : angles droits partout (seules les puces de filtre
sont `rounded-full`), bordures franches `border-2`, ombres dures décalées
(`shadow-[6px_6px_0_0_var(--color-creme-fonce)]`), champs soulignés
(`border-0 border-b-2`) plutôt qu'encadrés. Pas de coins arrondis, pas
d'ombres floues, pas de dégradés d'interface.

## Où lire la vérité

`styles.css` → `_ds_bundle.css` (tokens `--color-*` et toutes les classes
compilées) et `fonts/fonts.css`. Par composant : son `.d.ts` (l'API) et son
`.prompt.md` (l'usage). Avant d'écrire un TEXTE : `guidelines/regles-de-marque.md`
— les interdits (jamais de date d'ouverture, jamais de ville, vocabulaire
banni, pas d'emoji, pas de phrasé haché) valent aussi pour une maquette.

## Une composition idiomatique

```jsx
<section className="papier grain relative isolate px-6 py-16 text-center">
  <Logo className="mx-auto w-64 text-rouge" />
  <div className="mx-auto mt-10 max-w-lg border-[3px] border-rouge bg-papier p-1.5 text-left shadow-[6px_6px_0_0_var(--color-creme-fonce)]">
    <div className="border border-rouge/30 px-6 py-8">
      <p className="text-center font-display text-3xl font-black leading-[1.05] text-fonte">
        Le jour où on ouvre le restaurant, c'est nous qui régalons.
      </p>
      <SignupForm />
    </div>
  </div>
</section>
```
