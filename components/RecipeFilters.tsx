'use client'

import { useMemo, useState } from 'react'

import { RecipeCardLink } from '@/components/RecipeCardLink'
import type { Recipe } from '@/lib/recipes'

const CUISSON = [
  { key: 'court', label: 'Moins de 30 min', test: (m: number) => m < 30 },
  { key: 'moyen', label: '30 à 90 min', test: (m: number) => m >= 30 && m <= 90 },
  { key: 'long', label: 'Plus de 90 min', test: (m: number) => m > 90 },
] as const

const PREPARATION = [
  { key: 'court', label: 'Moins de 15 min', test: (m: number) => m < 15 },
  { key: 'moyen', label: '15 à 30 min', test: (m: number) => m >= 15 && m <= 30 },
  { key: 'long', label: 'Plus de 30 min', test: (m: number) => m > 30 },
] as const

type DureeKey = (typeof CUISSON)[number]['key']

type Regle = readonly { key: DureeKey; label: string; test: (m: number) => boolean }[]

/** « Bœuf » trouve « boeuf », « puree » trouve « purée » : on cherche sans accents. */
function normalise(texte: string): string {
  return texte
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function passeLaDuree(regles: Regle, cle: DureeKey | null, minutes: number | null): boolean {
  if (!cle) return true
  const regle = regles.find((r) => r.key === cle)
  if (!regle) return true
  return minutes !== null && regle.test(minutes)
}

export function RecipeFilters({ recipes }: { recipes: Recipe[] }) {
  const [recherche, setRecherche] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [season, setSeason] = useState<string | null>(null)
  const [cuisson, setCuisson] = useState<DureeKey | null>(null)
  const [preparation, setPreparation] = useState<DureeKey | null>(null)

  const categories = useMemo(
    () => [...new Set(recipes.map((r) => r.category).filter((c): c is string => Boolean(c)))].sort(),
    [recipes]
  )
  const seasons = useMemo(
    () => [...new Set(recipes.flatMap((r) => r.seasons))].sort(),
    [recipes]
  )

  const filtered = recipes.filter((recipe) => {
    if (recherche.trim()) {
      const fiche = normalise(
        [recipe.title, recipe.category ?? '', ...recipe.ingredients].join(' ')
      )
      if (!fiche.includes(normalise(recherche.trim()))) return false
    }
    if (category && recipe.category !== category) return false
    if (season && !recipe.seasons.includes(season)) return false
    if (!passeLaDuree(CUISSON, cuisson, recipe.minutes)) return false
    if (!passeLaDuree(PREPARATION, preparation, recipe.prepMinutes)) return false
    return true
  })

  return (
    <>
      {/* Le trait sous le texte plutot qu'une boite arrondie, comme le
          formulaire d'inscription : on vend une cocotte, pas un logiciel. */}
      <div className="mt-8">
        <label htmlFor="recherche" className="sr-only">
          Chercher une recette
        </label>
        <input
          id="recherche"
          type="search"
          value={recherche}
          onChange={(event) => setRecherche(event.target.value)}
          placeholder="Un plat, un ingrédient…"
          className="w-full max-w-md border-0 border-b-2 border-fonte/25 bg-transparent px-1 py-2.5 font-display text-lg text-fonte placeholder:text-fonte/35 outline-none transition focus:border-rouge"
        />
      </div>

      <div className="mt-6 space-y-4">
        <FilterRow
          legend="Catégorie"
          options={categories.map((c) => ({ value: c, label: c }))}
          active={category}
          onChange={setCategory}
        />
        {seasons.length > 0 ? (
          <FilterRow
            legend="Saison"
            options={seasons.map((s) => ({ value: s, label: s }))}
            active={season}
            onChange={setSeason}
          />
        ) : null}
        <FilterRow
          legend="Préparation"
          options={PREPARATION.map((t) => ({ value: t.key, label: t.label }))}
          active={preparation}
          onChange={(value) => setPreparation(value as DureeKey | null)}
        />
        <FilterRow
          legend="Cuisson"
          options={CUISSON.map((t) => ({ value: t.key, label: t.label }))}
          active={cuisson}
          onChange={(value) => setCuisson(value as DureeKey | null)}
        />
      </div>

      <p className="mt-6 text-sm text-fonte/50" aria-live="polite">
        {filtered.length} recette{filtered.length > 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 text-lg text-fonte/70">
          Rien avec ces filtres. Enlèves-en un, ça reviendra.
        </p>
      ) : (
        <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <li key={recipe.id}>
              <RecipeCardLink recipe={recipe} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function FilterRow({
  legend,
  options,
  active,
  onChange,
}: {
  legend: string
  options: { value: string; label: string }[]
  active: string | null
  onChange: (value: string | null) => void
}) {
  if (options.length === 0) return null

  return (
    <fieldset className="flex flex-wrap items-center gap-2">
      <legend className="sr-only">{legend}</legend>
      <span aria-hidden="true" className="mr-1 text-xs font-bold uppercase tracking-widest text-bois">
        {legend}
      </span>
      <Chip label="Tout" active={active === null} onClick={() => onChange(null)} />
      {options.map((option) => (
        <Chip
          key={option.value}
          label={option.label}
          active={active === option.value}
          onClick={() => onChange(active === option.value ? null : option.value)}
        />
      ))}
    </fieldset>
  )
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={
        active
          ? 'rounded-full bg-fonte px-3.5 py-1.5 text-sm text-creme transition'
          : 'rounded-full border border-fonte/20 px-3.5 py-1.5 text-sm text-fonte/70 transition hover:border-fonte/50'
      }
    >
      {label}
    </button>
  )
}
