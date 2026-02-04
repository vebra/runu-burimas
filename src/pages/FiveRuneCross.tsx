import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RotateCcw, Crown, BookOpen, Save, Loader2 } from 'lucide-react'
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
  usePageTitle('Penkių Runų Kryžius')
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
      position: positionLabels[r.position].label
    }))
    getInterpretation(runeData, 'five_rune', question || undefined)
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
    clearInterpretation()
  }

  if (!user) {
    return <AuthGate message="Norėdami atlikti 5 Runų Kryžiaus būrimą, turite prisijungti." />
  }

  if (premiumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl text-amber-400"
        >
          ✨
        </motion.div>
      </div>
    )
  }

  if (!isPremium) {
    return (
      <PremiumPaywall
        title="5 Runų Kryžius"
        description="5 Runų Kryžius yra premium funkcija, skirta gilesnei situacijos analizei."
        features={[
          'Neriboti 5 Runų Kryžiaus būrimai',
          'Centro runa + 4 aspektai',
          'Praeitis, ateitis, kliūtys, pagalba',
          'AI interpretacijos',
          'Pilna būrimų istorija',
        ]}
      />
    )
  }

  if (runesLoading) {
    return <RuneLoader symbol="ᚲ" />
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
              animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Crown className="w-10 h-10 text-amber-400" />
            </motion.div>
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
              5 Runų Kryžius
            </motion.h1>
            <motion.div
              animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <Crown className="w-10 h-10 text-amber-400" />
            </motion.div>
          </div>
          <p className="text-gray-300 text-lg sm:text-xl italic">
            Situacijos analizė su praktiniais veiksmais
          </p>
          <p className="text-purple-300 text-base sm:text-lg">
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
              <motion.div
                whileHover={{ scale: question.trim() ? 1.05 : 1 }}
                whileTap={{ scale: question.trim() ? 0.95 : 1 }}
              >
                <Button onClick={handleDrawRunes} disabled={!question.trim()} variant="gold" size="xl">
                  <Crown className="w-6 h-6 md:w-7 md:h-7" />
                  Traukti 5 Runas
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
            {/* Kryžiaus layout - Desktop */}
            <div className="hidden md:flex justify-center px-4" style={{ marginBottom: '5rem' }}>
              <div className="relative w-[600px] h-[600px]">
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
                      className="absolute"
                      style={positionStyles[position]}
                    >
                      <RuneCard
                        rune={drawn.rune}
                        orientation={drawn.orientation}
                        revealed={isRevealed}
                        onReveal={() => revealRune(position)}
                        label={positionLabels[position].label}
                        size="sm"
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Kryžiaus layout - Mobile (stacked) */}
            <div className="md:hidden flex flex-col items-center gap-3 px-4" style={{ marginBottom: '3rem' }}>
              {/* Viršus */}
              {drawnRunes.find(r => r.position === 'top') && (
                <RuneCard
                  rune={drawnRunes.find(r => r.position === 'top')!.rune}
                  orientation={drawnRunes.find(r => r.position === 'top')!.orientation}
                  revealed={revealedPositions.has('top')}
                  onReveal={() => revealRune('top')}
                  label={positionLabels.top.label}
                  size="sm"
                />
              )}
              {/* Kairė - Centras - Dešinė */}
              <div className="flex items-center justify-center gap-3">
                {drawnRunes.find(r => r.position === 'left') && (
                  <RuneCard
                    rune={drawnRunes.find(r => r.position === 'left')!.rune}
                    orientation={drawnRunes.find(r => r.position === 'left')!.orientation}
                    revealed={revealedPositions.has('left')}
                    onReveal={() => revealRune('left')}
                    label={positionLabels.left.label}
                    size="sm"
                  />
                )}
                {drawnRunes.find(r => r.position === 'center') && (
                  <RuneCard
                    rune={drawnRunes.find(r => r.position === 'center')!.rune}
                    orientation={drawnRunes.find(r => r.position === 'center')!.orientation}
                    revealed={revealedPositions.has('center')}
                    onReveal={() => revealRune('center')}
                    label={positionLabels.center.label}
                    size="sm"
                  />
                )}
                {drawnRunes.find(r => r.position === 'right') && (
                  <RuneCard
                    rune={drawnRunes.find(r => r.position === 'right')!.rune}
                    orientation={drawnRunes.find(r => r.position === 'right')!.orientation}
                    revealed={revealedPositions.has('right')}
                    onReveal={() => revealRune('right')}
                    label={positionLabels.right.label}
                    size="sm"
                  />
                )}
              </div>
              {/* Apačia */}
              {drawnRunes.find(r => r.position === 'bottom') && (
                <RuneCard
                  rune={drawnRunes.find(r => r.position === 'bottom')!.rune}
                  orientation={drawnRunes.find(r => r.position === 'bottom')!.orientation}
                  revealed={revealedPositions.has('bottom')}
                  onReveal={() => revealRune('bottom')}
                  label={positionLabels.bottom.label}
                  size="sm"
                />
              )}
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
                    Užrašykite savo mintis, įžvalgas ar pastebėjimus apie šį būrimą.
                  </p>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Kaip šis būrimas atspindi mano situaciją? Kokius veiksmus turiu atlikti?"
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
