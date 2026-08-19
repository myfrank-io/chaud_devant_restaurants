import type { MetadataRoute } from 'next'

import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /dossier est non listee ; les trois autres sont des pages de parcours
      // qui n'ont aucune raison de remonter dans une recherche.
      disallow: ['/dossier', '/etat', '/merci', '/confirmation', '/desinscription'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
