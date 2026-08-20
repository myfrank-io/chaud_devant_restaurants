import { Liste } from 'chaud-devant'

/** La liste d'ingrédients d'une fiche recette, une entrée par ligne. */
export const Ingredients = () => (
  <div className="papier max-w-md p-8">
    <Liste
      nom="ingredients"
      libelle="Ingrédients"
      aide="Un par ligne, avec la quantité. « 1,2 kg de paleron »"
      valeur={[
        '1,2 kg de paleron',
        '150 g de lardons fumés',
        '3 carottes',
        '2 oignons jaunes',
        '75 cl de vin rouge corsé',
        '1 bouquet garni',
      ]}
    />
  </div>
)

/** Les étapes, plus hautes : elles se numérotent toutes seules à la parution. */
export const Etapes = () => (
  <div className="papier max-w-md p-8">
    <Liste
      nom="steps"
      libelle="Les étapes"
      aide="Une par ligne. Elles se numérotent toutes seules."
      lignes={9}
      valeur={[
        'Fais revenir les lardons dans la cocotte, puis réserve-les.',
        'Saisis la viande sur toutes les faces, sans serrer les morceaux.',
        'Mouille au vin rouge en grattant bien les sucs du fond.',
        'Couvre et laisse mijoter trois heures, en y jetant un œil de temps en temps.',
      ]}
    />
  </div>
)
