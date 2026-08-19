import type { RecetteImportee } from '@/lib/lien'

/**
 * D'une recette importee vers un brouillon de post, dans la voix de la maison.
 *
 * Aucun modele n'est appele : ce qui suit est de la mise en forme, pas de
 * l'ecriture. On part de ce que la page publiait — le temps, le nombre
 * d'ingredients, l'ordre des etapes — et on en fait un hook, une conduite et
 * une legende.
 *
 * Ca ne remplace pas d'ecrire. Ca remplace la page blanche, qui est le vrai
 * cout : relire et corriger trois champs deja remplis prend deux minutes,
 * les inventer en prend vingt.
 *
 * Tout ce fichier suit la bible editoriale (QG 4.2, 4.3, 4.5) :
 *
 * — On raconte, on ne dicte pas. Tutoiement, phrases courtes.
 * — La vanne porte sur soi, sur le plat ou sur la situation. **Jamais sur le
 *   spectateur** : c'est la regle 4, et c'est la seule ligne que ce fichier ne
 *   franchit sous aucun pretexte. « Tu peux pas te louper » vise le lecteur ;
 *   « je me suis loupe quand meme » vise celui qui parle.
 * — La conduite reprend l'anatomie du Reel : hook, promesse, etapes serrees,
 *   « chaud devant » a la table, punchline, plan fixe muet.
 * — La legende porte la recette en texte et se termine par une question
 *   fermee, qui fait commenter la ou une question ouverte ne fait rien.
 *
 * Deux precautions, en plus :
 *
 * — Rien n'est promis. Aucun gabarit ne parle d'ouverture, de date, de ville
 *   ni du lieu (QG 11.1). Le vocabulaire banni n'y figure pas, et
 *   `lib/garde-fous.ts` relit par-dessus a l'ecran.
 *
 * — Rien n'est invente. Un gabarit qui a besoin d'un chiffre absent n'est pas
 *   propose ; sans aucun chiffre, le champ dit ce qu'il reste a ecrire plutot
 *   que d'affirmer quelque chose qu'on ne sait pas.
 *
 * Aucun article ne precede le nom du plat, nulle part : le genre d'un nom
 * francais ne se devine pas d'apres ses lettres, et « le tarte » se voit tout
 * de suite.
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
    script: script(recette, dose),
    caption: caption(recette, plat, dose),
  }
}

/* ------------------------------------------------------------------ hook --- */

/**
 * Les trois premieres secondes. Une phrase, pas deux (QG 4.3).
 *
 * On rassemble tous les gabarits dont les conditions sont remplies, puis on en
 * tire un. Les combinaisons passent devant : « 3 h de cuisson. 4 ingredients.
 * Zero technique. » dit plus que chacune de ses moities.
 *
 * Aucun chiffre disponible — aucun gabarit ne se declenche : le champ dit ce
 * qu'il reste a ecrire. Un hook est une affirmation, et on n'affirme pas a la
 * place de quelqu'un qui n'a pas les faits.
 */
function hook(recette: RecetteImportee, dose: number): string {
  const { minutes, ingredients, etapes } = recette
  const combles = ingredients.length
  const gestes = etapes.length

  const candidats: string[] = []

  // Le mijote : la duree est le sujet, et on l'assume au lieu de s'en excuser.
  if (minutes !== null && minutes >= 120) {
    // La combinaison dit plus que chacune de ses moities. Elle reste un
    // gabarit parmi les autres : le pilier heros a toujours cette forme —
    // cuisson longue, liste courte — et le mettre devant en ferait le meme
    // hook toutes les semaines.
    if (combles > 0 && combles <= 6) {
      candidats.push(
        `${duree(minutes)} de cuisson. ${combles} ingrédients. Zéro technique.`,
        `${combles} ingrédients, ${duree(minutes)}, une cocotte. Fin de la liste.`
      )
    }
    candidats.push(
      `On part sur un truc simple. Enfin, simple : ${duree(minutes)} de cuisson. Mais simple.`,
      `${duree(minutes)} de cuisson. Tu fais quoi pendant ce temps-là ? Rien. C’est ça le luxe.`,
      `${duree(minutes)}. Non, il n’y a pas de version rapide. J’ai cherché pour toi.`,
      `Ta grand-mère faisait ça sans thermomètre et sans minuteur. Nous, il nous faut ${duree(minutes)}.`
    )
  }

  if (combles > 0 && combles <= 6) {
    candidats.push(
      `${combles} ingrédients. Compte-les. Il y en a ${combles}. C’est tout.`,
      `${combles} ingrédients, et ça met la moitié des restos d’accord. Je pèse mes mots.`
    )
  }

  // Une liste a rallonge se revendique : c'est le pilier « combos », pas une
  // excuse a presenter.
  if (combles >= 12) {
    candidats.push(
      `${combles} ingrédients. Oui, ça fait beaucoup. Non, on n’en enlève aucun.`,
      `${combles} ingrédients. On a essayé d’en virer. On a arrêté d’essayer.`
    )
  }

  if (gestes > 0 && gestes <= 4) {
    candidats.push(`${gestes} étapes. Je me suis quand même loupé la première fois.`)
    // « Une étape qui consiste à ne rien faire » : vrai quand il y a une
    // attente, faux sur une omelette. On ne le propose que s'il y a de quoi
    // attendre.
    if (minutes !== null && minutes >= 60) {
      candidats.push(`${gestes} étapes, dont une où tu ne fais rien. C’est ma préférée.`)
    }
  }

  if (minutes !== null && minutes <= 30) {
    candidats.push(
      `${duree(minutes)}. Le temps de mettre la table.`,
      `${duree(minutes)} montre en main. La livraison met plus longtemps.`
    )
  }

  return candidats.length
    ? choisit(dose, candidats)
    : 'À écrire : la phrase qui empêche de scroller. Une seule, pas deux.'
}

/* ---------------------------------------------------------------- script --- */

const PLANS_MAX = 6

/**
 * Ce qui se dit et ce qui se montre, dans l'ordre.
 *
 * La trame est celle du QG 4.3, minutage compris : c'est elle qu'on suit a
 * chaque fois, et l'avoir sous les yeux pendant qu'on tourne evite de la
 * redecouvrir au montage. Les etapes de la recette deviennent des plans,
 * raccourcies a leur premiere phrase — une conduite se lit d'un coup d'oeil.
 */
function script(recette: RecetteImportee, dose: number): string {
  const plans = recette.etapes.slice(0, PLANS_MAX).map(premierePhrase).filter(Boolean)
  const restantes = recette.etapes.length - plans.length

  const etapes = plans.length
    ? [
        ...plans.map((etape, index) => `  Plan ${index + 1} — ${etape}`),
        restantes > 0
          ? `  (+ ${restantes} étape${restantes > 1 ? 's' : ''}, dans la fiche recette.)`
          : null,
        '  → Une vanne toutes les 8-10 s. Les quantités à l’écran, pas dans la voix.',
        '  → Les étapes viennent du site d’origine. Redis-les avec tes mots.',
      ].filter((ligne) => ligne !== null)
    : ['  À écrire : les étapes, un plan chacune, jamais plus de 3 s.']

  return [
    '0-3 s — Le plat fini. On soulève le couvercle, la vapeur monte.',
    '  → Le hook, celui d’au-dessus. Une phrase.',
    '',
    '3-10 s — Retour au début. Les ingrédients posés sur le bois.',
    '  → La promesse : ce qu’on va manger, et pourquoi ça vaut le coup.',
    '',
    '10-45 s — Les étapes, coupées serré.',
    ...etapes,
    '',
    '45-60 s — La cocotte sur la table. Les mains qui se servent.',
    `  → « Chaud devant. » Puis : ${punchline(dose)}`,
    '',
    'Fin — Plan fixe du plat, 1,5 s. Silence. C’est là que ça reboucle.',
  ].join('\n')
}

/** La phrase de fin, celle qui declenche le commentaire (QG 4.2, regle 7). */
function punchline(dose: number): string {
  return choisit(dose, [
    '« Si tu mets pas ton pain dans la sauce, on n’a rien à se dire. »',
    '« C’est pas beau. C’est bon. C’est pas pareil. »',
    '« Là normalement il faut attendre. Personne n’attend. Moi non plus. »',
    '« Ta grand-mère faisait ça sans Instagram. Respect. »',
  ])
}

/* --------------------------------------------------------------- legende --- */

/**
 * La legende telle qu'elle sera publiee.
 *
 * Elle porte la recette en texte : ca fait rester sur le post, ca declenche
 * l'enregistrement, et ca se recycle sur le site (QG 4.5). Elle se termine par
 * une question fermee — « team X ou team Y » fait commenter la ou « qu'en
 * pensez-vous » ne fait rien.
 *
 * Les quantites sont des faits et se reprennent telles quelles. Les etapes, en
 * revanche, sont le texte de quelqu'un d'autre : elles arrivent raccourcies, et
 * l'ecran rappelle de les reecrire avant publication.
 */
function caption(recette: RecetteImportee, plat: string, dose: number): string {
  const { minutes, ingredients, etapes } = recette

  const faits: string[] = []
  if (ingredients.length > 0) faits.push(`${ingredients.length} ingrédients`)
  if (minutes !== null) faits.push(`${duree(minutes)} de cuisson`)

  const morceaux: (string | null)[] = [
    `${majuscule(plat)}.`,
    faits.length ? `${majuscule(faits.join(', '))}.` : null,
  ]

  if (ingredients.length > 0) {
    morceaux.push('', 'CE QU’IL TE FAUT', ...ingredients.map((ligne) => `— ${ligne}`))
  }

  if (etapes.length > 0) {
    morceaux.push(
      '',
      'ON Y VA',
      ...etapes.map((etape, index) => `${index + 1}. ${premierePhrase(etape)}`)
    )
  }

  morceaux.push('', question(dose), '', hashtags(recette))

  return morceaux.filter((ligne) => ligne !== null).join('\n')
}

/** Fermee, toujours : c'est ce qui fait descendre en commentaires. */
function question(dose: number): string {
  return choisit(dose, [
    'Team pain dans la sauce, ou team assiette qui brille ?',
    'Fonte ou inox ? Réponds, c’est important.',
    'Tu le fais comme ça toi, ou pas du tout comme ça ?',
    'Le lendemain c’est meilleur : vrai ou faux ?',
  ])
}

/** Cinq a huit, moitie larges moitie precis (QG 4.5). */
function hashtags(recette: RecetteImportee): string {
  const larges = ['#cuisinemaison', '#recettefacile', '#cocotte', '#faitmaison']
  const precis = [motDiese(recette.categorie), motDiese(motPorteur(recette.titre))].filter(
    (mot): mot is string => mot !== null
  )
  return [...larges, ...new Set(precis)].join(' ')
}

/**
 * Le mot du titre qui porte le plat.
 *
 * « Bœuf bourguignon de mémé » donne « bourguignon », pas
 * « bufbourguignondememe » : un mot-diese sert a etre cherche, et personne ne
 * cherche un titre entier colle. On prend le mot le plus long une fois les
 * outils grammaticaux ecartes — c'est presque toujours le nom du plat.
 */
function motPorteur(titre: string): string | null {
  const outils = new Set([
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'au', 'aux', 'et', 'en',
    'ma', 'mon', 'sa', 'son', 'facon', 'maison',
  ])
  const mots = sansAccent(titre)
    .split(/[^a-z0-9]+/)
    .filter((mot) => mot.length >= 4 && !outils.has(mot))

  const porteur = mots.reduce<string | null>(
    (garde, mot) => (garde === null || mot.length > garde.length ? mot : garde),
    null
  )
  if (porteur) return porteur

  // « Pot-au-feu » : trois mots trop courts, mais le titre entier fait un
  // mot-diese qu'on cherche vraiment.
  const entier = sansAccent(titre).replace(/[^a-z0-9]/g, '')
  return entier.length >= 4 && entier.length <= 20 ? entier : null
}

function motDiese(source: string | null): string | null {
  if (!source) return null
  const propre = sansAccent(source).replace(/[^a-z0-9]/g, '')
  return propre.length >= 3 ? `#${propre.slice(0, 30)}` : null
}

/**
 * Sans accent ni ligature, en bas de casse.
 *
 * La decomposition Unicode ne separe pas « œ » : il faut le remplacer a la
 * main, sinon « bœuf » perd sa voyelle et devient « buf ».
 */
function sansAccent(texte: string): string {
  return texte
    .toLowerCase()
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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
