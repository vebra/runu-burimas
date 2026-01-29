import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, RotateCcw, ThumbsUp, ThumbsDown, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useRunes } from '../hooks/useRunes'
import type { Rune } from '../types/database'
import { Button } from '../components/common/Button'

type Answer = 'yes' | 'no' | 'maybe'

interface DrawnResult {
  rune: Rune
  orientation: 'upright' | 'reversed'
  answer: Answer
}

// Runes that lean positive (yes) when upright
const POSITIVE_RUNES = ['Fehu', 'Wunjo', 'Gebo', 'Sowilo', 'Tiwaz', 'Berkano', 'Ehwaz', 'Mannaz', 'Dagaz', 'Othala']
// Runes that lean negative (no) when upright
const NEGATIVE_RUNES = ['Hagalaz', 'Nauthiz', 'Isa', 'Thurisaz']

function getAnswer(rune: Rune, orientation: 'upright' | 'reversed'): Answer {
  const isPositiveRune = POSITIVE_RUNES.includes(rune.name)
  const isNegativeRune = NEGATIVE_RUNES.includes(rune.name)
  const isUpright = orientation === 'upright'

  if (isPositiveRune) {
    return isUpright ? 'yes' : 'maybe'
  }
  if (isNegativeRune) {
    return isUpright ? 'no' : 'maybe'
  }
  // Neutral runes
  return isUpright ? 'maybe' : 'no'
}

function getAnswerConfig(answer: Answer) {
  switch (answer) {
    case 'yes':
      return {
        text: 'TAIP',
        color: 'text-green-400',
        bgColor: 'from-green-900/30 to-emerald-900/30',
        borderColor: 'border-green-500/50',
        icon: ThumbsUp,
        description: 'Runos rodo teigiamą energiją. Atsakymas linksta į TAIP.',
      }
    case 'no':
      return {
        text: 'NE',
        color: 'text-red-400',
        bgColor: 'from-red-900/30 to-rose-900/30',
        borderColor: 'border-red-500/50',
        icon: ThumbsDown,
        description: 'Runos rodo kliūtis ar iššūkius. Atsakymas linksta į NE.',
      }
    case 'maybe':
      return {
        text: 'GALBŪT',
        color: 'text-amber-400',
        bgColor: 'from-amber-900/30 to-yellow-900/30',
        borderColor: 'border-amber-500/50',
        icon: Minus,
        description: 'Situacija neaiški. Gali būti ir taip, ir ne - priklauso nuo tavo veiksmų.',
      }
  }
}

export function YesNoRune() {
  const { user } = useAuth()
  const { runes, loading: runesLoading, getRandomRune, getRandomOrientation } = useRunes()

  const [question, setQuestion] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [result, setResult] = useState<DrawnResult | null>(null)
  const [isRevealed, setIsRevealed] = useState(false)

  const handleDrawRune = async () => {
    if (runes.length === 0 || !question.trim()) return

    setIsDrawing(true)
    setIsRevealed(false)
    setResult(null)

    await new Promise(resolve => setTimeout(resolve, 1500))

    const rune = getRandomRune()
    const orientation = getRandomOrientation()

    if (rune) {
      const answer = getAnswer(rune, orientation)
      setResult({ rune, orientation, answer })
    }

    setIsDrawing(false)
  }

  const reset = () => {
    setQuestion('')
    setResult(null)
    setIsRevealed(false)
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
            ᚠ
          </motion.div>
          <p className="text-amber-300 text-lg">Kraunamos runos...</p>
        </div>
      </div>
    )
  }

  const answerConfig = result ? getAnswerConfig(result.answer) : null

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <motion.span
            className="text-6xl"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🎱
          </motion.span>
          <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-white">
            Taip ar Ne?
          </h1>
          <p className="text-gray-400 text-lg">
            Užduok klausimą ir gauk runų atsakymą
          </p>
        </motion.div>

        {/* Klausimo forma */}
        {!result && !isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-gray-800/50 border-2 border-purple-500/30 rounded-xl shadow-lg" style={{ padding: '2rem', marginBottom: '2rem', boxShadow: '0 0 30px rgba(147, 51, 234, 0.2)' }}>
              <label className="block text-lg font-medium text-amber-200 mb-4">
                Tavo klausimas
              </label>
              <p className="text-gray-400 text-sm mb-4">
                Suformuluok klausimą, į kurį galima atsakyti "taip" arba "ne"
              </p>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Pvz.: Ar turėčiau priimti šį pasiūlymą?"
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-colors resize-none text-lg"
                rows={3}
                style={{ padding: '1rem' }}
              />

              <motion.div
                whileHover={{ scale: question.trim() ? 1.03 : 1 }}
                whileTap={{ scale: question.trim() ? 0.97 : 1 }}
                className="mt-6"
              >
                <Button onClick={handleDrawRune} disabled={!question.trim()} size="lg" className="w-full rounded-xl">
                  <Sparkles className="w-5 h-5" />
                  Traukti Runą
                </Button>
              </motion.div>
            </div>

            {!user && (
              <p className="text-center text-gray-500 text-sm">
                <Link to="/auth" className="text-amber-400 hover:text-amber-300">Prisijunkite</Link>
                {' '}kad išsaugotumėte būrimus
              </p>
            )}
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
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                }}
                className="w-32 h-48 bg-linear-to-br from-purple-800 via-purple-700 to-violet-600 rounded-xl shadow-lg shadow-purple-900/50 border-2 border-amber-500/30"
                style={{ boxShadow: '0 0 40px rgba(147, 51, 234, 0.4)' }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute -top-6 -right-6 text-4xl text-amber-400/60"
              >
                ✨
              </motion.div>
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-6 -left-6 text-4xl text-purple-400/60"
              >
                ✨
              </motion.div>
            </div>
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="text-purple-300 mt-8 text-xl font-medium"
            >
              Runos atsako...
            </motion.p>
          </motion.div>
        )}

        {/* Rezultatas */}
        {result && !isDrawing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Klausimas */}
            <div className="bg-purple-900/30 border border-purple-500/30 rounded-xl mb-6" style={{ padding: '1rem' }}>
              <p className="text-purple-300 text-sm font-medium mb-1">Tavo klausimas:</p>
              <p className="text-white text-lg italic">"{question}"</p>
            </div>

            {/* Runa */}
            <div className="flex justify-center mb-8">
              <AnimatePresence mode="wait">
                {!isRevealed ? (
                  <motion.button
                    key="hidden"
                    initial={{ rotateY: 0 }}
                    exit={{ rotateY: 90 }}
                    onClick={() => setIsRevealed(true)}
                    className="w-32 h-48 bg-linear-to-br from-gray-800 via-purple-950/30 to-gray-900 border-2 border-amber-600/50 rounded-xl flex flex-col items-center justify-center hover:border-amber-500 transition-colors cursor-pointer shadow-lg"
                    style={{ boxShadow: '0 0 30px rgba(217, 119, 6, 0.3)' }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-5xl text-amber-500/50">?</span>
                    <span className="text-amber-300/50 text-sm mt-2">Paspausk</span>
                  </motion.button>
                ) : (
                  <motion.div
                    key="revealed"
                    initial={{ rotateY: -90 }}
                    animate={{ rotateY: 0 }}
                    className="w-32 h-48 bg-linear-to-br from-gray-800 via-purple-950/30 to-gray-900 border-2 border-amber-600/30 rounded-xl flex flex-col items-center justify-center shadow-lg"
                    style={{ boxShadow: '0 0 30px rgba(217, 119, 6, 0.3)' }}
                  >
                    <motion.span
                      className="text-6xl text-amber-400 animate-glow"
                      style={{
                        transform: result.orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                      }}
                    >
                      {result.rune.symbol}
                    </motion.span>
                    <span className="text-white font-cinzel text-base mt-2">
                      {result.rune.name}
                    </span>
                    {result.orientation === 'reversed' && (
                      <span className="text-sm text-red-400">(Apversta)</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Atsakymas - tik kai atversta */}
            {isRevealed && answerConfig && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
              >
                {/* Atsakymas */}
                <div
                  className={`bg-linear-to-br ${answerConfig.bgColor} border-2 ${answerConfig.borderColor} rounded-xl text-center`}
                  style={{ padding: '2rem', boxShadow: '0 0 40px rgba(147, 51, 234, 0.2)' }}
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <answerConfig.icon className={`w-10 h-10 ${answerConfig.color}`} />
                    <span className={`text-5xl font-cinzel font-bold ${answerConfig.color}`}>
                      {answerConfig.text}
                    </span>
                    <answerConfig.icon className={`w-10 h-10 ${answerConfig.color}`} />
                  </div>
                  <p className="text-gray-300 text-lg">
                    {answerConfig.description}
                  </p>
                </div>

                {/* Runos interpretacija */}
                <div className="bg-gray-800/50 border-2 border-amber-600/30 rounded-xl" style={{ padding: '1.5rem', boxShadow: '0 0 25px rgba(217, 119, 6, 0.2)' }}>
                  <div className="flex items-start gap-4">
                    <span
                      className="text-4xl text-amber-400"
                      style={{
                        transform: result.orientation === 'reversed' ? 'rotate(180deg)' : 'none',
                      }}
                    >
                      {result.rune.symbol}
                    </span>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-cinzel font-semibold text-lg">
                          {result.rune.name}
                        </span>
                        {result.orientation === 'reversed' && (
                          <span className="text-xs text-red-400 bg-red-500/10 px-2 py-0.5 rounded">
                            Apversta
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{result.rune.meaning}</p>
                      <p className="text-gray-300 text-base leading-relaxed">
                        {result.orientation === 'reversed' && result.rune.reversed_interpretation
                          ? result.rune.reversed_interpretation
                          : result.rune.interpretation}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patarimas */}
                <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl" style={{ padding: '1rem' }}>
                  <p className="text-purple-300 text-sm text-center">
                    💡 <strong>Atmink:</strong> Runos rodo tendencijas ir energijas, ne absoliutų likimą.
                    Galutinis sprendimas visada priklauso nuo tavęs.
                  </p>
                </div>

                {/* Naujas būrimas */}
                <div className="flex justify-center pt-4">
                  <Button onClick={reset} variant="ghost" size="md">
                    <RotateCcw className="w-5 h-5" />
                    Naujas klausimas
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
