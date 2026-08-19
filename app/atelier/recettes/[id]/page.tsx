import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BaseAbsente } from '@/components/atelier/BaseAbsente'
import { Bouton, Choix, Liste, Texte } from '@/components/atelier/Champs'
import { ChampRelu } from '@/components/atelier/ChampRelu'
import { isDatabaseConfigured } from '@/lib/db'
import { enJour, getRecipeById, parution, postQuiPorte, type Recipe } from '@/lib/recipes'
import { jourEnToutesLettres } from '@/lib/mois'

import { enregistreUneRecetteAction, supprimeUneRecetteAction } from '../../actions'

const SAISONS = ['printemps', 'été', 'automne', 'hiver']

const CATEGORIES = ['Mijoté', 'Gratin', 'Soupe', 'Viande', 'Poisson', 'Légumes', 'Dessert']

const DIFFICULTES = ['Facile', 'Un peu de patience', 'Un dimanche entier']

export default async function FicheRecette({ params }: { params: Promise<{ id: string }> }) {
  if (!isDatabaseConfigured()) return <BaseAbsente />

  const { id } = await params
  const nouvelle = id === 'nouvelle'

  const recette: Recipe | null = nouvelle ? null : await getRecipeById(id)
  if (!nouvelle && !recette) notFound()

  const porteur = recette ? await postQuiPorte(recette.id) : null
  const etat = recette ? parution(recette) : 'brouillon'

  return (
    <>
      <Link
        href="/atelier/recettes"
        className="text-sm text-fonte/50 underline-offset-4 transition hover:text-rouge hover:underline"
      >
        ← Toutes les recettes
      </Link>

      <div className="mt-4 flex flex-wrap items-baseline gap-4">
        <h1 className="font-display text-3xl font-black text-fonte">
          {nouvelle ? 'Nouvelle recette' : recette!.title}
        </h1>
        {etat === 'en-ligne' ? (
          <Link
            href={`/recettes/${recette!.slug}`}
            className="text-base text-rouge underline underline-offset-4"
          >
            Voir en ligne ↗
          </Link>
        ) : null}
        {etat === 'programmee' ? (
          <span className="text-base text-bois">
            Paraît le {jourEnToutesLettres(enJour(recette!.publishedAt)!)}
          </span>
        ) : null}
      </div>

      <form action={enregistreUneRecetteAction} className="mt-7 space-y-8 pb-16">
        {recette ? <input type="hidden" name="id" value={recette.id} /> : null}

        <section className="space-y-5">
          <Texte
            nom="title"
            libelle="Le titre"
            requis
            valeur={recette?.title}
            placeholder="Bœuf bourguignon"
          />

          <Texte
            nom="slug"
            libelle="L’adresse"
            aide="Laissée vide, elle se déduit du titre. La changer casse le lien déjà partagé."
            valeur={recette?.slug}
            placeholder="boeuf-bourguignon"
          />

          <ChampRelu
            nom="angle"
            libelle="L’angle"
            aide="Une phrase : ce que cette recette a de particulier. Sert aussi de description dans Google."
            valeurInitiale={recette?.angle}
            lignes={2}
            emojiInterdits
          />

          <div className="grid gap-5 sm:grid-cols-3">
            <Choix
              nom="category"
              libelle="Catégorie"
              valeur={recette?.category}
              vide="— aucune —"
              options={CATEGORIES.map((c) => ({ valeur: c, libelle: c }))}
            />
            <Texte
              nom="minutes"
              libelle="Durée totale (min)"
              type="number"
              valeur={recette?.minutes}
              placeholder="180"
            />
            <Choix
              nom="difficulty"
              libelle="Difficulté"
              valeur={recette?.difficulty}
              vide="— aucune —"
              options={DIFFICULTES.map((d) => ({ valeur: d, libelle: d }))}
            />
          </div>

          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-[0.15em] text-bois">
              Saisons
            </legend>
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
              {SAISONS.map((saison) => (
                <label key={saison} className="flex items-center gap-2 text-base text-fonte">
                  <input
                    type="checkbox"
                    name="seasons"
                    value={saison}
                    defaultChecked={recette?.seasons.includes(saison)}
                    className="size-4 accent-[var(--color-rouge)]"
                  />
                  {saison}
                </label>
              ))}
            </div>
          </fieldset>
        </section>

        <section className="space-y-5 border-t-2 border-fonte/10 pt-7">
          <h2 className="font-display text-xl font-black text-fonte">Le texte</h2>

          <ChampRelu
            nom="intro"
            libelle="L’intro"
            aide="Un paragraphe par ligne."
            valeurInitiale={recette?.intro.join('\n')}
            lignes={5}
            emojiInterdits
          />

          <Liste
            nom="ingredients"
            libelle="Ingrédients"
            aide="Un par ligne, avec la quantité. « 1,2 kg de paleron »"
            valeur={recette?.ingredients}
          />

          <Liste
            nom="steps"
            libelle="Les étapes"
            aide="Une par ligne. Elles se numérotent toutes seules."
            valeur={recette?.steps}
            lignes={10}
          />
        </section>

        <section className="space-y-5 border-t-2 border-fonte/10 pt-7">
          <h2 className="font-display text-xl font-black text-fonte">Les liens</h2>

          <Texte
            nom="cover"
            libelle="La photo"
            aide="Une adresse d’image. Cadrage 4:5, c’est ce que la fiche attend."
            valeur={recette?.cover}
            placeholder="https://…"
          />
          {recette?.cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={recette.cover}
              alt=""
              className="aspect-[4/5] w-40 border-2 border-fonte/15 object-cover"
            />
          ) : null}

          <Texte
            nom="post_url"
            libelle="La vidéo"
            aide="Le post Instagram ou TikTok correspondant."
            valeur={recette?.postUrl}
            placeholder="https://…"
          />
        </section>

        <section className="border-t-2 border-fonte/10 pt-7">
          <h2 className="font-display text-xl font-black text-fonte">Parution</h2>

          <div className="mt-4 max-w-sm">
            <Texte
              nom="published_at"
              libelle="Mise en ligne le"
              type="date"
              valeur={enJour(recette?.publishedAt ?? null)}
            />
          </div>

          <p className="mt-2 max-w-lg text-sm text-fonte/55">
            Vide, c’est un brouillon : la recette n’existe que dans l’atelier. Une date à venir la
            fait paraître toute seule ce jour-là — rien à relancer.
          </p>

          {porteur?.scheduledOn ? (
            <p className="mt-3 max-w-lg text-sm text-bois">
              Cette date suit le post «&nbsp;{porteur.title}&nbsp;», calé au{' '}
              {jourEnToutesLettres(porteur.scheduledOn)}. La changer ici sera écrasé au prochain
              enregistrement du post.
            </p>
          ) : null}

          {etat === 'a-relire' ? (
            <p className="mt-3 max-w-lg text-sm text-rouge">
              Cette fiche vient d’un import : personne ne l’a encore relue, et elle ne paraîtra pas
              tant que ce sera le cas. Réécris le texte avec tes mots, puis enregistre — c’est cet
              enregistrement qui vaut relecture.
            </p>
          ) : null}

          {etat === 'en-ligne' ? (
            <p className="mt-3 max-w-lg text-sm text-rouge">
              La recette est en ligne. Vider la date la retire du site, et le lien déjà partagé
              renverra vers une page introuvable.
            </p>
          ) : null}
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <Bouton type="submit">Enregistrer</Bouton>
          <Link href="/atelier/recettes" className="text-base text-fonte/50 hover:text-rouge">
            Annuler
          </Link>
        </div>
      </form>

      {recette ? (
        <form action={supprimeUneRecetteAction} className="border-t-2 border-fonte/10 pt-6">
          <input type="hidden" name="id" value={recette.id} />
          <Bouton type="submit" variante="discret">
            Supprimer cette recette
          </Bouton>
        </form>
      ) : null}
    </>
  )
}
