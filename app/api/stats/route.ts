/**
 * GET /api/stats
 * Retourne les statistiques globales de toutes les tentatives.
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculerTauxReussite } from '@/lib/scoring'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { data: tentatives, error } = await supabase
      .from('tentatives')
      .select('score, abandonnee')

    if (error) throw error
    const list = tentatives ?? []
    const total = list.length

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

    const scores         = list.map((t) => t.score)
    const sommeScores    = scores.reduce((acc, s) => acc + s, 0)
    const scoreMoyen     = Math.round((sommeScores / total) * 10) / 10
    const meilleurScore  = Math.max(...scores)
    const tauxReussite   = calculerTauxReussite(scores)

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
