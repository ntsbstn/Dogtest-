/**
 * Couche d'accès à The Dog API
 * Documentation : https://thedogapi.com/
 *
 * Nécessite une clé API dans la variable d'environnement DOG_API_KEY.
 * Cache simple en mémoire pour limiter les appels.
 */

const BASE_URL = 'https://api.thedogapi.com/v1'

// Cache en mémoire (durée 30 minutes)
const DUREE_CACHE_MS = 30 * 60 * 1000

interface EntreeCache<T> {
  donnees: T
  expiration: number
}

const cache = new Map<string, EntreeCache<unknown>>()

function obtenirCache<T>(cle: string): T | null {
  const entree = cache.get(cle)
  if (!entree) return null
  if (Date.now() > entree.expiration) {
    cache.delete(cle)
    return null
  }
  return entree.donnees as T
}

function definirCache<T>(cle: string, donnees: T): void {
  cache.set(cle, {
    donnees,
    expiration: Date.now() + DUREE_CACHE_MS,
  })
}

function obtenirCleApi(): string {
  const cle = process.env.DOG_API_KEY
  if (!cle) {
    console.warn('⚠️ DOG_API_KEY non défini – The Dog API désactivé')
    return ''
  }
  return cle
}

// ── Interfaces ─────────────────────────────────────────────────────────────

export interface RaceDetaillee {
  id:           number
  name:         string
  breed_group?: string
  size?:        string
  temperament?: string
  life_span?:   string
  description?: string
  weight?:      { imperial: string; metric: string }
  height?:      { imperial: string; metric: string }
}

// ── Fonctions publiques ────────────────────────────────────────────────────

/**
 * Recherche une race par nom (recherche approximative).
 * Retourne null si la clé API est absente ou si aucun résultat.
 */
export async function rechercherRace(nom: string): Promise<RaceDetaillee | null> {
  const cle = obtenirCleApi()
  if (!cle) return null

  const cleCachee = `race-${nom.toLowerCase()}`
  const cached = obtenirCache<RaceDetaillee>(cleCachee)
  if (cached) return cached

  try {
    const res = await fetch(
      `${BASE_URL}/breeds/search?q=${encodeURIComponent(nom)}`,
      {
        headers: { 'x-api-key': cle },
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) return null

    const data: RaceDetaillee[] = await res.json()
    if (data.length === 0) return null

    definirCache(cleCachee, data[0])
    return data[0]
  } catch {
    return null
  }
}

/**
 * Récupère les détails d'une race par ID The Dog API.
 * Retourne null si la clé API est absente ou en cas d'erreur.
 */
export async function fetchRaceParId(id: number): Promise<RaceDetaillee | null> {
  const cle = obtenirCleApi()
  if (!cle) return null

  const cleCachee = `race-id-${id}`
  const cached = obtenirCache<RaceDetaillee>(cleCachee)
  if (cached) return cached

  try {
    const res = await fetch(`${BASE_URL}/breeds/${id}`, {
      headers: { 'x-api-key': cle },
      next: { revalidate: 3600 },
    })

    if (!res.ok) return null

    const data: RaceDetaillee = await res.json()
    definirCache(cleCachee, data)
    return data
  } catch {
    return null
  }
}

/**
 * Récupère toutes les races disponibles sur The Dog API.
 */
export async function fetchToutesLesRaces(): Promise<RaceDetaillee[]> {
  const cle = obtenirCleApi()
  if (!cle) return []

  const cleCachee = 'toutes-races'
  const cached = obtenirCache<RaceDetaillee[]>(cleCachee)
  if (cached) return cached

  try {
    const res = await fetch(`${BASE_URL}/breeds`, {
      headers: { 'x-api-key': cle },
      next: { revalidate: 3600 },
    })

    if (!res.ok) return []

    const data: RaceDetaillee[] = await res.json()
    definirCache(cleCachee, data)
    return data
  } catch {
    return []
  }
}
