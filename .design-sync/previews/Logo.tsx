import { Logo } from 'chaud-devant'

/** L'encre de la maison sur le papier : l'emploi par défaut, celui du hero. */
export const Rouge = () => (
  <div className="papier p-10">
    <Logo className="mx-auto w-56 text-rouge" />
  </div>
)

/** Sur les blocs sombres (pied de page, encarts), le logo passe en crème. */
export const SurFonte = () => (
  <div className="fonte-chaude p-10">
    <Logo className="mx-auto w-56 text-creme" />
  </div>
)

/** La mention « RESTAURANTS SINCE 2026 », pour les supports hors site. */
export const MentionRestaurants = () => (
  <div className="papier p-10">
    <Logo className="mx-auto w-56 text-fonte" mention="restaurants" />
  </div>
)
