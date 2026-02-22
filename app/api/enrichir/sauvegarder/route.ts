/**
 * POST /api/enrichir/sauvegarder
 * Sauvegarde les attributs morphologiques d'une race et la marque comme enrichie.
 *
 * Corps :
 * {
 *   raceName:    string,
 *   typeOreilles: string[],
 *   typeQueue:    string[],
 *   typePoil:     string[],
 *   taille:       string,
 *   groupe:       string,
 *   description?: string,
 * }
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface CorpsRequete {
  raceName:    string
  typeOreilles: string[]
  typeQueue:   string[]
  typePoil:    string[]
  taille:      string
  groupe:      string
  description?: string
}

export async function POST(request: NextRequest) {
  try {
    const corps: CorpsRequete = await request.json()
    const { raceName, typeOreilles, typeQueue, typePoil, taille, groupe, description } = corps

    // Validation basique
    if (!raceName) {
      return NextResponse.json({ erreur: 'raceName est requis.' }, { status: 400 })
    }
    if (!typeOreilles?.length || !typeQueue?.length || !typePoil?.length) {
      return NextResponse.json(
        { erreur: 'Au moins un type pour oreilles, queue et poil est requis.' },
        { status: 400 },
      )
    }
    if (!taille || !groupe) {
      return NextResponse.json(
        { erreur: 'La taille et le groupe sont requis.' },
        { status: 400 },
      )
    }

    const race = await prisma.race.update({
      where: { name: raceName },
      data: {
        typeOreilles,
        typeQueue,
        typePoil,
        taille,
        groupe,
        ...(description ? { description } : {}),
        enrichie: true,
      },
    })

    return NextResponse.json({ race, succes: true })
  } catch (erreur) {
    console.error('[API /enrichir/sauvegarder] Erreur:', erreur)
    return NextResponse.json(
      { erreur: "Impossible de sauvegarder les données de la race." },
      { status: 500 },
    )
  }
}

/**
 * DELETE /api/enrichir/sauvegarder?race=name
 * Réinitialise une race (la marque comme non enrichie).
 * Utile pour corriger une erreur de saisie.
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const raceName = searchParams.get('race')

    if (!raceName) {
      return NextResponse.json({ erreur: 'Paramètre race manquant.' }, { status: 400 })
    }

    await prisma.race.update({
      where: { name: raceName },
      data: { enrichie: false },
    })

    return NextResponse.json({ succes: true })
  } catch (erreur) {
    console.error('[API /enrichir/sauvegarder DELETE] Erreur:', erreur)
    return NextResponse.json(
      { erreur: 'Impossible de réinitialiser la race.' },
      { status: 500 },
    )
  }
}
