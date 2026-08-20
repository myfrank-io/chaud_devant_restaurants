import { Etiquette } from 'chaud-devant'

/** L'étiquette posée sur un champ nu, avec le cadre maison des formulaires. */
export const SurUnChamp = () => (
  <div className="papier max-w-md p-8">
    <Etiquette pour="titre">Le titre</Etiquette>
    <input
      id="titre"
      name="titre"
      type="text"
      defaultValue="Gratin dauphinois du dimanche"
      className="mt-1 w-full border-2 border-fonte/20 bg-papier px-3 py-2 text-base text-fonte outline-none transition focus:border-rouge"
    />
  </div>
)
