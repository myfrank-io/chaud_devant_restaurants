'use server'

import { redirect } from 'next/navigation'

import { isAuthConfigured, motDePasseValide, ouvreLaSession } from '@/lib/auth'
import type { LoginState } from '@/lib/login-state'

export async function connexionAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  if (!isAuthConfigured()) {
    return { error: 'ADMIN_PASSWORD n’est pas configuré. L’atelier est fermé.' }
  }

  const saisi = String(formData.get('mot-de-passe') ?? '')

  if (!motDePasseValide(saisi)) {
    // Une pause sur l'echec : sans elle, l'absence de limite de tentatives
    // laisse essayer aussi vite que le reseau le permet. Ce n'est pas une
    // vraie limitation de debit — il en faudra une le jour ou l'atelier
    // devient une cible — mais ca change l'ordre de grandeur.
    await new Promise((resoud) => setTimeout(resoud, 700))
    return { error: 'Ce n’est pas le bon mot de passe.' }
  }

  await ouvreLaSession()
  // Hors du bloc precedent : redirect() leve une exception de controle.
  redirect('/atelier')
}
