import { motion } from 'framer-motion'
import { Crown, Sparkles, Lock } from 'lucide-react'
import { Link } from 'react-router-dom'

interface PremiumPaywallProps {
  title?: string
  description?: string
  features?: string[]
}

export function PremiumPaywall({
  title = 'Premium Funkcija',
  description = 'Ši funkcija yra prieinama tik Premium nariams.',
  features = [
    'Neriboti 5 Runų Kryžiaus būrimai',
    'Neriboti 7 Runų Gyvenimo žemėlapio būrimai',
    'Meilės Būrimas (5 runų)',
    'Keltų Kryžius (10 runų)',
    'AI interpretacijos',
    'Pilna būrimų istorija',
  ],
}: PremiumPaywallProps) {
  return (
    <div
      className="min-h-screen px-4 sm:px-6"
      style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '8rem', paddingBottom: '4rem' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
        style={{
          width: '100%',
          maxWidth: '600px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
        }}
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
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-full flex items-center justify-center border-2 border-amber-500/40">
            <Crown className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400" />
          </div>
          <motion.div
            className="absolute -top-1 -right-1"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Lock className="w-7 h-7 sm:w-8 sm:h-8 text-purple-400" />
          </motion.div>
        </motion.div>

        <h2 className="text-4xl sm:text-5xl font-cinzel font-bold text-white">{title}</h2>

        <p className="text-gray-300 text-xl sm:text-2xl leading-relaxed">{description}</p>

        <div
          className="bg-purple-900/30 border-2 border-amber-500/40 rounded-xl p-6 sm:p-8 w-full"
          style={{ boxShadow: '0 0 30px rgba(217, 119, 6, 0.2)' }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-amber-400" />
            <h3 className="text-amber-300 font-semibold text-lg sm:text-xl">Premium privalumai:</h3>
          </div>
          <ul className="text-gray-200 text-left space-y-3 sm:space-y-4">
            {features.map((feature, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 text-base sm:text-lg"
              >
                <span className="text-amber-400">✨</span>
                {feature}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-1">
            <Link
              to="/premium"
              className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold py-4 sm:py-5 px-8 text-lg sm:text-xl rounded-xl transition-all duration-300 shadow-lg inline-flex items-center justify-center gap-3"
              style={{ boxShadow: '0 0 25px rgba(217, 119, 6, 0.4)' }}
            >
              <Crown className="w-6 h-6 sm:w-7 sm:h-7" />
              Gauti Premium
            </Link>
          </motion.div>
        </div>

        <p className="text-gray-400 text-base sm:text-lg">
          Tik <span className="text-amber-400 font-semibold">€9.99/mėn</span> arba{' '}
          <span className="text-green-400 font-semibold">€79.99/metams</span>
        </p>
      </motion.div>
    </div>
  )
}
