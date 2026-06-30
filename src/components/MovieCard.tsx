import { motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion'
import type { Movie } from '../types'

interface Props {
  movie: Movie
  side: 'left' | 'right'
  onPick: () => void
  isDraggable?: boolean
}

const SWIPE_THRESHOLD = 80

export function MovieCard({ movie, side, onPick, isDraggable = true }: Props) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-12, 12])
  const opacity = useTransform(x, [-200, 0, 200], [0.4, 1, 0.4])

  // Three-point mapping: overlay only shows when dragging in the "pick" direction
  const chooseOverlayOpacity = useTransform(
    x,
    [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    side === 'left' ? [1, 0, 0] : [0, 0, 1],
  )

  function handleDragEnd(_: unknown, info: PanInfo) {
    const shouldPick =
      side === 'left' ? info.offset.x < -SWIPE_THRESHOLD : info.offset.x > SWIPE_THRESHOLD
    if (shouldPick) onPick()
  }

  return (
    <motion.div
      className="relative flex flex-col rounded-2xl overflow-hidden bg-lb-card border border-lb-border cursor-pointer select-none"
      style={isDraggable ? { x, rotate, opacity } : {}}
      drag={isDraggable ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.3}
      dragMomentum={false}
      onDragEnd={isDraggable ? handleDragEnd : undefined}
      whileTap={{ scale: 0.98 }}
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
            <span className="text-5xl opacity-30">🎬</span>
          </div>
        )}

        {/* Choose overlay */}
        {isDraggable && (
          <motion.div
            className="absolute inset-0 bg-lb-accent/30 flex items-center justify-center"
            style={{ opacity: chooseOverlayOpacity }}
          >
            <span className="text-white text-3xl font-black tracking-widest drop-shadow">PICK</span>
          </motion.div>
        )}

        {/* Year badge */}
        {movie.year > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/70 rounded-md px-2 py-0.5 text-xs text-white font-medium">
            {movie.year}
          </div>
        )}
      </div>

      {/* Title — fixed height so both cards stay the same size */}
      <div className="p-3 min-h-[3.5rem] flex items-start">
        <p className="text-lb-text font-semibold text-sm leading-snug line-clamp-2">{movie.title}</p>
      </div>
    </motion.div>
  )
}
