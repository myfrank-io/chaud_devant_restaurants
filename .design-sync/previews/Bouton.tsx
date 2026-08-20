import { Bouton } from 'chaud-devant'

/** Les trois tons, avec les libellés réels de l'atelier. */
export const Variantes = () => (
  <div className="papier p-8">
    <div className="flex flex-wrap items-center gap-4">
      <Bouton type="submit">Enregistrer</Bouton>
      <Bouton type="button" variante="contour">
        Remplir depuis ce lien
      </Bouton>
      <Bouton type="submit" variante="discret">
        Supprimer ce post
      </Bouton>
    </div>
  </div>
)

/** Le même bouton quand le formulaire n'est pas prêt à partir. */
export const Desactive = () => (
  <div className="papier p-8">
    <div className="flex flex-wrap items-center gap-4">
      <Bouton type="submit" disabled>
        Enregistrer
      </Bouton>
      <Bouton type="button" variante="contour" disabled>
        Remplir depuis ce lien
      </Bouton>
    </div>
  </div>
)
