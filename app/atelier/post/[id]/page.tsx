import Link from 'next/link'
import { notFound } from 'next/navigation'

import { BaseAbsente } from '@/components/atelier/BaseAbsente'
import { Bouton, Choix, Texte } from '@/components/atelier/Champs'
import { ChampRelu } from '@/components/atelier/ChampRelu'
import { DepuisUnLien } from '@/components/atelier/DepuisUnLien'
import {
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

import {
  enregistreUnPostAction,
  importeUnPostDepuisUnLienAction,
  supprimeUnPostAction,
} from '../../actions'

/**
 * Champs pre-remplis par l'adresse.
 *
 * C'est ainsi qu'un brouillon ecrit ailleurs entre dans l'atelier : un lien
 * qu'on ouvre, des champs deja remplis, et rien en base tant qu'on n'a pas
 * enregistre. Deux chemins y menent.
 *
 * Le premier est ici : on colle un lien de recette, le balisage de la page est
 * lu, la fiche est creee et le formulaire s'ouvre dessus. Gratuit, exact,
 * mais muet sur la voix — un balisage ne contient ni hook ni legende.
 *
 * Le second passe par la conversation : on envoie une photo du plat a Claude,
 * qui rend une adresse de cette forme, tout rempli. Ni cle d'API ni facture de
 * notre cote, et la relecture reste le dernier geste dans les deux cas.
 */
type Prerempli = {
  date?: string
  ligne?: string
  retour?: string
  titre?: string
  format?: string
  status?: string
  hook?: string
  script?: string
  son_type?: string
  son?: string
  caption?: string
  media_url?: string
  /** L'identifiant d'une fiche recette deja creee, a rattacher au post. */
  recette?: string
  /** « 0 » quand la fiche existe deja : la recreer en ferait une seconde, vide. */
  fiche?: string
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

  /**
   * Remonter le formulaire quand le pre-remplissage change.
   *
   * On arrive ici par une redirection depuis la meme adresse, donc React
   * reconcilie au lieu de remonter : un champ non controle garde la valeur
   * qu'il avait au montage, et l'etat interne d'un champ relu encore plus.
   * Sans cette cle, l'import remplissait l'adresse et laissait l'ecran vide.
   */
  const cle = new URLSearchParams(donne as Record<string, string>).toString()

  return (
    <>
      <Link
        href={retourVers}
        className="inline-block py-2 text-sm text-fonte/50 underline-offset-4 transition hover:text-rouge hover:underline"
      >
        ← Retour
      </Link>

      <h1 className="mt-4 font-display text-3xl font-black text-fonte">
        {nouveau ? 'Nouveau post' : post!.title}
      </h1>

      {nouveau && prerempli ? (
        <p className="mt-3 max-w-lg border-l-4 border-bois bg-creme/50 px-3 py-2 text-sm text-fonte/70">
          Ce brouillon vient d’un lien pré-rempli. Rien n’est enregistré tant que tu n’as pas
          cliqué sur Enregistrer. Le hook et la punchline sont une proposition, pas une
          signature : mets-y tes mots. Et les étapes, dans la conduite comme dans la légende,
          sont le texte du site d’origine — réécris-les avant de publier.
        </p>
      ) : null}

      {/* Deux facons de ne pas partir de la page blanche. Elles ne remplissent
          pas les memes champs, et c'est dit : le lien apporte la matiere, la
          photo apporte la voix. */}
      {nouveau && !prerempli ? (
        <section className="mt-6 space-y-3">
          <DepuisUnLien
            action={importeUnPostDepuisUnLienAction}
            bouton="Remplir depuis ce lien"
            contexte={{ ligne, date, format: donne.format, retour: retourVers }}
            aide={
              <>
                On lit le balisage que la page publie : titre, ingrédients, étapes, durée, photo.
                La fiche recette est créée et rattachée à ce post, et le formulaire se rouvre
                dessus — <strong className="font-bold text-fonte/75">hook, conduite de tournage
                et légende compris</strong>, au format de la maison. C’est un point de départ,
                pas un texte fini : relis-le, il n’attend que ça.
              </>
            }
          />

          <p className="max-w-2xl text-sm text-fonte/55">
            <span className="font-bold text-fonte/75">Une photo du plat ?</span> Envoie-la à Claude
            dans la conversation : il renvoie une adresse qui rouvre ce formulaire avec le titre,
            le hook, le script, le son et la légende déjà écrits. Rien n’est enregistré avant que
            tu ne cliques sur Enregistrer, et ça ne coûte rien non plus.
          </p>
        </section>
      ) : null}


      <form key={cle} action={enregistreUnPostAction} className="mt-7 space-y-8 pb-16">
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

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
              nom="status"
              libelle="Où on en est"
              valeur={post?.status ?? donne.status ?? 'idee'}
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
                valeur={post?.recipeId ?? donne.recette}
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
                    defaultChecked={donne.fiche !== '0' && !donne.recette}
                    className="mt-0.5 size-5 accent-[var(--color-rouge)]"
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
            valeur={post?.mediaUrl ?? donne.media_url}
            placeholder="https://…"
          />
        </section>

        <div className="flex flex-wrap items-center gap-4">
          <Bouton type="submit">Enregistrer</Bouton>
          <Link
            href={retourVers}
            className="inline-block px-2 py-2.5 text-base text-fonte/50 hover:text-rouge"
          >
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
