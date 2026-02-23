/**
 * GET /api/enrichir/prochaine
 * Retourne la prochaine race à enrichir (non encore validée manuellement).
 *
 * Paramètre optionnel : ?exclure=name1,name2,... (races à ignorer dans cette session)
 * Paramètre optionnel : ?ordre=aleatoire|alphabetique (par défaut : alphabetique)
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const exclusions = searchParams.get('exclure')?.split(',').filter(Boolean) ?? []
    const ordre = searchParams.get('ordre') ?? 'alphabetique'

    const [
      { count: totalRaces },
      { count: totalEnrichies },
    ] = await Promise.all([
      supabase.from('races').select('*', { count: 'exact', head: true }),
      supabase.from('races').select('*', { count: 'exact', head: true }).eq('enrichie', true),
    ])

    let req = supabase
      .from('races')
      .select('*')
      .eq('enrichie', false)

    if (ordre === 'alphabetique') {
      req = req.order('nomFrancais', { ascending: true })
    }

    const { data: rows } = await req.limit(500)
    const filtered =
      exclusions.length > 0 && rows
        ? rows.filter((r) => !exclusions.includes(r.name))
        : rows ?? []

    let race = filtered[0] ?? null
    if (ordre === 'aleatoire' && filtered.length > 1) {
      race = filtered[Math.floor(Math.random() * filtered.length)] ?? null
    }

    if (!race) {
      return NextResponse.json({
        terminee: true,
        totalRaces: totalRaces ?? 0,
        totalEnrichies: totalEnrichies ?? 0,
        message: 'Toutes les races ont été enrichies !',
      })
    }

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
      try {
        const { fetchImageAleatoire } = await import('@/lib/dogCeoApi')
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
        total:     totalRaces ?? 0,
        enrichies: totalEnrichies ?? 0,
        restantes: (totalRaces ?? 0) - (totalEnrichies ?? 0),
        pourcentage: (totalRaces ?? 0) > 0
          ? Math.round(((totalEnrichies ?? 0) / (totalRaces ?? 0)) * 100)
          : 0,
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
