import type { MetadataRoute } from 'next'

import { siteUrl } from '@/lib/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // /dossier, /etat et /atelier ne sont pas listees ; les deux dernieres
      // sont des pages de parcours qui n'ont aucune raison de remonter dans
      // une recherche.
      disallow: ['/atelier', '/dossier', '/etat', '/login', '/confirmation', '/desinscription'],
    },
    sitemap: `${siteUrl()}/sitemap.xml`,
  }
}
