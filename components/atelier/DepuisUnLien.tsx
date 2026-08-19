'use client'

import { useState } from 'react'

/**
 * Importer une recette depuis un lien.
 *
 * Rien n'est genere : on lit le balisage `Recipe` que la page publie deja.
 * Ce que ca rend est exact — les quantites sont celles du site, pas une
 * approximation — et ca ne coute rien.
 *
 * La contrepartie est juridique plutot que technique, et elle est dite a
 * l'ecran : le texte importe appartient a quelqu'un d'autre. Il sert de base,
 * il se reecrit avant de paraitre, et la fiche reste bloquee tant que ce n'est
 * pas fait.
 */
export function DepuisUnLien({
  action,
  bouton = 'Importer',
  aide,
  contexte,
}: {
  /** L'action qui lit le lien. Elle redirige, ou rend un message d'echec. */
  action: (donnees: FormData) => Promise<string | undefined>
  bouton?: string
  aide: React.ReactNode
  /** Champs caches passes a l'action : la ligne, la date, le retour. */
  contexte?: Record<string, string | undefined>
}) {
  const [etat, setEtat] = useState<'repos' | 'travail'>('repos')
  const [erreur, setErreur] = useState<string | null>(null)

  async function importe(donnees: FormData) {
    setErreur(null)
    setEtat('travail')

    // L'action redirige vers la fiche en cas de succes : on ne revient ici
    // que si elle a echoue.
    const echec = await action(donnees)
    if (echec) {
      setErreur(echec)
      setEtat('repos')
    }
  }

  return (
    <form action={importe} className="border-2 border-dashed border-fonte/25 bg-creme/40 px-4 py-4">
      {Object.entries(contexte ?? {}).map(([nom, valeur]) =>
        valeur ? <input key={nom} type="hidden" name={nom} value={valeur} /> : null
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          name="lien"
          type="url"
          required
          disabled={etat === 'travail'}
          placeholder="https://… le lien d’une recette"
          className="min-w-64 flex-1 border-b-2 border-fonte/20 bg-transparent px-1 py-1.5 text-base text-fonte placeholder:text-fonte/40 outline-none transition focus:border-rouge"
        />
        <button
          type="submit"
          disabled={etat === 'travail'}
          className="bg-fonte px-4 py-2 font-display text-base font-bold text-creme transition hover:bg-fonte/85 disabled:opacity-60"
        >
          {etat === 'travail' ? 'Ça lit…' : bouton}
        </button>
      </div>

      <div className="mt-2 text-sm text-fonte/55">{aide}</div>

      {erreur ? (
        <p role="alert" className="mt-2 text-sm text-rouge">
          {erreur}
        </p>
      ) : null}
    </form>
  )
}
