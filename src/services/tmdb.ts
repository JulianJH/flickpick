import type { Movie } from '../types'
import type { RawFilm } from './letterboxd'

const BASE_URL = 'https://api.themoviedb.org/3'
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500'

function apiKey(): string {
  const key = import.meta.env.VITE_TMDB_API_KEY
  if (!key) throw new Error('VITE_TMDB_API_KEY is not set.')
  return key
}

interface TMDBResult {
  id: number
  title: string
  release_date?: string
  poster_path?: string | null
  overview?: string
}

async function searchEndpoint(
  endpoint: 'search/movie' | 'search/tv',
  title: string,
  year?: number,
): Promise<TMDBResult | null> {
  const yearParam = endpoint === 'search/movie' ? 'primary_release_year' : 'first_air_date_year'
  const params = new URLSearchParams({
    api_key: apiKey(),
    query: title,
    include_adult: 'false',
    language: 'en-US',
    page: '1',
    ...(year ? { [yearParam]: String(year) } : {}),
  })

  const res = await fetch(`${BASE_URL}/${endpoint}?${params}`)
  if (!res.ok) throw new Error(`TMDB search failed (${res.status})`)

  const data = await res.json()
  return (data.results as TMDBResult[])[0] ?? null
}

async function searchMovie(title: string, year: number | null): Promise<TMDBResult | null> {
  // 1. Movie search with year
  if (year) {
    const r = await searchEndpoint('search/movie', title, year)
    if (r) return r
  }
  // 2. Movie search without year
  const r2 = await searchEndpoint('search/movie', title)
  if (r2) return r2
  // 3. TV search (handles miniseries, shows listed on Letterboxd)
  if (year) {
    const r3 = await searchEndpoint('search/tv', title, year)
    if (r3) return r3
  }
  return searchEndpoint('search/tv', title)
}

export function posterUrl(path: string): string {
  return `${IMAGE_BASE}${path}`
}

export async function enrichMovies(
  films: RawFilm[],
  onProgress?: (done: number, total: number) => void,
): Promise<Movie[]> {
  const results: Movie[] = []
  const CONCURRENCY = 5

  for (let i = 0; i < films.length; i += CONCURRENCY) {
    const batch = films.slice(i, i + CONCURRENCY)
    const settled = await Promise.allSettled(
      batch.map((f) => searchMovie(f.title, f.year)),
    )

    settled.forEach((result, idx) => {
      const film = batch[idx]
      if (result.status === 'fulfilled' && result.value) {
        const tmdb = result.value
        const year = tmdb.release_date ? parseInt(tmdb.release_date.slice(0, 4), 10) : (film.year ?? 0)
        results.push({
          id: `tmdb-${tmdb.id}`,
          title: tmdb.title,
          year,
          posterPath: tmdb.poster_path ? posterUrl(tmdb.poster_path) : null,
          letterboxdUrl: film.letterboxdUrl,
          tmdbId: tmdb.id,
          overview: tmdb.overview,
        })
      } else {
        results.push({
          id: `lb-${encodeURIComponent(film.title)}`,
          title: film.title,
          year: film.year ?? 0,
          posterPath: null,
          letterboxdUrl: film.letterboxdUrl,
        })
      }
    })

    onProgress?.(Math.min(i + CONCURRENCY, films.length), films.length)
  }

  return results
}
