# Marques Chaud Devant

Source : `components/Logo.tsx` (logotype, emblème, horizontal, rond) et
`components/Tampon.tsx`. Les fichiers de ce dossier sont des **exports
régénérables** — on ne les retouche pas à la main.

## Les cinq marques

| Marque | Quand l'utiliser |
|---|---|
| `logotype` | Par défaut. Partout où la marque se présente |
| `horizontal` | En-tête de site, carte de visite, signature |
| `rond` | Photo de profil, favicon, sticker. La cocotte est évidée dans le disque |
| `embleme` | En dessous de 40 px, et en ornement |
| `tampon` | Marque secondaire : coin de page, sceau, dos de carte |

Le logotype et le tampon ne s'emploient **jamais ensemble sur un même support**.

## Nommage des fichiers

`png/<marque>-<variante>.png`

**Encres, sur fond transparent** : `-rouge` `-creme` `-fonte` `-noir` `-blanc`
**Posées sur un aplat** : `-sur-creme` `-sur-rouge` `-sur-fonte`

`svg/<marque>.svg` — vectoriel en rouge, pour l'impression et l'agrandissement.
**Le texte y est vectorisé en tracés** : aucune police n'est requise, nulle
part. Les fichiers s'ouvrent à l'identique partout, hors ligne compris.

Choisir l'encre selon le fond, pas selon le goût : `-creme` et `-blanc` sur
fond sombre, `-rouge` et `-fonte` sur fond clair, `-noir` uniquement pour une
impression en une seule couleur.

## Règles d'usage

Zone de protection : au moins la hauteur du mot « CHAUD » tout autour.

**Ne pas redresser le couvercle du logotype, ni remettre le tampon d'aplomb.**
Ces deux dévers sont le dessin, pas un défaut de tracé.

Ne pas déformer, ne pas recolorer hors palette, ne pas poser une marque sur une
photo chargée sans réserve de couleur derrière.

## Régénérer les fichiers

Les SVG et les PNG se rendent depuis les composants React, dans un navigateur,
pour que la police soit résolue. Le script d'export a besoin d'une page qui
monte les cinq marques avec un attribut `data-marque` ; elle est créée le temps
de l'export puis retirée, afin de ne pas partir en production.

Les lettres des SVG ne sont plus du texte : on ne peut donc plus les
ré-éditer dans le fichier. Pour changer un mot, il faut modifier le composant
React et ré-exporter — c'est voulu, un logo ne se corrige pas à la volée.
