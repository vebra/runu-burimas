import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { User, LogOut, Calendar, Sparkles, Heart, Trophy } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useFavorites, useDivinations } from '../hooks/useRunes'
import { supabase } from '../lib/supabase'
import { Button } from '../components/common/Button'
import { useToast } from '../components/common/Toast'

interface Stats {
  totalDailyRunes: number
  totalDivinations: number
  currentStreak: number
}

export function Profile() {
  const { user, signOut } = useAuth()
  const { favorites, fetchFavorites } = useFavorites()
  const { divinations, fetchDivinations } = useDivinations()
  const navigate = useNavigate()
  const hasFetched = useRef(false)

  const [stats, setStats] = useState<Stats>({
    totalDailyRunes: 0,
    totalDivinations: 0,
    currentStreak: 0,
  })
  const [loading, setLoading] = useState(true)

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl text-purple-400"
          >
            ᚾ
          </motion.div>
          <p className="text-purple-300 text-lg">Kraunamas profilis...</p>
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

        {divinations.length > 0 && (
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
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button onClick={handleSignOut} variant="secondary" size="lg" className="w-full rounded-xl">
              <LogOut className="w-5 h-5" />
              Atsijungti
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
