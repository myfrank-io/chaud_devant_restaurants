/**
 * Diagnostic de DATABASE_URL. Repond a une seule question : est-ce que le site,
 * tel qu'il tourne sur Vercel, peut atteindre la base et lire la table ?
 *
 * Usage : DATABASE_URL='postgresql://...' node scripts/verifie-base.mjs
 */
import { Client } from 'pg'

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL absent. Passe-le en variable d'environnement, jamais en argument :")
  console.error("  DATABASE_URL='postgresql://...' node scripts/verifie-base.mjs")
  process.exit(1)
}

let hote = ''
let port = ''
let mode = null
try {
  const u = new URL(url)
  hote = u.hostname
  port = u.port || '5432'
  mode = u.searchParams.get('sslmode')
} catch {
  console.error("DATABASE_URL n'est pas une URL valide.")
  process.exit(1)
}

console.log(`Hote : ${hote}:${port}`)

// Les fonctions serverless de Vercel n'ont pas d'IPv6, et la connexion directe
// de Supabase n'a plus d'adresse IPv4. Le probleme se voit avant toute tentative.
if (/^db\..*\.supabase\.co$/.test(hote)) {
  console.error('\nC\'est la connexion DIRECTE de Supabase. Elle ne marchera pas depuis Vercel :')
  console.error("  - elle n'a pas d'adresse IPv4, et les fonctions serverless n'ont pas d'IPv6 ;")
  console.error('  - elle ouvre une connexion par requete, ce qui sature la base.')
  console.error('\nPrends la chaine du "Transaction pooler" (dashboard Supabase, bouton Connect) :')
  console.error('  postgresql://postgres.<ref>:MOT_DE_PASSE@aws-N-<region>.pooler.supabase.com:6543/postgres?sslmode=require')
  process.exit(1)
}

if (hote.includes('pooler.supabase.com') && port !== '6543') {
  console.warn(`\nAttention : port ${port}. Le pooler transactionnel, celui qui convient au serverless, ecoute sur 6543.`)
}

// Meme reglage TLS que lib/db.ts. Supabase signe avec sa propre autorite, et
// `sslmode=require` ne veut pas dire chez pg ce qu'il veut dire chez libpq :
// la version installee le traite comme une verification stricte de la chaine.
// On le retire — sinon il ecrase l'option posee ici — et on regle nous-memes.
const supabase = /\.supabase\.(com|co)$/.test(hote)
const modeChoisi = ['disable', 'verify-ca', 'verify-full'].includes(mode)
const chaine = supabase && !modeChoisi ? sansSslmode(url) : url

function sansSslmode(brut) {
  const debut = brut.indexOf('?')
  if (debut === -1) return brut
  const restants = brut
    .slice(debut + 1)
    .split('&')
    .filter((parametre) => !parametre.startsWith('sslmode='))
  return restants.length ? `${brut.slice(0, debut)}?${restants.join('&')}` : brut.slice(0, debut)
}

const client = new Client({
  connectionString: chaine,
  ssl: supabase && !modeChoisi ? { rejectUnauthorized: false } : undefined,
  connectionTimeoutMillis: 10_000,
})

try {
  await client.connect()
  console.log('Connexion : ok')

  const { rows } = await client.query(
    `SELECT count(*)::int AS total,
            count(confirmed_at)::int AS confirmes
       FROM subscribers
      WHERE unsubscribed_at IS NULL`
  )
  console.log(`Table subscribers : ok — ${rows[0].total} inscrit(s), dont ${rows[0].confirmes} confirme(s).`)
  console.log('\nRien ne bloque. Le formulaire peut enregistrer.')
} catch (error) {
  console.error(`\nEchec : ${error.message}`)
  if (error.code === 'ENOTFOUND') {
    console.error("L'hote ne resout pas. Verifie la chaine copiee depuis le dashboard.")
  } else if (error.code === '28P01') {
    console.error('Mot de passe refuse.')
  } else if (error.code === '42P01') {
    console.error("La table subscribers n'existe pas dans cette base. Applique db/schema.sql.")
  } else if (error.code === 'SELF_SIGNED_CERT_IN_CHAIN') {
    console.error('Certificat non verifiable. Ajoute ?sslmode=require a la fin de la chaine.')
  } else if (error.message.includes('Tenant or user not found')) {
    console.error("Le pooler ne connait pas ce projet : mauvais numero de pool (aws-0 / aws-1) ou")
    console.error("nom d'utilisateur incomplet — il doit valoir postgres.<ref>, pas postgres.")
  }
  process.exitCode = 1
} finally {
  await client.end().catch(() => {})
}
