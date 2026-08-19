'use client'

import { useActionState } from 'react'

import { subscribeAction } from '@/app/actions'
import { initialSubscribeState } from '@/lib/subscribe-state'

/**
 * Le formulaire se remplit comme une ligne sur un carnet : un trait sous le
 * texte, pas un champ encadre. Les boites arrondies grises font logiciel.
 */
export function SignupForm() {
  const [state, formAction, pending] = useActionState(subscribeAction, initialSubscribeState)

  const champ =
    'w-full border-0 border-b-2 border-fonte/25 bg-transparent px-1 py-2.5 font-display text-lg ' +
    'text-fonte placeholder:text-fonte/35 outline-none transition focus:border-rouge'

  return (
    <form action={formAction} className="mt-7 space-y-5">
      <div className="grid gap-5 sm:grid-cols-[1.5fr_1fr]">
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
            className={champ}
          />
        </div>
        <div>
          <label htmlFor="city" className="text-xs font-bold uppercase tracking-[0.15em] text-bois">
            Ta ville
          </label>
          <input
            id="city"
            name="city"
            type="text"
            required
            autoComplete="address-level2"
            placeholder="Lyon, Brest…"
            className={champ}
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
        className="w-full bg-rouge px-6 py-4 font-display text-xl font-black tracking-wide text-creme transition hover:bg-rouge-sombre focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fonte disabled:opacity-70"
      >
        {pending ? 'Une seconde…' : 'Garde-moi une place'}
      </button>

      {state.error ? (
        <p role="alert" className="border-l-4 border-rouge bg-rouge/10 px-3 py-2 text-sm text-rouge-sombre">
          {state.error}
        </p>
      ) : null}

      <p className="text-xs leading-relaxed text-fonte/65">
        Ta ville nous sert à savoir où nous attend le monde. On ne la partage avec personne, et tu
        te désinscris en un clic depuis n&rsquo;importe quel mail.
      </p>
    </form>
  )
}
