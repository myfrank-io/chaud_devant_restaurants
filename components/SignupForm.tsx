'use client'

import { useActionState } from 'react'

import { subscribeAction } from '@/app/actions'
import { initialSubscribeState } from '@/lib/subscribe-state'

/**
 * Un champ, un bouton, une case.
 *
 * Le trait sous le texte plutot qu'une boite arrondie : les champs encadres
 * gris font logiciel, et on vend une cocotte.
 */
export function SignupForm() {
  const [state, formAction, pending] = useActionState(subscribeAction, initialSubscribeState)

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

      <p className="text-xs leading-relaxed text-fonte/55">
        Ton adresse reste chez nous, et tu te désinscris en un clic depuis n&rsquo;importe quel
        mail.
      </p>
    </form>
  )
}
