import Link from 'next/link'

/** L'atelier lit et ecrit tout dans Postgres : sans base, il n'a rien a montrer. */
export function BaseAbsente() {
  return (
    <div className="border-2 border-rouge/40 bg-creme/50 px-5 py-6">
      <h1 className="font-display text-2xl font-black text-fonte">La base n’est pas joignable.</h1>
      <p className="mt-2 max-w-xl text-lg leading-relaxed text-fonte/70">
        L’atelier lit et écrit tout dans Postgres. Tant que <code>DATABASE_URL</code> n’est pas
        branché, il n’y a rien à afficher et rien à enregistrer.{' '}
        <Link href="/etat" className="text-rouge underline underline-offset-4">
          Voir l’état technique
        </Link>
        .
      </p>
    </div>
  )
}
