import Image from 'next/image'
import Link from 'next/link'

import { Embleme, Logo } from '@/components/Logo'
import { RecipeCardLink } from '@/components/RecipeCardLink'
import { SignupForm } from '@/components/SignupForm'
import { SiteHeader } from '@/components/SiteHeader'
import { getLatestRecipes } from '@/lib/recipes'
import { HERO_IMAGE, SOCIAL_LINKS } from '@/lib/site'
import { countInscrits } from '@/lib/subscribers'

// Une minute : le compteur d'inscrits est le seul contenu qui bouge vite, et
// une page servie depuis le cache reste plus rapide qu'une page recalculee a
// chaque visite. Personne ne verra la difference entre « live » et « il y a
// cinquante secondes ».
export const revalidate = 60

export default async function Home() {
  const [recipes, inscrits] = await Promise.all([getLatestRecipes(6), countInscrits()])

  return (
    <>
      <SiteHeader />
      <main>
        <Hero inscrits={inscrits} />
        <Contenu recipes={recipes} />
        <Pied />
      </main>
    </>
  )
}

/** Le bandeau de nappe : la marque tient dessus avant même le premier mot. */
function Nappe({ className = '' }: { className?: string }) {
  return <div aria-hidden="true" className={`nappe h-4 w-full ${className}`} />
}

function Hero({ inscrits }: { inscrits: number | null }) {
  return (
    <section className="papier grain relative isolate overflow-hidden px-6 py-16 sm:px-8 sm:py-24">
      {HERO_IMAGE ? (
        <>
          <Image src={HERO_IMAGE} alt="" fill priority sizes="100vw" className="-z-10 object-cover" />
          <div className="absolute inset-0 -z-10 bg-creme/80" />
        </>
      ) : null}

      <div className="relative mx-auto max-w-2xl text-center">
        {/* Le logotype porte le titre : le texte reste lisible par les machines
            et les lecteurs d'ecran via l'alternative, pas seulement dessine. */}
        <h1>
          <Logo className="mx-auto w-72 text-rouge sm:w-80" />
          <span className="sr-only">Chaud Devant</span>
        </h1>

        {/* Le carton de menu : double filet, papier plus clair, rien d'arrondi. */}
        <div className="mx-auto mt-10 max-w-lg border-[3px] border-rouge bg-papier p-1.5 text-left shadow-[6px_6px_0_0_var(--color-creme-fonce)]">
          <div className="border border-rouge/30 px-6 py-8 sm:px-8">
            <p className="text-center font-display text-3xl font-black leading-[1.05] text-fonte sm:text-4xl">
              Le jour où on ouvre le restaurant,
              <br />
              c&rsquo;est nous qui régalons.
            </p>
            <p className="mt-4 text-center text-base leading-relaxed text-fonte/70">
              Laisse ton mail et abonne-toi à nos réseaux, c&rsquo;est tout. Le jour de
              l&rsquo;ouverture, tu reçois un cadeau à utiliser quand tu veux !
            </p>
            <SignupForm />
            <Compteur inscrits={inscrits} />
          </div>
        </div>
      </div>
    </section>
  )
}

/**
 * Le compteur ne s'affiche que s'il a quelque chose a dire : base injoignable
 * ou liste vide, il disparait. Un « 0 inscrit » affiche fierement fait le
 * contraire de ce qu'un compteur est cense faire.
 */
function Compteur({ inscrits }: { inscrits: number | null }) {
  if (!inscrits) return null

  return (
    <p className="mt-6 border-t border-fonte/10 pt-4 text-center text-sm text-fonte/55">
      <span className="font-display text-base font-bold text-rouge">
        {inscrits.toLocaleString('fr-FR')}
      </span>{' '}
      {inscrits > 1 ? 'ont déjà laissé leur mail' : 'a déjà laissé son mail'}.
    </p>
  )
}

function Contenu({ recipes }: { recipes: Awaited<ReturnType<typeof getLatestRecipes>> }) {
  return (
    <section className="border-t-4 border-double border-rouge/40 bg-creme-fonce px-6 py-16 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-4xl">
        <div
          className={`flex flex-wrap items-baseline gap-4 ${
            recipes.length > 0 ? 'justify-between' : 'justify-center'
          }`}
        >
          <h2 className="font-display text-3xl font-black uppercase leading-none tracking-tight text-fonte sm:text-4xl">
            En attendant, on cuisine
          </h2>
          {recipes.length > 0 ? (
            <Link
              href="/recettes"
              className="font-display text-base text-rouge underline decoration-2 underline-offset-4 transition hover:text-rouge-sombre"
            >
              Toutes les recettes
            </Link>
          ) : null}
        </div>

        {recipes.length > 0 ? (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {recipes.map((recipe) => (
              <li key={recipe.id}>
                <RecipeCardLink recipe={recipe} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="mx-auto mt-10 max-w-xl text-center">
            <Embleme className="mx-auto w-24 text-rouge/45" />
            <p className="mt-6 font-display text-xl leading-relaxed text-fonte/80">
              Blanquette, bourguignon, hachis de queue de bœuf, tarte tatin retournée dans la
              cocotte.
            </p>
            <p className="mt-3 text-sm uppercase tracking-[0.18em] text-bois">Ça arrive</p>
          </div>
        )}
      </div>
    </section>
  )
}

function Pied() {
  return (
    <footer>
      <Nappe />
      <div className="fonte-chaude px-6 py-14 sm:px-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <Logo className="w-36 shrink-0 text-creme/85" />
          <div className="flex flex-col gap-3 sm:items-end">
            <ul className="flex gap-5">
              {SOCIAL_LINKS.map((lien) => (
                <li key={lien.label}>
                  <a
                    href={lien.href}
                    rel="me noopener"
                    className="font-display text-base text-creme/80 underline-offset-4 transition hover:text-creme hover:underline"
                  >
                    {lien.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex gap-5">
              <Link
                href="/le-concept"
                className="text-sm text-creme/45 underline-offset-4 transition hover:text-creme/80 hover:underline"
              >
                Le concept
              </Link>
              <Link
                href="/mentions-legales"
                className="text-sm text-creme/45 underline-offset-4 transition hover:text-creme/80 hover:underline"
              >
                Mentions légales
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
