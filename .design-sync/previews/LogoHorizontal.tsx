import { LogoHorizontal } from 'chaud-devant'

/** Le format bandeau : en-tête, carte de visite, signature de mail. */
export const Bandeau = () => (
  <div className="papier p-10">
    <LogoHorizontal className="mx-auto w-96 text-rouge" />
  </div>
)

/** Sur un bloc sombre, la même déclinaison passe en crème. */
export const SurFonte = () => (
  <div className="fonte-chaude p-10">
    <LogoHorizontal className="mx-auto w-96 text-creme" />
  </div>
)
