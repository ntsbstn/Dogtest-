/**
 * GET /api/enrichir/progression
 * Retourne les statistiques de progression de l'enrichissement.
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [total, enrichies] = await Promise.all([
      prisma.race.count(),
      prisma.race.count({ where: { enrichie: true } }),
    ])

    // Récupérer les 5 dernières races enrichies pour affichage
    const dernieresEnrichies = await prisma.race.findMany({
      where: { enrichie: true },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      select: { name: true, nomFrancais: true, updatedAt: true },
    })

    return NextResponse.json({
      total,
      enrichies,
      restantes: total - enrichies,
      pourcentage: total > 0 ? Math.round((enrichies / total) * 100) : 0,
      dernieresEnrichies,
    })
  } catch (erreur) {
    console.error('[API /enrichir/progression] Erreur:', erreur)
    return NextResponse.json(
      { erreur: 'Impossible de récupérer la progression.' },
      { status: 500 },
    )
  }
}
