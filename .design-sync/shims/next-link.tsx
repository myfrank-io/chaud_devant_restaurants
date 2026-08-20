/**
 * Doublure de next/link pour le bundle design-sync : hors de Next il n'y a
 * pas de routeur, et un lien y est une ancre. Le DOM rendu est identique à
 * celui de next/link (une <a> avec les mêmes classes et enfants) — seule la
 * navigation SPA disparaît, ce qui est le comportement honnête dans l'outil
 * de design.
 */
import * as React from 'react'

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  prefetch?: boolean
  replace?: boolean
  scroll?: boolean
}

export default function Link({
  href,
  prefetch: _prefetch,
  replace: _replace,
  scroll: _scroll,
  children,
  ...reste
}: LinkProps) {
  return (
    <a href={href} {...reste}>
      {children}
    </a>
  )
}
