/**
 * Constantes editoriales du site.
 *
 * Regle 3.6 du QG : precis sur l'univers, muet sur les specs.
 * Aucune date, aucune ville d'implantation, aucun format de lieu ne doit
 * apparaitre ici ni dans aucun texte rendu au public.
 */

export const SITE_NAME = 'Chaud Devant'

export const SITE_DESCRIPTION =
  'La cuisine de nos grands-mères, filmée comme en 2026. Des plats mijotés servis dans la ' +
  'cocotte, posée au milieu de la table. Laisse ton mail : le jour où on ouvre, tu reçois ' +
  'un menu offert.'

/**
 * Photo de couverture : cocotte ouverte, vapeur qui monte.
 * Tant qu'elle vaut null, le hero utilise le degrade chaud de globals.css.
 * Deposer le fichier dans /public et passer le chemin ici (ex. '/hero-cocotte.jpg').
 */
export const HERO_IMAGE: string | null = null

/**
 * La promesse faite en echange d'une adresse. Un seul avantage, sans palier ni
 * plafond : tout inscrit confirme recoit un menu offert le jour de l'ouverture.
 *
 * Ecart assume par rapport a la section 7.2 du QG, qui borne tout cadeau — arbitre
 * en connaissance de cause. Consequence a garder en tete : l'engagement grandit
 * avec la liste, donc les conditions d'utilisation comptent plus que jamais
 * (voir /mentions-legales, a faire relire par un juriste).
 */
export const OFFRE = 'un menu offert le jour de l\u2019ouverture, a utiliser quand tu veux'

/**
 * Photos des cocottes et de la vaisselle deja chinees, pour /le-concept.
 * Regle 3.6 : on montre ce qui existe, jamais ce qui n'existe pas encore.
 * Tant que le tableau est vide, la section ne s'affiche pas — c'est voulu :
 * mieux vaut pas de moodboard qu'un moodboard qui promet.
 */
export const COCOTTES_PHOTOS: { src: string; alt: string }[] = []

export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/chauddevant' },
  { label: 'TikTok', href: 'https://tiktok.com/@chauddevant' },
  { label: 'YouTube', href: 'https://youtube.com/@chauddevant' },
] as const

export function siteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}
