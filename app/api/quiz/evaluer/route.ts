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
import { prisma } from '@/lib/prisma'
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

    // Validation
    if (!questionId || raceSelectionnee === undefined) {
      return NextResponse.json(
        { erreur: 'questionId et raceSelectionnee sont requis.' },
        { status: 400 },
      )
    }

    // Récupérer la question et la race associée
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: { race: true },
    })

    if (!question) {
      return NextResponse.json(
        { erreur: 'Question introuvable.' },
        { status: 404 },
      )
    }

    // Calculer le score (0 si abandonnée)
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

    // Enregistrer la tentative
    const tentative = await prisma.tentative.create({
      data: {
        questionId,
        raceSelectionnee: abandonnee ? '' : raceSelectionnee,
        attributsSelectionnes: attributsSelectionnes as object,
        score: resultatScoring.score,
        abandonnee,
      },
    })

    // Enrichissement optionnel via The Dog API
    let raceDetaillee = null
    if (question.race.dogApiId) {
      // On a déjà l'ID – pas besoin de recherche
    } else {
      raceDetaillee = await rechercherRace(question.race.name)
    }

    // Fusionner la description enrichie si disponible
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
        createdAt:  question.createdAt,
        race:       raceEnrichie,
      },
    }

    return NextResponse.json({ resultat, tentative })
  } catch (erreur) {
    console.error('[API /quiz/evaluer] Erreur:', erreur)
    return NextResponse.json(
      { erreur: 'Erreur lors de l\'évaluation de la réponse.' },
      { status: 500 },
    )
  }
}
