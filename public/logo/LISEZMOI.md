# Marques Chaud Devant

La source vit dans le code — `components/Logo.tsx` et `components/Tampon.tsx`.
Les fichiers de ce dossier en sont des exports, régénérables à tout moment : ne
les retouchez pas à la main, modifiez le composant.

## Deux marques, deux rôles

**Le logotype** est la marque principale : cocotte au couvercle soulevé, logotype
en deux lignes, millésime. C'est lui partout où la marque se présente.

**Le tampon** est une marque secondaire, dans l'esprit d'un coup de tampon sur un
carnet de commandes. Il sert là où le logotype ne va pas : un coin de page, un
sticker, un sceau sur une photo, le dos d'une carte.

Les deux ne s'emploient **jamais ensemble sur un même support**.

## Les fichiers

| Fichier | Usage |
|---|---|
| `logo-creme-sur-rouge.png` | **Version de référence.** Le négatif tient le mieux en petit |
| `logo-rouge-sur-creme.png` | Sur fond clair |
| `logo-creme-sur-fonte.png` | Sur fond brun foncé |
| `logo-carre-profil.png` | Carré, pour les photos de profil |
| `chaud-devant-logo.svg` | Vectoriel, pour l'impression |
| `tampon-creme-sur-rouge.png` | Le tampon, en négatif |
| `tampon-rouge-sur-creme.png` | Le tampon, sur fond clair |
| `chaud-devant-tampon.svg` | Le tampon, vectoriel |
| `tampon-monochrome.svg` | Le tampon en `currentColor`, à colorer soi-même |

Les SVG appellent **Fraunces** (Google Fonts, licence libre) et l'importent
eux-mêmes : ils s'affichent correctement dans un navigateur. Dans un logiciel de
création hors ligne, installez la police avant d'ouvrir le fichier, sinon le
logotype tombera sur une police de substitution.

## Règles d'usage

Zone de protection : au moins la hauteur du mot « CHAUD » tout autour.

Ne pas déformer, ne pas recolorer hors de la palette de la charte.

**Ne pas redresser le couvercle** du logotype ni **remettre le tampon d'aplomb** :
ces deux dévers sont le dessin, pas un défaut de tracé. C'est la régularité
parfaite qui trahit une image fabriquée à la chaîne.

En dessous de 40 px de large, utiliser l'emblème seul (`Embleme`, dans
`components/Logo.tsx`) : le logotype et le millésime deviennent illisibles.
