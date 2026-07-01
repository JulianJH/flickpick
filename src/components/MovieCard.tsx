import { motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion'
import type { Movie } from '../types'

interface Props {
  movie: Movie
  onPick: () => void
}

const SWIPE_THRESHOLD = 90

export function MovieCard({ movie, onPick }: Props) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-6, 6])
  const distance = useTransform([x, y], ([xv, yv]: number[]) => Math.hypot(xv, yv))
  const pickOverlayOpacity = useTransform(distance, [0, SWIPE_THRESHOLD], [0, 1])

  function handleDragEnd(_: unknown, info: PanInfo) {
    const swiped = Math.hypot(info.offset.x, info.offset.y) > SWIPE_THRESHOLD
    if (swiped) onPick()
  }

  return (
    <motion.div
      className="relative w-full h-full rounded-2xl overflow-hidden bg-lb-surface border border-lb-border cursor-pointer select-none"
      style={{ x, y, rotate }}
      drag
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      dragElastic={0.4}
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      onClick={onPick}
      whileTap={{ scale: 0.98 }}
    >
      {movie.posterPath ? (
        <>
          {/* Blurred fill so the full poster is always visible without harsh cropping */}
          <img
            src={movie.posterPath}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110 opacity-50"
            draggable={false}
          />
          <div className="absolute inset-0 bg-black/25" />
          <img
            src={movie.posterPath}
            alt={movie.title}
            className="relative w-full h-full object-contain"
            draggable={false}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-5xl opacity-30">🎬</span>
        </div>
      )}

      {/* Pick overlay while dragging toward this card */}
      <motion.div
        className="absolute inset-0 bg-lb-accent/30 flex items-center justify-center pointer-events-none"
        style={{ opacity: pickOverlayOpacity }}
      >
        <span className="text-white text-3xl font-black tracking-widest drop-shadow">PICK</span>
      </motion.div>

      {/* Title */}
      <div className="absolute bottom-0 inset-x-0 px-3 py-2.5 bg-gradient-to-t from-black/85 to-transparent">
        <p className="text-white font-semibold text-sm leading-snug line-clamp-1">{movie.title}</p>
        {movie.year > 0 && <p className="text-white/70 text-xs">{movie.year}</p>}
      </div>
    </motion.div>
  )
}
