import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BaseAbsente } from '@/components/atelier/BaseAbsente'
import { Bouton, Choix, Texte } from '@/components/atelier/Champs'
import { ChampRelu } from '@/components/atelier/ChampRelu'
import {
  CANAUX,
  FORMATS,
  getPost,
  LIBELLE_FORMAT,
  LIBELLE_SON,
  LIBELLE_STATUT,
  listeLesLignes,
  SONS,
  STATUTS,
  type Post,
} from '@/lib/atelier'
import { isDatabaseConfigured } from '@/lib/db'
import { listeToutesLesRecettes } from '@/lib/recipes'

import { enregistreUnPostAction, supprimeUnPostAction } from '../../actions'

/**
 * Champs pre-remplis par l'adresse.
 *
 * C'est ainsi qu'un brouillon ecrit ailleurs — par Claude dans une
 * conversation, par nous dans un carnet — entre dans l'atelier : un lien qu'on
 * ouvre, des champs deja remplis, et rien en base tant qu'on n'a pas
 * enregistre. Pas de cle d'API, pas de facture, et la relecture reste le
 * dernier geste.
 */
type Prerempli = {
  date?: string
  ligne?: string
  retour?: string
  titre?: string
  format?: string
  hook?: string
  script?: string
  son_type?: string
  son?: string
  caption?: string
}

export default async function FichePost({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Prerempli>
}) {
  if (!isDatabaseConfigured()) return <BaseAbsente />

  const { id } = await params
  const donne = await searchParams
  const { date, ligne, retour } = donne
  const nouveau = id === 'nouveau'

  const post: Post | null = nouveau ? null : await getPost(id)
  if (!nouveau && !post) notFound()

  const [lignes, recettes] = await Promise.all([listeLesLignes(), listeToutesLesRecettes()])

  const retourVers = retour ?? '/atelier/lignes'
  const prerempli = Boolean(donne.hook || donne.script || donne.caption)

  return (
    <>
      <Link
        href={retourVers}
        className="text-sm text-fonte/50 underline-offset-4 transition hover:text-rouge hover:underline"
      >
        ← Retour
      </Link>

      <h1 className="mt-4 font-display text-3xl font-black text-fonte">
        {nouveau ? 'Nouveau post' : post!.title}
      </h1>

      {nouveau && prerempli ? (
        <p className="mt-3 max-w-lg border-l-4 border-bois bg-creme/50 px-3 py-2 text-sm text-fonte/70">
          Ce brouillon vient d’un lien pré-rempli. Rien n’est enregistré tant que tu n’as pas
          cliqué sur Enregistrer — relis, corrige, puis valide.
        </p>
      ) : null}


      <form action={enregistreUnPostAction} className="mt-7 space-y-8 pb-16">
        {post ? <input type="hidden" name="id" value={post.id} /> : null}
        <input type="hidden" name="retour" value={retourVers} />

        <section className="space-y-5">
          <Texte
            nom="title"
            libelle="Le plat, ou l’idée"
            requis
            valeur={post?.title ?? donne.titre}
            placeholder="Bœuf bourguignon de mémé"
          />

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <Choix
              nom="ligne_id"
              libelle="Ligne directrice"
              valeur={post?.ligneId ?? ligne}
              vide="— sans ligne —"
              options={lignes
                .filter((l) => !l.archived || l.id === post?.ligneId)
                .map((l) => ({ valeur: l.id, libelle: l.name }))}
            />
            <Choix
              nom="format"
              libelle="Format"
              valeur={post?.format ?? donne.format ?? 'reel'}
              options={FORMATS.map((f) => ({ valeur: f, libelle: LIBELLE_FORMAT[f] }))}
            />
            <Choix
              nom="channel"
              libelle="Où"
              valeur={post?.channel ?? 'instagram'}
              options={CANAUX.map((c) => ({ valeur: c, libelle: c }))}
            />
            <Choix
              nom="status"
              libelle="Où on en est"
              valeur={post?.status ?? 'idee'}
              options={STATUTS.map((s) => ({ valeur: s, libelle: LIBELLE_STATUT[s] }))}
            />
          </div>
        </section>

        <section className="space-y-5 border-t-2 border-fonte/10 pt-7">
          <h2 className="font-display text-xl font-black text-fonte">Ce qu’on raconte</h2>

          <ChampRelu
            nom="hook"
            libelle="Le hook"
            aide="Les trois premières secondes. Ce qui empêche de scroller."
            valeurInitiale={post?.hook ?? donne.hook}
            lignes={2}
          />

          <ChampRelu
            nom="script"
            libelle="Le script"
            aide="Ce qui se dit et ce qui se montre, dans l’ordre."
            valeurInitiale={post?.script ?? donne.script}
            lignes={8}
          />

          <div className="grid gap-5 sm:grid-cols-[auto_1fr]">
            <Choix
              nom="son_type"
              libelle="Le son"
              valeur={post?.sonType ?? donne.son_type}
              vide="— à décider —"
              options={SONS.map((s) => ({ valeur: s, libelle: LIBELLE_SON[s] }))}
            />
            <Texte
              nom="son"
              libelle="Précision"
              aide="Le texte de la voix off, ou la piste choisie."
              valeur={post?.son ?? donne.son}
            />
          </div>

          <ChampRelu
            nom="caption"
            libelle="La description du post"
            aide="La légende telle qu’elle sera publiée."
            valeurInitiale={post?.caption ?? donne.caption}
            lignes={6}
          />
        </section>

        <section className="space-y-5 border-t-2 border-fonte/10 pt-7">
          <h2 className="font-display text-xl font-black text-fonte">Le reste</h2>

          <div className="grid gap-5 sm:grid-cols-2">
            <Texte
              nom="scheduled_on"
              libelle="Date de publication"
              type="date"
              valeur={post?.scheduledOn ?? date}
              aide="Vide tant que ce n’est pas calé."
            />
            <div>
              <Choix
                nom="recipe_id"
                libelle="Recette du site liée"
                valeur={post?.recipeId}
                vide="— aucune —"
                options={recettes.map((r) => ({
                  valeur: r.id,
                  libelle: r.publishedAt ? r.title : `${r.title} (brouillon)`,
                }))}
              />
              <p className="mt-1.5 text-sm text-fonte/55">
                Elle paraîtra sur le site le jour où ce post est calé. Pas besoin d’y revenir.
              </p>

              {/* Seulement a la creation : ensuite la fiche existe, ou on a
                  choisi de s'en passer, et reposer la question serait du bruit. */}
              {nouveau ? (
                <label className="mt-2 flex items-start gap-2 text-sm text-fonte">
                  <input
                    type="checkbox"
                    name="cree_la_fiche"
                    value="1"
                    defaultChecked
                    className="mt-0.5 size-4 accent-[var(--color-rouge)]"
                  />
                  <span>
                    Ouvrir sa fiche recette maintenant, avec ce titre.{' '}
                    <span className="text-fonte/50">
                      Décoche si ce post ne raconte pas un plat.
                    </span>
                  </span>
                </label>
              ) : null}
            </div>
          </div>

          <Texte
            nom="media_url"
            libelle="Le rush ou le montage"
            aide="Un lien vers le fichier, là où il vit déjà."
            valeur={post?.mediaUrl}
            placeholder="https://…"
          />
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <Bouton type="submit">Enregistrer</Bouton>
          <Link href={retourVers} className="text-base text-fonte/50 hover:text-rouge">
            Annuler
          </Link>
        </div>
      </form>

      {post ? (
        <form action={supprimeUnPostAction} className="border-t-2 border-fonte/10 pt-6">
          <input type="hidden" name="id" value={post.id} />
          <input type="hidden" name="retour" value={retourVers} />
          <Bouton type="submit" variante="discret">
            Supprimer ce post
          </Bouton>
        </form>
      ) : null}
    </>
  )
}
