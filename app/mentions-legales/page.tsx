import type { Metadata } from 'next'

import { SiteHeader } from '@/components/SiteHeader'

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: 'Mentions légales, données personnelles et conditions de Chaud Devant.',
}

/**
 * Deux natures de contenu cohabitent ici, et il ne faut pas les confondre.
 *
 * Ce qui est ecrit : le traitement des donnees, parce qu'il decoule directement
 * du code — on sait exactement ce qui est collecte et ce qui en est fait.
 *
 * Ce qui ne l'est pas : l'identite de l'editeur et les conditions du menu
 * offert. Les inventer serait pire que de les laisser vides : les premieres sont
 * des faits juridiques, les secondes un engagement tenu jusqu'a l'ouverture et
 * sans plafond de beneficiaires. A faire relire par un juriste avant le
 * lancement — le QG le demandait deja pour un avantage borne (section 7.2).
 */
export default function MentionsLegales() {
  return (
    <>
      <SiteHeader />
      <main className="papier px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <h1 className="font-display text-4xl font-black leading-tight text-fonte sm:text-5xl">
            Mentions légales
          </h1>

          <Section titre="Éditeur du site">
            <ARediger>
              Raison sociale, forme juridique, siège, numéro d&rsquo;immatriculation et directeur
              de la publication.
            </ARediger>
          </Section>

          <Section titre="Hébergement">
            <p>
              Le site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
              États-Unis.
            </p>
          </Section>

          <Section titre="Données personnelles">
            <p>
              Quand tu t&rsquo;inscris, on te demande deux choses : ton adresse email et ta ville.
              Rien d&rsquo;autre, et il n&rsquo;y a pas de champ caché.
            </p>
            <p>
              L&rsquo;email sert à t&rsquo;envoyer ton menu offert le jour de l&rsquo;ouverture,
              puis les recettes. La ville sert à savoir où se trouvent les gens qui nous suivent —
              c&rsquo;est une donnée de décision pour nous, elle n&rsquo;est jamais utilisée pour te
              cibler individuellement.
            </p>
            <p>
              Ces informations sont conservées dans notre propre base de données. Elles ne sont ni
              vendues, ni louées, ni transmises à des tiers à des fins commerciales. Elles sont
              traitées par nos sous-traitants techniques pour le seul fonctionnement du service :
              Vercel pour l&rsquo;hébergement, Resend pour l&rsquo;envoi des emails.
            </p>
            <p>
              Ton inscription n&rsquo;est active qu&rsquo;après avoir cliqué sur le lien de
              confirmation reçu par mail. Tant que tu ne l&rsquo;as pas fait, tu ne reçois rien.
            </p>
            <p>
              Chaque email contient un lien de désinscription qui fonctionne en un clic. Tu peux
              aussi demander à consulter, corriger ou supprimer tes données en répondant à
              n&rsquo;importe lequel de nos messages.
            </p>
          </Section>

          <Section titre="Cookies">
            <p>
              Le site ne dépose pas de cookie publicitaire et ne fait pas de suivi individuel. La
              mesure d&rsquo;audience utilisée est anonyme.
            </p>
          </Section>

          <Section titre="Le menu offert">
            <p>
              Toute personne dont l&rsquo;inscription est confirmée par le lien reçu par mail, et
              qui ne s&rsquo;est pas désinscrite, reçoit un menu offert par email le jour de
              l&rsquo;ouverture. Une adresse saisie mais jamais confirmée n&rsquo;ouvre aucun droit.
            </p>
            <ARediger>
              Conditions complètes du menu offert : composition du menu, caractère nominatif et non
              cessible, modalités et lieu d&rsquo;utilisation, réservation éventuelle, et ce qui se
              passe en cas d&rsquo;affluence. Cet avantage n&rsquo;est pas plafonné en nombre de
              bénéficiaires : la rédaction de ces conditions est le seul endroit où l&rsquo;étendue
              de l&rsquo;engagement se borne.
            </ARediger>
          </Section>
        </div>
      </main>
    </>
  )
}

function Section({ titre, children }: { titre: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-sm font-bold uppercase tracking-[0.2em] text-bois">
        {titre}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-fonte/80">{children}</div>
    </section>
  )
}

function ARediger({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-sm border border-dashed border-fonte/30 bg-creme-fonce px-4 py-3 text-fonte/60">
      <span className="font-bold text-fonte/80">À compléter avant le lancement. </span>
      {children}
    </p>
  )
}
