const ALLOWED_ORIGIN = 'https://flickpick.julianjh.dev'

export default {
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)
    const target = url.searchParams.get('url')

    if (!target || !target.startsWith('https://letterboxd.com/')) {
      return new Response('Invalid or missing url parameter', { status: 400 })
    }

    const upstream = await fetch(target, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    })

    const body = await upstream.arrayBuffer()

    return new Response(body, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('Content-Type') ?? 'text/html',
        'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      },
    })
  },
}
