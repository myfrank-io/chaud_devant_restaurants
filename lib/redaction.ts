import 'server-only'

import Anthropic from '@anthropic-ai/sdk'
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod'
import { z } from 'zod'

import { FORMATS, SONS, type Format, type Son } from '@/lib/atelier'

/**
 * Rediger un post a partir d'une photo.
 *
 * Ce que le modele ecrit : le titre, le format, le hook, le script, le son et
 * la legende. Ce qu'il n'ecrit pas : les ingredients et les etapes de la
 * recette.
 *
 * Ce partage n'est pas un oubli. Une recette deduite d'une photo est une
 * invention plausible — des quantites, des temps de cuisson, un tour de main
 * qu'on n'a pas vus. Et comme une recette remplie parait toute seule le jour
 * ou son post est cale, la laisser ecrire les ingredients reviendrait a
 * publier une recette inventee sans que personne l'ait relue. La fiche est
 * donc creee vide : c'est un humain qui l'ecrit, et c'est ce qui l'empeche de
 * paraitre entre-temps.
 */

const BrouillonSchema = z.object({
  titre: z.string().describe('Le plat, court, tel qu’on le dirait à table. Pas de sous-titre.'),
  format: z.enum(FORMATS).describe('reel pour un plat qui se cuisine, post pour une belle image, story pour un instantané.'),
  hook: z.string().describe('Les trois premières secondes, une phrase, ce qui empêche de scroller.'),
  script: z
    .string()
    .describe('Ce qui se dit et ce qui se montre, dans l’ordre, une ligne par plan.'),
  son_type: z.enum(SONS),
  son: z.string().describe('Le texte de la voix off, ou le genre de musique.'),
  caption: z.string().describe('La légende publiée. Deux à quatre phrases.'),
})

export type Brouillon = {
  titre: string
  format: Format
  hook: string
  script: string
  sonType: Son
  son: string
  caption: string
}

/**
 * La charte, telle que le modele doit l'appliquer. Les six interdits y sont
 * en clair : c'est la seule chose qui empeche une legende generee de promettre
 * une date d'ouverture ou de tomber dans le vocabulaire banni.
 */
const CONSIGNE = `Tu écris pour Chaud Devant, une marque de restaurant qui n'a pas encore ouvert.

LE TON
Français, chaleureux, direct, un peu vanné. Phrases courtes. On raconte, on ne dicte pas.
Tutoiement. Une vanne de temps en temps, jamais aux dépens du lecteur.
Territoire : la cocotte, la fonte, le mijoté, à partager, chez ma grand-mère, le dimanche,
généreux, régressif, franc.

CE QUI EST INTERDIT, SANS EXCEPTION
1. Aucune date d'ouverture. Ni année, ni saison, ni mois, ni « bientôt », ni compte à rebours.
2. Aucune ville comme lieu d'implantation.
3. Aucune description du futur lieu : pas de nombre de couverts, pas de véranda, pas de
   cheminée, pas de plan de salle, pas de carte figée.
4. Ne jamais conditionner une récompense à un abonnement ou à un partage.
5. Ne jamais promettre un avantage sans le borner, sauf le menu offert à l'ouverture, qui vaut
   pour tous les inscrits confirmés.
6. Vocabulaire banni : healthy, light, détox, protéiné, gourmet, gastronomique, revisité,
   déconstruit, foodie, food porn, yummy.

Le principe qui les résume : précis sur l'univers, muet sur les specs. Montrer n'est pas promettre.

LA LÉGENDE
Les emoji sont permis dans une légende Instagram, avec parcimonie. Pas de chapelet de hashtags.

CE QU'ON TE DEMANDE
Décris ce que tu vois réellement sur la photo. N'invente pas un plat que tu ne reconnais pas :
si le doute est sérieux, reste sur ce qui est visible — une texture, une couleur, un geste.
N'écris jamais de quantités ni de temps de cuisson : ce n'est pas ton travail ici.`

export function isRedactionConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY)
}

export type Photo = { base64: string; mediaType: 'image/jpeg' | 'image/png' | 'image/webp' }

export async function redigeDepuisUnePhoto(
  photo: Photo,
  indication: string | null
): Promise<Brouillon> {
  if (!isRedactionConfigured()) {
    throw new Error('ANTHROPIC_API_KEY absent : la rédaction depuis une photo est fermée.')
  }

  const client = new Anthropic()

  const reponse = await client.messages.parse({
    model: 'claude-opus-5',
    max_tokens: 8000,
    system: CONSIGNE,
    // Rédiger une légende n'est pas un problème de raisonnement : un effort
    // moyen tient la qualité et garde l'attente supportable devant l'écran.
    output_config: { effort: 'medium', format: zodOutputFormat(BrouillonSchema) },
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: photo.mediaType, data: photo.base64 },
          },
          {
            type: 'text',
            text: indication
              ? `Écris le post à partir de cette photo. Précision de notre part : ${indication}`
              : 'Écris le post à partir de cette photo.',
          },
        ],
      },
    ],
  })

  const brouillon = reponse.parsed_output
  if (!brouillon) throw new Error('Le modèle n’a pas renvoyé de brouillon exploitable.')

  return {
    titre: brouillon.titre,
    format: brouillon.format,
    hook: brouillon.hook,
    script: brouillon.script,
    sonType: brouillon.son_type,
    son: brouillon.son,
    caption: brouillon.caption,
  }
}
