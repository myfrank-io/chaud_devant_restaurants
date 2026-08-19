import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { SiteHeader } from '@/components/SiteHeader'
import { getPublishedRecipes, getRecipeBySlug, isoDuration } from '@/lib/recipes'
import { siteUrl } from '@/lib/site'

// Quinze minutes : c'est le retard maximum d'une recette programmee. Une
// parution ne passe par aucune tache planifiee — la date est dans la requete —
// mais la page servie est en cache, et c'est cette fenetre qui la rafraichit.
export const revalidate = 900

export async function generateStaticParams() {
  const recipes = await getPublishedRecipes()
  return recipes.map((recipe) => ({ slug: recipe.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) return { title: 'Recette introuvable' }

  const description =
    recipe.angle ??
    `${recipe.title} — la recette, les ingrédients et les étapes, chez Chaud Devant.`

  return {
    title: recipe.title,
    description,
    alternates: { canonical: `/recettes/${recipe.slug}` },
    openGraph: {
      title: recipe.title,
      description,
      images: recipe.cover ? [recipe.cover] : undefined,
    },
  }
}

export default async function Recette({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const recipe = await getRecipeBySlug(slug)
  if (!recipe) notFound()

  // Balisage Recipe : c'est lui qui fait remonter la photo et le temps de
  // cuisson dans les resultats Google (QG 6.5, 11.3).
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: recipe.title,
    url: `${siteUrl()}/recettes/${recipe.slug}`,
    ...(recipe.cover ? { image: [recipe.cover] } : {}),
    ...(recipe.angle ? { description: recipe.angle } : {}),
    ...(recipe.minutes ? { totalTime: isoDuration(recipe.minutes) } : {}),
    ...(recipe.category ? { recipeCategory: recipe.category } : {}),
    recipeCuisine: 'Française',
    author: { '@type': 'Organization', name: 'Chaud Devant' },
    ...(recipe.ingredients.length > 0 ? { recipeIngredient: recipe.ingredients } : {}),
    ...(recipe.steps.length > 0
      ? {
          recipeInstructions: recipe.steps.map((text, index) => ({
            '@type': 'HowToStep',
            position: index + 1,
            text,
          })),
        }
      : {}),
  }

  return (
    <>
      <SiteHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main className="papier px-6 py-12 sm:px-8 sm:py-16">
        <article className="mx-auto max-w-2xl">
          <Link
            href="/recettes"
            className="text-sm text-fonte/50 underline-offset-4 transition hover:text-fonte hover:underline"
          >
            ← Toutes les recettes
          </Link>

          <h1 className="mt-6 font-display text-4xl font-black leading-tight text-fonte sm:text-5xl">
            {recipe.title}
          </h1>

          <p className="mt-4 text-sm text-fonte/60">
            {[
              recipe.category,
              recipe.minutes ? `${recipe.minutes} min` : null,
              recipe.difficulty,
              recipe.seasons.length > 0 ? recipe.seasons.join(', ') : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>

          {recipe.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.cover}
              alt={recipe.title}
              className="mt-8 aspect-[4/5] w-full rounded-sm object-cover"
            />
          ) : null}

          {recipe.intro.length > 0 ? (
            <div className="mt-8 space-y-4">
              {recipe.intro.map((para) => (
                <p key={para} className="text-lg leading-relaxed text-fonte/80">
                  {para}
                </p>
              ))}
            </div>
          ) : recipe.angle ? (
            <p className="mt-8 text-lg leading-relaxed text-fonte/80">{recipe.angle}</p>
          ) : null}

          {recipe.ingredients.length > 0 ? (
            <section className="mt-12">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
                Ingrédients
              </h2>
              <ul className="mt-5 space-y-2.5">
                {recipe.ingredients.map((item) => (
                  <li key={item} className="flex gap-3 text-lg leading-relaxed text-fonte/85">
                    <span aria-hidden="true" className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-rouge" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {recipe.steps.length > 0 ? (
            <section className="mt-12">
              <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
                Les étapes
              </h2>
              <ol className="mt-5 space-y-5">
                {recipe.steps.map((step, index) => (
                  <li key={step} className="flex gap-4">
                    <span className="font-display text-2xl font-black leading-none text-rouge/70">
                      {index + 1}
                    </span>
                    <p className="text-lg leading-relaxed text-fonte/85">{step}</p>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}

          {recipe.postUrl ? (
            <p className="mt-12">
              <a
                href={recipe.postUrl}
                rel="noopener"
                className="inline-block rounded-sm border border-fonte/25 px-5 py-3 text-base text-fonte transition hover:border-fonte/60"
              >
                Voir la vidéo
              </a>
            </p>
          ) : null}

          <aside className="mt-16 rounded-sm border border-fonte/15 bg-creme-fonce p-6">
            <p className="font-display text-xl font-bold leading-snug text-fonte">
              Il y en a d&rsquo;autres, et elles arrivent par mail.
            </p>
            <p className="mt-2 text-base leading-relaxed text-fonte/70">
              Laisse ton adresse sur la page d&rsquo;accueil : tu reçois la recette du dimanche, et
              un menu offert le jour où on ouvre.
            </p>
            <Link
              href="/"
              className="mt-5 inline-block rounded-sm bg-rouge px-5 py-3 font-display text-base font-bold text-creme transition hover:bg-rouge-sombre"
            >
              Je laisse mon mail
            </Link>
          </aside>
        </article>
      </main>
    </>
  )
}
