'use server'

import { redirect } from 'next/navigation'

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
  const city = String(formData.get('city') ?? '').trim()
  const trap = String(formData.get('site-web') ?? '').trim()

  // Champ piege, invisible pour un humain : un robot le remplit, on l'ignore
  // sans le lui dire.
  if (trap) redirect('/merci?envoye=1')

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return { error: "Cette adresse n’a pas l’air d’en être une. Revérifie." }
  }
  if (city.length < 2) {
    return { error: "Il nous faut ta ville. C’est elle qui nous dira où ouvrir." }
  }
  if (city.length > 80) {
    return { error: 'Ce nom de ville est un peu long pour être vrai.' }
  }

  let outcome: { alreadyConfirmed: true } | { alreadyConfirmed: false; sent: boolean }

  try {
    const created = await createSubscriber({ email, city })

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
    return { error: "On n’a pas réussi à t’inscrire. Réessaie dans un instant." }
  }

  // Hors du try : redirect() leve une exception de controle que le catch
  // avalerait en la prenant pour une panne.
  if (outcome.alreadyConfirmed) redirect('/merci?connu=1')
  redirect(`/merci?envoye=${outcome.sent ? '1' : '0'}`)
}
