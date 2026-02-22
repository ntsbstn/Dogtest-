import Link from 'next/link'
import Image from 'next/image'

/**
 * Page d'accueil – /
 * Présente l'application et invite l'utilisateur à commencer le quiz.
 */

const FONCTIONNALITES = [
  {
    icone:       '📸',
    titre:       'Quiz par photo',
    description: 'Identifiez la race d\'un chien à partir de sa photo.',
  },
  {
    icone:       '🧬',
    titre:       'Attributs morphologiques',
    description: 'Testez vos connaissances sur les oreilles, la queue, le poil et plus encore.',
  },
  {
    icone:       '🏆',
    titre:       'Scoring précis',
    description: 'Gagnez jusqu\'à 10 points par question. Battez votre record !',
  },
  {
    icone:       '📊',
    titre:       'Statistiques',
    description: 'Suivez votre progression et vos performances au fil du temps.',
  },
]

const RACES_EXEMPLES = [
  'Labrador',
  'Berger Allemand',
  'Golden Retriever',
  'Husky',
  'Bouledogue',
  'Caniche',
  'Beagle',
  'Chihuahua',
]

export default function PageAccueil() {
  return (
    <div className="space-y-12">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="text-center pt-8 pb-4 space-y-6 animate-fade-in">
        <div className="text-7xl mb-2">🐾</div>

        <div className="space-y-3">
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-50 leading-tight">
            Quiz des{' '}
            <span className="text-brand-500">Races</span>
            <br />
            de Chiens
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            Testez vos connaissances sur les races de chiens à partir de photos
            et d&apos;attributs morphologiques. Serez-vous un expert canin ?
          </p>
        </div>

        {/* Bouton CTA principal */}
        <Link
          href="/quiz"
          className="
            inline-flex items-center gap-3
            bg-brand-500 hover:bg-brand-600 active:bg-brand-700
            text-white font-bold text-lg
            px-8 py-4 rounded-2xl
            shadow-lg hover:shadow-xl
            transition-all duration-200
            hover:-translate-y-0.5
            focus:outline-none focus:ring-4 focus:ring-brand-300
          "
        >
          <span>🎮</span>
          Commencer le quiz
        </Link>

        <p className="text-sm text-slate-400 dark:text-slate-500">
          Gratuit · Sans inscription · 10 points max par question
        </p>
      </section>

      {/* ── Races disponibles (visuel) ───────────────────────────────── */}
      <section className="animate-slide-up">
        <div className="flex flex-wrap justify-center gap-2">
          {RACES_EXEMPLES.map((race) => (
            <span
              key={race}
              className="
                px-3 py-1.5 rounded-full text-sm font-medium
                bg-white dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-600 dark:text-slate-300
                shadow-sm
              "
            >
              🐕 {race}
            </span>
          ))}
          <span className="px-3 py-1.5 rounded-full text-sm font-medium text-brand-500 dark:text-brand-400">
            + plus de 100 races…
          </span>
        </div>
      </section>

      {/* ── Fonctionnalités ──────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Comment ça marche
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {FONCTIONNALITES.map((f, i) => (
            <div
              key={f.titre}
              className="
                bg-white dark:bg-slate-800
                border border-slate-100 dark:border-slate-700
                rounded-2xl p-5 space-y-2
                shadow-sm
                animate-slide-up
              "
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="text-3xl">{f.icone}</div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                {f.titre}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Barème ───────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-6 space-y-4">
        <h2 className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Barème de points
        </h2>
        <div className="space-y-2">
          {[
            { label: 'Race correctement identifiée', points: '5 pts', couleur: 'text-brand-600 dark:text-brand-400' },
            { label: 'Oreilles correctes',           points: '1 pt',  couleur: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Type de queue correct',        points: '1 pt',  couleur: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Type de poil correct',         points: '1 pt',  couleur: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Taille correcte',              points: '1 pt',  couleur: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Groupe correct',               points: '1 pt',  couleur: 'text-emerald-600 dark:text-emerald-400' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-700/50 last:border-0"
            >
              <span className="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
              <span className={`font-bold text-sm ${item.couleur}`}>{item.points}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 mt-1">
            <span className="font-bold text-slate-700 dark:text-slate-200">Score maximum</span>
            <span className="font-black text-lg text-brand-600 dark:text-brand-400">10 pts</span>
          </div>
        </div>
      </section>

      {/* ── CTA bas de page ──────────────────────────────────────────── */}
      <div className="text-center pb-4">
        <Link
          href="/quiz"
          className="
            inline-flex items-center gap-2
            text-brand-600 dark:text-brand-400 font-semibold
            hover:text-brand-700 dark:hover:text-brand-300
            transition-colors
          "
        >
          Prêt à relever le défi ? →
        </Link>
      </div>
    </div>
  )
}
