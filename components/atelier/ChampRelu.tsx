'use client'

import { useState } from 'react'

import { verifie } from '@/lib/garde-fous'

/**
 * Un champ de texte qui se relit pendant qu'on ecrit.
 *
 * Les interdits de la charte se verifient ici plutot qu'a la publication :
 * corriger une accroche en la tapant coute une seconde, la corriger apres
 * coup demande de rouvrir la fiche et de se rappeler pourquoi.
 *
 * L'alerte n'empeche jamais d'enregistrer. Voir lib/garde-fous.ts.
 */
export function ChampRelu({
  nom,
  libelle,
  aide,
  valeurInitiale,
  lignes = 3,
  emojiInterdits = false,
}: {
  nom: string
  libelle: string
  aide?: string
  valeurInitiale?: string | null
  lignes?: number
  emojiInterdits?: boolean
}) {
  const [texte, setTexte] = useState(valeurInitiale ?? '')
  const alertes = verifie(texte, { emojiInterdits })

  return (
    <div>
      <label htmlFor={nom} className="text-xs font-bold uppercase tracking-[0.15em] text-bois">
        {libelle}
      </label>
      {aide ? <p className="mt-0.5 text-sm text-fonte/50">{aide}</p> : null}
      <textarea
        id={nom}
        name={nom}
        rows={lignes}
        value={texte}
        onChange={(evenement) => setTexte(evenement.target.value)}
        className="mt-1 w-full resize-y border-2 border-fonte/20 bg-papier px-3 py-2 text-base leading-relaxed text-fonte outline-none transition focus:border-rouge"
      />

      {alertes.length > 0 ? (
        <ul className="mt-1.5 space-y-1">
          {alertes.map((alerte) => (
            <li key={`${alerte.motif}-${alerte.extrait}`} className="text-sm text-rouge">
              « {alerte.extrait} » — {alerte.motif}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
