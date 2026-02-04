import { motion, useReducedMotion } from 'framer-motion'

interface RuneLoaderProps {
  symbol?: string
  color?: string
  message?: string
}

export function RuneLoader({
  symbol = 'ᚱ',
  color = 'text-amber-400',
  message = 'Kraunamos runos...',
}: RuneLoaderProps) {
  const shouldReduceMotion = useReducedMotion()

  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <motion.div
          animate={shouldReduceMotion ? {} : { rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className={`text-6xl ${color}`}
        >
          {symbol}
        </motion.div>
        <p className="text-amber-300 text-lg">{message}</p>
      </div>
    </div>
  )
}
