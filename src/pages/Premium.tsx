import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Crown, Check, X, ArrowRight, Key, ChevronDown } from 'lucide-react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePremium } from '../hooks/usePremium'
import { useSEO } from '../hooks/useSEO'
import { useToast } from '../components/common/Toast'
import { PricingCard } from '../components/premium/PricingCard'

// Stripe Price IDs - these should match your Stripe dashboard
const STRIPE_PRICES = {
  monthly: import.meta.env.VITE_STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
  yearly: import.meta.env.VITE_STRIPE_YEARLY_PRICE_ID || 'price_yearly',
}

const freeFeatures = [
  { name: 'Kasdienė Runa', included: true },
  { name: 'Trys Runos (3 runų būrimas)', included: true },
  { name: 'Taip/Ne (1 runos būrimas)', included: true },
  { name: 'Runų Biblioteka', included: true },
  { name: 'Runų Konverteris', included: true },
  { name: '5 Runų Kryžius', included: false },
  { name: '7 Runų Gyvenimo Žemėlapis', included: false },
  { name: 'Meilės Būrimas (5 runų)', included: false },
  { name: 'Keltų Kryžius (10 runų)', included: false },
  { name: 'AI interpretacijos', included: false },
]

const premiumFeatures = [
  'Visi FREE funkcionalumai',
  '5 Runų Kryžius - situacijos analizė',
  '7 Runų Gyvenimo Žemėlapis - gilus kelias',
  'Meilės Būrimas - santykių įžvalgos',
  'Keltų Kryžius - išsamus 10 runų būrimas',
  'Rūnų Horoskopas - savaitinės ir mėnesinės prognozės',
  'Rūnų Dienoraštis - neriboti įrašai',
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
      navigate('/auth')
      return
    }

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
      <div
        className="px-4 sm:px-6 pt-8 md:pt-32 pb-32"
        style={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
            style={{ marginBottom: '3rem', marginTop: '2rem' }}
          >
            <div className="flex justify-center mb-4">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Crown className="w-16 h-16 text-amber-400" />
              </motion.div>
            </div>
            <h1 className="text-4xl font-cinzel font-bold text-white mb-4">
              Jūs esate Premium narys!
            </h1>
            <p className="text-gray-400 text-lg">
              Džiaukitės visomis Premium funkcijomis
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-gray-800/50 border-2 border-amber-500/40 rounded-2xl p-6"
            style={{ boxShadow: '0 0 40px rgba(217, 119, 6, 0.3)' }}
          >
            <h3 className="text-xl font-semibold text-amber-300 mb-4">Prenumeratos informacija</h3>

            <div className="space-y-3 text-gray-300">
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
              className="w-full mt-6 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all"
            >
              Valdyti prenumeratą
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 grid grid-cols-2 gap-4"
          >
            <Link
              to="/five-rune-cross"
              className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all text-center"
            >
              <span className="text-2xl mb-2 block">✨</span>
              <span className="text-white text-sm">5 Runų Kryžius</span>
            </Link>
            <Link
              to="/seven-rune-map"
              className="p-4 bg-purple-900/30 border border-purple-500/30 rounded-xl hover:border-purple-500/50 transition-all text-center"
            >
              <span className="text-2xl mb-2 block">🗺️</span>
              <span className="text-white text-sm">7 Runų Žemėlapis</span>
            </Link>
            <Link
              to="/love-reading"
              className="p-4 bg-pink-900/30 border border-pink-500/30 rounded-xl hover:border-pink-500/50 transition-all text-center"
            >
              <span className="text-2xl mb-2 block">💕</span>
              <span className="text-white text-sm">Meilės Būrimas</span>
            </Link>
            <Link
              to="/celtic-cross"
              className="p-4 bg-amber-900/30 border border-amber-500/30 rounded-xl hover:border-amber-500/50 transition-all text-center"
            >
              <span className="text-2xl mb-2 block">🔮</span>
              <span className="text-white text-sm">Keltų Kryžius</span>
            </Link>
          </motion.div>
        </div>
      </div>
    )
  }

  // Non-premium view - pricing page
  return (
    <div
      className="px-4 sm:px-6 pt-8 md:pt-32 pb-32"
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: '1100px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
          style={{ marginBottom: '4rem' }}
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <Crown className="w-14 h-14 text-amber-400" />
            <h1 className="text-5xl sm:text-6xl font-cinzel font-bold text-white tracking-wide">Premium</h1>
            <Crown className="w-14 h-14 text-amber-400" />
          </div>
          <p className="text-gray-300 text-xl sm:text-2xl max-w-2xl leading-relaxed text-center">
            Atrakinkite visas runų išminties paslaptis su Premium prenumerata
          </p>
        </motion.div>

        {/* Feature comparison */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 sm:p-8 lg:p-10"
          style={{ marginBottom: '4rem' }}
        >
          <h2 className="text-2xl sm:text-3xl font-cinzel font-semibold text-white text-center mb-8">
            Funkcijų palyginimas
          </h2>
          <div className="grid gap-3 sm:gap-4">
            {freeFeatures.map((feature, index) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between py-3 sm:py-4 px-4 sm:px-6 rounded-lg bg-gray-800/30"
              >
                <span className="text-gray-200 text-base sm:text-lg">{feature.name}</span>
                <div className="flex gap-6 sm:gap-10">
                  <span className="w-16 sm:w-20 text-center">
                    {feature.included ? (
                      <Check className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mx-auto" />
                    )}
                  </span>
                  <span className="w-16 sm:w-20 text-center">
                    <Check className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400 mx-auto" />
                  </span>
                </div>
              </motion.div>
            ))}
            <div className="flex items-center justify-end gap-6 sm:gap-10 mt-4 px-4 sm:px-6">
              <span className="w-16 sm:w-20 text-center text-gray-400 text-base sm:text-lg font-medium">Free</span>
              <span className="w-16 sm:w-20 text-center text-amber-400 text-base sm:text-lg font-semibold">Premium</span>
            </div>
          </div>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 gap-6 sm:gap-8" style={{ marginBottom: '5rem' }}>
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
            savings="Sutaupyk 33%"
            onSubscribe={handleSubscribe}
          />
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 sm:p-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-white text-center" style={{ marginBottom: '1rem' }}>
            Dažnai užduodami klausimai
          </h2>
          <div className="w-full h-0.5 bg-amber-500/30" style={{ marginBottom: '1.5rem' }}></div>
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="border-b border-gray-700/50 pb-6">
              <h3 className="text-amber-300 text-base sm:text-lg font-semibold mb-2">Kaip veikia prenumerata?</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Premium prenumerata suteikia prieigą prie visų išplėstinių būrimų ir AI interpretacijų.
                Mokėjimas apdorojamas per saugų Stripe mokėjimų tinklą.
              </p>
            </div>
            <div className="border-b border-gray-700/50 pb-6">
              <h3 className="text-amber-300 text-base sm:text-lg font-semibold mb-2">Ar galiu atšaukti bet kada?</h3>
              <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                Taip! Galite atšaukti prenumeratą bet kuriuo metu. Jūsų Premium prieiga išliks iki
                dabartinio mokėjimo periodo pabaigos.
              </p>
            </div>
            <div>
              <h3 className="text-amber-300 text-base sm:text-lg font-semibold mb-2">Kokie mokėjimo būdai priimami?</h3>
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
            style={{ marginTop: '2rem' }}
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
                className="mt-4 p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl"
              >
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleActivateCode()}
                    placeholder="Įveskite kodą..."
                    className="flex-1 bg-gray-900/50 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleActivateCode}
                    disabled={activating || !adminCode.trim()}
                    className="py-3 px-6 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
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
            className="text-center"
            style={{ marginTop: '3rem' }}
          >
            <p className="text-gray-300 text-lg sm:text-xl mb-5">
              Jau turite paskyrą?{' '}
              <Link to="/auth" className="text-amber-400 hover:text-amber-300 font-semibold">
                Prisijunkite
              </Link>{' '}
              ir prenumeruokite Premium
            </p>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-lg"
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
