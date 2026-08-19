import Link from 'next/link'

import { BaseAbsente } from '@/components/atelier/BaseAbsente'
import { PastilleFormat, PastilleStatut } from '@/components/atelier/Pastille'
import { postsDuMois, tousLesPosts } from '@/lib/atelier'
import { isDatabaseConfigured } from '@/lib/db'
import {
  aujourdhui,
  grilleDuMois,
  JOURS,
  jourEnToutesLettres,
  moisDecale,
  moisValide,
  nomDuMois,
  numeroDuJour,
} from '@/lib/mois'

import { caleUnPostAction } from './actions'

export default async function Calendrier({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string }>
}) {
  if (!isDatabaseConfigured()) return <BaseAbsente />

  const mois = moisValide((await searchParams).mois)
  const [poses, tous] = await Promise.all([postsDuMois(mois), tousLesPosts()])

  const parJour = new Map<string, typeof poses>()
  for (const post of poses) {
    const jour = post.scheduledOn
    if (!jour) continue
    parJour.set(jour, [...(parJour.get(jour) ?? []), post])
  }

  const enAttente = tous.filter((post) => post.scheduledOn === null)
  const ce_jour = aujourdhui()

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
        <h1 className="font-display text-3xl font-black text-fonte">{nomDuMois(mois)}</h1>
        <nav className="flex gap-4 text-base text-fonte/60">
          <Link href={`/atelier?mois=${moisDecale(mois, -1)}`} className="hover:text-rouge">
            ← mois précédent
          </Link>
          <Link href={`/atelier?mois=${moisDecale(mois, 1)}`} className="hover:text-rouge">
            mois suivant →
          </Link>
        </nav>
        <Link
          href="/atelier/post/nouveau"
          className="ml-auto bg-rouge px-4 py-2 font-display text-base font-bold text-creme transition hover:bg-rouge-sombre"
        >
          Nouveau post
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-7 gap-px border-2 border-fonte/15 bg-fonte/15">
        {JOURS.map((jour) => (
          <div
            key={jour}
            className="bg-creme px-2 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-fonte/50"
          >
            {jour}
          </div>
        ))}

        {grilleDuMois(mois).map(({ jour, dansLeMois }) => {
          const duJour = parJour.get(jour) ?? []
          return (
            <div
              key={jour}
              className={`min-h-28 p-1.5 ${dansLeMois ? 'bg-papier' : 'bg-creme/60'} ${
                jour === ce_jour ? 'ring-2 ring-inset ring-rouge' : ''
              }`}
            >
              <Link
                href={`/atelier/post/nouveau?date=${jour}`}
                title={`Ajouter un post le ${jourEnToutesLettres(jour)}`}
                className={`block text-xs font-bold transition hover:text-rouge ${
                  dansLeMois ? 'text-fonte/45' : 'text-fonte/25'
                }`}
              >
                {numeroDuJour(jour)}
              </Link>

              <ul className="mt-1 space-y-1">
                {duJour.map((post) => (
                  <li key={post.id}>
                    <Link
                      href={`/atelier/post/${post.id}?retour=${encodeURIComponent(`/atelier?mois=${mois}`)}`}
                      className="block border border-fonte/15 bg-creme/70 px-1.5 py-1 transition hover:border-rouge"
                    >
                      <span className="block truncate text-[0.8rem] leading-tight text-fonte">
                        {post.title}
                      </span>
                      <span className="mt-1 flex flex-wrap gap-1">
                        <PastilleFormat format={post.format} />
                        <PastilleStatut statut={post.status} />
                      </span>
                      {/* Ce jour-la, la recette liee parait sur le site — a
                          condition d'etre remplie. Sinon on le dit ici. */}
                      {post.recipeTitle ? (
                        <span
                          className={`mt-1 block truncate text-[0.7rem] leading-tight ${
                            post.recipePrete ? 'text-bois' : 'text-rouge'
                          }`}
                        >
                          {post.recipePrete ? '→ ' : '⚠ fiche vide : '}
                          {post.recipeTitle}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-xl font-black text-fonte">Pas encore calés</h2>
        <p className="mt-1 text-base text-fonte/60">
          {enAttente.length === 0
            ? 'Rien en attente. Tout ce qui existe a une date.'
            : 'Donne-leur une date pour qu’ils apparaissent au calendrier.'}
        </p>

        {enAttente.length > 0 ? (
          <ul className="mt-4 space-y-2">
            {enAttente.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-fonte/15 bg-creme/40 px-3 py-2.5"
              >
                <Link
                  href={`/atelier/post/${post.id}`}
                  className="font-display text-lg text-fonte underline-offset-4 hover:text-rouge hover:underline"
                >
                  {post.title}
                </Link>
                <PastilleFormat format={post.format} />
                <PastilleStatut statut={post.status} />
                {post.ligneName ? (
                  <span className="text-sm text-fonte/50">{post.ligneName}</span>
                ) : null}

                <form action={caleUnPostAction} className="ml-auto flex items-center gap-2">
                  <input type="hidden" name="id" value={post.id} />
                  <input
                    type="date"
                    name="scheduled_on"
                    required
                    defaultValue={`${mois}-01`}
                    className="border-b-2 border-fonte/25 bg-transparent px-1 py-1 text-base text-fonte outline-none focus:border-rouge"
                  />
                  <button
                    type="submit"
                    className="border-2 border-fonte/25 px-3 py-1 text-base text-fonte transition hover:border-rouge hover:text-rouge"
                  >
                    Caler
                  </button>
                </form>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </>
  )
}
