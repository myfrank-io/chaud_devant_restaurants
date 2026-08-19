import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BaseAbsente } from '@/components/atelier/BaseAbsente'
import { Bouton, Choix, Etiquette, Liste, Texte } from '@/components/atelier/Champs'
import { ChampRelu } from '@/components/atelier/ChampRelu'
import { isDatabaseConfigured } from '@/lib/db'
import { getRecipeById, type Recipe } from '@/lib/recipes'

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
        {recette?.publishedAt ? (
          <Link
            href={`/recettes/${recette.slug}`}
            className="text-base text-rouge underline underline-offset-4"
          >
            Voir en ligne ↗
          </Link>
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
          <Etiquette pour="published">Publication</Etiquette>
          <label className="mt-2 flex items-center gap-3 text-base text-fonte">
            <input
              id="published"
              type="checkbox"
              name="published"
              value="1"
              defaultChecked={Boolean(recette?.publishedAt)}
              className="size-4 accent-[var(--color-rouge)]"
            />
            En ligne sur le site
          </label>
          <p className="mt-1.5 max-w-lg text-sm text-fonte/50">
            Décochée, la recette redevient un brouillon et disparaît du site. Le lien déjà partagé
            renverra vers une page introuvable.
          </p>
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
