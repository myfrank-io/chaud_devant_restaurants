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
      ssl: sslPour(connectionString),
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

/**
 * Reglage TLS de la connexion.
 *
 * Supabase presente un certificat signe par sa propre autorite, absente du
 * magasin de Node : la verification de chaine echoue avec
 * SELF_SIGNED_CERT_IN_CHAIN, meme quand tout le reste est correct.
 *
 * On chiffre donc sans verifier la chaine — c'est exactement ce que veut dire
 * `sslmode=require` chez Postgres, et le reglage que Supabase documente pour
 * ses poolers. Le trafic reste chiffre ; ce qu'on abandonne, c'est la preuve
 * que le serveur en face est bien celui qu'il pretend etre. Pour l'exiger, il
 * faudrait embarquer le certificat racine de Supabase et le tenir a jour.
 *
 * Rien n'est force : une chaine qui demande explicitement autre chose
 * (`sslmode=disable`, `verify-full`, un `sslrootcert`) est respectee telle
 * quelle, en laissant pg lire ses propres parametres.
 */
function sslPour(connectionString: string): { rejectUnauthorized: false } | undefined {
  let hote: string
  let parametres: URLSearchParams
  try {
    const url = new URL(connectionString)
    hote = url.hostname
    parametres = url.searchParams
  } catch {
    return undefined
  }

  if (parametres.has('sslmode') && parametres.get('sslmode') !== 'require') return undefined
  if (parametres.has('sslrootcert')) return undefined
  if (!hote.endsWith('.supabase.com') && !hote.endsWith('.supabase.co')) return undefined

  return { rejectUnauthorized: false }
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}
