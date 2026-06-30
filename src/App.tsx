import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { HomeScreen } from './components/HomeScreen'
import { LoadingScreen } from './components/LoadingScreen'
import { SwipeArena } from './components/SwipeArena'
import { WinnerScreen } from './components/WinnerScreen'
import { fetchWatchlist } from './services/letterboxd'
import { enrichMovies } from './services/tmdb'
import { useTournament } from './hooks/useTournament'
import type { MatchSize } from './types'
import type { RawFilm } from './services/letterboxd'

type Screen = 'home' | 'loading' | 'bracket' | 'winner'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function dedupe(films: RawFilm[]): RawFilm[] {
  const seen = new Set<string>()
  return films.filter((f) => {
    if (seen.has(f.slug)) return false
    seen.add(f.slug)
    return true
  })
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('home')
  const [loadingState, setLoadingState] = useState({ username: '', page: 0, total: 0 })
  const [error, setError] = useState<string | null>(null)
  const [allRawFilms, setAllRawFilms] = useState<RawFilm[]>([])
  const [savedSize, setSavedSize] = useState<MatchSize>(8)

  const { state, start, pick, reset, currentMatchup, totalMatchups, completedMatchups, roundLabel } = useTournament()

  const handleStart = useCallback(async (username: string, size: MatchSize) => {
    setSavedSize(size)
    setError(null)
    setScreen('loading')
    setLoadingState({ username, page: 0, total: 0 })

    try {
      const rawFilms = await fetchWatchlist(username, (page, total) => {
        setLoadingState({ username, page, total })
      })

      const deduped = dedupe(rawFilms)

      if (deduped.length < 2) {
        throw new Error('Not enough films in this watchlist to play.')
      }

      setAllRawFilms(deduped)

      const pool = shuffle(deduped).slice(0, size)
      const movies = await enrichMovies(pool)

      start(movies, size)
      setScreen('bracket')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setScreen('home')
    }
  }, [start])

  const handlePick = useCallback((side: 'a' | 'b') => {
    if (!currentMatchup) return
    pick(side === 'a' ? currentMatchup.a : currentMatchup.b)
  }, [currentMatchup, pick])

  const champion = state?.champion ?? null

  useEffect(() => {
    if (champion && screen === 'bracket') setScreen('winner')
  }, [champion, screen])

  const handlePlayAgain = useCallback(async () => {
    reset()
    setScreen('loading')
    setLoadingState({ username: '', page: 0, total: 0 })
    const pool = shuffle(allRawFilms).slice(0, savedSize)
    const movies = await enrichMovies(pool)
    start(movies, savedSize)
    setScreen('bracket')
  }, [reset, start, allRawFilms, savedSize])

  const handleHome = useCallback(() => {
    reset()
    setScreen('home')
  }, [reset])

  const matchupKey = state
    ? `r${state.currentRound}-m${state.currentMatchup}`
    : 'idle'

  return (
    <div className="font-sans antialiased">
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 bg-red-900/90 border border-red-700 text-red-200 rounded-xl px-4 py-3 text-sm">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-white">✕</button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {screen === 'home' && (
          <HomeScreen key="home" onStart={handleStart} />
        )}

        {screen === 'loading' && (
          <LoadingScreen
            key="loading"
            username={loadingState.username}
            page={loadingState.page}
            total={loadingState.total}
          />
        )}

        {screen === 'bracket' && currentMatchup && (
          <SwipeArena
            key="bracket"
            matchup={currentMatchup}
            matchupKey={matchupKey}
            roundLabel={roundLabel}
            completedMatchups={completedMatchups}
            totalMatchups={totalMatchups}
            onPick={handlePick}
            onBack={handleHome}
          />
        )}

        {screen === 'winner' && champion && (
          <WinnerScreen
            key="winner"
            winner={champion}
            onPlayAgain={handlePlayAgain}
            onHome={handleHome}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
