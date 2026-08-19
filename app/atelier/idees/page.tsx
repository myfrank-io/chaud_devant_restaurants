import Link from 'next/link'

import { BaseAbsente } from '@/components/atelier/BaseAbsente'
import { Bouton } from '@/components/atelier/Champs'
import { listeLesIdees } from '@/lib/atelier'
import { isDatabaseConfigured } from '@/lib/db'

import { archiveUneIdeeAction, creeUneIdeeAction, supprimeUneIdeeAction } from '../actions'

export default async function Idees() {
  if (!isDatabaseConfigured()) return <BaseAbsente />

  const idees = await listeLesIdees()
  const vivantes = idees.filter((idee) => !idee.archivee)
  const archivees = idees.filter((idee) => idee.archivee)

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-display text-3xl font-black text-fonte">Boîte à idées</h1>
        <p className="text-base text-fonte/60">Coche, et ça part aux archives.</p>
      </div>

      <form action={creeUneIdeeAction} className="mt-6 flex flex-wrap items-end gap-3">
        <div className="min-w-0 grow basis-64">
          <label htmlFor="texte" className="text-xs font-bold uppercase tracking-[0.15em] text-bois">
            Une idée
          </label>
          <input
            id="texte"
            name="texte"
            required
            autoComplete="off"
            placeholder="Le gratin de courge avec la croûte de noisette"
            className="mt-1 w-full border-2 border-fonte/20 bg-papier px-3 py-2 text-base text-fonte outline-none transition focus:border-rouge"
          />
        </div>
        <Bouton type="submit">Ajouter</Bouton>
      </form>

      <ul className="mt-8 max-w-3xl divide-y divide-fonte/10 border-y-2 border-fonte/15">
        {vivantes.map((idee) => (
          <li key={idee.id} className="flex items-center gap-3 py-2.5">
            {/* La case est un bouton de formulaire : ça marche sans JavaScript,
                et un clic suffit — pas de case à cocher puis de bouton valider. */}
            <form action={archiveUneIdeeAction} className="flex">
              <input type="hidden" name="id" value={idee.id} />
              <input type="hidden" name="archivee" value="1" />
              {/* La case fait 20px a l'oeil, 40px sous le doigt : le bouton
                  deborde en marges negatives sans bouger la ligne. */}
              <button
                type="submit"
                aria-label={`Archiver « ${idee.texte} »`}
                className="group -m-2.5 grid size-10 shrink-0 place-items-center"
              >
                <span className="size-5 border-2 border-fonte/30 transition group-hover:border-rouge group-hover:bg-rouge/15" />
              </button>
            </form>
            <span className="min-w-0 break-words text-lg leading-snug text-fonte">{idee.texte}</span>
            <Link
              href={`/atelier/post/nouveau?titre=${encodeURIComponent(idee.texte)}&retour=${encodeURIComponent('/atelier/idees')}`}
              className="ml-auto shrink-0 py-2 text-sm text-fonte/45 underline-offset-4 transition hover:text-rouge hover:underline"
            >
              en faire un post
            </Link>
          </li>
        ))}

        {vivantes.length === 0 ? (
          <li className="py-4 text-lg text-fonte/55">
            La boîte est vide. C’est bon signe, ou pas.
          </li>
        ) : null}
      </ul>

      {archivees.length > 0 ? (
        <section className="mt-10">
          <h2 className="font-display text-xl font-black text-fonte/45">Archivées</h2>
          <ul className="mt-3 max-w-3xl space-y-1.5">
            {archivees.map((idee) => (
              <li key={idee.id} className="flex items-center gap-3">
                <form action={archiveUneIdeeAction} className="flex">
                  <input type="hidden" name="id" value={idee.id} />
                  <input type="hidden" name="archivee" value="0" />
                  <button
                    type="submit"
                    aria-label={`Remettre « ${idee.texte} » dans la boîte`}
                    className="group -m-2.5 grid size-10 shrink-0 place-items-center"
                  >
                    <span className="flex size-5 items-center justify-center border-2 border-fonte/20 text-sm text-fonte/45 transition group-hover:border-rouge group-hover:text-rouge">
                      ✓
                    </span>
                  </button>
                </form>
                <span className="min-w-0 break-words text-base text-fonte/40 line-through">
                  {idee.texte}
                </span>
                <form action={supprimeUneIdeeAction} className="ml-auto">
                  <input type="hidden" name="id" value={idee.id} />
                  <Bouton type="submit" variante="discret" className="-mr-2 !px-2 !text-sm">
                    Supprimer
                  </Bouton>
                </form>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  )
}
