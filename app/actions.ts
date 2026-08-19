'use server'

import { sendConfirmationEmail } from '@/lib/email'
import type { SubscribeState } from '@/lib/subscribe-state'
import { createSubscriber } from '@/lib/subscribers'

// Volontairement permissif : on refuse ce qui ne peut pas etre une adresse,
// c'est le double opt-in qui tranche pour de bon.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export async function subscribeAction(
  _prev: SubscribeState,
  formData: FormData
): Promise<SubscribeState> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const marketingOptIn = formData.get('nouvelles') === '1'
  const trap = String(formData.get('site-web') ?? '').trim()

  // Champ piege, invisible pour un humain : un robot le remplit, on lui rend
  // l'ecran d'un succes sans rien ecrire. Le dire reviendrait a lui apprendre
  // ou est le piege.
  if (trap) return { error: null, issue: 'envoye' }

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { error: "Cette adresse n’a pas l’air d’en être une. Revérifie.", issue: null }
  }

  let outcome: { alreadyConfirmed: true } | { alreadyConfirmed: false; sent: boolean }

  try {
    const created = await createSubscriber({ email, marketingOptIn })

    if (created.status === 'already_confirmed') {
      outcome = { alreadyConfirmed: true }
    } else {
      const sent = await sendConfirmationEmail({
        email,
        confirmToken: created.confirmToken,
        unsubscribeToken: created.unsubscribeToken,
      })
      outcome = { alreadyConfirmed: false, sent }
    }
  } catch (error) {
    console.error('[subscribe] inscription impossible', error)
    return { error: "On n’a pas réussi à t’inscrire. Réessaie dans un instant.", issue: null }
  }

  if (outcome.alreadyConfirmed) return { error: null, issue: 'connu' }
  return { error: null, issue: outcome.sent ? 'envoye' : 'sans-mail' }
}
