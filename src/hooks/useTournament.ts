import { useState, useCallback } from 'react'
import type { Movie, Matchup, TournamentState, MatchSize } from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function buildRounds(movies: Movie[]): Matchup[][] {
  const firstRound: Matchup[] = []
  for (let i = 0; i < movies.length; i += 2) {
    firstRound.push({ a: movies[i], b: movies[i + 1] })
  }
  return [firstRound]
}

export function useTournament() {
  const [state, setState] = useState<TournamentState | null>(null)

  const start = useCallback((allMovies: Movie[], size: MatchSize) => {
    // Deduplicate by id before shuffling
    const unique = allMovies.filter((m, i, arr) => arr.findIndex((x) => x.id === m.id) === i)
    const pool = shuffle(unique).slice(0, Math.min(size, unique.length))
    const rounds = buildRounds(pool)
    setState({
      movies: pool,
      rounds,
      currentRound: 0,
      currentMatchup: 0,
      winners: [],
      champion: null,
    })
  }, [])

  const pick = useCallback((winner: Movie) => {
    setState((prev) => {
      if (!prev) return prev

      const { rounds, currentRound, currentMatchup, winners } = prev
      const roundMatchups = rounds[currentRound]
      const newWinners = [...winners, winner]
      const isLastMatchupInRound = currentMatchup === roundMatchups.length - 1

      if (isLastMatchupInRound) {
        if (newWinners.length === 1) {
          return { ...prev, champion: newWinners[0], winners: newWinners }
        }
        const nextMatchups = buildRounds(newWinners)[0]
        const nextRounds = [...rounds, nextMatchups]
        return {
          ...prev,
          rounds: nextRounds,
          currentRound: currentRound + 1,
          currentMatchup: 0,
          winners: [],
        }
      }

      return { ...prev, currentMatchup: currentMatchup + 1, winners: newWinners }
    })
  }, [])

  const reset = useCallback(() => setState(null), [])

  const currentMatchup =
    state && !state.champion
      ? state.rounds[state.currentRound]?.[state.currentMatchup] ?? null
      : null

  const totalMatchups = state
    ? state.rounds.reduce((sum, r) => sum + r.length, 0)
  : 0

  const completedMatchups = state
    ? state.rounds.slice(0, state.currentRound).reduce((sum, r) => sum + r.length, 0) +
      state.currentMatchup
    : 0

  const roundLabel = state
    ? getRoundLabel(state.currentRound, state.rounds.length)
    : ''

  return { state, start, pick, reset, currentMatchup, totalMatchups, completedMatchups, roundLabel }
}

function getRoundLabel(round: number, totalRounds: number): string {
  const remaining = totalRounds - round
  if (remaining === 1) return 'Final'
  if (remaining === 2) return 'Semi-Final'
  if (remaining === 3) return 'Quarter-Final'
  return `Round ${round + 1}`
}
