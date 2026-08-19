import Link from 'next/link'

import { Logo } from '@/components/Logo'

/** Gabarit des pages courtes du parcours d'inscription : même papier, même cocotte. */
export function PageSimple({
  titre,
  children,
}: {
  titre: string
  children: React.ReactNode
}) {
  return (
    <>
      <div aria-hidden="true" className="nappe h-4 w-full" />
      <main className="papier grain relative isolate flex min-h-svh items-center px-6 py-16 sm:px-8">
        <div className="relative mx-auto w-full max-w-xl text-center">
          <Link href="/" className="inline-block">
            <Logo className="mx-auto w-52 text-rouge" />
          </Link>

          <h1 className="mt-10 font-display text-4xl font-black leading-[1.05] text-fonte sm:text-5xl">
            {titre}
          </h1>

          <div className="mx-auto mt-6 max-w-md space-y-5 text-lg leading-relaxed text-fonte/80">
            {children}
          </div>
        </div>
      </main>
    </>
  )
}
