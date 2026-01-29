import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Home, Search, BookOpen, Sparkles } from 'lucide-react'
import { Button } from '../components/common/Button'

const MYSTERY_RUNES = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ']

export function NotFound() {
  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
        >
          {/* Animated runes circle */}
          <div className="relative w-32 h-32 mb-4">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-purple-500/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-3 rounded-full border-2 border-amber-500/40"
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-6 rounded-full border border-purple-400/50"
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            />

            {/* Floating runes around the circle */}
            {MYSTERY_RUNES.map((rune, i) => (
              <motion.span
                key={i}
                className="absolute text-amber-500/40 text-lg"
                style={{
                  left: '50%',
                  top: '50%',
                }}
                animate={{
                  x: Math.cos((i / MYSTERY_RUNES.length) * Math.PI * 2) * 60 - 8,
                  y: Math.sin((i / MYSTERY_RUNES.length) * Math.PI * 2) * 60 - 8,
                  opacity: [0.3, 0.7, 0.3],
                }}
                transition={{
                  opacity: { duration: 2, repeat: Infinity, delay: i * 0.2 },
                }}
              >
                {rune}
              </motion.span>
            ))}

            {/* Center 404 */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            >
              <span className="text-4xl font-cinzel font-bold text-amber-400">404</span>
            </motion.div>
          </div>

          <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-white">
            Puslapis Nerastas
          </h1>

          <p className="text-gray-400 text-lg max-w-md">
            Runos negali atrasti šio kelio. Galbūt jis egzistuoja kitoje dimensijoje...
          </p>
        </motion.div>

        {/* Mystical message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-900/60 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 mb-8 text-center"
        >
          <p className="text-purple-300 italic">
            „Ne visi, kurie klajoja, yra pasiklydę, bet šis puslapis tikrai neegzistuoja."
          </p>
        </motion.div>

        {/* Navigation options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <p className="text-gray-500 text-center mb-4">Kur norėtumėte keliauti?</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/">
              <Button variant="primary" size="lg" className="w-full">
                <Home className="w-5 h-5 mr-2" />
                Pradžia
              </Button>
            </Link>

            <Link to="/daily">
              <Button variant="secondary" size="lg" className="w-full">
                <Sparkles className="w-5 h-5 mr-2" />
                Kasdienė Runa
              </Button>
            </Link>

            <Link to="/library">
              <Button variant="secondary" size="lg" className="w-full">
                <BookOpen className="w-5 h-5 mr-2" />
                Runų Biblioteka
              </Button>
            </Link>

            <Link to="/three-rune">
              <Button variant="secondary" size="lg" className="w-full">
                <Search className="w-5 h-5 mr-2" />
                Trijų Runų Būrimas
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Decorative runes at bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center gap-4 mt-12 text-2xl text-amber-500/20"
        >
          {['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ'].map((rune, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
            >
              {rune}
            </motion.span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
