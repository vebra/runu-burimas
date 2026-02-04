import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, Save, BookOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useRunes, useDailyRune } from '../hooks/useRunes'
import type { Rune } from '../types/database'
import { Button } from '../components/common/Button'
import { useToast } from '../components/common/Toast'
import { RuneCard } from '../components/common/RuneCard'
import { RuneLoader } from '../components/common/RuneLoader'
import { usePageTitle } from '../hooks/usePageTitle'

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

  usePageTitle('Kasdienė Runa')


  useEffect(() => {
    if (user) {
      fetchTodayRune(user.id).then(() => {
        // Will be set below in todayRune effect
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Auto-reveal if rune was already drawn today
  useEffect(() => {
    if (todayRune) {
      setIsRevealed(true)
    }
  }, [todayRune])

  const displayedRune = (todayRune?.rune as Rune | undefined) || drawnRune
  const displayedOrientation = (todayRune?.orientation as 'upright' | 'reversed') || orientation
  const displayedReflection = todayRune?.reflection || reflection
  const displayedNotes = todayRune?.notes || notes

  const handleDrawRune = async () => {
    if (runes.length === 0) return

    setIsDrawing(true)
    setIsRevealed(false)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const rune = getRandomRune()
    const orient = getRandomOrientation()

    if (rune) {
      setDrawnRune(rune)
      setOrientation(orient)
      if (user) {
        try {
          await saveDailyRune(user.id, rune.id, orient)
        } catch {
          // Save silently fails for non-logged in
        }
      }
    }

    setIsDrawing(false)
  }

  const toast = useToast()

  const handleSaveReflection = async () => {
    if (!todayRune) return

    setSaving(true)
    try {
      await updateReflection(todayRune.id, reflection)
      toast.success('Refleksija išsaugota!')
    } catch {
      toast.error('Nepavyko išsaugoti refleksijos')
    }
    setSaving(false)
  }

  const handleSaveNotes = async () => {
    if (!todayRune) return

    setSavingNotes(true)
    try {
      await updateNotes(todayRune.id, notes)
      toast.success('Dienoraštis išsaugotas!')
    } catch {
      toast.error('Nepavyko išsaugoti dienoraščio')
    }
    setSavingNotes(false)
  }

  if (runesLoading || (user && dailyLoading)) {
    return <RuneLoader symbol="ᚠ" />
  }

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '896px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleDrawRune}
                size="xl"
                className="rounded-xl"
                style={{ boxShadow: '0 0 30px rgba(147, 51, 234, 0.3)' }}
              >
                <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                Traukti Runą
              </Button>
            </motion.div>
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
            <div className="flex justify-center" style={{ marginBottom: '5rem' }}>
              <RuneCard
                rune={displayedRune}
                orientation={displayedOrientation}
                revealed={isRevealed}
                onReveal={() => setIsRevealed(true)}
                label="Šios dienos runa"
                size="lg"
              />
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

                {/* Refleksija ir dienoraštis - tik prisijungusiems */}
                {user && (
                  <>
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
                      <Button
                        onClick={handleSaveReflection}
                        loading={saving}
                        size="lg"
                        className="mt-6"
                      >
                        <Save className="w-5 h-5 md:w-6 md:h-6" />
                        Išsaugoti
                      </Button>
                    </div>

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
                      <Button
                        onClick={handleSaveNotes}
                        loading={savingNotes}
                        variant="secondary"
                        size="lg"
                        className="mt-6"
                      >
                        <Save className="w-5 h-5 md:w-6 md:h-6" />
                        Išsaugoti Dienoraštį
                      </Button>
                    </div>
                  </>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
