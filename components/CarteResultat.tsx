'use client'

/**
 * Composant affichant le résultat détaillé après validation d'une réponse.
 */

import Image from 'next/image'
import Bouton from './Bouton'
import type { ResultatQuestion } from '@/types'

interface CarteResultatProps {
  resultat:          ResultatQuestion
  surQuestionSuivante: () => void
  scoreTotal:        number
}

const ICONES_ATTRIBUTS: Record<string, string> = {
  oreilles: '👂',
  queue:    '🐕',
  poil:     '✂️',
  taille:   '📏',
  groupe:   '🏷️',
}

const LABELS_ATTRIBUTS: Record<string, string> = {
  oreilles: 'Oreilles',
  queue:    'Queue',
  poil:     'Type de poil',
  taille:   'Taille',
  groupe:   'Groupe',
}

function BadgeResultat({ correct }: { correct: boolean }) {
  return (
    <span
      className={`
        inline-flex items-center justify-center
        w-5 h-5 rounded-full text-xs font-bold
        ${correct
          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
          : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
        }
      `}
    >
      {correct ? '✓' : '✗'}
    </span>
  )
}

export default function CarteResultat({
  resultat,
  surQuestionSuivante,
  scoreTotal,
}: CarteResultatProps) {
  const { raceCorrecte, attributsCorrects, score, scoreMax, race, question } = resultat

  const attributsEntries = Object.entries(attributsCorrects) as [
    keyof typeof attributsCorrects,
    boolean,
  ][]

  return (
    <div className="animate-slide-up space-y-4">
      {/* En-tête : résultat global */}
      <div
        className={`
          rounded-2xl p-5 text-center
          ${raceCorrecte
            ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }
        `}
      >
        <p className="text-4xl mb-2">{raceCorrecte ? '🎉' : '😅'}</p>
        <h2 className={`text-xl font-bold mb-1 ${raceCorrecte ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
          {raceCorrecte ? 'Bonne réponse !' : 'Pas tout à fait…'}
        </h2>
        <p className="text-slate-600 dark:text-slate-300">
          C&apos;est un(e){' '}
          <strong className="font-bold text-slate-800 dark:text-slate-100">
            {race.nomFrancais}
          </strong>
        </p>

        {/* Score */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <div className="text-center">
            <p className="text-3xl font-black text-brand-600 dark:text-brand-400">
              +{score}
            </p>
            <p className="text-xs text-slate-400">/ {scoreMax} pts</p>
          </div>
          <div className="w-px h-10 bg-slate-200 dark:bg-slate-600" />
          <div className="text-center">
            <p className="text-xl font-bold text-slate-700 dark:text-slate-300">
              {scoreTotal}
            </p>
            <p className="text-xs text-slate-400">total session</p>
          </div>
        </div>
      </div>

      {/* Image de la race */}
      <div className="relative w-full h-40 rounded-xl overflow-hidden">
        <Image
          src={question.imageUrl}
          alt={`Photo de ${race.nomFrancais}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 600px"
        />
      </div>

      {/* Détail des attributs */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
          Détail des attributs
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {attributsEntries.map(([attribut, correct]) => (
            <div
              key={attribut}
              className={`
                flex items-center gap-2 p-2 rounded-lg text-sm
                ${correct
                  ? 'bg-emerald-50 dark:bg-emerald-900/10'
                  : 'bg-red-50 dark:bg-red-900/10'
                }
              `}
            >
              <BadgeResultat correct={correct} />
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {ICONES_ATTRIBUTS[attribut]} {LABELS_ATTRIBUTS[attribut]}
                </p>
                <p className="font-medium text-slate-700 dark:text-slate-200 text-xs">
                  {attribut === 'oreilles' && (race.typeOreilles.join(', ') || '—')}
                  {attribut === 'queue'    && (race.typeQueue.join(', ')    || '—')}
                  {attribut === 'poil'     && (race.typePoil.join(', ')     || '—')}
                  {attribut === 'taille'   && (race.taille                  || '—')}
                  {attribut === 'groupe'   && (race.groupe                  || '—')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description de la race */}
      {race.description && (
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            À propos de la race
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {race.description}
          </p>
        </div>
      )}

      {/* Bouton suivant */}
      <Bouton
        variante="primaire"
        taille="grand"
        onClick={surQuestionSuivante}
        className="w-full"
      >
        Question suivante →
      </Bouton>
    </div>
  )
}
