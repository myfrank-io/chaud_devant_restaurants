import 'server-only'

import { getPool } from '@/lib/db'

/**
 * Recettes : redigees dans l'atelier, stockees ici, lues par le site public.
 *
 * Ecart assume avec la regle 11.3 (« tout contenu recette vient de Notion ») —
 * arbitre le 19/08 : Notion n'a jamais ete branche, et une seconde brique a
 * tenir n'apportait rien qu'une table ne fasse. Le principe que la regle
 * protegeait tient toujours : aucune recette n'est ecrite en dur dans le repo.
 *
 * `published_at` decide seule de la presence sur le site. Un brouillon n'existe
 * que dans l'atelier.
 */

export type Recipe = {
  id: string
  slug: string
  title: string
  category: string | null
  seasons: string[]
  minutes: number | null
  difficulty: string | null
  angle: string | null
  cover: string | null
  postUrl: string | null
  intro: string[]
  ingredients: string[]
  steps: string[]
  publishedAt: Date | null
}

type Ligne = {
  id: string
  slug: string
  title: string
  category: string | null
  seasons: string[]
  minutes: number | null
  difficulty: string | null
  angle: string | null
  cover: string | null
  post_url: string | null
  intro: string[]
  ingredients: string[]
  steps: string[]
  published_at: Date | null
}

const COLONNES = `id, slug, title, category, seasons, minutes, difficulty, angle,
                  cover, post_url, intro, ingredients, steps, published_at`

function versRecette(ligne: Ligne): Recipe {
  return {
    id: ligne.id,
    slug: ligne.slug,
    title: ligne.title,
    category: ligne.category,
    seasons: ligne.seasons ?? [],
    minutes: ligne.minutes,
    difficulty: ligne.difficulty,
    angle: ligne.angle,
    cover: ligne.cover,
    postUrl: ligne.post_url,
    intro: ligne.intro ?? [],
    ingredients: ligne.ingredients ?? [],
    steps: ligne.steps ?? [],
    publishedAt: ligne.published_at,
  }
}

/** Ce que voit le public. Jamais un brouillon. */
export async function getPublishedRecipes(): Promise<Recipe[]> {
  const pool = getPool()
  if (!pool) return []

  try {
    const { rows } = await pool.query<Ligne>(
      `SELECT ${COLONNES} FROM recipes
        WHERE published_at IS NOT NULL
        ORDER BY published_at DESC`
    )
    return rows.map(versRecette)
  } catch (error) {
    console.error('[recipes] lecture des recettes publiees impossible', error)
    return []
  }
}

/** Les dernieres parues, pour la home. */
export async function getLatestRecipes(limite = 3): Promise<Recipe[]> {
  const pool = getPool()
  if (!pool) return []

  try {
    const { rows } = await pool.query<Ligne>(
      `SELECT ${COLONNES} FROM recipes
        WHERE published_at IS NOT NULL
        ORDER BY published_at DESC
        LIMIT $1`,
      [limite]
    )
    return rows.map(versRecette)
  } catch (error) {
    console.error('[recipes] lecture des dernieres recettes impossible', error)
    return []
  }
}

export async function getRecipeBySlug(slug: string): Promise<Recipe | null> {
  const pool = getPool()
  if (!pool) return null

  try {
    const { rows } = await pool.query<Ligne>(
      `SELECT ${COLONNES} FROM recipes WHERE slug = $1 AND published_at IS NOT NULL`,
      [slug]
    )
    return rows[0] ? versRecette(rows[0]) : null
  } catch (error) {
    console.error('[recipes] lecture de la recette impossible', error)
    return null
  }
}

/** Tout, brouillons compris. Reserve a l'atelier. */
export async function listeToutesLesRecettes(): Promise<Recipe[]> {
  const pool = getPool()
  if (!pool) return []

  const { rows } = await pool.query<Ligne>(
    `SELECT ${COLONNES} FROM recipes
      ORDER BY published_at DESC NULLS FIRST, updated_at DESC`
  )
  return rows.map(versRecette)
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const pool = getPool()
  if (!pool) return null

  const { rows } = await pool.query<Ligne>(`SELECT ${COLONNES} FROM recipes WHERE id = $1`, [id])
  return rows[0] ? versRecette(rows[0]) : null
}

export type RecipeInput = {
  slug: string
  title: string
  category: string | null
  seasons: string[]
  minutes: number | null
  difficulty: string | null
  angle: string | null
  cover: string | null
  postUrl: string | null
  intro: string[]
  ingredients: string[]
  steps: string[]
  published: boolean
}

export async function creeUneRecette(input: RecipeInput): Promise<string> {
  const pool = getPool()
  if (!pool) throw new Error('DATABASE_URL absent : impossible d\'enregistrer une recette.')

  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO recipes (slug, title, category, seasons, minutes, difficulty, angle,
                          cover, post_url, intro, ingredients, steps, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12, CASE WHEN $13 THEN now() END)
     RETURNING id`,
    valeurs(input)
  )
  return rows[0].id
}

export async function metAJourUneRecette(id: string, input: RecipeInput): Promise<void> {
  const pool = getPool()
  if (!pool) throw new Error('DATABASE_URL absent : impossible d\'enregistrer une recette.')

  await pool.query(
    `UPDATE recipes
        SET slug = $1, title = $2, category = $3, seasons = $4, minutes = $5,
            difficulty = $6, angle = $7, cover = $8, post_url = $9, intro = $10,
            ingredients = $11, steps = $12,
            -- Republier ne doit pas repousser la date : c'est elle qui ordonne
            -- la liste, et une correction de coquille n'est pas une parution.
            published_at = CASE WHEN $13 THEN COALESCE(published_at, now()) END,
            updated_at = now()
      WHERE id = $14`,
    [...valeurs(input), id]
  )
}

export async function supprimeUneRecette(id: string): Promise<void> {
  const pool = getPool()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de supprimer une recette.')
  await pool.query('DELETE FROM recipes WHERE id = $1', [id])
}

function valeurs(input: RecipeInput) {
  return [
    input.slug,
    input.title,
    input.category,
    input.seasons,
    input.minutes,
    input.difficulty,
    input.angle,
    input.cover,
    input.postUrl,
    input.intro,
    input.ingredients,
    input.steps,
    input.published,
  ]
}

export function slugify(input: string): string {
  return input
    // Les ligatures ne sont pas decomposees par NFD : sans ca, « Boeuf » ecrit
    // avec la ligature perdrait sa voyelle et donnerait « b-uf-bourguignon ».
    .replace(/\u0153/g, 'oe')
    .replace(/\u00e6/g, 'ae')
    .replace(/\u0152/g, 'OE')
    .replace(/\u00c6/g, 'AE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Convertit des minutes en duree ISO 8601, ce qu'attend schema.org. */
export function isoDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `PT${h > 0 ? `${h}H` : ''}${m > 0 || h === 0 ? `${m}M` : ''}`
}
