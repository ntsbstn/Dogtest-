/**
 * Couche d'accès à Dog CEO API
 * Documentation : https://dog.ceo/dog-api/documentation
 *
 * Cache simple en mémoire pour limiter les appels réseau.
 */

const BASE_URL = 'https://dog.ceo/api'

// Cache en mémoire (durée 10 minutes)
const DUREE_CACHE_MS = 10 * 60 * 1000

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

// ── Fonctions publiques ────────────────────────────────────────────────────

/**
 * Récupère la liste complète des races disponibles.
 */
export async function fetchListeRaces(): Promise<Record<string, string[]>> {
  const cleCachee = 'races-liste'
  const cached = obtenirCache<Record<string, string[]>>(cleCachee)
  if (cached) return cached

  const res = await fetch(`${BASE_URL}/breeds/list/all`, {
    next: { revalidate: 3600 }, // 1 heure côté Next.js
  })

  if (!res.ok) {
    throw new Error(`Dog CEO API : erreur ${res.status} lors de la récupération des races`)
  }

  const data = await res.json()
  const races: Record<string, string[]> = data.message
  definirCache(cleCachee, races)
  return races
}

/**
 * Récupère une image aléatoire pour une race donnée.
 */
export async function fetchImageAleatoire(race: string): Promise<string> {
  const res = await fetch(`${BASE_URL}/breed/${race}/images/random`)

  if (!res.ok) {
    throw new Error(`Dog CEO API : erreur ${res.status} pour la race "${race}"`)
  }

  const data = await res.json()
  return data.message as string
}

/**
 * Récupère plusieurs images aléatoires pour une race donnée.
 */
export async function fetchImagesAleatoires(race: string, nombre: number = 3): Promise<string[]> {
  const res = await fetch(`${BASE_URL}/breed/${race}/images/random/${nombre}`)

  if (!res.ok) {
    throw new Error(`Dog CEO API : erreur ${res.status} pour la race "${race}"`)
  }

  const data = await res.json()
  return data.message as string[]
}
