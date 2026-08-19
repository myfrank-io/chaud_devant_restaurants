import 'server-only'

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * Acces a l'espace prive : un mot de passe partage, une session signee.
 *
 * Pas de comptes, pas de table utilisateurs : on est deux, et un annuaire
 * d'identites serait plus de surface a garder que de probleme resolu. Le jour
 * ou il faut savoir qui a ecrit quoi, c'est un vrai systeme de comptes qu'il
 * faudra, pas une rustine sur celui-ci.
 *
 * La cle de signature derive du mot de passe lui-meme : une variable
 * d'environnement de moins a poser, et changer le mot de passe deconnecte
 * tout le monde — ce qu'on veut precisement d'un secret partage.
 */

const COOKIE = 'cd_atelier'
const DUREE_SECONDES = 60 * 60 * 24 * 30

export function isAuthConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD)
}

function cleDeSignature(): string | null {
  const motDePasse = process.env.ADMIN_PASSWORD
  if (!motDePasse) return null
  return createHmac('sha256', motDePasse).update('chaud-devant/session/v1').digest('base64url')
}

/**
 * Comparaison a duree constante : une comparaison qui s'arrete au premier
 * caractere different laisse deviner le mot de passe caractere par caractere.
 * On compare des empreintes, de longueur fixe, pour que la longueur elle-meme
 * ne fuite pas non plus.
 */
export function motDePasseValide(saisi: string): boolean {
  const attendu = process.env.ADMIN_PASSWORD
  if (!attendu) return false

  const a = createHmac('sha256', 'comparaison').update(saisi).digest()
  const b = createHmac('sha256', 'comparaison').update(attendu).digest()
  return timingSafeEqual(a, b)
}

function signe(charge: string, cle: string): string {
  return createHmac('sha256', cle).update(charge).digest('base64url')
}

/** Ouvre une session. A n'appeler qu'apres motDePasseValide(). */
export async function ouvreLaSession(): Promise<void> {
  const cle = cleDeSignature()
  if (!cle) throw new Error('ADMIN_PASSWORD absent : impossible d\'ouvrir une session.')

  const expire = Date.now() + DUREE_SECONDES * 1000
  // Un alea par session : deux connexions ne partagent pas le meme jeton, et
  // un jeton vu quelque part n'apprend rien sur les autres.
  const charge = `${expire}.${randomBytes(12).toString('base64url')}`

  const magasin = await cookies()
  magasin.set(COOKIE, `${charge}.${signe(charge, cle)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DUREE_SECONDES,
  })
}

export async function fermeLaSession(): Promise<void> {
  const magasin = await cookies()
  magasin.delete(COOKIE)
}

export async function estConnecte(): Promise<boolean> {
  const cle = cleDeSignature()
  if (!cle) return false

  const jeton = (await cookies()).get(COOKIE)?.value
  if (!jeton) return false

  const separateur = jeton.lastIndexOf('.')
  if (separateur === -1) return false

  const charge = jeton.slice(0, separateur)
  const signature = jeton.slice(separateur + 1)

  const attendue = Buffer.from(signe(charge, cle))
  const recue = Buffer.from(signature)
  if (attendue.length !== recue.length) return false
  if (!timingSafeEqual(attendue, recue)) return false

  const expire = Number(charge.split('.')[0])
  return Number.isFinite(expire) && expire > Date.now()
}
