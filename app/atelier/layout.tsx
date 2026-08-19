import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Embleme } from '@/components/Logo'
import { estConnecte } from '@/lib/auth'

import { deconnexionAction } from './actions'

export const metadata: Metadata = {
  title: 'Atelier',
  robots: { index: false, follow: false },
}

// Rien ici ne doit etre mis en cache : le contenu depend du cookie de session.
export const dynamic = 'force-dynamic'

const ONGLETS = [
  { href: '/atelier', libelle: 'Calendrier' },
  { href: '/atelier/lignes', libelle: 'À préparer' },
  { href: '/atelier/idees', libelle: 'Idées' },
  { href: '/atelier/recettes', libelle: 'Recettes du site' },
]

export default async function AtelierLayout({ children }: { children: React.ReactNode }) {
  // La garde est ici plutot que dans chaque page : une page ajoutee sous
  // /atelier est protegee sans qu'on ait a y penser.
  if (!(await estConnecte())) redirect('/login')

  return (
    <div className="papier min-h-svh">
      <header className="border-b-2 border-fonte/15 bg-creme">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3.5">
          <Link href="/atelier" className="flex items-center gap-2.5">
            <Embleme className="w-7 text-rouge" />
            <span className="font-display text-lg font-black text-fonte">Atelier</span>
          </Link>

          <nav className="flex flex-wrap gap-x-5 gap-y-1">
            {ONGLETS.map((onglet) => (
              <Link
                key={onglet.href}
                href={onglet.href}
                className="text-base text-fonte/70 underline-offset-4 transition hover:text-rouge hover:underline"
              >
                {onglet.libelle}
              </Link>
            ))}
          </nav>

          <form action={deconnexionAction} className="ml-auto">
            <button
              type="submit"
              className="text-sm text-fonte/45 underline-offset-4 transition hover:text-rouge hover:underline"
            >
              Sortir
            </button>
          </form>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  )
}
