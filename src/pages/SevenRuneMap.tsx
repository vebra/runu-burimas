import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RotateCcw, Compass, BookOpen, Save, Loader2 } from 'lucide-react'
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

type Position = 'self' | 'foundation' | 'past' | 'future' | 'obstacles' | 'help' | 'outcome'

interface DrawnRune {
  rune: Rune
  position: Position
  orientation: 'upright' | 'reversed'
}

const positionLabels: Record<Position, { label: string; description: string; emoji: string }> = {
  self: { label: 'Tu Centre', description: 'Tavo dabartinė esmė ir vidinė būsena', emoji: '🧘' },
  foundation: { label: 'Pagrindas', description: 'Kas tave laiko ir palaiko', emoji: '🏛️' },
  past: { label: 'Praeitis', description: 'Kas formavo tavo kelią', emoji: '📜' },
  future: { label: 'Ateitis', description: 'Kur veda tavo kelias', emoji: '🌟' },
  obstacles: { label: 'Kliūtys', description: 'Kas reikalauja dėmesio ir augimo', emoji: '⚠️' },
  help: { label: 'Pagalba', description: 'Tavo stiprybės ir palaikymas', emoji: '🤝' },
  outcome: { label: 'Tikslas', description: 'Tavo aukščiausias potencialas', emoji: '🎯' },
}

export function SevenRuneMap() {
  usePageTitle('Septynių Runų Žemėlapis')
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
    getInterpretation(runeData, 'seven_rune', question || undefined)
  }

  useEffect(() => {
    if (drawnRunes.length === 7 && revealedPositions.size === 7) {
      setSpreadComplete(true)
      if (user) {
        saveDivinationToDb()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedPositions])

  const saveDivinationToDb = async () => {
    if (!user || drawnRunes.length !== 7) return

    setSaving(true)
    try {
      const result = await saveDivination(
        user.id,
        'seven_rune_map',
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

    await new Promise(resolve => setTimeout(resolve, 2500))

    const positions: Position[] = ['self', 'foundation', 'past', 'future', 'obstacles', 'help', 'outcome']
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
    return <AuthGate message="Norėdami atlikti 7 Runų Žemėlapio būrimą, turite prisijungti." />
  }

  if (premiumLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-6xl text-purple-400"
        >
          🗺️
        </motion.div>
      </div>
    )
  }

  if (!isPremium) {
    return (
      <PremiumPaywall
        title="7 Runų Gyvenimo Žemėlapis"
        description="7 Runų Gyvenimo Žemėlapis yra premium funkcija, skirta giliam dvasiniam augimui."
        features={[
          'Tu centre + 6 aspektai',
          'Pagrindas, praeitis, ateitis',
          'Kliūtys, pagalba, tikslas',
          'Gilus dvasinis kelias',
          'AI interpretacijos',
        ]}
      />
    )
  }

  if (runesLoading) {
    return <RuneLoader symbol="ᛁ" color="text-purple-400" />
  }

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '1152px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div className="flex items-center justify-center gap-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Compass className="w-10 h-10 text-purple-400" />
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl font-cinzel font-bold text-white tracking-wide uppercase"
              animate={{
                textShadow: [
                  "0 0 20px rgba(168, 85, 247, 0.3)",
                  "0 0 40px rgba(168, 85, 247, 0.6)",
                  "0 0 20px rgba(168, 85, 247, 0.3)"
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              7 Runų Gyvenimo Žemėlapis
            </motion.h1>
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            >
              <Compass className="w-10 h-10 text-purple-400" />
            </motion.div>
          </div>
          <p className="text-gray-300 text-lg sm:text-xl italic">
            Gilus dvasinis kelias su 7 aspektais
          </p>
          <p className="text-purple-300 text-base sm:text-lg">
            Tu centre + 6 aspektai (pagrindas, praeitis, ateitis, kliūtys, pagalba, tikslas)
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
                  Užduok Gyvenimo Klausimą
                </h2>
                <p className="text-gray-400 text-lg" style={{ marginBottom: '2rem' }}>
                  Suformuluok klausimą apie savo gyvenimo kelią, tikslą ar dvasinį augimą. 
                  7 Runų Gyvenimo Žemėlapis atskleis gilias įžvalgas apie tavo kelionę.
                </p>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Pvz.: Koks yra mano tikrasis kelias ir tikslas gyvenime?"
                  className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 transition-colors resize-none text-xl"
                  rows={5}
                  style={{ marginBottom: '2rem', padding: '1.5rem' }}
                />
                <motion.div
                  whileHover={{ scale: question.trim() ? 1.05 : 1 }}
                  whileTap={{ scale: question.trim() ? 0.95 : 1 }}
                >
                  <Button onClick={handleDrawRunes} disabled={!question.trim()} variant="gradient" size="xl">
                    <Compass className="w-6 h-6 md:w-7 md:h-7" />
                    Traukti 7 Runas
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
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
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
                  className="w-20 h-32 bg-linear-to-br from-purple-800 via-purple-700 to-pink-600 rounded-xl shadow-lg shadow-purple-900/40 border border-purple-500/30 -ml-3 first:ml-0"
                />
              ))}
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.4, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -top-12 text-5xl text-pink-400/40"
              >
                ᛚ
              </motion.div>
            </div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-purple-300 mt-8 text-lg font-medium"
            >
              Traukiamos runos...
            </motion.p>
          </motion.div>
        )}

        {drawnRunes.length > 0 && !isDrawing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Circular layout */}
            <div className="flex justify-center px-4" style={{ marginBottom: '5rem' }}>
            <div className="relative w-full max-w-[700px] aspect-square md:w-[700px] md:h-[700px]">
              {drawnRunes.map((drawn) => {
                const isRevealed = revealedPositions.has(drawn.position)
                const position = drawn.position

                let positionStyle: React.CSSProperties = {}

                if (position === 'self') {
                  positionStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
                } else {
                  const positions = ['foundation', 'past', 'future', 'obstacles', 'help', 'outcome']
                  const index = positions.indexOf(position)
                  const angle = (index * 60) - 90
                  // Use percentage-based radius for responsiveness (34% of container)
                  const radiusPercent = 34
                  const x = Math.cos(angle * Math.PI / 180) * radiusPercent
                  const y = Math.sin(angle * Math.PI / 180) * radiusPercent

                  positionStyle = {
                    top: `calc(50% + ${y}%)`,
                    left: `calc(50% + ${x}%)`,
                    transform: 'translate(-50%, -50%)',
                  }
                }

                const isCenterRune = position === 'self'

                return (
                  <div
                    key={position}
                    className="absolute"
                    style={positionStyle}
                  >
                    <RuneCard
                      rune={drawn.rune}
                      orientation={drawn.orientation}
                      revealed={isRevealed}
                      onReveal={() => revealRune(position)}
                      label={`${positionLabels[position].emoji} ${positionLabels[position].label}`}
                      size={isCenterRune ? 'md' : 'sm'}
                    />
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
                    className={`bg-gray-800/50 border-2 ${drawn.position === 'self' ? 'border-purple-500/40' : 'border-purple-500/30'} rounded-xl shadow-lg`}
                    style={{ padding: '1.5rem', boxShadow: drawn.position === 'self' ? '0 0 30px rgba(147, 51, 234, 0.3)' : '0 0 25px rgba(147, 51, 234, 0.2)' }}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`${drawn.position === 'self' ? 'text-5xl' : 'text-4xl'} text-amber-400`}
                        style={{
                          transform: drawn.orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                        }}
                      >
                        {drawn.rune.symbol}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                          <span className="text-purple-400 text-sm font-semibold">
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
                <div className="bg-linear-to-br from-purple-900/30 to-pink-900/20 border-2 border-purple-500/50 rounded-xl shadow-lg" style={{ padding: '1.5rem', boxShadow: '0 0 30px rgba(147, 51, 234, 0.3)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                    <Compass className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl font-cinzel font-bold text-purple-300">
                      Tavo Gyvenimo Kelias
                    </h3>
                  </div>

                  {question && (
                    <div className="bg-purple-900/40 border border-purple-500/40 rounded-lg" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
                      <p className="text-purple-300 text-xs font-semibold mb-1">Tavo klausimas:</p>
                      <p className="text-white italic text-sm">"{question}"</p>
                    </div>
                  )}

                  <div className="text-gray-200 text-sm leading-relaxed" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p>
                      <strong className="text-purple-300">Tavo esmė</strong> šiuo metu yra <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'self')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'self')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'self')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'self')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'self')?.rune.interpretation.toLowerCase()
                      } Tai yra tavo dabartinė vidinė būsena.
                    </p>

                    <p>
                      <strong className="text-amber-300">Pagrindas</strong>, ant kurio stovi, yra <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'foundation')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'foundation')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'foundation')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'foundation')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'foundation')?.rune.interpretation.toLowerCase()
                      } Tai tave palaiko ir duoda jėgų.
                    </p>

                    <p>
                      <strong className="text-blue-300">Praeitis</strong> atskleidžia <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'past')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'past')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'past')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'past')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'past')?.rune.interpretation.toLowerCase()
                      } Tai formavo tavo kelią iki šiol.
                    </p>

                    <p>
                      <strong className="text-red-300">Kliūtys</strong> pasirodo kaip <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'obstacles')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'obstacles')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'obstacles')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'obstacles')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'obstacles')?.rune.interpretation.toLowerCase()
                      } Tai yra tavo augimo galimybė.
                    </p>

                    <p>
                      <strong className="text-green-300">Pagalba</strong> ateina per <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'help')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'help')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'help')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'help')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'help')?.rune.interpretation.toLowerCase()
                      } Tai yra tavo stiprybė ir resursai.
                    </p>

                    <p>
                      <strong className="text-pink-300">Ateitis</strong> rodo <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'future')?.rune.name}</strong> energiją - {
                        drawnRunes.find(r => r.position === 'future')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'future')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'future')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'future')?.rune.interpretation.toLowerCase()
                      } Tai yra tavo kelias į priekį.
                    </p>

                    <p style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(147, 51, 234, 0.3)' }}>
                      <strong className="text-amber-300">Tavo tikslas</strong> yra <strong className="text-amber-300">{drawnRunes.find(r => r.position === 'outcome')?.rune.name}</strong> - {
                        drawnRunes.find(r => r.position === 'outcome')?.orientation === 'reversed' && drawnRunes.find(r => r.position === 'outcome')?.rune.reversed_interpretation
                          ? drawnRunes.find(r => r.position === 'outcome')?.rune.reversed_interpretation?.toLowerCase()
                          : drawnRunes.find(r => r.position === 'outcome')?.rune.interpretation.toLowerCase()
                      } Tai yra tavo aukščiausias potencialas ir siekis.
                    </p>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(147, 51, 234, 0.4)' }}>
                    <p className="text-purple-300 text-xs text-center italic font-medium">
                      💎💎 Tavo kelias yra unikalus. Pasitikėk procesu ir leisk runoms tave vesti. 💎💎
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
                    placeholder="Kaip šis būrimas atspindi mano gyvenimo kelią? Kokios įžvalgos kilo?"
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
