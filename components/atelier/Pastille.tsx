import { LIBELLE_FORMAT, LIBELLE_STATUT, type Format, type Statut } from '@/lib/atelier'

/** Couleur par statut : on doit voir d'un coup d'œil ce qui reste à faire. */
const TON_STATUT: Record<Statut, string> = {
  idee: 'border-fonte/25 text-fonte/60',
  tourner: 'border-rouge/60 text-rouge',
  monter: 'border-bois/70 text-bois',
  pret: 'border-vert/60 text-vert',
  publie: 'border-fonte/15 text-fonte/35',
}

export function PastilleStatut({ statut }: { statut: Statut }) {
  return (
    <span
      className={`inline-block border px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${TON_STATUT[statut]}`}
    >
      {LIBELLE_STATUT[statut]}
    </span>
  )
}

export function PastilleFormat({ format }: { format: Format }) {
  return (
    <span className="inline-block border border-fonte/20 px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wider text-fonte/55">
      {LIBELLE_FORMAT[format]}
    </span>
  )
}
