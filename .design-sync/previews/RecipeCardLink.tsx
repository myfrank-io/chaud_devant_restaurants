import { RecipeCardLink } from 'chaud-devant'

/* Cartes de démonstration : cover à null pour que le vichy et l'emblème
   prennent la place de la photo — pas d'image réseau dans les previews. */
const BOEUF_CAROTTES = {
  id: '1',
  slug: 'boeuf-carottes-du-dimanche',
  title: 'Bœuf-carottes du dimanche',
  category: 'Plat',
  seasons: ['automne', 'hiver'],
  minutes: 180,
  prepMinutes: 25,
  difficulty: 'facile',
  angle: 'Trois heures de cocotte, et la maison sent le dimanche.',
  cover: null,
  postUrl: null,
  intro: ['Celui qui mijote pendant que tout le monde traîne à table.'],
  ingredients: ['paleron', 'carottes', 'oignons', 'bouquet garni', 'vin rouge'],
  steps: ['Saisir la viande dans la cocotte.', 'Ajouter les carottes et mouiller.', 'Laisser mijoter trois heures à couvert.'],
  publishedAt: null,
}

const GRATIN = {
  id: '2',
  slug: 'gratin-dauphinois-de-grand-mere',
  title: 'Gratin dauphinois comme chez ma grand-mère',
  category: 'Accompagnement',
  seasons: ['hiver'],
  minutes: 75,
  prepMinutes: 20,
  difficulty: 'facile',
  angle: 'Le plat qu’on gratte jusqu’au coin du plat, et pas par politesse.',
  cover: null,
  postUrl: null,
  intro: ['Pas de fromage dessus, et c’est voulu : la crème fait tout le travail.'],
  ingredients: ['pommes de terre', 'crème', 'lait entier', 'ail', 'muscade'],
  steps: ['Frotter le plat à l’ail.', 'Monter les couches de pommes de terre.', 'Enfourner et attendre que ça gratine.'],
  publishedAt: null,
}

const RIZ_AU_LAIT = {
  id: '3',
  slug: 'riz-au-lait-a-la-vanille',
  title: 'Riz au lait à la vanille, comme à la cantine en mieux',
  category: 'Dessert',
  seasons: ['hiver', 'printemps'],
  minutes: 45,
  prepMinutes: 5,
  difficulty: 'facile',
  angle: 'Le dessert régressif qui se mange encore tiède, debout dans la cuisine.',
  cover: null,
  postUrl: null,
  intro: ['Du riz rond, du lait entier, et le courage de remuer sans s’arrêter.'],
  ingredients: ['riz rond', 'lait entier', 'gousse de vanille', 'sucre'],
  steps: ['Blanchir le riz.', 'Cuire doucement dans le lait vanillé en remuant.', 'Laisser reposer avant de servir.'],
  publishedAt: null,
}

/** La carte seule, telle qu'elle se répète sur la home et le hub. */
export const Carte = () => (
  <div className="papier p-8">
    <div className="mx-auto max-w-xs">
      <RecipeCardLink recipe={BOEUF_CAROTTES} />
    </div>
  </div>
)

/** La composition réelle : une grille de cartes en ul/li, comme sur la home. */
export const DansUneGrille = () => (
  <div className="papier p-8">
    <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <li>
        <RecipeCardLink recipe={BOEUF_CAROTTES} />
      </li>
      <li>
        <RecipeCardLink recipe={GRATIN} />
      </li>
      <li>
        <RecipeCardLink recipe={RIZ_AU_LAIT} />
      </li>
    </ul>
  </div>
)
