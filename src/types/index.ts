export interface Movie {
  id: string
  title: string
  year: number
  posterPath: string | null
  letterboxdUrl: string
  tmdbId?: number
  overview?: string
  runtimeMinutes?: number | null
}

export interface Matchup {
  a: Movie
  b: Movie
}

export type MatchSize = 8 | 16

export type AppScreen = 'home' | 'loading' | 'bracket' | 'winner'

export interface TournamentState {
  movies: Movie[]
  rounds: Matchup[][]
  currentRound: number
  currentMatchup: number
  winners: Movie[]
  champion: Movie | null
}
