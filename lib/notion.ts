import 'server-only'

/**
 * Recettes : la base Notion « Recettes & Plats » sert de CMS (QG 6.5).
 * Regle 11.3 : aucun contenu recette n'est ecrit en dur dans le repo.
 *
 * On tape l'API REST directement plutot que d'ajouter le SDK : deux endpoints
 * suffisent, et la charte demande de ne pas empiler les dependances lourdes.
 */

const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2025-09-03'

/** Une heure : le site suit le rythme de publication, pas celui d'une redaction live. */
const REVALIDATE_SECONDS = 3600

export type RecipeCard = {
  id: string
  slug: string
  title: string
  category: string | null
  seasons: string[]
  minutes: number | null
  angle: string | null
  cover: string | null
}

export type RecipeDetail = RecipeCard & {
  difficulty: string | null
  postUrl: string | null
  ingredients: string[]
  steps: string[]
  intro: string[]
}

export function isNotionConfigured(): boolean {
  return Boolean(process.env.NOTION_TOKEN && process.env.NOTION_RECIPES_DATA_SOURCE_ID)
}

export function slugify(input: string): string {
  return input
    // Les ligatures ne sont pas decomposees par NFD : sans ca, « Boeuf » ecrit
    // avec la ligature perdrait sa voyelle et donnerait « b-uf-bourguignon ».
    .replace(/\u0153/g, 'oe')
    .replace(/\u00e6/g, 'ae')
    .replace(/\u0152/g, 'OE')
    .replace(/\u00c6/g, 'AE')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’]/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Convertit des minutes en duree ISO 8601, ce qu'attend schema.org. */
export function isoDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `PT${h > 0 ? `${h}H` : ''}${m > 0 || h === 0 ? `${m}M` : ''}`
}

type NotionRichText = { plain_text?: string }
type NotionProperty = {
  type?: string
  title?: NotionRichText[]
  rich_text?: NotionRichText[]
  select?: { name?: string } | null
  multi_select?: { name?: string }[]
  number?: number | null
  url?: string | null
  checkbox?: boolean
}
type NotionPage = {
  id: string
  properties?: Record<string, NotionProperty>
  cover?: {
    type?: string
    external?: { url?: string }
    file?: { url?: string }
  } | null
}

async function notionFetch<T>(path: string, init?: RequestInit): Promise<T | null> {
  const token = process.env.NOTION_TOKEN
  if (!token) return null

  try {
    const response = await fetch(`${NOTION_API}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': NOTION_VERSION,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
      next: { revalidate: REVALIDATE_SECONDS },
    })

    if (!response.ok) {
      console.error('[notion] %s a repondu %s', path, response.status, await response.text())
      return null
    }
    return (await response.json()) as T
  } catch (error) {
    console.error('[notion] appel %s impossible', path, error)
    return null
  }
}

function plain(parts: NotionRichText[] | undefined): string {
  return (parts ?? []).map((part) => part.plain_text ?? '').join('').trim()
}

function coverUrl(page: NotionPage): string | null {
  const cover = page.cover
  if (!cover) return null
  return cover.external?.url ?? cover.file?.url ?? null
}

function toCard(page: NotionPage): RecipeCard | null {
  const props = page.properties ?? {}
  const title = plain(props['Plat']?.title)
  if (!title) return null

  return {
    id: page.id,
    slug: slugify(title),
    title,
    category: props['Catégorie']?.select?.name ?? null,
    seasons: (props['Saison']?.multi_select ?? []).map((o) => o.name ?? '').filter(Boolean),
    minutes: props['Temps (min)']?.number ?? null,
    angle: plain(props['Angle / pourquoi ça marche']?.rich_text) || null,
    cover: coverUrl(page),
  }
}

/**
 * Toutes les fiches publiees. Le filtre sur `Statut` est la seule porte entre la
 * base de travail et le site : une recette a l'etat d'idee ne doit jamais sortir.
 */
export async function getPublishedRecipes(): Promise<RecipeCard[]> {
  const dataSourceId = process.env.NOTION_RECIPES_DATA_SOURCE_ID
  if (!isNotionConfigured() || !dataSourceId) return []

  const data = await notionFetch<{ results?: NotionPage[] }>(
    `/data_sources/${dataSourceId}/query`,
    {
      method: 'POST',
      body: JSON.stringify({
        filter: { property: 'Statut', select: { equals: 'Publiée' } },
        sorts: [{ timestamp: 'created_time', direction: 'descending' }],
        page_size: 100,
      }),
    }
  )

  if (!data?.results) return []
  return data.results.map(toCard).filter((r): r is RecipeCard => r !== null)
}

export async function getLatestRecipes(limit = 3): Promise<RecipeCard[]> {
  const all = await getPublishedRecipes()
  return all.slice(0, limit)
}

type NotionBlock = {
  type?: string
  heading_1?: { rich_text?: NotionRichText[] }
  heading_2?: { rich_text?: NotionRichText[] }
  heading_3?: { rich_text?: NotionRichText[] }
  paragraph?: { rich_text?: NotionRichText[] }
  bulleted_list_item?: { rich_text?: NotionRichText[] }
  numbered_list_item?: { rich_text?: NotionRichText[] }
}

const INGREDIENTS_HEADING = /ingr[ée]dient/i
const STEPS_HEADING = /[ée]tape|pr[ée]paration|recette|marche/i

/**
 * Le corps de la page Notion porte les ingredients et les etapes : la base n'a
 * pas de champ pour eux. On lit donc les blocs, en se reperant aux titres.
 *
 * Regle de lecture : une puce sous un titre « Ingredients » est un ingredient ;
 * une liste numerotee, ou une puce sous un titre d'etapes, est une etape. Les
 * paragraphes lus avant le premier titre servent de chapo.
 */
export async function getRecipeBody(pageId: string): Promise<{
  ingredients: string[]
  steps: string[]
  intro: string[]
}> {
  const data = await notionFetch<{ results?: NotionBlock[] }>(
    `/blocks/${pageId}/children?page_size=100`
  )

  const ingredients: string[] = []
  const steps: string[] = []
  const intro: string[] = []

  if (!data?.results) return { ingredients, steps, intro }

  let section: 'none' | 'ingredients' | 'steps' = 'none'

  for (const block of data.results) {
    const type = block.type
    if (!type) continue

    if (type === 'heading_1' || type === 'heading_2' || type === 'heading_3') {
      const heading = plain(
        block.heading_1?.rich_text ?? block.heading_2?.rich_text ?? block.heading_3?.rich_text
      )
      if (INGREDIENTS_HEADING.test(heading)) section = 'ingredients'
      else if (STEPS_HEADING.test(heading)) section = 'steps'
      else section = 'none'
      continue
    }

    if (type === 'bulleted_list_item') {
      const text = plain(block.bulleted_list_item?.rich_text)
      if (!text) continue
      if (section === 'steps') steps.push(text)
      else ingredients.push(text)
      continue
    }

    if (type === 'numbered_list_item') {
      const text = plain(block.numbered_list_item?.rich_text)
      if (text) steps.push(text)
      continue
    }

    if (type === 'paragraph' && section === 'none') {
      const text = plain(block.paragraph?.rich_text)
      if (text) intro.push(text)
    }
  }

  return { ingredients, steps, intro }
}

export async function getRecipeBySlug(slug: string): Promise<RecipeDetail | null> {
  const recipes = await getPublishedRecipes()
  const card = recipes.find((recipe) => recipe.slug === slug)
  if (!card) return null

  const [body, page] = await Promise.all([
    getRecipeBody(card.id),
    notionFetch<NotionPage>(`/pages/${card.id}`),
  ])

  const props = page?.properties ?? {}

  return {
    ...card,
    difficulty: props['Difficulté']?.select?.name ?? null,
    postUrl: props['Lien du post']?.url ?? null,
    ...body,
  }
}
