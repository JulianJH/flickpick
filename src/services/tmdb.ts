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

type MediaType = 'movie' | 'tv'

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

async function searchMovie(
  title: string,
  year: number | null,
): Promise<{ result: TMDBResult; mediaType: MediaType } | null> {
  // 1. Movie search with year
  if (year) {
    const r = await searchEndpoint('search/movie', title, year)
    if (r) return { result: r, mediaType: 'movie' }
  }
  // 2. Movie search without year
  const r2 = await searchEndpoint('search/movie', title)
  if (r2) return { result: r2, mediaType: 'movie' }
  // 3. TV search (handles miniseries, shows listed on Letterboxd)
  if (year) {
    const r3 = await searchEndpoint('search/tv', title, year)
    if (r3) return { result: r3, mediaType: 'tv' }
  }
  const r4 = await searchEndpoint('search/tv', title)
  return r4 ? { result: r4, mediaType: 'tv' } : null
}

async function fetchRuntimeMinutes(id: number, mediaType: MediaType): Promise<number | null> {
  const res = await fetch(`${BASE_URL}/${mediaType}/${id}?api_key=${apiKey()}`)
  if (!res.ok) return null

  const data = await res.json()
  if (mediaType === 'movie') return typeof data.runtime === 'number' && data.runtime > 0 ? data.runtime : null

  const episodeRuntimes = data.episode_run_time as number[] | undefined
  return episodeRuntimes && episodeRuntimes.length > 0 ? episodeRuntimes[0] : null
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

    const runtimes = await Promise.allSettled(
      settled.map((r) =>
        r.status === 'fulfilled' && r.value
          ? fetchRuntimeMinutes(r.value.result.id, r.value.mediaType)
          : Promise.resolve(null),
      ),
    )

    settled.forEach((result, idx) => {
      const film = batch[idx]
      if (result.status === 'fulfilled' && result.value) {
        const { result: tmdb } = result.value
        const year = tmdb.release_date ? parseInt(tmdb.release_date.slice(0, 4), 10) : (film.year ?? 0)
        const runtimeResult = runtimes[idx]
        results.push({
          id: `tmdb-${tmdb.id}`,
          title: tmdb.title,
          year,
          posterPath: tmdb.poster_path ? posterUrl(tmdb.poster_path) : null,
          letterboxdUrl: film.letterboxdUrl,
          tmdbId: tmdb.id,
          overview: tmdb.overview,
          runtimeMinutes: runtimeResult.status === 'fulfilled' ? runtimeResult.value : null,
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
