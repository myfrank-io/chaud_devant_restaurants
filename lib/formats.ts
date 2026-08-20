import type { Format } from '@/lib/atelier'

/**
 * Comment chaque format se deroule, une bonne fois.
 *
 * La trame du reel vient du QG 4.3, minutage compris. Celles du carrousel et
 * de la story en descendent : memes trois plans (plongee, trois-quarts,
 * macro), meme « chaud devant » quand le plat arrive, meme legende qui porte
 * la recette et finit sur une question fermee.
 *
 * Elles vivent ici plutot que dans la tete de celui qui tourne. Une ligne
 * directrice affiche celle de son format, et le brouillon d'un post la recopie
 * dans le script : on ne redecouvre pas la structure au montage.
 */

export type Trame = {
  /** Ce que ca dure, quand la duree veut dire quelque chose pour ce format. */
  duree: string
  /** Comment s'appelle une unite ici : un plan, une image, une story. */
  unite: string
  /** Une etape par ligne, dans l'ordre du tournage. */
  deroule: string[]
  /** La chose a ne pas rater, celle qu'on oublie en premier. */
  regle: string
}

export const TRAME: Record<Format, Trame> = {
  reel: {
    duree: '45 à 70 s',
    unite: 'Plan',
    deroule: [
      '0-3 s — Le plat fini, on soulève le couvercle et la vapeur monte. Le hook, une phrase.',
      '3-10 s — Retour au début, les ingrédients posés sur le bois. Tu dis ce qu’on va manger et pourquoi ça vaut le détour.',
      '10-45 s — Les étapes, coupées serré, jamais plus de 3 s par plan. Les quantités à l’écran plutôt que dans la voix.',
      '45-60 s — La cocotte sur la table, les mains qui se servent dedans. « Chaud devant », puis la punchline.',
      'Fin — Plan fixe sur le plat, 1,5 s, silence. C’est là que ça reboucle tout seul.',
    ],
    regle: 'Une vanne toutes les 8-10 s, et elle porte sur toi, sur le plat ou sur la situation — jamais sur celui qui regarde.',
  },

  post: {
    duree: '6 à 8 images',
    unite: 'Image',
    deroule: [
      'Image 1 — Le plat fini en plongée verticale, le hook incrusté en bas au centre. C’est la seule qu’on voit dans le fil, elle fait tout le boulot.',
      'Image 2 — Les ingrédients posés sur le bois, tout dans le cadre, rien qui dépasse.',
      'Images 3 à 6 — Une étape par image, en macro sur la matière qui bouge. Le texte reste court, la légende raconte le reste.',
      'Dernière image — La cocotte sur la table et les mains qui se servent. « Chaud devant. »',
    ],
    regle: 'La légende porte la recette entière et se termine par la question fermée. C’est elle qui fait descendre en commentaires.',
  },

  story: {
    duree: '4 à 5 stories, et ça disparaît en 24 h',
    unite: 'Story',
    deroule: [
      'Story 1 — Le plat, brut, sans un mot dessus. On donne envie avant d’expliquer quoi que ce soit.',
      'Story 2 — Le hook en gros, avec un sondage ou une question à répondre. C’est le format où on parle vraiment aux gens.',
      'Stories 3 et 4 — Deux gestes filmés à la main, 5 s chacun, et tant pis si ça bouge.',
      'Dernière story — Le lien vers la recette du site.',
    ],
    regle: 'Pas de montage, pas de lumière montée : c’est le format le moins léché des trois, et c’est exactement pour ça qu’il marche.',
  },
}
