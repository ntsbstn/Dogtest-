/**
 * Script de seed – peuple la base de données avec les races de chiens.
 *
 * Fonctionnement :
 *  1. Récupère toutes les races depuis Dog CEO API
 *  2. Tente d'enrichir chaque race via The Dog API (optionnel)
 *  3. Insère ou met à jour les races en base
 *
 * Lancement : npm run db:seed
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Types ──────────────────────────────────────────────────────────────────
interface DogCeoBreeds {
  message: Record<string, string[]>
  status: string
}

interface DogApiBreed {
  id: number
  name: string
  breed_group?: string
  size?: string
  temperament?: string
  life_span?: string
  description?: string
}

// ── Données statiques : enrichissement manuel des principales races ────────
// Pour les races les plus connues, on fournit des attributs précis.
// Les races non listées ici reçoivent des valeurs génériques.

const ENRICHISSEMENT_RACES: Record<
  string,
  {
    nomFrancais: string
    groupe: string
    taille: string
    typeOreilles: string[]
    typeQueue: string[]
    typePoil: string[]
    description?: string
  }
> = {
  labrador: {
    nomFrancais: 'Labrador Retriever',
    groupe: 'Retriever',
    taille: 'Grand',
    typeOreilles: ['Tombantes'],
    typeQueue: ['Droite'],
    typePoil: ['Court'],
    description:
      'Chien de famille par excellence, le Labrador est connu pour sa douceur, son intelligence et son amour du jeu.',
  },
  golden: {
    nomFrancais: 'Golden Retriever',
    groupe: 'Retriever',
    taille: 'Grand',
    typeOreilles: ['Tombantes'],
    typeQueue: ['En panache'],
    typePoil: ['Mi-long', 'Long'],
    description:
      'Le Golden Retriever est un chien affectueux et patient, idéal pour les familles avec enfants.',
  },
  bulldog: {
    nomFrancais: 'Bouledogue Anglais',
    groupe: 'Molosse',
    taille: 'Moyen',
    typeOreilles: ['Semi-dressées'],
    typeQueue: ['Courte'],
    typePoil: ['Court'],
    description:
      'Le Bouledogue anglais est reconnaissable à sa face aplatie et sa silhouette trapue. Calme et affectueux.',
  },
  poodle: {
    nomFrancais: 'Caniche',
    groupe: 'Compagnie',
    taille: 'Moyen',
    typeOreilles: ['Tombantes'],
    typeQueue: ['Droite'],
    typePoil: ['Bouclé'],
    description:
      "Le Caniche est l'une des races les plus intelligentes. Il existe en quatre tailles : toy, nain, moyen et grand.",
  },
  beagle: {
    nomFrancais: 'Beagle',
    groupe: 'Chien courant',
    taille: 'Petit',
    typeOreilles: ['Tombantes', 'Longues'],
    typeQueue: ['Droite'],
    typePoil: ['Court'],
    description:
      'Le Beagle est un chien courant robuste, curieux et joyeux, apprécié pour son excellent flair.',
  },
  boxer: {
    nomFrancais: 'Boxer',
    groupe: 'Molosse',
    taille: 'Grand',
    typeOreilles: ['Semi-dressées'],
    typeQueue: ['Courte'],
    typePoil: ['Court'],
    description:
      'Le Boxer est un chien énergique et joueur, à la fois protecteur et affectueux avec sa famille.',
  },
  chihuahua: {
    nomFrancais: 'Chihuahua',
    groupe: 'Compagnie',
    taille: 'Toy',
    typeOreilles: ['Dressées'],
    typeQueue: ['En panache'],
    typePoil: ['Court', 'Mi-long'],
    description:
      'Le Chihuahua est la plus petite race de chien au monde. Vif et courageux malgré sa petite taille.',
  },
  husky: {
    nomFrancais: 'Husky Sibérien',
    groupe: 'Spitz',
    taille: 'Moyen',
    typeOreilles: ['Dressées'],
    typeQueue: ['En panache'],
    typePoil: ['Mi-long'],
    description:
      "Chien de traîneau d'origine sibérienne, le Husky est connu pour ses yeux bleus perçants et son endurance exceptionnelle.",
  },
  germanshepherd: {
    nomFrancais: 'Berger Allemand',
    groupe: 'Berger',
    taille: 'Grand',
    typeOreilles: ['Dressées'],
    typeQueue: ['En panache'],
    typePoil: ['Mi-long'],
    description:
      "Le Berger Allemand est une race polyvalente utilisée dans la police, l'armée et comme chien de compagnie.",
  },
  dalmatian: {
    nomFrancais: 'Dalmatien',
    groupe: 'Chien courant',
    taille: 'Grand',
    typeOreilles: ['Tombantes'],
    typeQueue: ['Droite'],
    typePoil: ['Court'],
    description:
      'Reconnaissable à sa robe blanche tachetée de noir, le Dalmatien est une race élégante et énergique.',
  },
  dachshund: {
    nomFrancais: 'Teckel',
    groupe: 'Chien courant',
    taille: 'Petit',
    typeOreilles: ['Tombantes', 'Longues'],
    typeQueue: ['Droite'],
    typePoil: ['Court', 'Mi-long', 'Dur'],
    description:
      'Le Teckel, avec sa silhouette allongée caractéristique, est un chasseur intrépide et un compagnon attachant.',
  },
  pomeranian: {
    nomFrancais: 'Spitz Nain (Poméranien)',
    groupe: 'Spitz',
    taille: 'Toy',
    typeOreilles: ['Dressées'],
    typeQueue: ['En panache'],
    typePoil: ['Long'],
    description:
      'Le Spitz Nain est un petit chien vif et curieux, avec une abondante fourrure double et une queue enroulée.',
  },
  shih: {
    nomFrancais: 'Shih Tzu',
    groupe: 'Compagnie',
    taille: 'Petit',
    typeOreilles: ['Tombantes'],
    typeQueue: ['En panache'],
    typePoil: ['Long'],
    description:
      "Le Shih Tzu est un chien de compagnie affectueux avec une longue robe soyeuse. Excellent chien d'appartement.",
  },
  pug: {
    nomFrancais: 'Carlin',
    groupe: 'Compagnie',
    taille: 'Petit',
    typeOreilles: ['Tombantes'],
    typeQueue: ['Enroulée'],
    typePoil: ['Court'],
    description:
      'Le Carlin est connu pour son visage ridé et sa personnalité attachante. Parfait chien de compagnie en appartement.',
  },
  rottweiler: {
    nomFrancais: 'Rottweiler',
    groupe: 'Molosse',
    taille: 'Grand',
    typeOreilles: ['Tombantes'],
    typeQueue: ['Courte'],
    typePoil: ['Court'],
    description:
      'Le Rottweiler est un chien puissant et loyal, utilisé comme chien de garde et de protection.',
  },
  corgi: {
    nomFrancais: 'Corgi Gallois',
    groupe: 'Berger',
    taille: 'Petit',
    typeOreilles: ['Dressées'],
    typeQueue: ['Courte'],
    typePoil: ['Mi-long'],
    description:
      'Le Corgi est un petit chien de troupeau gallois, rendu célèbre par la reine Élisabeth II. Intelligent et affectueux.',
  },
  bordercollie: {
    nomFrancais: 'Border Collie',
    groupe: 'Berger',
    taille: 'Moyen',
    typeOreilles: ['Semi-dressées'],
    typeQueue: ['En panache'],
    typePoil: ['Mi-long'],
    description:
      'Considéré comme le chien le plus intelligent, le Border Collie excelle dans les sports canins et le travail de troupeau.',
  },
  akita: {
    nomFrancais: 'Akita Inu',
    groupe: 'Spitz',
    taille: 'Grand',
    typeOreilles: ['Dressées'],
    typeQueue: ['Enroulée'],
    typePoil: ['Court', 'Mi-long'],
    description:
      "L'Akita est une race japonaise ancienne, symbole de loyauté. Connu grâce à l'histoire d'Hachiko.",
  },
  maltese: {
    nomFrancais: 'Bichon Maltais',
    groupe: 'Compagnie',
    taille: 'Toy',
    typeOreilles: ['Tombantes'],
    typeQueue: ['En panache'],
    typePoil: ['Long'],
    description:
      'Le Bichon Maltais est un petit chien blanc à longue robe soyeuse, affectueux et très attaché à son maître.',
  },
  samoyed: {
    nomFrancais: 'Samoyède',
    groupe: 'Spitz',
    taille: 'Grand',
    typeOreilles: ['Dressées'],
    typeQueue: ['En panache'],
    typePoil: ['Long'],
    description:
      'Le Samoyède est un chien nordique à fourrure blanche immaculée, réputé pour son sourire caractéristique.',
  },
  doberman: {
    nomFrancais: 'Dobermann',
    groupe: 'Molosse',
    taille: 'Grand',
    typeOreilles: ['Dressées'],
    typeQueue: ['Courte'],
    typePoil: ['Court'],
    description:
      'Le Dobermann est un chien de garde élégant et musclé, très intelligent et loyal envers sa famille.',
  },
}

// ── Utilitaires ────────────────────────────────────────────────────────────

/**
 * Convertit un nom de race Dog CEO (ex: "germanshepherd", "golden/retriever")
 * en un nom lisible en français.
 */
function genererNomFrancais(nomAnglais: string): string {
  const enrichi = ENRICHISSEMENT_RACES[nomAnglais]
  if (enrichi) return enrichi.nomFrancais

  // Capitalise chaque mot
  return nomAnglais
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(/[-_/]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/**
 * Récupère les races depuis Dog CEO API
 */
async function fetchDogCeoBreeds(): Promise<string[]> {
  const res = await fetch('https://dog.ceo/api/breeds/list/all')
  if (!res.ok) throw new Error(`Dog CEO API erreur: ${res.status}`)
  const data: DogCeoBreeds = await res.json()
  return Object.keys(data.message)
}

/**
 * Récupère les données enrichies depuis The Dog API (optionnel)
 */
async function fetchTheDogApiBreeds(apiKey: string): Promise<Map<string, DogApiBreed>> {
  const map = new Map<string, DogApiBreed>()
  try {
    const res = await fetch('https://api.thedogapi.com/v1/breeds', {
      headers: { 'x-api-key': apiKey },
    })
    if (!res.ok) return map
    const data: DogApiBreed[] = await res.json()
    for (const breed of data) {
      // Clé normalisée pour correspondance
      const key = breed.name.toLowerCase().replace(/[^a-z]/g, '')
      map.set(key, breed)
    }
  } catch (err) {
    console.warn('⚠️  The Dog API non disponible, enrichissement ignoré:', err)
  }
  return map
}

/**
 * Mappe la taille Dog API vers nos catégories françaises
 */
function mapperTaille(taille?: string): string {
  if (!taille) return 'Moyen'
  const t = taille.toLowerCase()
  if (t.includes('toy') || t.includes('small') && t.includes('toy')) return 'Toy'
  if (t.includes('small')) return 'Petit'
  if (t.includes('medium')) return 'Moyen'
  if (t.includes('large') && !t.includes('very')) return 'Grand'
  if (t.includes('very large') || t.includes('giant')) return 'Géant'
  return 'Moyen'
}

/**
 * Mappe le groupe Dog API vers nos groupes français
 */
function mapperGroupe(groupe?: string): string {
  if (!groupe) return 'Compagnie'
  const g = groupe.toLowerCase()
  if (g.includes('herding') || g.includes('pastoral')) return 'Berger'
  if (g.includes('sporting') || g.includes('retriever') || g.includes('gundog')) return 'Retriever'
  if (g.includes('spitz') || g.includes('primitive') || g.includes('nordic')) return 'Spitz'
  if (g.includes('terrier')) return 'Terrier'
  if (g.includes('hound') || g.includes('scenthound')) return 'Chien courant'
  if (g.includes('working') || g.includes('molosser') || g.includes('pinscher')) return 'Molosse'
  return 'Compagnie'
}

// ── Seed principal ─────────────────────────────────────────────────────────

async function main() {
  console.log('🐕  Démarrage du seed – Quiz Races de Chiens')
  console.log('─'.repeat(50))

  const dogApiKey = process.env.DOG_API_KEY ?? ''
  if (!dogApiKey) {
    console.warn('⚠️  DOG_API_KEY absent – enrichissement The Dog API ignoré')
  }

  // 1. Récupérer les races Dog CEO
  console.log('📡  Récupération des races depuis Dog CEO API…')
  const races = await fetchDogCeoBreeds()
  console.log(`✅  ${races.length} races trouvées`)

  // 2. Récupérer l'enrichissement The Dog API (optionnel)
  let theDogApiData = new Map<string, DogApiBreed>()
  if (dogApiKey) {
    console.log('📡  Récupération des données depuis The Dog API…')
    theDogApiData = await fetchTheDogApiBreeds(dogApiKey)
    console.log(`✅  ${theDogApiData.size} races enrichies`)
  }

  // 3. Upsert de chaque race
  let inserted = 0
  let updated = 0

  for (const raceName of races) {
    const enrichi = ENRICHISSEMENT_RACES[raceName]
    const theDogData = theDogApiData.get(raceName.toLowerCase().replace(/[^a-z]/g, ''))

    // Description : priorité enrichissement manuel > The Dog API > vide
    const description =
      enrichi?.description ??
      theDogData?.description ??
      `Race de chien : ${genererNomFrancais(raceName)}`

    const raceData = {
      nomFrancais: enrichi?.nomFrancais ?? genererNomFrancais(raceName),
      groupe:
        enrichi?.groupe ??
        (theDogData ? mapperGroupe(theDogData.breed_group) : 'Compagnie'),
      taille:
        enrichi?.taille ??
        (theDogData ? mapperTaille(theDogData.size) : 'Moyen'),
      description,
      typeOreilles: enrichi?.typeOreilles ?? ['Tombantes'],
      typeQueue: enrichi?.typeQueue ?? ['Droite'],
      typePoil: enrichi?.typePoil ?? ['Court'],
      dogApiId: theDogData?.id ?? null,
    }

    const existing = await prisma.race.findUnique({ where: { name: raceName } })
    if (existing) {
      await prisma.race.update({ where: { name: raceName }, data: raceData })
      updated++
    } else {
      await prisma.race.create({ data: { name: raceName, ...raceData } })
      inserted++
    }
  }

  console.log(`\n✅  Seed terminé :`)
  console.log(`   • ${inserted} races insérées`)
  console.log(`   • ${updated} races mises à jour`)
  console.log('─'.repeat(50))
}

main()
  .catch((err) => {
    console.error('❌ Erreur lors du seed:', err)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
