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
      className={`relative bg-gray-800/50 border-2 rounded-2xl p-6 sm:p-8 ${
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
          <span className="bg-linear-to-r from-amber-500 to-amber-400 text-gray-900 text-sm font-bold px-5 py-1.5 rounded-full">
            POPULIARIAUSIAS
          </span>
        </div>
      )}

      {savings && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white text-sm font-bold px-4 py-1.5 rounded-full">
            {savings}
          </span>
        </div>
      )}

      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Crown className={`w-12 h-12 ${isPopular ? 'text-amber-400' : 'text-purple-400'}`} />
        </div>
        <h3 className="text-2xl sm:text-3xl font-cinzel font-bold text-white mb-3">{name}</h3>
        <p className="text-gray-400 text-base sm:text-lg">{description}</p>
      </div>

      <div className="text-center mb-8">
        <div className="flex items-baseline justify-center gap-1">
          <span className={`text-5xl sm:text-6xl font-bold ${isPopular ? 'text-amber-300' : 'text-white'}`}>
            {price}
          </span>
          <span className="text-gray-400 text-lg sm:text-xl">/{period}</span>
        </div>
      </div>

      <ul className="space-y-4 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-3">
            <Check className={`w-5 h-5 sm:w-6 sm:h-6 mt-0.5 shrink-0 ${isPopular ? 'text-amber-400' : 'text-purple-400'}`} />
            <span className="text-gray-300 text-base sm:text-lg">{feature}</span>
          </li>
        ))}
      </ul>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubscribe}
        disabled={loading}
        className={`w-full py-4 sm:py-5 px-6 rounded-xl font-semibold text-lg sm:text-xl transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
          isPopular
            ? 'bg-linear-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-gray-900 shadow-lg shadow-amber-500/30'
            : 'bg-linear-to-r from-purple-700 to-violet-600 hover:from-purple-600 hover:to-violet-500 text-white border border-purple-400/30'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin" />
            Kraunama...
          </>
        ) : (
          <>
            <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
            Prenumeruoti
          </>
        )}
      </motion.button>
    </motion.div>
  )
}
