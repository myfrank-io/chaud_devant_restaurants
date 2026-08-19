'use client'

import { useState } from 'react'

import { importeUneRecetteAction } from '@/app/atelier/actions'

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
export function DepuisUnLien() {
  const [etat, setEtat] = useState<'repos' | 'travail'>('repos')
  const [erreur, setErreur] = useState<string | null>(null)

  async function importe(donnees: FormData) {
    setErreur(null)
    setEtat('travail')

    // L'action redirige vers la fiche en cas de succes : on ne revient ici
    // que si elle a echoue.
    const echec = await importeUneRecetteAction(donnees)
    if (echec) {
      setErreur(echec)
      setEtat('repos')
    }
  }

  return (
    <form action={importe} className="border-2 border-dashed border-fonte/25 bg-creme/40 px-4 py-4">
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
          {etat === 'travail' ? 'Ça lit…' : 'Importer'}
        </button>
      </div>

      <p className="mt-2 text-sm text-fonte/55">
        On lit le balisage que la page publie : titre, ingrédients, étapes, durée, photo. Rien
        n’est inventé, et ça ne coûte rien. Le texte reste celui du site — réécris-le avant de
        publier, la fiche ne partira pas en ligne tant que tu ne l’as pas enregistrée.
      </p>

      {erreur ? (
        <p role="alert" className="mt-2 text-sm text-rouge">
          {erreur}
        </p>
      ) : null}
    </form>
  )
}
