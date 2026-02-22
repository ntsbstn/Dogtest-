/**
 * GET /api/races
 * Retourne la liste des races disponibles (pour l'autocomplete).
 * Paramètre optionnel : ?q=recherche (filtre sur le nom)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase().trim() ?? ''

    const races = await prisma.race.findMany({
      where: query
        ? {
            OR: [
              { nomFrancais: { contains: query, mode: 'insensitive' } },
              { name: { contains: query, mode: 'insensitive' } },
            ],
          }
        : undefined,
      select: {
        id: true,
        name: true,
        nomFrancais: true,
      },
      orderBy: { nomFrancais: 'asc' },
      take: query ? 10 : undefined, // limite si recherche active
    })

    return NextResponse.json({ races })
  } catch (erreur) {
    console.error('[API /races] Erreur:', erreur)
    return NextResponse.json(
      { erreur: 'Impossible de récupérer les races.' },
      { status: 500 },
    )
  }
}
