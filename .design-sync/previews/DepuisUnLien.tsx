import { DepuisUnLien } from 'chaud-devant'

/* L'action réelle lit le balisage Recipe de la page et redirige : ici on rend
   la main sans rien faire, le formulaire reste au repos. */
const actionDeDemonstration = async () => undefined

/** Le bloc d'import du garde-manger : coller un lien, la fiche se crée. */
export const ImporterUneRecette = () => (
  <div className="papier p-8">
    <div className="mx-auto max-w-2xl">
      <DepuisUnLien
        action={actionDeDemonstration}
        aide={
          <>
            On lit le balisage que la page publie : titre, ingrédients, étapes, durée, photo.
            Rien n&rsquo;est inventé, et ça ne coûte rien. Le texte reste celui du site —
            réécris-le avant de publier, la fiche ne partira pas en ligne tant que tu ne
            l&rsquo;as pas enregistrée.
          </>
        }
      />
    </div>
  </div>
)

/** La variante du calendrier : le même import, mais pour pré-remplir un post. */
export const RemplirUnPost = () => (
  <div className="papier p-8">
    <div className="mx-auto max-w-2xl">
      <DepuisUnLien
        action={actionDeDemonstration}
        bouton="Remplir depuis ce lien"
        contexte={{ ligne: 'recette', retour: '/atelier' }}
        aide={
          <>
            La fiche recette est créée et rattachée à ce post, et le formulaire se rouvre
            dessus — hook, conduite de tournage et légende compris, au format de la maison.
            C&rsquo;est un point de départ, pas un texte fini : relis-le, il n&rsquo;attend
            que ça.
          </>
        }
      />
    </div>
  </div>
)
