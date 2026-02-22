/**
 * Composant affichant le score courant de la session
 */

interface CarteScoreProps {
  scoreTotal:     number
  questionIndex:  number
  scoreMax?:      number
}

export default function CarteScore({
  scoreTotal,
  questionIndex,
  scoreMax = 10,
}: CarteScoreProps) {
  const maxPossible = questionIndex * scoreMax
  const pourcentage = maxPossible > 0 ? Math.min(100, Math.round((scoreTotal / maxPossible) * 100)) : 0

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Score de session
          </p>
          <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
            {scoreTotal}
            <span className="text-sm font-normal text-slate-400 dark:text-slate-500 ml-1">
              pts
            </span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Questions
          </p>
          <p className="text-2xl font-bold text-slate-700 dark:text-slate-300">
            {questionIndex}
          </p>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${pourcentage}%` }}
          role="progressbar"
          aria-valuenow={pourcentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Score : ${pourcentage}%`}
        />
      </div>
      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 text-right">
        {pourcentage}% de précision
      </p>
    </div>
  )
}
