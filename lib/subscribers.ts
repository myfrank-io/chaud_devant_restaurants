import 'server-only'

import { getPool } from '@/lib/db'
import { FOUNDERS_CAP } from '@/lib/site'

export type CreateResult =
  | { status: 'created'; confirmToken: string; unsubscribeToken: string }
  | { status: 'pending'; confirmToken: string; unsubscribeToken: string }
  | { status: 'already_confirmed' }

export type ConfirmResult =
  | { status: 'confirmed'; founderNumber: number | null }
  | { status: 'already_confirmed'; founderNumber: number | null }
  | { status: 'unknown_token' }

/**
 * Nombre de Fondateurs deja attribues. null si la base n'est pas joignable :
 * l'appelant affiche alors une formulation qui n'invente aucun chiffre.
 */
export async function countFounders(): Promise<number | null> {
  const pool = getPool()
  if (!pool) return null

  try {
    const { rows } = await pool.query<{ count: string }>(
      'SELECT count(founder_number) AS count FROM subscribers'
    )
    return Number(rows[0]?.count ?? 0)
  } catch (error) {
    console.error('[subscribers] lecture du compteur de Fondateurs impossible', error)
    return null
  }
}

/**
 * Enregistre une inscription non confirmee et renvoie ses jetons.
 *
 * Une reinscription avec le meme email ne cree pas de doublon : on renvoie les
 * jetons existants pour pouvoir relancer le mail de confirmation. Un inscrit
 * deja confirme n'est pas touche.
 */
export async function createSubscriber(input: {
  email: string
  city: string
}): Promise<CreateResult> {
  const pool = getPool()
  if (!pool) throw new Error('DATABASE_URL absent : impossible d\'enregistrer une inscription.')

  const { rows } = await pool.query<{
    confirm_token: string
    unsubscribe_token: string
    confirmed_at: Date | null
    inserted: boolean
  }>(
    `INSERT INTO subscribers (email, city)
     VALUES ($1, $2)
     ON CONFLICT (email) DO UPDATE
       SET city = COALESCE(EXCLUDED.city, subscribers.city),
           unsubscribed_at = NULL
     RETURNING confirm_token,
               unsubscribe_token,
               confirmed_at,
               (xmax = 0) AS inserted`,
    [input.email, input.city]
  )

  const row = rows[0]
  if (!row) throw new Error('Insertion sans ligne retournee.')

  if (row.confirmed_at) return { status: 'already_confirmed' }

  return {
    status: row.inserted ? 'created' : 'pending',
    confirmToken: row.confirm_token,
    unsubscribeToken: row.unsubscribe_token,
  }
}

/**
 * Confirme une inscription et attribue le numero de Fondateur.
 *
 * Regles du QG 6.4, toutes portees par cette transaction :
 *  - le numero s'attribue a la confirmation, jamais a la soumission du formulaire ;
 *  - il est plafonne a FOUNDERS_CAP ;
 *  - il n'est jamais reattribue — on prend max + 1, jamais un trou libere.
 *
 * Le verrou consultatif serialise les confirmations simultanees, sans quoi deux
 * requetes concurrentes liraient le meme max et viseraient le meme numero.
 */
export async function confirmSubscriber(token: string): Promise<ConfirmResult> {
  const pool = getPool()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de confirmer une inscription.')

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('SELECT pg_advisory_xact_lock(hashtext($1))', ['chaud_devant:founder_number'])

    const { rows: existing } = await client.query<{
      confirmed_at: Date | null
      founder_number: number | null
    }>('SELECT confirmed_at, founder_number FROM subscribers WHERE confirm_token = $1', [token])

    const current = existing[0]
    if (!current) {
      await client.query('ROLLBACK')
      return { status: 'unknown_token' }
    }

    if (current.confirmed_at) {
      await client.query('ROLLBACK')
      return { status: 'already_confirmed', founderNumber: current.founder_number }
    }

    const { rows } = await client.query<{ founder_number: number | null }>(
      `UPDATE subscribers
          SET confirmed_at = now(),
              unsubscribed_at = NULL,
              founder_number = CASE
                WHEN (SELECT COALESCE(max(founder_number), 0) FROM subscribers) < $2
                THEN (SELECT COALESCE(max(founder_number), 0) + 1 FROM subscribers)
                ELSE NULL
              END
        WHERE confirm_token = $1
          AND confirmed_at IS NULL
      RETURNING founder_number`,
      [token, FOUNDERS_CAP]
    )

    await client.query('COMMIT')
    return { status: 'confirmed', founderNumber: rows[0]?.founder_number ?? null }
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {})
    throw error
  } finally {
    client.release()
  }
}

/** Desinscription. Ne libere jamais le numero de Fondateur (voir db/schema.sql). */
export async function unsubscribe(token: string): Promise<boolean> {
  const pool = getPool()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de traiter la desinscription.')

  const { rowCount } = await pool.query(
    'UPDATE subscribers SET unsubscribed_at = now() WHERE unsubscribe_token = $1',
    [token]
  )
  return (rowCount ?? 0) > 0
}

export type SubscriberStats = {
  total: number
  confirmed: number
  founders: number
  topCities: { city: string; count: number }[]
}

/**
 * Agregats pour /dossier. Uniquement des totaux : aucune adresse ne sort d'ici.
 * La repartition par ville est la brique qui, dans dix-huit mois, repondra
 * « ou j'ouvre » avec un chiffre plutot qu'une intuition (QG 7.4).
 */
export async function getSubscriberStats(): Promise<SubscriberStats | null> {
  const pool = getPool()
  if (!pool) return null

  try {
    const [totals, cities] = await Promise.all([
      pool.query<{ total: string; confirmed: string; founders: string }>(
        `SELECT count(*) AS total,
                count(confirmed_at) AS confirmed,
                count(founder_number) AS founders
           FROM subscribers
          WHERE unsubscribed_at IS NULL`
      ),
      pool.query<{ city: string; count: string }>(
        `SELECT city, count(*) AS count
           FROM subscribers
          WHERE unsubscribed_at IS NULL
            AND confirmed_at IS NOT NULL
            AND city IS NOT NULL
          GROUP BY city
          ORDER BY count(*) DESC, city ASC
          LIMIT 10`
      ),
    ])

    return {
      total: Number(totals.rows[0]?.total ?? 0),
      confirmed: Number(totals.rows[0]?.confirmed ?? 0),
      founders: Number(totals.rows[0]?.founders ?? 0),
      topCities: cities.rows.map((row) => ({ city: row.city, count: Number(row.count) })),
    }
  } catch (error) {
    console.error('[subscribers] agregats indisponibles', error)
    return null
  }
}
