import { Tampon } from 'chaud-devant'

/** Le coup de tampon du carnet de commandes, encre rouge, léger dévers voulu. */
export const Encre = () => (
  <div className="papier p-10">
    <Tampon className="mx-auto w-64 text-rouge" />
  </div>
)

/** À l'encre fonte, pour les supports où le rouge serait de trop. */
export const Fonte = () => (
  <div className="papier p-10">
    <Tampon className="mx-auto w-64 text-fonte" />
  </div>
)
