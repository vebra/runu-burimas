import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cookie, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

const COOKIE_CONSENT_KEY = 'rune-app-cookie-consent'

export function CookieConsent() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Show after a short delay so it doesn't flash on load
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted')
    setVisible(false)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6"
        >
          <div
            className="max-w-lg mx-auto rounded-2xl px-6 py-5 sm:px-8 sm:py-6 shadow-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(17, 12, 29, 0.95) 0%, rgba(30, 20, 50, 0.95) 100%)',
              border: '1px solid rgba(147, 51, 234, 0.25)',
              boxShadow: '0 -4px 30px rgba(147, 51, 234, 0.15), 0 0 60px rgba(0, 0, 0, 0.4)',
              backdropFilter: 'blur(16px)',
            }}
          >
            {/* Icon & Title */}
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.2), rgba(147, 51, 234, 0.2))',
                  border: '1px solid rgba(217, 119, 6, 0.3)',
                }}
              >
                <Cookie className="w-5 h-5 text-amber-400" />
              </div>
              <h3 className="font-cinzel font-bold text-white text-lg">
                Slapukai
              </h3>
            </div>

            {/* Description */}
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              Ši svetainė naudoja slapukus (cookies), kad užtikrintų geriausią
              naršymo patirtį ir išsaugotų jūsų nustatymus. Sutikdami,
              paspauskit „Sutinku" arba sužinokite daugiau apie tai, kaip
              naudojame jūsų duomenis.
            </p>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 py-2.5 rounded-xl text-base font-semibold text-gray-900 transition-all active:scale-95 hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  boxShadow: '0 0 20px rgba(217, 119, 6, 0.3)',
                }}
              >
                Sutinku
              </button>
              <Link
                to="/privacy"
                onClick={handleAccept}
                className="flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-base font-semibold text-gray-300 transition-all active:scale-95"
                style={{
                  background: 'rgba(147, 51, 234, 0.15)',
                  border: '1px solid rgba(147, 51, 234, 0.3)',
                }}
              >
                <Shield className="w-4 h-4" />
                Plačiau
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
