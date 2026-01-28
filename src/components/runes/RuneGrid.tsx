import { motion } from 'framer-motion'
import { RuneCard } from './RuneCard'
import type { Rune } from '../../types/database'

interface RuneGridProps {
  runes: Rune[]
  favorites?: string[]
  onToggleFavorite?: (runeId: string) => void
  onRuneClick?: (rune: Rune) => void
}

export function RuneGrid({
  runes,
  favorites = [],
  onToggleFavorite,
  onRuneClick,
}: RuneGridProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
    >
      {runes.map((rune) => (
        <motion.div key={rune.id} variants={item}>
          <RuneCard
            rune={rune}
            size="sm"
            isFavorite={favorites.includes(rune.id)}
            onToggleFavorite={
              onToggleFavorite ? () => onToggleFavorite(rune.id) : undefined
            }
            onClick={onRuneClick ? () => onRuneClick(rune) : undefined}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
