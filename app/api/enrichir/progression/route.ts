/**
 * GET /api/enrichir/progression
 * Retourne les statistiques de progression de l'enrichissement.
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const [
      { count: total },
      { count: enrichies },
    ] = await Promise.all([
      supabase.from('races').select('*', { count: 'exact', head: true }),
      supabase.from('races').select('*', { count: 'exact', head: true }).eq('enrichie', true),
    ])

    const { data: dernieresEnrichies } = await supabase
      .from('races')
      .select('name, nomFrancais, updatedAt')
      .eq('enrichie', true)
      .order('updatedAt', { ascending: false })
      .limit(5)

    return NextResponse.json({
      total: total ?? 0,
      enrichies: enrichies ?? 0,
      restantes: (total ?? 0) - (enrichies ?? 0),
      pourcentage: (total ?? 0) > 0 ? Math.round(((enrichies ?? 0) / (total ?? 0)) * 100) : 0,
      dernieresEnrichies: dernieresEnrichies ?? [],
    })
  } catch (erreur) {
    console.error('[API /enrichir/progression] Erreur:', erreur)
    return NextResponse.json(
      { erreur: 'Impossible de récupérer la progression.' },
      { status: 500 },
    )
  }
}
