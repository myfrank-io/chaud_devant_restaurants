import type { Metadata } from 'next'

import { PageSimple } from '@/components/Page'
import { SOCIAL_LINKS } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Merci',
  robots: { index: false },
}

export default async function Merci({
  searchParams,
}: {
  searchParams: Promise<{ envoye?: string; connu?: string }>
}) {
  const params = await searchParams
  const dejaInscrit = params.connu === '1'
  const mailEnvoye = params.envoye === '1'

  if (dejaInscrit) {
    return (
      <PageSimple titre="Tu y es déjà.">
        <p>
          Cette adresse est déjà confirmée. Pas besoin de t&rsquo;inscrire deux fois, ça ne te
          donnera pas deux menus.
        </p>
        <Suivre />
      </PageSimple>
    )
  }

  return (
    <PageSimple titre={mailEnvoye ? 'Va voir tes mails.' : 'C’est noté.'}>
      {mailEnvoye ? (
        <p>
          On vient de t&rsquo;envoyer un message pour vérifier que cette adresse est bien la tienne.
          Un clic, et ta place est gardée. Regarde dans les indésirables, on n&rsquo;est jamais à
          l&rsquo;abri.
        </p>
      ) : (
        <p>
          Ton inscription est enregistrée. Le mail de confirmation part dès que possible — on a un
          petit souci d&rsquo;envoi de notre côté, ça ne vient pas de toi.
        </p>
      )}
      <Suivre />
    </PageSimple>
  )
}

function Suivre() {
  return (
    <ul className="flex flex-wrap justify-center gap-4 pt-2">
      {SOCIAL_LINKS.map((lien) => (
        <li key={lien.label}>
          <a
            href={lien.href}
            rel="me noopener"
            className="border-2 border-rouge px-4 py-2 font-display text-base text-rouge transition hover:bg-rouge hover:text-creme"
          >
            {lien.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
