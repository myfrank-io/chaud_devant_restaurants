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

  const { founderNumber } = result

  return (
    <PageSimple titre={founderNumber ? `Tu es Fondateur n° ${founderNumber}.` : 'C’est confirmé.'}>
      {founderNumber ? (
        <>
          <p>
            Ton prénom sera gravé sur le mur de cocottes, et il y aura une cocotte offerte à ta
            table le soir de l&rsquo;ouverture. Garde ce numéro, il ne bougera plus.
          </p>
          <p>Le carnet arrive dans ta boîte mail. Dix recettes, rien à faire de plus.</p>
        </>
      ) : (
        <>
          <p>
            Les 500 places de Fondateurs sont prises — tu es arrivé après, et on ne va pas te
            raconter d&rsquo;histoires là-dessus.
          </p>
          <p>
            Tu restes sur la liste, et tu réserveras avant tout le monde le soir de
            l&rsquo;ouverture. Le carnet arrive dans ta boîte mail.
          </p>
        </>
      )}
      {result.status === 'already_confirmed' ? (
        <p className="text-base text-creme/55">
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
