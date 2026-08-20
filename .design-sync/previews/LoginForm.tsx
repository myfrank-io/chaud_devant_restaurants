import { LoginForm } from 'chaud-devant'

/** La composition canonique de /login : page courte, papier, titre au centre. */
export const ArriereCuisine = () => (
  <div className="papier grain p-8">
    <div className="mx-auto max-w-md text-center">
      <h1 className="font-display text-4xl font-black leading-[1.05] text-fonte">
        L&rsquo;arrière-cuisine
      </h1>
      <p className="mt-6 text-lg leading-relaxed text-fonte/80">
        C&rsquo;est fermé au public. Le mot de passe, et on y va.
      </p>
      <LoginForm />
    </div>
  </div>
)
