import { Pool } from 'pg'

let pool: Pool | null = null

/**
 * Renvoie le pool Postgres, ou null si DATABASE_URL n'est pas configure.
 *
 * Le site doit rester affichable sans base : en preview, tant que Neon ou
 * Supabase n'est pas branche, la home se rend et seul le compteur se tait.
 */
export function getPool(): Pool | null {
  const brut = process.env.DATABASE_URL
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
