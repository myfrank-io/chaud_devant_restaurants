import { ChampRelu } from 'chaud-devant'

/** Un texte qui passe la relecture : rien à signaler, le champ reste calme. */
export const Sage = () => (
  <div className="papier p-8">
    <div className="mx-auto max-w-xl">
      <ChampRelu
        nom="hook"
        libelle="Le hook"
        aide="Les trois premières secondes. Ce qui empêche de scroller."
        valeurInitiale="J’ai compté trois fois parce que j’y croyais pas, mais ouais, 6 ingrédients et c’est tout."
        lignes={2}
      />
    </div>
  </div>
)

/** Un texte qui trébuche sur la charte : la liste d'alertes s'affiche en rouge. */
export const Alerte = () => (
  <div className="papier p-8">
    <div className="mx-auto max-w-xl">
      <ChampRelu
        nom="angle"
        libelle="L’angle"
        aide="Une phrase : ce que cette recette a de particulier. Sert aussi de description dans Google."
        valeurInitiale="Notre bœuf bourguignon gastronomique, digne d’une table gourmet."
        lignes={2}
        emojiInterdits
      />
    </div>
  </div>
)
