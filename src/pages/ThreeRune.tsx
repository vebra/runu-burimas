import { useState } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, RotateCcw, BookOpen, Save, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useRunes, useDivinations } from '../hooks/useRunes'
import { usePageTitle } from '../hooks/usePageTitle'
import type { Rune, RuneSpread } from '../types/database'
import { Button } from '../components/common/Button'
import { Textarea } from '../components/common/Input'
import { useToast } from '../components/common/Toast'
import { RuneCard } from '../components/common/RuneCard'
import { AuthGate } from '../components/common/AuthGate'
import { RuneLoader } from '../components/common/RuneLoader'

interface DrawnRune {
  rune: Rune
  orientation: 'upright' | 'reversed'
  revealed: boolean
  position: 'past' | 'present' | 'future'
}

const positionLabels = {
  past: { label: 'Praeitis', description: 'Kas įtakojo dabartinę situaciją' },
  present: { label: 'Dabartis', description: 'Dabartinė situacija ir iššūkiai' },
  future: { label: 'Ateitis', description: 'Galimas rezultatas ir patarimai' },
}

export function ThreeRune() {
  usePageTitle('Trijų Runų Būrimas')
  const { user } = useAuth()
  const { runes, loading: runesLoading, getRandomOrientation } = useRunes()
  const { saveThreeRuneSpread, updateDivinationNotes } = useDivinations()

  const [question, setQuestion] = useState('')
  const [drawnRunes, setDrawnRunes] = useState<DrawnRune[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const [spreadComplete, setSpreadComplete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [divinationId, setDivinationId] = useState<string | null>(null)

  const drawRunes = async () => {
    if (runes.length < 3) return

    setIsDrawing(true)
    setSpreadComplete(false)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const shuffled = [...runes].sort(() => Math.random() - 0.5)
    const positions: ('past' | 'present' | 'future')[] = ['past', 'present', 'future']

    const drawn: DrawnRune[] = positions.map((position, i) => ({
      rune: shuffled[i],
      orientation: getRandomOrientation(),
      revealed: false,
      position,
    }))

    setDrawnRunes(drawn)
    setIsDrawing(false)
  }

  const revealRune = (index: number) => {
    setDrawnRunes(prev =>
      prev.map((r, i) => (i === index ? { ...r, revealed: true } : r))
    )

    const allRevealed = drawnRunes.every((r, i) =>
      i === index ? true : r.revealed
    )
    if (allRevealed) {
      setSpreadComplete(true)
      saveSpread()
    }
  }

  const toast = useToast()

  const saveSpread = async () => {
    if (!user) return

    setSaving(true)
    try {
      const runeSpread: RuneSpread[] = drawnRunes.map(r => ({
        rune_id: r.rune.id,
        position: r.position,
        orientation: r.orientation,
      }))

      const result = await saveThreeRuneSpread(user.id, runeSpread, question || undefined)
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

  const reset = () => {
    setDrawnRunes([])
    setQuestion('')
    setSpreadComplete(false)
    setNotes('')
    setDivinationId(null)
  }

  if (!user) {
    return <AuthGate />
  }

  if (runesLoading) {
    return <RuneLoader symbol="ᚦ" color="text-purple-400" />
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
            Trijų Runų Išdėstymas
          </h1>
          <p className="text-gray-400 text-lg">
            Praeitis • Dabartis • Ateitis
          </p>
        </motion.div>

        {drawnRunes.length === 0 && !isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ maxWidth: '500px', margin: '0 auto' }}
          >
            <div className="mb-8">
              <Textarea
                label="Jūsų klausimas (neprivaloma)"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Apie ką norite sužinoti?"
                variant="glow"
                inputSize="lg"
                rows={5}
              />
            </div>

            <motion.div
              whileHover={{ scale: question.trim() ? 1.05 : 1 }}
              whileTap={{ scale: question.trim() ? 0.95 : 1 }}
            >
              <Button onClick={drawRunes} disabled={!question.trim()} size="xl">
                <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                Traukti Runas
              </Button>
            </motion.div>
          </motion.div>
        )}

        {isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center"
          >
            <div className="flex justify-center gap-6 relative">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{
                    rotateY: [0, 180, 360],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                  className="w-28 h-40 bg-linear-to-br from-purple-800 via-purple-700 to-violet-600 rounded-xl shadow-lg shadow-purple-900/40 border border-purple-500/30"
                />
              ))}
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -top-12 text-5xl text-amber-400/40"
              >
                ᛉ
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
            <div className="grid grid-cols-3 gap-4 md:gap-12 justify-items-center" style={{ marginBottom: '5rem' }}>
              {drawnRunes.map((drawn, index) => (
                <RuneCard
                  key={index}
                  rune={drawn.rune}
                  orientation={drawn.orientation}
                  revealed={drawn.revealed}
                  onReveal={() => revealRune(index)}
                  label={positionLabels[drawn.position].label}
                  size="md"
                />
              ))}
            </div>

            {spreadComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {drawnRunes.map((drawn, index) => (
                  <div
                    key={index}
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
                          <span className="text-purple-400 text-sm font-medium">
                            {positionLabels[drawn.position].label}
                          </span>
                          <span className="text-gray-600">•</span>
                          <span className="text-white font-cinzel font-semibold text-base">
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

                {/* Bendra interpretacija */}
                <div className="bg-linear-to-br from-amber-900/20 to-purple-900/20 border-2 border-amber-500/40 rounded-xl shadow-lg" style={{ padding: '2rem', boxShadow: '0 0 40px rgba(217, 119, 6, 0.3)' }}>
                  <div className="flex items-center gap-3 mb-6">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                    <h3 className="text-2xl font-cinzel font-bold text-amber-300">
                      Tavo Runų Pasakojimas
                    </h3>
                  </div>

                  {question && (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg mb-6" style={{ padding: '1rem' }}>
                      <p className="text-purple-300 text-sm font-semibold mb-1">Tavo klausimas:</p>
                      <p className="text-white italic text-base">"{question}"</p>
                    </div>
                  )}

                  <div className="space-y-4 text-gray-200 text-base leading-relaxed">
                    <p>
                      <strong className="text-purple-300">Praeityje</strong> dominavo <strong className="text-amber-300">{drawnRunes[0].rune.name}</strong> energija - {
                        drawnRunes[0].orientation === 'reversed' && drawnRunes[0].rune.reversed_interpretation
                          ? drawnRunes[0].rune.reversed_interpretation.toLowerCase()
                          : drawnRunes[0].rune.interpretation.toLowerCase()
                      } Tai suformavo pagrindą tam, kas vyksta dabar.
                    </p>

                    <p>
                      <strong className="text-pink-300">Šiuo metu</strong> tu esi <strong className="text-amber-300">{drawnRunes[1].rune.name}</strong> fazėje, kuri reiškia {
                        drawnRunes[1].orientation === 'reversed' && drawnRunes[1].rune.reversed_interpretation
                          ? drawnRunes[1].rune.reversed_interpretation.toLowerCase()
                          : drawnRunes[1].rune.interpretation.toLowerCase()
                      } Tai yra natūrali evoliucija iš to, kas buvo praeityje.
                    </p>

                    <p>
                      <strong className="text-amber-300">Žvelgiant į ateitį</strong>, runos rodo <strong className="text-amber-300">{drawnRunes[2].rune.name}</strong> energiją - {
                        drawnRunes[2].orientation === 'reversed' && drawnRunes[2].rune.reversed_interpretation
                          ? drawnRunes[2].rune.reversed_interpretation.toLowerCase()
                          : drawnRunes[2].rune.interpretation.toLowerCase()
                      } Tai yra tavo kelias, jei tęsi dabartinį kursą ir išmoksti pamokas, kurias gyvenimas tau teikia dabar.
                    </p>
                  </div>

                  <div className="mt-6 pt-6 border-t border-amber-500/30">
                    <p className="text-purple-300 text-sm text-center italic">
                      ✨ Atmink: runos rodo galimybes, ne lemtį. Tu kuri savo ateitį savo pasirinkimais. ✨
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
                    placeholder="Kaip šis būrimas atspindi mano situaciją? Kokios mintys kilo? Ką turiu daryti?"
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

                <div className="flex justify-center pt-6">
                  <Button onClick={reset} variant="ghost" size="lg">
                    <RotateCcw className="w-5 h-5 md:w-6 md:h-6" />
                    Naujas būrimas
                  </Button>
                </div>

                {saving && (
                  <p className="text-center text-gray-500 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
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
