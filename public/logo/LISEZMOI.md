# Logo Chaud Devant

La source du logo est le code : `components/Logo.tsx`. Les fichiers de ce dossier
en sont des exports, régénérables à tout moment — ne les retouchez pas à la main,
modifiez le composant.

| Fichier | Usage |
|---|---|
| `logo-rouge-sur-creme.png` | Version principale, sur fond clair |
| `logo-creme-sur-rouge.png` | Négatif, le plus lisible en petit |
| `logo-creme-sur-fonte.png` | Sur fond brun foncé |
| `logo-carre-profil.png` | Format carré, pour les photos de profil |
| `chaud-devant-logo.svg` | Vectoriel, pour l'impression |

Le SVG appelle **Fraunces** (Google Fonts, licence libre) et l'importe lui-même :
il s'affiche correctement dans un navigateur. Dans un logiciel de création hors
ligne, installez la police avant d'ouvrir le fichier, sinon le logotype tombera
sur une police de substitution.

## Règles d'usage

Zone de protection : au moins la hauteur du mot « CHAUD » tout autour.

Ne pas déformer, ne pas recolorer hors de la palette de la charte, ne pas
redresser le couvercle — son inclinaison est le sujet du logo, pas un défaut.

En dessous de 40 px de large, utiliser l'emblème seul (`Embleme` dans le même
fichier) : le logotype et la mention de millésime deviennent illisibles.
