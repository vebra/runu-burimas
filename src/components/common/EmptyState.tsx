import { motion } from 'framer-motion'
import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description: string
  action?: {
    label: string
    to?: string
    onClick?: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 px-4"
    >
      {icon && (
        <motion.div
          className="text-6xl mb-6"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          {icon}
        </motion.div>
      )}

      <h3 className="text-xl font-cinzel font-semibold text-white mb-2">
        {title}
      </h3>

      <p className="text-gray-400 mb-6 max-w-sm mx-auto">
        {description}
      </p>

      {action && (
        action.to ? (
          <Link to={action.to}>
            <Button variant="primary">
              {action.label}
            </Button>
          </Link>
        ) : action.onClick ? (
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        ) : null
      )}
    </motion.div>
  )
}

// Pre-built empty states
export function EmptyDivinations() {
  return (
    <EmptyState
      icon={<span>🔮</span>}
      title="Dar nėra būrimų"
      description="Atlikite savo pirmąjį būrimą ir jis atsiras čia."
      action={{
        label: 'Pradėti būrimą',
        to: '/three-rune'
      }}
    />
  )
}

export function EmptyFavorites() {
  return (
    <EmptyState
      icon={<span>💜</span>}
      title="Nėra mėgstamų runų"
      description="Pridėkite runas prie mėgstamų bibliotekoje."
      action={{
        label: 'Atidaryti biblioteką',
        to: '/library'
      }}
    />
  )
}

export function EmptyDailyRunes() {
  return (
    <EmptyState
      icon={<span>✨</span>}
      title="Dar netraukėte runos"
      description="Traukite savo pirmąją kasdienę runą ir pradėkite dieną su išmintimi."
    />
  )
}

export function EmptySearchResults() {
  return (
    <EmptyState
      icon={<span>🔍</span>}
      title="Nieko nerasta"
      description="Pabandykite ieškoti kitaip arba pakeiskite filtrus."
    />
  )
}

export function NoDataYet({ type }: { type: 'divinations' | 'favorites' | 'daily' | 'search' }) {
  switch (type) {
    case 'divinations':
      return <EmptyDivinations />
    case 'favorites':
      return <EmptyFavorites />
    case 'daily':
      return <EmptyDailyRunes />
    case 'search':
      return <EmptySearchResults />
    default:
      return null
  }
}
