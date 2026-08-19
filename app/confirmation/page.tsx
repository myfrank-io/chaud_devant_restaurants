import type { Metadata } from 'next'

import { PageSimple } from '@/components/Page'
import { confirmSubscriber } from '@/lib/subscribers'

export const metadata: Metadata = {
  title: 'Inscription confirmée',
  robots: { index: false },
}

export const dynamic = 'force-dynamic'

export default async function Confirmation({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await searchParams
  if (!token) return <LienInvalide />

  let result: Awaited<ReturnType<typeof confirmSubscriber>>
  try {
    result = await confirmSubscriber(token)
  } catch (error) {
    console.error('[confirmation] confirmation impossible', error)
    return (
      <PageSimple titre="Ça a coincé.">
        <p>
          On n&rsquo;a pas réussi à confirmer ton inscription. Ce n&rsquo;est pas ta faute. Reclique
          sur le lien du mail dans quelques minutes.
        </p>
      </PageSimple>
    )
  }

  if (result.status === 'unknown_token') return <LienInvalide />

  return (
    <PageSimple titre="C’est bon, tu es sur la liste.">
      <p>
        Le jour où on ouvre, tu reçois ton menu offert par mail. Tu l&rsquo;utilises quand tu veux —
        on ne te mettra pas la pression.
      </p>
      <p>D&rsquo;ici là, on cuisine. Tu vas nous voir passer.</p>
      {result.status === 'already_confirmed' ? (
        <p className="text-base text-fonte/55">
          Cette inscription était déjà confirmée. Rien de neuf, tout va bien.
        </p>
      ) : null}
    </PageSimple>
  )
}

function LienInvalide() {
  return (
    <PageSimple titre="Ce lien ne marche pas.">
      <p>
        Il a peut-être été coupé en deux par ta messagerie. Reprends-le en entier depuis le mail, ou
        réinscris-toi depuis la page d&rsquo;accueil.
      </p>
    </PageSimple>
  )
}
