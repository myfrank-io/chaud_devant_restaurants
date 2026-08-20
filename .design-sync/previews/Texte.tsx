import { Texte } from 'chaud-devant'

/** Le champ titre de la fiche d'un post, déjà rempli. */
export const Remplie = () => (
  <div className="papier max-w-md p-8">
    <Texte
      nom="title"
      libelle="Le plat, ou l’idée"
      requis
      valeur="Bœuf bourguignon de mémé"
      placeholder="Bœuf bourguignon de mémé"
    />
  </div>
)

/** Avec le texte d'aide sous l'étiquette, comme sur la fiche recette. */
export const AvecAide = () => (
  <div className="papier max-w-md p-8">
    <Texte
      nom="slug"
      libelle="L’adresse"
      aide="Laissée vide, elle se déduit du titre. La changer casse le lien déjà partagé."
      placeholder="boeuf-bourguignon"
    />
  </div>
)
