/**
 * Composant bouton réutilisable avec variantes de style
 */

import { ButtonHTMLAttributes, ReactNode } from 'react'

interface BoutonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primaire' | 'secondaire' | 'danger' | 'fantome'
  taille?: 'petit' | 'moyen' | 'grand'
  chargement?: boolean
  children: ReactNode
}

const VARIANTES = {
  primaire:
    'bg-brand-500 hover:bg-brand-600 active:bg-brand-700 text-white shadow-md hover:shadow-lg',
  secondaire:
    'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200',
  danger:
    'bg-red-500 hover:bg-red-600 active:bg-red-700 text-white shadow-md',
  fantome:
    'border-2 border-brand-400 hover:bg-brand-50 active:bg-brand-100 text-brand-600 dark:hover:bg-brand-900/20 dark:text-brand-400',
}

const TAILLES = {
  petit: 'px-3 py-1.5 text-sm rounded-lg',
  moyen: 'px-5 py-2.5 text-base rounded-xl',
  grand: 'px-7 py-3.5 text-lg rounded-2xl',
}

export default function Bouton({
  variante = 'primaire',
  taille = 'moyen',
  chargement = false,
  children,
  className = '',
  disabled,
  ...props
}: BoutonProps) {
  const estDesactive = disabled || chargement

  return (
    <button
      {...props}
      disabled={estDesactive}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${VARIANTES[variante]}
        ${TAILLES[taille]}
        ${className}
      `}
    >
      {chargement && (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  )
}
