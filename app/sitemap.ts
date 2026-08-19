import type { MetadataRoute } from 'next'

import { getPublishedRecipes } from '@/lib/notion'
import { siteUrl } from '@/lib/site'

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl()
  const recipes = await getPublishedRecipes()

  return [
    { url: `${base}/`, priority: 1 },
    { url: `${base}/recettes`, priority: 0.8 },
    { url: `${base}/le-concept`, priority: 0.6 },
    { url: `${base}/mentions-legales`, priority: 0.2 },
    ...recipes.map((recipe) => ({
      url: `${base}/recettes/${recipe.slug}`,
      priority: 0.7,
    })),
  ]
}
