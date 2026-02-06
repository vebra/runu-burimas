import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Sparkles, Calendar, BookOpen, Type, ArrowRight, Crown, Compass, TrendingUp, Zap, Star, Moon, HelpCircle, Heart } from 'lucide-react'
import { useRef, useState } from 'react'

// Feature type for cards
interface Feature {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  path: string
  color: string
  glowColor: string
  premium: boolean
}

// 3D Tilt Card Component
function FeatureCard({ feature }: { feature: Feature }) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)

  // Mouse position for 3D tilt
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Smooth spring animation for tilt
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), { stiffness: 300, damping: 30 })
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), { stiffness: 300, damping: 30 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
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

  return (
    <motion.div
      variants={itemVariants}
      className="w-full sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1.5rem)]"
      style={{ perspective: 1000 }}
    >
      <Link to={feature.path} className="block h-full">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: rotateX,
            rotateY: rotateY,
            transformStyle: 'preserve-3d',
          }}
          className="relative h-full"
        >
          {/* Animated border glow */}
          <motion.div
            className="absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500"
            style={{
              background: `linear-gradient(135deg, ${feature.glowColor}, transparent 40%, transparent 60%, ${feature.glowColor})`,
              opacity: isHovered ? 1 : 0,
            }}
            animate={isHovered ? {
              background: [
                `linear-gradient(0deg, ${feature.glowColor}, transparent 40%, transparent 60%, ${feature.glowColor})`,
                `linear-gradient(90deg, ${feature.glowColor}, transparent 40%, transparent 60%, ${feature.glowColor})`,
                `linear-gradient(180deg, ${feature.glowColor}, transparent 40%, transparent 60%, ${feature.glowColor})`,
                `linear-gradient(270deg, ${feature.glowColor}, transparent 40%, transparent 60%, ${feature.glowColor})`,
                `linear-gradient(360deg, ${feature.glowColor}, transparent 40%, transparent 60%, ${feature.glowColor})`,
              ],
            } : {}}
            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          />

          {/* Card content */}
          <div
            className={`
              relative overflow-hidden rounded-2xl
              bg-linear-to-br from-gray-900/95 via-gray-800/90 to-gray-900/95
              backdrop-blur-md
              border transition-all duration-500
              p-4 sm:p-5 lg:p-7
              ${feature.premium
                ? 'border-amber-500/40 hover:border-amber-400/70'
                : 'border-gray-700/50 hover:border-purple-500/60'
              }
            `}
            style={{
              boxShadow: feature.premium
                ? `0 0 40px ${feature.glowColor}, inset 0 1px 0 rgba(255,255,255,0.1)`
                : 'inset 0 1px 0 rgba(255,255,255,0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              transform: 'translateZ(0)',
            }}
          >
            {/* Shine effect on hover */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)',
                transform: 'translateX(-100%)',
              }}
              animate={isHovered ? { transform: 'translateX(100%)' } : { transform: 'translateX(-100%)' }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />

            {/* Glow effect on hover */}
            <motion.div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                background: `radial-gradient(circle at 50% 0%, ${feature.glowColor} 0%, transparent 60%)`,
              }}
              animate={{ opacity: isHovered ? 0.6 : 0 }}
              transition={{ duration: 0.3 }}
            />

            {/* Premium badge */}
            {feature.premium && (
              <motion.div
                className="absolute top-2 right-2 sm:top-3 sm:right-3 lg:top-4 lg:right-4 flex items-center gap-1 sm:gap-1.5 bg-amber-500/20 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full border border-amber-500/40"
                animate={isHovered ? { scale: [1, 1.05, 1] } : {}}
                transition={{ duration: 0.5 }}
              >
                <Crown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span className="text-[10px] sm:text-xs font-medium text-amber-300">Premium</span>
              </motion.div>
            )}

            {/* Floating Icon */}
            <motion.div
              className={`
                relative w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-xl flex items-center justify-center
                bg-linear-to-br ${feature.color}
                shadow-lg
              `}
              animate={isHovered ? {
                y: [0, -5, 0],
                rotate: [0, 5, -5, 0],
              } : {}}
              transition={{
                duration: 2,
                repeat: isHovered ? Infinity : 0,
                ease: 'easeInOut',
              }}
              style={{
                boxShadow: `0 10px 30px -10px ${feature.glowColor}`,
                flexShrink: 0,
                transform: 'translateZ(20px)',
              }}
            >
              <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </motion.div>

            {/* Content */}
            <motion.h3
              className="text-lg sm:text-xl lg:text-2xl font-cinzel font-semibold text-white transition-colors mt-3 sm:mt-4 lg:mt-5"
              style={{ transform: 'translateZ(10px)' }}
              animate={{ color: isHovered ? '#fde68a' : '#ffffff' }}
              transition={{ duration: 0.3 }}
            >
              {feature.title}
            </motion.h3>
            <p
              className="text-gray-400 text-sm sm:text-base leading-relaxed mt-2 sm:mt-3"
              style={{ flex: 1, transform: 'translateZ(5px)' }}
            >
              {feature.description}
            </p>

            {/* Arrow indicator */}
            <motion.div
              className="flex items-center gap-2 text-purple-400 transition-colors mt-3 sm:mt-4 lg:mt-5"
              animate={{ color: isHovered ? '#fbbf24' : '#a78bfa' }}
              transition={{ duration: 0.3 }}
            >
              <span className="text-sm sm:text-base font-medium">Atidaryti</span>
              <motion.div
                animate={{ x: isHovered ? 8 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <ArrowRight className="w-4 h-4" />
              </motion.div>
            </motion.div>

            {/* Decorative corner glow */}
            <motion.div
              className="absolute bottom-0 right-0 w-24 h-24 overflow-hidden pointer-events-none"
              animate={{ opacity: isHovered ? 0.5 : 0.2 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`absolute bottom-0 right-0 w-40 h-40 bg-linear-to-tl ${feature.color} rounded-full transform translate-x-1/2 translate-y-1/2 blur-sm`}
              />
            </motion.div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

const features = [
  {
    icon: Calendar,
    title: 'Kasdienė Runa',
    description: 'Traukite vieną runą kiekvieną dieną ir gaukite įkvėpimą',
    path: '/daily',
    color: 'from-purple-700 to-violet-600',
    glowColor: 'rgba(147, 51, 234, 0.4)',
    premium: false,
  },
  {
    icon: HelpCircle,
    title: 'Taip ar Ne?',
    description: 'Greitas atsakymas į taip/ne klausimą su viena runa',
    path: '/yes-no',
    color: 'from-emerald-600 to-green-500',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    premium: false,
  },
  {
    icon: Sparkles,
    title: 'Trijų Runų Būrimas',
    description: 'Praeitis, Dabartis, Ateitis - klasikinis runų išdėstymas',
    path: '/three-rune',
    color: 'from-amber-500 to-yellow-600',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    premium: false,
  },
  {
    icon: Crown,
    title: '5 Runų Kryžius',
    description: 'Situacijos analizė su praktiniais veiksmais',
    path: '/five-rune-cross',
    color: 'from-amber-600 to-amber-500',
    glowColor: 'rgba(217, 119, 6, 0.5)',
    premium: true,
  },
  {
    icon: Compass,
    title: '7 Runų Gyvenimo Žemėlapis',
    description: 'Gilus dvasinis kelias su 7 aspektais',
    path: '/seven-rune-map',
    color: 'from-purple-600 to-pink-600',
    glowColor: 'rgba(219, 39, 119, 0.4)',
    premium: true,
  },
  {
    icon: Heart,
    title: 'Meilės Būrimas',
    description: '5 runų santykių būrimas apie meilę ir partnerystę',
    path: '/love-reading',
    color: 'from-pink-500 to-rose-500',
    glowColor: 'rgba(236, 72, 153, 0.5)',
    premium: true,
  },
  {
    icon: Star,
    title: 'Keltų Kryžius',
    description: '10 runų pilnas būrimas - gilus situacijos tyrimas',
    path: '/celtic-cross',
    color: 'from-amber-700 to-amber-600',
    glowColor: 'rgba(180, 83, 9, 0.5)',
    premium: true,
  },
  {
    icon: BookOpen,
    title: 'Runų Biblioteka',
    description: 'Išmokite visas 24 Elder Futhark runas',
    path: '/library',
    color: 'from-purple-800 to-purple-600',
    glowColor: 'rgba(126, 34, 206, 0.4)',
    premium: false,
  },
  {
    icon: Type,
    title: 'Runų Konverteris',
    description: 'Paverskite savo vardą ar žodžius runomis',
    path: '/converter',
    color: 'from-emerald-600 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    premium: false,
  },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut' as const,
    },
  },
}

// Pre-computed particle positions to avoid Math.random() during render
const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  left: `${((i * 37 + 13) % 100)}%`,
  top: `${((i * 53 + 7) % 100)}%`,
  xOffset: ((i * 31 + 11) % 50) - 25,
  duration: 4 + ((i * 43 + 17) % 40) / 10,
  delay: ((i * 29 + 3) % 50) / 10,
}))

export function Home() {
  const heroRef = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  })

  // Multiple parallax layers with different speeds
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  // Slow parallax for background elements
  const bgLayer1Y = useTransform(scrollYProgress, [0, 1], [0, 150])
  const bgLayer2Y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const bgLayer3Y = useTransform(scrollYProgress, [0, 1], [0, 50])

  // Rune circle rotation based on scroll
  const runeCircleRotate = useTransform(scrollYProgress, [0, 1], [0, 180])
  const runeCircleScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.8])
  const runeCircleOpacity = useTransform(scrollYProgress, [0, 0.4], [0.3, 0])
  const innerRingRotate = useTransform(scrollYProgress, [0, 1], [0, -120])

  return (
    <div className="min-h-screen w-full" style={{ display: 'flex', flexDirection: 'column', gap: '4rem' }}>
      {/* Hero Section with Parallax */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Aurora Background Effect */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Aurora Layer 1 - Primary wave */}
          <motion.div
            className="absolute w-[200%] h-[200%] -top-1/2 -left-1/2"
            style={{
              background: `
                radial-gradient(ellipse 80% 50% at 50% 20%, rgba(120, 0, 255, 0.3) 0%, transparent 50%),
                radial-gradient(ellipse 60% 40% at 70% 50%, rgba(0, 255, 200, 0.15) 0%, transparent 50%),
                radial-gradient(ellipse 70% 50% at 30% 70%, rgba(255, 0, 150, 0.2) 0%, transparent 50%)
              `,
            }}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1],
            }}
            transition={{
              rotate: { duration: 120, repeat: Infinity, ease: 'linear' },
              scale: { duration: 20, repeat: Infinity, ease: 'easeInOut' },
            }}
          />

          {/* Aurora Layer 2 - Secondary flowing wave */}
          <motion.div
            className="absolute w-[150%] h-[150%] top-0 left-0"
            style={{
              background: `
                radial-gradient(ellipse 100% 60% at 20% 30%, rgba(147, 51, 234, 0.25) 0%, transparent 60%),
                radial-gradient(ellipse 80% 50% at 80% 60%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)
              `,
              filter: 'blur(40px)',
            }}
            animate={{
              x: [0, 100, 0, -100, 0],
              y: [0, -50, 0, 50, 0],
            }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Aurora Layer 3 - Vertical ribbons */}
          <motion.div
            className="absolute inset-0"
            style={{
              background: `
                linear-gradient(180deg,
                  transparent 0%,
                  rgba(147, 51, 234, 0.1) 20%,
                  rgba(59, 130, 246, 0.15) 35%,
                  rgba(16, 185, 129, 0.1) 50%,
                  rgba(147, 51, 234, 0.12) 65%,
                  rgba(236, 72, 153, 0.08) 80%,
                  transparent 100%
                )
              `,
              filter: 'blur(60px)',
            }}
            animate={{
              opacity: [0.5, 0.8, 0.5],
              scaleY: [1, 1.2, 1],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* Aurora Layer 4 - Dancing curtain effect */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={`aurora-ribbon-${i}`}
                className="absolute h-full"
                style={{
                  left: `${i * 20}%`,
                  width: '30%',
                  background: `linear-gradient(180deg,
                    transparent 0%,
                    ${i % 2 === 0 ? 'rgba(147, 51, 234, 0.15)' : 'rgba(16, 185, 129, 0.12)'} 30%,
                    ${i % 2 === 0 ? 'rgba(59, 130, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)'} 60%,
                    transparent 100%
                  )`,
                  filter: 'blur(30px)',
                }}
                animate={{
                  x: [0, 30, -20, 10, 0],
                  scaleX: [1, 1.3, 0.8, 1.1, 1],
                  opacity: [0.3, 0.6, 0.4, 0.7, 0.3],
                }}
                transition={{
                  duration: 10 + i * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.5,
                }}
              />
            ))}
          </div>

          {/* Aurora Layer 5 - Top glow horizon */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1/2"
            style={{
              background: `
                radial-gradient(ellipse 100% 80% at 50% 0%, rgba(147, 51, 234, 0.3) 0%, transparent 70%),
                radial-gradient(ellipse 80% 60% at 30% 10%, rgba(59, 130, 246, 0.2) 0%, transparent 60%),
                radial-gradient(ellipse 80% 60% at 70% 10%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)
              `,
            }}
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </div>

        {/* Parallax Background Layer 1 - Slowest */}
        <motion.div
          style={{ y: bgLayer1Y }}
          className="absolute inset-0 bg-linear-to-b from-purple-900/40 via-purple-800/20 to-transparent"
        />

        {/* Parallax Background Layer 2 - Medium */}
        <motion.div
          style={{ y: bgLayer2Y }}
          className="absolute inset-0"
        >
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
        </motion.div>

        {/* 1. Particle System - floating magical particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {PARTICLES.map((p, i) => (
            <motion.div
              key={`particle-${i}`}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: p.left,
                top: p.top,
                background: i % 2 === 0 ? 'rgba(251, 191, 36, 0.6)' : 'rgba(167, 139, 250, 0.6)',
                boxShadow: i % 2 === 0
                  ? '0 0 6px rgba(251, 191, 36, 0.8)'
                  : '0 0 6px rgba(167, 139, 250, 0.8)',
              }}
              animate={{
                y: [0, -100, 0],
                x: [0, p.xOffset, 0],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* 2. Glow Pulses - ambient pulsing orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(147, 51, 234, 0.15) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(251, 191, 36, 0.12) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
          <motion.div
            className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        {/* 3. Shimmer Effect - diagonal light sweep */}
        <motion.div
          className="absolute inset-0 pointer-events-none overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          <motion.div
            className="absolute w-[200%] h-full"
            style={{
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.05) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)',
              left: '-100%',
            }}
            animate={{
              left: ['−100%', '100%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatDelay: 4,
              ease: 'easeInOut',
            }}
          />
        </motion.div>

        {/* Mystical Rotating Rune Circle - Scroll-based rotation */}
        <motion.div
          style={{
            rotate: runeCircleRotate,
            scale: runeCircleScale,
            opacity: runeCircleOpacity,
          }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div className="relative w-150 h-150 md:w-200 md:h-200">
            {/* Outer rune ring */}
            {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ'].map((rune, i) => (
              <span
                key={`outer-${i}`}
                className="absolute text-3xl md:text-4xl text-amber-500/20"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `rotate(${i * 30}deg) translateY(-280px) translateX(-50%)`,
                }}
              >
                {rune}
              </span>
            ))}
            {/* Inner rune ring - counter rotation */}
            <motion.div
              style={{ rotate: innerRingRotate }}
              className="absolute inset-0"
            >
              {['ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ'].map((rune, i) => (
                <span
                  key={`inner-${i}`}
                  className="absolute text-2xl md:text-3xl text-purple-400/15"
                  style={{
                    left: '50%',
                    top: '50%',
                    transform: `rotate(${i * 45}deg) translateY(-180px) translateX(-50%)`,
                  }}
                >
                  {rune}
                </span>
              ))}
            </motion.div>
            {/* Center glow */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />
            </div>
          </div>
        </motion.div>

        {/* Parallax Floating decorative elements - Layer 3 */}
        <motion.div style={{ y: bgLayer3Y }} className="absolute inset-0">
          <motion.div
            className="absolute top-20 left-10 text-6xl text-amber-500/25"
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            ᚠ
          </motion.div>
          <motion.div
            className="absolute top-40 right-20 text-5xl text-purple-400/25"
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            ᛟ
          </motion.div>
          <motion.div
            className="absolute bottom-40 left-20 text-4xl text-amber-400/20"
            animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          >
            ᚱ
          </motion.div>
          <motion.div
            className="absolute bottom-20 right-10 text-5xl text-purple-300/20"
            animate={{ y: [0, 15, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            ᛗ
          </motion.div>

          {/* Moon decoration with parallax */}
          <motion.div
            className="absolute top-32 right-1/4 hidden lg:block"
            animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Moon className="w-16 h-16 text-amber-200/40" />
          </motion.div>

          {/* Stars decoration with parallax */}
          <motion.div
            className="absolute top-1/4 left-1/4 hidden lg:block"
            animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Star className="w-8 h-8 text-amber-300/50 fill-amber-300/30" />
          </motion.div>
          <motion.div
            className="absolute top-1/3 right-1/3 hidden lg:block"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <Star className="w-6 h-6 text-purple-300/40 fill-purple-300/20" />
          </motion.div>
        </motion.div>

        <motion.div
          style={{ opacity: heroOpacity, y: heroY }}
          className="relative z-10 w-full flex flex-col items-center justify-center text-center px-4 py-20"
        >
          {/* Crystal ball with glow effect */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
            className="relative"
          >
            <motion.div
              className="absolute inset-0 rounded-full bg-purple-500/20 blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              style={{ width: '150%', height: '150%', left: '-25%', top: '-25%' }}
            />
            <motion.span
              className="text-7xl md:text-9xl block relative z-10"
              animate={{ y: [0, -15, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              🔮
            </motion.span>
          </motion.div>

          {/* Main title with enhanced glow */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="display-xl text-white tracking-tight"
            style={{ marginTop: '32px' }}
          >
            <motion.span
              className="inline-block text-gradient-mystic"
              animate={{
                textShadow: [
                  '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)',
                  '0 0 40px rgba(168, 85, 247, 0.8), 0 0 80px rgba(168, 85, 247, 0.4)',
                  '0 0 20px rgba(168, 85, 247, 0.5), 0 0 40px rgba(168, 85, 247, 0.3)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              Runų Būrimas
            </motion.span>
          </motion.h1>

          {/* Subtitle with Cormorant font */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="subheading-lg max-w-2xl text-center"
            style={{ marginTop: '24px' }}
          >
            Atraskite senovės išmintį per <span className="text-amber-400 font-semibold not-italic">Elder Futhark</span> runas
          </motion.p>

          {/* Secondary tagline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="overline"
            style={{ marginTop: '16px' }}
          >
            Kasdienės runos • Būrimai • Išmintis
          </motion.p>

          {/* CTA Buttons with enhanced styling */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-4 sm:gap-6 w-full max-w-xl px-4"
            style={{ marginTop: '32px' }}
          >
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 sm:flex-initial"
            >
              <Link
                to="/daily"
                className="group relative w-full sm:w-auto overflow-hidden bg-linear-to-r from-purple-600 via-purple-500 to-pink-600 text-white font-bold text-xl md:text-2xl py-5 md:py-6 px-12 md:px-16 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-xl shadow-purple-900/50 border border-purple-400/30"
              >
                <span className="relative z-10 flex items-center gap-3">
                  <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                  Pradėti Būrimą
                  <ArrowRight className="w-6 h-6 md:w-7 md:h-7 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-linear-to-r from-purple-500 via-pink-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 sm:flex-initial"
            >
              <Link
                to="/library"
                className="group w-full sm:w-auto glass-gold text-amber-200 font-bold text-xl md:text-2xl py-5 md:py-6 px-12 md:px-16 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 hover:bg-amber-500/20"
              >
                <BookOpen className="w-6 h-6 md:w-7 md:h-7" />
                Runų Biblioteka
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
            style={{ marginTop: '40px' }}
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="flex flex-col items-center gap-2 text-gray-500"
            >
              <span className="text-sm">Žemyn</span>
              <div className="w-6 h-10 rounded-full border-2 border-gray-600 flex items-start justify-center p-2">
                <motion.div
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-1.5 h-1.5 bg-amber-400 rounded-full"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="relative py-12 sm:py-20 md:py-32 lg:py-40 px-3 sm:px-4 w-full flex justify-center">
        <div style={{ width: '100%', maxWidth: '1152px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <motion.span
              className="overline mb-4 block"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Išbandykite
            </motion.span>
            <h2 className="display-lg text-white">
              Funkcijos
            </h2>
            <p className="subheading mt-4 max-w-lg mx-auto">
              Visos priemonės jūsų dvasiniam keliui
            </p>
            <div className="w-24 h-1 bg-linear-to-r from-transparent via-amber-500 to-transparent mx-auto mt-6" />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-x-4 gap-y-5 sm:gap-x-6 sm:gap-y-6 lg:gap-x-9 lg:gap-y-8 mx-auto"
          >
            {features.map((feature) => (
              <FeatureCard key={feature.path} feature={feature} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Elder Futhark Section */}
      <section className="relative py-20 md:py-32 lg:py-40 px-4 overflow-hidden w-full flex justify-center">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-linear-to-b from-purple-900/10 via-transparent to-purple-900/10" />

        <div className="relative" style={{ width: '100%', maxWidth: '896px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Glowing card */}
            <div
              className="relative overflow-hidden rounded-3xl p-8 md:p-12 text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.4) 0%, rgba(107, 33, 168, 0.3) 50%, rgba(126, 34, 206, 0.4) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(217, 119, 6, 0.3)',
                boxShadow: '0 0 60px rgba(217, 119, 6, 0.2), inset 0 0 60px rgba(147, 51, 234, 0.1)',
              }}
            >
              {/* Animated border glow */}
              <div
                className="absolute inset-0 rounded-3xl opacity-50"
                style={{
                  background: 'linear-gradient(45deg, transparent, rgba(217, 119, 6, 0.3), transparent, rgba(147, 51, 234, 0.3), transparent)',
                  backgroundSize: '400% 400%',
                  animation: 'gradient-shift 8s ease-in-out infinite',
                }}
              />

              <div className="relative z-10" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-block text-6xl"
                >
                  ⚔️
                </motion.span>

                <h2 className="display-lg text-white">
                  Elder Futhark Runos
                </h2>

                <p className="quote-lg mt-2">
                  „Kiekviena runa turi unikalią reikšmę ir energiją"
                </p>

                <p className="body-text-lg text-gray-300 max-w-xl mx-auto text-center mt-4">
                  24 senovės germanų runos, naudotos nuo <span className="text-amber-400 font-semibold">II</span> iki <span className="text-amber-400 font-semibold">VIII</span> amžiaus.
                </p>

                {/* Rune display with enhanced animation */}
                <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                  {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ', 'ᚺ', 'ᚾ', 'ᛁ', 'ᛃ', 'ᛇ', 'ᛈ', 'ᛉ', 'ᛊ', 'ᛏ', 'ᛒ', 'ᛖ', 'ᛗ', 'ᛚ', 'ᛜ', 'ᛞ', 'ᛟ'].map((rune, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0, scale: 0.5, y: 20 }}
                      whileInView={{ opacity: 1, scale: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{
                        delay: i * 0.03,
                        type: 'spring',
                        stiffness: 200,
                      }}
                      whileHover={{
                        scale: 1.3,
                        rotate: [0, -5, 5, 0],
                        transition: { duration: 0.3 },
                      }}
                      className="text-3xl md:text-4xl text-amber-400 hover:text-amber-200 cursor-pointer transition-colors p-2 md:p-3 rounded-lg hover:bg-amber-500/10"
                      style={{
                        textShadow: '0 0 10px rgba(212, 175, 55, 0.5)',
                      }}
                    >
                      {rune}
                    </motion.span>
                  ))}
                </div>

                {/* Link to library */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 }}
                  style={{ marginTop: '0.5rem' }}
                >
                  <Link
                    to="/library"
                    className="inline-flex items-center gap-2 text-amber-300 hover:text-amber-200 transition-colors group"
                  >
                    <span>Sužinoti daugiau</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative py-24 md:py-36 lg:py-48 px-6" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1024px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16 md:mb-20"
          >
            <span className="overline mb-4 block">Statistika</span>
            <h2 className="display-lg text-white">
              Prisijunkite prie bendruomenės
            </h2>
            <p className="subheading mt-4 max-w-md mx-auto">
              Tūkstančiai žmonių kasdien atranda runų išmintį
            </p>
            <div className="w-32 h-1 bg-linear-to-r from-transparent via-purple-500 to-transparent mx-auto mt-8" />
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-12 gap-y-8 mx-auto">
            {[
              {
                icon: Sparkles,
                value: '6',
                label: 'Būrimų tipų',
                borderClass: 'border-purple-500/30 hover:border-purple-400/50',
                gradient: 'from-purple-600 to-violet-600',
              },
              {
                icon: TrendingUp,
                value: '10',
                label: 'Pozicijų Keltų Kryžiuje',
                borderClass: 'border-amber-500/30 hover:border-amber-400/50',
                gradient: 'from-amber-500 to-yellow-500',
              },
              {
                icon: Zap,
                value: '24',
                label: 'Elder Futhark runų',
                borderClass: 'border-pink-500/30 hover:border-pink-400/50',
                gradient: 'from-pink-500 to-rose-500',
              },
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ y: -5 }}
                className="group relative w-full"
              >
                <div
                  className={`
                    relative overflow-hidden rounded-2xl p-8 md:p-10 text-center
                    bg-gray-900/60 backdrop-blur-sm
                    border ${stat.borderClass}
                    transition-all duration-300
                  `}
                >
                  {/* Glow effect */}
                  <div
                    className={`
                      absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                      bg-linear-to-t ${stat.gradient}
                    `}
                    style={{ opacity: 0.05 }}
                  />

                  {/* Icon with animated background */}
                  <motion.div
                    className={`
                      relative w-24 h-24 mx-auto mb-6 rounded-xl
                      bg-linear-to-br ${stat.gradient}
                      flex items-center justify-center
                      shadow-lg
                    `}
                    whileHover={{ rotate: [0, -10, 10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <stat.icon className="w-12 h-12 text-white" />
                  </motion.div>

                  {/* Counter animation */}
                  <motion.div
                    initial={{ scale: 0.5 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="text-5xl md:text-6xl font-bold text-white mb-4"
                  >
                    {stat.value}
                  </motion.div>

                  <div className="text-gray-400">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-24 md:py-36 lg:py-48 px-6 w-full" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginBottom: '4rem' }}>
        <div style={{ width: '100%', maxWidth: '1024px' }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            {/* Decorative elements */}
            <motion.div
              className="absolute -top-10 -left-10 text-6xl text-purple-500/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            >
              ᚠ
            </motion.div>
            <motion.div
              className="absolute -bottom-10 -right-10 text-6xl text-amber-500/10"
              animate={{ rotate: -360 }}
              transition={{ duration: 50, repeat: Infinity, ease: 'linear' }}
            >
              ᛟ
            </motion.div>

            <div
              className="relative overflow-hidden rounded-3xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.6) 0%, rgba(157, 23, 77, 0.4) 100%)',
                backdropFilter: 'blur(20px)',
                border: '2px solid rgba(217, 119, 6, 0.4)',
                boxShadow: '0 0 80px rgba(217, 119, 6, 0.2), 0 0 120px rgba(147, 51, 234, 0.2)',
                padding: '4rem 2rem',
              }}
            >
              {/* Animated gradient overlay */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  background: 'linear-gradient(45deg, transparent, rgba(217, 119, 6, 0.2), transparent, rgba(147, 51, 234, 0.2), transparent)',
                  backgroundSize: '400% 400%',
                  animation: 'gradient-shift 10s ease-in-out infinite',
                }}
              />

              <div className="relative z-10" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                <motion.span
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  className="inline-block text-6xl"
                >
                  ✨
                </motion.span>

                <h2 className="display-lg text-white">
                  Pasiruošęs sužinoti savo likimą?
                </h2>

                <p className="subheading-lg mt-4 max-w-xl mx-auto text-center">
                  Pradėkite savo kelionę su senovės runų išmintimi
                </p>
                <p className="body-text text-gray-400 mt-2">
                  Traukite savo pirmąją runą šiandien
                </p>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  style={{ marginTop: '1rem' }}
                >
                  <Link
                    to="/daily"
                    className="group inline-flex items-center gap-3 bg-linear-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-gray-900 font-bold py-6 md:py-7 px-14 md:px-20 rounded-xl transition-all duration-300 shadow-2xl text-xl md:text-2xl"
                    style={{
                      boxShadow: '0 10px 40px -10px rgba(245, 158, 11, 0.5)',
                    }}
                  >
                    <Sparkles className="w-7 h-7 md:w-8 md:h-8" />
                    <span>Pradėti Dabar</span>
                    <ArrowRight className="w-7 h-7 md:w-8 md:h-8 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </motion.div>

                {/* Trust indicators */}
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center justify-center gap-6 text-sm text-gray-400"
                  style={{ marginTop: '1rem' }}
                >
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    Nemokama
                  </span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-purple-400" />
                    Greita
                  </span>
                  <span className="w-1 h-1 bg-gray-600 rounded-full" />
                  <span className="flex items-center gap-2">
                    <Moon className="w-4 h-4 text-blue-400" />
                    Mistinė
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
