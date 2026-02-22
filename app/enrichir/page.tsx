'use client'

/**
 * Page Enrichissement – /enrichir
 *
 * Outil pour compléter la base de données des races de chiens.
 * L'application affiche une photo + le nom de la race, et l'utilisateur
 * sélectionne les attributs morphologiques corrects.
 *
 * Particularités vs le quiz :
 *  - Multi-sélection pour les attributs (une race peut avoir plusieurs types)
 *  - Photo switchable (plusieurs images disponibles)
 *  - Pas de score, uniquement sauvegarde en DB
 *  - Progression globale affichée en permanence
 */

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { TYPES_OREILLES, TYPES_QUEUE, TYPES_POIL, TAILLES, GROUPES } from '@/types'
import Chargement from '@/components/Chargement'
import Bouton from '@/components/Bouton'

// ── Types ──────────────────────────────────────────────────────────────────

interface RaceEnrichissement {
  id:          string
  name:        string
  nomFrancais: string
  groupe:      string | null
  taille:      string | null
  description: string | null
  typeOreilles: string[]
  typeQueue:   string[]
  typePoil:    string[]
  enrichie:    boolean
}

interface Progression {
  total:       number
  enrichies:   number
  restantes:   number
  pourcentage: number
}

interface EtatEnrichissement {
  phase:       'chargement' | 'formulaire' | 'terminee' | 'erreur'
  race:        RaceEnrichissement | null
  images:      string[]
  imageIndex:  number
  imageChargee: boolean
  progression: Progression
  // Sélections de l'utilisateur (multi-valeurs pour attributs)
  typeOreilles: string[]
  typeQueue:   string[]
  typePoil:    string[]
  taille:      string
  groupe:      string
  description: string
  // États UI
  sauvegarde:  boolean
  erreur:      string
  // Races passées (ignorées) dans la session
  racePassees: string[]
}

const ETAT_INITIAL: EtatEnrichissement = {
  phase:        'chargement',
  race:         null,
  images:       [],
  imageIndex:   0,
  imageChargee: false,
  progression:  { total: 0, enrichies: 0, restantes: 0, pourcentage: 0 },
  typeOreilles: [],
  typeQueue:    [],
  typePoil:     [],
  taille:       '',
  groupe:       '',
  description:  '',
  sauvegarde:   false,
  erreur:       '',
  racePassees:  [],
}

// ── Sous-composants ────────────────────────────────────────────────────────

interface CasesAttributProps {
  label:         string
  icone:         string
  options:       readonly string[]
  valeurs:       string[]
  surChangement: (valeurs: string[]) => void
}

function CasesAttribut({ label, icone, options, valeurs, surChangement }: CasesAttributProps) {
  const basculer = (option: string) => {
    if (valeurs.includes(option)) {
      surChangement(valeurs.filter((v) => v !== option))
    } else {
      surChangement([...valeurs, option])
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icone}</span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </span>
        {valeurs.length > 0 && (
          <span className="ml-auto text-xs bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-medium">
            {valeurs.join(', ')}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selectionne = valeurs.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => basculer(option)}
              aria-pressed={selectionne}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium border-2
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-1
                ${selectionne
                  ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/20'
                }
              `}
            >
              {selectionne ? '✓ ' : ''}{option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface SelecteurUniqueProps {
  label:         string
  icone:         string
  options:       readonly string[]
  valeur:        string
  surChangement: (valeur: string) => void
}

function SelecteurUnique({ label, icone, options, valeur, surChangement }: SelecteurUniqueProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icone}</span>
        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </span>
        {valeur && (
          <span className="ml-auto text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-medium">
            {valeur}
          </span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const selectionne = valeur === option
          return (
            <button
              key={option}
              type="button"
              onClick={() => surChangement(selectionne ? '' : option)}
              aria-pressed={selectionne}
              className={`
                px-3 py-1.5 rounded-lg text-sm font-medium border-2
                transition-all duration-150
                focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-1
                ${selectionne
                  ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                }
              `}
            >
              {selectionne ? '✓ ' : ''}{option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Barre de progression ────────────────────────────────────────────────────

function BarreProgression({ progression }: { progression: Progression }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4 space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-200">
          Progression de la base de données
        </span>
        <span className="font-bold text-brand-600 dark:text-brand-400">
          {progression.enrichies} / {progression.total}
        </span>
      </div>
      <div className="h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-brand-400 to-brand-600 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progression.pourcentage}%` }}
          role="progressbar"
          aria-valuenow={progression.pourcentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500">
        <span>{progression.pourcentage}% enrichies</span>
        <span>{progression.restantes} race{progression.restantes > 1 ? 's' : ''} restante{progression.restantes > 1 ? 's' : ''}</span>
      </div>
    </div>
  )
}

// ── Page principale ─────────────────────────────────────────────────────────

export default function PageEnrichir() {
  const [etat, setEtat] = useState<EtatEnrichissement>(ETAT_INITIAL)

  // ── Charger la prochaine race ────────────────────────────────────────────
  const chargerProchaine = useCallback(async (racePassees: string[] = []) => {
    setEtat((prev) => ({
      ...ETAT_INITIAL,
      phase:       'chargement',
      progression: prev.progression,
      racePassees,
    }))

    try {
      const params = racePassees.length > 0
        ? `?exclure=${racePassees.join(',')}`
        : ''
      const res = await fetch(`/api/enrichir/prochaine${params}`)
      if (!res.ok) throw new Error('Erreur serveur')
      const data = await res.json()

      if (data.terminee) {
        setEtat((prev) => ({
          ...prev,
          phase:       'terminee',
          progression: { ...prev.progression, restantes: 0, pourcentage: 100 },
        }))
        return
      }

      // Pré-remplir avec les valeurs existantes (pour correction)
      setEtat((prev) => ({
        ...prev,
        phase:        'formulaire',
        race:         data.race,
        images:       data.images ?? [],
        imageIndex:   0,
        imageChargee: false,
        progression:  data.progression,
        // Pré-remplir avec les données existantes
        typeOreilles: data.race.typeOreilles ?? [],
        typeQueue:    data.race.typeQueue    ?? [],
        typePoil:     data.race.typePoil     ?? [],
        taille:       data.race.taille       ?? '',
        groupe:       data.race.groupe       ?? '',
        description:  data.race.description  ?? '',
        racePassees,
        erreur:       '',
      }))
    } catch (err) {
      setEtat((prev) => ({
        ...prev,
        phase:  'erreur',
        erreur: err instanceof Error ? err.message : 'Erreur inconnue',
      }))
    }
  }, [])

  useEffect(() => {
    chargerProchaine([])
  }, [chargerProchaine])

  // ── Sauvegarder la race ──────────────────────────────────────────────────
  const sauvegarder = async () => {
    if (!etat.race) return

    // Validation
    if (!etat.typeOreilles.length) {
      setEtat((prev) => ({ ...prev, erreur: 'Sélectionnez au moins un type d\'oreilles.' }))
      return
    }
    if (!etat.typeQueue.length) {
      setEtat((prev) => ({ ...prev, erreur: 'Sélectionnez au moins un type de queue.' }))
      return
    }
    if (!etat.typePoil.length) {
      setEtat((prev) => ({ ...prev, erreur: 'Sélectionnez au moins un type de poil.' }))
      return
    }
    if (!etat.taille) {
      setEtat((prev) => ({ ...prev, erreur: 'Sélectionnez une taille.' }))
      return
    }
    if (!etat.groupe) {
      setEtat((prev) => ({ ...prev, erreur: 'Sélectionnez un groupe.' }))
      return
    }

    setEtat((prev) => ({ ...prev, sauvegarde: true, erreur: '' }))

    try {
      const res = await fetch('/api/enrichir/sauvegarder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raceName:    etat.race.name,
          typeOreilles: etat.typeOreilles,
          typeQueue:   etat.typeQueue,
          typePoil:    etat.typePoil,
          taille:      etat.taille,
          groupe:      etat.groupe,
          description: etat.description || undefined,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.erreur ?? 'Erreur de sauvegarde')
      }

      // Passer à la race suivante
      chargerProchaine(etat.racePassees)
    } catch (err) {
      setEtat((prev) => ({
        ...prev,
        sauvegarde: false,
        erreur:     err instanceof Error ? err.message : 'Erreur lors de la sauvegarde.',
      }))
    }
  }

  // ── Passer cette race ────────────────────────────────────────────────────
  const passer = () => {
    if (!etat.race) return
    const nouvellesPassees = [...etat.racePassees, etat.race.name]
    chargerProchaine(nouvellesPassees)
  }

  // ── Changer d'image ──────────────────────────────────────────────────────
  const changerImage = (sens: 1 | -1) => {
    setEtat((prev) => ({
      ...prev,
      imageIndex:   (prev.imageIndex + sens + prev.images.length) % prev.images.length,
      imageChargee: false,
    }))
  }

  // ────────────────────────────────────────────────────────────────────────
  // Rendu
  // ────────────────────────────────────────────────────────────────────────

  if (etat.phase === 'chargement') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        {etat.progression.total > 0 && (
          <div className="w-full max-w-sm">
            <BarreProgression progression={etat.progression} />
          </div>
        )}
        <Chargement message="Chargement de la prochaine race…" taille="grand" />
      </div>
    )
  }

  if (etat.phase === 'terminee') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-4 animate-bounce-in">
        <div className="text-7xl">🏆</div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            Base de données complète !
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            Toutes les races ont été enrichies. La base de données est prête pour le quiz !
          </p>
        </div>
        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl px-6 py-4">
          <p className="text-emerald-700 dark:text-emerald-300 font-semibold">
            {etat.progression.enrichies} races enrichies sur {etat.progression.total}
          </p>
        </div>
        <a
          href="/quiz"
          className="
            inline-flex items-center gap-2
            bg-brand-500 hover:bg-brand-600
            text-white font-bold px-8 py-4 rounded-2xl
            shadow-lg hover:shadow-xl transition-all
          "
        >
          🎮 Lancer le quiz
        </a>
      </div>
    )
  }

  if (etat.phase === 'erreur') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 text-center">
        <div className="text-5xl">😕</div>
        <p className="text-slate-600 dark:text-slate-300">{etat.erreur}</p>
        <Bouton variante="primaire" onClick={() => chargerProchaine(etat.racePassees)}>
          Réessayer
        </Bouton>
      </div>
    )
  }

  // ── Phase formulaire ─────────────────────────────────────────────────────
  const { race, images, imageIndex } = etat
  const imageActuelle = images[imageIndex]
  const formulaireComplet =
    etat.typeOreilles.length > 0 &&
    etat.typeQueue.length > 0 &&
    etat.typePoil.length > 0 &&
    !!etat.taille &&
    !!etat.groupe

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Progression ───────────────────────────────────────────── */}
      <BarreProgression progression={etat.progression} />

      {/* ── En-tête race ──────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
              Race à enrichir
            </p>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">
              {race?.nomFrancais}
            </h1>
            <p className="text-sm text-slate-400 dark:text-slate-500 font-mono">
              {race?.name}
            </p>
          </div>
          <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-1.5">
            <span className="text-amber-500 text-sm font-bold">
              #{etat.progression.enrichies + 1}
            </span>
          </div>
        </div>
      </div>

      {/* ── Photo du chien ────────────────────────────────────────── */}
      {imageActuelle ? (
        <div className="relative">
          <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md">
            {!etat.imageChargee && (
              <div className="absolute inset-0 shimmer" aria-hidden="true" />
            )}
            <Image
              key={imageActuelle}
              src={imageActuelle}
              alt={`Photo de ${race?.nomFrancais} pour enrichissement`}
              fill
              className={`object-cover transition-opacity duration-300 ${etat.imageChargee ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 768px) 100vw, 672px"
              priority
              onLoad={() => setEtat((prev) => ({ ...prev, imageChargee: true }))}
            />
          </div>

          {/* Navigation entre images */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
              <button
                onClick={() => changerImage(-1)}
                className="bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                aria-label="Image précédente"
              >
                ‹
              </button>
              <div className="flex gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setEtat((prev) => ({ ...prev, imageIndex: i, imageChargee: false }))}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === imageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    aria-label={`Image ${i + 1}`}
                  />
                ))}
              </div>
              <button
                onClick={() => changerImage(1)}
                className="bg-black/60 hover:bg-black/80 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                aria-label="Image suivante"
              >
                ›
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full aspect-[4/3] rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Aucune image disponible</p>
        </div>
      )}

      {/* ── Formulaire d'attributs ────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">
            Attributs morphologiques
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            Multi-sélection possible
          </span>
        </div>

        <CasesAttribut
          label="Oreilles"
          icone="👂"
          options={TYPES_OREILLES}
          valeurs={etat.typeOreilles}
          surChangement={(v) => setEtat((prev) => ({ ...prev, typeOreilles: v }))}
        />

        <CasesAttribut
          label="Queue"
          icone="🐕"
          options={TYPES_QUEUE}
          valeurs={etat.typeQueue}
          surChangement={(v) => setEtat((prev) => ({ ...prev, typeQueue: v }))}
        />

        <CasesAttribut
          label="Type de poil"
          icone="✂️"
          options={TYPES_POIL}
          valeurs={etat.typePoil}
          surChangement={(v) => setEtat((prev) => ({ ...prev, typePoil: v }))}
        />

        <SelecteurUnique
          label="Taille"
          icone="📏"
          options={TAILLES}
          valeur={etat.taille}
          surChangement={(v) => setEtat((prev) => ({ ...prev, taille: v }))}
        />

        <SelecteurUnique
          label="Groupe cynologique"
          icone="🏷️"
          options={GROUPES}
          valeur={etat.groupe}
          surChangement={(v) => setEtat((prev) => ({ ...prev, groupe: v }))}
        />

        {/* Description optionnelle */}
        <div className="space-y-1.5">
          <label
            htmlFor="description"
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>📝</span> Description <span className="text-slate-400 font-normal">(optionnel)</span>
          </label>
          <textarea
            id="description"
            value={etat.description}
            onChange={(e) => setEtat((prev) => ({ ...prev, description: e.target.value }))}
            placeholder={`Décrivez brièvement le ${race?.nomFrancais}…`}
            rows={3}
            className="
              w-full px-4 py-3 rounded-xl
              bg-white dark:bg-slate-700
              border-2 border-slate-200 dark:border-slate-600
              text-slate-800 dark:text-slate-200
              placeholder-slate-400 dark:placeholder-slate-500
              focus:outline-none focus:border-brand-400
              transition-colors resize-none text-sm
            "
          />
        </div>

        {/* Message d'erreur */}
        {etat.erreur && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-4 py-3">
            <p className="text-red-600 dark:text-red-400 text-sm">{etat.erreur}</p>
          </div>
        )}

        {/* Indicateur de complétion */}
        {!formulaireComplet && (
          <div className="flex flex-wrap gap-1.5">
            {!etat.typeOreilles.length && (
              <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">
                👂 Oreilles manquantes
              </span>
            )}
            {!etat.typeQueue.length && (
              <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">
                🐕 Queue manquante
              </span>
            )}
            {!etat.typePoil.length && (
              <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">
                ✂️ Poil manquant
              </span>
            )}
            {!etat.taille && (
              <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">
                📏 Taille manquante
              </span>
            )}
            {!etat.groupe && (
              <span className="text-xs bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">
                🏷️ Groupe manquant
              </span>
            )}
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Bouton
            variante="primaire"
            taille="grand"
            onClick={sauvegarder}
            chargement={etat.sauvegarde}
            disabled={etat.sauvegarde || !formulaireComplet}
            className="flex-1"
          >
            ✓ Sauvegarder et continuer
          </Bouton>

          <Bouton
            variante="secondaire"
            taille="grand"
            onClick={passer}
            disabled={etat.sauvegarde}
            className="sm:flex-none"
            title="Passer cette race et y revenir plus tard"
          >
            Passer →
          </Bouton>
        </div>

        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Astuce : &ldquo;Passer&rdquo; laisse la race de côté pour cette session. Elle apparaîtra à nouveau lors de la prochaine session.
        </p>
      </div>
    </div>
  )
}
