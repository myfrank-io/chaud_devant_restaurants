'use client'

import { useActionState } from 'react'

import { subscribeAction } from '@/app/actions'
import { initialSubscribeState } from '@/lib/subscribe-state'

export function SignupForm() {
  const [state, formAction, pending] = useActionState(subscribeAction, initialSubscribeState)

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
        <div>
          <label htmlFor="email" className="sr-only">
            Ton adresse email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="ton@email.fr"
            className="w-full rounded-sm border border-creme/25 bg-fonte/40 px-4 py-3.5 text-base text-creme placeholder:text-creme/40 outline-none transition focus:border-creme/60 focus:bg-fonte/60"
          />
        </div>
        <div>
          <label htmlFor="city" className="sr-only">
            Ta ville
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            autoComplete="address-level2"
            placeholder="Ta ville"
            className="w-full rounded-sm border border-creme/25 bg-fonte/40 px-4 py-3.5 text-base text-creme placeholder:text-creme/40 outline-none transition focus:border-creme/60 focus:bg-fonte/60"
          />
        </div>
      </div>

      {/* Champ piege a robots : masque a l'oeil et retire du parcours clavier. */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor="site-web">Ne remplis pas ce champ</label>
        <input id="site-web" name="site-web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-sm bg-rouge px-6 py-4 font-display text-lg font-bold text-creme transition hover:bg-rouge-sombre focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-creme disabled:opacity-70"
      >
        {pending ? 'Une seconde…' : 'Je veux mon menu'}
      </button>

      {state.error ? (
        <p role="alert" className="text-sm text-rouge-sombre bg-creme/90 rounded-sm px-3 py-2">
          {state.error}
        </p>
      ) : null}

      <p className="text-xs leading-relaxed text-creme/50">
        Ta ville nous sert à savoir où nous attend le monde. On ne la partage avec personne, et tu
        te désinscris en un clic depuis n&rsquo;importe quel mail.
      </p>
    </form>
  )
}
