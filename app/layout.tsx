import type { Metadata } from 'next'
import { Fraunces, Karla } from 'next/font/google'

import './globals.css'
import { SITE_DESCRIPTION, SITE_NAME, siteUrl } from '@/lib/site'

// Police variable : tout l'axe de graisse est disponible, du 400 du corps de
// texte au 900 du logotype, sans multiplier les fichiers charges.
const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

// Karla plutot qu'une grotesque d'interface : un peu bancale, chaleureuse,
// elle ne sonne pas logiciel.
const karla = Karla({
  subsets: ['latin'],
  variable: '--font-karla',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — la cocotte au milieu de la table`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: SITE_NAME,
    title: `${SITE_NAME} — la cocotte au milieu de la table`,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: 'summary_large_image' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${fraunces.variable} ${karla.variable}`}>
      <body className="papier text-fonte">{children}</body>
    </html>
  )
}
