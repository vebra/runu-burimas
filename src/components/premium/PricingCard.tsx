import { motion } from 'framer-motion'
import { Crown, Check, Loader2 } from 'lucide-react'
import { useState } from 'react'

interface PricingCardProps {
  name: string
  price: string
  period: string
  description: string
  features: string[]
  priceId: string
  isPopular?: boolean
  savings?: string
  onSubscribe: (priceId: string) => Promise<void>
}

export function PricingCard({
  name,
  price,
  period,
  description,
  features,
  priceId,
  isPopular = false,
  savings,
  onSubscribe,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    try {
      await onSubscribe(priceId)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`relative bg-gray-800/50 border-2 rounded-2xl p-5 sm:p-7 ${
        isPopular
          ? 'border-amber-500/60 shadow-lg shadow-amber-500/20'
          : 'border-purple-500/30'
      }`}
      style={{
        boxShadow: isPopular
          ? '0 0 40px rgba(217, 119, 6, 0.3)'
          : '0 0 25px rgba(147, 51, 234, 0.2)',
      }}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-linear-to-r from-amber-500 to-amber-400 text-gray-900 text-xs sm:text-sm font-bold px-4 sm:px-5 py-1 sm:py-1.5 rounded-full whitespace-nowrap">
            POPULIARIAUSIAS
          </span>
        </div>
      )}

      {savings && (
        <div className="absolute -top-3 right-3 sm:right-4">
          <span className="bg-green-500 text-white text-xs sm:text-sm font-bold px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
            {savings}
          </span>
        </div>
      )}

      <div className="text-center mb-5 sm:mb-8">
        <div className="flex justify-center mb-3 sm:mb-4">
          <Crown className={`w-9 h-9 sm:w-12 sm:h-12 ${isPopular ? 'text-amber-400' : 'text-purple-400'}`} />
        </div>
        <h3
          className="font-cinzel font-bold text-white mb-1.5 sm:mb-3"
          style={{ fontSize: 'clamp(1.25rem, 3.5vw, 1.875rem)' }}
        >
          {name}
        </h3>
        <p className="font-cormorant italic text-gray-400 text-base sm:text-lg">{description}</p>
      </div>

      <div className="text-center mb-5 sm:mb-8">
        <div className="flex items-baseline justify-center gap-1">
          <span
            className={`font-cinzel font-bold ${isPopular ? 'text-amber-300' : 'text-white'}`}
            style={{ fontSize: 'clamp(2.25rem, 7vw, 3.75rem)' }}
          >
            {price}
          </span>
          <span className="text-gray-400 text-base sm:text-xl">/{period}</span>
        </div>
      </div>

      <ul className="space-y-2.5 sm:space-y-4 mb-6 sm:mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2.5 sm:gap-3">
            <Check className={`w-4 h-4 sm:w-5 sm:h-5 mt-0.5 shrink-0 ${isPopular ? 'text-amber-400' : 'text-purple-400'}`} />
            <span
              className="text-gray-300"
              style={{ fontSize: 'clamp(0.8rem, 2.2vw, 1.05rem)', lineHeight: '1.5' }}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full py-3.5 sm:py-4 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          isPopular
            ? 'bg-linear-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-gray-900 shadow-lg shadow-amber-500/30'
            : 'bg-linear-to-r from-purple-700 to-violet-600 hover:from-purple-600 hover:to-violet-500 text-white border border-purple-400/30'
        }`}
        style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)' }}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Kraunama...
          </>
        ) : (
          <>
            <Crown className="w-5 h-5" />
            Prenumeruoti
          </>
        )}
      </motion.button>
    </motion.div>
  )
}
