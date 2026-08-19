import Link from 'next/link'

import type { RecipeCard } from '@/lib/notion'

/** Carte de recette, partagee par la home et le hub : une seule mise en forme a maintenir. */
export function RecipeCardLink({ recipe }: { recipe: RecipeCard }) {
  return (
    <Link
      href={`/recettes/${recipe.slug}`}
      className="group block h-full overflow-hidden rounded-sm border border-fonte/10 bg-creme transition hover:border-fonte/30"
    >
      {recipe.cover ? (
        // Les URL de fichiers Notion expirent : pas d'optimisation en cache
        // derriere, on sert la source telle quelle.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.cover}
          alt=""
          loading="lazy"
          className="aspect-[4/5] w-full object-cover"
        />
      ) : (
        <div className="lumiere-cocotte aspect-[4/5] w-full" />
      )}
      <div className="p-5">
        <p className="font-display text-xl font-bold leading-snug text-fonte">{recipe.title}</p>
        <p className="mt-2 text-sm text-fonte/60">
          {[recipe.category, recipe.minutes ? `${recipe.minutes} min` : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </Link>
  )
}
