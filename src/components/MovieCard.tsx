import { motion } from 'framer-motion'
import type { Movie } from '../types'

interface Props {
  movie: Movie
  onPick: () => void
}

export function MovieCard({ movie, onPick }: Props) {
  return (
    <motion.button
      type="button"
      onClick={onPick}
      whileTap={{ scale: 0.96 }}
      className="flex flex-col rounded-2xl overflow-hidden bg-lb-card border border-lb-border text-left select-none active:border-lb-accent transition-colors"
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] w-full bg-lb-surface">
        {movie.posterPath ? (
          <img
            src={movie.posterPath}
            alt={movie.title}
            className="w-full h-full object-cover"
            draggable={false}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl opacity-30">🎬</span>
          </div>
        )}

        {movie.year > 0 && (
          <div className="absolute bottom-1.5 right-1.5 bg-black/70 rounded-md px-1.5 py-0.5 text-[10px] text-white font-medium">
            {movie.year}
          </div>
        )}
      </div>

      {/* Title */}
      <div className="px-2 py-2">
        <p className="text-lb-text font-semibold text-xs leading-snug line-clamp-2">{movie.title}</p>
      </div>
    </motion.button>
  )
}
