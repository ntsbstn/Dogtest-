'use client'

/**
 * Composant de sélection d'un attribut (oreilles, queue, poil, taille, groupe)
 * Affiche des boutons radio stylisés.
 */

interface SelecteurAttributProps {
  label:          string
  options:        readonly string[]
  valeur:         string
  surChangement:  (valeur: string) => void
  desactive?:     boolean
  icone?:         string
}

export default function SelecteurAttribut({
  label,
  options,
  valeur,
  surChangement,
  desactive = false,
  icone,
}: SelecteurAttributProps) {
  return (
    <fieldset className="space-y-2">
      <legend className="flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300">
        {icone && <span className="text-base">{icone}</span>}
        {label}
      </legend>

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const estSelectionne = valeur === option
          return (
            <button
              key={option}
              type="button"
              disabled={desactive}
              onClick={() => surChangement(estSelectionne ? '' : option)}
              aria-pressed={estSelectionne}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium
                border-2 transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1
                disabled:opacity-50 disabled:cursor-not-allowed
                ${
                  estSelectionne
                    ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                }
              `}
            >
              {option}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
