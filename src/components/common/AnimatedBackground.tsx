import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

interface Star {
  id: number
  x: number
  y: number
  size: number
  opacity: number
  delay: number
  duration: number
}

interface FloatingRune {
  id: number
  symbol: string
  x: number
  y: number
  size: number
  delay: number
  duration: number
}

const RUNE_SYMBOLS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ']

const generateFloatingRunes = (): FloatingRune[] => {
  return Array.from({ length: 8 }, (_, i) => ({
    id: i,
    symbol: RUNE_SYMBOLS[Math.floor(Math.random() * RUNE_SYMBOLS.length)],
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 20 + Math.random() * 30,
    delay: Math.random() * 5,
    duration: 15 + Math.random() * 20,
  }))
}

// Generate data outside component to avoid re-renders
const generateStars = (): Star[] => {
  return Array.from({ length: 100 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 1 + Math.random() * 2,
    opacity: 0.1 + Math.random() * 0.5,
    delay: Math.random() * 5,
    duration: 3 + Math.random() * 4,
  }))
}

// Pre-generate data once on module load
const allStars = generateStars()
const allFloatingRunes = generateFloatingRunes()

export function AnimatedBackground() {
  const prefersReducedMotion = useReducedMotion()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const stars = allStars.slice(0, 30)
  const floatingRunes = allFloatingRunes.slice(0, 4)
  const skipAnimations = !!prefersReducedMotion

  // Mobile: only render a simple CSS gradient background — no JS animations
  if (isMobile) {
    return (
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, rgba(147, 51, 234, 0.12) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(217, 119, 6, 0.08) 0%, transparent 50%),
              radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)
            `,
          }}
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Gradient orbs - static */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
          top: '10%',
          left: '20%',
          filter: 'blur(60px)',
        }}
      />

      <div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(217, 119, 6, 0.1) 0%, transparent 70%)',
          bottom: '20%',
          right: '10%',
          filter: 'blur(60px)',
        }}
      />

      <div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.12) 0%, transparent 70%)',
          top: '50%',
          left: '60%',
          filter: 'blur(50px)',
        }}
      />

      {/* Stars */}
      {stars.map((star) =>
        skipAnimations ? (
          <div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            }}
          />
        ) : (
          <motion.div
            key={star.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              opacity: star.opacity,
            }}
            animate={{
              opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
            }}
            transition={{
              duration: star.duration,
              delay: star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )
      )}

      {/* Floating runes */}
      {floatingRunes.map((rune) => (
        <motion.span
          key={rune.id}
          className="absolute text-amber-500/10 font-cinzel select-none"
          style={{
            left: `${rune.x}%`,
            top: `${rune.y}%`,
            fontSize: rune.size,
          }}
          animate={{
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{
            duration: rune.duration,
            delay: rune.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          {rune.symbol}
        </motion.span>
      ))}

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px',
        }}
      />

      {/* Vignette effect */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      />
    </div>
  )
}
