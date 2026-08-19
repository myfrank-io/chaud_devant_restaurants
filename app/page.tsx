import Image from 'next/image'
import Link from 'next/link'

import { RecipeCardLink } from '@/components/RecipeCardLink'
import { SignupForm } from '@/components/SignupForm'
import { getLatestRecipes } from '@/lib/notion'
import { HERO_IMAGE, SOCIAL_LINKS } from '@/lib/site'

export const revalidate = 3600

export default async function Home() {
  const recipes = await getLatestRecipes(6)

  return (
    <main>
      <Hero />
      <Contenu recipes={recipes} />
      <Pied />
    </main>
  )
}

function Hero() {
  return (
    <section className="lumiere-cocotte grain relative isolate min-h-svh overflow-hidden">
      {HERO_IMAGE ? (
        <>
          <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-fonte/55" />
        </>
      ) : null}

      <div className="relative mx-auto flex min-h-svh max-w-xl flex-col justify-center px-6 py-20 sm:px-8">
        <h1 className="font-display text-6xl font-black leading-[0.92] tracking-tight text-creme sm:text-7xl">
          Chaud
          <br />
          Devant
        </h1>

        <p className="mt-6 max-w-md font-display text-xl leading-snug text-creme/85 sm:text-2xl">
          La cocotte au milieu de la table. On se sert dedans.
        </p>

        <div className="mt-10 rounded-sm border border-creme/15 bg-fonte/45 p-6 backdrop-blur-sm sm:p-7">
          <p className="font-display text-xl leading-snug font-bold text-creme sm:text-2xl">
            Le jour où on ouvre, tu manges offert.
          </p>
          <p className="mt-3 text-base leading-relaxed text-creme/75">
            Laisse ton mail. On t&rsquo;envoie un menu offert le jour de l&rsquo;ouverture, à
            utiliser quand tu veux.
          </p>
          <SignupForm />
        </div>
      </div>
    </section>
  )
}

function Contenu({ recipes }: { recipes: Awaited<ReturnType<typeof getLatestRecipes>> }) {
  return (
    <section className="bg-creme px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-3xl font-black leading-tight text-fonte sm:text-4xl">
            En attendant, on cuisine
          </h2>
          {recipes.length > 0 ? (
            <Link
              href="/recettes"
              className="text-sm text-fonte/60 underline-offset-4 transition hover:text-fonte hover:underline"
            >
              Toutes les recettes
            </Link>
          ) : null}
        </div>

        {recipes.length > 0 ? (
          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCardLink recipe={recipe} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-fonte/70">
            Les premières recettes arrivent avec les premières vidéos. Blanquette, bourguignon,
            hachis, et les combos qu&rsquo;on fait tous en cachette.
          </p>
        )}
      </div>
    </section>
  )
}

function Pied() {
  return (
    <footer className="bg-fonte px-6 py-14 sm:px-8">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
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
          <div className="flex gap-5">
            <Link
              href="/le-concept"
              className="text-sm text-creme/40 underline-offset-4 transition hover:text-creme/70 hover:underline"
            >
              Le concept
            </Link>
            <Link
              href="/mentions-legales"
              className="text-sm text-creme/40 underline-offset-4 transition hover:text-creme/70 hover:underline"
            >
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
