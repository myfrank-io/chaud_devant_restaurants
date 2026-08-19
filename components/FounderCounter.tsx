import { FOUNDERS_CAP } from '@/lib/site'

/**
 * Compteur des Fondateurs (QG 7.2). Le chiffre se lit dans Postgres, jamais
 * ailleurs. Quand la base est muette, on ne fabrique aucun nombre : on annonce
 * le plafond, qui lui est vrai.
 */
export function FounderCounter({ count }: { count: number | null }) {
  const remaining = count === null ? null : Math.max(FOUNDERS_CAP - count, 0)
  const full = remaining === 0

  return (
    <div className="mt-8 border-t border-creme/15 pt-6">
      <p className="font-display text-2xl font-bold text-creme">
        {count === null ? (
          <>
            {FOUNDERS_CAP} places de Fondateurs
          </>
        ) : (
          <>
            <span className="text-rouge-clair">{count}</span>
            <span className="text-creme/40"> / {FOUNDERS_CAP} </span>
            Fondateurs
          </>
        )}
      </p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-creme/60">
        {full
          ? "Les 500 sont pris. Tu peux toujours monter dans le bateau : tu réserveras avant tout le monde le soir de l’ouverture."
          : "Les 500 premiers ont leur prénom gravé sur le mur de cocottes, et une cocotte offerte à leur table le soir de l’ouverture."}
      </p>
    </div>
  )
}
