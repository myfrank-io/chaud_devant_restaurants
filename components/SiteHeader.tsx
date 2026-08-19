import Link from 'next/link'

/**
 * En-tete du site, home comprise. /dossier n'y figure jamais : page non listee.
 */
export function SiteHeader() {
  return (
    <header>
      <div aria-hidden="true" className="nappe h-3 w-full" />
      <div className="border-b-2 border-fonte/15 bg-papier">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-6 px-6 py-4 sm:px-8">
          <Link
            href="/"
            className="font-display text-xl font-black uppercase leading-none tracking-tight text-rouge"
          >
            Chaud Devant
          </Link>
          <nav>
            <ul className="flex gap-6 font-display text-base">
              <li>
                <Link
                  href="/recettes"
                  className="text-fonte/75 underline-offset-4 transition hover:text-rouge hover:underline"
                >
                  Recettes
                </Link>
              </li>
              <li>
                <Link
                  href="/le-concept"
                  className="text-fonte/75 underline-offset-4 transition hover:text-rouge hover:underline"
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
