import { motion } from 'framer-motion'

interface Props {
  onDismiss: () => void
}

export function TutorialOverlay({ onDismiss }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center px-8"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-xs text-center"
      >
        <div className="flex items-center justify-center gap-3 mb-6">
          <motion.div
            animate={{ y: [-6, 0, -6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-24 rounded-md bg-lb-card border border-lb-border flex items-center justify-center text-2xl"
          >
            ↑
          </motion.div>
          <motion.div
            animate={{ y: [6, 0, 6] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="w-16 h-24 rounded-md bg-lb-card border border-lb-border flex items-center justify-center text-2xl"
          >
            ↓
          </motion.div>
        </div>

        <h2 className="text-lb-text font-extrabold text-lg mb-2">Swipe to pick</h2>
        <p className="text-lb-text-dim text-sm mb-8">
          Two movies, one pick. Swipe either poster — any direction — or just tap it to choose.
          The other one's eliminated.
        </p>

        <button
          onClick={onDismiss}
          className="w-full bg-lb-accent hover:bg-lb-accent-dim text-white font-bold py-3.5 rounded-md text-sm transition-colors"
        >
          Got it →
        </button>
      </motion.div>
    </motion.div>
  )
}
