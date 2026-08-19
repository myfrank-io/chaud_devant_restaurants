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
  isRedactionConfigured,
  redigeDepuisUnePhoto,
} from '@/lib/redaction'
import {
  alignerLaParution,
  creeLaFichePourUnPost,
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

/* --------------------------------------------------------- depuis photo --- */

/**
 * Ecrit un post a partir d'une photo, puis ouvre sa fiche.
 *
 * Renvoie un message d'erreur, ou rien et redirige. On cree l'objet plutot que
 * de remplir un formulaire a l'ecran : le brouillon est en base, donc il
 * survit a un onglet ferme, et la fiche qui s'ouvre est celle qu'on relira.
 */
export async function redigeDepuisUnePhotoAction(formData: FormData): Promise<string | undefined> {
  await exigeLaSession()

  if (!isRedactionConfigured()) {
    return 'ANTHROPIC_API_KEY n’est pas configuré : la rédaction depuis une photo est fermée.'
  }

  const base64 = texte(formData, 'image')
  if (!base64) return 'Aucune photo reçue.'

  let brouillon
  try {
    brouillon = await redigeDepuisUnePhoto(
      { base64, mediaType: 'image/jpeg' },
      texte(formData, 'indication')
    )
  } catch (error) {
    console.error('[redaction] echec de la redaction depuis une photo', error)
    return 'La rédaction a échoué. Réessaie, ou écris le post à la main.'
  }

  // La fiche recette nait vide, comme pour un post cree a la main : c'est ce
  // qui l'empeche de paraitre avant qu'un humain l'ait ecrite.
  const id = await creeUnPost({
    ligneId: texte(formData, 'ligne_id'),
    recipeId: await creeLaFichePourUnPost(brouillon.titre),
    title: brouillon.titre,
    channel: 'instagram',
    format: brouillon.format,
    hook: brouillon.hook,
    script: brouillon.script,
    sonType: brouillon.sonType,
    son: brouillon.son,
    caption: brouillon.caption,
    mediaUrl: null,
    scheduledOn: null,
    status: 'idee',
  })

  await rafraichitLeSite()
  redirect(`/atelier/post/${id}`)
}
