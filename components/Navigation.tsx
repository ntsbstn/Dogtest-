'use client'

/**
 * Barre de navigation principale
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LIENS = [
  { href: '/',      label: 'Accueil',     icone: '🏠' },
  { href: '/quiz',  label: 'Quiz',        icone: '🐕' },
  { href: '/stats', label: 'Statistiques', icone: '📊' },
]

export default function Navigation() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
      <nav className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-lg text-slate-800 dark:text-slate-100 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        >
          <span className="text-2xl">🐾</span>
          <span className="hidden sm:inline">Quiz Races</span>
        </Link>

        {/* Liens */}
        <div className="flex items-center gap-1">
          {LIENS.map((lien) => {
            const estActif = pathname === lien.href
            return (
              <Link
                key={lien.href}
                href={lien.href}
                className={`
                  flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                  transition-colors duration-150
                  ${estActif
                    ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }
                `}
              >
                <span className="text-base">{lien.icone}</span>
                <span className="hidden sm:inline">{lien.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </header>
  )
}
