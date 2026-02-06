import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { usePremium } from '../hooks/usePremium'
import { usePageTitle } from '../hooks/usePageTitle'
import { useSpread, type PositionLabel } from '../hooks/useSpread'
import { RuneCard } from '../components/common/RuneCard'
import { AuthGate } from '../components/common/AuthGate'
import { RuneLoader } from '../components/common/RuneLoader'
import { PremiumPaywall } from '../components/premium/PremiumPaywall'
import {
  SpreadQuestionForm,
  SpreadDrawingAnimation,
  SpreadInterpretationCard,
  SpreadBottomSection,
  getRuneText,
} from '../components/spread/SpreadComponents'

type Position = 'present' | 'challenge' | 'past' | 'future' | 'above' | 'below' | 'advice' | 'external' | 'hopes' | 'outcome'

const positionLabels: Record<Position, PositionLabel> = {
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

const POSITIONS: Position[] = ['present', 'challenge', 'past', 'future', 'above', 'below', 'advice', 'external', 'hopes', 'outcome']

export function CelticCross() {
  usePageTitle('Keltų Kryžius')
  const { isPremium, loading: premiumLoading } = usePremium()

  const spread = useSpread<Position>({
    positions: POSITIONS,
    divinationType: 'celtic_cross',
    drawDelay: 3000,
  })

  if (!spread.user) {
    return <AuthGate message="Norėdami atlikti Keltų Kryžiaus būrimą, turite prisijungti." />
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

  if (spread.runesLoading) {
    return <RuneLoader symbol="ᛟ" />
  }

  const handleRequestAI = () => spread.requestAIInterpretation(positionLabels, 'celtic_cross')

  return (
    <div className="px-4 pt-8 md:pt-32 pb-24" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1200px' }}>
        {/* Header */}
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

        {/* Question Form */}
        {spread.drawnRunes.length === 0 && !spread.isDrawing && (
          <SpreadQuestionForm
            question={spread.question}
            onQuestionChange={spread.setQuestion}
            onDraw={spread.draw}
            title="Užduok Savo Klausimą"
            description="Keltų Kryžius atskleidžia visą situacijos paveikslą - nuo gilių pasąmonės veiksnių iki galutinio rezultato. Suformuluok klausimą, kuris tau svarbus."
            placeholder="Pvz.: Kokia yra mano karjeros ateitis ir ko turėčiau siekti?"
            buttonText="Traukti 10 Runų"
            buttonIcon={<Sparkles className="w-6 h-6 md:w-7 md:h-7" />}
            buttonVariant="gold"
            borderColor="border-amber-500/30"
            glowColor="rgba(217, 119, 6, 0.3)"
          />
        )}

        {/* Drawing Animation */}
        {spread.isDrawing && (
          <SpreadDrawingAnimation
            count={10}
            cardColors="from-amber-800 via-amber-700 to-orange-600"
            emoji="ᛟ"
            text="Traukiamos 10 runų..."
          />
        )}

        {/* Drawn Runes */}
        {spread.drawnRunes.length > 0 && !spread.isDrawing && (
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
                  {spread.drawnRunes.find(r => r.position === 'above') && (
                    <RuneCard
                      rune={spread.drawnRunes.find(r => r.position === 'above')!.rune}
                      orientation={spread.drawnRunes.find(r => r.position === 'above')!.orientation}
                      revealed={spread.revealedPositions.has('above')}
                      onReveal={() => spread.revealRune('above')}
                      label={`${positionLabels.above.emoji} ${positionLabels.above.label}`}
                      size="sm"
                    />
                  )}
                </div>

                {/* Row 2: Past - Present/Challenge - Future */}
                <div style={{ gridColumn: '1', gridRow: '2' }}>
                  {spread.drawnRunes.find(r => r.position === 'past') && (
                    <RuneCard
                      rune={spread.drawnRunes.find(r => r.position === 'past')!.rune}
                      orientation={spread.drawnRunes.find(r => r.position === 'past')!.orientation}
                      revealed={spread.revealedPositions.has('past')}
                      onReveal={() => spread.revealRune('past')}
                      label={`${positionLabels.past.emoji} ${positionLabels.past.label}`}
                      size="sm"
                    />
                  )}
                </div>

                {/* Center: Present + Challenge stacked */}
                <div style={{ gridColumn: '2', gridRow: '2' }} className="relative">
                  {/* Challenge card (behind, rotated) */}
                  {spread.drawnRunes.find(r => r.position === 'challenge') && (
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(90deg)', zIndex: 1 }}>
                      <RuneCard
                        rune={spread.drawnRunes.find(r => r.position === 'challenge')!.rune}
                        orientation={spread.drawnRunes.find(r => r.position === 'challenge')!.orientation}
                        revealed={spread.revealedPositions.has('challenge')}
                        onReveal={() => spread.revealRune('challenge')}
                        size="sm"
                      />
                    </div>
                  )}
                  {/* Present card (front) */}
                  {spread.drawnRunes.find(r => r.position === 'present') && (
                    <div style={{ position: 'relative', zIndex: 2 }}>
                      <RuneCard
                        rune={spread.drawnRunes.find(r => r.position === 'present')!.rune}
                        orientation={spread.drawnRunes.find(r => r.position === 'present')!.orientation}
                        revealed={spread.revealedPositions.has('present')}
                        onReveal={() => spread.revealRune('present')}
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
                  {spread.drawnRunes.find(r => r.position === 'future') && (
                    <RuneCard
                      rune={spread.drawnRunes.find(r => r.position === 'future')!.rune}
                      orientation={spread.drawnRunes.find(r => r.position === 'future')!.orientation}
                      revealed={spread.revealedPositions.has('future')}
                      onReveal={() => spread.revealRune('future')}
                      label={`${positionLabels.future.emoji} ${positionLabels.future.label}`}
                      size="sm"
                    />
                  )}
                </div>

                {/* Row 3: Below (center bottom) */}
                <div style={{ gridColumn: '2', gridRow: '3' }}>
                  {spread.drawnRunes.find(r => r.position === 'below') && (
                    <RuneCard
                      rune={spread.drawnRunes.find(r => r.position === 'below')!.rune}
                      orientation={spread.drawnRunes.find(r => r.position === 'below')!.orientation}
                      revealed={spread.revealedPositions.has('below')}
                      onReveal={() => spread.revealRune('below')}
                      label={`${positionLabels.below.emoji} ${positionLabels.below.label}`}
                      size="sm"
                    />
                  )}
                </div>
              </div>

              {/* Staff section (right side - vertical column) */}
              <div className="flex flex-col gap-4">
                {(['outcome', 'hopes', 'external', 'advice'] as Position[]).map((pos) => {
                  const drawn = spread.drawnRunes.find(r => r.position === pos)
                  if (!drawn) return null
                  return (
                    <RuneCard
                      key={pos}
                      rune={drawn.rune}
                      orientation={drawn.orientation}
                      revealed={spread.revealedPositions.has(pos)}
                      onReveal={() => spread.revealRune(pos)}
                      label={`${positionLabels[pos].emoji} ${positionLabels[pos].label}`}
                      size="sm"
                    />
                  )
                })}
              </div>
            </div>

            {spread.spreadComplete && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
              >
                {/* Individual interpretations */}
                {spread.drawnRunes.map((drawn) => (
                  <SpreadInterpretationCard
                    key={drawn.position}
                    drawn={drawn}
                    positionLabels={positionLabels}
                    accentColor="text-amber-400"
                    borderColor="border-amber-500/30"
                    glowColor="rgba(217, 119, 6, 0.2)"
                  />
                ))}

                {/* Overall interpretation - Keltų Kryžiaus Sintezė */}
                <div className="bg-linear-to-br from-amber-900/20 to-purple-900/20 border-2 border-amber-500/40 rounded-xl shadow-lg" style={{ padding: '3rem', boxShadow: '0 0 50px rgba(217, 119, 6, 0.4)' }}>
                  <div className="flex items-center gap-4 mb-8">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                    <h3 className="text-3xl font-cinzel font-bold text-amber-300">
                      Keltų Kryžiaus Sintezė
                    </h3>
                  </div>

                  {spread.question && (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg mb-8" style={{ padding: '1.5rem' }}>
                      <p className="text-purple-300 text-lg font-semibold mb-2">Tavo klausimas:</p>
                      <p className="text-white italic text-xl">"{spread.question}"</p>
                    </div>
                  )}

                  <div className="space-y-5 text-gray-200 text-lg leading-relaxed">
                    <p>
                      <strong className="text-amber-300">Dabartinė situacija</strong> atskleidžia <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'present').name}</strong> energiją,
                      o <strong className="text-red-300">iššūkis</strong>, kurį reikia įveikti, yra <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'challenge').name}</strong>.
                    </p>

                    <p>
                      <strong className="text-purple-300">Pasąmonėje</strong> slypi <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'below').name}</strong>,
                      o <strong className="text-yellow-300">geriausias įmanomas rezultatas</strong> yra <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'above').name}</strong>.
                    </p>

                    <p>
                      <strong className="text-blue-300">Praeitis</strong> suformavo pagrindą per <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'past').name}</strong>,
                      o <strong className="text-green-300">artimiausia ateitis</strong> veda link <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'future').name}</strong>.
                    </p>

                    <p>
                      <strong className="text-cyan-300">Patarimas</strong> - <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'advice').name}</strong>.
                      <strong className="text-orange-300"> Išoriniai veiksniai</strong> pasirodo kaip <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'external').name}</strong>.
                    </p>

                    <p>
                      Tavo <strong className="text-pink-300">viltys ir baimės</strong> atspindi <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'hopes').name}</strong>,
                      o <strong className="text-amber-300">galutinis rezultatas</strong> yra <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'outcome').name}</strong>.
                    </p>
                  </div>
                </div>

                <SpreadBottomSection
                  interpretation={spread.interpretation}
                  aiLoading={spread.aiLoading}
                  aiError={spread.aiError}
                  onRequestAI={handleRequestAI}
                  notes={spread.notes}
                  onNotesChange={spread.setNotes}
                  onSaveNotes={spread.saveNotes}
                  notesDisabled={!spread.divinationId}
                  savingNotes={spread.savingNotes}
                  saving={spread.saving}
                  onReset={spread.reset}
                  notesProps={{
                    description: 'Užrašykite savo mintis, įžvalgas ar pastebėjimus apie šį išsamų būrimą.',
                    placeholder: 'Kokias įžvalgas gavau iš šio Keltų Kryžiaus būrimo? Kaip tai atsiliepia mano situacijai?',
                  }}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
