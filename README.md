# 🐾 Quiz Races de Chiens

Application web interactive pour tester vos connaissances sur les races de chiens à partir de photos et d'attributs morphologiques.

**Stack** : Next.js 14 · TypeScript · Tailwind CSS · Supabase (PostgreSQL) · Vercel

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
| Supabase | Base de données PostgreSQL + API REST (connexion HTTPS, compatible Vercel) |
| Dog CEO API | Photos des chiens (gratuit, sans clé) |
| The Dog API | Enrichissement des fiches races (clé gratuite) |

---

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** ≥ 18.17
- Un projet **Supabase** (gratuit sur [supabase.com](https://supabase.com))
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

Éditez `.env.local` avec l’URL du projet Supabase et la clé **service_role** (Settings → API dans le dashboard Supabase) :

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ..."

# Optionnel – pour les descriptions de races
DOG_API_KEY="votre-cle-api"
```

> **The Dog API** : Compte gratuit sur [thedogapi.com](https://thedogapi.com/). L’app fonctionne sans cette clé (descriptions génériques).

### 4. Créer les tables dans Supabase

Dans le **SQL Editor** de votre projet Supabase, exécutez le script de création des tables. Le fichier se trouve dans `prisma/migrations/20260223165020_init/migration.sql` (ou voir section Dépannage).

### 5. Peupler la base (seed)

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
3. Configurez les variables d'environnement dans Vercel → Settings → Environment Variables :
   - `NEXT_PUBLIC_SUPABASE_URL` (URL du projet Supabase)
   - `SUPABASE_SERVICE_ROLE_KEY` (clé service_role, dans Supabase → Settings → API)
   - `DOG_API_KEY` (optionnel)
4. Déployez. Aucun pooler ni connexion PostgreSQL directe : le client Supabase utilise l’API HTTPS.

### Option B : Via Vercel CLI

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel

# Ou en production
vercel --prod
```

### Post-déploiement

```bash
# Si les tables n’existent pas encore en production : exécuter le SQL dans Supabase (voir section Installation).
# Puis lancer le seed si besoin :
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

npm run db:seed          # Peupler la base avec les races (Supabase)
```

---

## 🏗️ Décisions d'architecture

| Décision | Raison |
|---|---|
| **App Router Next.js 14** | Composants serveur, meilleur SSR, layout natif |
| **Client Supabase (service_role)** | Accès API REST HTTPS, compatible Vercel sans pooler |
| **Cache en mémoire (lib/)** | Limite les appels API externes sans Redis |
| **`force-dynamic` sur les routes** | Les questions sont aléatoires, pas de mise en cache CDN |
| **Enrichissement statique (seed)** | Les attributs morphologiques ne changent pas → seed plutôt qu'API en temps réel |
| **Autocomplete côté client** | UX meilleure pour la saisie de la race |
| **Score calculé côté serveur** | Prévient la triche côté client |
| **Supabase plutôt que Prisma + PostgreSQL direct** | Connexion HTTPS, pas de souci de pooler sur Vercel |

---

## 🐛 Dépannage

**Erreur "Aucune race en base de données"**
→ Lancez `npm run db:seed`

**Erreur de connexion à la base**
→ Vérifiez `NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans `.env.local`

**Les images ne chargent pas**
→ Vérifiez que `images.dog.ceo` est autorisé dans `next.config.ts`

**Erreur "relation races does not exist"**
→ Exécutez le script SQL dans `prisma/migrations/20260223165020_init/migration.sql` dans le SQL Editor de Supabase.

---

## 📄 Licence

MIT – Libre d'utilisation et de modification.
