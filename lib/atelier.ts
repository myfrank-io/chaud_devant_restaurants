import 'server-only'

import { basePrete } from '@/lib/db'

/**
 * Lignes directrices et posts.
 *
 * Une ligne est un fil editorial — « les gestes de mémé », « le dimanche
 * midi » — et sert de dossier. Un post est ce qu'on tourne : il vit d'abord
 * dans sa ligne, il prend une date quand on le cale au calendrier.
 */

export const STATUTS = ['idee', 'tourner', 'monter', 'pret', 'publie'] as const
export type Statut = (typeof STATUTS)[number]

export const LIBELLE_STATUT: Record<Statut, string> = {
  idee: 'Idée',
  tourner: 'À tourner',
  monter: 'À monter',
  pret: 'Prêt',
  publie: 'Publié',
}

export const FORMATS = ['reel', 'post', 'story'] as const
export type Format = (typeof FORMATS)[number]

export const LIBELLE_FORMAT: Record<Format, string> = {
  reel: 'Reel',
  post: 'Post',
  story: 'Story',
}


export const SONS = ['voix', 'musique'] as const
export type Son = (typeof SONS)[number]

export const LIBELLE_SON: Record<Son, string> = {
  voix: 'Voix off',
  musique: 'Musique',
}

export type Ligne = {
  id: string
  name: string
  intention: string | null
  /** Le format que cette ligne tourne. Null quand elle les mélange. */
  format: Format | null
  archived: boolean
}

export type Post = {
  id: string
  ligneId: string | null
  ligneName: string | null
  recipeId: string | null
  recipeTitle: string | null
  /** null s'il n'y a pas de recette liee. false = elle ne peut pas paraitre. */
  recipePrete: boolean | null
  title: string
  format: Format
  hook: string | null
  script: string | null
  sonType: Son | null
  son: string | null
  caption: string | null
  mediaUrl: string | null
  /** AAAA-MM-JJ, ou null tant que le post n'est pas calé. */
  scheduledOn: string | null
  status: Statut
}

type LignePost = {
  id: string
  ligne_id: string | null
  ligne_name: string | null
  recipe_id: string | null
  recipe_title: string | null
  recipe_prete: boolean | null
  title: string
  format: string
  hook: string | null
  script: string | null
  son_type: string | null
  son: string | null
  caption: string | null
  media_url: string | null
  scheduled_on: string | null
  status: string
}

// scheduled_on est une date sans fuseau. La lire en texte evite qu'un serveur
// en UTC et un navigateur en Europe/Paris ne tombent pas d'accord sur le jour.
const SELECTION = `p.id, p.ligne_id, l.name AS ligne_name, p.recipe_id,
                   r.title AS recipe_title,
                   -- Une fiche sans ingredients ni etapes ne paraitra pas, meme
                   -- calee : le dire ici evite de le decouvrir le jour J.
                   (cardinality(r.ingredients) > 0 AND cardinality(r.steps) > 0) AS recipe_prete,
                   p.title, p.format, p.hook,
                   p.script, p.son_type, p.son, p.caption, p.media_url,
                   p.scheduled_on::text AS scheduled_on, p.status`

const JOINTURES = `FROM posts p
                   LEFT JOIN lignes l ON l.id = p.ligne_id
                   LEFT JOIN recipes r ON r.id = p.recipe_id`

function dans<T extends string>(valeurs: readonly T[], valeur: string | null, defaut: T): T {
  return (valeurs as readonly string[]).includes(valeur ?? '') ? (valeur as T) : defaut
}

function versPost(ligne: LignePost): Post {
  return {
    id: ligne.id,
    ligneId: ligne.ligne_id,
    ligneName: ligne.ligne_name,
    recipeId: ligne.recipe_id,
    recipeTitle: ligne.recipe_title,
    recipePrete: ligne.recipe_prete,
    title: ligne.title,
    format: dans(FORMATS, ligne.format, 'reel'),
    hook: ligne.hook,
    script: ligne.script,
    sonType: (SONS as readonly string[]).includes(ligne.son_type ?? '')
      ? (ligne.son_type as Son)
      : null,
    son: ligne.son,
    caption: ligne.caption,
    mediaUrl: ligne.media_url,
    scheduledOn: ligne.scheduled_on,
    status: dans(STATUTS, ligne.status, 'idee'),
  }
}

/* -------------------------------------------------------------- lignes --- */

export async function listeLesLignes(): Promise<Ligne[]> {
  const pool = await basePrete()
  if (!pool) return []

  const { rows } = await pool.query<{
    id: string
    name: string
    intention: string | null
    format: string | null
    archived_at: Date | null
  }>('SELECT id, name, intention, format, archived_at FROM lignes ORDER BY position, created_at')

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    intention: r.intention,
    format: (FORMATS as readonly string[]).includes(r.format ?? '') ? (r.format as Format) : null,
    archived: r.archived_at !== null,
  }))
}

export async function creeUneLigne(
  name: string,
  intention: string | null,
  format: Format | null
): Promise<void> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de créer une ligne.')

  await pool.query(
    `INSERT INTO lignes (name, intention, format, position)
     VALUES ($1, $2, $3, COALESCE((SELECT max(position) + 1 FROM lignes), 0))`,
    [name, intention, format]
  )
}

export async function metAJourUneLigne(
  id: string,
  name: string,
  intention: string | null,
  format: Format | null
): Promise<void> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de modifier une ligne.')
  await pool.query('UPDATE lignes SET name = $1, intention = $2, format = $3 WHERE id = $4', [
    name,
    intention,
    format,
    id,
  ])
}

export async function archiveUneLigne(id: string, archivee: boolean): Promise<void> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible d\'archiver une ligne.')
  await pool.query('UPDATE lignes SET archived_at = CASE WHEN $1 THEN now() END WHERE id = $2', [
    archivee,
    id,
  ])
}

export async function supprimeUneLigne(id: string): Promise<void> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de supprimer une ligne.')
  // Les posts ne suivent pas : ON DELETE SET NULL les laisse remonter dans les
  // posts sans ligne plutot que de les faire disparaitre avec le dossier.
  await pool.query('DELETE FROM lignes WHERE id = $1', [id])
}

/* --------------------------------------------------------------- posts --- */

/** Tous les posts, ranges par ligne. C'est la vue « ce qu'on doit préparer ». */
export async function tousLesPosts(): Promise<Post[]> {
  const pool = await basePrete()
  if (!pool) return []

  const { rows } = await pool.query<LignePost>(
    `SELECT ${SELECTION} ${JOINTURES}
      ORDER BY l.position NULLS LAST, p.scheduled_on NULLS LAST, p.created_at`
  )
  return rows.map(versPost)
}

/** Les posts cales sur un mois donne. `mois` au format AAAA-MM. */
export async function postsDuMois(mois: string): Promise<Post[]> {
  const pool = await basePrete()
  if (!pool) return []

  const { rows } = await pool.query<LignePost>(
    `SELECT ${SELECTION} ${JOINTURES}
      WHERE date_trunc('month', p.scheduled_on) = date_trunc('month', $1::date)
      ORDER BY p.scheduled_on, p.created_at`,
    [`${mois}-01`]
  )
  return rows.map(versPost)
}

export async function getPost(id: string): Promise<Post | null> {
  const pool = await basePrete()
  if (!pool) return null

  const { rows } = await pool.query<LignePost>(`SELECT ${SELECTION} ${JOINTURES} WHERE p.id = $1`, [
    id,
  ])
  return rows[0] ? versPost(rows[0]) : null
}

export type PostInput = {
  ligneId: string | null
  recipeId: string | null
  title: string
  format: Format
  hook: string | null
  script: string | null
  sonType: Son | null
  son: string | null
  caption: string | null
  mediaUrl: string | null
  scheduledOn: string | null
  status: Statut
}

export async function creeUnPost(input: PostInput): Promise<string> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible d\'enregistrer un post.')

  const { rows } = await pool.query<{ id: string }>(
    `INSERT INTO posts (ligne_id, recipe_id, title, format, hook, script,
                        son_type, son, caption, media_url, scheduled_on, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     RETURNING id`,
    valeurs(input)
  )
  return rows[0].id
}

export async function metAJourUnPost(id: string, input: PostInput): Promise<void> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible d\'enregistrer un post.')

  await pool.query(
    `UPDATE posts
        SET ligne_id = $1, recipe_id = $2, title = $3, format = $4,
            hook = $5, script = $6, son_type = $7, son = $8, caption = $9,
            media_url = $10, scheduled_on = $11, status = $12, updated_at = now()
      WHERE id = $13`,
    [...valeurs(input), id]
  )
}

export async function supprimeUnPost(id: string): Promise<void> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de supprimer un post.')
  await pool.query('DELETE FROM posts WHERE id = $1', [id])
}

/** Caler ou decaler un post sans rouvrir sa fiche. */
export async function caleUnPost(id: string, jour: string | null): Promise<void> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de caler un post.')
  await pool.query('UPDATE posts SET scheduled_on = $1, updated_at = now() WHERE id = $2', [
    jour,
    id,
  ])
}

function valeurs(input: PostInput) {
  return [
    input.ligneId,
    input.recipeId,
    input.title,
    input.format,
    input.hook,
    input.script,
    input.sonType,
    // Le son n'a pas de sens sans son type : on ne garde pas une piste
    // orpheline qui reapparaitrait a la prochaine ouverture de la fiche.
    input.sonType ? input.son : null,
    input.caption,
    input.mediaUrl,
    input.scheduledOn,
    input.status,
  ]
}

/* --------------------------------------------------------------- idees --- */

export type Idee = {
  id: string
  texte: string
  archivee: boolean
}

export async function listeLesIdees(): Promise<Idee[]> {
  const pool = await basePrete()
  if (!pool) return []

  const { rows } = await pool.query<{ id: string; texte: string; archived_at: Date | null }>(
    // Les vivantes d'abord, les plus recentes en tete : on ajoute par le haut,
    // on relit par le haut.
    `SELECT id, texte, archived_at FROM idees
      ORDER BY (archived_at IS NOT NULL), created_at DESC`
  )
  return rows.map((r) => ({ id: r.id, texte: r.texte, archivee: r.archived_at !== null }))
}

export async function creeUneIdee(texte: string): Promise<void> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible d\'ajouter une idée.')
  await pool.query('INSERT INTO idees (texte) VALUES ($1)', [texte])
}

/** Cocher archive, decocher remet dans la liste. */
export async function archiveUneIdee(id: string, archivee: boolean): Promise<void> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de modifier une idée.')
  await pool.query('UPDATE idees SET archived_at = CASE WHEN $1 THEN now() END WHERE id = $2', [
    archivee,
    id,
  ])
}

export async function supprimeUneIdee(id: string): Promise<void> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de supprimer une idée.')
  await pool.query('DELETE FROM idees WHERE id = $1', [id])
}
