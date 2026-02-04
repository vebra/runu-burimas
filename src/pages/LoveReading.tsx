import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Heart, BookOpen, Save, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { usePremium } from '../hooks/usePremium'
import { useRunes, useDivinations } from '../hooks/useRunes'
import { usePageTitle } from '../hooks/usePageTitle'
import type { Rune } from '../types/database'
import { Button } from '../components/common/Button'
import { useToast } from '../components/common/Toast'
import { AIInterpretation } from '../components/common/AIInterpretation'
import { useAIInterpretation } from '../hooks/useAIInterpretation'
import { RuneCard } from '../components/common/RuneCard'
import { AuthGate } from '../components/common/AuthGate'
import { RuneLoader } from '../components/common/RuneLoader'
import { PremiumPaywall } from '../components/premium/PremiumPaywall'

type Position = 'you' | 'partner' | 'foundation' | 'challenges' | 'potential'

interface DrawnRune {
  rune: Rune
  position: Position
  orientation: 'upright' | 'reversed'
}

const positionLabels: Record<Position, { label: string; description: string; emoji: string }> = {
  you: { label: 'Tu', description: 'Tavo energija santykiuose', emoji: '💜' },
  partner: { label: 'Partneris', description: 'Partnerio energija', emoji: '💙' },
  foundation: { label: 'Pagrindas', description: 'Kas jus jungia', emoji: '💕' },
  challenges: { label: 'Iššūkiai', description: 'Kliūtys santykiuose', emoji: '⚡' },
  potential: { label: 'Potencialas', description: 'Santykių ateitis', emoji: '✨' },
}

export function LoveReading() {
  usePageTitle('Meilės Būrimas')
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
    getInterpretation(runeData, 'love_reading', question || undefined)
  }

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
        'love_reading',
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
    } catch {
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
    } catch {
      toast.error('Nepavyko išsaugoti dienoraščio')
    }
    setSavingNotes(false)
  }

  const handleDrawRunes = async () => {
    if (!user || runes.length === 0 || !question.trim()) return

    setIsDrawing(true)
    setRevealedPositions(new Set())
    setSpreadComplete(false)

    await new Promise(resolve => setTimeout(resolve, 2000))

    const positions: Position[] = ['you', 'partner', 'foundation', 'challenges', 'potential']
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
    return <AuthGate message="Norėdami atlikti Meilės būrimą, turite prisijungti." />
  }

  if (premiumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl text-pink-400"
        >
          💕
        </motion.div>
      </div>
    )
  }

  if (!isPremium) {
    return (
      <PremiumPaywall
        title="Meilės Būrimas"
        description="5 runų Meilės Būrimas yra Premium funkcija, suteikianti įžvalgas apie santykius."
        features={[
          'Tavo ir partnerio energijos',
          'Santykių pagrindas ir ryšys',
          'Iššūkiai ir kliūtys',
          'Santykių potencialas ir ateitis',
          'AI interpretacijos',
        ]}
      />
    )
  }

  if (runesLoading) {
    return <RuneLoader symbol="ᚹ" color="text-pink-400" />
  }

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '1024px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div className="flex items-center justify-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <Heart className="w-10 h-10 text-pink-400 fill-pink-400/30" />
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl font-cinzel font-bold text-white tracking-wide uppercase"
              animate={{
                textShadow: [
                  "0 0 20px rgba(236, 72, 153, 0.3)",
                  "0 0 40px rgba(236, 72, 153, 0.6)",
                  "0 0 20px rgba(236, 72, 153, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              Meilės Būrimas
            </motion.h1>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
            >
              <Heart className="w-10 h-10 text-pink-400 fill-pink-400/30" />
            </motion.div>
          </div>
          <p className="text-gray-300 text-lg sm:text-xl italic">
            5 runų įžvalgos apie santykius ir meilę
          </p>
          <p className="text-pink-300 text-base sm:text-lg">
            Tu + Partneris + Pagrindas + Iššūkiai + Potencialas
          </p>
        </motion.div>

        {drawnRunes.length === 0 && !isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full flex items-center justify-center"
          >
            <div className="max-w-2xl w-full">
              <div className="bg-gray-800/50 border-2 border-pink-500/30 rounded-xl shadow-lg" style={{ padding: '3rem', marginBottom: '3rem', boxShadow: '0 0 40px rgba(236, 72, 153, 0.3)' }}>
                <h2 className="text-3xl font-cinzel font-semibold text-pink-200" style={{ marginBottom: '2rem' }}>
                  Užduok Klausimą Apie Meilę
                </h2>
                <p className="text-gray-400 text-lg" style={{ marginBottom: '2rem' }}>
                  Meilės Būrimas atskleidžia jūsų ir partnerio energijas, santykių pagrindą,
                  iššūkius ir potencialą. Gali klausti apie esamą ar būsimą partnerį.
                </p>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Pvz.: Kokia yra mano ir [vardas] santykių ateitis? Ar mes tinkami vienas kitam?"
                  className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition-colors resize-none text-xl"
                  rows={5}
                  style={{ marginBottom: '2rem', padding: '1.5rem' }}
                />
                <motion.div
                  whileHover={{ scale: question.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: question.trim() ? 0.95 : 1 }}
                >
                  <Button
                    onClick={handleDrawRunes}
                    disabled={!question.trim()}
                    variant="gradient"
                    size="xl"
                    className="!from-pink-600 !via-pink-500 !to-rose-600 hover:!from-pink-500 hover:!via-rose-500 hover:!to-pink-500"
                  >
                    <Heart className="w-6 h-6 md:w-7 md:h-7" />
                    Traukti 5 Meilės Runas
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
                  className="w-24 h-36 bg-linear-to-br from-pink-800 via-pink-700 to-rose-600 rounded-xl shadow-lg shadow-pink-900/40 border border-pink-500/30 -ml-4 first:ml-0"
                />
              ))}
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 text-5xl"
              >
                💕
              </motion.div>
            </div>
            <p className="text-pink-300 animate-pulse mt-8 text-2xl font-semibold">Traukiamos meilės runos...</p>
          </motion.div>
        )}

        {drawnRunes.length > 0 && !isDrawing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Heart-shaped layout */}
            <div className="flex justify-center px-4" style={{ marginBottom: '5rem' }}>
              <div className="relative w-full max-w-[600px] aspect-square md:w-[600px] md:h-[600px]">
                {drawnRunes.map((drawn) => {
                  const isRevealed = revealedPositions.has(drawn.position)
                  const position = drawn.position

                  // Heart-like arrangement
                  const positionStyles: Record<Position, React.CSSProperties> = {
                    you: { top: '25%', left: '15%', transform: 'translate(-50%, -50%)' },
                    partner: { top: '25%', right: '15%', transform: 'translate(50%, -50%)' },
                    foundation: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
                    challenges: { top: '75%', left: '25%', transform: 'translate(-50%, -50%)' },
                    potential: { top: '75%', right: '25%', transform: 'translate(50%, -50%)' },
                  }

                  return (
                    <div
                      key={position}
                      className="absolute"
                      style={positionStyles[position]}
                    >
                      <RuneCard
                        rune={drawn.rune}
                        orientation={drawn.orientation}
                        revealed={isRevealed}
                        onReveal={() => revealRune(position)}
                        label={`${positionLabels[position].emoji} ${positionLabels[position].label}`}
                        size="sm"
                      />
                    </div>
                  )
                })}

                {/* Decorative heart connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
                  <path
                    d="M 150 150 Q 300 50 450 150 Q 550 250 300 450 Q 50 250 150 150"
                    fill="none"
                    stroke="rgba(236, 72, 153, 0.4)"
                    strokeWidth="2"
                    strokeDasharray="10 5"
                  />
                </svg>
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
                    className="bg-gray-800/50 border-2 border-pink-500/30 rounded-xl shadow-lg"
                    style={{ padding: '1.5rem', boxShadow: '0 0 25px rgba(236, 72, 153, 0.2)' }}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className="text-4xl text-pink-400"
                        style={{
                          transform: drawn.orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                        }}
                      >
                        {drawn.rune.symbol}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                          <span className="text-pink-400 text-sm font-semibold">
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
                <div className="bg-linear-to-br from-pink-900/20 to-purple-900/20 border-2 border-pink-500/40 rounded-xl shadow-lg" style={{ padding: '3rem', boxShadow: '0 0 50px rgba(236, 72, 153, 0.4)' }}>
                  <div className="flex items-center gap-4 mb-8">
                    <Heart className="w-8 h-8 text-pink-400" />
                    <h3 className="text-3xl font-cinzel font-bold text-pink-300">
                      Meilės Istorija
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
                      <strong className="text-purple-300">Tu</strong> santykiuose atstovaujamas <strong className="text-pink-300">{drawnRunes.find(r => r.position === 'you')?.rune.name}</strong> energija - {
                        drawnRunes.find(r => r.position === 'you')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'you')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'you')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'you')?.rune.interpretation.toLowerCase()
                      }
                    </p>

                    <p>
                      <strong className="text-blue-300">Partneris</strong> atneša <strong className="text-pink-300">{drawnRunes.find(r => r.position === 'partner')?.rune.name}</strong> energiją - {
                        drawnRunes.find(r => r.position === 'partner')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'partner')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'partner')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'partner')?.rune.interpretation.toLowerCase()
                      }
                    </p>

                    <p>
                      <strong className="text-pink-300">Jūsų santykių pagrindas</strong> yra <strong className="text-pink-300">{drawnRunes.find(r => r.position === 'foundation')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'foundation')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'foundation')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'foundation')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'foundation')?.rune.interpretation.toLowerCase()
                      } Tai yra tai, kas jus jungia.
                    </p>

                    <p>
                      <strong className="text-yellow-300">Iššūkiai</strong> pasirodo kaip <strong className="text-pink-300">{drawnRunes.find(r => r.position === 'challenges')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'challenges')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'challenges')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'challenges')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'challenges')?.rune.interpretation.toLowerCase()
                      } Tai yra sritys, kuriose reikia augti kartu.
                    </p>

                    <p>
                      <strong className="text-green-300">Santykių potencialas</strong> atskleidžia <strong className="text-pink-300">{drawnRunes.find(r => r.position === 'potential')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'potential')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'potential')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'potential')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'potential')?.rune.interpretation.toLowerCase()
                      } Tai yra jūsų bendros ateities galimybės.
                    </p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-pink-500/30">
                    <p className="text-pink-300 text-lg text-center italic font-medium">
                      💕 Meilė yra kelionė, ne tikslas. Leiskite runoms vesti jus abiem. 💕
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
                <div className="bg-gray-800/50 border-2 border-pink-600/30 rounded-xl shadow-lg" style={{ padding: '2rem', boxShadow: '0 0 30px rgba(236, 72, 153, 0.2)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
                    <BookOpen className="w-5 h-5 text-pink-400" />
                    <h3 className="text-xl font-cinzel font-semibold text-pink-200">
                      Meilės Dienoraštis
                    </h3>
                  </div>
                  <p className="text-gray-400 text-sm" style={{ marginBottom: '1rem' }}>
                    Užrašykite savo mintis, jausmus ar įžvalgas apie šį meilės būrimą.
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Kaip šis būrimas atspindi mano santykius? Kokias įžvalgas gavau?"
                    className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg p-6 text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500/50 transition-colors resize-none text-xl shadow-lg"
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
