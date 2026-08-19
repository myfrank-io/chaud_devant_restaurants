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
import {
  creeUneRecette,
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

/* ------------------------------------------------------------- session --- */

export async function deconnexionAction(): Promise<void> {
  await fermeLaSession()
  redirect('/login')
}

/* -------------------------------------------------------------- lignes --- */

export async function creeUneLigneAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const nom = texte(formData, 'name')
  if (!nom) return

  await creeUneLigne(nom, texte(formData, 'intention'))
  revalidatePath('/atelier/lignes')
}

export async function metAJourUneLigneAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  const nom = texte(formData, 'name')
  if (!id || !nom) return

  await metAJourUneLigne(id, nom, texte(formData, 'intention'))
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
    channel: texte(formData, 'channel') ?? 'instagram',
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
  if (id) {
    await metAJourUnPost(id, input)
  } else {
    await creeUnPost(input)
  }

  revalidatePath('/atelier')
  revalidatePath('/atelier/lignes')
  redirect(texte(formData, 'retour') ?? '/atelier/lignes')
}

export async function supprimeUnPostAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  if (!id) return

  await supprimeUnPost(id)
  revalidatePath('/atelier')
  revalidatePath('/atelier/lignes')
  redirect(texte(formData, 'retour') ?? '/atelier/lignes')
}

/** Poser un post sur une date, ou l'en retirer, depuis le calendrier. */
export async function caleUnPostAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  if (!id) return

  await caleUnPost(id, texte(formData, 'scheduled_on'))
  revalidatePath('/atelier')
  revalidatePath('/atelier/lignes')
}

/* ------------------------------------------------------------- recettes --- */

function recetteDepuisLeFormulaire(formData: FormData): RecipeInput | null {
  const titre = texte(formData, 'title')
  if (!titre) return null

  const minutes = Number(texte(formData, 'minutes'))

  return {
    slug: slugify(texte(formData, 'slug') ?? titre),
    title: titre,
    category: texte(formData, 'category'),
    seasons: (formData.getAll('seasons') as string[]).filter(Boolean),
    minutes: Number.isFinite(minutes) && minutes > 0 ? Math.round(minutes) : null,
    difficulty: texte(formData, 'difficulty'),
    angle: texte(formData, 'angle'),
    cover: texte(formData, 'cover'),
    postUrl: texte(formData, 'post_url'),
    // Un paragraphe par ligne : c'est ainsi que le texte se saisit, et ainsi
    // qu'il se rend. Pas de balisage a apprendre.
    intro: lignes(formData, 'intro'),
    ingredients: lignes(formData, 'ingredients'),
    steps: lignes(formData, 'steps'),
    published: formData.get('published') === '1',
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
  revalidatePath('/recettes')
  revalidatePath(`/recettes/${input.slug}`)
  revalidatePath('/')
  revalidatePath('/atelier/recettes')
  redirect('/atelier/recettes')
}

export async function supprimeUneRecetteAction(formData: FormData): Promise<void> {
  await exigeLaSession()
  const id = texte(formData, 'id')
  if (!id) return

  await supprimeUneRecette(id)
  revalidatePath('/recettes')
  revalidatePath('/')
  revalidatePath('/atelier/recettes')
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
