import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Check, X, ArrowRight, Key, ChevronDown } from 'lucide-react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePremium } from '../hooks/usePremium'
import { useSEO } from '../hooks/useSEO'
import { useToast } from '../components/common/Toast'
import { PricingCard } from '../components/premium/PricingCard'
import { trackPremiumPageView, trackCheckoutStarted } from '../lib/analytics'

// Stripe Price IDs - these should match your Stripe dashboard
const STRIPE_PRICES = {
  monthly: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
  yearly: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || 'price_yearly',
}

const freeFeatures = [
  { name: 'Kasdienė Runa', included: true },
  { name: 'Trys Runos', included: true },
  { name: 'Taip/Ne Būrimas', included: true },
  { name: 'Runų Biblioteka', included: true },
  { name: 'Runų Konverteris', included: true },
  { name: '5 Runų Kryžius', included: false },
  { name: '7 Runų Žemėlapis', included: false },
  { name: 'Meilės Būrimas', included: false },
  { name: 'Keltų Kryžius', included: false },
  { name: 'AI Interpretacijos', included: false },
]

const premiumFeatures = [
  'Visi FREE funkcionalumai',
  '5 Runų Kryžius — situacijos analizė',
  '7 Runų Gyvenimo Žemėlapis',
  'Meilės Būrimas — santykių įžvalgos',
  'Keltų Kryžius — 10 runų būrimas',
  'Rūnų Horoskopas',
  'Rūnų Dienoraštis — neriboti įrašai',
  'AI interpretacijos kiekvienam būrimui',
  'Neribota būrimų istorija',
  'Prioritetinė pagalba',
]

export function Premium() {
  useSEO({
    title: 'Premium Narystė',
    description: 'Atrakinkite visas Runų Būrimo funkcijas — Keltų Kryžius, Meilės Būrimas, AI interpretacijos ir daugiau. Premium narystė nuo 2.99€/mėn.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: 'Runų Būrimas Premium',
      description: 'Premium narystė su visais būrimo metodais ir AI interpretacijomis.',
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'EUR',
        lowPrice: '2.99',
        highPrice: '24.99',
        offerCount: 2,
      },
    },
  })
  const { user } = useAuth()
  const { isPremium, subscription, createCheckout, openCustomerPortal, activateWithCode, verifySession, loading } = usePremium()
  const toast = useToast()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  // Admin code activation state
  const [showAdminCode, setShowAdminCode] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [activating, setActivating] = useState(false)

  useEffect(() => { trackPremiumPageView() }, [])

  // Handle checkout result - verify session with Stripe and activate subscription
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout')
    const sessionId = searchParams.get('session_id')

    if (checkoutStatus === 'success' && sessionId) {
      verifySession(sessionId).then((success) => {
        if (success) {
          toast.success('Sveikiname! Jūsų Premium prenumerata aktyvuota!')
        } else {
          toast.error('Nepavyko patvirtinti prenumeratos. Pabandykite atnaujinti puslapį.')
        }
        navigate('/premium', { replace: true })
      })
    } else if (checkoutStatus === 'success') {
      // Fallback if no session_id (old flow)
      toast.success('Mokėjimas sėkmingas! Prenumerata bus aktyvuota per kelias minutes.')
      navigate('/premium', { replace: true })
    } else if (checkoutStatus === 'canceled') {
      toast.info('Prenumerata atšaukta')
      navigate('/premium', { replace: true })
    }
  }, [searchParams, toast, navigate, verifySession])

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      toast.info('Prisijunkite, kad galėtumėte prenumeruoti')
      navigate('/prisijungti')
      return
    }

    trackCheckoutStarted(priceId.includes('yearly') ? 'yearly' : 'monthly')
    const url = await createCheckout(priceId)
    if (url) {
      window.location.href = url
    } else {
      toast.error('Nepavyko sukurti užsakymo. Bandykite dar kartą.')
    }
  }

  const handleManageSubscription = async () => {
    const url = await openCustomerPortal()
    if (url) {
      window.location.href = url
    } else {
      toast.error('Nepavyko atidaryti prenumeratos valdymo')
    }
  }

  const handleActivateCode = async () => {
    if (!adminCode.trim()) {
      toast.error('Įveskite kodą')
      return
    }

    setActivating(true)
    const success = await activateWithCode(adminCode.trim())
    setActivating(false)

    if (success) {
      toast.success('Premium aktyvuotas!')
      setAdminCode('')
      setShowAdminCode(false)
    } else {
      toast.error('Neteisingas kodas')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-6xl text-amber-400"
        >
          <Crown className="w-16 h-16" />
        </motion.div>
      </div>
    )
  }

  // If user already has premium, show management UI
  if (isPremium && subscription) {
    return (
      <div className="px-4 sm:px-6 pt-6 sm:pt-8 md:pt-32 pb-32 w-full flex flex-col items-center">
        <div className="w-full" style={{ maxWidth: '600px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-6 sm:mt-8 mb-8 sm:mb-12"
          >
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-12 h-12 sm:w-16 sm:h-16 text-amber-400" />
              </motion.div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-white mb-3">
              Jūs esate Premium narys!
            </h1>
            <p className="font-cormorant text-lg sm:text-xl text-gray-300 italic">
              Džiaukitės visomis Premium funkcijomis
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 border-2 border-amber-500/40 rounded-2xl p-5 sm:p-6"
            style={{ boxShadow: '0 0 40px rgba(217, 119, 6, 0.3)' }}
          >
            <h3 className="text-lg sm:text-xl font-cinzel font-semibold text-amber-300 mb-4">
              Prenumeratos informacija
            </h3>

            <div className="space-y-3 text-gray-300 text-sm sm:text-base">
              <div className="flex justify-between">
                <span>Planas:</span>
                <span className="text-white font-semibold">
                  {subscription.plan_type === 'yearly' ? 'Metinis' : 'Mėnesinis'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Būsena:</span>
                <span className="text-green-400 font-semibold">Aktyvus</span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between">
                  <span>Galioja iki:</span>
                  <span className="text-white">
                    {new Date(subscription.current_period_end).toLocaleDateString('lt-LT')}
                  </span>
                </div>
              )}
              {subscription.cancel_at_period_end && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-sm">
                    Prenumerata bus atšaukta periodo pabaigoje
                  </p>
                </div>
              )}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleManageSubscription}
              className="w-full mt-5 sm:mt-6 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all text-sm sm:text-base"
            >
              Valdyti prenumeratą
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4"
          >
            <Link
              to="/penkiu-runu-kryzius"
              className="p-3.5 sm:p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all text-center"
            >
              <span className="text-xl sm:text-2xl mb-1.5 sm:mb-2 block">✨</span>
              <span className="text-white text-xs sm:text-sm font-medium">5 Runų Kryžius</span>
            </Link>
            <Link
              to="/septiniu-runu-zemelapis"
              className="p-3.5 sm:p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all text-center"
            >
              <span className="text-xl sm:text-2xl mb-1.5 sm:mb-2 block">🗺️</span>
              <span className="text-white text-xs sm:text-sm font-medium">7 Runų Žemėlapis</span>
            </Link>
            <Link
              to="/meiles-skaitymas"
              className="p-3.5 sm:p-4 bg-pink-900/30 border border-pink-500/30 rounded-xl hover:border-pink-500/50 transition-all text-center"
            >
              <span className="text-xl sm:text-2xl mb-1.5 sm:mb-2 block">💕</span>
              <span className="text-white text-xs sm:text-sm font-medium">Meilės Būrimas</span>
            </Link>
            <Link
              to="/celtic-kryzius"
              className="p-3.5 sm:p-4 bg-amber-900/30 border border-amber-500/30 rounded-xl hover:border-amber-500/50 transition-all text-center"
            >
              <span className="text-xl sm:text-2xl mb-1.5 sm:mb-2 block">🔮</span>
              <span className="text-white text-xs sm:text-sm font-medium">Keltų Kryžius</span>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  // Non-premium view - pricing page
  return (
    <div className="px-4 sm:px-6 pt-6 sm:pt-8 md:pt-32 pb-32 w-full flex flex-col items-center">
      <div className="w-full" style={{ maxWidth: '1100px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8 sm:mb-12 md:mb-16"
        >
          {/* Mobile: smaller crown, stacked layout */}
          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-3 sm:mb-5">
            <Crown className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-amber-400" />
            <h1
              className="font-cinzel font-bold text-white tracking-wide text-gradient-gold"
              style={{ fontSize: 'clamp(1.75rem, 6vw, 3.75rem)' }}
            >
              Premium
            </h1>
            <Crown className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-amber-400" />
          </div>
          <p
            className="font-cormorant italic text-gray-300 max-w-2xl leading-relaxed text-center"
            style={{ fontSize: 'clamp(1.05rem, 3vw, 1.5rem)' }}
          >
            Atrakinkite visas runų išminties paslaptis su Premium prenumerata
          </p>
        </motion.div>

        {/* Feature comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4 sm:p-6 lg:p-10 mb-8 sm:mb-12 md:mb-16"
        >
          <h2
            className="font-cinzel font-semibold text-white text-center mb-5 sm:mb-8"
            style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.875rem)' }}
          >
            Funkcijų palyginimas
          </h2>

          {/* Column headers - mobile visible */}
          <div className="flex items-center justify-end gap-2 sm:gap-6 mb-3 px-2 sm:px-6">
            <span className="w-14 sm:w-20 text-center text-gray-400 text-xs sm:text-base font-semibold uppercase tracking-wider">Free</span>
            <span className="w-14 sm:w-20 text-center text-amber-400 text-xs sm:text-base font-semibold uppercase tracking-wider">Premium</span>
          </div>

          <div className="grid gap-1.5 sm:gap-3">
            {freeFeatures.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between py-2.5 sm:py-3.5 px-3 sm:px-6 rounded-lg bg-gray-800/30"
              >
                <span
                  className="text-gray-200 font-medium flex-1 pr-2"
                  style={{ fontSize: 'clamp(0.8rem, 2.5vw, 1.125rem)' }}
                >
                  {feature.name}
                </span>
                <div className="flex gap-2 sm:gap-6 shrink-0">
                  <span className="w-14 sm:w-20 flex justify-center">
                    {feature.included ? (
                      <Check className="w-4 h-4 sm:w-6 sm:h-6 text-green-400" />
                    ) : (
                      <X className="w-4 h-4 sm:w-6 sm:h-6 text-gray-600" />
                    )}
                  </span>
                  <span className="w-14 sm:w-20 flex justify-center">
                    <Check className="w-4 h-4 sm:w-6 sm:h-6 text-amber-400" />
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-5 sm:gap-8" style={{ marginBottom: '1.5cm' }}>
          <PricingCard
            name="Mėnesinis"
            price="€9.99"
            period="mėn"
            description="Idealus išbandymui"
            features={premiumFeatures}
            priceId={STRIPE_PRICES.monthly}
            onSubscribe={handleSubscribe}
          />
          <PricingCard
            name="Metinis"
            price="€79.99"
            period="metai"
            description="Geriausias pasiūlymas"
            features={premiumFeatures}
            priceId={STRIPE_PRICES.yearly}
            isPopular
            savings="−33%"
            onSubscribe={handleSubscribe}
          />
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-5 sm:p-8"
        >
          <h2
            className="font-cinzel font-bold text-white text-center mb-2"
            style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)' }}
          >
            Dažnai užduodami klausimai
          </h2>
          <div className="w-12 sm:w-16 h-0.5 bg-amber-500/40 mx-auto mb-5 sm:mb-6 rounded-full" />

          <div className="space-y-5 sm:space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-gray-700/50 pb-5 sm:pb-6">
              <h3
                className="text-amber-300 font-cinzel font-semibold mb-2"
                style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)' }}
              >
                Kaip veikia prenumerata?
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Premium prenumerata suteikia prieigą prie visų išplėstinių būrimų ir AI interpretacijų.
                Mokėjimas apdorojamas per saugų Stripe mokėjimų tinklą.
              </p>
            </div>
            <div className="border-b border-gray-700/50 pb-5 sm:pb-6">
              <h3
                className="text-amber-300 font-cinzel font-semibold mb-2"
                style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)' }}
              >
                Ar galiu atšaukti bet kada?
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Taip! Galite atšaukti prenumeratą bet kuriuo metu. Jūsų Premium prieiga išliks iki
                dabartinio mokėjimo periodo pabaigos.
              </p>
            </div>
            <div>
              <h3
                className="text-amber-300 font-cinzel font-semibold mb-2"
                style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)' }}
              >
                Kokie mokėjimo būdai priimami?
              </h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Priimame visas pagrindines kredito/debeto korteles (Visa, Mastercard, American Express)
                ir kai kurias vietines mokėjimo sistemas per Stripe.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Admin code activation - only for logged in users */}
        {user && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            style={{ marginTop: '1.5cm' }}
          >
            <button
              onClick={() => setShowAdminCode(!showAdminCode)}
              className="w-full flex items-center justify-center gap-2 text-gray-500 hover:text-gray-400 text-sm transition-colors py-2"
            >
              <Key className="w-4 h-4" />
              Turiu aktyvavimo kodą
              <ChevronDown className={`w-4 h-4 transition-transform ${showAdminCode ? 'rotate-180' : ''}`} />
            </button>

            {showAdminCode && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleActivateCode()}
                    placeholder="Įveskite kodą..."
                    className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 text-sm sm:text-base"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleActivateCode}
                    disabled={activating || !adminCode.trim()}
                    className="py-3 px-6 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    {activating ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Key className="w-4 h-4" />
                      </motion.div>
                    ) : (
                      <Key className="w-4 h-4" />
                    )}
                    Aktyvuoti
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* CTA for non-logged in users */}
        {!user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center mt-8 sm:mt-10"
          >
            <p className="text-gray-300 text-base sm:text-lg mb-4">
              Jau turite paskyrą?{' '}
              <Link to="/prisijungti" className="text-amber-400 hover:text-amber-300 font-semibold">
                Prisijunkite
              </Link>{' '}
              ir prenumeruokite Premium
            </p>
            <Link
              to="/prisijungti"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-base sm:text-lg"
            >
              Sukurti paskyrą <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        )}
      </div>
      {/* Spacer before footer */}
      <div style={{ height: '76px' }} />
    </div>
  )
}
