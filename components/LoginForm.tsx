'use client'

import { useActionState } from 'react'

import { connexionAction } from '@/app/login/actions'
import { initialLoginState } from '@/lib/login-state'

export function LoginForm() {
  const [state, formAction, pending] = useActionState(connexionAction, initialLoginState)

  return (
    <form action={formAction} className="mt-8 space-y-5 text-left">
      <div>
        <label
          htmlFor="mot-de-passe"
          className="text-xs font-bold uppercase tracking-[0.15em] text-bois"
        >
          Le mot de passe
        </label>
        <input
          id="mot-de-passe"
          name="mot-de-passe"
          type="password"
          required
          autoComplete="current-password"
          className="w-full border-0 border-b-2 border-fonte/25 bg-transparent px-1 py-2.5 font-display text-lg text-fonte outline-none transition focus:border-rouge"
        />
      </div>

      {state.error ? (
        <p role="alert" className="text-base text-rouge">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="w-full bg-rouge px-5 py-3.5 font-display text-lg font-bold text-creme transition hover:bg-rouge-sombre disabled:opacity-60"
      >
        {pending ? 'Une seconde…' : 'Entrer'}
      </button>
    </form>
  )
}
