import Link from 'next/link'

import { BaseAbsente } from '@/components/atelier/BaseAbsente'
import { isDatabaseConfigured } from '@/lib/db'
import { listeToutesLesRecettes } from '@/lib/recipes'

export default async function Recettes() {
  if (!isDatabaseConfigured()) return <BaseAbsente />

  const recettes = await listeToutesLesRecettes()
  const brouillons = recettes.filter((recette) => !recette.publishedAt)
  const publiees = recettes.filter((recette) => recette.publishedAt)

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-display text-3xl font-black text-fonte">Recettes du site</h1>
        <p className="text-base text-fonte/60">Ce qui est publié ici est en ligne, tout de suite.</p>
        <Link
          href="/atelier/recettes/nouvelle"
          className="ml-auto bg-rouge px-4 py-2 font-display text-base font-bold text-creme transition hover:bg-rouge-sombre"
        >
          Nouvelle recette
        </Link>
      </div>

      {recettes.length === 0 ? (
        <p className="mt-8 text-lg text-fonte/60">
          Rien encore. La première recette publiée apparaîtra sur{' '}
          <Link href="/recettes" className="text-rouge underline underline-offset-4">
            /recettes
          </Link>{' '}
          dès que tu l’enregistres.
        </p>
      ) : null}

      {brouillons.length > 0 ? (
        <Groupe titre="Brouillons" recettes={brouillons} />
      ) : null}
      {publiees.length > 0 ? <Groupe titre="En ligne" recettes={publiees} /> : null}
    </>
  )
}

function Groupe({
  titre,
  recettes,
}: {
  titre: string
  recettes: Awaited<ReturnType<typeof listeToutesLesRecettes>>
}) {
  return (
    <section className="mt-9">
      <h2 className="font-display text-xl font-black text-fonte/70">{titre}</h2>
      <ul className="mt-3 space-y-2">
        {recettes.map((recette) => {
          // Ce qui empêcherait la fiche d'être présentable, listé ici plutôt
          // que découvert en la relisant sur le site.
          const manques = [
            recette.cover ? null : 'photo',
            recette.ingredients.length > 0 ? null : 'ingrédients',
            recette.steps.length > 0 ? null : 'étapes',
            recette.minutes ? null : 'durée',
          ].filter(Boolean)

          return (
            <li key={recette.id}>
              <Link
                href={`/atelier/recettes/${recette.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-fonte/15 bg-papier px-3 py-2.5 transition hover:border-rouge"
              >
                <span className="font-display text-lg text-fonte">{recette.title}</span>
                {recette.category ? (
                  <span className="text-sm text-fonte/50">{recette.category}</span>
                ) : null}
                {manques.length > 0 ? (
                  <span className="text-xs uppercase tracking-wider text-fonte/35">
                    sans {manques.join(', ')}
                  </span>
                ) : null}
                <span className="ml-auto font-mono text-sm text-fonte/40">/{recette.slug}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
