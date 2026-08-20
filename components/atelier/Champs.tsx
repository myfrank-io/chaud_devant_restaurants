/** Les briques de formulaire de l'atelier : un seul endroit a retoucher. */

const CADRE =
  'mt-1 w-full border-2 border-fonte/20 bg-papier px-3 py-2 text-base text-fonte outline-none transition focus:border-rouge'

export function Etiquette({ pour, children }: { pour: string; children: React.ReactNode }) {
  return (
    <label htmlFor={pour} className="text-xs font-bold uppercase tracking-[0.15em] text-bois">
      {children}
    </label>
  )
}

export function Texte({
  nom,
  libelle,
  valeur,
  type = 'text',
  requis = false,
  aide,
  placeholder,
}: {
  nom: string
  libelle: string
  valeur?: string | number | null
  type?: string
  requis?: boolean
  aide?: string
  placeholder?: string
}) {
  return (
    <div>
      <Etiquette pour={nom}>{libelle}</Etiquette>
      {aide ? <p className="mt-0.5 text-sm text-fonte/50">{aide}</p> : null}
      <input
        id={nom}
        name={nom}
        type={type}
        required={requis}
        placeholder={placeholder}
        defaultValue={valeur ?? undefined}
        className={CADRE}
      />
    </div>
  )
}

export function Choix({
  nom,
  libelle,
  valeur,
  options,
  vide,
  /**
   * A preciser des que le meme champ apparait plusieurs fois sur une page —
   * une liste de dossiers, par exemple. Sans ca, deux elements partagent un
   * identifiant et l'etiquette de l'un active le champ de l'autre.
   */
  identifiant,
}: {
  nom: string
  libelle: string
  valeur?: string | null
  options: { valeur: string; libelle: string }[]
  vide?: string
  identifiant?: string
}) {
  const id = identifiant ?? nom

  return (
    <div>
      <Etiquette pour={id}>{libelle}</Etiquette>
      <select id={id} name={nom} defaultValue={valeur ?? ''} className={CADRE}>
        {vide ? <option value="">{vide}</option> : null}
        {options.map((option) => (
          <option key={option.valeur} value={option.valeur}>
            {option.libelle}
          </option>
        ))}
      </select>
    </div>
  )
}

export function Liste({
  nom,
  libelle,
  aide,
  valeur,
  lignes = 6,
}: {
  nom: string
  libelle: string
  aide?: string
  valeur?: string[] | null
  lignes?: number
}) {
  return (
    <div>
      <Etiquette pour={nom}>{libelle}</Etiquette>
      {aide ? <p className="mt-0.5 text-sm text-fonte/50">{aide}</p> : null}
      <textarea
        id={nom}
        name={nom}
        rows={lignes}
        defaultValue={(valeur ?? []).join('\n')}
        className={`${CADRE} resize-y leading-relaxed`}
      />
    </div>
  )
}

export function Bouton({
  children,
  variante = 'plein',
  ...reste
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'plein' | 'contour' | 'discret' }) {
  const tons = {
    plein: 'bg-rouge text-creme hover:bg-rouge-sombre',
    contour: 'border-2 border-fonte/25 text-fonte hover:border-rouge hover:text-rouge',
    discret: 'text-fonte/45 hover:text-rouge underline-offset-4 hover:underline',
  }[variante]

  return (
    <button
      {...reste}
      className={`px-4 py-2.5 font-display text-base font-bold transition ${tons} ${reste.className ?? ''}`}
    >
      {children}
    </button>
  )
}
