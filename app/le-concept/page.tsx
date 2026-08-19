import type { Metadata } from 'next'
import Link from 'next/link'

import { Embleme } from '@/components/Logo'
import { SignupForm } from '@/components/SignupForm'
import { SiteHeader } from '@/components/SiteHeader'
import { COCOTTES_PHOTOS } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Le concept',
  description:
    'La cocotte au milieu de la table, le rituel du couvercle, les hérésies qu’on assume ' +
    'et le mur de cocottes qui se remplit. L’univers de Chaud Devant.',
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
      <main className="papier">
        <Rituel3Temps />
        <Patrimoine />
        <Heresies />
        <Decor />
        <Invitation />
      </main>
    </>
  )
}

/** Deux filets de largeur décroissante, le partage horizontal du logo. */
function Filets({ className = '', couleur = 'bg-rouge' }: { className?: string; couleur?: string }) {
  return (
    <div aria-hidden="true" className={`space-y-1.5 ${className}`}>
      <div className={`h-[5px] w-14 ${couleur}`} />
      <div className={`h-[3px] w-9 ${couleur} opacity-50`} />
    </div>
  )
}

function Rituel3Temps() {
  return (
    <>
      <section className="fonte-chaude grain relative isolate flex min-h-[85svh] flex-col items-center justify-center overflow-hidden px-6 py-20 sm:px-8">
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <p className="font-display text-sm font-bold uppercase tracking-[0.3em] text-rouge-clair">
            Le concept
          </p>
          {/* La vapeur de l'emblème est animée : c'est le logo en mouvement. */}
          <div className="embleme-vivant mt-10">
            <Embleme className="w-36 text-creme sm:w-44" />
          </div>
          <h1 className="mt-8 font-display text-5xl font-black leading-[1.03] text-creme sm:text-7xl">
            La cocotte au milieu de la table
          </h1>
          <p className="mt-8 max-w-xl font-display text-xl leading-snug text-creme/80 sm:text-2xl">
            On soulève le couvercle, la vapeur monte, et pendant deux secondes personne ne parle.
            C&rsquo;est ce moment-là qu&rsquo;on construit.
          </p>
          <div aria-hidden="true" className="mt-12 space-y-1.5">
            <div className="mx-auto h-[5px] w-40 bg-rouge-clair/80" />
            <div className="mx-auto h-[3px] w-24 bg-rouge-clair/40" />
          </div>
        </div>
      </section>

      <section className="px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
            Le rituel
          </p>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight text-fonte sm:text-4xl">
            Trois temps. Pas un de plus.
          </h2>

          <ol className="mt-12 grid gap-10 sm:grid-cols-3 sm:gap-8">
            <li>
              <span className="font-display text-5xl font-black leading-none text-rouge">1</span>
              <Filets className="mt-3" />
              <h3 className="mt-5 font-display text-2xl font-black text-fonte">On pose</h3>
              <p className="mt-3 leading-relaxed text-fonte/75">
                La cocotte arrive encore en train de gronder et se pose au milieu, sur le
                dessous-de-plat qui a déjà tout vu. Quelqu&rsquo;un crie
                «&nbsp;chaud devant&nbsp;». Forcément.
              </p>
            </li>
            <li>
              <span className="font-display text-5xl font-black leading-none text-rouge">2</span>
              <Filets className="mt-3" />
              <h3 className="mt-5 font-display text-2xl font-black text-fonte">On soulève</h3>
              <p className="mt-3 leading-relaxed text-fonte/75">
                Le couvercle fait son clonk de fonte et la vapeur monte droit. C&rsquo;est le seul
                moment du repas où tout le monde se tait.
              </p>
            </li>
            <li>
              <span className="font-display text-5xl font-black leading-none text-rouge">3</span>
              <Filets className="mt-3" />
              <h3 className="mt-5 font-display text-2xl font-black text-fonte">On se sert</h3>
              <p className="mt-3 leading-relaxed text-fonte/75">
                Pas d&rsquo;assiette dressée&nbsp;: une cuillère dans le plat, et tu prends ce que
                tu veux. Le rab n&rsquo;est pas un accident, c&rsquo;est le principe.
              </p>
            </li>
          </ol>
        </div>
      </section>
    </>
  )
}

const PLATS = [
  'Blanquette de veau',
  'Bœuf bourguignon',
  'Poule au pot',
  'Hachis parmentier',
  'Pot-au-feu',
  'Tajine du dimanche',
  'Coq au vin',
  'Tarte tatin',
] as const

function Patrimoine() {
  return (
    <section className="border-t-4 border-double border-rouge/40 bg-creme-fonce py-16 sm:py-20">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
          Ce qu&rsquo;on cuisine
        </p>
        <h2 className="mt-3 font-display text-3xl font-black leading-tight text-fonte sm:text-4xl">
          Le patrimoine du quotidien
        </h2>
      </div>

      {/* Le défilé est décoratif : la liste lisible est juste en dessous. */}
      <div className="defile mt-10 border-y border-fonte/10 py-6" aria-hidden="true">
        {[0, 1].map((copie) => (
          <ul key={copie} className="defile-piste items-center">
            {PLATS.map((plat, i) => (
              <li key={plat} className="flex shrink-0 items-center">
                <span
                  className={`whitespace-nowrap px-6 font-display text-4xl font-black sm:px-8 sm:text-6xl ${
                    i % 2 === 0 ? 'text-fonte' : 'text-rouge'
                  }`}
                >
                  {plat}
                </span>
                <Embleme className="w-9 shrink-0 text-bois/50 sm:w-11" />
              </li>
            ))}
          </ul>
        ))}
      </div>
      <p className="sr-only">{PLATS.join(', ')}.</p>

      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-fonte/75">
          Des plats qui ont mijoté trois heures et qu&rsquo;on pose au centre, pas des assiettes
          dressées à la pince. Tout le monde les a mangés chez sa grand-mère. Presque plus
          personne ne sait les refaire. C&rsquo;est exactement pour ça qu&rsquo;on les filme — et
          qu&rsquo;on te donne les recettes.
        </p>
        <Link
          href="/recettes"
          className="mt-6 inline-block font-display text-lg text-rouge underline decoration-2 underline-offset-4 transition hover:text-rouge-sombre"
        >
          Voir les recettes
        </Link>
      </div>
    </section>
  )
}

function Heresies() {
  return (
    <section className="overflow-hidden px-6 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
          Les combos de la honte
        </p>
        <h2 className="mt-3 font-display text-3xl font-black leading-tight text-fonte sm:text-4xl">
          On assume les hérésies
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fonte/75">
          Il y a la cuisine du dimanche. Et il y a ce qu&rsquo;on fait tous quand la sauce est
          trop bonne. Ici, on ne s&rsquo;excuse pas&nbsp;: on revendique.
        </p>

        <ul className="mt-14 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {[
            {
              titre: 'Les coquillettes dans le bourguignon',
              vanne: 'Reste. Tu vas comprendre.',
              rotation: '-rotate-2',
            },
            {
              titre: 'Le pain qui saucie',
              vanne: 'Si tu mets pas ton pain dans la sauce, on n’a rien à se dire.',
              rotation: 'rotate-1',
            },
            {
              titre: 'Le fromage râpé',
              vanne: 'Sur des trucs qui n’en demandaient pas. Personne n’a porté plainte.',
              rotation: '-rotate-1',
            },
          ].map((combo) => (
            <li
              key={combo.titre}
              className={`${combo.rotation} border-[3px] border-rouge bg-papier p-1.5 shadow-[6px_6px_0_0_var(--color-creme-fonce)] transition-transform duration-300 hover:rotate-0`}
            >
              <div className="flex h-full flex-col justify-between gap-4 border border-rouge/30 px-5 py-7 text-center">
                <p className="font-display text-2xl font-black leading-tight text-fonte">
                  {combo.titre}
                </p>
                <p className="text-sm leading-relaxed text-fonte/65">{combo.vanne}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

/**
 * Le mur de cocottes, version dessinée : ce qui est accroché existe, les cases
 * vides restent vides. On montre ce qui est chiné, on ne promet pas le reste.
 */
const MUR: ({ couleur: string; rotation: string } | 'vide' | 'a-chiner')[] = [
  { couleur: 'text-rouge', rotation: 'rotate-1' },
  { couleur: 'text-bois', rotation: '-rotate-2' },
  { couleur: 'text-vert', rotation: 'rotate-0' },
  { couleur: 'text-fonte', rotation: 'rotate-2' },
  { couleur: 'text-rouge', rotation: '-rotate-1' },
  'vide',
  { couleur: 'text-vert', rotation: '-rotate-1' },
  { couleur: 'text-rouge', rotation: 'rotate-1' },
  'a-chiner',
]

function Decor() {
  return (
    <section className="bg-vert px-6 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-[1fr_minmax(0,20rem)] lg:items-center">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-creme/55">
            Le décor
          </p>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight text-creme sm:text-4xl">
            Du bordel, mais du bordel rangé
          </h2>
          <div className="mt-6 space-y-6 text-lg leading-relaxed text-creme/80">
            <p>
              Du bois, de la faïence ancienne, des saladiers art déco et des cocottes qui ont
              déjà nourri trois générations. On chine le samedi matin, pour de vrai, et on filme
              ce qu&rsquo;on rapporte.
            </p>
            <p>
              Rien n&rsquo;est un décor d&rsquo;architecte&nbsp;: tout ce qu&rsquo;on montre
              existe déjà, quelque part chez nous. Le reste, tu le verras se construire en
              public, une trouvaille à la fois.
            </p>
          </div>
        </div>

        <figure>
          <div className="grid grid-cols-3 gap-3" aria-hidden="true">
            {MUR.map((piece, i) =>
              piece === 'vide' || piece === 'a-chiner' ? (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-sm border-2 border-dashed border-creme/35"
                >
                  {piece === 'a-chiner' ? (
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.2em] text-creme/50">
                      à chiner
                    </span>
                  ) : null}
                </div>
              ) : (
                <div
                  key={i}
                  className="flex aspect-square items-center justify-center rounded-sm bg-creme/95"
                >
                  <Embleme className={`w-3/5 ${piece.couleur} ${piece.rotation}`} />
                </div>
              ),
            )}
          </div>
          <figcaption className="mt-4 text-center text-sm text-creme/60">
            Le mur de cocottes se remplit une brocante à la fois.
          </figcaption>
        </figure>
      </div>

      {COCOTTES_PHOTOS.length > 0 ? (
        <ul className="mx-auto mt-14 grid max-w-4xl gap-4 sm:grid-cols-3">
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
    </section>
  )
}

function Invitation() {
  return (
    <>
      <div aria-hidden="true" className="nappe h-4 w-full" />
      <section className="fonte-chaude grain relative isolate px-6 py-20 sm:px-8 sm:py-28">
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="font-display text-3xl font-black leading-snug text-creme sm:text-4xl">
            On ne sait pas encore à quoi ça ressemblera exactement. On sait ce qu&rsquo;on veut
            qu&rsquo;on y ressente.
          </p>
          <p className="mt-6 text-lg leading-relaxed text-creme/75">
            Laisse ton mail&nbsp;: tu construiras la suite avec nous. Et le jour où on ouvre, tu
            reçois un menu offert — à utiliser quand ça t&rsquo;arrange.
          </p>

          <div className="mx-auto mt-10 max-w-lg border-[3px] border-rouge bg-papier p-1.5 text-left shadow-[6px_6px_0_0_rgba(0,0,0,0.35)]">
            <div className="border border-rouge/30 px-6 py-8 sm:px-8">
              <p className="text-center font-display text-2xl font-black leading-tight text-fonte">
                C&rsquo;est nous qui régalons.
              </p>
              <SignupForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
