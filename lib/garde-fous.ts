/**
 * Les interdits de la charte, verifies au moment ou l'on ecrit plutot qu'apres
 * publication (QG 11.1, 11.4).
 *
 * C'est un avertissement, jamais un blocage : la regle a deja connu un ecart
 * assume, et un outil qui refuse d'enregistrer force a contourner l'outil.
 * On signale, l'humain tranche.
 */

export type Alerte = { motif: string; extrait: string }

const VOCABULAIRE_BANNI = [
  'healthy',
  'light',
  'detox',
  'protéiné',
  'proteine',
  'gourmet',
  'gastronomique',
  'revisité',
  'revisite',
  'déconstruit',
  'deconstruit',
  'foodie',
  'food porn',
  'yummy',
]

/** Ce qui laisse entendre une date d'ouverture, sous toutes ses formes. */
const PROMESSES_DE_DATE: { motif: string; expression: RegExp }[] = [
  { motif: 'un « bientôt » qui vaut promesse', expression: /\bbient[oô]t\b/i },
  { motif: 'une date d’ouverture', expression: /\bouvertur\w*[^.!?]{0,40}\b(20\d\d)\b/i },
  { motif: 'une date d’ouverture', expression: /\b(20\d\d)\b[^.!?]{0,40}\bouvr\w*/i },
  {
    motif: 'une saison d’ouverture',
    expression: /\b(ouvre|ouvrira|ouverture)\b[^.!?]{0,30}\b(printemps|[ée]t[ée]|automne|hiver|janvier|f[ée]vrier|mars|avril|mai|juin|juillet|ao[uû]t|septembre|octobre|novembre|d[ée]cembre)\b/i,
  },
  { motif: 'un compte à rebours', expression: /\b(dans|d’ici|d'ici)\s+\w+\s+(jours?|semaines?|mois)\b/i },
]

/** Ce qui decrit le futur lieu au futur : couverts, salle, équipements. */
const DESCRIPTIONS_DU_LIEU: { motif: string; expression: RegExp }[] = [
  { motif: 'un nombre de couverts', expression: /\b\d+\s*couverts?\b/i },
  { motif: 'un élément du futur lieu', expression: /\b(v[ée]randa|chemin[ée]e|terrasse|plan de salle|mezzanine)\b/i },
]

export type Options = {
  /** Les textes du site n'en portent pas ; une légende Instagram, si. */
  emojiInterdits?: boolean
}

/**
 * Le tic a chasser : « X. Y. Z. T. » — quatre bouts secs a la suite.
 *
 * Chaque morceau respecte « phrases courtes » (QG 11.2) et l'ensemble sonne
 * quand meme faux, parce que personne ne parle comme ca a un pote. L'oral
 * avance d'un souffle, avec des liaisons, et la chute tombe a la fin.
 *
 * Le seuil est a quatre, pas a trois : la punchline maison — « C'est pas beau.
 * C'est bon. C'est pas pareil. » — en compte trois et c'est du Chaud Devant,
 * pas du remplissage. On compte par ligne, sinon une conduite de tournage,
 * qui est une suite de lignes courtes par construction, se ferait signaler
 * pour rien.
 */
const HACHE_MINIMUM = 4
const HACHE_LONGUEUR = 30

function phrasesHachees(texte: string): string[] {
  const trouves: string[] = []

  for (const ligne of texte.split('\n')) {
    const bouts = ligne
      .split(/(?<=[.!?])\s+/)
      .map((bout) => bout.trim())
      .filter(Boolean)

    let suite: string[] = []
    for (const bout of [...bouts, '']) {
      if (bout && bout.length <= HACHE_LONGUEUR && /[.!?]$/.test(bout)) {
        suite.push(bout)
        continue
      }
      if (suite.length >= HACHE_MINIMUM) trouves.push(suite.join(' '))
      suite = []
    }
  }

  return trouves
}

export function verifie(texte: string, options: Options = {}): Alerte[] {
  if (!texte.trim()) return []

  const alertes: Alerte[] = []
  const normalise = texte.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  for (const mot of VOCABULAIRE_BANNI) {
    const cible = mot.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    // Bordures de mot : « light » ne doit pas se declencher sur « delight ».
    if (new RegExp(`\\b${cible.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(normalise)) {
      alertes.push({ motif: 'vocabulaire banni', extrait: mot })
    }
  }

  for (const { motif, expression } of [...PROMESSES_DE_DATE, ...DESCRIPTIONS_DU_LIEU]) {
    const trouve = expression.exec(texte)
    if (trouve) alertes.push({ motif, extrait: trouve[0].trim() })
  }

  for (const extrait of phrasesHachees(texte)) {
    alertes.push({ motif: 'phrasé haché — ça se dit, ça ne se récite pas', extrait })
  }

  if (options.emojiInterdits) {
    const emoji = /\p{Extended_Pictographic}/u.exec(texte)
    if (emoji) alertes.push({ motif: 'pas d’emoji dans les textes de site', extrait: emoji[0] })
  }

  // Un même motif peut se déclencher deux fois sur un texte long ; une alerte
  // répétée n'apprend rien de plus à qui relit.
  const vues = new Set<string>()
  return alertes.filter((alerte) => {
    const cle = `${alerte.motif}|${alerte.extrait.toLowerCase()}`
    if (vues.has(cle)) return false
    vues.add(cle)
    return true
  })
}
