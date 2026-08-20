/**
 * Point d'entrée du bundle design-sync (window.ChaudDevant).
 *
 * Chaque export republie un composant réel du site — la liste est pilotée
 * par componentSrcMap dans config.json. Les frontières serveur et framework
 * (next/link, actions serveur, lib/db) sont doublées à l'empaquetage via
 * tsconfig.sync.json → shims/ ; le rendu DOM reste celui des vrais composants.
 */
export * from '../components/Logo'
export * from '../components/Tampon'
export * from '../components/Page'
export * from '../components/SiteHeader'
export * from '../components/RecipeCardLink'
export * from '../components/RecipeFilters'
export * from '../components/SignupForm'
export * from '../components/LoginForm'
export * from '../components/atelier/Champs'
export * from '../components/atelier/Pastille'
export * from '../components/atelier/ChampRelu'
export * from '../components/atelier/BaseAbsente'
export * from '../components/atelier/DepuisUnLien'
