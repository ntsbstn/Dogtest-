/**
 * POST /api/quiz/evaluer
 * Évalue la réponse de l'utilisateur et enregistre la tentative.
 *
 * Corps de la requête :
 * {
 *   questionId:           string,
 *   raceSelectionnee:     string,
 *   attributsSelectionnes: { oreilles?, queue?, poil?, taille?, groupe? },
 *   abandonnee?:          boolean
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { evaluerReponse } from '@/lib/scoring'
import { rechercherRace } from '@/lib/theDogApi'
import type { AttributsSelectionnes } from '@/types'

export const dynamic = 'force-dynamic'

interface CorpsRequete {
  questionId:            string
  raceSelectionnee:      string
  attributsSelectionnes: AttributsSelectionnes
  abandonnee?:           boolean
}

export async function POST(request: NextRequest) {
  try {
    const corps: CorpsRequete = await request.json()
    const {
      questionId,
      raceSelectionnee,
      attributsSelectionnes,
      abandonnee = false,
    } = corps

    if (!questionId || raceSelectionnee === undefined) {
      return NextResponse.json(
        { erreur: 'questionId et raceSelectionnee sont requis.' },
        { status: 400 },
      )
    }

    const { data: questionRow, error: questionError } = await supabase
      .from('questions')
      .select('*, races(*)')
      .eq('id', questionId)
      .single()

    if (questionError || !questionRow) {
      return NextResponse.json(
        { erreur: 'Question introuvable.' },
        { status: 404 },
      )
    }

    const raceEmbed = (questionRow as { races?: unknown }).races
    const race = Array.isArray(raceEmbed) ? raceEmbed[0] : raceEmbed
    const question = { ...questionRow, race }
    if (!question.race) {
      return NextResponse.json(
        { erreur: 'Question introuvable.' },
        { status: 404 },
      )
    }

    const resultatScoring = abandonnee
      ? {
          raceCorrecte: false,
          attributsCorrects: {
            oreilles: false,
            queue:    false,
            poil:     false,
            taille:   false,
            groupe:   false,
          },
          score:    0,
          scoreMax: 10,
        }
      : evaluerReponse(question.race, raceSelectionnee, attributsSelectionnes)

    const tentativeId = crypto.randomUUID()
    await supabase.from('tentatives').insert({
      id: tentativeId,
      questionId,
      raceSelectionnee: abandonnee ? '' : raceSelectionnee,
      attributsSelectionnes: attributsSelectionnes as object,
      score: resultatScoring.score,
      abandonnee,
    })

    let raceDetaillee = null
    if (question.race.dogApiId) {
      // déjà enrichi
    } else {
      raceDetaillee = await rechercherRace(question.race.name)
    }

    const raceEnrichie = {
      ...question.race,
      description:
        raceDetaillee?.description ??
        question.race.description ??
        `La race ${question.race.nomFrancais} est un chien remarquable.`,
    }

    const resultat = {
      ...resultatScoring,
      race:     raceEnrichie,
      question: {
        id:         question.id,
        raceName:   question.raceName,
        imageUrl:   question.imageUrl,
        difficulte: question.difficulte,
        createdAt: question.createdAt,
        race:       raceEnrichie,
      },
    }

    const { data: tentative } = await supabase
      .from('tentatives')
      .select('*')
      .eq('id', tentativeId)
      .single()

    return NextResponse.json({ resultat, tentative: tentative ?? {} })
  } catch (erreur) {
    console.error('[API /quiz/evaluer] Erreur:', erreur)
    return NextResponse.json(
      { erreur: 'Erreur lors de l\'évaluation de la réponse.' },
      { status: 500 },
    )
  }
}
