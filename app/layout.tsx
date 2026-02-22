import type { Metadata } from 'next'
import './globals.css'
import Navigation from '@/components/Navigation'

export const metadata: Metadata = {
  title:       'Quiz Races de Chiens',
  description: "Testez vos connaissances sur les races de chiens à partir de photos et d'attributs morphologiques.",
  keywords:    ['quiz', 'chiens', 'races', 'canin', 'jeu', 'connaissance'],
  authors:     [{ name: 'Quiz Races de Chiens' }],
  openGraph: {
    title:       'Quiz Races de Chiens',
    description: 'Testez vos connaissances sur les races de chiens !',
    type:        'website',
    locale:      'fr_FR',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100">
        <Navigation />
        <main className="max-w-2xl mx-auto px-4 py-6 pb-16">
          {children}
        </main>
      </body>
    </html>
  )
}
