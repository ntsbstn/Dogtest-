'use client'

/**
 * Page Quiz – /quiz
 *
 * Phases :
 *  1. chargement  – récupération d'une question
 *  2. question    – l'utilisateur répond
 *  3. resultat    – affichage du résultat après validation
 *  4. erreur      – erreur réseau ou API
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import Chargement from '@/components/Chargement'
import Bouton from '@/components/Bouton'
import CarteScore from '@/components/CarteScore'
import AutocompleteRace from '@/components/AutocompleteRace'
import SelecteurAttribut from '@/components/SelecteurAttribut'
import CarteResultat from '@/components/CarteResultat'
import {
  TYPES_OREILLES,
  TYPES_QUEUE,
  TYPES_POIL,
  TAILLES,
  GROUPES,
} from '@/types'
import type { Question, ResultatQuestion, AttributsSelectionnes } from '@/types'

// ────────────────────────────────────────────────────────────────────────────

type Phase = 'chargement' | 'question' | 'resultat' | 'erreur'

interface EtatQuiz {
  phase:            Phase
  question:         Question | null
  raceSelectionnee: string
  attributs:        AttributsSelectionnes
  resultat:         ResultatQuestion | null
  scoreTotal:       number
  questionIndex:    number
  questionsVues:    string[]
  erreurMessage:    string
  chargement:       boolean
  indiceVisible:    boolean
  imageChargee:     boolean
}

const ETAT_INITIAL: EtatQuiz = {
  phase:            'chargement',
  question:         null,
  raceSelectionnee: '',
  attributs:        {},
  resultat:         null,
  scoreTotal:       0,
  questionIndex:    0,
  questionsVues:    [],
  erreurMessage:    '',
  chargement:       false,
  indiceVisible:    false,
  imageChargee:     false,
}

// ────────────────────────────────────────────────────────────────────────────

export default function PageQuiz() {
  const [etat, setEtat] = useState<EtatQuiz>(ETAT_INITIAL)
  const abortRef = useRef<AbortController | null>(null)

  // ── Chargement d'une nouvelle question ──────────────────────────────────
  const chargerQuestion = useCallback(async (questionsDejaVues: string[] = []) => {
    // Annuler la requête précédente
    if (abortRef.current) abortRef.current.abort()
    abortRef.current = new AbortController()

    setEtat((prev) => ({
      ...prev,
      phase:            'chargement',
      question:         null,
      raceSelectionnee: '',
      attributs:        {},
      resultat:         null,
      indiceVisible:    false,
      imageChargee:     false,
    }))

    try {
      const params = questionsDejaVues.length > 0
        ? `?exclure=${questionsDejaVues.join(',')}`
        : ''

      const res = await fetch(`/api/quiz/question${params}`, {
        signal: abortRef.current.signal,
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.erreur ?? 'Erreur inconnue')
      }

      const { question } = await res.json()

      setEtat((prev) => ({
        ...prev,
        phase:    'question',
        question,
      }))
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return

      setEtat((prev) => ({
        ...prev,
        phase:         'erreur',
        erreurMessage: err instanceof Error ? err.message : 'Erreur de connexion. Vérifiez votre réseau.',
      }))
    }
  }, [])

  // Chargement initial
  useEffect(() => {
    chargerQuestion([])
    return () => abortRef.current?.abort()
  }, [chargerQuestion])

  // ── Validation de la réponse ────────────────────────────────────────────
  const validerReponse = async (abandonnee = false) => {
    if (!etat.question) return

    setEtat((prev) => ({ ...prev, chargement: true }))

    try {
      const res = await fetch('/api/quiz/evaluer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId:            etat.question.id,
          raceSelectionnee:      etat.raceSelectionnee,
          attributsSelectionnes: etat.attributs,
          abandonnee,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.erreur ?? 'Erreur lors de la validation')
      }

      const { resultat } = await res.json()

      setEtat((prev) => ({
        ...prev,
        phase:         'resultat',
        resultat,
        scoreTotal:    prev.scoreTotal + resultat.score,
        questionIndex: prev.questionIndex + 1,
        questionsVues: [...prev.questionsVues, prev.question!.id],
        chargement:    false,
      }))
    } catch (err: unknown) {
      setEtat((prev) => ({
        ...prev,
        chargement:    false,
        phase:         'erreur',
        erreurMessage: err instanceof Error ? err.message : 'Erreur inconnue',
      }))
    }
  }

  // ── Question suivante ───────────────────────────────────────────────────
  const questionSuivante = () => {
    chargerQuestion(etat.questionsVues)
  }

  // ── Réinitialiser la session ────────────────────────────────────────────
  const reinitialiserSession = () => {
    setEtat(ETAT_INITIAL)
    chargerQuestion([])
  }

  // ── Rendu selon la phase ────────────────────────────────────────────────

  if (etat.phase === 'chargement') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Chargement message="Chargement d'une question…" taille="grand" />
      </div>
    )
  }

  if (etat.phase === 'erreur') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-6 text-center px-4">
        <div className="text-6xl">😕</div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
            Oups, une erreur est survenue
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
            {etat.erreurMessage || 'Impossible de charger la question. Vérifiez votre connexion ou lancez le seed.'}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Bouton
            variante="primaire"
            onClick={() => chargerQuestion(etat.questionsVues)}
          >
            Réessayer
          </Bouton>
          <Bouton variante="secondaire" onClick={reinitialiserSession}>
            Nouvelle session
          </Bouton>
        </div>
        <p className="text-xs text-slate-400 dark:text-slate-500">
          Conseil : assurez-vous d&apos;avoir exécuté{' '}
          <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono">
            npm run db:seed
          </code>
        </p>
      </div>
    )
  }

  if (etat.phase === 'resultat' && etat.resultat) {
    return (
      <div className="space-y-4">
        {/* Score de session */}
        <CarteScore
          scoreTotal={etat.scoreTotal}
          questionIndex={etat.questionIndex}
        />
        <CarteResultat
          resultat={etat.resultat}
          surQuestionSuivante={questionSuivante}
          scoreTotal={etat.scoreTotal}
        />
      </div>
    )
  }

  // ── Phase "question" ────────────────────────────────────────────────────
  const { question, raceSelectionnee, attributs, indiceVisible } = etat

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Barre de score */}
      <CarteScore
        scoreTotal={etat.scoreTotal}
        questionIndex={etat.questionIndex}
      />

      {/* ── Image du chien ──────────────────────────────────────────── */}
      <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-md">
        {question && (
          <>
            {!etat.imageChargee && (
              <div className="absolute inset-0 shimmer" aria-hidden="true" />
            )}
            <Image
              src={question.imageUrl}
              alt="Photo d'un chien – quelle est sa race ?"
              fill
              className={`object-cover transition-opacity duration-500 ${etat.imageChargee ? 'opacity-100' : 'opacity-0'}`}
              sizes="(max-width: 768px) 100vw, 672px"
              priority
              onLoad={() => setEtat((prev) => ({ ...prev, imageChargee: true }))}
            />
          </>
        )}

        {/* Badge indice */}
        {indiceVisible && question?.race && (
          <div className="absolute bottom-3 left-3 right-3">
            <div className="bg-black/70 backdrop-blur-sm text-white rounded-xl px-4 py-2 text-sm">
              <span className="font-semibold">Indice :</span>{' '}
              Groupe <span className="font-bold text-brand-300">{question.race.groupe ?? '?'}</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Formulaire ──────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 space-y-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800 dark:text-slate-100">
            Quelle est cette race ?
          </h2>
          {/* Bouton indice */}
          {!indiceVisible && (
            <button
              onClick={() => setEtat((prev) => ({ ...prev, indiceVisible: true }))}
              className="text-xs text-brand-500 hover:text-brand-600 font-medium underline underline-offset-2"
            >
              💡 Indice
            </button>
          )}
        </div>

        {/* Champ race */}
        <div className="space-y-1.5">
          <label className="titre-section">Race</label>
          <AutocompleteRace
            valeur={raceSelectionnee}
            surChangement={(val) =>
              setEtat((prev) => ({ ...prev, raceSelectionnee: val }))
            }
            desactive={etat.chargement}
          />
        </div>

        {/* Attributs */}
        <div className="space-y-4">
          <p className="titre-section">Attributs morphologiques</p>

          <SelecteurAttribut
            label="Oreilles"
            icone="👂"
            options={TYPES_OREILLES}
            valeur={attributs.oreilles ?? ''}
            surChangement={(v) =>
              setEtat((prev) => ({
                ...prev,
                attributs: { ...prev.attributs, oreilles: v },
              }))
            }
            desactive={etat.chargement}
          />

          <SelecteurAttribut
            label="Queue"
            icone="🐕"
            options={TYPES_QUEUE}
            valeur={attributs.queue ?? ''}
            surChangement={(v) =>
              setEtat((prev) => ({
                ...prev,
                attributs: { ...prev.attributs, queue: v },
              }))
            }
            desactive={etat.chargement}
          />

          <SelecteurAttribut
            label="Type de poil"
            icone="✂️"
            options={TYPES_POIL}
            valeur={attributs.poil ?? ''}
            surChangement={(v) =>
              setEtat((prev) => ({
                ...prev,
                attributs: { ...prev.attributs, poil: v },
              }))
            }
            desactive={etat.chargement}
          />

          <SelecteurAttribut
            label="Taille"
            icone="📏"
            options={TAILLES}
            valeur={attributs.taille ?? ''}
            surChangement={(v) =>
              setEtat((prev) => ({
                ...prev,
                attributs: { ...prev.attributs, taille: v },
              }))
            }
            desactive={etat.chargement}
          />

          <SelecteurAttribut
            label="Groupe"
            icone="🏷️"
            options={GROUPES}
            valeur={attributs.groupe ?? ''}
            surChangement={(v) =>
              setEtat((prev) => ({
                ...prev,
                attributs: { ...prev.attributs, groupe: v },
              }))
            }
            desactive={etat.chargement}
          />
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Bouton
            variante="primaire"
            taille="grand"
            onClick={() => validerReponse(false)}
            chargement={etat.chargement}
            disabled={etat.chargement || !raceSelectionnee}
            className="flex-1"
          >
            Valider ma réponse
          </Bouton>

          <Bouton
            variante="secondaire"
            taille="grand"
            onClick={() => validerReponse(true)}
            disabled={etat.chargement}
            className="sm:flex-none"
          >
            Je ne sais pas
          </Bouton>
        </div>
      </div>
    </div>
  )
}
