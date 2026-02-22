'use client'

/**
 * Page Statistiques – /stats
 * Affiche les statistiques globales de toutes les tentatives.
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Chargement from '@/components/Chargement'
import type { Statistiques } from '@/types'

// ────────────────────────────────────────────────────────────────────────────

interface CarteStatProps {
  valeur:      string | number
  label:       string
  icone:       string
  couleur?:    string
  description?: string
}

function CarteStat({
  valeur,
  label,
  icone,
  couleur = 'text-brand-600 dark:text-brand-400',
  description,
}: CarteStatProps) {
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icone}</span>
        {description && (
          <span className="text-xs text-slate-400 dark:text-slate-500 italic">
            {description}
          </span>
        )}
      </div>
      <p className={`text-3xl font-black ${couleur}`}>{valeur}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}

// ── Jauge de taux de réussite ────────────────────────────────────────────

function JaugeReussite({ taux }: { taux: number }) {
  const couleur =
    taux >= 70 ? 'bg-emerald-500' :
    taux >= 40 ? 'bg-brand-500'   :
                 'bg-red-500'

  const emoji =
    taux >= 80 ? '🏆' :
    taux >= 60 ? '⭐' :
    taux >= 40 ? '👍' :
                 '📚'

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Taux de réussite
          </p>
          <p className="text-3xl font-black text-slate-800 dark:text-slate-100">
            {taux}
            <span className="text-lg font-bold text-slate-400">%</span>
          </p>
        </div>
        <span className="text-4xl">{emoji}</span>
      </div>

      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${couleur} rounded-full transition-all duration-1000 ease-out`}
          style={{ width: `${taux}%` }}
          role="progressbar"
          aria-valuenow={taux}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Taux de réussite : ${taux}%`}
        />
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500">
        {taux >= 80
          ? 'Excellent ! Vous êtes un expert des races canines !'
          : taux >= 60
          ? 'Très bien ! Continuez à vous améliorer.'
          : taux >= 40
          ? 'Pas mal ! Encore un peu de pratique.'
          : 'Continuez à jouer pour progresser !'}
      </p>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────

export default function PageStats() {
  const [stats, setStats]           = useState<Statistiques | null>(null)
  const [chargement, setChargement] = useState(true)
  const [erreur, setErreur]         = useState('')

  useEffect(() => {
    const chargerStats = async () => {
      try {
        const res = await fetch('/api/stats')
        if (!res.ok) throw new Error('Erreur serveur')
        const data = await res.json()
        setStats(data.statistiques)
      } catch {
        setErreur('Impossible de charger les statistiques.')
      } finally {
        setChargement(false)
      }
    }
    chargerStats()
  }, [])

  if (chargement) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Chargement message="Chargement des statistiques…" taille="grand" />
      </div>
    )
  }

  if (erreur) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="text-5xl">😕</div>
        <p className="text-slate-600 dark:text-slate-300">{erreur}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-brand-500 hover:text-brand-600 font-medium underline"
        >
          Réessayer
        </button>
      </div>
    )
  }

  if (!stats || stats.totalTentatives === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-4 animate-fade-in">
        <div className="text-6xl">🐾</div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
            Aucune statistique disponible
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Jouez votre première partie pour voir apparaître vos statistiques ici !
          </p>
        </div>
        <Link
          href="/quiz"
          className="
            inline-flex items-center gap-2
            bg-brand-500 hover:bg-brand-600
            text-white font-semibold
            px-6 py-3 rounded-xl
            transition-colors
          "
        >
          🎮 Commencer à jouer
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="text-center space-y-1 pt-4">
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-50">
          Mes statistiques
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Toutes vos parties depuis le début
        </p>
      </div>

      {/* Jauge principale */}
      <JaugeReussite taux={stats.tauxReussite} />

      {/* Grille de stats */}
      <div className="grid grid-cols-2 gap-4">
        <CarteStat
          icone="🎯"
          valeur={stats.totalTentatives}
          label="Tentatives totales"
          couleur="text-slate-800 dark:text-slate-100"
        />

        <CarteStat
          icone="⭐"
          valeur={`${stats.scoreMoyen} / 10`}
          label="Score moyen"
          couleur="text-brand-600 dark:text-brand-400"
        />

        <CarteStat
          icone="🏆"
          valeur={`${stats.meilleurScore} / 10`}
          label="Meilleur score"
          couleur="text-amber-600 dark:text-amber-400"
        />

        <CarteStat
          icone="✅"
          valeur={`${stats.tauxReussite}%`}
          label="Taux de réussite"
          couleur={
            stats.tauxReussite >= 70
              ? 'text-emerald-600 dark:text-emerald-400'
              : 'text-brand-600 dark:text-brand-400'
          }
        />
      </div>

      {/* Niveaux de progression */}
      <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Niveaux de progression
        </h2>
        <div className="space-y-3">
          {[
            { niveau: 'Novice',    min: 0,   max: 19,  emoji: '🐾', couleur: 'bg-slate-400' },
            { niveau: 'Amateur',   min: 20,  max: 39,  emoji: '🐕', couleur: 'bg-blue-400' },
            { niveau: 'Passionné', min: 40,  max: 59,  emoji: '⭐', couleur: 'bg-brand-400' },
            { niveau: 'Expert',    min: 60,  max: 79,  emoji: '🏅', couleur: 'bg-emerald-400' },
            { niveau: 'Maître',    min: 80,  max: 100, emoji: '🏆', couleur: 'bg-amber-400' },
          ].map((n) => {
            const estAtteint = stats.tauxReussite >= n.min
            const estActuel  = stats.tauxReussite >= n.min && stats.tauxReussite < n.max
            return (
              <div
                key={n.niveau}
                className={`
                  flex items-center gap-3 p-3 rounded-xl transition-colors
                  ${estActuel
                    ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800'
                    : 'border border-transparent'
                  }
                `}
              >
                <span className={`text-xl ${!estAtteint ? 'grayscale opacity-40' : ''}`}>
                  {n.emoji}
                </span>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${estAtteint ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
                    {n.niveau}
                    {estActuel && (
                      <span className="ml-2 text-xs bg-brand-500 text-white px-2 py-0.5 rounded-full">
                        Niveau actuel
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">
                    {n.min}% – {n.max}% de réussite
                  </p>
                </div>
                {estAtteint && (
                  <span className="text-emerald-500 font-bold">✓</span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-4">
        <Link
          href="/quiz"
          className="
            inline-flex items-center gap-2
            bg-brand-500 hover:bg-brand-600
            text-white font-semibold
            px-6 py-3 rounded-xl
            transition-colors shadow-md hover:shadow-lg
          "
        >
          🎮 Continuer à jouer
        </Link>
      </div>
    </div>
  )
}
