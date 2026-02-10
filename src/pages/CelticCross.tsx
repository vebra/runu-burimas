import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import { usePremium } from '../hooks/usePremium'
import { useSEO } from '../hooks/useSEO'
import { useSpread, type PositionLabel } from '../hooks/useSpread'
import { RuneCard } from '../components/common/RuneCard'
import { AuthGate } from '../components/common/AuthGate'
import { RuneLoader } from '../components/common/RuneLoader'
import { PremiumPaywall } from '../components/premium/PremiumPaywall'
import { FreemiumBanner } from '../components/premium/FreemiumBanner'
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
  useSEO({
    title: 'Keltų Kryžius',
    description: 'Keltų kryžiaus runų būrimas — vienas išsamiausių būrimo metodų su 10 pozicijų. Premium Elder Futhark runų būrimas.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Keltų Kryžius',
      description: 'Išsamiausias runų būrimo metodas su 10 pozicijų per Elder Futhark runas.',
      isPartOf: { '@type': 'WebApplication', name: 'Runų Būrimas' },
    },
  })
  const { isPremium, loading: premiumLoading, freemiumQuota } = usePremium()

  const spread = useSpread<Position>({
    positions: POSITIONS,
    divinationType: 'celtic_cross',
    drawDelay: 3000,
    freemium: !isPremium ? { usedCount: freemiumQuota.usedCount, remainingCount: freemiumQuota.remainingCount } : undefined,
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

  if (!isPremium && freemiumQuota.isQuotaExceeded) {
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
        quotaExceeded
      />
    )
  }

  if (spread.runesLoading) {
    return <RuneLoader symbol="ᛟ" />
  }

  const handleRequestAI = () => spread.requestAIInterpretation(positionLabels, 'celtic_cross')

  return (
    <div className="px-4 pb-24 w-full flex flex-col items-center" style={{ paddingTop: 'clamp(5rem, 12vw, 100px)' }}>
      <div className="w-full flex flex-col items-center" style={{ maxWidth: '1200px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center flex flex-col items-center"
          style={{ marginBottom: 'clamp(1.5rem, 4vw, 3rem)', gap: 'clamp(0.5rem, 2vw, 1rem)' }}
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
              className="font-cinzel font-bold text-white tracking-wide uppercase"
              style={{ fontSize: 'clamp(1.6rem, 6vw, 3rem)' }}
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
          <p className="font-cormorant italic text-gray-300" style={{ fontSize: 'clamp(1rem, 3vw, 1.75rem)' }}>
            Išsamus 10 runų būrimas giliai situacijos analizei
          </p>
          <p className="text-amber-300" style={{ fontSize: 'clamp(0.8rem, 2.2vw, 1.05rem)' }}>
            Praeitis, dabartis, ateitis + 7 papildomi aspektai
          </p>
        </motion.div>

        {/* Freemium Banner */}
        {!isPremium && !freemiumQuota.loading && (
          <FreemiumBanner usedCount={freemiumQuota.usedCount} monthlyLimit={freemiumQuota.monthlyLimit} />
        )}

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
            <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 lg:gap-16" style={{ marginBottom: '5rem' }}>

              {/* Cross section */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'auto auto auto',
                gridTemplateRows: 'auto auto auto auto auto',
                justifyItems: 'center',
                alignItems: 'center',
                gap: '8px',
              }}>
                {/* Row 1: Above */}
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

                {/* Row 2: Past */}
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

                {/* Row 2: Present (center) */}
                <div style={{ gridColumn: '2', gridRow: '2' }}>
                  {spread.drawnRunes.find(r => r.position === 'present') && (
                    <RuneCard
                      rune={spread.drawnRunes.find(r => r.position === 'present')!.rune}
                      orientation={spread.drawnRunes.find(r => r.position === 'present')!.orientation}
                      revealed={spread.revealedPositions.has('present')}
                      onReveal={() => spread.revealRune('present')}
                      label={`${positionLabels.present.emoji} ${positionLabels.present.label}`}
                      size="sm"
                    />
                  )}
                </div>

                {/* Row 2: Future */}
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

                {/* Row 3: Below */}
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

                {/* Row 4: Challenge (below the cross, centered) */}
                <div style={{ gridColumn: '2', gridRow: '4', paddingTop: '4px' }}>
                  {spread.drawnRunes.find(r => r.position === 'challenge') && (
                    <RuneCard
                      rune={spread.drawnRunes.find(r => r.position === 'challenge')!.rune}
                      orientation={spread.drawnRunes.find(r => r.position === 'challenge')!.orientation}
                      revealed={spread.revealedPositions.has('challenge')}
                      onReveal={() => spread.revealRune('challenge')}
                      label={`${positionLabels.challenge.emoji} ${positionLabels.challenge.label}`}
                      size="sm"
                    />
                  )}
                </div>
              </div>

              {/* Staff section — vertical on desktop, 2x2 grid on mobile */}
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
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
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
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
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="bg-linear-to-br from-amber-900/20 to-purple-900/20 border-2 border-amber-500/40 rounded-xl shadow-lg" style={{ padding: 'clamp(1.25rem, 3vw, 2.5rem)', boxShadow: '0 0 30px rgba(217, 119, 6, 0.4)' }}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
                    <h3 className="font-cinzel font-bold text-amber-300" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.75rem)' }}>
                      Keltų Kryžiaus Sintezė
                    </h3>
                  </div>

                  {spread.question && (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg mb-4 sm:mb-6" style={{ padding: 'clamp(0.75rem, 2vw, 1.25rem)' }}>
                      <p className="text-purple-300 text-sm sm:text-base font-semibold mb-2">Tavo klausimas:</p>
                      <p className="text-white italic text-sm sm:text-lg">"{spread.question}"</p>
                    </div>
                  )}

                  <div className="space-y-3 sm:space-y-4 text-gray-200 text-sm sm:text-base leading-relaxed">
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
