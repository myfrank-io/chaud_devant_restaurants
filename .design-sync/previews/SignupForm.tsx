import { SignupForm } from 'chaud-devant'

/** La composition canonique de la home : le carton de menu, double filet. */
export const DansLeCarton = () => (
  <div className="papier p-8">
    <div className="mx-auto max-w-lg border-[3px] border-rouge bg-papier p-1.5 text-left shadow-[6px_6px_0_0_var(--color-creme-fonce)]">
      <div className="border border-rouge/30 px-6 py-8">
        <p className="text-center font-display text-3xl font-black leading-[1.05] text-fonte">
          Le jour où on ouvre le restaurant, c&rsquo;est nous qui régalons.
        </p>
        <p className="mt-4 text-center text-base leading-relaxed text-fonte/70">
          Laisse ton mail et abonne-toi à nos réseaux, c&rsquo;est tout. Le jour de
          l&rsquo;ouverture, tu reçois un cadeau à utiliser quand tu veux&nbsp;!
        </p>
        <SignupForm />
      </div>
    </div>
  </div>
)

/** Le formulaire nu, pour les pages qui ont déjà leur propre cadre. */
export const Seul = () => (
  <div className="papier mx-auto max-w-md p-8">
    <SignupForm />
  </div>
)
