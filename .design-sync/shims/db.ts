/**
 * Doublure de lib/db pour le bundle design-sync : jamais de Postgres côté
 * design. Permet d'embarquer les modules qui importent la base (lib/atelier
 * pour ses libellés) sans tirer `pg` dans un bundle navigateur.
 */
export function getPool(): null {
  return null
}

export function isDatabaseConfigured(): boolean {
  return false
}

export async function basePrete(): Promise<null> {
  return null
}
