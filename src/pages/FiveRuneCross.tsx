import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, RotateCcw, Crown, BookOpen, Save } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useRunes, useDivinations } from '../hooks/useRunes'
import { Link } from 'react-router-dom'
import type { Rune } from '../types/database'

type Position = 'center' | 'top' | 'bottom' | 'left' | 'right'

interface DrawnRune {
  rune: Rune
  position: Position
  orientation: 'upright' | 'reversed'
}

const positionLabels: Record<Position, { label: string; description: string }> = {
  center: { label: '🎯 Dabartinė Situacija', description: 'Tai yra tavo dabartinė būsena ir pagrindinė energija' },
  top: { label: '🌟 Ateitis', description: 'Kur veda tavo kelias, jei tęsi dabartinį kursą' },
  bottom: { label: '📜 Praeitis', description: 'Kas įtakojo dabartinę situaciją' },
  left: { label: '⚠️ Kliūtys', description: 'Kas trukdo ar stabdo tavo pažangą' },
  right: { label: '🤝 Pagalba', description: 'Kas palaiko ir padeda tau' },
}

export function FiveRuneCross() {
  const { user } = useAuth()
  const { runes, loading: runesLoading, getRandomOrientation } = useRunes()
  const { saveDivination, updateDivinationNotes } = useDivinations()

  const [question, setQuestion] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnRunes, setDrawnRunes] = useState<DrawnRune[]>([])
  const [revealedPositions, setRevealedPositions] = useState<Set<Position>>(new Set())
  const [spreadComplete, setSpreadComplete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [divinationId, setDivinationId] = useState<string | null>(null)

  // Check if user has premium access (placeholder - will be replaced with real check)
  const hasPremium = true // TODO: Replace with actual premium check

  useEffect(() => {
    if (drawnRunes.length === 5 && revealedPositions.size === 5) {
      setSpreadComplete(true)
      if (user) {
        saveDivinationToDb()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedPositions])

  const saveDivinationToDb = async () => {
    if (!user || drawnRunes.length !== 5) return

    setSaving(true)
    try {
      const result = await saveDivination(
        user.id,
        'five_rune_cross',
        drawnRunes.map(d => ({
          rune_id: d.rune.id,
          position: d.position,
          orientation: d.orientation,
        })),
        question || null
      )
      if (result?.id) {
        setDivinationId(result.id)
      }
    } catch (error) {
      console.error('Error saving divination:', error)
    }
    setSaving(false)
  }

  const handleSaveNotes = async () => {
    if (!divinationId) return

    setSavingNotes(true)
    try {
      await updateDivinationNotes(divinationId, notes)
    } catch (error) {
      console.error('Error saving notes:', error)
    }
    setSavingNotes(false)
  }

  const handleDrawRunes = async () => {
    if (!user || runes.length === 0 || !question.trim()) return

    setIsDrawing(true)
    setRevealedPositions(new Set())
    setSpreadComplete(false)

    await new Promise(resolve => setTimeout(resolve, 2000))

    const positions: Position[] = ['center', 'top', 'bottom', 'left', 'right']
    const drawn: DrawnRune[] = []
    const usedIndices = new Set<number>()

    for (const position of positions) {
      let runeIndex: number
      do {
        runeIndex = Math.floor(Math.random() * runes.length)
      } while (usedIndices.has(runeIndex))

      usedIndices.add(runeIndex)
      drawn.push({
        rune: runes[runeIndex],
        position,
        orientation: getRandomOrientation(),
      })
    }

    setDrawnRunes(drawn)
    setIsDrawing(false)
  }

  const revealRune = (position: Position) => {
    setRevealedPositions(prev => new Set([...prev, position]))
  }

  const reset = () => {
    setQuestion('')
    setDrawnRunes([])
    setRevealedPositions(new Set())
    setSpreadComplete(false)
    setNotes('')
    setDivinationId(null)
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
            Norėdami atlikti 5 Runų Kryžiaus būrimą, turite prisijungti.
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

  if (!hasPremium) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="text-center" style={{ width: '100%', maxWidth: '448px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <Crown className="w-16 h-16 text-amber-400" />
          <h2 className="text-3xl font-cinzel font-bold text-white">
            Premium Funkcija
          </h2>
          <p className="text-gray-400 text-lg">
            5 Runų Kryžius yra premium funkcija, skirta gilesnei situacijos analizei.
          </p>
          <div className="bg-purple-900/30 border-2 border-amber-500/40 rounded-xl p-6 w-full">
            <h3 className="text-amber-300 font-semibold mb-3">Premium privalumai:</h3>
            <ul className="text-gray-300 text-left space-y-2">
              <li>✨ Neriboti 5 Runų Kryžiaus būrimai</li>
              <li>✨ Neriboti 7 Runų Gyvenimo žemėlapio būrimai</li>
              <li>✨ AI interpretacijos (greitai)</li>
              <li>✨ Pilna būrimų istorija</li>
              <li>✨ PDF eksportas</li>
            </ul>
          </div>
          <Link
            to="/premium"
            className="bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg inline-flex items-center gap-2"
          >
            <Crown className="w-5 h-5" />
            Gauti Premium
          </Link>
        </div>
      </div>
    )
  }

  if (runesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="text-6xl text-amber-400"
          >
            ᚲ
          </motion.div>
          <p className="text-amber-300 text-lg">Kraunamos runos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1024px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
        >
          <div className="flex items-center justify-center gap-4">
            <Crown className="w-10 h-10 text-amber-400" />
            <h1 className="text-5xl md:text-6xl font-cinzel font-bold text-white">
              5 Runų Kryžius
            </h1>
            <Crown className="w-10 h-10 text-amber-400" />
          </div>
          <p className="text-gray-400 text-xl">
            Situacijos analizė su praktiniais veiksmais
          </p>
          <p className="text-purple-300 text-lg">
            Centro runa + 4 aspektai (praeitis, ateitis, kliūtys, pagalba)
          </p>
        </motion.div>

        {drawnRunes.length === 0 && !isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex items-center justify-center"
          >
            <div className="max-w-2xl w-full">
            <div className="bg-gray-800/50 border-2 border-purple-500/30 rounded-xl shadow-lg" style={{ padding: '3rem', marginBottom: '3rem', boxShadow: '0 0 40px rgba(147, 51, 234, 0.3)' }}>
              <h2 className="text-3xl font-cinzel font-semibold text-amber-200" style={{ marginBottom: '2rem' }}>
                Užduok Klausimą
              </h2>
              <p className="text-gray-400 text-lg" style={{ marginBottom: '2rem' }}>
                Suformuluok savo klausimą apie situaciją, kurią nori išanalizuoti. 
                5 Runų Kryžius padės suprasti praeities įtaką, dabartines kliūtis ir galimybes.
              </p>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Pvz.: Kaip man geriau spręsti dabartinę situaciją darbe?"
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-colors resize-none text-xl"
                rows={5}
                style={{ marginBottom: '2rem', padding: '1.5rem' }}
              />
              <motion.button
                onClick={handleDrawRunes}
                disabled={!question.trim()}
                whileHover={{ scale: question.trim() ? 1.05 : 1 }}
                whileTap={{ scale: question.trim() ? 0.95 : 1 }}
                className="bg-linear-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 flex items-center gap-2 shadow-lg shadow-amber-900/30 border border-amber-400/20"
              >
                <Crown className="w-5 h-5" />
                Traukti 5 Runas
              </motion.button>
            </div>
            </div>
          </motion.div>
        )}

        {isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="flex justify-center relative">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotateY: [0, 180, 360],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                  className="w-24 h-36 bg-linear-to-br from-amber-800 via-amber-700 to-orange-600 rounded-xl shadow-lg shadow-amber-900/40 border border-amber-500/30 -ml-4 first:ml-0"
                />
              ))}
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.3, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -top-12 text-5xl text-amber-400/40"
              >
                ᛟ
              </motion.div>
            </div>
            <p className="text-amber-300 animate-pulse mt-8 text-2xl font-semibold">Traukiamos runos...</p>
          </motion.div>
        )}

        {drawnRunes.length > 0 && !isDrawing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Kryžiaus layout */}
            <div className="flex justify-center mb-12 px-4">
            <div className="relative w-full max-w-[600px] aspect-square md:w-[600px] md:h-[600px]">
              {drawnRunes.map((drawn) => {
                const isRevealed = revealedPositions.has(drawn.position)
                const position = drawn.position

                const positionStyles = {
                  center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
                  top: { top: '0%', left: '50%', transform: 'translate(-50%, 0)' },
                  bottom: { bottom: '0%', left: '50%', transform: 'translate(-50%, 0)' },
                  left: { top: '50%', left: '0%', transform: 'translate(0, -50%)' },
                  right: { top: '50%', right: '0%', transform: 'translate(0, -50%)' },
                }

                return (
                  <div
                    key={position}
                    className="absolute flex flex-col items-center"
                    style={positionStyles[position]}
                  >
                    <span className="text-xs sm:text-sm md:text-base text-purple-300 mb-2 sm:mb-3 font-semibold text-center max-w-20 sm:max-w-28 md:max-w-none">
                      {positionLabels[position].label}
                    </span>

                    <AnimatePresence mode="wait">
                      {!isRevealed ? (
                        <motion.button
                          key="hidden"
                          initial={{ rotateY: 0 }}
                          exit={{ rotateY: 90 }}
                          onClick={() => revealRune(position)}
                          className="w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 bg-linear-to-br from-gray-800 via-purple-950/30 to-gray-900 border-2 border-amber-600/50 rounded-xl flex flex-col items-center justify-center hover:border-amber-500 transition-colors cursor-pointer shadow-lg"
                          style={{ boxShadow: '0 0 25px rgba(217, 119, 6, 0.2)' }}
                          whileHover={{ scale: 1.05 }}
                        >
                          <span className="text-3xl sm:text-4xl md:text-5xl text-amber-500/50">?</span>
                          <span className="text-amber-300/50 text-sm mt-2">Paspausk</span>
                        </motion.button>
                      ) : (
                        <motion.div
                          key="revealed"
                          initial={{ rotateY: -90 }}
                          animate={{ rotateY: 0 }}
                          className="w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-40 bg-linear-to-br from-gray-800 via-purple-950/30 to-gray-900 border-2 border-amber-600/30 rounded-xl flex flex-col items-center justify-center shadow-lg"
                          style={{ boxShadow: '0 0 25px rgba(217, 119, 6, 0.2)' }}
                        >
                          <motion.span
                            className="text-4xl sm:text-5xl md:text-6xl text-amber-400 animate-glow"
                            style={{
                              transform: drawn.orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                            }}
                          >
                            {drawn.rune.symbol}
                          </motion.span>
                          <span className="text-white font-cinzel text-base mt-2 text-center px-2">
                            {drawn.rune.name}
                          </span>
                          {drawn.orientation === 'reversed' && (
                            <span className="text-sm text-red-400">(Apversta)</span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
            </div>

            {spreadComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* Individual interpretations */}
                {drawnRunes.map((drawn) => (
                  <div
                    key={drawn.position}
                    className="bg-gray-800/50 border-2 border-purple-500/30 rounded-xl shadow-lg"
                    style={{ padding: '1.5rem', boxShadow: '0 0 25px rgba(147, 51, 234, 0.2)' }}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className="text-4xl text-amber-400"
                        style={{
                          transform: drawn.orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                        }}
                      >
                        {drawn.rune.symbol}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                          <span className="text-purple-400 text-sm font-semibold">
                            {positionLabels[drawn.position].label}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="text-white font-cinzel font-bold text-base">
                            {drawn.rune.name}
                          </span>
                          {drawn.orientation === 'reversed' && (
                            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                              Apversta
                            </span>
                          )}
                        </div>
                        <p className="text-gray-500 text-xs" style={{ marginBottom: '0.75rem' }}>
                          {positionLabels[drawn.position].description}
                        </p>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          {drawn.orientation === 'reversed' && drawn.rune.reversed_interpretation
                            ? drawn.rune.reversed_interpretation
                            : drawn.rune.interpretation}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Overall interpretation */}
                <div className="bg-linear-to-br from-amber-900/20 to-purple-900/20 border-2 border-amber-500/40 rounded-xl shadow-lg" style={{ padding: '3rem', boxShadow: '0 0 50px rgba(217, 119, 6, 0.4)' }}>
                  <div className="flex items-center gap-4 mb-8">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                    <h3 className="text-3xl font-cinzel font-bold text-amber-300">
                      Situacijos Analizė
                    </h3>
                  </div>

                  {question && (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg mb-8" style={{ padding: '1.5rem' }}>
                      <p className="text-purple-300 text-lg font-semibold mb-2">Tavo klausimas:</p>
                      <p className="text-white italic text-xl">"{question}"</p>
                    </div>
                  )}

                  <div className="space-y-5 text-gray-200 text-xl leading-relaxed">
                    <p>
                      <strong className="text-amber-300">Dabartinė situacija</strong> yra <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'center')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'center')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'center')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'center')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'center')?.rune.interpretation.toLowerCase()
                      }
                    </p>

                    <p>
                      <strong className="text-purple-300">Praeitis</strong> atskleidžia <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'bottom')?.rune.name}</strong>, kuri rodo {
                        drawnRunes.find(r => r.position === 'bottom')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'bottom')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'bottom')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'bottom')?.rune.interpretation.toLowerCase()
                      } Tai suformavo pagrindą dabartinei situacijai.
                    </p>

                    <p>
                      <strong className="text-red-300">Kliūtys</strong> pasirodo kaip <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'left')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'left')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'left')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'left')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'left')?.rune.interpretation.toLowerCase()
                      } Tai yra tai, ką reikia įveikti ar priimti.
                    </p>

                    <p>
                      <strong className="text-green-300">Pagalba</strong> ateina per <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'right')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'right')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'right')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'right')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'right')?.rune.interpretation.toLowerCase()
                      } Tai yra tavo stiprybė ir palaikymas.
                    </p>

                    <p>
                      <strong className="text-amber-300">Ateitis</strong> rodo <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'top')?.rune.name}</strong> energiją - {
                        drawnRunes.find(r => r.position === 'top')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'top')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'top')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'top')?.rune.interpretation.toLowerCase()
                      } Tai yra tavo kelias, jei naudosi pagalba ir įveiksi kliūtis.
                    </p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-amber-500/30">
                    <p className="text-purple-300 text-lg text-center italic font-medium">
                      💎 Premium: Praktiniai veiksmai ir gilus įžvalgos laukia tavęs! 💎
                    </p>
                  </div>
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
                    Užrašykite savo mintis, įžvalgas ar pastebėjimus apie šį būrimą.
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Kaip šis būrimas atspindi mano situaciją? Kokius veiksmus turiu atlikti?"
                    className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg p-6 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-colors resize-none text-xl shadow-lg"
                    style={{ height: '200px', boxShadow: '0 0 20px rgba(107, 114, 128, 0.2)' }}
                  />
                  <button
                    onClick={handleSaveNotes}
                    disabled={savingNotes || !divinationId}
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

                <div className="flex justify-center" style={{ paddingTop: '2rem' }}>
                  <button
                    onClick={reset}
                    className="flex items-center gap-3 text-purple-400 hover:text-purple-300 transition-colors text-xl font-semibold"
                  >
                    <RotateCcw className="w-6 h-6" />
                    Naujas būrimas
                  </button>
                </div>

                {saving && (
                  <p className="text-center text-gray-500 text-lg">
                    <Loader2 className="w-5 h-5 animate-spin inline mr-2" />
                    Išsaugoma...
                  </p>
                )}
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
