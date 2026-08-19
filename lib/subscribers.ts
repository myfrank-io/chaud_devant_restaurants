import 'server-only'

import { basePrete } from '@/lib/db'

export type CreateResult =
  | { status: 'created'; confirmToken: string; unsubscribeToken: string }
  | { status: 'pending'; confirmToken: string; unsubscribeToken: string }
  | { status: 'already_confirmed' }

export type ConfirmResult =
  | { status: 'confirmed' }
  | { status: 'already_confirmed' }
  | { status: 'unknown_token' }

/**
 * Nombre de personnes inscrites, confirmees ou non, desinscrites exclues.
 *
 * C'est ce compteur qui s'affiche en page d'accueil. Il compte les inscrits et
 * non les confirmes : tant qu'aucun mail ne part, personne ne peut confirmer,
 * et un compteur bloque a zero mentirait davantage sur l'elan reel que le
 * total brut. Le droit au menu offert, lui, se lit sur confirmed_at — voir
 * countConfirmed ci-dessous.
 */
export async function countInscrits(): Promise<number | null> {
  const pool = await basePrete()
  if (!pool) return null

  try {
    const { rows } = await pool.query<{ count: string }>(
      'SELECT count(*) AS count FROM subscribers WHERE unsubscribed_at IS NULL'
    )
    return Number(rows[0]?.count ?? 0)
  } catch (error) {
    console.error('[subscribers] lecture du compteur impossible', error)
    return null
  }
}

/** Nombre d'inscrits confirmes. null si la base n'est pas joignable. */
export async function countConfirmed(): Promise<number | null> {
  const pool = await basePrete()
  if (!pool) return null

  try {
    const { rows } = await pool.query<{ count: string }>(
      `SELECT count(*) AS count
         FROM subscribers
        WHERE confirmed_at IS NOT NULL
          AND unsubscribed_at IS NULL`
    )
    return Number(rows[0]?.count ?? 0)
  } catch (error) {
    console.error('[subscribers] lecture du compteur impossible', error)
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
  city?: string | null
  marketingOptIn: boolean
}): Promise<CreateResult> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible d\'enregistrer une inscription.')

  const { rows } = await pool.query<{
    confirm_token: string
    unsubscribe_token: string
    confirmed_at: Date | null
    inserted: boolean
  }>(
    `INSERT INTO subscribers (email, city, marketing_opt_in)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE
       SET city = COALESCE(EXCLUDED.city, subscribers.city),
           -- Une reinscription qui coche la case ajoute le consentement ; une
           -- qui ne la coche pas ne retire pas celui deja donne. Se retirer se
           -- fait par le lien de desinscription, pas par un formulaire rempli
           -- a la va-vite.
           marketing_opt_in = subscribers.marketing_opt_in OR EXCLUDED.marketing_opt_in,
           unsubscribed_at = NULL
     RETURNING confirm_token,
               unsubscribe_token,
               confirmed_at,
               (xmax = 0) AS inserted`,
    [input.email, input.city ?? null, input.marketingOptIn]
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
 * Confirme une inscription (double opt-in).
 *
 * C'est ce clic qui vaut consentement, et c'est lui seul qui ouvre droit au
 * menu offert : une adresse saisie mais jamais confirmee n'engage a rien.
 */
export async function confirmSubscriber(token: string): Promise<ConfirmResult> {
  const pool = await basePrete()
  if (!pool) throw new Error('DATABASE_URL absent : impossible de confirmer une inscription.')

  // On capture l'etat d'avant dans une CTE plutot que de deduire « deja
  // confirme » d'une comparaison de dates apres coup : now() vaut l'heure de
  // debut de transaction, ce qui rend ce genre de test juste par accident.
  const { rows } = await pool.query<{ already: boolean }>(
    `WITH avant AS (
       SELECT confirm_token, confirmed_at FROM subscribers WHERE confirm_token = $1
     )
     UPDATE subscribers s
        SET confirmed_at = COALESCE(s.confirmed_at, now()),
            unsubscribed_at = NULL
       FROM avant
      WHERE s.confirm_token = avant.confirm_token
     RETURNING (avant.confirmed_at IS NOT NULL) AS already`,
    [token]
  )

  if (rows.length === 0) return { status: 'unknown_token' }
  return { status: rows[0].already ? 'already_confirmed' : 'confirmed' }
}

/** Desinscription, depuis le lien present dans chaque email. */
export async function unsubscribe(token: string): Promise<boolean> {
  const pool = await basePrete()
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
  topCities: { city: string; count: number }[]
}

/**
 * Agregats pour /dossier. Uniquement des totaux : aucune adresse ne sort d'ici.
 * La repartition par ville est la brique qui, dans dix-huit mois, repondra
 * « ou j'ouvre » avec un chiffre plutot qu'une intuition (QG 7.4).
 */
export async function getSubscriberStats(): Promise<SubscriberStats | null> {
  const pool = await basePrete()
  if (!pool) return null

  try {
    const [totals, cities] = await Promise.all([
      pool.query<{ total: string; confirmed: string }>(
        `SELECT count(*) AS total, count(confirmed_at) AS confirmed
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
      topCities: cities.rows.map((row) => ({ city: row.city, count: Number(row.count) })),
    }
  } catch (error) {
    console.error('[subscribers] agregats indisponibles', error)
    return null
  }
}
