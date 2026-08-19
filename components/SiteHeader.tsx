import Link from 'next/link'

/**
 * En-tete des pages interieures. La home n'en a pas : c'est une landing, pas un
 * menu (QG 6.5). /dossier n'y figure jamais — page non listee.
 */
export function SiteHeader() {
  return (
    <header className="border-b border-fonte/10 bg-creme">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-6 px-6 py-5 sm:px-8">
        <Link href="/" className="font-display text-xl font-black leading-none text-fonte">
          Chaud Devant
        </Link>
        <nav>
          <ul className="flex gap-5 text-sm">
            <li>
              <Link
                href="/recettes"
                className="text-fonte/70 underline-offset-4 transition hover:text-fonte hover:underline"
              >
                Recettes
              </Link>
            </li>
            <li>
              <Link
                href="/le-concept"
                className="text-fonte/70 underline-offset-4 transition hover:text-fonte hover:underline"
              >
                Le concept
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
