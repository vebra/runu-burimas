import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
import { AnimatedBackground } from './components/common/AnimatedBackground'
import { ToastProvider } from './components/common/Toast'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { CookieConsent } from './components/common/CookieConsent'
import { PageTransition } from './components/common/PageTransition'
import { useAuth, AuthProvider } from './hooks/useAuth'

// Lazy load pages for better performance
const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })))
const DailyRune = lazy(() => import('./pages/DailyRune').then(m => ({ default: m.DailyRune })))
const ThreeRune = lazy(() => import('./pages/ThreeRune').then(m => ({ default: m.ThreeRune })))
const FiveRuneCross = lazy(() => import('./pages/FiveRuneCross').then(m => ({ default: m.FiveRuneCross })))
const SevenRuneMap = lazy(() => import('./pages/SevenRuneMap').then(m => ({ default: m.SevenRuneMap })))
const RuneLibrary = lazy(() => import('./pages/RuneLibrary').then(m => ({ default: m.RuneLibrary })))
const RuneConverter = lazy(() => import('./pages/RuneConverter').then(m => ({ default: m.RuneConverter })))
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })))
const Auth = lazy(() => import('./pages/Auth').then(m => ({ default: m.Auth })))
const YesNoRune = lazy(() => import('./pages/YesNoRune').then(m => ({ default: m.YesNoRune })))
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy').then(m => ({ default: m.PrivacyPolicy })))
const TermsOfService = lazy(() => import('./pages/TermsOfService').then(m => ({ default: m.TermsOfService })))
const NotFound = lazy(() => import('./pages/NotFound').then(m => ({ default: m.NotFound })))
const Premium = lazy(() => import('./pages/Premium').then(m => ({ default: m.Premium })))
const CelticCross = lazy(() => import('./pages/CelticCross').then(m => ({ default: m.CelticCross })))
const LoveReading = lazy(() => import('./pages/LoveReading').then(m => ({ default: m.LoveReading })))

// Magical loading fallback component
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" role="status" aria-live="polite" aria-label="Kraunamas puslapis">
      <div className="flex flex-col items-center gap-6">
        {/* Animated rune circle */}
        <div className="relative w-24 h-24" aria-hidden="true">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-purple-500/30"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-2 rounded-full border-2 border-amber-500/40"
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute inset-4 rounded-full border border-purple-400/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          />
          <motion.span
            className="absolute inset-0 flex items-center justify-center text-4xl text-amber-400"
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.7, 1, 0.7],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            ᚱ
          </motion.span>
        </div>
        <motion.p
          className="text-purple-300 text-lg font-cinzel"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          Kraunamos runos...
        </motion.p>
      </div>
    </div>
  )
}

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageTransition><ErrorBoundary><Home /></ErrorBoundary></PageTransition>} />
        <Route path="/daily" element={<PageTransition><ErrorBoundary><DailyRune /></ErrorBoundary></PageTransition>} />
        <Route path="/three-rune" element={<PageTransition><ErrorBoundary><ThreeRune /></ErrorBoundary></PageTransition>} />
        <Route path="/five-rune-cross" element={<PageTransition><ErrorBoundary><FiveRuneCross /></ErrorBoundary></PageTransition>} />
        <Route path="/seven-rune-map" element={<PageTransition><ErrorBoundary><SevenRuneMap /></ErrorBoundary></PageTransition>} />
        <Route path="/library" element={<PageTransition><ErrorBoundary><RuneLibrary /></ErrorBoundary></PageTransition>} />
        <Route path="/converter" element={<PageTransition><ErrorBoundary><RuneConverter /></ErrorBoundary></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ErrorBoundary><Profile /></ErrorBoundary></PageTransition>} />
        <Route path="/auth" element={<PageTransition><ErrorBoundary><Auth /></ErrorBoundary></PageTransition>} />
        <Route path="/yes-no" element={<PageTransition><ErrorBoundary><YesNoRune /></ErrorBoundary></PageTransition>} />
        <Route path="/privacy" element={<PageTransition><ErrorBoundary><PrivacyPolicy /></ErrorBoundary></PageTransition>} />
        <Route path="/terms" element={<PageTransition><ErrorBoundary><TermsOfService /></ErrorBoundary></PageTransition>} />
        <Route path="/premium" element={<PageTransition><ErrorBoundary><Premium /></ErrorBoundary></PageTransition>} />
        <Route path="/celtic-cross" element={<PageTransition><ErrorBoundary><CelticCross /></ErrorBoundary></PageTransition>} />
        <Route path="/love-reading" element={<PageTransition><ErrorBoundary><LoveReading /></ErrorBoundary></PageTransition>} />
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  )
}

function AppContent() {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col relative">
      {/* Animated mystical background */}
      <AnimatedBackground />

      {/* Main content */}
      <div className="relative z-10 flex flex-col min-h-screen w-full">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:bg-amber-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm">
          Pereiti prie turinio
        </a>
        <Header user={user} onSignOut={signOut} />
        <main id="main-content" className="flex-1 pt-16 w-full">
          <Suspense fallback={<PageLoader />}>
            <AnimatedRoutes />
          </Suspense>
        </main>
        <Footer />
        <CookieConsent />
      </div>
    </div>
  )
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
