import Link from 'next/link'

/**
 * Page d'accueil – /
 * Présente les deux phases de l'application.
 */

export default function PageAccueil() {
  return (
    <div className="space-y-10">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="text-center pt-8 pb-2 space-y-4 animate-fade-in">
        <div className="text-7xl">🐾</div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-slate-50 leading-tight">
          Quiz des{' '}
          <span className="text-brand-500">Races</span>
          {' '}de Chiens
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Construisez et enrichissez la base de données des races, puis testez
          vos connaissances sur leurs attributs morphologiques.
        </p>
      </section>

      {/* ── Deux phases ───────────────────────────────────────────────── */}
      <section className="space-y-4 animate-slide-up">
        <h2 className="text-center text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Comment ça marche — 2 phases
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          {/* Phase 1 : Enrichissement */}
          <Link
            href="/enrichir"
            className="
              group relative
              bg-white dark:bg-slate-800
              border-2 border-amber-200 dark:border-amber-800
              rounded-2xl p-6 space-y-4
              shadow-sm hover:shadow-md
              transition-all duration-200 hover:-translate-y-0.5
              focus:outline-none focus:ring-4 focus:ring-amber-300
            "
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">✏️</div>
              <span className="bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-xs font-bold px-2.5 py-1 rounded-full">
                Phase 1
              </span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
                Enrichir la base
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                On vous montre la photo et le nom d&apos;une race. Vous renseignez
                ses attributs (oreilles, queue, poil, taille, groupe).
                Recommencez jusqu&apos;à avoir enrichi toutes les races.
              </p>
            </div>
            <ul className="space-y-1.5 text-sm">
              {[
                '📸 Photo de la race affichée',
                '✅ Multi-sélection des attributs',
                '📊 Progression en temps réel',
                '↩️ Possibilité de passer et revenir',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-1">
              <span className="
                inline-flex items-center gap-1.5
                text-amber-600 dark:text-amber-400 font-semibold text-sm
                group-hover:gap-3 transition-all
              ">
                Commencer l&apos;enrichissement →
              </span>
            </div>
          </Link>

          {/* Phase 2 : Quiz */}
          <Link
            href="/quiz"
            className="
              group relative
              bg-white dark:bg-slate-800
              border-2 border-brand-200 dark:border-brand-800
              rounded-2xl p-6 space-y-4
              shadow-sm hover:shadow-md
              transition-all duration-200 hover:-translate-y-0.5
              focus:outline-none focus:ring-4 focus:ring-brand-300
            "
          >
            <div className="flex items-start justify-between">
              <div className="text-4xl">🎮</div>
              <span className="bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 text-xs font-bold px-2.5 py-1 rounded-full">
                Phase 2
              </span>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 group-hover:text-brand-600 dark:group-hover:text-brand-300 transition-colors">
                Jouer au Quiz
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Une photo s&apos;affiche. Identifiez la race et sélectionnez ses
                attributs. Gagnez jusqu&apos;à 10 points par question.
                Battez votre record !
              </p>
            </div>
            <ul className="space-y-1.5 text-sm">
              {[
                '🐕 Race à identifier depuis une photo',
                '💡 Indice : groupe cynologique',
                '🏆 5 pts race + 1 pt par attribut',
                '📊 Statistiques et progression',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  {item}
                </li>
              ))}
            </ul>
            <div className="pt-1">
              <span className="
                inline-flex items-center gap-1.5
                text-brand-600 dark:text-brand-400 font-semibold text-sm
                group-hover:gap-3 transition-all
              ">
                Lancer le quiz →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Barème ────────────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl p-5 space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Barème du quiz
        </h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[
            { emoji: '🎯', label: 'Race identifiée',  pts: '5 pts', couleur: 'text-brand-600 dark:text-brand-400' },
            { emoji: '👂', label: 'Oreilles',          pts: '1 pt',  couleur: 'text-emerald-600 dark:text-emerald-400' },
            { emoji: '🐕', label: 'Queue',             pts: '1 pt',  couleur: 'text-emerald-600 dark:text-emerald-400' },
            { emoji: '✂️', label: 'Type de poil',      pts: '1 pt',  couleur: 'text-emerald-600 dark:text-emerald-400' },
            { emoji: '📏', label: 'Taille',            pts: '1 pt',  couleur: 'text-emerald-600 dark:text-emerald-400' },
            { emoji: '🏷️', label: 'Groupe',            pts: '1 pt',  couleur: 'text-emerald-600 dark:text-emerald-400' },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-xl px-3 py-2"
            >
              <span className="text-sm text-slate-600 dark:text-slate-300">
                {item.emoji} {item.label}
              </span>
              <span className={`font-bold text-sm ${item.couleur}`}>{item.pts}</span>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 dark:text-slate-500">
          Score maximum : <strong className="text-brand-600 dark:text-brand-400">10 pts</strong> par question
        </p>
      </section>

      {/* ── Conseil ───────────────────────────────────────────────────── */}
      <div className="
        bg-amber-50 dark:bg-amber-900/20
        border border-amber-200 dark:border-amber-800
        rounded-2xl p-4 flex gap-3 items-start
      ">
        <span className="text-2xl flex-shrink-0">💡</span>
        <div className="space-y-1">
          <p className="font-semibold text-amber-800 dark:text-amber-200 text-sm">
            Commencez par enrichir la base
          </p>
          <p className="text-amber-700 dark:text-amber-300 text-sm leading-relaxed">
            Plus la base est enrichie, plus le quiz est précis et intéressant.
            Commencez par la phase 1 pour renseigner les attributs des races,
            puis lancez la phase 2 pour vous tester.
          </p>
        </div>
      </div>
    </div>
  )
}
