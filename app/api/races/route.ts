/**
 * GET /api/races
 * Retourne la liste des races disponibles (pour l'autocomplete).
 * Paramètre optionnel : ?q=recherche (filtre sur le nom)
 */

import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.toLowerCase().trim() ?? ''

    let req = supabase
      .from('races')
      .select('id, name, nomFrancais')
      .order('nomFrancais', { ascending: true })

    if (query) {
      req = req.or(`nomFrancais.ilike.%${query}%,name.ilike.%${query}%`)
    } else {
      req = req.limit(500)
    }

    const { data: races, error } = await req
    if (error) throw error

    const list = (races ?? []).slice(0, query ? 10 : undefined)
    return NextResponse.json({ races: list })
  } catch (erreur) {
    console.error('[API /races] Erreur:', erreur)
    return NextResponse.json(
      { erreur: 'Impossible de récupérer les races.' },
      { status: 500 },
    )
  }
}
