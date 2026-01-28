import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Save, Loader2, BookOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useRunes, useDailyRune } from '../hooks/useRunes'
import { Link } from 'react-router-dom'
import type { Rune } from '../types/database'

export function DailyRune() {
  const { user } = useAuth()
  const { runes, loading: runesLoading, getRandomRune, getRandomOrientation } = useRunes()
  const { todayRune, loading: dailyLoading, fetchTodayRune, saveDailyRune, updateReflection, updateNotes } = useDailyRune()

  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnRune, setDrawnRune] = useState<Rune | null>(null)
  const [orientation, setOrientation] = useState<'upright' | 'reversed'>('upright')
  const [reflection, setReflection] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [savingNotes, setSavingNotes] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)

  useEffect(() => {
    if (user) {
      fetchTodayRune(user.id)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const displayedRune = (todayRune?.rune as Rune | undefined) || drawnRune
  const displayedOrientation = (todayRune?.orientation as 'upright' | 'reversed') || orientation
  const displayedReflection = todayRune?.reflection || reflection
  const displayedNotes = todayRune?.notes || notes

  const handleDrawRune = async () => {
    if (!user || runes.length === 0) return

    setIsDrawing(true)
    setIsRevealed(false)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const rune = getRandomRune()
    const orient = getRandomOrientation()

    if (rune) {
      try {
        await saveDailyRune(user.id, rune.id, orient)
        setDrawnRune(rune)
        setOrientation(orient)
      } catch (error) {
        console.error('Error saving daily rune:', error)
      }
    }

    setIsDrawing(false)
  }

  const handleSaveReflection = async () => {
    if (!todayRune) return

    setSaving(true)
    try {
      await updateReflection(todayRune.id, reflection)
    } catch (error) {
      console.error('Error saving reflection:', error)
    }
    setSaving(false)
  }

  const handleSaveNotes = async () => {
    if (!todayRune) return

    setSavingNotes(true)
    try {
      await updateNotes(todayRune.id, notes)
    } catch (error) {
      console.error('Error saving notes:', error)
    }
    setSavingNotes(false)
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
            Norėdami traukti kasdienę runą, turite prisijungti.
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

  if (runesLoading || dailyLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl text-amber-400"
          >
            ᚠ
          </motion.div>
          <p className="text-amber-300 text-lg">Kraunamos runos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '896px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
        >
          <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-white">
            Kasdienė Runa
          </h1>
          <p className="text-gray-400 text-lg">
            {new Date().toLocaleDateString('lt-LT', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </motion.div>

        {/* Traukimo mygtukas - kai nėra runos */}
        {!displayedRune && !isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <motion.button
              onClick={handleDrawRune}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-linear-to-r from-purple-800 via-purple-700 to-violet-600 hover:from-purple-700 hover:via-purple-600 hover:to-violet-500 text-amber-100 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg shadow-purple-900/30 border border-amber-600/20"
              style={{ padding: '1.25rem 2rem', fontSize: '1.25rem', boxShadow: '0 0 30px rgba(147, 51, 234, 0.3)' }}
            >
              <Sparkles className="w-7 h-7" />
              Traukti Runą
            </motion.button>
          </motion.div>
        )}

        {/* Traukimo animacija */}
        {isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="relative">
              <motion.div
                animate={{
                  rotateY: [0, 180, 360],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
                className="w-36 h-52 bg-linear-to-br from-purple-800 via-purple-700 to-violet-600 rounded-xl shadow-lg shadow-purple-900/40 border border-amber-500/30"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -top-8 -right-8 text-4xl text-amber-400/50"
              >
                ᚱ
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-8 -left-8 text-4xl text-purple-400/50"
              >
                ᛗ
              </motion.div>
            </div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-amber-300 mt-8 text-lg font-medium"
            >
              Traukiama runa...
            </motion.p>
          </motion.div>
        )}

        {/* Ištraukta runa */}
        {displayedRune && !isDrawing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex justify-center mb-12">
              <div className="flex flex-col items-center">
                <span className="text-base text-amber-400 mb-3 font-medium">
                  Šios dienos runa
                </span>

                <AnimatePresence mode="wait">
                  {!isRevealed ? (
                    <motion.button
                      key="hidden"
                      initial={{ rotateY: 0 }}
                      exit={{ rotateY: 90 }}
                      onClick={() => setIsRevealed(true)}
                      className="w-36 h-52 bg-linear-to-br from-gray-800 via-purple-950/30 to-gray-900 border-2 border-amber-600/50 rounded-xl flex flex-col items-center justify-center hover:border-amber-500 transition-colors cursor-pointer shadow-lg"
                      style={{ boxShadow: '0 0 25px rgba(217, 119, 6, 0.2)' }}
                    >
                      <span className="text-5xl text-amber-500/50">?</span>
                      <span className="text-amber-300/50 text-sm mt-3">Paspausk</span>
                    </motion.button>
                  ) : (
                    <motion.div
                      key="revealed"
                      initial={{ rotateY: -90 }}
                      animate={{ rotateY: 0 }}
                      className="w-36 h-52 bg-linear-to-br from-gray-800 via-purple-950/30 to-gray-900 border-2 border-amber-600/30 rounded-xl flex flex-col items-center justify-center shadow-lg"
                      style={{ boxShadow: '0 0 25px rgba(217, 119, 6, 0.2)' }}
                    >
                      <motion.span
                        className="text-6xl text-amber-400 animate-glow"
                        style={{
                          transform: displayedOrientation === 'reversed' ? 'rotate(180deg)' : 'none',
                        }}
                      >
                        {displayedRune.symbol}
                      </motion.span>
                      <span className="text-white font-cinzel text-base mt-3">
                        {displayedRune.name}
                      </span>
                      {displayedOrientation === 'reversed' && (
                        <span className="text-sm text-red-400">(Apversta)</span>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Interpretacija - tik kai atversta */}
            {isRevealed && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
              >
                {/* Runos interpretacija */}
                <div className="bg-gray-800/50 border-2 border-amber-600/30 rounded-xl shadow-lg" style={{ padding: '2rem', boxShadow: '0 0 30px rgba(217, 119, 6, 0.2)' }}>
                  <div className="flex items-start gap-6">
                    <span
                      className="text-5xl text-amber-400 drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]"
                      style={{
                        transform: displayedOrientation === 'reversed' ? 'rotate(180deg)' : 'none',
                      }}
                    >
                      {displayedRune.symbol}
                    </span>
                    <div className="flex-1">
                      <div className="flex items-center gap-3" style={{ marginBottom: '1rem' }}>
                        <span className="text-white font-cinzel font-semibold text-lg">
                          {displayedRune.name}
                        </span>
                        {displayedOrientation === 'reversed' && (
                          <span className="text-sm text-red-400 bg-red-500/10 px-3 py-1 rounded">
                            Apversta
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm" style={{ marginBottom: '1rem' }}>
                        {displayedRune.meaning}
                      </p>
                      <p className="text-gray-300 text-base leading-relaxed">
                        {displayedOrientation === 'reversed' && displayedRune.reversed_interpretation
                          ? displayedRune.reversed_interpretation
                          : displayedRune.interpretation}
                      </p>

                      {/* Raktažodžiai */}
                      <div className="flex flex-wrap gap-3" style={{ marginTop: '1.5rem' }}>
                        {displayedRune.keywords.map((keyword, i) => (
                          <span
                            key={i}
                            className="px-4 py-2 bg-purple-800/30 text-amber-300 text-base rounded-full border-2 border-amber-600/30 shadow-lg"
                            style={{ boxShadow: '0 0 15px rgba(217, 119, 6, 0.15)' }}
                          >
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Refleksija */}
                <div className="bg-gray-800/50 border-2 border-purple-500/30 rounded-xl shadow-lg" style={{ padding: '2rem', boxShadow: '0 0 30px rgba(147, 51, 234, 0.2)' }}>
                  <h3 className="text-xl font-cinzel font-semibold text-amber-200" style={{ marginBottom: '1.5rem' }}>
                    Jūsų Refleksija
                  </h3>
                  <textarea
                    value={displayedReflection || reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Užrašykite savo mintis apie šios dienos runą..."
                    className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg p-6 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-colors resize-none text-xl shadow-lg"
                    style={{ height: '150px', boxShadow: '0 0 20px rgba(107, 114, 128, 0.2)' }}
                  />
                  <button
                    onClick={handleSaveReflection}
                    disabled={saving}
                    className="bg-purple-700 hover:bg-purple-600 text-amber-100 font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 border-2 border-amber-600/30 shadow-lg"
                    style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem', boxShadow: '0 0 20px rgba(147, 51, 234, 0.2)' }}
                  >
                    {saving ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Išsaugoti
                  </button>
                </div>

                {/* Dienoraštis */}
                <div className="bg-gray-800/50 border-2 border-amber-600/30 rounded-xl shadow-lg" style={{ padding: '2rem', boxShadow: '0 0 30px rgba(217, 119, 6, 0.2)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xl font-cinzel font-semibold text-amber-200">
                      Dienoraštis
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm" style={{ marginBottom: '1rem' }}>
                    Užrašykite savo patirtis, įžvalgas ar pastebėjimus apie šią dieną.
                  </p>
                  <textarea
                    value={displayedNotes || notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ką šiandien patyriau? Kokios mintys kilo? Kaip runa atspindi mano dieną?"
                    className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg p-6 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-colors resize-none text-xl shadow-lg"
                    style={{ height: '200px', boxShadow: '0 0 20px rgba(107, 114, 128, 0.2)' }}
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes}
                    className="bg-amber-700 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 border-2 border-amber-600/30 shadow-lg"
                    style={{ marginTop: '1.5rem', padding: '0.75rem 1.5rem', fontSize: '1rem', boxShadow: '0 0 20px rgba(217, 119, 6, 0.2)' }}
                  >
                    {savingNotes ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Save className="w-5 h-5" />
                    )}
                    Išsaugoti Dienoraštį
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
