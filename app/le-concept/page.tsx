import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteHeader } from '@/components/SiteHeader'
import { COCOTTES_PHOTOS } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Le concept',
  description:
    'La cocotte au milieu de la table, et ce que ça veut dire. La cuisine de grand-mère, ' +
    'le bordel rangé, la vaisselle chinée.',
}

/**
 * Page « univers », pas cahier des charges (QG 6.5).
 * Ce qui est interdit ici : une date, une ville, un nombre de couverts, un plan
 * de salle, une véranda ou une cheminée promises, une carte figée.
 * Ce qui est permis : ce qu'on ressent, et ce qui existe déjà pour de vrai.
 */
export default function LeConcept() {
  return (
    <>
      <SiteHeader />
      <main className="bg-creme">
        <section className="px-6 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <h1 className="font-display text-4xl font-black leading-tight text-fonte sm:text-5xl">
              La cocotte au milieu de la table
            </h1>
            <div className="mt-8 space-y-6 text-lg leading-relaxed text-fonte/80">
              <p>
                Tout part d&rsquo;un objet. Une cocotte en fonte, lourde, cabossée, qu&rsquo;on
                pose au centre et qu&rsquo;on ouvre devant tout le monde. Le couvercle fait un
                bruit sourd, la vapeur monte, et il se passe toujours la même chose : personne ne
                parle pendant deux secondes.
              </p>
              <p>
                Ensuite chacun se sert. C&rsquo;est là qu&rsquo;est le geste. Pas une assiette
                dressée qu&rsquo;on t&rsquo;apporte, pas une portion calculée pour toi : un plat au
                milieu, une cuillère dedans, et tu prends ce que tu veux. Ça n&rsquo;a l&rsquo;air
                de rien et ça change tout le repas.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-fonte/10 bg-creme-sombre px-6 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
              Ce qu&rsquo;on cuisine
            </h2>
            <div className="mt-6 space-y-6 text-lg leading-relaxed text-fonte/80">
              <p>
                Des plats qui ont mijoté longtemps. Blanquette, bourguignon, poule au pot, hachis,
                pot-au-feu, tajine du dimanche. Le patrimoine du quotidien, celui que tout le monde
                a mangé et que presque plus personne ne sait refaire.
              </p>
              <p>
                Rien de compliqué, rien d&rsquo;amélioré. On ne touche pas à la blanquette. On la
                fait, on la rate parfois, on recommence. Et on assume les hérésies : les
                coquillettes dans le bourguignon, le pain dans la sauce, le fromage râpé sur des
                trucs qui n&rsquo;en demandaient pas.
              </p>
            </div>
          </div>
        </section>

        <section className="px-6 py-16 sm:px-8 sm:py-24">
          <div className="mx-auto max-w-2xl">
            <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
              Le décor
            </h2>
            <div className="mt-6 space-y-6 text-lg leading-relaxed text-fonte/80">
              <p>
                Du bois, de la faïence ancienne, des saladiers art déco trouvés en brocante, un mur
                de cocottes qui se remplit une pièce à la fois. Du bordel, mais du bordel rangé.
              </p>
              <p>
                On chine pour de vrai, le samedi matin, et on filme ce qu&rsquo;on rapporte. Ce qui
                est sur ces images existe et se trouve quelque part chez nous. C&rsquo;est la seule
                chose qu&rsquo;on puisse te montrer honnêtement pour l&rsquo;instant.
              </p>
            </div>

            {COCOTTES_PHOTOS.length > 0 ? (
              <ul className="mt-10 grid gap-4 sm:grid-cols-3">
                {COCOTTES_PHOTOS.map((photo) => (
                  <li key={photo.src}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.src}
                      alt={photo.alt}
                      loading="lazy"
                      className="aspect-square w-full rounded-sm object-cover"
                    />
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>

        <section className="lumiere-cocotte grain relative isolate px-6 py-20 sm:px-8 sm:py-28">
          <div className="relative mx-auto max-w-2xl">
            <p className="font-display text-2xl leading-snug font-semibold text-creme sm:text-3xl">
              On ne sait pas encore à quoi ça ressemblera exactement. On sait ce qu&rsquo;on veut
              qu&rsquo;on y ressente.
            </p>
            <p className="mt-6 text-lg leading-relaxed text-creme/75">
              Laisse ton mail, tu le construiras avec nous.
            </p>
            <Link
              href="/"
              className="mt-8 inline-block rounded-sm bg-rouge px-6 py-4 font-display text-lg font-bold text-creme transition hover:bg-rouge-sombre"
            >
              Je laisse mon mail
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
