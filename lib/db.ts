import { Pool } from 'pg'

import { SCHEMA, VERSION } from '@/db/schema'

let pool: Pool | null = null

/**
 * Renvoie le pool Postgres, ou null si DATABASE_URL n'est pas configure.
 *
 * Le site doit rester affichable sans base : en preview, tant que Neon ou
 * Supabase n'est pas branche, la home se rend et seul le compteur se tait.
 */
export function getPool(): Pool | null {
  // trim() : un saut de ligne colle avec la valeur dans l'interface de Vercel
  // ne se voit pas, et fait echouer l'authentification sans autre indice.
  const brut = process.env.DATABASE_URL?.trim()
  if (!brut) return null

  if (!pool) {
    const { connectionString, ssl } = reglagesTls(brut)
    pool = new Pool({
      connectionString,
      ssl,
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

type ReglagesTls = { connectionString: string; ssl?: { rejectUnauthorized: false } }

/**
 * Reglage TLS quand la base est chez Supabase.
 *
 * Supabase presente un certificat signe par sa propre autorite, absente du
 * magasin de Node. Toute connexion qui verifie la chaine echoue donc en
 * SELF_SIGNED_CERT_IN_CHAIN, meme quand l'hote, le port et le mot de passe
 * sont bons.
 *
 * Le piege : `sslmode=require`, que le tableau de bord Supabase et la moitie
 * des tutoriels font ajouter, ne veut pas dire chez pg ce qu'il veut dire chez
 * libpq. La version installee le traite comme `verify-full` — verification
 * stricte — au lieu du « chiffre sans verifier » de Postgres. Le parametre qui
 * semble regler le probleme est precisement celui qui le cause.
 *
 * Pire, une valeur lue dans la chaine ecrase l'option passee au Pool
 * (pg/lib/connection-parameters.js). On retire donc `sslmode` de la chaine
 * plutot que d'esperer le contredire, et on pose le reglage nous-memes.
 *
 * Ce qu'on abandonne : la preuve que le serveur en face est bien celui qu'il
 * pretend etre. Le trafic reste chiffre. Pour exiger l'identite, il faudrait
 * embarquer le certificat racine de Supabase et le tenir a jour.
 *
 * Un choix explicite est respecte tel quel : `disable`, `verify-ca` et
 * `verify-full` ne sont pas touches, pas plus qu'une base hors Supabase.
 */
function reglagesTls(connectionString: string): ReglagesTls {
  if (!estChezSupabase(connectionString)) return { connectionString }

  const mode = /[?&]sslmode=([^&]*)/.exec(connectionString)?.[1]
  if (mode === 'disable' || mode === 'verify-ca' || mode === 'verify-full') {
    return { connectionString }
  }

  return {
    connectionString: sansSslmode(connectionString),
    ssl: { rejectUnauthorized: false },
  }
}

function estChezSupabase(connectionString: string): boolean {
  try {
    return /\.supabase\.(com|co)$/.test(new URL(connectionString).hostname)
  } catch {
    // Mot de passe contenant un caractere non encode : l'URL ne se parse pas.
    // On se rabat sur l'hote, qui suit le dernier arobase.
    return /@[^@/?]*\.supabase\.(com|co)[:/?]/.test(connectionString)
  }
}

/**
 * Retire le parametre sslmode sans toucher au reste. On travaille sur le texte
 * plutot que via URL : reserialiser l'URL reencoderait le mot de passe, et le
 * changerait s'il contient un caractere special.
 */
function sansSslmode(connectionString: string): string {
  const debut = connectionString.indexOf('?')
  if (debut === -1) return connectionString

  const base = connectionString.slice(0, debut)
  const parametres = connectionString
    .slice(debut + 1)
    .split('&')
    .filter((parametre) => !parametre.startsWith('sslmode='))

  return parametres.length ? `${base}?${parametres.join('&')}` : base
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}

/* --------------------------------------------------------------- schema --- */

let poseEnCours: Promise<void> | null = null

/**
 * Le pool, une fois le schema garanti a jour.
 *
 * C'est par ici que passe toute lecture et toute ecriture — `getPool()` reste
 * pour la page de diagnostic, qui doit pouvoir joindre la base meme quand le
 * schema, lui, ne passe pas.
 *
 * La pose est tentee une seule fois par instance, et ne bloque jamais : si
 * elle echoue, on continue avec la base telle qu'elle est. Une requete qui
 * tombe ensuite tombera comme avant, ni mieux ni pire — mais un droit
 * manquant ne doit pas eteindre un site qui, sans ca, marcherait.
 */
export async function basePrete(): Promise<Pool | null> {
  const pool = getPool()
  if (!pool) return null

  poseEnCours ??= poseLeSchema(pool)
  await poseEnCours
  return pool
}

/** Cle arbitraire, fixe : deux instances qui posent en meme temps s'attendent. */
const VERROU = 2026_08_19

async function poseLeSchema(pool: Pool): Promise<void> {
  if (await dejaAJour(pool)) return

  const client = await pool.connect()
  try {
    await client.query('SELECT pg_advisory_lock($1)', [VERROU])

    // Une instance a pu poser pendant qu'on attendait le verrou.
    if (await dejaAJour(client)) return

    await client.query(SCHEMA)
    await client.query(
      `INSERT INTO schema_etat (version) VALUES ($1)
       ON CONFLICT (ligne_unique) DO UPDATE SET version = $1, pose_le = now()`,
      [VERSION]
    )
    console.log(`[db] schema pose en version ${VERSION}`)
  } catch (error) {
    console.error('[db] pose du schema impossible, on continue sans', error)
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [VERROU]).catch(() => {})
    client.release()
  }
}

type Interrogeable = { query: (texte: string) => Promise<{ rows: { version: number }[] }> }

/**
 * Sonde bon marche : sans elle, chaque demarrage a froid rejouerait tout le
 * DDL pour ne rien changer. Une table absente est un echec attendu, pas une
 * erreur — c'est le cas d'une base neuve.
 */
async function dejaAJour(source: Interrogeable): Promise<boolean> {
  try {
    const { rows } = await source.query('SELECT version FROM schema_etat LIMIT 1')
    return (rows[0]?.version ?? 0) >= VERSION
  } catch {
    return false
  }
}
