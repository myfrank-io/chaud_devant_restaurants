import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { LoginForm } from '@/components/LoginForm'
import { PageSimple } from '@/components/Page'
import { estConnecte } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Entrer',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function Login() {
  if (await estConnecte()) redirect('/atelier')

  return (
    <PageSimple titre="L’arrière-cuisine">
      <p>C’est fermé au public. Le mot de passe, et on y va.</p>
      <LoginForm />
    </PageSimple>
  )
}
