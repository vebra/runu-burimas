import { useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import type { Rune } from '../../types/database'

interface RuneCardProps {
  rune: Rune
  orientation?: 'upright' | 'reversed'
  showDetails?: boolean
  isFavorite?: boolean
  onToggleFavorite?: () => void
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
}

export function RuneCard({
  rune,
  orientation = 'upright',
  showDetails = false,
  isFavorite = false,
  onToggleFavorite,
  onClick,
  size = 'md',
}: RuneCardProps) {
  const [expanded, setExpanded] = useState(showDetails)
  const [isHovered, setIsHovered] = useState(false)

  const sizeClasses = {
    sm: 'w-24 h-36',
    md: 'w-32 h-48',
    lg: 'w-40 h-60',
  }

  const symbolSizes = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl',
  }

  const isReversed = orientation === 'reversed'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.03 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative"
    >
      {/* Card */}
      <div
        onClick={onClick}
        className={`
          ${sizeClasses[size]}
          relative overflow-hidden
          bg-linear-to-br from-gray-800 via-purple-950/40 to-gray-900
          border-2 rounded-2xl
          flex flex-col items-center justify-center
          cursor-pointer
          transition-all duration-500
          ${isReversed
            ? 'border-red-600/40 hover:border-red-500/60'
            : 'border-amber-600/30 hover:border-amber-500/60'
          }
        `}
        style={{
          boxShadow: isHovered
            ? isReversed
              ? '0 0 40px rgba(220, 38, 38, 0.3), inset 0 0 30px rgba(220, 38, 38, 0.05)'
              : '0 0 40px rgba(217, 119, 6, 0.3), inset 0 0 30px rgba(217, 119, 6, 0.05)'
            : '0 0 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* Glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: isHovered
              ? `radial-gradient(circle at 50% 30%, ${isReversed ? 'rgba(220, 38, 38, 0.2)' : 'rgba(217, 119, 6, 0.2)'} 0%, transparent 70%)`
              : 'transparent',
          }}
          transition={{ duration: 0.3 }}
        />

        {/* Decorative corner */}
        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-500/20 rounded-tl-xl" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-500/20 rounded-br-xl" />

        {/* Rune symbol */}
        <motion.span
          className={`
            ${symbolSizes[size]}
            font-bold select-none relative z-10
            ${isReversed ? 'text-red-400' : 'text-amber-400'}
          `}
          style={{
            transform: isReversed ? 'rotate(180deg)' : 'none',
            textShadow: isHovered
              ? isReversed
                ? '0 0 30px rgba(220, 38, 38, 0.8), 0 0 60px rgba(220, 38, 38, 0.4)'
                : '0 0 30px rgba(212, 175, 55, 0.8), 0 0 60px rgba(212, 175, 55, 0.4)'
              : isReversed
                ? '0 0 15px rgba(220, 38, 38, 0.5)'
                : '0 0 15px rgba(212, 175, 55, 0.5)',
          }}
          animate={{
            scale: isHovered ? 1.05 : 1,
          }}
          transition={{ duration: 0.3 }}
        >
          {rune.symbol}
        </motion.span>

        {/* Name */}
        <span className="text-white font-cinzel font-semibold mt-3 text-sm relative z-10">
          {rune.name}
        </span>

        {/* Reversed indicator */}
        {isReversed && (
          <motion.span
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-red-400 mt-1 px-2 py-0.5 bg-red-500/10 rounded-full"
          >
            Apversta
          </motion.span>
        )}

        {/* Sparkle effect on hover */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-2 right-2"
          >
            <Sparkles className={`w-4 h-4 ${isReversed ? 'text-red-400/50' : 'text-amber-400/50'}`} />
          </motion.div>
        )}
      </div>

      {/* Favorite button */}
      {onToggleFavorite && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite()
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`
            absolute top-3 right-3 p-2 rounded-full
            backdrop-blur-sm transition-all duration-300
            ${isFavorite
              ? 'bg-amber-500/20 border border-amber-500/50'
              : 'bg-gray-800/80 border border-gray-700 hover:border-amber-500/50'
            }
          `}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isFavorite ? 'text-amber-400 fill-amber-400' : 'text-gray-400 hover:text-amber-300'
            }`}
          />
        </motion.button>
      )}

      {/* Expanded details */}
      {(showDetails || expanded) && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-gray-900/80 backdrop-blur-sm border border-amber-600/20 rounded-xl p-5"
          style={{
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.3)',
          }}
        >
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">{rune.meaning}</p>

          {/* Keywords */}
          <div className="flex flex-wrap gap-2 mb-4">
            {rune.keywords.map((keyword, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className="px-3 py-1.5 bg-purple-800/30 text-amber-300 text-xs rounded-full border border-amber-600/30 hover:border-amber-500/50 transition-colors"
              >
                {keyword}
              </motion.span>
            ))}
          </div>

          <div className="space-y-4 text-sm">
            {/* Interpretation */}
            <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700/50">
              <h4 className="text-amber-400 font-medium mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Interpretacija
              </h4>
              <p className="text-gray-400 leading-relaxed">
                {isReversed && rune.reversed_interpretation
                  ? rune.reversed_interpretation
                  : rune.interpretation}
              </p>
            </div>

            {/* Element and Aett */}
            <div className="grid grid-cols-2 gap-3">
              {rune.element && (
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <span className="text-gray-500 text-xs block mb-1">Elementas</span>
                  <span className="text-gray-200">{rune.element}</span>
                </div>
              )}
              {rune.aett && (
                <div className="bg-gray-800/30 rounded-lg p-3">
                  <span className="text-gray-500 text-xs block mb-1">Aett</span>
                  <span className="text-gray-200">{rune.aett}</span>
                </div>
              )}
            </div>
          </div>

          {/* Collapse button */}
          {!showDetails && (
            <button
              onClick={() => setExpanded(false)}
              className="flex items-center gap-1 text-amber-400 text-sm mt-4 hover:text-amber-300 transition-colors group"
            >
              <ChevronUp className="w-4 h-4 group-hover:-translate-y-0.5 transition-transform" />
              Sutraukti
            </button>
          )}
        </motion.div>
      )}

      {/* Expand button */}
      {!showDetails && !expanded && onClick && (
        <motion.button
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(true)
          }}
          whileHover={{ y: 2 }}
          className="flex items-center justify-center gap-1 text-amber-400/70 text-sm mt-3 hover:text-amber-300 transition-colors w-full group"
        >
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          Daugiau
        </motion.button>
      )}
    </motion.div>
  )
}
