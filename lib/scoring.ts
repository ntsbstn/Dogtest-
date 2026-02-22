/**
 * Logique de scoring du quiz.
 *
 * Barème :
 *  – Race correcte   : 5 points
 *  – Oreilles OK     : 1 point
 *  – Queue OK        : 1 point
 *  – Poil OK         : 1 point
 *  – Taille OK       : 1 point
 *  – Groupe OK       : 1 point
 *  Score max         : 10 points
 */

import type { AttributsSelectionnes } from '@/types'

// Type minimal nécessaire pour le scoring (compatible Prisma et type Race)
type RaceScoring = {
  name:         string
  nomFrancais:  string
  taille:       string | null
  groupe:       string | null
  typeOreilles: string[]
  typeQueue:    string[]
  typePoil:     string[]
}

export interface ResultatScoring {
  raceCorrecte: boolean
  attributsCorrects: {
    oreilles: boolean
    queue:    boolean
    poil:     boolean
    taille:   boolean
    groupe:   boolean
  }
  score:    number
  scoreMax: number
}

const SCORE_RACE_CORRECTE    = 5
const SCORE_ATTRIBUT_CORRECT = 1
export const SCORE_MAX       = 10

/**
 * Évalue la réponse de l'utilisateur et calcule le score.
 */
export function evaluerReponse(
  race:               RaceScoring,
  raceSelectionnee:   string,
  attributs:          AttributsSelectionnes,
): ResultatScoring {
  // Race correcte (comparaison insensible à la casse)
  const raceCorrecte =
    raceSelectionnee.toLowerCase().trim() === race.name.toLowerCase().trim() ||
    raceSelectionnee.toLowerCase().trim() === race.nomFrancais.toLowerCase().trim()

  // Attributs corrects
  const oreillesOk =
    !!attributs.oreilles && race.typeOreilles.includes(attributs.oreilles)

  const queueOk =
    !!attributs.queue && race.typeQueue.includes(attributs.queue)

  const poilOk =
    !!attributs.poil && race.typePoil.includes(attributs.poil)

  const tailleOk =
    !!attributs.taille &&
    attributs.taille.toLowerCase() === (race.taille ?? '').toLowerCase()

  const groupeOk =
    !!attributs.groupe &&
    attributs.groupe.toLowerCase() === (race.groupe ?? '').toLowerCase()

  // Calcul du score
  let score = 0
  if (raceCorrecte)   score += SCORE_RACE_CORRECTE
  if (oreillesOk)     score += SCORE_ATTRIBUT_CORRECT
  if (queueOk)        score += SCORE_ATTRIBUT_CORRECT
  if (poilOk)         score += SCORE_ATTRIBUT_CORRECT
  if (tailleOk)       score += SCORE_ATTRIBUT_CORRECT
  if (groupeOk)       score += SCORE_ATTRIBUT_CORRECT

  return {
    raceCorrecte,
    attributsCorrects: {
      oreilles: oreillesOk,
      queue:    queueOk,
      poil:     poilOk,
      taille:   tailleOk,
      groupe:   groupeOk,
    },
    score,
    scoreMax: SCORE_MAX,
  }
}

/**
 * Calcule le taux de réussite en pourcentage.
 * Une tentative est "réussie" si le score >= 5 (race correcte).
 */
export function calculerTauxReussite(
  scores: number[],
  seuilReussite: number = SCORE_RACE_CORRECTE,
): number {
  if (scores.length === 0) return 0
  const reussites = scores.filter((s) => s >= seuilReussite).length
  return Math.round((reussites / scores.length) * 100)
}
