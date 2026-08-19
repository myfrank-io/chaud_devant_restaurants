import type { Metadata } from 'next'

import { RecipeFilters } from '@/components/RecipeFilters'
import { SiteHeader } from '@/components/SiteHeader'
import { getPublishedRecipes } from '@/lib/notion'

export const metadata: Metadata = {
  title: 'Les recettes',
  description:
    'Toutes les recettes de Chaud Devant : les mijotés de la cocotte, les combos régressifs, ' +
    'les gestes de mémé. Ingrédients, étapes, et la vidéo qui va avec.',
}

export const revalidate = 3600

export default async function Recettes() {
  const recipes = await getPublishedRecipes()

  return (
    <>
      <SiteHeader />
      <main className="papier px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="font-display text-4xl font-black leading-tight text-fonte sm:text-5xl">
            Les recettes
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-fonte/70">
            Tout ce qui est passé dans la cocotte finit ici, écrit noir sur blanc. Tu peux les
            refaire sans remettre la vidéo en pause toutes les huit secondes.
          </p>

          {recipes.length === 0 ? (
            <p className="mt-12 max-w-xl text-lg leading-relaxed text-fonte/70">
              Il n&rsquo;y a encore rien à lire ici. Les premières recettes arrivent avec les
              premières vidéos — laisse ton mail sur la page d&rsquo;accueil et tu ne les rateras
              pas.
            </p>
          ) : (
            <RecipeFilters recipes={recipes} />
          )}
        </div>
      </main>
    </>
  )
}
