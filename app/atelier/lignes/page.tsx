import Link from 'next/link'

import { BaseAbsente } from '@/components/atelier/BaseAbsente'
import { Bouton, Choix } from '@/components/atelier/Champs'
import { PastilleFormat, PastilleStatut } from '@/components/atelier/Pastille'
import {
  FORMATS,
  LIBELLE_FORMAT,
  listeLesLignes,
  tousLesPosts,
  type Ligne,
  type Post,
} from '@/lib/atelier'
import { TRAME } from '@/lib/formats'
import { isDatabaseConfigured } from '@/lib/db'
import { jourEnToutesLettres } from '@/lib/mois'

import {
  archiveUneLigneAction,
  creeUneLigneAction,
  metAJourUneLigneAction,
  supprimeUneLigneAction,
} from '../actions'

export default async function Lignes() {
  if (!isDatabaseConfigured()) return <BaseAbsente />

  const [lignes, posts] = await Promise.all([listeLesLignes(), tousLesPosts()])

  const parLigne = new Map<string, Post[]>()
  for (const post of posts) {
    const cle = post.ligneId ?? ''
    parLigne.set(cle, [...(parLigne.get(cle) ?? []), post])
  }

  const orphelins = parLigne.get('') ?? []
  const actives = lignes.filter((ligne) => !ligne.archived)
  const archivees = lignes.filter((ligne) => ligne.archived)

  return (
    <>
      <div className="flex flex-wrap items-baseline gap-4">
        <h1 className="font-display text-3xl font-black text-fonte">À préparer</h1>
        <p className="text-base text-fonte/60">
          Chaque ligne directrice est un dossier. Les posts vivent dedans.
        </p>
      </div>

      <form
        action={creeUneLigneAction}
        className="mt-6 flex flex-wrap items-end gap-4 border-2 border-fonte/15 bg-creme/40 px-4 py-4"
      >
        <div className="min-w-52 flex-1">
          <label htmlFor="name" className="text-xs font-bold uppercase tracking-[0.15em] text-bois">
            Nouvelle ligne directrice
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Les gestes de mémé"
            className="mt-1 w-full border-2 border-fonte/20 bg-papier px-3 py-2 text-base text-fonte outline-none transition focus:border-rouge"
          />
        </div>
        <div className="min-w-52 flex-[2]">
          <label
            htmlFor="intention"
            className="text-xs font-bold uppercase tracking-[0.15em] text-bois"
          >
            Ce qu’elle raconte
          </label>
          <input
            id="intention"
            name="intention"
            placeholder="Un tour de main par vidéo, filmé de près, sans parler."
            className="mt-1 w-full border-2 border-fonte/20 bg-papier px-3 py-2 text-base text-fonte outline-none transition focus:border-rouge"
          />
        </div>
        <div className="min-w-40">
          <Choix
            nom="format"
            libelle="Format"
            vide="— ça dépend —"
            options={FORMATS.map((f) => ({ valeur: f, libelle: LIBELLE_FORMAT[f] }))}
          />
        </div>
        <Bouton type="submit">Créer</Bouton>
      </form>

      <div className="mt-10 space-y-10">
        {actives.map((ligne) => (
          <Dossier key={ligne.id} ligne={ligne} posts={parLigne.get(ligne.id) ?? []} />
        ))}

        {orphelins.length > 0 ? (
          <section>
            <h2 className="font-display text-2xl font-black text-fonte/70">Sans ligne</h2>
            <p className="mt-1 text-base text-fonte/55">
              Des posts qui n’ont pas encore trouvé leur dossier.
            </p>
            <ListePosts posts={orphelins} />
          </section>
        ) : null}

        {actives.length === 0 && orphelins.length === 0 ? (
          <p className="text-lg text-fonte/60">
            Rien encore. Crée une ligne directrice ci-dessus, puis mets des posts dedans.
          </p>
        ) : null}

        {archivees.length > 0 ? (
          <section className="border-t-2 border-fonte/10 pt-8">
            <h2 className="font-display text-xl font-black text-fonte/45">Lignes archivées</h2>
            <ul className="mt-3 space-y-2">
              {archivees.map((ligne) => (
                <li key={ligne.id} className="flex items-center gap-4">
                  <span className="text-base text-fonte/50">{ligne.name}</span>
                  <span className="text-sm text-fonte/40">
                    {(parLigne.get(ligne.id) ?? []).length} post(s)
                  </span>
                  <form action={archiveUneLigneAction}>
                    <input type="hidden" name="id" value={ligne.id} />
                    <input type="hidden" name="archivee" value="0" />
                    <Bouton type="submit" variante="discret">
                      Réactiver
                    </Bouton>
                  </form>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  )
}

function Dossier({ ligne, posts }: { ligne: Ligne; posts: Post[] }) {
  const restants = posts.filter((post) => post.status !== 'publie').length

  return (
    <section className="border-2 border-fonte/15 bg-creme/30">
      <header className="flex flex-wrap items-start gap-x-6 gap-y-3 border-b-2 border-fonte/10 px-4 py-4">
        <div className="min-w-0 grow basis-64">
          {/* La modification se fait sur place : ouvrir une page pour changer
              un titre de dossier coûterait plus que ça ne rapporte. Le trait
              sous les champs reste visible en mobile : sans survol, rien ne
              dirait sinon que ce texte s'edite. */}
          <form action={metAJourUneLigneAction} className="space-y-2">
            <input type="hidden" name="id" value={ligne.id} />
            <input
              name="name"
              defaultValue={ligne.name}
              required
              aria-label="Nom de la ligne"
              className="w-full border-0 border-b-2 border-fonte/15 bg-transparent font-display text-2xl font-black text-fonte outline-none transition focus:border-rouge sm:border-transparent sm:hover:border-fonte/15 sm:focus:border-rouge"
            />
            <input
              name="intention"
              defaultValue={ligne.intention ?? ''}
              placeholder="Ce qu’elle raconte…"
              aria-label="Intention de la ligne"
              className="w-full border-0 border-b-2 border-fonte/15 bg-transparent text-base text-fonte/65 outline-none transition focus:border-rouge sm:border-transparent sm:hover:border-fonte/15 sm:focus:border-rouge"
            />
            <div className="flex flex-wrap items-end gap-4">
              <Choix
                nom="format"
                libelle="Format"
                valeur={ligne.format}
                vide="— ça dépend —"
                options={FORMATS.map((f) => ({ valeur: f, libelle: LIBELLE_FORMAT[f] }))}
              />
              <Bouton type="submit" variante="discret" className="!px-0 pb-2">
                Enregistrer
              </Bouton>
            </div>
          </form>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm text-fonte/50">
            {posts.length} post(s){restants > 0 ? `, ${restants} à finir` : ''}
          </span>
          <Link
            href={`/atelier/post/nouveau?ligne=${ligne.id}${
              ligne.format ? `&format=${ligne.format}` : ''
            }`}
            className="border-2 border-fonte/25 px-3 py-2 font-display text-base font-bold text-fonte transition hover:border-rouge hover:text-rouge"
          >
            + Post
          </Link>
          <form action={archiveUneLigneAction}>
            <input type="hidden" name="id" value={ligne.id} />
            <input type="hidden" name="archivee" value="1" />
            <Bouton type="submit" variante="discret">
              Archiver
            </Bouton>
          </form>
          {posts.length === 0 ? (
            <form action={supprimeUneLigneAction}>
              <input type="hidden" name="id" value={ligne.id} />
              <Bouton type="submit" variante="discret">
                Supprimer
              </Bouton>
            </form>
          ) : null}
        </div>
      </header>

      <div className="space-y-4 px-4 pb-4">
        <Deroule format={ligne.format} />
        <ListePosts posts={posts} />
      </div>
    </section>
  )
}

/**
 * Comment ca se tourne, dans le dossier ou l'on prepare.
 *
 * Replie par defaut : c'est une reference qu'on ouvre quand on cale un
 * tournage, pas un pave a scroller a chaque visite. Sans format choisi, les
 * trois sont la — une ligne qui melange les formats a besoin des trois.
 */
function Deroule({ format }: { format: Ligne['format'] }) {
  const montres = format ? [format] : FORMATS

  return (
    <details className="border-2 border-fonte/10 bg-papier/60">
      <summary className="cursor-pointer px-3 py-2 font-display text-base font-bold text-fonte marker:text-rouge">
        Comment ça se tourne
        {format ? (
          <span className="ml-2 font-sans text-sm font-normal text-fonte/50">
            {LIBELLE_FORMAT[format]}, {TRAME[format].duree}
          </span>
        ) : null}
      </summary>

      <div className="space-y-5 px-3 pb-4 pt-1">
        {montres.map((nom) => (
          <div key={nom}>
            {montres.length > 1 ? (
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-bois">
                {LIBELLE_FORMAT[nom]} — {TRAME[nom].duree}
              </p>
            ) : null}
            <ol className="mt-1.5 space-y-1.5">
              {TRAME[nom].deroule.map((etape) => (
                <li key={etape} className="text-base leading-relaxed text-fonte/75">
                  {etape}
                </li>
              ))}
            </ol>
            <p className="mt-2 border-l-4 border-bois pl-3 text-sm leading-relaxed text-fonte/65">
              {TRAME[nom].regle}
            </p>
          </div>
        ))}
      </div>
    </details>
  )
}

function ListePosts({ posts }: { posts: Post[] }) {
  if (posts.length === 0) {
    return <p className="mt-3 text-base text-fonte/50">Aucun post dans cette ligne.</p>
  }

  return (
    <ul className="mt-3 space-y-2">
      {posts.map((post) => (
        <li key={post.id}>
          <Link
            href={`/atelier/post/${post.id}?retour=${encodeURIComponent('/atelier/lignes')}`}
            className="flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-fonte/15 bg-papier px-3 py-2.5 transition hover:border-rouge"
          >
            <span className="font-display text-lg text-fonte">{post.title}</span>
            <PastilleFormat format={post.format} />
            <PastilleStatut statut={post.status} />
            {/* Ce qui manque se voit d'ici : pas besoin d'ouvrir la fiche. */}
            {!post.hook ? <Manque quoi="hook" /> : null}
            {!post.script ? <Manque quoi="script" /> : null}
            {!post.sonType ? <Manque quoi="son" /> : null}
            {!post.caption ? <Manque quoi="description" /> : null}
            <span className="ml-auto text-sm text-fonte/50">
              {post.scheduledOn ? jourEnToutesLettres(post.scheduledOn) : 'pas de date'}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

function Manque({ quoi }: { quoi: string }) {
  return (
    <span className="text-xs uppercase tracking-wider text-fonte/35">
      sans {quoi}
    </span>
  )
}
