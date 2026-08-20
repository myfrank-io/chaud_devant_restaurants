import { PageSimple } from 'chaud-devant'

/** La page de confirmation d'inscription, telle qu'elle vit sur le site. */
export const Confirmation = () => (
  <div className="papier">
    <PageSimple titre="C’est bon, tu es sur la liste.">
      <p>
        Le jour où on ouvre, tu reçois ton menu offert par mail. Tu l’utilises quand tu veux — on
        ne te mettra pas la pression.
      </p>
      <p>D’ici là, on cuisine. Tu vas nous voir passer.</p>
    </PageSimple>
  </div>
)
