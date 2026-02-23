/**
 * GET /api/quiz/question
 * Retourne une question aléatoire (race + image depuis Dog CEO API).
 * Paramètre optionnel : ?exclure=id1,id2,... (IDs de questions déjà vues)
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { fetchImageAleatoire } from '@/lib/dogCeoApi'

export const dynamic = 'force-dynamic'

function generateId() {
  return crypto.randomUUID()
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exclusions = searchParams.get('exclure')?.split(',').filter(Boolean) ?? []

    const { count: totalRaces } = await supabase
      .from('races')
      .select('*', { count: 'exact', head: true })
    if (totalRaces === 0) {
      return NextResponse.json(
        {
          erreur:
            'Aucune race en base de données. Veuillez lancer le seed : npm run db:seed',
        },
        { status: 503 },
      )
    }

    let racesVues: string[] = []
    if (exclusions.length > 0) {
      const { data: questions } = await supabase
        .from('questions')
        .select('raceName')
        .in('id', exclusions)
      racesVues = (questions ?? []).map((q) => q.raceName)
    }

    const { count: totalEnrichies } = await supabase
      .from('races')
      .select('*', { count: 'exact', head: true })
      .eq('enrichie', true)

    const enrichieFilter = totalEnrichies && totalEnrichies > 0 ? { enrichie: true } : {}
    const { data: racesData } = await supabase
      .from('races')
      .select('name')
      .match(enrichieFilter)

    let races = (racesData ?? []).filter(
      (r) => racesVues.length === 0 || !racesVues.includes(r.name),
    )
    if (races.length === 0) {
      return NextResponse.json(
        { erreur: 'Toutes les races enrichies ont été jouées dans cette session ! Enrichissez davantage de races ou recommencez.' },
        { status: 404 },
      )
    }

    const raceAleatoire = races[Math.floor(Math.random() * races.length)]!

    let imageUrl: string
    try {
      imageUrl = await fetchImageAleatoire(raceAleatoire.name)
    } catch {
      const raceSecours = races.find((r) => r.name !== raceAleatoire.name)
      if (!raceSecours) {
        return NextResponse.json(
          { erreur: 'Impossible de récupérer une image. Veuillez réessayer.' },
          { status: 502 },
        )
      }
      imageUrl = await fetchImageAleatoire(raceSecours.name)
    }

    const { data: race, error: raceError } = await supabase
      .from('races')
      .select('*')
      .eq('name', raceAleatoire.name)
      .single()

    if (raceError || !race) {
      return NextResponse.json(
        { erreur: 'Race introuvable en base.' },
        { status: 404 },
      )
    }

    const questionId = generateId()
    const { data: questionRow, error: insertError } = await supabase
      .from('questions')
      .insert({
        id: questionId,
        raceName: race.name,
        imageUrl,
        difficulte: 1,
      })
      .select()
      .single()

    if (insertError || !questionRow) {
      console.error('[API /quiz/question] Insert question:', insertError)
      return NextResponse.json(
        { erreur: 'Erreur lors de la génération de la question.' },
        { status: 500 },
      )
    }

    const question = { ...questionRow, race }
    return NextResponse.json({ question })
  } catch (erreur) {
    console.error('[API /quiz/question] Erreur:', erreur)
    return NextResponse.json(
      { erreur: 'Erreur lors de la génération de la question.' },
      { status: 500 },
    )
  }
}
