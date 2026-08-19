import Link from 'next/link'

import { BaseAbsente } from '@/components/atelier/BaseAbsente'
import { DepuisUnLien } from '@/components/atelier/DepuisUnLien'
import { isDatabaseConfigured } from '@/lib/db'
import { ceQuiManque, enJour, listeToutesLesRecettes, parution } from '@/lib/recipes'
import { jourEnToutesLettres } from '@/lib/mois'

export default async function Recettes() {
  if (!isDatabaseConfigured()) return <BaseAbsente />

  const recettes = await listeToutesLesRecettes()
  const brouillons = recettes.filter((recette) => parution(recette) === 'brouillon')
  const aFinir = recettes.filter((recette) => parution(recette) === 'incomplete')
  const aRelire = recettes.filter((recette) => parution(recette) === 'a-relire')
  const programmees = recettes.filter((recette) => parution(recette) === 'programmee')
  const publiees = recettes.filter((recette) => parution(recette) === 'en-ligne')

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

      <div className="mt-6">
        <DepuisUnLien />
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

      {aRelire.length > 0 ? (
        <Groupe titre="À relire — importées, jamais enregistrées" recettes={aRelire} />
      ) : null}
      {aFinir.length > 0 ? <Groupe titre="À finir — elles ne paraîtront pas" recettes={aFinir} /> : null}
      {programmees.length > 0 ? <Groupe titre="Programmées" recettes={programmees} /> : null}
      {brouillons.length > 0 ? <Groupe titre="Brouillons" recettes={brouillons} /> : null}
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
          // Ce qui bloque la parution passe devant ; le reste est du confort.
          const bloquant = ceQuiManque(recette)
          const manques = [
            recette.cover ? null : 'photo',
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
                {bloquant.length > 0 ? (
                  <span className="text-sm text-rouge">sans {bloquant.join(', ')}</span>
                ) : null}
                {parution(recette) === 'programmee' ? (
                  <span className="text-sm text-bois">
                    paraît le {jourEnToutesLettres(enJour(recette.publishedAt)!)}
                  </span>
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
