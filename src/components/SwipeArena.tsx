import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { MovieCard } from './MovieCard'
import { TutorialOverlay } from './TutorialOverlay'
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

const TUTORIAL_SEEN_KEY = 'flickpick-tutorial-seen'

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
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return !localStorage.getItem(TUTORIAL_SEEN_KEY)
    } catch {
      return false
    }
  })

  function dismissTutorial() {
    setShowTutorial(false)
    try {
      localStorage.setItem(TUTORIAL_SEEN_KEY, '1')
    } catch {
      // ignore (e.g. private browsing)
    }
  }

  return (
    <div className="h-dvh bg-lb-bg flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 pt-safe pt-3 pb-2 flex items-center gap-3 shrink-0 z-10">
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
          {completedMatchups}/{totalMatchups}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mx-4 h-1 bg-lb-border rounded-full overflow-hidden mb-2 shrink-0 z-10">
        <motion.div
          className="h-full bg-lb-accent rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ ease: 'easeOut' }}
        />
      </div>

      {/* Cards — full-bleed split screen, swipe toward your pick */}
      <div className={`relative flex-1 min-h-0 flex flex-col gap-1.5 px-3 pb-3 ${showTutorial ? 'pointer-events-none' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={matchupKey}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="flex-1 min-h-0 flex flex-col gap-1.5"
          >
            <div className="flex-1 min-h-0">
              <MovieCard movie={matchup.a} onPick={() => onPick('a')} />
            </div>
            <div className="flex-1 min-h-0">
              <MovieCard movie={matchup.b} onPick={() => onPick('b')} />
            </div>
          </motion.div>
        </AnimatePresence>

        {/* VS chip floating over the divider */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <span className="text-lb-muted text-[10px] font-bold bg-lb-surface border border-lb-border rounded-full px-2 py-1 shadow-lg">
            VS
          </span>
        </div>
      </div>

      <AnimatePresence>
        {showTutorial && <TutorialOverlay key="tutorial" onDismiss={dismissTutorial} />}
      </AnimatePresence>
    </div>
  )
}
