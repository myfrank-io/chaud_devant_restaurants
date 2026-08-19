/**
 * Grille d'un mois, en dates AAAA-MM-JJ.
 *
 * Tout est calcule en UTC et rendu en texte. Un calendrier qui manipule des
 * Date locales affiche un jour de decalage des que le serveur et le lecteur
 * ne sont pas dans le meme fuseau — et Vercel tourne en UTC.
 */

export const JOURS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

const NOMS_DE_MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

/** Le mois courant au format AAAA-MM. */
export function moisCourant(): string {
  return new Date().toISOString().slice(0, 7)
}

export function aujourdhui(): string {
  return new Date().toISOString().slice(0, 10)
}

/** Valide un AAAA-MM venu de l'URL, et se rabat sur le mois courant. */
export function moisValide(brut: string | undefined): string {
  return brut && /^\d{4}-(0[1-9]|1[0-2])$/.test(brut) ? brut : moisCourant()
}

export function nomDuMois(mois: string): string {
  const [annee, numero] = mois.split('-').map(Number)
  return `${NOMS_DE_MOIS[numero - 1]} ${annee}`
}

export function moisDecale(mois: string, pas: number): string {
  const [annee, numero] = mois.split('-').map(Number)
  const date = new Date(Date.UTC(annee, numero - 1 + pas, 1))
  return date.toISOString().slice(0, 7)
}

/**
 * Les cases de la grille, semaines completes, du lundi au dimanche.
 * `dansLeMois` distingue les jours de debordement, affiches en retrait.
 */
export function grilleDuMois(mois: string): { jour: string; dansLeMois: boolean }[] {
  const [annee, numero] = mois.split('-').map(Number)
  const premier = new Date(Date.UTC(annee, numero - 1, 1))

  // getUTCDay() met dimanche a 0 ; on veut lundi en tete de semaine.
  const decalage = (premier.getUTCDay() + 6) % 7
  const debut = new Date(premier)
  debut.setUTCDate(debut.getUTCDate() - decalage)

  const cases: { jour: string; dansLeMois: boolean }[] = []
  for (let i = 0; i < 42; i += 1) {
    const jour = new Date(debut)
    jour.setUTCDate(jour.getUTCDate() + i)
    cases.push({
      jour: jour.toISOString().slice(0, 10),
      dansLeMois: jour.getUTCMonth() === numero - 1,
    })
    // Six semaines couvrent tous les mois, mais la plupart en tiennent cinq :
    // on s'arrete des que la derniere semaine utile est complete.
    if (i >= 34 && (i + 1) % 7 === 0) {
      const suivant = new Date(debut)
      suivant.setUTCDate(suivant.getUTCDate() + i + 1)
      if (suivant.getUTCMonth() !== numero - 1) break
    }
  }
  return cases
}

/** « 14 » — le numero du jour, pour l'affichage dans une case. */
export function numeroDuJour(jour: string): string {
  return String(Number(jour.slice(8, 10)))
}

/** « lundi 14 avril » — pour les titres et les infobulles. */
export function jourEnToutesLettres(jour: string): string {
  const date = new Date(`${jour}T00:00:00Z`)
  const nomsLongs = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  return `${nomsLongs[date.getUTCDay()]} ${Number(jour.slice(8, 10))} ${
    NOMS_DE_MOIS[Number(jour.slice(5, 7)) - 1]
  }`
}
