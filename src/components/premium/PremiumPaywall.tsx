import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Crown, Sparkles, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'
import { trackPaywallView, trackFreemiumQuotaExceeded } from '../../lib/analytics'

interface PremiumPaywallProps {
  title?: string
  description?: string
  features?: string[]
  quotaExceeded?: boolean
}

export function PremiumPaywall({
  title = 'Premium Funkcija',
  description = 'Ši funkcija yra prieinama tik Premium nariams.',
  quotaExceeded = false,
  features = [
    'Neriboti 5 Runų Kryžiaus būrimai',
    'Neriboti 7 Runų Gyvenimo žemėlapio būrimai',
    'Meilės Būrimas (5 runų)',
    'Keltų Kryžius (10 runų)',
    'Rūnų Horoskopas',
    'Rūnų Dienoraštis — neriboti įrašai',
    'AI interpretacijos',
    'Pilna būrimų istorija',
  ],
}: PremiumPaywallProps) {
  useEffect(() => {
    trackPaywallView(title)
    if (quotaExceeded) {
      trackFreemiumQuotaExceeded(title)
    }
  }, [title, quotaExceeded])

  return (
    <div className="min-h-screen px-4 sm:px-6 pt-6 sm:pt-8 md:pt-32 pb-16 w-full flex justify-center items-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center w-full flex flex-col items-center gap-6 sm:gap-8"
        style={{ maxWidth: '600px' }}
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative"
        >
          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-linear-to-br from-amber-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-amber-500/40">
            <Crown className="w-10 h-10 sm:w-14 sm:h-14 text-amber-400" />
          </div>
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
          </motion.div>
        </motion.div>

        <h2
          className="font-cinzel font-bold text-white"
          style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)' }}
        >
          {title}
        </h2>

        <p
          className="font-cormorant italic text-gray-300 leading-relaxed"
          style={{ fontSize: 'clamp(1rem, 3vw, 1.35rem)' }}
        >
          {quotaExceeded
            ? 'Išnaudojote 3 nemokamus premium būrimus šį mėnesį. Prenumeruokite Premium neribotam naudojimui.'
            : description}
        </p>

        <div
          className="bg-purple-900/30 border-2 border-amber-500/40 rounded-xl p-5 sm:p-8 w-full"
          style={{ boxShadow: '0 0 30px rgba(217, 119, 6, 0.2)' }}
        >
          <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4 sm:mb-6">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            <h3
              className="text-amber-300 font-cinzel font-semibold"
              style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)' }}
            >
              Premium privalumai
            </h3>
          </div>
          <ul className="text-gray-200 text-left space-y-2.5 sm:space-y-4">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-2.5 sm:gap-3"
                style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1.05rem)' }}
              >
                <span className="text-amber-400 shrink-0">✨</span>
                {feature}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="w-full">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link
              to="/premium"
              className="w-full bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold py-3.5 sm:py-4 px-8 rounded-xl transition-all duration-300 shadow-lg inline-flex items-center justify-center gap-2.5"
              style={{
                boxShadow: '0 0 25px rgba(217, 119, 6, 0.4)',
                fontSize: 'clamp(0.95rem, 2.5vw, 1.2rem)',
              }}
            >
              <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
              Gauti Premium
            </Link>
          </motion.div>
        </div>

        <p className="text-gray-400 text-sm sm:text-base">
          Tik <span className="text-amber-400 font-semibold">€9.99/mėn</span> arba{' '}
          <span className="text-green-400 font-semibold">€79.99/metams</span>
        </p>
      </motion.div>
    </div>
  )
}
