import 'server-only'

import { basePrete } from '@/lib/db'

/**
 * Recettes : redigees dans l'atelier, stockees ici, lues par le site public.
 *
 * Ecart assume avec la regle 11.3 (« tout contenu recette vient de Notion ») —
 * arbitre le 19/08 : Notion n'a jamais ete branche, et une seconde brique a
 * tenir n'apportait rien qu'une table ne fasse. Le principe que la regle
 * protegeait tient toujours : aucune recette n'est ecrite en dur dans le repo.
 *
 * `published_at` decide seule de la presence sur le site, et peut etre dans le
 * futur : la recette parait toute seule ce jour-la. Pas de tache planifiee a
 * surveiller — la date est dans la requete, donc la parution ne peut pas « ne
 * pas s'etre declenchee ». Un brouillon n'existe que dans l'atelier.
 */

/**
 * Ce qui est en ligne : une date de parution posee, deja passee, et une fiche
 * qui tient debout.
 *
 * La condition de contenu n'est pas un detail de confort. Une fiche est creee
 * en meme temps que son post, donc vide, et sa date suit celle du post : sans
 * ce garde-fou, caler un post publierait une page sans ingredients ni etapes.
 * Mieux vaut ne rien publier qu'une recette qui n'en est pas une.
 *
 * Une seule definition, partagee par toutes les lectures publiques.
 */
const EN_LIGNE = `published_at IS NOT NULL
                  AND published_at <= now()
                  AND cardinality(ingredients) > 0
                  AND cardinality(steps) > 0`

export type Recipe = {
  id: string
  slug: string
  title: string
  category: string | null
  seasons: string[]
  /** Le temps de cuisson. Le total s'obtient en y ajoutant `prepMinutes`. */
  minutes: number | null
  prepMinutes: number | null
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
  prep_minutes: number | null
  difficulty: string | null
  angle: string | null
  cover: string | null
  post_url: string | null
  intro: string[]
  ingredients: string[]
  steps: string[]
  published_at: Date | null
}

const COLONNES = `id, slug, title, category, seasons, minutes, prep_minutes, difficulty,
                  angle, cover, post_url, intro, ingredients, steps, published_at`

function versRecette(ligne: Ligne): Recipe {
  return {
    id: ligne.id,
    slug: ligne.slug,
    title: ligne.title,
    category: ligne.category,
    seasons: ligne.seasons ?? [],
    minutes: ligne.minutes,
    prepMinutes: ligne.prep_minutes,
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
  const pool = await basePrete()
  if (!pool) return []

  try {
    const { rows } = await pool.query<Ligne>(
      `SELECT ${COLONNES} FROM recipes
        WHERE ${EN_LIGNE}
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
  const pool = await basePrete()
  if (!pool) return []

  try {
    const { rows } = await pool.query<Ligne>(
      `SELECT ${COLONNES} FROM recipes
        WHERE ${EN_LIGNE}
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
  const pool = await basePrete()
  if (!pool) return null

  try {
    const { rows } = await pool.query<Ligne>(
      `SELECT ${COLONNES} FROM recipes WHERE slug = $1 AND ${EN_LIGNE}`,
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
  const pool = await basePrete()
  if (!pool) return []

  const { rows } = await pool.query<Ligne>(
    `SELECT ${COLONNES} FROM recipes
      ORDER BY published_at DESC NULLS FIRST, updated_at DESC`
  )
  return rows.map(versRecette)
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  const pool = await basePrete()
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
  prepMinutes: number | null
  difficulty: string | null
  angle: string | null
  cover: string | null
  postUrl: string | null
  intro: string[]
  ingredients: string[]
  steps: string[]
  /** AAAA-MM-JJ. null = brouillon. Une date future programme la parution. */
  publishedAt: string | null
}

export async function creeUneRecette(input: RecipeInput): Promise<string> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible d\'enregistrer une recette.')

  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO recipes (slug, title, category, seasons, minutes, prep_minutes, difficulty,
                          angle, cover, post_url, intro, ingredients, steps, published_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, $14::date)
     RETURNING id`,
    valeurs(input)
  )
  return rows[0].id
}

export async function metAJourUneRecette(id: string, input: RecipeInput): Promise<void> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible d\'enregistrer une recette.')

  await pool.query(
    `UPDATE recipes
        SET slug = $1, title = $2, category = $3, seasons = $4, minutes = $5,
            prep_minutes = $6, difficulty = $7, angle = $8, cover = $9, post_url = $10,
            intro = $11, ingredients = $12, steps = $13,
            published_at = $14::date,
            updated_at = now()
      WHERE id = $15`,
    [...valeurs(input), id]
  )
}

export async function supprimeUneRecette(id: string): Promise<void> {
  const pool = await basePrete()
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
    input.prepMinutes,
    input.difficulty,
    input.angle,
    input.cover,
    input.postUrl,
    input.intro,
    input.ingredients,
    input.steps,
    input.publishedAt,
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

/**
 * Aligne la parution d'une recette sur la date du post qui la porte.
 *
 * Trois cas, et ils comptent :
 *
 * - Le post a une date, la recette n'est pas encore parue → elle parait ce
 *   jour-la. C'est le comportement demande : caler un post au calendrier
 *   publie la recette le jour J.
 * - La recette est deja en ligne → on n'y touche pas. Decaler un post ne doit
 *   jamais retirer du site une page deja partagee.
 * - Le post perd sa date → la recette redevient brouillon, mais seulement si
 *   elle n'etait pas encore parue. Meme raison.
 */
export async function alignerLaParution(
  recipeId: string,
  jour: string | null
): Promise<string | null> {
  const pool = await basePrete()
  if (!pool) return null

  // Le slug revient : l'appelant doit purger le cache de cette page precise.
  // Une page visitee avant la parution a mis son 404 en cache, et le laisser
  // la ferait rater le jour J a qui suit le lien.
  const { rows } = await pool.query<{ slug: string }>(
    `UPDATE recipes
        SET published_at = CASE
              WHEN ${EN_LIGNE} THEN published_at
              ELSE $2::date
            END,
            updated_at = now()
      WHERE id = $1
     RETURNING slug`,
    [recipeId, jour]
  )
  return rows[0]?.slug ?? null
}

/** Le post qui porte cette recette, s'il y en a un. Sert a l'expliquer dans l'atelier. */
export async function postQuiPorte(
  recipeId: string
): Promise<{ id: string; title: string; scheduledOn: string | null } | null> {
  const pool = await basePrete()
  if (!pool) return null

  const { rows } = await pool.query<{ id: string; title: string; scheduled_on: string | null }>(
    `SELECT id, title, scheduled_on::text AS scheduled_on
       FROM posts
      WHERE recipe_id = $1
      ORDER BY scheduled_on NULLS LAST
      LIMIT 1`,
    [recipeId]
  )
  return rows[0]
    ? { id: rows[0].id, title: rows[0].title, scheduledOn: rows[0].scheduled_on }
    : null
}

/** L'etat de parution, tel qu'on l'affiche. */
export type Parution = 'brouillon' | 'incomplete' | 'programmee' | 'en-ligne'

export function parution(recette: Recipe): Parution {
  if (!recette.publishedAt) return 'brouillon'
  if (!estRemplie(recette)) return 'incomplete'
  return recette.publishedAt.getTime() > Date.now() ? 'programmee' : 'en-ligne'
}

/** Une recette sans ingredients ni etapes n'est pas une recette. */
export function estRemplie(recette: Recipe): boolean {
  return recette.ingredients.length > 0 && recette.steps.length > 0
}

/** Ce qui manque pour qu'elle puisse paraitre. Vide = elle peut. */
export function ceQuiManque(recette: Recipe): string[] {
  return [
    recette.ingredients.length > 0 ? null : 'ingrédients',
    recette.steps.length > 0 ? null : 'étapes',
  ].filter((manque): manque is string => manque !== null)
}

/** AAAA-MM-JJ, ce qu'attend un champ de type date. */
export function enJour(date: Date | null): string | null {
  return date ? date.toISOString().slice(0, 10) : null
}

/**
 * Cree la fiche vide qui accompagne un post, et renvoie son identifiant.
 *
 * Un post parle d'un plat ; sa recette doit exister des ce moment-la, sinon
 * elle s'ecrit la veille au soir ou pas du tout. Elle nait en brouillon : sa
 * date de parution est posee ensuite, par le calage du post.
 */
export async function creeLaFichePourUnPost(titre: string): Promise<string> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de créer la fiche recette.')

  const { rows } = await pool.query<{ id: string }>(
    'INSERT INTO recipes (slug, title) VALUES ($1, $2) RETURNING id',
    [await slugLibre(slugify(titre)), titre]
  )
  return rows[0].id
}

/**
 * Un slug encore disponible, suffixe si besoin.
 *
 * Deux posts peuvent parler du meme plat — la version d'ete et celle d'hiver —
 * et la colonne est unique. Sans ca, creer le second post echouerait sur une
 * violation de contrainte, ce qui n'aurait aucun sens a l'ecran.
 */
async function slugLibre(souhaite: string): Promise<string> {
  const pool = await basePrete()
  const base = souhaite || 'recette'
  if (!pool) return base

  const { rows } = await pool.query<{ slug: string }>(
    "SELECT slug FROM recipes WHERE slug = $1 OR slug LIKE $1 || '-%'",
    [base]
  )
  const pris = new Set(rows.map((ligne) => ligne.slug))
  if (!pris.has(base)) return base

  let suffixe = 2
  while (pris.has(`${base}-${suffixe}`)) suffixe += 1
  return `${base}-${suffixe}`
}

/**
 * Enregistre une recette importee depuis un lien.
 *
 * La fiche nait sans date de parution : le texte vient d'ailleurs, il n'a pas
 * encore ete reecrit, et rien ne le met en ligne tant que personne ne lui
 * donne de date. C'est plus faible qu'une relecture tracee en base — voir le
 * README — mais ca ne demande aucune colonne.
 */
/**
 * La fiche deja importee depuis ce lien, s'il y en a une.
 *
 * Sans ca, rouvrir le meme lien creait une fiche de plus a chaque fois — huit
 * « poulet en cocotte » en brouillon, numerotes de 1 a 8, et rien pour dire
 * lequel etait le bon. L'adresse de la source est la seule cle fiable : un
 * titre se repete, une adresse non.
 */
export async function recetteDepuisLaSource(
  source: string
): Promise<{ id: string; title: string } | null> {
  const pool = await basePrete()
  if (!pool) return null

  const { rows } = await pool.query<{ id: string; title: string }>(
    'SELECT id, title FROM recipes WHERE source_url = $1 ORDER BY created_at LIMIT 1',
    [source]
  )
  return rows[0] ?? null
}

export async function creeUneRecetteARelire(input: {
  titre: string
  angle: string | null
  minutes: number | null
  categorie: string | null
  ingredients: string[]
  etapes: string[]
  photo: string | null
  source: string
}): Promise<string> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible d\'enregistrer la recette.')

  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO recipes (slug, title, angle, minutes, category, ingredients, steps, cover, source_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING id`,
    [
      await slugLibre(slugify(input.titre)),
      input.titre,
      input.angle,
      input.minutes,
      input.categorie,
      input.ingredients,
      input.etapes,
      input.photo,
      input.source,
    ]
  )
  return rows[0].id
}
