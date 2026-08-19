import type { Metadata } from 'next'

import { getSubscriberStats } from '@/lib/subscribers'

export const metadata: Metadata = {
  title: 'Dossier',
  // Page non listee (QG 6.5) : jamais dans le menu, jamais dans l'index.
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

/**
 * Page de preuve, pour bailleurs et investisseurs.
 *
 * L'URL existe des la V1 pour prendre l'habitude d'y accumuler les preuves ; le
 * contenu se remplit a partir du mois 9. Ce qui est affiche ici est lu dans
 * Postgres et rien d'autre : aucun chiffre n'est saisi a la main, pour qu'on ne
 * puisse jamais montrer a un tiers un nombre qui ne vient pas de la base.
 */
export default async function Dossier() {
  const stats = await getSubscriberStats()

  return (
    <main className="min-h-svh bg-fonte px-6 py-16 text-creme sm:px-8">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-creme/40">
          Document de travail — page non listée
        </p>
        <h1 className="mt-4 font-display text-4xl font-black leading-tight sm:text-5xl">
          Chaud Devant — dossier
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-creme/70">
          L&rsquo;état de l&rsquo;audience et de la liste, lu en direct dans la base. Les sections
          non renseignées le sont parce que la donnée n&rsquo;existe pas encore, pas parce
          qu&rsquo;elle est mauvaise.
        </p>

        <section className="mt-14">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-creme/40">
            La liste
          </h2>
          {stats ? (
            <dl className="mt-6 grid gap-6 sm:grid-cols-2">
              <Stat label="Inscrits" value={stats.total} />
              <Stat label="Confirmés — menus dus à l’ouverture" value={stats.confirmed} />
            </dl>
          ) : (
            <p className="mt-6 text-lg text-creme/60">
              Base non joignable : aucun chiffre ne peut être affiché ici.
            </p>
          )}
        </section>

        <section className="mt-14">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-creme/40">
            Densité par ville
          </h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-creme/60">
            La réponse chiffrée à « où ouvrir ». Elle se construit une inscription à la fois.
          </p>
          {stats && stats.topCities.length > 0 ? (
            <ol className="mt-6 space-y-2">
              {stats.topCities.map((row) => (
                <li
                  key={row.city}
                  className="flex items-baseline justify-between gap-4 border-b border-creme/10 pb-2"
                >
                  <span className="min-w-0 break-words text-lg">{row.city}</span>
                  <span className="shrink-0 font-display text-lg font-bold">{row.count}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="mt-6 text-lg text-creme/60">
              Pas encore d&rsquo;inscrit confirmé avec une ville.
            </p>
          )}
        </section>

        <section className="mt-14">
          <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-creme/40">
            Reste à documenter
          </h2>
          <ul className="mt-6 space-y-2 text-lg text-creme/60">
            <li>Courbe d&rsquo;audience et meilleures vidéos, par plateforme</li>
            <li>Retombées et partenariats</li>
            <li>Le concept complet, la carte, le format de salle</li>
            <li>Le modèle économique et le plan de financement</li>
          </ul>
        </section>
      </div>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-t border-creme/20 pt-4">
      <dt className="text-sm text-creme/50">{label}</dt>
      <dd className="mt-1 font-display text-4xl font-black">{value}</dd>
    </div>
  )
}
