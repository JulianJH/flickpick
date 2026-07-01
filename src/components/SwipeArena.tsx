import { AnimatePresence, motion } from 'framer-motion'
import { MovieCard } from './MovieCard'
import type { Matchup } from '../types'

interface Props {
  matchup: Matchup
  matchupKey: string
  roundLabel: string
  completedMatchups: number
  totalMatchups: number
  onPick: (side: 'a' | 'b') => void
  onBack: () => void
}

export function SwipeArena({
  matchup,
  matchupKey,
  roundLabel,
  completedMatchups,
  totalMatchups,
  onPick,
  onBack,
}: Props) {
  const progress = totalMatchups > 0 ? (completedMatchups / totalMatchups) * 100 : 0

  return (
    <div className="h-screen bg-lb-bg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-safe pt-4 pb-3 flex items-center gap-3 shrink-0">
        <button
          onClick={onBack}
          className="text-lb-muted hover:text-lb-text transition-colors text-sm"
        >
          ← Back
        </button>
        <div className="flex-1 text-center">
          <span className="text-lb-accent font-bold text-sm uppercase tracking-widest">
            {roundLabel}
          </span>
        </div>
        <span className="text-lb-muted text-sm tabular-nums">
          {completedMatchups + 1}/{totalMatchups}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mx-4 h-1 bg-lb-border rounded-full overflow-hidden mb-4 shrink-0">
        <motion.div
          className="h-full bg-lb-accent rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut' }}
        />
      </div>

      {/* VS label */}
      <div className="text-center mb-3 shrink-0">
        <span className="text-lb-muted text-xs font-semibold uppercase tracking-widest">
          Which would you rather watch?
        </span>
      </div>

      {/* Cards — vertically centered in remaining space, never overflows */}
      <div className="flex-1 min-h-0 flex items-center justify-center px-4 pb-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={matchupKey}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25 }}
            className="w-full max-h-full flex items-center gap-3"
          >
            <div className="flex-1 max-w-[45%]">
              <MovieCard movie={matchup.a} onPick={() => onPick('a')} />
            </div>

            <span className="text-lb-muted text-xs font-bold shrink-0">VS</span>

            <div className="flex-1 max-w-[45%]">
              <MovieCard movie={matchup.b} onPick={() => onPick('b')} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
