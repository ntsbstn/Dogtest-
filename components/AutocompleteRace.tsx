'use client'

/**
 * Composant d'autocomplétion pour la sélection de la race.
 * Effectue une recherche dynamique dans les races disponibles.
 */

import { useState, useEffect, useRef, useCallback } from 'react'

interface RaceOption {
  id:          string
  name:        string
  nomFrancais: string
}

interface AutocompleteRaceProps {
  valeur:           string
  surChangement:    (valeur: string) => void
  placeholder?:     string
  desactive?:       boolean
}

export default function AutocompleteRace({
  valeur,
  surChangement,
  placeholder = 'Rechercher une race…',
  desactive = false,
}: AutocompleteRaceProps) {
  const [suggestions, setSuggestions]     = useState<RaceOption[]>([])
  const [ouvert, setOuvert]               = useState(false)
  const [chargement, setChargement]       = useState(false)
  const [texteRecherche, setTexteRecherche] = useState(valeur)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const inputRef    = useRef<HTMLInputElement>(null)
  const listeRef    = useRef<HTMLUListElement>(null)

  // Synchroniser le texte avec la valeur externe (ex: reset)
  useEffect(() => {
    setTexteRecherche(valeur)
  }, [valeur])

  const rechercherRaces = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setOuvert(false)
      return
    }

    setChargement(true)
    try {
      const res = await fetch(`/api/races?q=${encodeURIComponent(query)}`)
      if (!res.ok) throw new Error('Erreur réseau')
      const data = await res.json()
      setSuggestions(data.races ?? [])
      setOuvert(true)
    } catch {
      setSuggestions([])
    } finally {
      setChargement(false)
    }
  }, [])

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setTexteRecherche(val)
    surChangement(val) // mise à jour immédiate du parent

    // Debounce la recherche API
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => rechercherRaces(val), 300)
  }

  const selectionnerRace = (race: RaceOption) => {
    setTexteRecherche(race.nomFrancais)
    surChangement(race.name) // on envoie le nom technique au parent
    setSuggestions([])
    setOuvert(false)
    inputRef.current?.blur()
  }

  // Fermer la liste au clic extérieur
  useEffect(() => {
    const fermer = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        listeRef.current &&
        !listeRef.current.contains(e.target as Node)
      ) {
        setOuvert(false)
      }
    }
    document.addEventListener('mousedown', fermer)
    return () => document.removeEventListener('mousedown', fermer)
  }, [])

  // Navigation clavier
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOuvert(false)
    }
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={texteRecherche}
          onChange={handleInput}
          onFocus={() => texteRecherche.length >= 2 && setOuvert(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={desactive}
          autoComplete="off"
          aria-autocomplete="list"
          aria-haspopup="listbox"
          className="
            w-full px-4 py-3 pr-10
            bg-white dark:bg-slate-800
            border-2 border-slate-200 dark:border-slate-600
            rounded-xl
            text-slate-800 dark:text-slate-200
            placeholder-slate-400 dark:placeholder-slate-500
            focus:outline-none focus:border-brand-400 dark:focus:border-brand-500
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        />

        {/* Icône loupe / spinner */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
          {chargement ? (
            <span className="w-5 h-5 border-2 border-slate-300 border-t-brand-500 rounded-full animate-spin block" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          )}
        </div>
      </div>

      {/* Liste de suggestions */}
      {ouvert && suggestions.length > 0 && (
        <ul
          ref={listeRef}
          role="listbox"
          className="
            absolute z-50 w-full mt-1
            bg-white dark:bg-slate-800
            border border-slate-200 dark:border-slate-600
            rounded-xl shadow-xl
            max-h-56 overflow-y-auto
            animate-fade-in
          "
        >
          {suggestions.map((race) => (
            <li
              key={race.id}
              role="option"
              aria-selected={valeur === race.name}
              onClick={() => selectionnerRace(race)}
              className="
                px-4 py-3
                cursor-pointer
                flex items-center justify-between
                hover:bg-brand-50 dark:hover:bg-brand-900/20
                transition-colors duration-150
                first:rounded-t-xl last:rounded-b-xl
              "
            >
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {race.nomFrancais}
              </span>
              <span className="text-xs text-slate-400 dark:text-slate-500 italic">
                {race.name}
              </span>
            </li>
          ))}
        </ul>
      )}

      {/* Aucun résultat */}
      {ouvert && !chargement && suggestions.length === 0 && texteRecherche.length >= 2 && (
        <div className="
          absolute z-50 w-full mt-1
          bg-white dark:bg-slate-800
          border border-slate-200 dark:border-slate-600
          rounded-xl shadow-xl
          px-4 py-3
          text-slate-400 dark:text-slate-500 text-sm italic
        ">
          Aucune race trouvée pour « {texteRecherche} »
        </div>
      )}
    </div>
  )
}
