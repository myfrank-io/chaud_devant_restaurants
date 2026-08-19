/**
 * Etat du formulaire d'inscription.
 *
 * Vit hors de app/actions.ts : un module « use server » ne peut exporter que
 * des fonctions async, et exporter cet objet depuis la-bas fait echouer le
 * module a l'evaluation.
 */

/**
 * Ce que devient le formulaire une fois envoye. On ne change pas de page :
 * l'inscription se termine la ou elle a commence, dans le carton.
 *
 *  - `envoye`  : c'est enregistre, le mail de confirmation est parti
 *  - `sans-mail` : c'est enregistre, mais l'envoi n'a pas pu se faire
 *  - `connu`   : cette adresse etait deja confirmee
 */
export type Issue = 'envoye' | 'sans-mail' | 'connu'

export type SubscribeState = { error: string | null; issue: Issue | null }

export const initialSubscribeState: SubscribeState = { error: null, issue: null }
