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
    <div className="min-h-screen bg-lb-bg flex flex-col">
      {/* Header */}
      <div className="px-4 pt-safe pt-4 pb-3 flex items-center gap-3">
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
      <div className="mx-4 h-1 bg-lb-border rounded-full overflow-hidden mb-4">
        <motion.div
          className="h-full bg-lb-accent rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut' }}
        />
      </div>

      {/* VS label */}
      <div className="text-center mb-3">
        <span className="text-lb-muted text-xs font-semibold uppercase tracking-widest">
          Which would you rather watch?
        </span>
      </div>

      {/* Cards */}
      <AnimatePresence mode="wait">
        <motion.div
          key={matchupKey}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col px-4 gap-3 pb-6"
        >
          {/* Movie A */}
          <div className="flex flex-col gap-2">
            <MovieCard
              movie={matchup.a}
              side="left"
              onPick={() => onPick('a')}
              compact
            />
            <button
              onClick={() => onPick('a')}
              className="w-full py-3 bg-lb-card border border-lb-border rounded-xl text-lb-text font-semibold text-sm hover:bg-lb-accent hover:border-lb-accent hover:text-white transition-all"
            >
              Pick This
            </button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-lb-border" />
            <span className="text-lb-muted text-xs font-bold bg-lb-surface rounded-full px-2 py-1">
              VS
            </span>
            <div className="h-px flex-1 bg-lb-border" />
          </div>

          {/* Movie B */}
          <div className="flex flex-col gap-2">
            <MovieCard
              movie={matchup.b}
              side="right"
              onPick={() => onPick('b')}
              compact
            />
            <button
              onClick={() => onPick('b')}
              className="w-full py-3 bg-lb-card border border-lb-border rounded-xl text-lb-text font-semibold text-sm hover:bg-lb-accent hover:border-lb-accent hover:text-white transition-all"
            >
              Pick This
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
