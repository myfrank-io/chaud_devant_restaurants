'use client'

import { useActionState } from 'react'

import { subscribeAction } from '@/app/actions'
import { SOCIAL_LINKS } from '@/lib/site'
import { initialSubscribeState, type Issue } from '@/lib/subscribe-state'

/**
 * Un champ, un bouton, une case.
 *
 * Le trait sous le texte plutot qu'une boite arrondie : les champs encadres
 * gris font logiciel, et on vend une cocotte.
 */
export function SignupForm() {
  const [state, formAction, pending] = useActionState(subscribeAction, initialSubscribeState)

  // Une fois inscrit, le formulaire cede la place au message, au meme endroit.
  // Changer de page pour trois lignes fait perdre le fil a qui vient de lire
  // le carton, et ramene au point de depart pour rien.
  if (state.issue) return <Fait issue={state.issue} />

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <div>
        <label htmlFor="email" className="text-xs font-bold uppercase tracking-[0.15em] text-bois">
          Ton mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="ton@email.fr"
          className="w-full border-0 border-b-2 border-fonte/25 bg-transparent px-1 py-2.5 font-display text-lg text-fonte placeholder:text-fonte/35 outline-none transition focus:border-rouge"
        />
      </div>

      {/* Champ piege a robots : masque a l'oeil et retire du parcours clavier. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="site-web">Ne remplis pas ce champ</label>
        <input id="site-web" name="site-web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {/*
        Case decochee, et elle doit le rester : une case pre-cochee ne vaut pas
        consentement. Elle ne conditionne rien — le menu offert arrive de toute
        facon, c'est l'objet meme de l'inscription. Elle ne porte que le reste.
      */}
      <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-relaxed text-fonte/70">
        <input
          type="checkbox"
          name="nouvelles"
          value="1"
          className="mt-0.5 size-4 shrink-0 accent-[var(--color-rouge)]"
        />
        <span>Envoie-moi aussi les recettes et les nouvelles, de temps en temps.</span>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-rouge px-6 py-4 font-display text-xl font-black tracking-wide text-creme transition hover:bg-rouge-sombre focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fonte disabled:opacity-70"
      >
        {pending ? 'Une seconde…' : 'Je prends'}
      </button>

      {state.error ? (
        <p
          role="alert"
          className="border-l-4 border-rouge bg-rouge/10 px-3 py-2 text-sm text-rouge-sombre"
        >
          {state.error}
        </p>
      ) : null}

      <p className="text-xs leading-relaxed text-fonte/55">
        Tu te désinscris en un clic depuis n&rsquo;importe quel mail.
      </p>
    </form>
  )
}

const MESSAGES: Record<Issue, { titre: string; texte: string }> = {
  envoye: {
    titre: 'Va voir tes mails.',
    texte:
      'On vient de t’envoyer un message pour vérifier que cette adresse est bien la tienne. Un clic, et c’est réglé. Regarde dans les indésirables, on n’est jamais à l’abri.',
  },
  'sans-mail': {
    titre: 'C’est noté.',
    texte:
      'Ton inscription est enregistrée. Le mail de confirmation part dès que possible — on a un petit souci d’envoi de notre côté, ça ne vient pas de toi.',
  },
  connu: {
    titre: 'Tu y es déjà.',
    texte: 'Cette adresse est déjà confirmée. Pas besoin de recommencer, ça ne double pas le cadeau.',
  },
}

function Fait({ issue }: { issue: Issue }) {
  const { titre, texte } = MESSAGES[issue]

  return (
    <div className="mt-7 text-center">
      <p className="font-display text-2xl font-black leading-tight text-fonte">{titre}</p>
      <p className="mt-3 text-base leading-relaxed text-fonte/70">{texte}</p>

      <ul className="mt-6 flex flex-wrap justify-center gap-3">
        {SOCIAL_LINKS.map((lien) => (
          <li key={lien.label}>
            <a
              href={lien.href}
              rel="me noopener"
              className="inline-block border-2 border-rouge px-4 py-2 font-display text-base text-rouge transition hover:bg-rouge hover:text-creme"
            >
              {lien.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
