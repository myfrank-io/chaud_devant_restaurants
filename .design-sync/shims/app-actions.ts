/**
 * Doublure de app/actions pour le bundle design-sync : pas de base ni
 * d'emails côté design. Une soumission montre l'état « envoyé » — l'écran
 * que voit réellement un inscrit dans l'app.
 */
import type { SubscribeState } from '../../lib/subscribe-state'

export async function subscribeAction(
  _prev: SubscribeState,
  _donnees: FormData
): Promise<SubscribeState> {
  return { error: null, issue: 'envoye' }
}
