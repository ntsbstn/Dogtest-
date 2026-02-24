// ────────────────────────────────────────────────────────────────────────────
// Types partagés – Quiz Races de Chiens
// ────────────────────────────────────────────────────────────────────────────

// ── Constantes des attributs ─────────────────────────────────────────────

export const TYPES_OREILLES = [
  'Dressées',
  'Tombantes',
  'Semi-dressées',
  'Longues',
] as const

export const TYPES_QUEUE = [
  'Droite',
  'Enroulée',
  'Courte',
  'En panache',
] as const

export const TYPES_POIL = [
  'Court',
  'Mi-long',
  'Long',
  'Bouclé',
  'Dur',
] as const

export const TAILLES = [
  'Toy',
  'Petit',
  'Moyen',
  'Grand',
  'Géant',
] as const

export const GROUPES = [
  'Chiens de berger et bouvier',
  'Pinscher, Schnauzer et molossoïdes',
  'Terriers',
  'Teckels',
  'Spitz et primitifs',
  'Chiens courants',
  "Chiens d'arrêt",
  "Retrievers et chiens d'eau",
  "Chiens d'agrément",
  'Lévriers',
] as const

export type TypeOreilles  = typeof TYPES_OREILLES[number]
export type TypeQueue     = typeof TYPES_QUEUE[number]
export type TypePoil      = typeof TYPES_POIL[number]
export type Taille        = typeof TAILLES[number]
export type Groupe        = typeof GROUPES[number]

// ── Race ──────────────────────────────────────────────────────────────────

export interface Race {
  id:           string
  name:         string
  nomFrancais:  string
  groupe:       string | null
  taille:       string | null
  description:  string | null
  typeOreilles: string[]
  typeQueue:    string[]
  typePoil:     string[]
  dogApiId:     number | null
  enrichie:     boolean
  createdAt:    string
  updatedAt:    string
}

// ── Question ──────────────────────────────────────────────────────────────

export interface Question {
  id:        string
  raceName:  string
  imageUrl:  string
  difficulte: number
  createdAt: string
  race:      Race
}

// ── Attributs sélectionnés par l'utilisateur ──────────────────────────────

export interface AttributsSelectionnes {
  oreilles?: string
  queue?:    string
  poil?:     string
  taille?:   string
  groupe?:   string
}

// ── Tentative ─────────────────────────────────────────────────────────────

export interface Tentative {
  id:                   string
  questionId:           string
  raceSelectionnee:     string
  attributsSelectionnes: AttributsSelectionnes
  score:                number
  abandonnee:           boolean
  createdAt:            string
}

// ── Résultat d'évaluation ─────────────────────────────────────────────────

export interface ResultatQuestion {
  raceCorrecte:     boolean
  attributsCorrects: {
    oreilles: boolean
    queue:    boolean
    poil:     boolean
    taille:   boolean
    groupe:   boolean
  }
  score:       number
  scoreMax:    number
  race:        Race
  question:    Question
}

// ── Statistiques globales ─────────────────────────────────────────────────

export interface Statistiques {
  totalTentatives:  number
  scoreMoyen:       number
  meilleurScore:    number
  tauxReussite:     number
}

// ── Réponses API ──────────────────────────────────────────────────────────

export interface ApiReponseQuestion {
  question: Question
}

export interface ApiReponseEvaluation {
  resultat:  ResultatQuestion
  tentative: Tentative
}

export interface ApiReponseRaces {
  races: Pick<Race, 'id' | 'name' | 'nomFrancais'>[]
}

export interface ApiReponseStats {
  statistiques: Statistiques
}

export interface ApiErreur {
  erreur: string
}

// ── État du quiz côté client ──────────────────────────────────────────────

export interface EtatQuiz {
  phase:           'chargement' | 'question' | 'resultat' | 'erreur'
  question:        Question | null
  raceSelectionnee: string
  attributs:       AttributsSelectionnes
  resultat:        ResultatQuestion | null
  scoreTotal:      number
  questionIndex:   number
  questionsVues:   Set<string>
  erreurMessage:   string
  chargement:      boolean
  indiceVisible:   boolean
}
