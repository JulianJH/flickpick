import { motion } from 'framer-motion'
import type { Movie } from '../types'

interface Props {
  winner: Movie
  onPlayAgain: () => void
  onHome: () => void
}

const CONFETTI = ['🎉', '🎊', '⭐', '🍿', '🎬', '✨']

export function WinnerScreen({ winner, onPlayAgain, onHome }: Props) {
  return (
    <div className="min-h-dvh bg-lb-bg flex flex-col items-center justify-center px-6 py-12">
      {/* Floating confetti */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute text-2xl"
            initial={{
              x: `${Math.random() * 100}vw`,
              y: '-10vh',
              rotate: Math.random() * 360,
              opacity: 1,
            }}
            animate={{
              y: '110vh',
              rotate: Math.random() * 720 - 360,
              opacity: [1, 1, 0],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              delay: Math.random() * 2,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {CONFETTI[i % CONFETTI.length]}
          </motion.span>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18 }}
        className="relative z-10 w-full max-w-xs text-center"
      >
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lb-accent font-black text-sm uppercase tracking-widest mb-3"
        >
          🏆 Tonight's Pick
        </motion.p>

        {/* Poster */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mx-auto w-48 rounded-md overflow-hidden shadow-2xl shadow-black/60 border border-lb-border mb-6"
        >
          {winner.posterPath ? (
            <img src={winner.posterPath} alt={winner.title} className="w-full" />
          ) : (
            <div className="aspect-[2/3] bg-lb-card flex items-center justify-center">
              <span className="text-6xl opacity-30">🎬</span>
            </div>
          )}
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="font-display text-2xl font-extrabold text-lb-text leading-tight mb-1"
        >
          {winner.title}
        </motion.h1>
        {winner.year > 0 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-lb-muted text-sm mb-6"
          >
            {winner.year}
          </motion.p>
        )}

        {winner.letterboxdUrl && (
          <motion.a
            href={winner.letterboxdUrl}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="inline-block text-lb-accent text-sm font-semibold mb-8 hover:underline"
          >
            View on Letterboxd ↗
          </motion.a>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3"
        >
          <button
            onClick={onPlayAgain}
            className="w-full bg-lb-accent hover:bg-lb-accent-dim text-white font-bold py-4 rounded-md text-base transition-colors"
          >
            Pick Another →
          </button>
          <button
            onClick={onHome}
            className="w-full bg-lb-card border border-lb-border text-lb-text-dim font-semibold py-3 rounded-md text-sm hover:text-lb-text transition-colors"
          >
            Start Over
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
