/**
 * Composant d'état de chargement animé
 */

interface ChargementProps {
  message?: string
  taille?: 'petit' | 'moyen' | 'grand'
}

export default function Chargement({
  message = 'Chargement…',
  taille = 'moyen',
}: ChargementProps) {
  const taillesSpinner = {
    petit:  'w-6 h-6 border-2',
    moyen:  'w-12 h-12 border-4',
    grand:  'w-16 h-16 border-4',
  }

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8" role="status">
      <div
        className={`
          ${taillesSpinner[taille]}
          rounded-full
          border-brand-200
          border-t-brand-500
          animate-spin
        `}
        aria-hidden="true"
      />
      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium animate-pulse-soft">
        {message}
      </p>
    </div>
  )
}
