import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart, Github, Mail } from 'lucide-react'

const footerLinks = [
  { to: '/library', label: 'Runų Biblioteka' },
  { to: '/converter', label: 'Konverteris' },
  { to: '/daily', label: 'Kasdienė Runa' },
]

const RUNE_SYMBOLS = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ']

export function Footer() {
  return (
    <footer className="relative mt-auto overflow-hidden">
      {/* Top decorative border */}
      <div className="h-px bg-linear-to-r from-transparent via-amber-600/30 to-transparent" />

      <div className="bg-gray-900/80 backdrop-blur-sm" style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '1500px' }} className="px-4 py-3 md:px-12">
          {/* Main footer content */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 md:items-start">
            {/* Brand */}
            <div className="flex flex-col items-center text-center md:text-left md:items-start">
              <Link to="/" className="flex items-center gap-3 group mb-4">
                <motion.img
                  src={import.meta.env.BASE_URL + 'logo.png'}
                  alt="Runų Būrimas"
                  className="h-10 w-auto"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                />
                <span className="font-cinzel font-bold text-2xl md:text-xl text-white group-hover:text-amber-200 transition-colors">
                  Runų Būrimas
                </span>
              </Link>
              <p className="text-gray-500 text-base md:text-sm text-center md:text-left leading-relaxed max-w-xs">
                Atraskite senovės išmintį per Elder Futhark runas.
              </p>

              {/* Decorative runes */}
              <div className="flex items-center gap-2 mt-4 text-amber-500/30">
                {RUNE_SYMBOLS.map((rune, i) => (
                  <motion.span
                    key={i}
                    className="text-lg"
                    whileHover={{ scale: 1.2, color: 'rgba(217, 119, 6, 0.6)' }}
                  >
                    {rune}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex flex-col items-center text-center">
              <h3 className="font-cinzel font-semibold text-white mb-4 text-lg md:text-base">Navigacija</h3>
              <nav className="flex flex-col gap-3 md:gap-2 items-center">
                {footerLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="text-gray-400 hover:text-amber-300 transition-colors text-base md:text-sm hover:underline underline-offset-4"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Made with love */}
            <div className="flex flex-col items-center text-center md:text-right md:items-end">
              <h3 className="font-cinzel font-semibold text-white mb-4 text-lg md:text-base">Kontaktai</h3>
              <div className="flex items-center gap-4 mb-4">
                <motion.a
                  href="#"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-purple-500/50 transition-all"
                >
                  <Github className="w-5 h-5" />
                </motion.a>
                <motion.a
                  href="mailto:info@runuburimas.lt"
                  whileHover={{ scale: 1.1 }}
                  className="w-10 h-10 rounded-lg bg-gray-800/50 border border-gray-700 flex items-center justify-center text-gray-400 hover:text-white hover:border-amber-500/50 transition-all"
                >
                  <Mail className="w-5 h-5" />
                </motion.a>
              </div>

              <div className="flex items-center gap-2 text-base md:text-sm text-gray-500">
                <span>Sukurta su</span>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                </motion.div>
                <span>Lietuvoje</span>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-8 md:mt-6 pt-6 md:pt-4 border-t border-gray-800">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm md:text-xs text-gray-500">
              <p>© {new Date().getFullYear()} Runų Būrimas. Visos teisės saugomos.</p>
              <div className="flex items-center gap-4">
                <Link to="/privacy" className="hover:text-gray-400 transition-colors hover:underline underline-offset-4">
                  Privatumo politika
                </Link>
                <span className="text-gray-700">|</span>
                <Link to="/terms" className="hover:text-gray-400 transition-colors hover:underline underline-offset-4">
                  Naudojimo sąlygos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative gradient at bottom */}
      <div className="h-1 bg-linear-to-r from-purple-600 via-amber-500 to-purple-600" />
      <div className="h-0.5" />
    </footer>
  )
}
