import { motion } from 'framer-motion'

interface Props {
  username: string
  page: number
  total: number
}

export function LoadingScreen({ username, page, total }: Props) {
  const pct = total > 1 ? Math.round((page / total) * 100) : 0

  return (
    <div className="min-h-screen bg-lb-bg flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm text-center"
      >
        <div className="mb-6">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
            className="inline-block w-12 h-12 border-4 border-lb-border border-t-lb-accent rounded-full"
          />
        </div>

        <h2 className="text-xl font-bold text-lb-text mb-1">
          Fetching @{username}'s watchlist…
        </h2>
        <p className="text-lb-text-dim text-sm mb-6">
          {total > 1 ? `Page ${page} of ${total}` : 'Scraping Letterboxd…'}
        </p>

        {total > 1 && (
          <div className="w-full bg-lb-border rounded-full h-1.5 overflow-hidden">
            <motion.div
              className="h-full bg-lb-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ ease: 'easeOut' }}
            />
          </div>
        )}
      </motion.div>
    </div>
  )
}
