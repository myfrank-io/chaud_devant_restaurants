'use client'

import { useMemo, useState } from 'react'

import { RecipeCardLink } from '@/components/RecipeCardLink'
import type { RecipeCard } from '@/lib/notion'

const TEMPS = [
  { key: 'court', label: 'Moins de 30 min', test: (m: number) => m < 30 },
  { key: 'moyen', label: '30 à 90 min', test: (m: number) => m >= 30 && m <= 90 },
  { key: 'long', label: 'Plus de 90 min', test: (m: number) => m > 90 },
] as const

type TempsKey = (typeof TEMPS)[number]['key']

export function RecipeFilters({ recipes }: { recipes: RecipeCard[] }) {
  const [category, setCategory] = useState<string | null>(null)
  const [season, setSeason] = useState<string | null>(null)
  const [temps, setTemps] = useState<TempsKey | null>(null)

  const categories = useMemo(
    () => [...new Set(recipes.map((r) => r.category).filter((c): c is string => Boolean(c)))].sort(),
    [recipes]
  )
  const seasons = useMemo(
    () => [...new Set(recipes.flatMap((r) => r.seasons))].sort(),
    [recipes]
  )

  const filtered = recipes.filter((recipe) => {
    if (category && recipe.category !== category) return false
    if (season && !recipe.seasons.includes(season)) return false
    if (temps) {
      const rule = TEMPS.find((t) => t.key === temps)
      if (!rule) return true
      if (recipe.minutes === null || !rule.test(recipe.minutes)) return false
    }
    return true
  })

  return (
    <>
      <div className="mt-8 space-y-4">
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
          legend="Temps"
          options={TEMPS.map((t) => ({ value: t.key, label: t.label }))}
          active={temps}
          onChange={(value) => setTemps(value as TempsKey | null)}
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
