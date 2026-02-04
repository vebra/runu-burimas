import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Sparkles, BookOpen, Save, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usePremium } from '../hooks/usePremium'
import { useRunes, useDivinations } from '../hooks/useRunes'
import { Link } from 'react-router-dom'
import type { Rune } from '../types/database'
import { Button } from '../components/common/Button'
import { useToast } from '../components/common/Toast'
import { AIInterpretation } from '../components/common/AIInterpretation'
import { useAIInterpretation } from '../hooks/useAIInterpretation'
import { RuneCard } from '../components/common/RuneCard'
import { PremiumPaywall } from '../components/premium/PremiumPaywall'

type Position = 'present' | 'challenge' | 'past' | 'future' | 'above' | 'below' | 'advice' | 'external' | 'hopes' | 'outcome'

interface DrawnRune {
  rune: Rune
  position: Position
  orientation: 'upright' | 'reversed'
}

const positionLabels: Record<Position, { label: string; description: string; emoji: string }> = {
  present: { label: 'Dabartis', description: 'Situacija dabar', emoji: '🎯' },
  challenge: { label: 'Iššūkis', description: 'Kliūtis ar konfliktas', emoji: '⚔️' },
  past: { label: 'Praeitis', description: 'Įvykiai vedę į dabartį', emoji: '📜' },
  future: { label: 'Ateitis', description: 'Artimiausia ateitis', emoji: '🔮' },
  above: { label: 'Virš', description: 'Geriausias įmanomas rezultatas', emoji: '⭐' },
  below: { label: 'Po', description: 'Pasąmonė, paslėpti veiksniai', emoji: '🌙' },
  advice: { label: 'Patarimas', description: 'Kaip elgtis', emoji: '💡' },
  external: { label: 'Išoriniai veiksniai', description: 'Aplinka, kiti žmonės', emoji: '🌍' },
  hopes: { label: 'Viltys/Baimės', description: 'Vidiniai lūkesčiai', emoji: '💭' },
  outcome: { label: 'Rezultatas', description: 'Galutinis rezultatas', emoji: '🏆' },
}

export function CelticCross() {
  const { user } = useAuth()
  const { isPremium, loading: premiumLoading } = usePremium()
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

  const toast = useToast()

  const {
    interpretation,
    loading: aiLoading,
    error: aiError,
    getInterpretation,
    clearInterpretation
  } = useAIInterpretation()

  const handleRequestAIInterpretation = () => {
    const runeData = drawnRunes.map(r => ({
      name: r.rune.name,
      symbol: r.rune.symbol,
      meaning: r.rune.interpretation,
      reversed_meaning: r.rune.reversed_interpretation || undefined,
      orientation: r.orientation,
      position: `${positionLabels[r.position].emoji} ${positionLabels[r.position].label}`
    }))
    getInterpretation(runeData, 'celtic_cross', question || undefined)
  }

  useEffect(() => {
    if (drawnRunes.length === 10 && revealedPositions.size === 10) {
      setSpreadComplete(true)
      if (user) {
        saveDivinationToDb()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedPositions])

  const saveDivinationToDb = async () => {
    if (!user || drawnRunes.length !== 10) return

    setSaving(true)
    try {
      const result = await saveDivination(
        user.id,
        'celtic_cross',
        drawnRunes.map(d => ({
          rune_id: d.rune.id,
          position: d.position,
          orientation: d.orientation,
        })),
        question || null
      )
      if (result?.id) {
        setDivinationId(result.id)
        toast.success('Būrimas išsaugotas!')
      }
    } catch (error) {
      console.error('Error saving divination:', error)
      toast.error('Nepavyko išsaugoti būrimo')
    }
    setSaving(false)
  }

  const handleSaveNotes = async () => {
    if (!divinationId) return

    setSavingNotes(true)
    try {
      await updateDivinationNotes(divinationId, notes)
      toast.success('Dienoraštis išsaugotas!')
    } catch (error) {
      console.error('Error saving notes:', error)
      toast.error('Nepavyko išsaugoti dienoraščio')
    }
    setSavingNotes(false)
  }

  const handleDrawRunes = async () => {
    if (!user || runes.length === 0 || !question.trim()) return

    setIsDrawing(true)
    setRevealedPositions(new Set())
    setSpreadComplete(false)

    await new Promise(resolve => setTimeout(resolve, 3000))

    const positions: Position[] = ['present', 'challenge', 'past', 'future', 'above', 'below', 'advice', 'external', 'hopes', 'outcome']
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
    clearInterpretation()
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
            Norėdami atlikti Keltų Kryžiaus būrimą, turite prisijungti.
          </p>
          <Link
            to="/auth"
            className="bg-linear-to-r from-purple-800 via-purple-700 to-violet-600 hover:from-purple-700 hover:via-purple-600 hover:to-violet-500 text-amber-100 font-semibold py-4 px-8 text-lg rounded-lg transition-all duration-300 shadow-lg shadow-purple-900/30 border border-amber-600/20"
          >
            Prisijungti
          </Link>
        </div>
      </div>
    )
  }

  if (premiumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl text-amber-400"
        >
          🔮
        </motion.div>
      </div>
    )
  }

  if (!isPremium) {
    return (
      <PremiumPaywall
        title="Keltų Kryžius"
        description="10 runų Keltų Kryžius yra Premium funkcija, suteikianti išsamią situacijos analizę."
        features={[
          'Išsamus 10 runų būrimas',
          'Dabartis, praeitis ir ateitis',
          'Vidiniai ir išoriniai veiksniai',
          'Viltys, baimės ir galutinis rezultatas',
          'AI interpretacijos',
        ]}
      />
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
            ᛟ
          </motion.div>
          <p className="text-amber-300 text-lg">Kraunamos runos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div className="flex items-center justify-center gap-4">
            <motion.span
              className="text-4xl"
              animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              🔮
            </motion.span>
            <motion.h1
              className="text-4xl sm:text-5xl font-cinzel font-bold text-white tracking-wide uppercase"
              animate={{
                textShadow: [
                  "0 0 20px rgba(251, 191, 36, 0.3)",
                  "0 0 40px rgba(251, 191, 36, 0.6)",
                  "0 0 20px rgba(251, 191, 36, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Keltų Kryžius
            </motion.h1>
            <motion.span
              className="text-4xl"
              animate={{ y: [0, -8, 0], rotate: [0, -5, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
            >
              🔮
            </motion.span>
          </div>
          <p className="text-gray-300 text-lg sm:text-xl italic">
            Išsamus 10 runų būrimas giliai situacijos analizei
          </p>
          <p className="text-amber-300 text-base sm:text-lg">
            Praeitis, dabartis, ateitis + 7 papildomi aspektai
          </p>
        </motion.div>

        {drawnRunes.length === 0 && !isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex items-center justify-center"
          >
            <div className="max-w-2xl w-full">
              <div className="bg-gray-800/50 border-2 border-amber-500/30 rounded-xl shadow-lg" style={{ padding: '3rem', marginBottom: '3rem', boxShadow: '0 0 40px rgba(217, 119, 6, 0.3)' }}>
                <h2 className="text-3xl font-cinzel font-semibold text-amber-200" style={{ marginBottom: '2rem' }}>
                  Užduok Savo Klausimą
                </h2>
                <p className="text-gray-400 text-lg" style={{ marginBottom: '2rem' }}>
                  Keltų Kryžius atskleidžia visą situacijos paveikslą - nuo gilių pasąmonės veiksnių
                  iki galutinio rezultato. Suformuluok klausimą, kuris tau svarbus.
                </p>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Pvz.: Kokia yra mano karjeros ateitis ir ko turėčiau siekti?"
                  className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-colors resize-none text-xl"
                  rows={5}
                  style={{ marginBottom: '2rem', padding: '1.5rem' }}
                />
                <motion.div
                  whileHover={{ scale: question.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: question.trim() ? 0.95 : 1 }}
                >
                  <Button onClick={handleDrawRunes} disabled={!question.trim()} variant="gold" size="xl">
                    <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                    Traukti 10 Runų
                  </Button>
                </motion.div>
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
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotateY: [0, 180, 360],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.08,
                  }}
                  className="w-16 h-24 bg-linear-to-br from-amber-800 via-amber-700 to-orange-600 rounded-xl shadow-lg shadow-amber-900/40 border border-amber-500/30 -ml-3 first:ml-0"
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
            <p className="text-amber-300 animate-pulse mt-8 text-2xl font-semibold">Traukiamos 10 runų...</p>
          </motion.div>
        )}

        {drawnRunes.length > 0 && !isDrawing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Celtic Cross Layout */}
            <div className="flex flex-col lg:flex-row justify-center items-start gap-12 lg:gap-20 px-4" style={{ marginBottom: '5rem' }}>

              {/* Cross section (left side) - using CSS Grid */}
              <div className="grid gap-3" style={{
                gridTemplateColumns: 'auto auto auto',
                gridTemplateRows: 'auto auto auto',
                justifyItems: 'center',
                alignItems: 'center'
              }}>
                {/* Row 1: Above (center top) */}
                <div style={{ gridColumn: '2', gridRow: '1' }}>
                  {drawnRunes.find(r => r.position === 'above') && (
                    <RuneCard
                      rune={drawnRunes.find(r => r.position === 'above')!.rune}
                      orientation={drawnRunes.find(r => r.position === 'above')!.orientation}
                      revealed={revealedPositions.has('above')}
                      onReveal={() => revealRune('above')}
                      label={`${positionLabels.above.emoji} ${positionLabels.above.label}`}
                      size="sm"
                    />
                  )}
                </div>

                {/* Row 2: Past - Present/Challenge - Future */}
                <div style={{ gridColumn: '1', gridRow: '2' }}>
                  {drawnRunes.find(r => r.position === 'past') && (
                    <RuneCard
                      rune={drawnRunes.find(r => r.position === 'past')!.rune}
                      orientation={drawnRunes.find(r => r.position === 'past')!.orientation}
                      revealed={revealedPositions.has('past')}
                      onReveal={() => revealRune('past')}
                      label={`${positionLabels.past.emoji} ${positionLabels.past.label}`}
                      size="sm"
                    />
                  )}
                </div>

                {/* Center: Present + Challenge stacked */}
                <div style={{ gridColumn: '2', gridRow: '2' }} className="relative">
                  {/* Challenge card (behind, rotated) */}
                  {drawnRunes.find(r => r.position === 'challenge') && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(90deg)', zIndex: 1 }}>
                      <RuneCard
                        rune={drawnRunes.find(r => r.position === 'challenge')!.rune}
                        orientation={drawnRunes.find(r => r.position === 'challenge')!.orientation}
                        revealed={revealedPositions.has('challenge')}
                        onReveal={() => revealRune('challenge')}
                        size="sm"
                      />
                    </div>
                  )}
                  {/* Present card (front) */}
                  {drawnRunes.find(r => r.position === 'present') && (
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <RuneCard
                        rune={drawnRunes.find(r => r.position === 'present')!.rune}
                        orientation={drawnRunes.find(r => r.position === 'present')!.orientation}
                        revealed={revealedPositions.has('present')}
                        onReveal={() => revealRune('present')}
                        label={`${positionLabels.present.emoji} ${positionLabels.present.label}`}
                        size="sm"
                      />
                    </div>
                  )}
                  {/* Challenge label below */}
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                    <span className="text-xs text-amber-300">{positionLabels.challenge.emoji} {positionLabels.challenge.label}</span>
                  </div>
                </div>

                <div style={{ gridColumn: '3', gridRow: '2' }}>
                  {drawnRunes.find(r => r.position === 'future') && (
                    <RuneCard
                      rune={drawnRunes.find(r => r.position === 'future')!.rune}
                      orientation={drawnRunes.find(r => r.position === 'future')!.orientation}
                      revealed={revealedPositions.has('future')}
                      onReveal={() => revealRune('future')}
                      label={`${positionLabels.future.emoji} ${positionLabels.future.label}`}
                      size="sm"
                    />
                  )}
                </div>

                {/* Row 3: Below (center bottom) */}
                <div style={{ gridColumn: '2', gridRow: '3' }}>
                  {drawnRunes.find(r => r.position === 'below') && (
                    <RuneCard
                      rune={drawnRunes.find(r => r.position === 'below')!.rune}
                      orientation={drawnRunes.find(r => r.position === 'below')!.orientation}
                      revealed={revealedPositions.has('below')}
                      onReveal={() => revealRune('below')}
                      label={`${positionLabels.below.emoji} ${positionLabels.below.label}`}
                      size="sm"
                    />
                  )}
                </div>
              </div>

              {/* Staff section (right side - vertical column) */}
              <div className="flex flex-col gap-4">
                {(['outcome', 'hopes', 'external', 'advice'] as Position[]).map((pos) => {
                  const drawn = drawnRunes.find(r => r.position === pos)
                  if (!drawn) return null
                  return (
                    <RuneCard
                      key={pos}
                      rune={drawn.rune}
                      orientation={drawn.orientation}
                      revealed={revealedPositions.has(pos)}
                      onReveal={() => revealRune(pos)}
                      label={`${positionLabels[pos].emoji} ${positionLabels[pos].label}`}
                      size="sm"
                    />
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
                    className="bg-gray-800/50 border-2 border-amber-500/30 rounded-xl shadow-lg"
                    style={{ padding: '1.5rem', boxShadow: '0 0 25px rgba(217, 119, 6, 0.2)' }}
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
                          <span className="text-amber-400 text-sm font-semibold">
                            {positionLabels[drawn.position].emoji} {positionLabels[drawn.position].label}
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
                      Keltų Kryžiaus Sintezė
                    </h3>
                  </div>

                  {question && (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg mb-8" style={{ padding: '1.5rem' }}>
                      <p className="text-purple-300 text-lg font-semibold mb-2">Tavo klausimas:</p>
                      <p className="text-white italic text-xl">"{question}"</p>
                    </div>
                  )}

                  <div className="space-y-5 text-gray-200 text-lg leading-relaxed">
                    <p>
                      <strong className="text-amber-300">Dabartinė situacija</strong> atskleidžia <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'present')?.rune.name}</strong> energiją,
                      o <strong className="text-red-300">iššūkis</strong>, kurį reikia įveikti, yra <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'challenge')?.rune.name}</strong>.
                    </p>

                    <p>
                      <strong className="text-purple-300">Pasąmonėje</strong> slypi <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'below')?.rune.name}</strong>,
                      o <strong className="text-yellow-300">geriausias įmanomas rezultatas</strong> yra <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'above')?.rune.name}</strong>.
                    </p>

                    <p>
                      <strong className="text-blue-300">Praeitis</strong> suformavo pagrindą per <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'past')?.rune.name}</strong>,
                      o <strong className="text-green-300">artimiausia ateitis</strong> veda link <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'future')?.rune.name}</strong>.
                    </p>

                    <p>
                      <strong className="text-cyan-300">Patarimas</strong> - <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'advice')?.rune.name}</strong>.
                      <strong className="text-orange-300"> Išoriniai veiksniai</strong> pasirodo kaip <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'external')?.rune.name}</strong>.
                    </p>

                    <p>
                      Tavo <strong className="text-pink-300">viltys ir baimės</strong> atspindi <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'hopes')?.rune.name}</strong>,
                      o <strong className="text-amber-300">galutinis rezultatas</strong> yra <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'outcome')?.rune.name}</strong>.
                    </p>
                  </div>
                </div>

                {/* AI Interpretacija */}
                <AIInterpretation
                  interpretation={interpretation}
                  loading={aiLoading}
                  error={aiError}
                  onRequestInterpretation={handleRequestAIInterpretation}
                  onRetry={handleRequestAIInterpretation}
                />

                {/* Dienoraštis */}
                <div className="bg-gray-800/50 border-2 border-amber-600/30 rounded-xl shadow-lg" style={{ padding: '2rem', boxShadow: '0 0 30px rgba(217, 119, 6, 0.2)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <h3 className="text-xl font-cinzel font-semibold text-amber-200">
                      Dienoraštis
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm" style={{ marginBottom: '1rem' }}>
                    Užrašykite savo mintis, įžvalgas ar pastebėjimus apie šį išsamų būrimą.
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Kokias įžvalgas gavau iš šio Keltų Kryžiaus būrimo? Kaip tai atsiliepia mano situacijai?"
                    className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg p-6 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-colors resize-none text-xl shadow-lg"
                    style={{ height: '200px', boxShadow: '0 0 20px rgba(107, 114, 128, 0.2)' }}
                  />
                  <Button
                    onClick={handleSaveNotes}
                    disabled={!divinationId}
                    loading={savingNotes}
                    variant="secondary"
                    size="lg"
                    className="mt-6"
                  >
                    <Save className="w-5 h-5 md:w-6 md:h-6" />
                    Išsaugoti Dienoraštį
                  </Button>
                </div>

                <div className="flex justify-center pt-8">
                  <Button onClick={reset} variant="ghost" size="lg">
                    <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
                    Naujas būrimas
                  </Button>
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
