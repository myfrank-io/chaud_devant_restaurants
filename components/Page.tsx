import Link from 'next/link'

/** Gabarit des pages courtes : même lumière que le hero, un seul bloc de texte. */
export function PageSimple({
  titre,
  children,
}: {
  titre: string
  children: React.ReactNode
}) {
  return (
    <main className="lumiere-cocotte grain relative isolate flex min-h-svh items-center px-6 py-20 sm:px-8">
      <div className="relative mx-auto w-full max-w-xl">
        <Link
          href="/"
          className="font-display text-2xl font-black leading-none text-creme/70 transition hover:text-creme"
        >
          Chaud Devant
        </Link>
        <h1 className="mt-10 font-display text-4xl font-black leading-tight text-creme sm:text-5xl">
          {titre}
        </h1>
        <div className="mt-6 space-y-5 text-lg leading-relaxed text-creme/80">{children}</div>
      </div>
    </main>
  )
}
