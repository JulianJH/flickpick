import { useState } from 'react'
import { motion } from 'framer-motion'
import type { MatchSize } from '../types'

interface Props {
  onStart: (username: string, size: MatchSize) => void
}

export function HomeScreen({ onStart }: Props) {
  const [username, setUsername] = useState('')
  const [size, setSize] = useState<MatchSize>(8)
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = username.trim()
    if (!trimmed) {
      setError('Enter your Letterboxd username.')
      return
    }
    setError('')
    onStart(trimmed, size)
  }

  return (
    <div className="min-h-dvh bg-lb-bg flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <img src="/favicon.svg" alt="" className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-extrabold text-lb-text tracking-tight">
            Flick<span className="text-lb-accent">Pick</span>
          </h1>
          <p className="mt-2 text-lb-text-dim text-sm">
            Pick your next movie — tournament style.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username input */}
          <div>
            <label className="block text-xs font-semibold text-lb-text-dim uppercase tracking-widest mb-2">
              Letterboxd Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. noahbaumbach"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              className="w-full bg-lb-card border border-lb-border rounded-xl px-4 py-3 text-lb-text placeholder:text-lb-muted focus:outline-none focus:border-lb-accent transition-colors text-base"
            />
            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
          </div>

          {/* Match size toggle */}
          <div>
            <label className="block text-xs font-semibold text-lb-text-dim uppercase tracking-widest mb-2">
              Match Size
            </label>
            <div className="grid grid-cols-2 gap-2">
              {([8, 16] as MatchSize[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`py-3 rounded-xl font-semibold text-sm transition-all border ${
                    size === s
                      ? 'bg-lb-accent border-lb-accent text-white'
                      : 'bg-lb-card border-lb-border text-lb-text-dim hover:border-lb-accent/50'
                  }`}
                >
                  {s === 8 ? '⚡ Quick (8)' : '🏆 Long (16)'}
                  <span className="block text-xs font-normal opacity-70 mt-0.5">
                    {s === 8 ? '3 rounds' : '4 rounds'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="w-full bg-lb-accent hover:bg-lb-accent-dim text-white font-bold py-4 rounded-xl text-base transition-colors"
          >
            Let's Pick a Movie →
          </motion.button>
        </form>

        <p className="mt-8 text-center text-xs text-lb-muted">
          Fetches your public watchlist from Letterboxd.
          <br />
          No login required.
        </p>
      </motion.div>
    </div>
  )
}
