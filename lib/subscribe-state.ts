/**
 * Etat du formulaire d'inscription.
 *
 * Vit hors de app/actions.ts : un module « use server » ne peut exporter que
 * des fonctions async, et exporter cet objet depuis la-bas fait echouer le
 * module a l'evaluation.
 */
export type SubscribeState = { error: string | null }

export const initialSubscribeState: SubscribeState = { error: null }
