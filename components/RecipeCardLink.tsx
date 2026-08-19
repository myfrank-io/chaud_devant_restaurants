import Link from 'next/link'

import { Embleme } from '@/components/Logo'
import type { Recipe } from '@/lib/recipes'

/** Carte de recette, partagee par la home et le hub : une seule mise en forme a maintenir. */
export function RecipeCardLink({ recipe }: { recipe: Recipe }) {
  return (
    <Link
      href={`/recettes/${recipe.slug}`}
      className="group block h-full border-2 border-fonte/15 bg-papier transition hover:border-rouge hover:shadow-[5px_5px_0_0_var(--color-creme-fonce)]"
    >
      {recipe.cover ? (
        // La photo est une adresse saisie dans l'atelier : on sert la source
        // telle quelle plutot que de la passer par l'optimiseur, qui exigerait
        // de declarer chaque domaine autorise.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={recipe.cover} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
      ) : (
        <div className="nappe flex aspect-[4/5] w-full items-center justify-center">
          <Embleme className="w-1/2 text-papier" />
        </div>
      )}
      <div className="border-t-2 border-fonte/15 p-5">
        <p className="font-display text-xl font-bold leading-snug text-fonte">{recipe.title}</p>
        <p className="mt-2 text-sm uppercase tracking-wide text-bois">
          {[recipe.category, recipe.minutes ? `${recipe.minutes} min` : null]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </div>
    </Link>
  )
}
