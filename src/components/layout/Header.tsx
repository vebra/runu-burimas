import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, ArrowLeft, Sparkles, Crown, ChevronDown } from 'lucide-react'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface HeaderProps {
  user: SupabaseUser | null
  onSignOut: () => void
}

const navLinks = [
  { path: '/', label: 'Pradžia', icon: '🏠' },
  { path: '/daily', label: 'Kasdienė Runa', icon: '📅' },
  { path: '/yes-no', label: 'Taip/Ne', icon: '🎱' },
  { path: '/three-rune', label: '3 Runos', icon: '✨' },
  { path: '/library', label: 'Biblioteka', icon: '📚' },
  { path: '/converter', label: 'Konverteris', icon: '🔄' },
]

const premiumLinks = [
  { path: '/five-rune-cross', label: '5 Runų Kryžius', icon: '✨' },
  { path: '/seven-rune-map', label: '7 Runų Žemėlapis', icon: '🗺️' },
  { path: '/love-reading', label: 'Meilės Būrimas', icon: '💕' },
  { path: '/celtic-cross', label: 'Keltų Kryžius', icon: '🔮' },
]

export function Header({ user, onSignOut }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [premiumMenuOpen, setPremiumMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  // Track scroll for header background
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-gray-900/95 backdrop-blur-xl border-b border-amber-600/20 shadow-lg shadow-black/20'
          : 'bg-gray-900/80 backdrop-blur-md'
      }`}
    >
      <div className="w-full px-4 md:px-8">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Left side - Logo and back button */}
          <div className="flex items-center gap-3">
            {location.pathname !== '/' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
              >
                <Link
                  to="/"
                  className="flex items-center gap-2 text-amber-400 hover:text-amber-300 transition-all duration-300 group px-3 py-2 rounded-lg hover:bg-amber-500/10"
                  title="Grįžti į pradžią"
                >
                  <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span className="hidden sm:inline text-sm font-medium">Atgal</span>
                </Link>
              </motion.div>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              <motion.span
                className="text-2xl md:text-3xl"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                🔮
              </motion.span>
              <span className="font-cinzel font-bold text-lg md:text-xl text-white hidden sm:block group-hover:text-amber-200 transition-colors">
                Runų Būrimas
              </span>
            </Link>
          </div>

          {/* Center - Navigation */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-amber-300'
                      : 'text-gray-300 hover:text-amber-200'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-indicator"
                      className="absolute inset-0 bg-purple-900/40 border border-amber-600/30 rounded-lg"
                      initial={false}
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.label}</span>
                </Link>
              )
            })}

            {/* Premium Dropdown */}
            <div className="relative">
              <button
                onClick={() => setPremiumMenuOpen(!premiumMenuOpen)}
                onBlur={() => setTimeout(() => setPremiumMenuOpen(false), 150)}
                className={`relative px-4 py-2.5 rounded-lg text-base font-medium transition-all duration-300 flex items-center gap-2 ${
                  premiumLinks.some(l => location.pathname === l.path)
                    ? 'text-amber-300'
                    : 'text-amber-400 hover:text-amber-300'
                }`}
              >
                <Crown className="w-5 h-5" />
                <span>Premium</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${premiumMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {premiumMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-amber-600/30 rounded-xl shadow-xl overflow-hidden z-50"
                  >
                    {premiumLinks.map((link) => (
                      <Link
                        key={link.path}
                        to={link.path}
                        onClick={() => setPremiumMenuOpen(false)}
                        className={`flex items-center gap-3 px-5 py-3.5 text-base transition-all ${
                          location.pathname === link.path
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'text-gray-300 hover:bg-amber-500/10 hover:text-amber-200'
                        }`}
                      >
                        <span className="text-lg">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    ))}
                    <div className="border-t border-gray-700/50">
                      <Link
                        to="/premium"
                        onClick={() => setPremiumMenuOpen(false)}
                        className="flex items-center gap-3 px-5 py-3.5 text-base text-amber-400 hover:bg-amber-500/10 transition-all"
                      >
                        <Sparkles className="w-5 h-5" />
                        <span>Gauti Premium</span>
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </nav>

          {/* Right side - Auth */}
          <div className="flex items-center gap-3 mr-4">
            {user ? (
              <div className="hidden md:flex items-center gap-2">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300 group"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-700/50 border border-purple-500/30 flex items-center justify-center group-hover:border-amber-500/50 transition-colors">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="text-sm hidden lg:block">Profilis</span>
                </Link>
                <button
                  onClick={onSignOut}
                  className="flex items-center gap-2 p-2 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                  title="Atsijungti"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  to="/auth"
                  className="hidden md:flex items-center gap-2 bg-linear-to-r from-purple-700 to-violet-600 hover:from-purple-600 hover:to-violet-500 text-white font-medium py-2.5 px-5 rounded-xl transition-all duration-300 shadow-lg shadow-purple-900/30 border border-purple-400/20"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Prisijungti</span>
                </Link>
              </motion.div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-300"
            >
              <AnimatePresence mode="wait">
                {mobileMenuOpen ? (
                  <motion.div
                    key="close"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden overflow-hidden"
          >
            <div className="bg-gray-900/98 backdrop-blur-xl border-b border-amber-600/20">
              <nav className="px-4 py-6 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg font-medium transition-all duration-300 ${
                        location.pathname === link.path
                          ? 'bg-purple-900/50 text-amber-300 border border-amber-600/30 shadow-lg shadow-purple-900/20'
                          : 'text-gray-300 hover:text-amber-200 hover:bg-purple-900/30'
                      }`}
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span>{link.label}</span>
                    </Link>
                  </motion.div>
                ))}

                {/* Premium Section in Mobile */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className="pt-5 mt-5 border-t border-amber-600/30"
                >
                  <div className="flex items-center gap-3 px-5 mb-4">
                    <Crown className="w-6 h-6 text-amber-400" />
                    <span className="text-amber-400 font-semibold text-lg">Premium Būrimai</span>
                  </div>
                  {premiumLinks.map((link, index) => (
                    <motion.div
                      key={link.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.25 + index * 0.05 }}
                    >
                      <Link
                        to={link.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-4 px-5 py-4 rounded-xl text-lg font-medium transition-all duration-300 ${
                          location.pathname === link.path
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-600/30'
                            : 'text-gray-300 hover:text-amber-200 hover:bg-amber-500/10'
                        }`}
                      >
                        <span className="text-xl">{link.icon}</span>
                        <span>{link.label}</span>
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <Link
                      to="/premium"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-4 px-5 py-4 mt-2 rounded-xl text-lg text-amber-400 hover:bg-amber-500/10 transition-all"
                    >
                      <Sparkles className="w-6 h-6" />
                      <span className="font-semibold">Gauti Premium</span>
                    </Link>
                  </motion.div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="pt-5 mt-5 border-t border-gray-800"
                >
                  {user ? (
                    <div className="space-y-2">
                      <Link
                        to="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center gap-4 px-5 py-4 rounded-xl text-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-full bg-purple-700/50 border border-purple-500/30 flex items-center justify-center">
                          <User className="w-5 h-5" />
                        </div>
                        <span>Profilis</span>
                      </Link>
                      <button
                        onClick={() => {
                          onSignOut()
                          setMobileMenuOpen(false)
                        }}
                        className="flex items-center gap-4 w-full px-5 py-4 rounded-xl text-lg text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-800/50 flex items-center justify-center">
                          <LogOut className="w-5 h-5" />
                        </div>
                        <span>Atsijungti</span>
                      </button>
                    </div>
                  ) : (
                    <Link
                      to="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-3 w-full bg-linear-to-r from-purple-700 to-violet-600 text-white font-semibold text-lg py-5 px-5 rounded-xl border border-purple-400/20 shadow-lg shadow-purple-900/30"
                    >
                      <Sparkles className="w-6 h-6" />
                      <span>Prisijungti</span>
                    </Link>
                  )}
                </motion.div>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
