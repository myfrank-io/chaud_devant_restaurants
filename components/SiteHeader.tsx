import Link from 'next/link'

/**
 * En-tete du site, home comprise. /dossier n'y figure jamais : page non listee.
 *
 * Tout tient sur une ligne des 320px : le logotype ne doit jamais se replier
 * en « CHAUD / DEVANT ». Les tailles montent avec l'ecran, et le padding des
 * liens porte la zone tactile a ~44px sans changer le dessin.
 */
export function SiteHeader() {
  return (
    <header>
      <div aria-hidden="true" className="nappe h-3 w-full" />
      <div className="border-b-2 border-fonte/15 bg-papier">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-2 px-4 py-1.5 sm:gap-6 sm:px-8 sm:py-2">
          <Link
            href="/"
            className="whitespace-nowrap py-3 font-display text-base font-black uppercase leading-none tracking-tight text-rouge sm:text-xl"
          >
            Chaud Devant
          </Link>
          <nav>
            <ul className="flex gap-1 font-display text-sm sm:gap-3 sm:text-base">
              <li>
                <Link
                  href="/recettes"
                  className="inline-block whitespace-nowrap px-1.5 py-3 text-fonte/75 underline-offset-4 transition hover:text-rouge hover:underline sm:px-3"
                >
                  Recettes
                </Link>
              </li>
              <li>
                <Link
                  href="/le-concept"
                  className="inline-block whitespace-nowrap px-1.5 py-3 text-fonte/75 underline-offset-4 transition hover:text-rouge hover:underline sm:px-3"
                >
                  Le concept
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  )
}
