import type { Metadata } from 'next'

import { PageSimple } from '@/components/Page'
import { getPool } from '@/lib/db'

/**
 * Page de diagnostic : ce que voit le deploiement en train de tourner.
 *
 * Elle existe parce qu'« une variable est bien enregistree dans Vercel » et
 * « le code qui tourne la voit » sont deux choses differentes, et que rien
 * dans l'interface ne dit laquelle des deux est vraie.
 *
 * Elle n'affiche aucune valeur de variable, seulement leur presence.
 */

export const metadata: Metadata = {
  title: 'État technique',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

async function testeLaBase(): Promise<{ ok: boolean; detail: string }> {
  const pool = getPool()
  if (!pool) return { ok: false, detail: 'DATABASE_URL absent : aucune connexion tentée.' }

  try {
    const { rows } = await pool.query<{ total: number }>(
      'SELECT count(*)::int AS total FROM subscribers'
    )
    return { ok: true, detail: `${rows[0].total} ligne(s) dans subscribers.` }
  } catch (error) {
    const e = error as { code?: string; message?: string }
    return { ok: false, detail: [e.code, e.message].filter(Boolean).join(' — ') || 'Échec inconnu.' }
  }
}

/**
 * Ce que la chaine de connexion dit d'elle-meme, mot de passe exclu.
 *
 * L'hote et l'utilisateur ne sont pas des secrets, et ce sont eux qui
 * distinguent « mauvais mot de passe » de « mauvais utilisateur » : le pooler
 * Supabase attend `postgres.<ref>`, pas `postgres`, et se plaint du mot de
 * passe dans les deux cas.
 */
function decritLaChaine(connectionString: string): { libelle: string; valeur: string; ok: boolean }[] {
  let url: URL
  try {
    url = new URL(connectionString)
  } catch {
    return [
      {
        libelle: 'Lecture de la chaîne',
        valeur: 'illisible — un caractère du mot de passe doit être encodé (@ : / ? # %)',
        ok: false,
      },
    ]
  }

  const utilisateur = decodeURIComponent(url.username)
  const attendu = utilisateur.includes('.')

  return [
    {
      libelle: 'Hôte',
      valeur: `${url.hostname}:${url.port || '5432'}`,
      ok: true,
    },
    {
      libelle: 'Utilisateur',
      valeur: attendu ? utilisateur : `${utilisateur} — le pooler attend postgres.<ref>`,
      ok: attendu,
    },
  ]
}

export default async function Etat() {
  const base = await testeLaBase()

  const lignes: { libelle: string; valeur: string; ok: boolean }[] = [
    {
      libelle: 'Environnement',
      valeur: process.env.VERCEL_ENV ?? 'local',
      ok: true,
    },
    {
      libelle: 'Déploiement',
      valeur: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? 'inconnu',
      ok: true,
    },
    {
      libelle: 'DATABASE_URL',
      valeur: process.env.DATABASE_URL ? 'présent' : 'absent',
      ok: Boolean(process.env.DATABASE_URL),
    },
    ...(process.env.DATABASE_URL ? decritLaChaine(process.env.DATABASE_URL) : []),
    {
      libelle: 'Connexion à la base',
      valeur: base.detail,
      ok: base.ok,
    },
    {
      libelle: 'RESEND_API_KEY',
      valeur: process.env.RESEND_API_KEY ? 'présent' : 'absent (les mails ne partent pas)',
      ok: Boolean(process.env.RESEND_API_KEY),
    },
  ]

  return (
    <PageSimple titre="État technique">
      <p>
        Ce que voit le code en train de tourner, ici et maintenant. Aucune valeur de variable
        n&rsquo;est affichée, seulement sa présence.
      </p>

      <dl className="mx-auto max-w-md space-y-3 pt-2 text-left">
        {lignes.map((ligne) => (
          <div
            key={ligne.libelle}
            className="border-2 border-fonte/15 bg-creme/50 px-4 py-3"
          >
            <dt className="font-display text-sm uppercase tracking-widest text-fonte/60">
              {ligne.libelle}
            </dt>
            <dd className={`mt-1 break-words text-base ${ligne.ok ? 'text-vert' : 'text-rouge'}`}>
              {ligne.valeur}
            </dd>
          </div>
        ))}
      </dl>
    </PageSimple>
  )
}
