import { Choix } from 'chaud-devant'

/** La catégorie d'une fiche recette, une valeur déjà choisie. */
export const Categorie = () => (
  <div className="papier max-w-md p-8">
    <Choix
      nom="category"
      libelle="Catégorie"
      valeur="Mijoté"
      vide="— aucune —"
      options={[
        { valeur: 'Mijoté', libelle: 'Mijoté' },
        { valeur: 'Gratin', libelle: 'Gratin' },
        { valeur: 'Soupe', libelle: 'Soupe' },
        { valeur: 'Viande', libelle: 'Viande' },
        { valeur: 'Poisson', libelle: 'Poisson' },
        { valeur: 'Légumes', libelle: 'Légumes' },
        { valeur: 'Dessert', libelle: 'Dessert' },
      ]}
    />
  </div>
)

/** Rien de choisi encore : l'option vide fait l'invite, comme sur la fiche d'un post. */
export const SansValeur = () => (
  <div className="papier max-w-md p-8">
    <Choix
      nom="son_type"
      libelle="Le son"
      vide="— à décider —"
      options={[
        { valeur: 'voix', libelle: 'Voix off' },
        { valeur: 'musique', libelle: 'Musique' },
      ]}
    />
  </div>
)
