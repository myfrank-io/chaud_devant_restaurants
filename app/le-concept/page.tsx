import type { Metadata } from 'next'
import Link from 'next/link'

import { Embleme } from '@/components/Logo'
import { SignupForm } from '@/components/SignupForm'
import { SiteHeader } from '@/components/SiteHeader'
import { COCOTTES_PHOTOS } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Le concept',
  description:
    'Des vidéos de cuisine en cocotte, une voix off qui raconte, quatre rendez-vous et des ' +
    'recettes à refaire chez toi. Et nous, on se prépare à ouvrir des restaurants. C’est tout.',
}

/**
 * Page « concept », côté réseaux : ce qu'on publie, comment c'est raconté, et
 * ce que tu peux en refaire chez toi. Le restaurant n'est pas le sujet — il
 * tient en une section, sans promesse.
 * Ce qui reste interdit ici (QG 3.6) : une date, une ville, un nombre de
 * couverts, un plan de salle, une carte figée. On montre ce qui existe.
 */
export default function LeConcept() {
  return (
    <>
      <SiteHeader />
      <main className="papier">
        <Hero />
        <RendezVous />
        <Patrimoine />
        <VoixOff />
        <PendantCeTemps />
        <Invitation />
      </main>
    </>
  )
}

/** Deux filets de largeur décroissante, le partage horizontal du logo. */
function Filets({ className = '' }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`space-y-1.5 ${className}`}>
      <div className="h-[5px] w-14 bg-rouge" />
      <div className="h-[3px] w-9 bg-rouge opacity-50" />
    </div>
  )
}

function Hero() {
  return (
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
          On cuisine sur Internet
        </h1>
        <p className="mt-8 max-w-xl font-display text-xl leading-snug text-creme/80 sm:text-2xl">
          La cuisine de nos grands-mères, filmée comme en 2026, racontée comme un pote qui
          déconne. Et à la fin de chaque vidéo, le couvercle se soulève.
        </p>
        <div aria-hidden="true" className="mt-12 space-y-1.5">
          <div className="mx-auto h-[5px] w-40 bg-rouge-clair/80" />
          <div className="mx-auto h-[3px] w-24 bg-rouge-clair/40" />
        </div>
      </div>
    </section>
  )
}

function RendezVous() {
  return (
    <section className="px-6 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
          Les rendez-vous
        </p>
        <h2 className="mt-3 font-display text-3xl font-black leading-tight text-fonte sm:text-4xl">
          Quatre thèmes. Toujours les mêmes.
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fonte/75">
          Pas de tendance suivie au hasard&nbsp;: tout ce qu&rsquo;on publie rentre dans une de
          ces quatre cases. Comme ça, tu sais pourquoi tu t&rsquo;abonnes.
        </p>

        <ol className="mt-12 grid gap-10 sm:grid-cols-2 sm:gap-x-12">
          <li>
            <span className="font-display text-5xl font-black leading-none text-rouge">1</span>
            <Filets className="mt-3" />
            <h3 className="mt-5 font-display text-2xl font-black text-fonte">
              La cocotte du dimanche
            </h3>
            <p className="mt-3 leading-relaxed text-fonte/75">
              La grande recette mijotée, du début à la levée du couvercle. Celle que tu repères
              le jeudi pour la réussir le dimanche, quand il y a du monde à table.
            </p>
          </li>
          <li>
            <span className="font-display text-5xl font-black leading-none text-rouge">2</span>
            <Filets className="mt-3" />
            <h3 className="mt-5 font-display text-2xl font-black text-fonte">
              Les combos de la honte
            </h3>
            <p className="mt-3 leading-relaxed text-fonte/75">
              Les associations qu&rsquo;on fait tous en cachette. Les coquillettes dans le
              bourguignon, le pain qui saucie. On ne s&rsquo;excuse pas&nbsp;: on revendique.
            </p>
          </li>
          <li>
            <span className="font-display text-5xl font-black leading-none text-rouge">3</span>
            <Filets className="mt-3" />
            <h3 className="mt-5 font-display text-2xl font-black text-fonte">Mémé-tech</h3>
            <p className="mt-3 leading-relaxed text-fonte/75">
              Le geste, l&rsquo;astuce, le pourquoi. Pourquoi on farine la viande, comment
              rattraper une sauce qui a tourné. Trente secondes, et tu sais.
            </p>
          </li>
          <li>
            <span className="font-display text-5xl font-black leading-none text-rouge">4</span>
            <Filets className="mt-3" />
            <h3 className="mt-5 font-display text-2xl font-black text-fonte">
              Chaud Devant IRL
            </h3>
            <p className="mt-3 leading-relaxed text-fonte/75">
              Les coulisses, sans filtre&nbsp;: les brocantes du samedi matin, les essais, les
              galères. On construit quelque chose, et on le fait en public.
            </p>
          </li>
        </ol>
      </div>
    </section>
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
          Des plats que tout le monde a mangés chez sa grand-mère et que presque plus personne
          n&rsquo;ose refaire. C&rsquo;est pourtant fait pour être refait&nbsp;: dans les vidéos,
          les quantités s&rsquo;écrivent à l&rsquo;écran, et sur le site, chaque recette est
          posée en entier. Chez toi, sans école de cuisine.
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

function VoixOff() {
  return (
    <section className="overflow-hidden px-6 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto max-w-4xl">
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
          La voix off
        </p>
        <h2 className="mt-3 font-display text-3xl font-black leading-tight text-fonte sm:text-4xl">
          On raconte, on ne dicte pas
        </h2>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-fonte/75">
          Pas de chef qui t&rsquo;explique la vie. Une voix qui raconte ce qui se passe dans la
          cocotte — et qui vanne, mais jamais toi.
        </p>

        <ul className="mt-14 grid gap-8 sm:grid-cols-3 sm:gap-6">
          {[
            {
              replique:
                'On part sur un truc simple. Enfin, simple… il y a trois heures de cuisson, mais c’est simple.',
              rotation: '-rotate-2',
            },
            {
              replique: 'Là, normalement, il faut attendre. Personne n’attend. Moi non plus.',
              rotation: 'rotate-1',
            },
            {
              replique: 'C’est pas beau. C’est bon. C’est pas pareil.',
              rotation: '-rotate-1',
            },
          ].map((extrait) => (
            <li
              key={extrait.replique}
              className={`${extrait.rotation} border-[3px] border-rouge bg-papier p-1.5 shadow-[6px_6px_0_0_var(--color-creme-fonce)] transition-transform duration-300 hover:rotate-0`}
            >
              <blockquote className="flex h-full flex-col justify-center border border-rouge/30 px-5 py-8 text-center">
                <p className="font-display text-xl font-black leading-snug text-fonte">
                  «&nbsp;{extrait.replique}&nbsp;»
                </p>
              </blockquote>
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

function PendantCeTemps() {
  return (
    <section className="bg-vert px-6 py-16 sm:px-8 sm:py-24">
      <div className="mx-auto grid max-w-4xl gap-12 lg:grid-cols-[1fr_minmax(0,20rem)] lg:items-center">
        <div>
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-creme/55">
            Et pendant ce temps
          </p>
          <h2 className="mt-3 font-display text-3xl font-black leading-tight text-creme sm:text-4xl">
            On se prépare à ouvrir des restaurants. C&rsquo;est tout.
          </h2>
          <div className="mt-6 space-y-6 text-lg leading-relaxed text-creme/80">
            <p>
              Pas de date, pas de ville, pas de grandes annonces. On chine des cocottes et de la
              vaisselle le samedi matin, on filme ce qu&rsquo;on rapporte, on apprend.
            </p>
            <p>
              Le mur se construit une brocante à la fois. Le jour où tout ça arrive sur une
              vraie table, tu le sauras avant tout le monde.
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
            Le mur de cocottes, à ce jour. Les cases vides sont honnêtes.
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
