import { PastilleStatut } from 'chaud-devant'

/** Les cinq statuts d'un post, dans l'ordre où ils se traversent. */
export const TousLesStatuts = () => (
  <div className="papier p-8">
    <p className="text-xs font-bold uppercase tracking-[0.15em] text-bois">Où on en est</p>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <PastilleStatut statut="idee" />
      <PastilleStatut statut="tourner" />
      <PastilleStatut statut="monter" />
      <PastilleStatut statut="pret" />
      <PastilleStatut statut="publie" />
    </div>
  </div>
)

/** En situation : les lignes de posts, comme sur la page des lignes directrices. */
export const DansUneLigneDePost = () => (
  <div className="papier p-8">
    <div className="max-w-lg space-y-3">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-fonte/15 bg-papier px-3 py-2.5">
        <span className="font-display text-lg text-fonte">Bœuf bourguignon de mémé</span>
        <PastilleStatut statut="tourner" />
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-2 border-fonte/15 bg-papier px-3 py-2.5">
        <span className="font-display text-lg text-fonte">Soupe à l’oignon gratinée</span>
        <PastilleStatut statut="pret" />
      </div>
    </div>
  </div>
)
