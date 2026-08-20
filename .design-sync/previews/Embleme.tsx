import { Embleme } from 'chaud-devant'

/** La cocotte seule, encre rouge sur papier : l'ornement par défaut. */
export const Rouge = () => (
  <div className="papier p-10">
    <Embleme className="mx-auto w-40 text-rouge" title="Chaud Devant" />
  </div>
)

/** Avec la classe embleme-vivant, la vapeur s'échappe du côté levé du couvercle. */
export const Vivant = () => (
  <div className="papier p-10">
    <div className="embleme-vivant">
      <Embleme className="mx-auto w-40 text-rouge" title="Chaud Devant" />
    </div>
  </div>
)

/** Sur les fonds sombres, l'emblème passe en crème — même dessin, autre encre. */
export const SurFonte = () => (
  <div className="fonte-chaude p-10">
    <Embleme className="mx-auto w-40 text-creme" title="Chaud Devant" />
  </div>
)
