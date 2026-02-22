/**
 * GET /api/enrichir/prochaine
 * Retourne la prochaine race à enrichir (non encore validée manuellement).
 *
 * Paramètre optionnel : ?exclure=name1,name2,... (races à ignorer dans cette session)
 * Paramètre optionnel : ?ordre=aleatoire|alphabetique (par défaut : alphabetique)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { fetchImageAleatoire } from '@/lib/dogCeoApi'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exclusions = searchParams.get('exclure')?.split(',').filter(Boolean) ?? []
    const ordre = searchParams.get('ordre') ?? 'alphabetique'

    // Compter le total et les races déjà enrichies pour la progression
    const [totalRaces, totalEnrichies] = await Promise.all([
      prisma.race.count(),
      prisma.race.count({ where: { enrichie: true } }),
    ])

    // Récupérer la prochaine race non enrichie (hors exclusions de session)
    const prochaineRace = await prisma.race.findFirst({
      where: {
        enrichie: false,
        ...(exclusions.length > 0 ? { name: { notIn: exclusions } } : {}),
      },
      orderBy:
        ordre === 'aleatoire'
          ? undefined // Prisma ne supporte pas ORDER BY RANDOM nativement
          : { nomFrancais: 'asc' },
    })

    if (!prochaineRace) {
      return NextResponse.json({
        terminee: true,
        totalRaces,
        totalEnrichies,
        message: 'Toutes les races ont été enrichies !',
      })
    }

    // Si ordre aléatoire, on choisit parmi toutes les non-enrichies
    let race = prochaineRace
    if (ordre === 'aleatoire') {
      const toutesNonEnrichies = await prisma.race.findMany({
        where: {
          enrichie: false,
          ...(exclusions.length > 0 ? { name: { notIn: exclusions } } : {}),
        },
        select: { name: true },
      })
      if (toutesNonEnrichies.length > 0) {
        const choix =
          toutesNonEnrichies[Math.floor(Math.random() * toutesNonEnrichies.length)]
        const raceChoisie = await prisma.race.findUnique({ where: { name: choix.name } })
        if (raceChoisie) race = raceChoisie
      }
    }

    // Récupérer plusieurs images pour permettre à l'utilisateur de choisir la meilleure vue
    let images: string[] = []
    try {
      const res = await fetch(
        `https://dog.ceo/api/breed/${race.name}/images/random/3`,
      )
      if (res.ok) {
        const data = await res.json()
        images = data.message ?? []
      }
    } catch {
      // Fallback : une seule image
      try {
        const img = await fetchImageAleatoire(race.name)
        images = [img]
      } catch {
        images = []
      }
    }

    return NextResponse.json({
      terminee: false,
      race,
      images,
      progression: {
        total:     totalRaces,
        enrichies: totalEnrichies,
        restantes: totalRaces - totalEnrichies,
        pourcentage: Math.round((totalEnrichies / totalRaces) * 100),
      },
    })
  } catch (erreur) {
    console.error('[API /enrichir/prochaine] Erreur:', erreur)
    return NextResponse.json(
      { erreur: 'Impossible de récupérer la prochaine race.' },
      { status: 500 },
    )
  }
}
