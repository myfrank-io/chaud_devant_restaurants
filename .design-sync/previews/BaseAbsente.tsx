import { BaseAbsente } from 'chaud-devant'

/** L'écran que montre tout l'atelier quand DATABASE_URL n'est pas branché. */
export const SansBase = () => (
  <div className="papier p-8">
    <BaseAbsente />
  </div>
)
