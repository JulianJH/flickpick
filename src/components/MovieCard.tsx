import { animate, motion, type PanInfo, useMotionValue, useTransform } from 'framer-motion'
import { useState } from 'react'
import type { Movie } from '../types'

interface Props {
  movie: Movie
  onPick: () => void
}

// Tinder-style swipe: either drag far enough, or flick fast enough — a slow
// drag that doesn't cover much distance shouldn't register as a pick.
const DISTANCE_THRESHOLD = 90
const VELOCITY_THRESHOLD = 200

function formatRuntime(minutes: number): string {
  return `${minutes} mins`
}

export function MovieCard({ movie, onPick }: Props) {
  const [isDragging, setIsDragging] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 200], [-6, 6])
  const distance = useTransform([x, y], ([xv, yv]: number[]) => Math.hypot(xv, yv))
  const pickOverlayOpacity = useTransform(distance, [0, DISTANCE_THRESHOLD], [0, 1])

  function handleDragEnd(_: unknown, info: PanInfo) {
    // Use the actual (elastic-adjusted) card position, not the raw pointer offset,
    // so a big finger movement that only nudges the card visually doesn't count as a swipe.
    const traveled = Math.hypot(x.get(), y.get())
    const flicked = Math.hypot(info.velocity.x, info.velocity.y) > VELOCITY_THRESHOLD
    const swiped = traveled > DISTANCE_THRESHOLD || (flicked && traveled > DISTANCE_THRESHOLD * 0.35)

    if (swiped) {
      // Stay elevated — this card is about to be unmounted as the next matchup renders,
      // no need to drop z-index (and doing so early would let it dip under its sibling).
      onPick()
    } else {
      // Stay elevated until the spring-back settles, so it doesn't dip under its sibling mid-animation
      const springOptions = { type: 'spring', stiffness: 500, damping: 30 } as const
      animate(x, 0, springOptions)
      animate(y, 0, { ...springOptions, onComplete: () => setIsDragging(false) })
    }
  }

  return (
    <motion.div
      className="relative w-full h-full rounded-lg overflow-hidden bg-lb-surface border border-lb-border cursor-pointer select-none"
      style={{ x, y, rotate, zIndex: isDragging ? 20 : 0 }}
      drag
      dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
      dragElastic={0.5}
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
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
          <span className="font-display text-lb-muted text-sm uppercase tracking-widest opacity-60">No Poster</span>
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
        <p className="font-display text-white font-semibold text-sm leading-snug line-clamp-1">{movie.title}</p>
        {(movie.year > 0 || movie.runtimeMinutes) && (
          <p className="text-white/70 text-xs">
            {movie.year > 0 && movie.year}
            {movie.year > 0 && movie.runtimeMinutes ? ' · ' : ''}
            {movie.runtimeMinutes && (
              <span className="text-white/50">{formatRuntime(movie.runtimeMinutes)}</span>
            )}
          </p>
        )}
      </div>
    </motion.div>
  )
}
