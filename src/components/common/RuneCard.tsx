import { useState, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import type { Rune } from '../../types/database'

interface RuneCardProps {
  rune?: Rune
  orientation?: 'upright' | 'reversed'
  revealed: boolean
  onReveal?: () => void
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showName?: boolean
  disabled?: boolean
}

const sizes = {
  sm: { width: 'w-24', height: 'h-36', symbol: 'text-4xl', name: 'text-xs' },
  md: { width: 'w-28 md:w-36', height: 'h-44 md:h-52', symbol: 'text-5xl md:text-6xl', name: 'text-sm md:text-base' },
  lg: { width: 'w-32 md:w-40', height: 'h-48 md:h-56', symbol: 'text-6xl md:text-7xl', name: 'text-base md:text-lg' },
}

export function RuneCard({
  rune,
  orientation = 'upright',
  revealed,
  onReveal,
  size = 'md',
  label,
  showName = true,
  disabled = false,
}: RuneCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [isFlipping, setIsFlipping] = useState(false)

  // Mouse position for 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation for tilt
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isFlipping) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    mouseX.set(x)
    mouseY.set(y)
  }

  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
    setIsHovered(false)
  }

  const handleClick = () => {
    if (revealed || disabled || !onReveal) return
    setIsFlipping(true)
    setTimeout(() => {
      onReveal()
      setIsFlipping(false)
    }, 300)
  }

  const sizeClasses = sizes[size]

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <motion.span
          className="text-sm text-amber-400 font-medium tracking-wide"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {label}
        </motion.span>
      )}

      <div style={{ perspective: 1000 }}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          style={{
            rotateX: revealed ? rotateX : 0,
            rotateY: revealed ? rotateY : 0,
            transformStyle: 'preserve-3d',
          }}
          animate={{
            rotateY: isFlipping ? 90 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`
            relative ${sizeClasses.width} ${sizeClasses.height}
            ${!revealed && !disabled ? 'cursor-pointer' : ''}
          `}
        >
          {/* Card glow effect */}
          <motion.div
            className="absolute -inset-1 rounded-2xl blur-md"
            style={{
              background: revealed
                ? 'linear-gradient(135deg, rgba(217, 119, 6, 0.4), rgba(147, 51, 234, 0.4))'
                : 'linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(88, 28, 135, 0.3))',
            }}
            animate={{
              opacity: isHovered ? 1 : 0.6,
              scale: isHovered ? 1.02 : 1,
            }}
            transition={{ duration: 0.3 }}
          />

          {/* Hidden card (back) */}
          {!revealed && (
            <motion.div
              className={`
                absolute inset-0 ${sizeClasses.width} ${sizeClasses.height}
                bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800
                border-2 rounded-xl
                flex items-center justify-center
                overflow-hidden
              `}
              style={{
                borderColor: isHovered ? 'rgba(147, 51, 234, 0.7)' : 'rgba(147, 51, 234, 0.4)',
                boxShadow: isHovered
                  ? '0 0 40px rgba(147, 51, 234, 0.5), inset 0 0 30px rgba(147, 51, 234, 0.1)'
                  : '0 0 25px rgba(147, 51, 234, 0.3)',
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Mystical pattern background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(147, 51, 234, 0.3) 0%, transparent 50%)`,
                }} />
                {/* Rune circle decoration */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="35" fill="none" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="0.5" />
                  <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(217, 119, 6, 0.2)" strokeWidth="0.5" />
                </svg>
              </div>

              {/* Animated shimmer */}
              <motion.div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(105deg, transparent 40%, rgba(147, 51, 234, 0.1) 45%, rgba(147, 51, 234, 0.2) 50%, rgba(147, 51, 234, 0.1) 55%, transparent 60%)',
                }}
                animate={{
                  x: ['-100%', '200%'],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2,
                  ease: 'easeInOut',
                }}
              />

              {/* Question mark */}
              <motion.span
                className="text-5xl text-purple-500/60 font-bold relative z-10"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.6, 0.8, 0.6],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                ?
              </motion.span>

              {/* Corner runes decoration */}
              <span className="absolute top-2 left-2 text-xs text-purple-500/30">ᚠ</span>
              <span className="absolute top-2 right-2 text-xs text-purple-500/30">ᚢ</span>
              <span className="absolute bottom-2 left-2 text-xs text-purple-500/30">ᚦ</span>
              <span className="absolute bottom-2 right-2 text-xs text-purple-500/30">ᚨ</span>
            </motion.div>
          )}

          {/* Revealed card (front) */}
          {revealed && rune && (
            <motion.div
              initial={{ rotateY: -90 }}
              animate={{ rotateY: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className={`
                absolute inset-0 ${sizeClasses.width} ${sizeClasses.height}
                bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800
                border-2 rounded-xl
                flex flex-col items-center justify-center
                overflow-hidden
              `}
              style={{
                borderColor: orientation === 'reversed'
                  ? 'rgba(239, 68, 68, 0.4)'
                  : 'rgba(217, 119, 6, 0.4)',
                boxShadow: orientation === 'reversed'
                  ? '0 0 30px rgba(239, 68, 68, 0.3), inset 0 0 20px rgba(239, 68, 68, 0.05)'
                  : '0 0 30px rgba(217, 119, 6, 0.3), inset 0 0 20px rgba(217, 119, 6, 0.05)',
              }}
            >
              {/* Inner glow */}
              <div
                className="absolute inset-0"
                style={{
                  background: orientation === 'reversed'
                    ? 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.15) 0%, transparent 60%)'
                    : 'radial-gradient(circle at 50% 30%, rgba(217, 119, 6, 0.15) 0%, transparent 60%)',
                }}
              />

              {/* Rune symbol */}
              <motion.span
                className={`${sizeClasses.symbol} relative z-10`}
                style={{
                  color: orientation === 'reversed' ? '#f87171' : '#fbbf24',
                  transform: orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                  textShadow: orientation === 'reversed'
                    ? '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)'
                    : '0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.3)',
                }}
                animate={isHovered ? {
                  scale: [1, 1.05, 1],
                  textShadow: orientation === 'reversed'
                    ? ['0 0 20px rgba(239, 68, 68, 0.6)', '0 0 40px rgba(239, 68, 68, 0.8)', '0 0 20px rgba(239, 68, 68, 0.6)']
                    : ['0 0 20px rgba(251, 191, 36, 0.6)', '0 0 40px rgba(251, 191, 36, 0.8)', '0 0 20px rgba(251, 191, 36, 0.6)'],
                } : {}}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                {rune.symbol}
              </motion.span>

              {/* Rune name */}
              {showName && (
                <motion.span
                  className={`${sizeClasses.name} font-cinzel text-white mt-2 relative z-10`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {rune.name}
                </motion.span>
              )}

              {/* Reversed indicator */}
              {orientation === 'reversed' && (
                <motion.span
                  className="text-xs text-red-400 mt-1 relative z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  (Apversta)
                </motion.span>
              )}

              {/* Corner decorations */}
              <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-amber-500/30 rounded-tl" />
              <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-amber-500/30 rounded-tr" />
              <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-amber-500/30 rounded-bl" />
              <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-amber-500/30 rounded-br" />
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

// Mini rune card for summaries
export function MiniRuneCard({
  rune,
  orientation = 'upright',
}: {
  rune: Rune
  orientation?: 'upright' | 'reversed'
}) {
  return (
    <div
      className="inline-flex items-center gap-2 bg-gray-800/50 border border-amber-500/30 rounded-lg px-3 py-2"
      style={{
        boxShadow: '0 0 15px rgba(217, 119, 6, 0.15)',
      }}
    >
      <span
        className="text-2xl"
        style={{
          color: orientation === 'reversed' ? '#f87171' : '#fbbf24',
          transform: orientation === 'reversed' ? 'rotate(180deg)' : 'none',
        }}
      >
        {rune.symbol}
      </span>
      <div className="flex flex-col">
        <span className="text-white text-sm font-cinzel">{rune.name}</span>
        {orientation === 'reversed' && (
          <span className="text-xs text-red-400">Apversta</span>
        )}
      </div>
    </div>
  )
}
