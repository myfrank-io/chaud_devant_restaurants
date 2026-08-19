import type { Metadata } from 'next'

import { PageSimple } from '@/components/Page'
import { unsubscribe } from '@/lib/subscribers'

export const metadata: Metadata = {
  title: 'Désinscription',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default async function Desinscription({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams

  if (!token) {
    return (
      <PageSimple titre="Ce lien ne marche pas.">
        <p>Reprends le lien de désinscription en entier depuis un de nos mails.</p>
      </PageSimple>
    )
  }

  let done = false
  try {
    done = await unsubscribe(token)
  } catch (error) {
    console.error('[desinscription] traitement impossible', error)
    return (
      <PageSimple titre="Ça a coincé.">
        <p>
          On n&rsquo;a pas réussi à te désinscrire à l&rsquo;instant. Réessaie dans quelques
          minutes — et si ça résiste, réponds simplement à un de nos mails, on le fera à la main.
        </p>
      </PageSimple>
    )
  }

  if (!done) {
    return (
      <PageSimple titre="On ne te trouve pas.">
        <p>
          Ce lien ne correspond à aucune inscription. Il est possible que ce soit déjà fait, auquel
          cas tu ne recevras plus rien.
        </p>
      </PageSimple>
    )
  }

  return (
    <PageSimple titre="C’est fait.">
      <p>
        Tu ne recevras plus de mails de notre part. Pas de rancune, pas de question de sortie, pas
        de « tu es sûr ».
      </p>
      <p>La porte reste ouverte si un jour l&rsquo;odeur de la cocotte te manque.</p>
    </PageSimple>
  )
}
