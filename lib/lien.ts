import 'server-only'

import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

/**
 * Importer une recette depuis un lien, sans modele et sans un centime.
 *
 * Presque tous les sites de cuisine publient un balisage `Recipe` schema.org
 * dans leur page — le meme que celui qu'on emet nous-memes. Il porte le titre,
 * les ingredients, les etapes et les durees, deja separes. Le lire coute une
 * requete HTTP et rend des donnees exactes, la ou un modele rendrait une
 * approximation payante.
 *
 * Quand le balisage manque, on le dit et on n'invente rien.
 */

const TAILLE_MAX = 2_000_000
const DELAI_MS = 10_000

export type RecetteImportee = {
  titre: string
  angle: string | null
  minutes: number | null
  categorie: string | null
  ingredients: string[]
  etapes: string[]
  photo: string | null
  source: string
}

export async function importeDepuisUnLien(brut: string): Promise<RecetteImportee> {
  const url = await adresseSure(brut)
  const html = await recupere(url)
  const recette = trouveLeBalisage(html)

  if (!recette) {
    throw new Error(
      'Cette page ne publie pas de recette lisible. Copie le texte à la main, ou essaie un autre lien.'
    )
  }

  return { ...recette, source: url.toString() }
}

/* ----------------------------------------------------------- securite --- */

/**
 * Le lien est saisi par nous, dans un espace ferme — mais c'est le serveur qui
 * va le chercher, avec la vue reseau du serveur. Sans ces controles, un lien
 * vers une adresse interne ferait de notre application un relais pour lire ce
 * qu'elle seule peut atteindre.
 */
async function adresseSure(brut: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(brut.trim())
  } catch {
    throw new Error('Ce n’est pas une adresse valide.')
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('Seules les adresses http et https sont acceptées.')
  }

  const adresse = isIP(url.hostname)
    ? url.hostname
    : (await lookup(url.hostname).catch(() => null))?.address

  if (!adresse) throw new Error('Ce nom de domaine ne répond pas.')
  if (estPrivee(adresse)) throw new Error('Cette adresse pointe vers un réseau interne.')

  return url
}

/** Boucle locale, reseaux prives, lien-local, et leurs equivalents IPv6. */
function estPrivee(adresse: string): boolean {
  if (adresse.includes(':')) {
    const bas = adresse.toLowerCase()
    return (
      bas === '::1' ||
      bas.startsWith('fc') ||
      bas.startsWith('fd') ||
      bas.startsWith('fe80') ||
      bas.startsWith('::ffff:127.') ||
      bas.startsWith('::ffff:10.') ||
      bas.startsWith('::ffff:192.168.')
    )
  }

  const [a, b] = adresse.split('.').map(Number)
  return (
    a === 0 ||
    a === 127 ||
    a === 10 ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 169 && b === 254) ||
    (a === 100 && b >= 64 && b <= 127)
  )
}

async function recupere(url: URL): Promise<string> {
  const arret = AbortSignal.timeout(DELAI_MS)
  const reponse = await fetch(url, {
    signal: arret,
    // Une redirection peut mener ailleurs que ce qu'on a verifie ; on la suit
    // quand meme, mais l'appelant ne recupere que du texte, jamais l'acces.
    redirect: 'follow',
    headers: { 'user-agent': 'ChaudDevant/1.0 (+lecture de recette)' },
  }).catch(() => null)

  if (!reponse?.ok) throw new Error('La page n’a pas répondu.')

  const type = reponse.headers.get('content-type') ?? ''
  if (!type.includes('html')) throw new Error('Ce lien ne mène pas à une page web.')

  const texte = await reponse.text()
  return texte.slice(0, TAILLE_MAX)
}

/* ---------------------------------------------------------- balisage --- */

type Noeud = Record<string, unknown>

function trouveLeBalisage(html: string): Omit<RecetteImportee, 'source'> | null {
  for (const bloc of html.matchAll(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    let donnees: unknown
    try {
      donnees = JSON.parse(bloc[1].trim())
    } catch {
      continue
    }

    const recette = chercheLaRecette(donnees)
    if (recette) return lis(recette)
  }
  return null
}

/** Le balisage se cache souvent dans un @graph ou un tableau. On descend. */
function chercheLaRecette(valeur: unknown, profondeur = 0): Noeud | null {
  if (profondeur > 6 || valeur === null || typeof valeur !== 'object') return null

  if (Array.isArray(valeur)) {
    for (const element of valeur) {
      const trouve = chercheLaRecette(element, profondeur + 1)
      if (trouve) return trouve
    }
    return null
  }

  const noeud = valeur as Noeud
  const type = noeud['@type']
  const types = Array.isArray(type) ? type : [type]
  if (types.some((t) => typeof t === 'string' && t.toLowerCase() === 'recipe')) return noeud

  for (const enfant of Object.values(noeud)) {
    const trouve = chercheLaRecette(enfant, profondeur + 1)
    if (trouve) return trouve
  }
  return null
}

function lis(noeud: Noeud): Omit<RecetteImportee, 'source'> {
  return {
    titre: texte(noeud.name) ?? 'Recette sans titre',
    angle: texte(noeud.description),
    minutes: minutes(noeud.totalTime ?? noeud.cookTime),
    categorie: texte(premier(noeud.recipeCategory)),
    ingredients: liste(noeud.recipeIngredient),
    etapes: etapes(noeud.recipeInstructions),
    photo: photo(noeud.image),
  }
}

function texte(valeur: unknown): string | null {
  if (typeof valeur === 'string') {
    const propre = valeur.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
    return propre || null
  }
  return null
}

function premier(valeur: unknown): unknown {
  return Array.isArray(valeur) ? valeur[0] : valeur
}

function liste(valeur: unknown): string[] {
  if (typeof valeur === 'string') return [texte(valeur)].filter((v): v is string => v !== null)
  if (!Array.isArray(valeur)) return []
  return valeur.map((element) => texte(element)).filter((v): v is string => v !== null)
}

/** Les etapes arrivent en texte, en HowToStep, ou groupees en HowToSection. */
function etapes(valeur: unknown, profondeur = 0): string[] {
  if (profondeur > 3) return []
  if (typeof valeur === 'string') return liste(valeur)
  if (Array.isArray(valeur)) return valeur.flatMap((element) => etapes(element, profondeur + 1))

  if (valeur !== null && typeof valeur === 'object') {
    const noeud = valeur as Noeud
    if (noeud.itemListElement) return etapes(noeud.itemListElement, profondeur + 1)
    const seule = texte(noeud.text) ?? texte(noeud.name)
    return seule ? [seule] : []
  }
  return []
}

/** Une duree ISO 8601 — « PT1H30M » — vers des minutes. */
function minutes(valeur: unknown): number | null {
  const brut = texte(premier(valeur))
  if (!brut) return null

  const trouve = /^P(?:\d+D)?T?(?:(\d+)H)?(?:(\d+)M)?/.exec(brut)
  if (!trouve) return null

  const total = Number(trouve[1] ?? 0) * 60 + Number(trouve[2] ?? 0)
  return total > 0 ? total : null
}

function photo(valeur: unknown): string | null {
  const candidat = premier(valeur)
  if (typeof candidat === 'string') return candidat
  if (candidat !== null && typeof candidat === 'object') {
    return texte((candidat as Noeud).url)
  }
  return null
}
