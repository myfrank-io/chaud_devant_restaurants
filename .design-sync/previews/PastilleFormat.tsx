import { PastilleFormat } from 'chaud-devant'

/** Les trois formats qu'on tourne, côte à côte. */
export const TousLesFormats = () => (
  <div className="papier p-8">
    <p className="text-xs font-bold uppercase tracking-[0.15em] text-bois">Format</p>
    <div className="mt-3 flex flex-wrap items-center gap-2">
      <PastilleFormat format="reel" />
      <PastilleFormat format="post" />
      <PastilleFormat format="story" />
    </div>
  </div>
)
