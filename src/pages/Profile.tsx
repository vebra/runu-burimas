import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, LogOut, Calendar, Sparkles, Heart, Trophy, Trash2, AlertTriangle, Crown, Settings } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { usePremium } from '../hooks/usePremium'
import { useFavorites, useDivinations } from '../hooks/useRunes'
import { supabase } from '../lib/supabase'
import { Button } from '../components/common/Button'
import { useToast } from '../components/common/Toast'
import { ProfileStatsSkeleton, DivinationHistorySkeleton } from '../components/common/Skeleton'
import { EmptyDivinations } from '../components/common/EmptyState'

interface Stats {
  totalDailyRunes: number
  totalDivinations: number
  currentStreak: number
}

export function Profile() {
  const { user, signOut } = useAuth()
  const { isPremium, subscription, openCustomerPortal, loading: premiumLoading } = usePremium()
  const { favorites, fetchFavorites } = useFavorites()
  const { divinations, fetchDivinations } = useDivinations()
  const navigate = useNavigate()
  const hasFetched = useRef(false)
  const [portalLoading, setPortalLoading] = useState(false)

  const [stats, setStats] = useState<Stats>({
    totalDailyRunes: 0,
    totalDivinations: 0,
    currentStreak: 0,
  })
  const [loading, setLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!user || hasFetched.current) return
    hasFetched.current = true

    const loadData = async () => {
      setLoading(true)
      try {
        const { data: dailyRunes } = await supabase
          .from('daily_runes')
          .select('date')
          .eq('user_id', user.id)
          .order('date', { ascending: false })

        const { count: divinationCount } = await supabase
          .from('divinations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)

        let streak = 0
        if (dailyRunes && dailyRunes.length > 0) {
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          for (let i = 0; i < dailyRunes.length; i++) {
            const runeDate = new Date(dailyRunes[i].date)
            runeDate.setHours(0, 0, 0, 0)

            const expectedDate = new Date(today)
            expectedDate.setDate(today.getDate() - i)

            if (runeDate.getTime() === expectedDate.getTime()) {
              streak++
            } else {
              break
            }
          }
        }

        setStats({
          totalDailyRunes: dailyRunes?.length || 0,
          totalDivinations: divinationCount || 0,
          currentStreak: streak,
        })

        await Promise.all([
          fetchFavorites(user.id),
          fetchDivinations(user.id),
        ])
      } catch (error) {
        console.error('Error loading profile data:', error)
      }
      setLoading(false)
    }

    loadData()
  }, [user, fetchFavorites, fetchDivinations])

  const toast = useToast()

  const handleManageSubscription = async () => {
    setPortalLoading(true)
    try {
      const url = await openCustomerPortal()
      if (url) {
        window.location.href = url
      } else {
        toast.error('Nepavyko atidaryti prenumeratos valdymo')
      }
    } finally {
      setPortalLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.info('Atsijungta')
      navigate('/')
    } catch (error) {
      console.error('Error signing out:', error)
      toast.error('Klaida atsijungiant')
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'IŠTRINTI') return
    if (!user) return

    setDeleting(true)
    try {
      // Delete all user data from tables
      await supabase.from('daily_runes').delete().eq('user_id', user.id)
      await supabase.from('divinations').delete().eq('user_id', user.id)
      await supabase.from('user_favorite_runes').delete().eq('user_id', user.id)
      await supabase.from('subscriptions').delete().eq('user_id', user.id)

      // Sign out the user
      await signOut()

      toast.success('Paskyra ir visi duomenys ištrinti')
      navigate('/')
    } catch (error) {
      console.error('Error deleting account:', error)
      toast.error('Klaida ištrinant paskyrą')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="text-center" style={{ width: '100%', maxWidth: '448px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <span className="text-6xl block">🔐</span>
          <h2 className="text-2xl font-cinzel font-bold text-white">
            Prisijunkite
          </h2>
          <p className="text-gray-400">
            Norėdami matyti profilį, turite prisijungti.
          </p>
          <Link
            to="/auth"
            className="bg-linear-to-r from-purple-800 via-purple-700 to-violet-600 hover:from-purple-700 hover:via-purple-600 hover:to-violet-500 text-amber-100 font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-purple-900/30 border border-amber-600/20"
          >
            Prisijungti
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
        <div style={{ width: '100%', maxWidth: '672px' }}>
          {/* Profile header skeleton */}
          <div className="text-center mb-10 mt-8">
            <div className="w-20 h-20 bg-gray-800/50 rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-8 w-40 bg-gray-800/50 rounded mx-auto mb-2 animate-pulse" />
            <div className="h-4 w-48 bg-gray-800/50 rounded mx-auto animate-pulse" />
          </div>

          {/* Stats skeleton */}
          <div className="mb-10">
            <ProfileStatsSkeleton />
          </div>

          {/* Achievements skeleton */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6 mb-10">
            <div className="h-6 w-32 bg-gray-700/50 rounded mb-4 animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-gray-900/30 border border-gray-700 rounded-lg p-3">
                  <div className="h-8 w-8 bg-gray-700/50 rounded mx-auto mb-2 animate-pulse" />
                  <div className="h-4 w-20 bg-gray-700/50 rounded mx-auto mb-1 animate-pulse" />
                  <div className="h-3 w-24 bg-gray-700/50 rounded mx-auto animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* History skeleton */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
            <div className="h-6 w-40 bg-gray-700/50 rounded mb-4 animate-pulse" />
            <DivinationHistorySkeleton />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '672px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '2.5rem', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div className="w-20 h-20 bg-linear-to-r from-purple-800 via-purple-700 to-violet-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-900/40 border border-amber-600/30">
            <User className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-cinzel font-bold text-white">
            Jūsų Profilis
          </h1>
          <p className="text-gray-400">{user.email}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-3"
          style={{ gap: '1rem', marginBottom: '2.5rem' }}
        >
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center hover:border-amber-500/50 transition-colors cursor-pointer"
          >
            <Calendar className="w-6 h-6 text-amber-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalDailyRunes}</div>
            <div className="text-xs text-gray-500">Kasdienės runos</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center hover:border-purple-500/50 transition-colors cursor-pointer"
          >
            <Sparkles className="w-6 h-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{stats.totalDivinations}</div>
            <div className="text-xs text-gray-500">Būrimai</div>
          </motion.div>
          <motion.div 
            whileHover={{ scale: 1.05, y: -5 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 text-center hover:border-pink-500/50 transition-colors cursor-pointer"
          >
            <Heart className="w-6 h-6 text-pink-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-white">{favorites.length}</div>
            <div className="text-xs text-gray-500">Mėgstamos</div>
          </motion.div>
        </motion.div>

        {stats.currentStreak > 0 && (
          <div className="flex justify-center" style={{ marginBottom: '2.5rem' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ delay: 0.2 }}
            className="bg-linear-to-r from-amber-900/30 to-orange-900/30 border-2 border-amber-500/40 rounded-xl text-center shadow-lg cursor-pointer"
            style={{ padding: '1.5rem 1.25rem', maxWidth: '360px', boxShadow: '0 0 30px rgba(217, 119, 6, 0.3)' }}
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-3 block"
            >
              🔥
            </motion.span>
            <div className="text-4xl font-bold text-amber-400 mb-2">{stats.currentStreak} dienų</div>
            <div className="text-amber-300/70 text-lg">Kasdienių runų serija!</div>
          </motion.div>
          </div>
        )}

        {/* Subscription Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className={`border-2 rounded-xl ${
            isPremium
              ? 'bg-gradient-to-r from-amber-900/20 to-purple-900/20 border-amber-500/40'
              : 'bg-gray-800/50 border-gray-700'
          }`}
          style={{ padding: '1.5rem', marginBottom: '2.5rem', boxShadow: isPremium ? '0 0 30px rgba(217, 119, 6, 0.2)' : 'none' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Crown className={`w-6 h-6 ${isPremium ? 'text-amber-400' : 'text-gray-500'}`} />
              <h3 className="text-lg font-cinzel font-semibold text-white">
                {isPremium ? 'Premium Narystė' : 'Prenumerata'}
              </h3>
            </div>
            {isPremium && (
              <span className="bg-amber-500/20 text-amber-400 text-xs font-semibold px-3 py-1 rounded-full">
                AKTYVUS
              </span>
            )}
          </div>

          {premiumLoading ? (
            <div className="h-16 bg-gray-700/30 rounded animate-pulse" />
          ) : isPremium && subscription ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Planas:</span>
                <span className="text-white font-medium">
                  {subscription.plan_type === 'yearly' ? 'Metinis' : 'Mėnesinis'}
                </span>
              </div>
              {subscription.current_period_end && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Galioja iki:</span>
                  <span className="text-white">
                    {new Date(subscription.current_period_end).toLocaleDateString('lt-LT')}
                  </span>
                </div>
              )}
              {subscription.cancel_at_period_end && (
                <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-red-400 text-xs">
                    Prenumerata bus atšaukta periodo pabaigoje
                  </p>
                </div>
              )}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleManageSubscription}
                disabled={portalLoading}
                className="w-full mt-4 py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {portalLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <Settings className="w-4 h-4" />
                  </motion.div>
                ) : (
                  <Settings className="w-4 h-4" />
                )}
                Valdyti prenumeratą
              </motion.button>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-gray-400 text-sm mb-4">
                Atrakinkite visas Premium funkcijas ir būrimus
              </p>
              <Link
                to="/premium"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold py-3 px-6 rounded-lg transition-all shadow-lg"
              >
                <Crown className="w-5 h-5" />
                Gauti Premium
              </Link>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="bg-gray-800/50 border border-purple-500/30 rounded-xl"
          style={{ padding: '1.5rem', marginBottom: '2.5rem' }}
        >
          <h3 className="text-lg font-cinzel font-semibold text-white flex items-center gap-2" style={{ marginBottom: '1rem' }}>
            <Trophy className="w-5 h-5 text-amber-400" />
            Pasiekimai
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`${
                stats.totalDailyRunes >= 1
                  ? 'bg-amber-900/30 border-amber-500/40'
                  : 'bg-gray-900/30 border-gray-700'
              } border-2 rounded-lg p-3 text-center transition-all`}
            >
              <div className="text-3xl mb-1">{stats.totalDailyRunes >= 1 ? '🌟' : '🔒'}</div>
              <div className="text-sm font-semibold text-white">Pirmoji Runa</div>
              <div className="text-xs text-gray-400">Traukti 1 kasdienę runą</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`${
                stats.currentStreak >= 7
                  ? 'bg-amber-900/30 border-amber-500/40'
                  : 'bg-gray-900/30 border-gray-700'
              } border-2 rounded-lg p-3 text-center transition-all`}
            >
              <div className="text-3xl mb-1">{stats.currentStreak >= 7 ? '🔥' : '🔒'}</div>
              <div className="text-sm font-semibold text-white">Savaitės Serija</div>
              <div className="text-xs text-gray-400">7 dienų iš eilės</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`${
                stats.totalDivinations >= 5
                  ? 'bg-purple-900/30 border-purple-500/40'
                  : 'bg-gray-900/30 border-gray-700'
              } border-2 rounded-lg p-3 text-center transition-all`}
            >
              <div className="text-3xl mb-1">{stats.totalDivinations >= 5 ? '✨' : '🔒'}</div>
              <div className="text-sm font-semibold text-white">Būrėjas</div>
              <div className="text-xs text-gray-400">Atlikti 5 būrimus</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className={`${
                favorites.length >= 3
                  ? 'bg-pink-900/30 border-pink-500/40'
                  : 'bg-gray-900/30 border-gray-700'
              } border-2 rounded-lg p-3 text-center transition-all`}
            >
              <div className="text-3xl mb-1">{favorites.length >= 3 ? '💖' : '🔒'}</div>
              <div className="text-sm font-semibold text-white">Kolekcionierius</div>
              <div className="text-xs text-gray-400">3 mėgstamos runos</div>
            </motion.div>
          </div>
        </motion.div>

        {divinations.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl"
            style={{ padding: '1.5rem', marginBottom: '2.5rem' }}
          >
            <h3 className="text-lg font-cinzel font-semibold text-white" style={{ marginBottom: '1rem' }}>
              Paskutiniai Būrimai
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {divinations.slice(0, 5).map((div) => (
                <div
                  key={div.id}
                  className="flex items-center justify-between py-2 border-b border-gray-700 last:border-0"
                >
                  <div>
                    <span className="text-white">
                      {div.divination_type === 'three_rune' ? '3 Runų Būrimas' : div.divination_type}
                    </span>
                    {div.question && (
                      <p className="text-gray-500 text-sm truncate max-w-xs">
                        "{div.question}"
                      </p>
                    )}
                  </div>
                  <span className="text-gray-500 text-sm">
                    {new Date(div.created_at).toLocaleDateString('lt-LT')}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gray-800/50 border border-gray-700 rounded-xl"
            style={{ marginBottom: '2.5rem' }}
          >
            <EmptyDivinations />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleSignOut} variant="secondary" size="lg" className="w-full rounded-xl">
              <LogOut className="w-5 h-5" />
              Atsijungti
            </Button>
          </motion.div>

          {/* Danger Zone */}
          <div className="pt-8 border-t border-gray-800">
            <h3 className="text-red-400 font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Pavojinga zona
            </h3>
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="w-full py-3 px-4 bg-red-900/20 hover:bg-red-900/40 border border-red-500/30 hover:border-red-500/50 rounded-xl text-red-400 font-medium transition-all flex items-center justify-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
                Ištrinti paskyrą
              </button>
            </motion.div>
          </div>
        </motion.div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
                <h2 className="text-2xl font-cinzel font-bold text-white mb-2">
                  Ištrinti paskyrą?
                </h2>
                <p className="text-gray-400">
                  Šis veiksmas yra <strong className="text-red-400">negrįžtamas</strong>.
                  Bus ištrinta:
                </p>
              </div>

              <ul className="text-gray-400 text-sm space-y-2 mb-6">
                <li className="flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Visos kasdienės runos ({stats.totalDailyRunes})
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Visi būrimai ({stats.totalDivinations})
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Mėgstamos runos ({favorites.length})
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-red-400">•</span>
                  Jūsų paskyra ir el. paštas
                </li>
              </ul>

              <div className="mb-6">
                <label className="block text-sm text-gray-400 mb-2">
                  Įveskite <strong className="text-red-400">IŠTRINTI</strong> kad patvirtintumėte:
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500"
                  placeholder="IŠTRINTI"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeleteConfirmText('')
                  }}
                  className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-medium transition-colors"
                >
                  Atšaukti
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'IŠTRINTI' || deleting}
                  className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 disabled:bg-red-900/50 disabled:cursor-not-allowed border border-red-500 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {deleting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.div>
                      Trinama...
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-5 h-5" />
                      Ištrinti viską
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
