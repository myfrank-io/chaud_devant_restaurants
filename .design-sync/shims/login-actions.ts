/**
 * Doublure de app/login/actions pour le bundle design-sync : la connexion
 * vit dans l'app. Côté design, soumettre ne fait rien.
 */
import type { LoginState } from '../../lib/login-state'

export async function connexionAction(
  _prev: LoginState,
  _donnees: FormData
): Promise<LoginState> {
  return {}
}
