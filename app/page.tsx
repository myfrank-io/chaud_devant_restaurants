import Image from 'next/image'

import { FounderCounter } from '@/components/FounderCounter'
import { SignupForm } from '@/components/SignupForm'
import { getLatestRecipes } from '@/lib/notion'
import { HERO_IMAGE, SITE_NAME, SOCIAL_LINKS } from '@/lib/site'
import { countFounders } from '@/lib/subscribers'

// Le compteur de Fondateurs doit être juste à la seconde près : pas de cache.
export const dynamic = 'force-dynamic'

const MANIFESTE = [
  "On ne va pas te mentir : on ne sait pas encore à quoi ça ressemblera.",
  "On sait ce qu'on veut qu'on y ressente. Une cocotte en fonte posée au milieu de la table, le couvercle qu'on soulève, et personne qui attend son assiette.",
  "La cuisine du dimanche. Celle de ta grand-mère, celle que tu as mangée cent fois sans jamais penser à noter la recette.",
  "En attendant d'avoir une vraie cuisine, on cuisine sur Internet. On chine des cocottes. On rate des sauces. On filme tout.",
  "Si tu mets ton pain dans la sauce, tu es au bon endroit.",
]

export default async function Home() {
  const [founders, recipes] = await Promise.all([countFounders(), getLatestRecipes(3)])

  return (
    <main>
      <Hero founders={founders} />
      <Manifeste />
      {recipes.length > 0 ? <DernieresRecettes recipes={recipes} /> : null}
      <Pied />
    </main>
  )
}

function Hero({ founders }: { founders: number | null }) {
  return (
    <section className="lumiere-cocotte grain relative isolate min-h-svh overflow-hidden">
      {HERO_IMAGE ? (
        <>
          <Image
            src={HERO_IMAGE}
            alt=""
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover"
          />
          <div className="absolute inset-0 -z-10 bg-fonte/55" />
        </>
      ) : null}

      <div className="relative mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6 py-20 sm:px-8">
        <h1 className="font-display text-6xl font-black leading-[0.92] tracking-tight text-creme sm:text-7xl">
          Chaud
          <br />
          Devant
        </h1>

        <p className="mt-7 max-w-lg font-display text-xl leading-snug text-creme/85 sm:text-2xl">
          Un jour, tout ça sortira d&rsquo;une vraie cuisine et arrivera au milieu d&rsquo;une vraie
          table. En attendant, on cuisine sur Internet.
        </p>

        <div className="mt-10 rounded-sm border border-creme/15 bg-fonte/45 p-6 backdrop-blur-sm sm:p-7">
          <p className="text-base leading-relaxed text-creme/90">
            Laisse ton mail, reçois le carnet de {SITE_NAME} — 10 recettes de cocotte, tout de
            suite. Et tu sauras avant tout le monde où et quand on ouvre.
          </p>
          <SignupForm />
          <FounderCounter count={founders} />
        </div>
      </div>
    </section>
  )
}

function Manifeste() {
  return (
    <section className="bg-creme px-6 py-24 sm:px-8 sm:py-32">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
          Ce qu&rsquo;on fabrique
        </h2>
        <div className="mt-8 space-y-6">
          {MANIFESTE.map((ligne, i) => (
            <p
              key={ligne}
              className={
                i === 0 || i === MANIFESTE.length - 1
                  ? 'font-display text-2xl leading-snug font-semibold text-fonte sm:text-3xl'
                  : 'text-lg leading-relaxed text-fonte/80'
              }
            >
              {ligne}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}

function DernieresRecettes({
  recipes,
}: {
  recipes: Awaited<ReturnType<typeof getLatestRecipes>>
}) {
  return (
    <section className="border-t border-fonte/10 bg-creme-sombre px-6 py-24 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
          Les dernières recettes
        </h2>
        <ul className="mt-8 grid gap-6 sm:grid-cols-3">
          {recipes.map((recipe) => (
            <li key={recipe.slug}>
              <a
                href={`/recettes/${recipe.slug}`}
                className="block rounded-sm border border-fonte/10 bg-creme p-5 transition hover:border-fonte/25"
              >
                <p className="font-display text-xl font-bold leading-snug text-fonte">
                  {recipe.title}
                </p>
                <p className="mt-2 text-sm text-fonte/60">
                  {[recipe.category, recipe.minutes ? `${recipe.minutes} min` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

function Pied() {
  return (
    <footer className="bg-fonte px-6 py-16 sm:px-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <p className="font-display text-3xl font-black leading-none text-creme">
          Chaud
          <br />
          Devant
        </p>
        <div className="flex flex-col gap-3 sm:items-end">
          <ul className="flex gap-5">
            {SOCIAL_LINKS.map((lien) => (
              <li key={lien.label}>
                <a
                  href={lien.href}
                  rel="me noopener"
                  className="text-sm text-creme/70 underline-offset-4 transition hover:text-creme hover:underline"
                >
                  {lien.label}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="/mentions-legales"
            className="text-sm text-creme/40 underline-offset-4 transition hover:text-creme/70 hover:underline"
          >
            Mentions légales
          </a>
        </div>
      </div>
    </footer>
  )
}
