import type { RecetteImportee } from '@/lib/lien'

/**
 * D'une recette importee vers un brouillon de post.
 *
 * Aucun modele n'est appele : ce qui suit est de la mise en forme, pas de
 * l'ecriture. On part de ce que la page publiait — le temps, le nombre
 * d'ingredients, l'ordre des etapes — et on en fait un hook, une conduite de
 * plans et une legende, dans le ton de la maison.
 *
 * Ca ne remplace pas d'ecrire. Ca remplace la page blanche, qui est le vrai
 * cout : relire et corriger trois champs deja remplis prend deux minutes,
 * les inventer en prend vingt.
 *
 * Deux precautions tiennent tout le fichier :
 *
 * — Rien n'est promis. Aucun gabarit ne parle d'ouverture, de date, de ville
 *   ni du lieu (QG 11.1). Le vocabulaire banni n'y figure pas non plus, et
 *   `lib/garde-fous.ts` relit par-dessus a l'ecran.
 *
 * — Rien n'est invente. Un gabarit qui a besoin d'un chiffre absent n'est pas
 *   choisi ; a defaut de tout, on rend le champ vide plutot qu'une phrase qui
 *   sonne bien et ne dit rien.
 *
 * La legende ne reprend aucune phrase du site d'origine : elle se construit
 * sur des faits (titre, comptes, durees). La conduite, elle, suit les etapes
 * de la source — c'est un document de travail, et l'ecran le dit.
 */

export type Brouillon = {
  hook: string
  script: string
  caption: string
}

export function brouillonDePost(recette: RecetteImportee): Brouillon {
  const plat = sansArticle(recette.titre)
  const dose = tire(recette.titre)

  return {
    hook: hook(recette, dose),
    script: script(recette),
    caption: caption(recette, plat, dose),
  }
}

/* ------------------------------------------------------------------ hook --- */

/**
 * Les trois premieres secondes. Ce qui empeche de scroller.
 *
 * On prend le fait le plus fort dont on dispose, dans cet ordre : une cuisson
 * longue, une liste d'ingredients courte, un nombre d'etapes ridicule. Aucun
 * de ces trois — on ne bluffe pas, on rend une amorce neutre a reecrire.
 */
function hook(recette: RecetteImportee, dose: number): string {
  const { minutes, ingredients, etapes } = recette

  if (minutes !== null && minutes >= 120) {
    return choisit(dose, [
      `${duree(minutes)} de cuisson. Tu n’y touches pas une seule fois.`,
      `${duree(minutes)}. C’est le feu qui bosse, pas toi.`,
      `Le secret, c’est le temps : ${duree(minutes)}, et rien d’autre.`,
    ])
  }

  if (ingredients.length > 0 && ingredients.length <= 6) {
    return choisit(dose, [
      `${ingredients.length} ingrédients. Pas un de plus.`,
      `Regarde bien : ${ingredients.length} ingrédients, et c’est tout.`,
    ])
  }

  if (etapes.length > 0 && etapes.length <= 4) {
    return choisit(dose, [
      `${etapes.length} étapes. Tu peux pas te louper.`,
      `${etapes.length} étapes, et c’est sur la table.`,
    ])
  }

  if (minutes !== null && minutes <= 30) {
    return `${duree(minutes)}, montre en main.`
  }

  return 'À écrire : les trois secondes qui empêchent de scroller.'
}

/* ---------------------------------------------------------------- script --- */

const PLANS_MAX = 6

/**
 * Ce qui se dit et ce qui se montre, dans l'ordre.
 *
 * Les etapes de la recette deviennent des plans : c'est la conversion la plus
 * utile qu'on puisse faire sans ecrire a la place de quelqu'un. Une etape par
 * plan, raccourcie a sa premiere phrase — une conduite se lit d'un coup d'oeil
 * pendant qu'on tourne, pas comme un livre.
 */
function script(recette: RecetteImportee): string {
  const etapes = recette.etapes.slice(0, PLANS_MAX).map(premierePhrase).filter(Boolean)

  if (etapes.length === 0) {
    return 'À écrire : la conduite, plan par plan.'
  }

  const restantes = recette.etapes.length - etapes.length
  const plans = etapes.map((etape, index) => `Plan ${index + 1} — ${etape}`)

  if (restantes > 0) {
    plans.push(`(${restantes} étape${restantes > 1 ? 's' : ''} de plus dans la fiche recette.)`)
  }

  plans.push('Dernier plan — le plat servi. Gros plan, et personne ne parle.')

  return [
    'À l’image, dans l’ordre :',
    '',
    ...plans,
    '',
    'Ces plans reprennent les étapes du site d’origine. Redis-les avec tes mots avant de tourner.',
  ].join('\n')
}

/* --------------------------------------------------------------- legende --- */

/**
 * La legende telle qu'elle sera publiee.
 *
 * Construite sur des faits, jamais sur les phrases du site d'origine : ce
 * texte-la part en public, et il n'appartient pas a la maison.
 *
 * Aucun article ne precede le nom du plat, nulle part dans ce fichier : le
 * genre d'un nom francais ne se devine pas d'apres ses lettres, et « le
 * tarte » se voit tout de suite.
 */
function caption(recette: RecetteImportee, plat: string, dose: number): string {
  const { minutes, ingredients } = recette

  // « Bœuf bourguignon de mémé, comme chez mémé » : la tournure ne se pose pas
  // sur un titre qui dit deja d'ou vient le plat.
  const ouvertures = [`${majuscule(plat)}.`]
  // Pas de \b : une lettre accentuee n'est pas un caractere de mot pour une
  // expression reguliere, et « mémé » n'aurait pas de frontiere a sa droite.
  if (!/(m[ée]m[ée]|mamie|grand[- ]m[èe]re)/i.test(plat)) {
    ouvertures.push(`${majuscule(plat)}, comme chez mémé.`)
  }

  const ouverture = choisit(dose, ouvertures)

  const faits: string[] = []
  if (ingredients.length > 0) faits.push(`${ingredients.length} ingrédients`)
  if (minutes !== null) faits.push(`${duree(minutes)} de cuisson`)

  return [
    ouverture,
    faits.length ? `${majuscule(faits.join(', '))}.` : null,
    '',
    'La recette entière est sur le site, lien en bio.',
  ]
    .filter((ligne) => ligne !== null)
    .join('\n')
}

/* ------------------------------------------------------------------ outils --- */

/** « 3 h », « 1 h 30 », « 45 min ». */
function duree(minutes: number): string {
  if (minutes < 60) return `${minutes} min`
  const heures = Math.floor(minutes / 60)
  const reste = minutes % 60
  return reste === 0 ? `${heures} h` : `${heures} h ${reste}`
}

/**
 * Un gabarit stable pour une recette donnee.
 *
 * Le meme plat rend toujours le meme brouillon — on peut rouvrir un lien sans
 * que tout change sous les doigts — mais deux plats differents ne tombent pas
 * sur la meme tournure, ce qui rendrait la serie mecanique a l'oeil.
 */
function tire(graine: string): number {
  let somme = 0
  for (const caractere of graine) somme = (somme * 31 + caractere.codePointAt(0)!) % 100_003
  return somme
}

function choisit<T>(dose: number, options: T[]): T {
  return options[dose % options.length]
}

/** « Le bœuf bourguignon de mémé » → « bœuf bourguignon de mémé ». */
function sansArticle(titre: string): string {
  const propre = titre.trim().replace(/\s+/g, ' ')
  const sans = propre.replace(/^(le |la |les |l’|l'|un |une |des )/i, '')
  return sans ? minuscule(sans) : propre
}

function premierePhrase(etape: string): string {
  const propre = etape.replace(/\s+/g, ' ').trim()
  const coupe = /^(.+?[.!?])\s/.exec(propre)
  const phrase = coupe ? coupe[1] : propre
  return phrase.length > 110 ? `${phrase.slice(0, 107).trimEnd()}…` : phrase
}

function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}

function minuscule(texte: string): string {
  // Un sigle garde ses capitales ; tout le reste passe en bas de casse, parce
  // qu'un titre de plat arrive capitalise et se retrouve en milieu de phrase.
  if (/^\p{Lu}\p{Lu}/u.test(texte)) return texte
  return texte.charAt(0).toLocaleLowerCase('fr') + texte.slice(1)
}
