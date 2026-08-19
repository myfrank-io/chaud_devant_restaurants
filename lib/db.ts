import { Pool } from 'pg'

let pool: Pool | null = null

/**
 * Renvoie le pool Postgres, ou null si DATABASE_URL n'est pas configure.
 *
 * Le site doit rester affichable sans base : en preview, tant que Neon ou
 * Supabase n'est pas branche, la home se rend et seul le compteur se tait.
 */
export function getPool(): Pool | null {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) return null

  if (!pool) {
    pool = new Pool({
      connectionString,
      // Environnement serverless : beaucoup d'instances, peu de connexions chacune.
      max: 3,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    })
    pool.on('error', (err) => {
      console.error('[db] erreur du pool Postgres', err)
    })
  }

  return pool
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}
