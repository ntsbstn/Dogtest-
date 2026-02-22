# 🐾 Quiz Races de Chiens

Application web interactive pour tester vos connaissances sur les races de chiens à partir de photos et d'attributs morphologiques.

**Stack** : Next.js 14 · TypeScript · Tailwind CSS · PostgreSQL · Prisma · Vercel

---

## ✨ Fonctionnalités

- 📸 **Quiz photo** – Identifiez la race d'un chien depuis une photo
- 🧬 **Attributs morphologiques** – Oreilles, queue, type de poil, taille, groupe cynologique
- 🏆 **Scoring précis** – 5 pts pour la race + 1 pt par attribut correct (max 10 pts)
- 💡 **Indice** – Révèle le groupe cynologique en cas de doute
- ❓ **Je ne sais pas** – Abandonnez une question sans pénalité
- 📊 **Statistiques** – Score moyen, meilleur score, taux de réussite, niveaux de progression
- 🌙 **Dark mode** – Thème sombre complet
- 📱 **Mobile-first** – Interface responsive adaptée à tous les écrans

---

## 🛠️ Stack Technique

| Technologie | Usage |
|---|---|
| Next.js 14 (App Router) | Framework React avec SSR/SSG |
| TypeScript strict | Typage complet |
| Tailwind CSS | Styles utilitaires |
| Prisma ORM | Gestion base de données |
| PostgreSQL | Base de données persistante |
| Dog CEO API | Photos des chiens (gratuit, sans clé) |
| The Dog API | Enrichissement des fiches races (clé gratuite) |

---

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** ≥ 18.17
- **PostgreSQL** ≥ 14 (local ou hébergé)
- **npm** ≥ 9

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd quiz-races-de-chiens
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env.local
```

Éditez `.env.local` :

```env
# URL de connexion PostgreSQL (obligatoire)
DATABASE_URL="postgresql://postgres:motdepasse@localhost:5432/quiz_chiens"

# Clé API The Dog API (optionnel – pour les descriptions de races)
DOG_API_KEY="votre-cle-api"
```

> **The Dog API** : Créez un compte gratuit sur [thedogapi.com](https://thedogapi.com/) pour obtenir votre clé. L'application fonctionne sans cette clé (les descriptions de races seront génériques).

### 4. Créer la base de données et appliquer les migrations

```bash
# Créer la base de données et appliquer le schéma Prisma
npx prisma migrate dev --name init

# Générer le client Prisma
npx prisma generate
```

### 5. Peupler la base de données (seed)

```bash
# Importe toutes les races depuis Dog CEO API
npm run db:seed
```

> Le seed récupère automatiquement la liste des races depuis [dog.ceo/api](https://dog.ceo/api) et insère les données enrichies (20 races principales avec attributs détaillés, les autres avec valeurs génériques).

### 6. Lancer le serveur de développement

```bash
npm run dev
```

L'application est disponible sur [http://localhost:3000](http://localhost:3000)

---

## 📁 Structure du projet

```
quiz-races-de-chiens/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Layout racine (navigation, métadonnées)
│   ├── page.tsx                # Page d'accueil /
│   ├── globals.css             # Styles globaux Tailwind
│   ├── quiz/
│   │   └── page.tsx            # Page Quiz /quiz
│   ├── stats/
│   │   └── page.tsx            # Page Statistiques /stats
│   └── api/
│       ├── races/route.ts      # GET /api/races (liste + autocomplete)
│       ├── quiz/
│       │   ├── question/route.ts   # GET /api/quiz/question
│       │   └── evaluer/route.ts    # POST /api/quiz/evaluer
│       └── stats/route.ts      # GET /api/stats
├── components/                 # Composants React réutilisables
│   ├── Navigation.tsx          # Barre de navigation
│   ├── Bouton.tsx              # Bouton avec variantes
│   ├── Chargement.tsx          # Spinner de chargement
│   ├── CarteScore.tsx          # Affichage score session
│   ├── CarteResultat.tsx       # Résultat détaillé après réponse
│   ├── AutocompleteRace.tsx    # Champ de recherche de race
│   └── SelecteurAttribut.tsx  # Sélection d'attribut (boutons radio)
├── lib/                        # Bibliothèques et utilitaires
│   ├── prisma.ts               # Client Prisma singleton
│   ├── dogCeoApi.ts            # Couche d'accès Dog CEO API
│   ├── theDogApi.ts            # Couche d'accès The Dog API
│   └── scoring.ts              # Logique de calcul du score
├── types/
│   └── index.ts                # Types TypeScript partagés
├── prisma/
│   ├── schema.prisma           # Schéma base de données
│   └── seed.ts                 # Script de population initiale
├── .env.example                # Exemple de configuration
├── next.config.ts              # Configuration Next.js
├── tailwind.config.ts          # Configuration Tailwind CSS
└── tsconfig.json               # Configuration TypeScript strict
```

---

## 🗄️ Schéma de base de données

```prisma
model Race {
  id           String     @id @default(cuid())
  name         String     @unique          // Nom technique (Dog CEO API)
  nomFrancais  String                      // Nom affiché à l'utilisateur
  groupe       String?                     // Groupe cynologique
  taille       String?                     // Toy / Petit / Moyen / Grand / Géant
  description  String?                     // Description de la race
  typeOreilles String[]                    // Dressées / Tombantes / etc.
  typeQueue    String[]                    // Droite / Enroulée / etc.
  typePoil     String[]                    // Court / Mi-long / etc.
  dogApiId     Int?                        // ID The Dog API (pour enrichissement)
}

model Question {
  id         String  @id @default(cuid())
  raceName   String
  imageUrl   String                        // URL Dog CEO API
  difficulte Int     @default(1)
}

model Tentative {
  id                    String   @id @default(cuid())
  questionId            String
  raceSelectionnee      String
  attributsSelectionnes Json     // { oreilles, queue, poil, taille, groupe }
  score                 Int      @default(0)
  abandonnee            Boolean  @default(false)
  createdAt             DateTime @default(now())
}
```

---

## 🎯 Barème de scoring

| Élément | Points |
|---|---|
| Race correctement identifiée | **5 pts** |
| Oreilles correctes | 1 pt |
| Type de queue correct | 1 pt |
| Type de poil correct | 1 pt |
| Taille correcte | 1 pt |
| Groupe correct | 1 pt |
| **Score maximum** | **10 pts** |

> Le **taux de réussite** est calculé sur les questions où la race a été correctement identifiée (score ≥ 5).

---

## 🌐 Déploiement sur Vercel

### Option A : Via l'interface Vercel (recommandé)

1. Pushez votre code sur GitHub/GitLab
2. Connectez votre dépôt sur [vercel.com](https://vercel.com)
3. Configurez les variables d'environnement dans Vercel Dashboard → Settings → Environment Variables :
   - `DATABASE_URL` (PostgreSQL – utilisez [Neon](https://neon.tech), [Supabase](https://supabase.com) ou [PlanetScale](https://planetscale.com))
   - `DOG_API_KEY` (optionnel)
4. Déployez !

### Option B : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Ou en production
vercel --prod
```

### Configuration recommandée pour Vercel + Neon (PostgreSQL serverless)

```env
DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true"
DIRECT_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"
```

Ajoutez dans `schema.prisma` :
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // Pour les migrations Prisma
}
```

### Post-déploiement

```bash
# Appliquer les migrations en production
npx prisma migrate deploy

# Lancer le seed
npm run db:seed
```

---

## 🔌 APIs utilisées

### Dog CEO API (gratuit, sans clé)

- **Base URL** : `https://dog.ceo/api`
- **Liste des races** : `GET /breeds/list/all`
- **Image aléatoire** : `GET /breed/{race}/images/random`
- **Limites** : Aucune limite documentée, respectez les bonnes pratiques
- **Documentation** : [dog.ceo/dog-api](https://dog.ceo/dog-api/documentation)

### The Dog API (clé gratuite requise)

- **Base URL** : `https://api.thedogapi.com/v1`
- **Liste des races** : `GET /breeds`
- **Recherche** : `GET /breeds/search?q={nom}`
- **Limite gratuit** : 10 000 requêtes/mois
- **Inscription** : [thedogapi.com](https://thedogapi.com/)

---

## ⚙️ Scripts disponibles

```bash
npm run dev           # Serveur de développement (localhost:3000)
npm run build         # Build de production
npm run start         # Démarrer en production
npm run lint          # Vérification ESLint

npm run prisma:generate  # Générer le client Prisma
npm run prisma:migrate   # Créer et appliquer une migration
npm run prisma:studio    # Interface graphique de la base de données

npm run db:seed          # Peupler la base avec les races
```

---

## 🏗️ Décisions d'architecture

| Décision | Raison |
|---|---|
| **App Router Next.js 14** | Composants serveur, meilleur SSR, layout natif |
| **Client Prisma singleton** | Évite les connexions multiples en dev avec HMR |
| **Cache en mémoire (lib/)** | Limite les appels API externes sans Redis |
| **`force-dynamic` sur les routes** | Les questions sont aléatoires, pas de mise en cache CDN |
| **Enrichissement statique (seed)** | Les attributs morphologiques ne changent pas → seed plutôt qu'API en temps réel |
| **Autocomplete côté client** | UX meilleure pour la saisie de la race |
| **Score calculé côté serveur** | Prévient la triche côté client |
| **PostgreSQL plutôt que SQLite** | Compatibilité Vercel/Neon, scalabilité |

---

## 🐛 Dépannage

**Erreur "Aucune race en base de données"**
→ Lancez `npm run db:seed`

**Erreur de connexion à la base**
→ Vérifiez `DATABASE_URL` dans `.env.local`

**Les images ne chargent pas**
→ Vérifiez que `images.dog.ceo` est autorisé dans `next.config.ts`

**Prisma : erreur "The table 'races' does not exist"**
→ Lancez `npx prisma migrate dev --name init`

---

## 📄 Licence

MIT – Libre d'utilisation et de modification.
