'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {
  archiveUneIdee,
  archiveUneLigne,
  caleUnPost,
  creeUnPost,
  creeUneIdee,
  creeUneLigne,
  FORMATS,
  getPost,
  listeLesLignes,
  metAJourUnPost,
  metAJourUneLigne,
  SONS,
  STATUTS,
  supprimeUnPost,
  supprimeUneIdee,
  supprimeUneLigne,
  type Format,
  type PostInput,
  type Son,
  type Statut,
} from '@/lib/atelier'
import { estConnecte, fermeLaSession } from '@/lib/auth'
import { brouillonDePost } from '@/lib/brouillon'
import { importeDepuisUnLien } from '@/lib/lien'
import {
  alignerLaParution,
  creeLaFichePourUnPost,
  creeUneRecette,
  creeUneRecetteARelire,
  metAJourUneRecette,
  slugify,
  supprimeUneRecette,
  type RecipeInput,
} from '@/lib/recipes'

/**
 * Toutes les actions de l'atelier passent par `exigeLaSession`.
 *
 * Le layout protege l'affichage, pas les actions : une action serveur est une
 * URL a part entiere, appelable sans jamais charger la page qui la contient.
 * Verifier a l'affichage et pas ici laisserait une porte grande ouverte.
 */
async function exigeLaSession(): Promise<void> {
  if (!(await estConnecte())) throw new Error('Session expirée.')
}

function texte(formData: FormData, champ: string): string | null {
  const valeur = String(formData.get(champ) ?? '').trim()
  return valeur === '' ? null : valeur
}

/** Une ligne par entree, les vides ignorees. Sert aux ingredients et aux etapes. */
function lignes(formData: FormData, champ: string): string[] {
  return String(formData.get(champ) ?? '')
    .split('\n')
    .map((ligne) => ligne.trim())
    .filter(Boolean)
}

function parmi<T extends string>(valeurs: readonly T[], brut: string | null, defaut: T): T {
  return (valeurs as readonly string[]).includes(brut ?? '') ? (brut as T) : defaut
}

/** Une duree en minutes : entiere et positive, sinon rien. */
function duree(formData: FormData, champ: string): number | null {
  const brut = Number(texte(formData, champ))
  return Number.isFinite(brut) && brut > 0 ? Math.round(brut) : null
}

/**
 * Repurge les pages touchees par une parution.
 *
 * Elle ne suffit pas a elle seule, et c'est voulu : une recette programmee
 * parait un jour ou personne n'aura clique sur « Enregistrer ». C'est la
 * revalidation periodique de /recettes qui la fait apparaitre ce jour-la.
 */
async function rafraichitLeSite(slugs: (string | null)[] = []): Promise<void> {
  revalidatePath('/')
  revalidatePath('/recettes')
  // Une page de recette visitee avant sa parution a mis son 404 en cache.
  for (const slug of slugs) if (slug) revalidatePath(`/recettes/${slug}`)
  revalidatePath('/atelier')
  revalidatePath('/atelier/lignes')
  revalidatePath('/atelier/recettes')
}

/* ------------------------------------------------------------- session --- */

export async function deconnexionAction(): Promise<void> {
  await fermeLaSession()
  redirect('/login')
}

/* -------------------------------------------------------------- lignes --- */

/** Le format d'une ligne, ou null : une ligne peut melanger les formats. */
function formatChoisi(formData: FormData): Format | null {
  const valeur = texte(formData, 'format')
  return (FORMATS as readonly string[]).includes(valeur ?? '') ? (valeur as Format) : null
}

export async function creeUneLigneAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const nom = texte(formData, 'name')
  if (!nom) return

  await creeUneLigne(nom, texte(formData, 'intention'), formatChoisi(formData))
  revalidatePath('/atelier/lignes')
}

export async function metAJourUneLigneAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  const nom = texte(formData, 'name')
  if (!id || !nom) return

  await metAJourUneLigne(id, nom, texte(formData, 'intention'), formatChoisi(formData))
  revalidatePath('/atelier/lignes')
}

export async function archiveUneLigneAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  if (!id) return

  await archiveUneLigne(id, formData.get('archivee') === '1')
  revalidatePath('/atelier/lignes')
}

export async function supprimeUneLigneAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  if (!id) return

  await supprimeUneLigne(id)
  revalidatePath('/atelier/lignes')
}

/* --------------------------------------------------------------- posts --- */

function postDepuisLeFormulaire(formData: FormData): PostInput | null {
  const titre = texte(formData, 'title')
  if (!titre) return null

  const sonType = (texte(formData, 'son_type') ?? '') as Son | ''
  return {
    ligneId: texte(formData, 'ligne_id'),
    recipeId: texte(formData, 'recipe_id'),
    title: titre,
    format: parmi<Format>(FORMATS, texte(formData, 'format'), 'reel'),
    hook: texte(formData, 'hook'),
    script: texte(formData, 'script'),
    sonType: (SONS as readonly string[]).includes(sonType) ? (sonType as Son) : null,
    son: texte(formData, 'son'),
    caption: texte(formData, 'caption'),
    mediaUrl: texte(formData, 'media_url'),
    scheduledOn: texte(formData, 'scheduled_on'),
    status: parmi<Statut>(STATUTS, texte(formData, 'status'), 'idee'),
  }
}

export async function enregistreUnPostAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const input = postDepuisLeFormulaire(formData)
  if (!input) return

  const id = texte(formData, 'id')
  // La recette d'avant, lue avant l'ecriture : si le post change de recette,
  // l'ancienne doit etre relachee, sinon elle resterait programmee par un post
  // qui ne la porte plus.
  const ancienne = id ? (await getPost(id))?.recipeId ?? null : null

  // Un nouveau post ouvre sa fiche recette du meme geste, sauf si on l'a
  // decoche : tous les posts ne racontent pas un plat.
  if (!id && !input.recipeId && formData.get('cree_la_fiche') === '1') {
    input.recipeId = await creeLaFichePourUnPost(input.title)
  }

  if (id) {
    await metAJourUnPost(id, input)
  } else {
    await creeUnPost(input)
  }

  const touchees: (string | null)[] = []
  if (ancienne && ancienne !== input.recipeId) touchees.push(await alignerLaParution(ancienne, null))
  if (input.recipeId) touchees.push(await alignerLaParution(input.recipeId, input.scheduledOn))

  await rafraichitLeSite(touchees)
  redirect(texte(formData, 'retour') ?? '/atelier/lignes')
}

export async function supprimeUnPostAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  if (!id) return

  const portee = (await getPost(id))?.recipeId ?? null
  await supprimeUnPost(id)
  const slug = portee ? await alignerLaParution(portee, null) : null

  await rafraichitLeSite([slug])
  redirect(texte(formData, 'retour') ?? '/atelier/lignes')
}

/** Poser un post sur une date, ou l'en retirer, depuis le calendrier. */
export async function caleUnPostAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  if (!id) return

  const jour = texte(formData, 'scheduled_on')
  await caleUnPost(id, jour)

  const portee = (await getPost(id))?.recipeId ?? null
  const slug = portee ? await alignerLaParution(portee, jour) : null

  await rafraichitLeSite([slug])
}

/* ------------------------------------------------------------- recettes --- */

function recetteDepuisLeFormulaire(formData: FormData): RecipeInput | null {
  const titre = texte(formData, 'title')
  if (!titre) return null

  return {
    slug: slugify(texte(formData, 'slug') ?? titre),
    title: titre,
    category: texte(formData, 'category'),
    seasons: (formData.getAll('seasons') as string[]).filter(Boolean),
    minutes: duree(formData, 'minutes'),
    prepMinutes: duree(formData, 'prep_minutes'),
    difficulty: texte(formData, 'difficulty'),
    angle: texte(formData, 'angle'),
    cover: texte(formData, 'cover'),
    postUrl: texte(formData, 'post_url'),
    // Un paragraphe par ligne : c'est ainsi que le texte se saisit, et ainsi
    // qu'il se rend. Pas de balisage a apprendre.
    intro: lignes(formData, 'intro'),
    ingredients: lignes(formData, 'ingredients'),
    steps: lignes(formData, 'steps'),
    publishedAt: texte(formData, 'published_at'),
  }
}

export async function enregistreUneRecetteAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const input = recetteDepuisLeFormulaire(formData)
  if (!input) return

  const id = texte(formData, 'id')
  if (id) {
    await metAJourUneRecette(id, input)
  } else {
    await creeUneRecette(input)
  }

  // Le site public sert des pages mises en cache : sans ca, la recette
  // publiee n'apparait qu'a la prochaine revalidation, une heure plus tard.
  await rafraichitLeSite([input.slug])
  redirect('/atelier/recettes')
}

export async function supprimeUneRecetteAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  if (!id) return

  await supprimeUneRecette(id)
  await rafraichitLeSite()
  redirect('/atelier/recettes')
}

/* --------------------------------------------------------------- idees --- */

export async function creeUneIdeeAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const texteDeLIdee = texte(formData, 'texte')
  if (!texteDeLIdee) return

  await creeUneIdee(texteDeLIdee)
  revalidatePath('/atelier/idees')
}

export async function archiveUneIdeeAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  if (!id) return

  await archiveUneIdee(id, formData.get('archivee') === '1')
  revalidatePath('/atelier/idees')
}

export async function supprimeUneIdeeAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  if (!id) return

  await supprimeUneIdee(id)
  revalidatePath('/atelier/idees')
}

/* ---------------------------------------------------------- depuis lien --- */

/**
 * Importe une recette depuis un lien, puis ouvre sa fiche.
 *
 * Aucun modele n'intervient : on lit le balisage schema.org que presque tous
 * les sites de cuisine publient deja. C'est exact, gratuit, et ca rend des
 * champs deja separes.
 */
export async function importeUneRecetteAction(formData: FormData): Promise<string | undefined> {
  await exigeLaSession()

  const lien = texte(formData, 'lien')
  if (!lien) return 'Colle un lien vers une page de recette.'

  let importee
  try {
    importee = await importeDepuisUnLien(lien)
  } catch (error) {
    return error instanceof Error ? error.message : 'Ce lien n’a pas pu être lu.'
  }

  const id = await creeUneRecetteARelire(importee)
  await rafraichitLeSite()
  redirect(`/atelier/recettes/${id}`)
}

/**
 * Le meme lien, mais pour ouvrir un post.
 *
 * La fiche recette est creee avec ce que la page publiait — ingredients,
 * etapes, durees, photo — et le formulaire de post s'ouvre dessus, hook,
 * conduite et legende compris.
 *
 * Ces trois-la ne sont pas generes par un modele : `lib/brouillon.ts` met en
 * forme ce que la page donnait deja. C'est un point de depart, pas un texte
 * fini, et l'ecran le dit — mais relire trois champs remplis coute deux
 * minutes la ou les inventer en coute vingt.
 *
 * Rien n'est enregistre cote post tant qu'on n'a pas clique sur Enregistrer.
 */
export async function importeUnPostDepuisUnLienAction(
  formData: FormData
): Promise<string | undefined> {
  await exigeLaSession()

  const lien = texte(formData, 'lien')
  if (!lien) return 'Colle un lien vers une page de recette.'

  let importee
  try {
    importee = await importeDepuisUnLien(lien)
  } catch (error) {
    return error instanceof Error ? error.message : 'Ce lien n’a pas pu être lu.'
  }

  const recetteId = await creeUneRecetteARelire(importee)
  await rafraichitLeSite()

  // La conduite suit la trame du format que cette ligne tourne : une story ne
  // se decoupe pas comme un carrousel.
  const ligneId = texte(formData, 'ligne')
  const format =
    formatChoisi(formData) ??
    (ligneId ? ((await listeLesLignes()).find((l) => l.id === ligneId)?.format ?? null) : null)

  const propose = brouillonDePost(importee, format ?? 'reel')

  const champs = new URLSearchParams({
    titre: importee.titre,
    recette: recetteId,
    // La fiche existe deja : la recreer en ferait une seconde, vide.
    fiche: '0',
    hook: propose.hook,
    script: propose.script,
    caption: propose.caption,
  })
  if (format) champs.set('format', format)
  for (const nom of ['ligne', 'date', 'retour'] as const) {
    const valeur = texte(formData, nom)
    if (valeur) champs.set(nom, valeur)
  }

  redirect(`/atelier/post/nouveau?${champs}`)
}
