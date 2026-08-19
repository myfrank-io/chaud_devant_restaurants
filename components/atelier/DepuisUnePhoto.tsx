'use client'

import { useRef, useState } from 'react'

import { redigeDepuisUnePhotoAction } from '@/app/atelier/actions'

/**
 * Photographier un plat, et repartir avec le post ecrit.
 *
 * L'image est reduite dans le navigateur avant d'etre envoyee. Une photo de
 * telephone pese trois a cinq megaoctets pour une definition dont le modele
 * n'exploite rien au-dela de 1568 pixels : la reduire divise l'attente et le
 * cout par un facteur qui se compte en dizaines, sans rien changer a ce qui
 * est lu.
 *
 * `capture="environment"` ouvre l'appareil photo arriere sur telephone ; sur
 * ordinateur l'attribut est ignore et on retombe sur le selecteur de fichier.
 */

const COTE_MAX = 1568

export function DepuisUnePhoto({ ligneId }: { ligneId?: string }) {
  const [etat, setEtat] = useState<'repos' | 'travail'>('repos')
  const [erreur, setErreur] = useState<string | null>(null)
  const [apercu, setApercu] = useState<string | null>(null)
  const indication = useRef<HTMLInputElement>(null)

  async function choisie(fichier: File | undefined) {
    if (!fichier) return

    setErreur(null)
    setEtat('travail')

    try {
      const reduite = await reduis(fichier)
      setApercu(reduite.apercu)

      const donnees = new FormData()
      donnees.set('image', reduite.base64)
      donnees.set('type', reduite.mediaType)
      if (ligneId) donnees.set('ligne_id', ligneId)
      if (indication.current?.value) donnees.set('indication', indication.current.value)

      // L'action redirige vers la fiche du post en cas de succes ; on ne
      // revient ici que si elle a echoue.
      const echec = await redigeDepuisUnePhotoAction(donnees)
      if (echec) {
        setErreur(echec)
        setEtat('repos')
      }
    } catch (cause) {
      setErreur(cause instanceof Error ? cause.message : 'La photo n’a pas pu être lue.')
      setEtat('repos')
    }
  }

  return (
    <div className="border-2 border-dashed border-fonte/25 bg-creme/40 px-4 py-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <label
          className={`cursor-pointer bg-fonte px-4 py-2 font-display text-base font-bold text-creme transition hover:bg-fonte/85 ${
            etat === 'travail' ? 'pointer-events-none opacity-60' : ''
          }`}
        >
          {etat === 'travail' ? 'Ça écrit…' : 'Écrire depuis une photo'}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            disabled={etat === 'travail'}
            onChange={(evenement) => choisie(evenement.target.files?.[0])}
          />
        </label>

        <input
          ref={indication}
          type="text"
          placeholder="Une précision ? « c’est la version d’hiver »"
          disabled={etat === 'travail'}
          className="min-w-56 flex-1 border-b-2 border-fonte/20 bg-transparent px-1 py-1.5 text-base text-fonte placeholder:text-fonte/40 outline-none transition focus:border-rouge"
        />

        {apercu ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={apercu} alt="" className="size-12 shrink-0 border border-fonte/20 object-cover" />
        ) : null}
      </div>

      <p className="mt-2 text-sm text-fonte/55">
        Titre, format, hook, script, son et légende sont écrits pour toi. Tu relis, tu corriges.
        La fiche recette est créée vide : les ingrédients et les étapes, c’est toi.
      </p>

      {erreur ? (
        <p role="alert" className="mt-2 text-sm text-rouge">
          {erreur}
        </p>
      ) : null}
    </div>
  )
}

/** Reduit et reencode en JPEG. Renvoie le base64 nu, sans le prefixe data:. */
async function reduis(
  fichier: File
): Promise<{ base64: string; mediaType: 'image/jpeg'; apercu: string }> {
  const bitmap = await createImageBitmap(fichier)
  const facteur = Math.min(1, COTE_MAX / Math.max(bitmap.width, bitmap.height))

  const toile = document.createElement('canvas')
  toile.width = Math.round(bitmap.width * facteur)
  toile.height = Math.round(bitmap.height * facteur)

  const pinceau = toile.getContext('2d')
  if (!pinceau) throw new Error('Le navigateur n’a pas pu lire cette image.')
  pinceau.drawImage(bitmap, 0, 0, toile.width, toile.height)
  bitmap.close()

  const apercu = toile.toDataURL('image/jpeg', 0.82)
  return { base64: apercu.slice(apercu.indexOf(',') + 1), mediaType: 'image/jpeg', apercu }
}
