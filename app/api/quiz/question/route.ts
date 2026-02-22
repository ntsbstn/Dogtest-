/**
 * GET /api/quiz/question
 * Retourne une question aléatoire (race + image depuis Dog CEO API).
 * Paramètre optionnel : ?exclure=id1,id2,... (IDs de questions déjà vues)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchImageAleatoire } from '@/lib/dogCeoApi'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exclusions = searchParams.get('exclure')?.split(',').filter(Boolean) ?? []

    // Compter le nombre de races disponibles
    const totalRaces = await prisma.race.count()
    if (totalRaces === 0) {
      return NextResponse.json(
        {
          erreur:
            'Aucune race en base de données. Veuillez lancer le seed : npm run db:seed',
        },
        { status: 503 },
      )
    }

    // Sélectionner une race au hasard (en excluant les races récemment vues via questions)
    const racesVues = exclusions.length > 0
      ? await prisma.question.findMany({
          where: { id: { in: exclusions } },
          select: { raceName: true },
        }).then((qs) => qs.map((q) => q.raceName))
      : []

    // Préférer les races enrichies manuellement pour le quiz
    // Si aucune race enrichie disponible, fallback sur toutes les races
    const totalEnrichies = await prisma.race.count({ where: { enrichie: true } })
    const filtreEnrichie = totalEnrichies > 0 ? { enrichie: true } : {}

    const races = await prisma.race.findMany({
      where: {
        ...filtreEnrichie,
        ...(racesVues.length > 0 ? { name: { notIn: racesVues } } : {}),
      },
      select: { name: true },
    })

    if (races.length === 0) {
      return NextResponse.json(
        { erreur: 'Toutes les races enrichies ont été jouées dans cette session ! Enrichissez davantage de races ou recommencez.' },
        { status: 404 },
      )
    }

    // Race aléatoire
    const raceAleatoire = races[Math.floor(Math.random() * races.length)]

    // Récupérer l'image depuis Dog CEO API
    let imageUrl: string
    try {
      imageUrl = await fetchImageAleatoire(raceAleatoire.name)
    } catch {
      // Si Dog CEO API échoue pour cette race, on réessaie avec une autre
      const raceSecours = races.find((r) => r.name !== raceAleatoire.name)
      if (!raceSecours) {
        return NextResponse.json(
          { erreur: 'Impossible de récupérer une image. Veuillez réessayer.' },
          { status: 502 },
        )
      }
      imageUrl = await fetchImageAleatoire(raceSecours.name)
    }

    // Récupérer les détails complets de la race
    const race = await prisma.race.findUnique({
      where: { name: raceAleatoire.name },
    })

    if (!race) {
      return NextResponse.json(
        { erreur: 'Race introuvable en base.' },
        { status: 404 },
      )
    }

    // Créer ou réutiliser la question
    const question = await prisma.question.create({
      data: {
        raceName: race.name,
        imageUrl,
        difficulte: 1,
      },
      include: { race: true },
    })

    return NextResponse.json({ question })
  } catch (erreur) {
    console.error('[API /quiz/question] Erreur:', erreur)
    return NextResponse.json(
      { erreur: 'Erreur lors de la génération de la question.' },
      { status: 500 },
    )
  }
}
