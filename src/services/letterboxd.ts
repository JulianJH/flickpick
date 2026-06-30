export interface RawFilm {
  title: string
  year: number | null
  letterboxdUrl: string
  slug: string
}

const ITEMS_PER_PAGE = 28

function proxyUrl(url: string): string {
  if (import.meta.env.DEV) {
    // Vite dev server proxy — strips /letterboxd-proxy prefix and forwards to letterboxd.com
    const path = url.replace('https://letterboxd.com', '')
    return `/letterboxd-proxy${path}`
  }
  return `https://corsproxy.io/?url=${encodeURIComponent(url)}`
}

async function fetchPage(username: string, page: number): Promise<{ films: RawFilm[]; totalPages: number }> {
  const url = page === 1
    ? `https://letterboxd.com/${username}/watchlist/`
    : `https://letterboxd.com/${username}/watchlist/page/${page}/`

  const res = await fetch(proxyUrl(url), {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    },
  })

  if (!res.ok) {
    if (res.status === 404) throw new Error(`User "${username}" not found on Letterboxd.`)
    throw new Error(`Failed to fetch watchlist (HTTP ${res.status})`)
  }

  const html = await res.text()
  const doc = new DOMParser().parseFromString(html, 'text/html')

  // Check for empty/invalid page
  const notFound = doc.querySelector('.error-page, .error-message')
  if (notFound) throw new Error(`User "${username}" not found on Letterboxd.`)

  const films = parseFilms(doc)
  const totalPages = parseTotalPages(doc)

  return { films, totalPages }
}

function parseFilms(doc: Document): RawFilm[] {
  // data-target-link and data-item-name live on the outer .react-component wrapper
  const cards = Array.from(doc.querySelectorAll('.react-component[data-target-link][data-item-name]'))

  return cards.map((el) => {
    const link = el.getAttribute('data-target-link') ?? ''
    const slug = link.replace(/^\/film\//, '').replace(/\/$/, '')
    const itemName = el.getAttribute('data-item-name') ?? ''

    // data-item-name is e.g. "Brothers (2009)" — parse title and year from it
    const yearMatch = itemName.match(/\((\d{4})\)\s*$/)
    const year = yearMatch ? parseInt(yearMatch[1], 10) : extractYearFromSlug(slug)
    const title = yearMatch ? itemName.replace(/\s*\(\d{4}\)\s*$/, '').trim() : (itemName || slugToTitle(slug))

    return {
      title,
      year,
      slug,
      letterboxdUrl: `https://letterboxd.com/film/${slug}/`,
    }
  })
}

function parseTotalPages(doc: Document): number {
  const links = Array.from(doc.querySelectorAll('.paginate-pages a'))
  if (links.length === 0) return 1

  const pages = links
    .map((a) => {
      const href = a.getAttribute('href') ?? ''
      const match = href.match(/\/page\/(\d+)\/$/)
      return match ? parseInt(match[1], 10) : 0
    })
    .filter((n) => n > 0)

  return pages.length > 0 ? Math.max(...pages) : 1
}

function extractYearFromSlug(slug: string): number | null {
  // Many slugs end with -YYYY (e.g. "broken-english-2025")
  const match = slug.match(/-(\d{4})$/)
  if (match) {
    const year = parseInt(match[1], 10)
    if (year >= 1900 && year <= new Date().getFullYear() + 5) return year
  }
  return null
}

function slugToTitle(slug: string): string {
  return slug
    .replace(/-\d{4}$/, '')
    .replace(/-\d+$/, '')
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export async function fetchWatchlist(
  username: string,
  onProgress?: (page: number, total: number) => void,
): Promise<RawFilm[]> {
  const { films: firstPageFilms, totalPages } = await fetchPage(username, 1)
  onProgress?.(1, totalPages)

  if (totalPages === 1) return firstPageFilms

  const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2)
  const allFilms = [...firstPageFilms]

  // Fetch remaining pages with limited concurrency
  const CONCURRENCY = 3
  for (let i = 0; i < remainingPages.length; i += CONCURRENCY) {
    const batch = remainingPages.slice(i, i + CONCURRENCY)
    const results = await Promise.allSettled(batch.map((p) => fetchPage(username, p)))
    results.forEach((r) => {
      if (r.status === 'fulfilled') allFilms.push(...r.value.films)
    })
    onProgress?.(1 + i + batch.length, totalPages)
  }

  return allFilms
}

export { ITEMS_PER_PAGE }
