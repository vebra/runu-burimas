import { useState, useRef, useEffect } from 'react'
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
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

// Generate particles for burst effect
const generateParticles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360,
    distance: 80 + Math.random() * 60,
    size: 3 + Math.random() * 4,
    delay: Math.random() * 0.1,
    duration: 0.6 + Math.random() * 0.4,
  }))
}

// Generate sparkles for ambient effect
const generateSparkles = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 3,
    delay: Math.random() * 2,
    duration: 1 + Math.random() * 1,
  }))
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
  const [showRevealEffects, setShowRevealEffects] = useState(false)
  const [particles] = useState(() => generateParticles(16))
  const [sparkles] = useState(() => generateSparkles(8))
  const [wasRevealed, setWasRevealed] = useState(revealed)

  // Track when card gets revealed to trigger effects
  useEffect(() => {
    if (revealed && !wasRevealed) {
      setShowRevealEffects(true)
      // Keep effects visible for duration of animation
      const timer = setTimeout(() => {
        setShowRevealEffects(false)
      }, 1500)
      return () => clearTimeout(timer)
    }
    setWasRevealed(revealed)
  }, [revealed, wasRevealed])

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

      <div style={{ perspective: 1000 }} className="relative">
        {/* Reveal Effects Container */}
        <AnimatePresence>
          {showRevealEffects && (
            <>
              {/* Energy Wave Rings */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={`wave-${i}`}
                  className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
                  style={{
                    width: 20,
                    height: 20,
                    marginLeft: -10,
                    marginTop: -10,
                    border: `2px solid ${orientation === 'reversed' ? 'rgba(239, 68, 68, 0.8)' : 'rgba(251, 191, 36, 0.8)'}`,
                    boxShadow: orientation === 'reversed'
                      ? '0 0 20px rgba(239, 68, 68, 0.5), inset 0 0 20px rgba(239, 68, 68, 0.3)'
                      : '0 0 20px rgba(251, 191, 36, 0.5), inset 0 0 20px rgba(251, 191, 36, 0.3)',
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{ scale: 15, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1,
                    delay: i * 0.15,
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Particle Burst */}
              {particles.map((particle) => (
                <motion.div
                  key={`particle-${particle.id}`}
                  className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
                  style={{
                    width: particle.size,
                    height: particle.size,
                    marginLeft: -particle.size / 2,
                    marginTop: -particle.size / 2,
                    background: orientation === 'reversed'
                      ? `radial-gradient(circle, rgba(239, 68, 68, 1) 0%, rgba(239, 68, 68, 0) 70%)`
                      : `radial-gradient(circle, rgba(251, 191, 36, 1) 0%, rgba(251, 191, 36, 0) 70%)`,
                    boxShadow: orientation === 'reversed'
                      ? '0 0 6px rgba(239, 68, 68, 0.8)'
                      : '0 0 6px rgba(251, 191, 36, 0.8)',
                  }}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
                  animate={{
                    x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
                    y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
                    opacity: 0,
                    scale: [0, 1.5, 0],
                  }}
                  transition={{
                    duration: particle.duration,
                    delay: particle.delay,
                    ease: 'easeOut',
                  }}
                />
              ))}

              {/* Central Flash */}
              <motion.div
                className="absolute left-1/2 top-1/2 rounded-full pointer-events-none"
                style={{
                  width: 100,
                  height: 100,
                  marginLeft: -50,
                  marginTop: -50,
                  background: orientation === 'reversed'
                    ? 'radial-gradient(circle, rgba(239, 68, 68, 0.8) 0%, rgba(239, 68, 68, 0) 70%)'
                    : 'radial-gradient(circle, rgba(251, 191, 36, 0.8) 0%, rgba(251, 191, 36, 0) 70%)',
                }}
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 3, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />

              {/* Mystical Runes Circle */}
              <motion.div
                className="absolute left-1/2 top-1/2 pointer-events-none"
                style={{
                  width: 200,
                  height: 200,
                  marginLeft: -100,
                  marginTop: -100,
                }}
                initial={{ rotate: 0, scale: 0, opacity: 0 }}
                animate={{ rotate: 180, scale: 1, opacity: [0, 0.6, 0] }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke={orientation === 'reversed' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(251, 191, 36, 0.5)'}
                    strokeWidth="1"
                    strokeDasharray="10 5"
                  />
                  <text
                    x="100"
                    y="20"
                    textAnchor="middle"
                    fill={orientation === 'reversed' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(251, 191, 36, 0.6)'}
                    fontSize="14"
                  >
                    ᚠ
                  </text>
                  <text
                    x="180"
                    y="105"
                    textAnchor="middle"
                    fill={orientation === 'reversed' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(251, 191, 36, 0.6)'}
                    fontSize="14"
                  >
                    ᚢ
                  </text>
                  <text
                    x="100"
                    y="190"
                    textAnchor="middle"
                    fill={orientation === 'reversed' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(251, 191, 36, 0.6)'}
                    fontSize="14"
                  >
                    ᚦ
                  </text>
                  <text
                    x="20"
                    y="105"
                    textAnchor="middle"
                    fill={orientation === 'reversed' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(251, 191, 36, 0.6)'}
                    fontSize="14"
                  >
                    ᚨ
                  </text>
                </svg>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
          role={!revealed && !disabled ? 'button' : undefined}
          aria-label={!revealed ? 'Atskleisti runą' : `${rune?.name} runa${orientation === 'reversed' ? ' (apversta)' : ''}`}
          tabIndex={!revealed && !disabled ? 0 : undefined}
          onKeyDown={(e) => {
            if (!revealed && !disabled && (e.key === 'Enter' || e.key === ' ')) {
              e.preventDefault()
              handleClick()
            }
          }}
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
              opacity: showRevealEffects ? 1 : (isHovered ? 1 : 0.6),
              scale: showRevealEffects ? 1.1 : (isHovered ? 1.02 : 1),
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
              <span className="absolute top-2 left-2 text-xs text-purple-500/30" aria-hidden="true">ᚠ</span>
              <span className="absolute top-2 right-2 text-xs text-purple-500/30" aria-hidden="true">ᚢ</span>
              <span className="absolute bottom-2 left-2 text-xs text-purple-500/30" aria-hidden="true">ᚦ</span>
              <span className="absolute bottom-2 right-2 text-xs text-purple-500/30" aria-hidden="true">ᚨ</span>
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
              {/* Inner glow - intensified on reveal */}
              <motion.div
                className="absolute inset-0"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  background: orientation === 'reversed'
                    ? 'radial-gradient(circle at 50% 30%, rgba(239, 68, 68, 0.2) 0%, transparent 60%)'
                    : 'radial-gradient(circle at 50% 30%, rgba(217, 119, 6, 0.2) 0%, transparent 60%)',
                }}
                transition={{ duration: 0.5 }}
              />

              {/* Ambient sparkles on revealed card */}
              {sparkles.map((sparkle) => (
                <motion.div
                  key={`sparkle-${sparkle.id}`}
                  className="absolute rounded-full pointer-events-none"
                  style={{
                    left: `${sparkle.x}%`,
                    top: `${sparkle.y}%`,
                    width: sparkle.size,
                    height: sparkle.size,
                    background: orientation === 'reversed'
                      ? 'rgba(239, 68, 68, 0.8)'
                      : 'rgba(251, 191, 36, 0.8)',
                    boxShadow: orientation === 'reversed'
                      ? '0 0 4px rgba(239, 68, 68, 0.6)'
                      : '0 0 4px rgba(251, 191, 36, 0.6)',
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: sparkle.duration,
                    delay: sparkle.delay,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              ))}

              {/* Energy aura behind rune */}
              <motion.div
                className="absolute rounded-full pointer-events-none"
                style={{
                  width: '70%',
                  height: '50%',
                  background: orientation === 'reversed'
                    ? 'radial-gradient(ellipse, rgba(239, 68, 68, 0.2) 0%, transparent 70%)'
                    : 'radial-gradient(ellipse, rgba(251, 191, 36, 0.2) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Rune symbol with dramatic entrance */}
              <motion.span
                className={`${sizeClasses.symbol} relative z-10`}
                style={{
                  color: orientation === 'reversed' ? '#f87171' : '#fbbf24',
                  transform: orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                }}
                initial={{ scale: 0, opacity: 0, filter: 'blur(10px)' }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  filter: 'blur(0px)',
                  textShadow: isHovered
                    ? (orientation === 'reversed'
                      ? '0 0 30px rgba(239, 68, 68, 0.9), 0 0 60px rgba(239, 68, 68, 0.5)'
                      : '0 0 30px rgba(251, 191, 36, 0.9), 0 0 60px rgba(251, 191, 36, 0.5)')
                    : (orientation === 'reversed'
                      ? '0 0 20px rgba(239, 68, 68, 0.6), 0 0 40px rgba(239, 68, 68, 0.3)'
                      : '0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.3)'),
                }}
                transition={{
                  scale: { duration: 0.5, ease: 'backOut' },
                  opacity: { duration: 0.3 },
                  filter: { duration: 0.4 },
                  textShadow: { duration: 0.3 },
                }}
              >
                {rune.symbol}
              </motion.span>

              {/* Rune name with slide up animation */}
              {showName && (
                <motion.span
                  className={`${sizeClasses.name} font-cinzel text-white mt-2 relative z-10`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  {rune.name}
                </motion.span>
              )}

              {/* Reversed indicator with special effect */}
              {orientation === 'reversed' && (
                <motion.span
                  className="text-xs text-red-400 mt-1 relative z-10"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  (Apversta)
                </motion.span>
              )}

              {/* Corner decorations with staggered animation */}
              <motion.div
                className="absolute top-2 left-2 w-3 h-3 border-t border-l rounded-tl"
                style={{ borderColor: orientation === 'reversed' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(217, 119, 6, 0.4)' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              />
              <motion.div
                className="absolute top-2 right-2 w-3 h-3 border-t border-r rounded-tr"
                style={{ borderColor: orientation === 'reversed' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(217, 119, 6, 0.4)' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.25 }}
              />
              <motion.div
                className="absolute bottom-2 left-2 w-3 h-3 border-b border-l rounded-bl"
                style={{ borderColor: orientation === 'reversed' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(217, 119, 6, 0.4)' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              />
              <motion.div
                className="absolute bottom-2 right-2 w-3 h-3 border-b border-r rounded-br"
                style={{ borderColor: orientation === 'reversed' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(217, 119, 6, 0.4)' }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.35 }}
              />
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
