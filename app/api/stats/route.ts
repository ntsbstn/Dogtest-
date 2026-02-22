/**
 * GET /api/stats
 * Retourne les statistiques globales de toutes les tentatives.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculerTauxReussite } from '@/lib/scoring'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const tentatives = await prisma.tentative.findMany({
      select: { score: true, abandonnee: true },
    })

    const total = tentatives.length

    if (total === 0) {
      return NextResponse.json({
        statistiques: {
          totalTentatives: 0,
          scoreMoyen:      0,
          meilleurScore:   0,
          tauxReussite:    0,
        },
      })
    }

    const scores       = tentatives.map((t) => t.score)
    const sommeScores  = scores.reduce((acc, s) => acc + s, 0)
    const scoreMoyen   = Math.round((sommeScores / total) * 10) / 10
    const meilleurScore = Math.max(...scores)
    const tauxReussite  = calculerTauxReussite(scores)

    return NextResponse.json({
      statistiques: {
        totalTentatives: total,
        scoreMoyen,
        meilleurScore,
        tauxReussite,
      },
    })
  } catch (erreur) {
    console.error('[API /stats] Erreur:', erreur)
    return NextResponse.json(
      { erreur: 'Impossible de récupérer les statistiques.' },
      { status: 500 },
    )
  }
}
