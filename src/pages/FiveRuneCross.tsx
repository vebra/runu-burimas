import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
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
import { Sparkles } from 'lucide-react'

type Position = 'center' | 'top' | 'bottom' | 'left' | 'right'

const positionLabels: Record<Position, PositionLabel> = {
  center: { label: 'Dabartinė Situacija', description: 'Tai yra tavo dabartinė būsena ir pagrindinė energija', emoji: '🎯' },
  top: { label: 'Ateitis', description: 'Kur veda tavo kelias, jei tęsi dabartinį kursą', emoji: '🌟' },
  bottom: { label: 'Praeitis', description: 'Kas įtakojo dabartinę situaciją', emoji: '📜' },
  left: { label: 'Kliūtys', description: 'Kas trukdo ar stabdo tavo pažangą', emoji: '⚠️' },
  right: { label: 'Pagalba', description: 'Kas palaiko ir padeda tau', emoji: '🤝' },
}

const POSITIONS: Position[] = ['center', 'top', 'bottom', 'left', 'right']

export function FiveRuneCross() {
  usePageTitle('Penkių Runų Kryžius')
  const { isPremium, loading: premiumLoading } = usePremium()

  const spread = useSpread<Position>({
    positions: POSITIONS,
    divinationType: 'five_rune_cross',
    drawDelay: 2000,
  })

  if (!spread.user) {
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

  if (spread.runesLoading) {
    return <RuneLoader symbol="ᚲ" />
  }

  const handleRequestAI = () => spread.requestAIInterpretation(positionLabels, 'five_rune')

  return (
    <div className="px-4 pt-8 md:pt-32 pb-24" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1024px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div className="flex items-center justify-center gap-4">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Crown className="w-10 h-10 text-amber-400" />
            </motion.div>
            <motion.h1
              className="text-4xl sm:text-5xl font-cinzel font-bold text-white tracking-wide uppercase"
              animate={{ textShadow: ["0 0 20px rgba(251, 191, 36, 0.3)", "0 0 40px rgba(251, 191, 36, 0.6)", "0 0 20px rgba(251, 191, 36, 0.3)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              5 Runų Kryžius
            </motion.h1>
            <motion.div animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Crown className="w-10 h-10 text-amber-400" />
            </motion.div>
          </div>
          <p className="text-gray-300 text-lg sm:text-xl italic">Situacijos analizė su praktiniais veiksmais</p>
          <p className="text-purple-300 text-base sm:text-lg">Centro runa + 4 aspektai (praeitis, ateitis, kliūtys, pagalba)</p>
        </motion.div>

        {/* Question Form */}
        {spread.drawnRunes.length === 0 && !spread.isDrawing && (
          <SpreadQuestionForm
            question={spread.question}
            onQuestionChange={spread.setQuestion}
            onDraw={spread.draw}
            title="Užduok Klausimą"
            description="Suformuluok savo klausimą apie situaciją, kurią nori išanalizuoti. 5 Runų Kryžius padės suprasti praeities įtaką, dabartines kliūtis ir galimybes."
            placeholder="Pvz.: Kaip man geriau spręsti dabartinę situaciją darbe?"
            buttonText="Traukti 5 Runas"
            buttonIcon={<Crown className="w-6 h-6 md:w-7 md:h-7" />}
            buttonVariant="gold"
          />
        )}

        {/* Drawing Animation */}
        {spread.isDrawing && (
          <SpreadDrawingAnimation
            count={5}
            cardColors="from-amber-800 via-amber-700 to-orange-600"
            emoji="ᛟ"
            text="Traukiamos runos..."
          />
        )}

        {/* Drawn Runes */}
        {spread.drawnRunes.length > 0 && !spread.isDrawing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Cross layout - Desktop */}
            <div className="hidden md:flex justify-center px-4" style={{ marginBottom: '5rem' }}>
              <div className="relative w-150 h-150">
                {spread.drawnRunes.map((drawn) => {
                  const positionStyles = {
                    center: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
                    top: { top: '0%', left: '50%', transform: 'translate(-50%, 0)' },
                    bottom: { bottom: '0%', left: '50%', transform: 'translate(-50%, 0)' },
                    left: { top: '50%', left: '0%', transform: 'translate(0, -50%)' },
                    right: { top: '50%', right: '0%', transform: 'translate(0, -50%)' },
                  }
                  return (
                    <div key={drawn.position} className="absolute" style={positionStyles[drawn.position]}>
                      <RuneCard
                        rune={drawn.rune}
                        orientation={drawn.orientation}
                        revealed={spread.revealedPositions.has(drawn.position)}
                        onReveal={() => spread.revealRune(drawn.position)}
                        label={`${positionLabels[drawn.position].emoji} ${positionLabels[drawn.position].label}`}
                        size="sm"
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Cross layout - Mobile (stacked) */}
            <div className="md:hidden flex flex-col items-center gap-3 px-4" style={{ marginBottom: '3rem' }}>
              {spread.drawnRunes.find(r => r.position === 'top') && (
                <RuneCard rune={spread.drawnRunes.find(r => r.position === 'top')!.rune} orientation={spread.drawnRunes.find(r => r.position === 'top')!.orientation} revealed={spread.revealedPositions.has('top')} onReveal={() => spread.revealRune('top')} label={`${positionLabels.top.emoji} ${positionLabels.top.label}`} size="sm" />
              )}
              <div className="flex items-center justify-center gap-3">
                {spread.drawnRunes.find(r => r.position === 'left') && (
                  <RuneCard rune={spread.drawnRunes.find(r => r.position === 'left')!.rune} orientation={spread.drawnRunes.find(r => r.position === 'left')!.orientation} revealed={spread.revealedPositions.has('left')} onReveal={() => spread.revealRune('left')} label={`${positionLabels.left.emoji} ${positionLabels.left.label}`} size="sm" />
                )}
                {spread.drawnRunes.find(r => r.position === 'center') && (
                  <RuneCard rune={spread.drawnRunes.find(r => r.position === 'center')!.rune} orientation={spread.drawnRunes.find(r => r.position === 'center')!.orientation} revealed={spread.revealedPositions.has('center')} onReveal={() => spread.revealRune('center')} label={`${positionLabels.center.emoji} ${positionLabels.center.label}`} size="sm" />
                )}
                {spread.drawnRunes.find(r => r.position === 'right') && (
                  <RuneCard rune={spread.drawnRunes.find(r => r.position === 'right')!.rune} orientation={spread.drawnRunes.find(r => r.position === 'right')!.orientation} revealed={spread.revealedPositions.has('right')} onReveal={() => spread.revealRune('right')} label={`${positionLabels.right.emoji} ${positionLabels.right.label}`} size="sm" />
                )}
              </div>
              {spread.drawnRunes.find(r => r.position === 'bottom') && (
                <RuneCard rune={spread.drawnRunes.find(r => r.position === 'bottom')!.rune} orientation={spread.drawnRunes.find(r => r.position === 'bottom')!.orientation} revealed={spread.revealedPositions.has('bottom')} onReveal={() => spread.revealRune('bottom')} label={`${positionLabels.bottom.emoji} ${positionLabels.bottom.label}`} size="sm" />
              )}
            </div>

            {spread.spreadComplete && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {spread.drawnRunes.map((drawn) => (
                  <SpreadInterpretationCard key={drawn.position} drawn={drawn} positionLabels={positionLabels} />
                ))}

                {/* Overall Synthesis */}
                <div className="bg-linear-to-br from-amber-900/20 to-purple-900/20 border-2 border-amber-500/40 rounded-xl shadow-lg" style={{ padding: '3rem', boxShadow: '0 0 50px rgba(217, 119, 6, 0.4)' }}>
                  <div className="flex items-center gap-4 mb-8">
                    <Sparkles className="w-8 h-8 text-amber-400" />
                    <h3 className="text-3xl font-cinzel font-bold text-amber-300">Situacijos Analizė</h3>
                  </div>
                  {spread.question && (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg mb-8" style={{ padding: '1.5rem' }}>
                      <p className="text-purple-300 text-lg font-semibold mb-2">Tavo klausimas:</p>
                      <p className="text-white italic text-xl">"{spread.question}"</p>
                    </div>
                  )}
                  <div className="space-y-5 text-gray-200 text-xl leading-relaxed">
                    <p><strong className="text-amber-300">Dabartinė situacija</strong> yra <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'center').name}</strong> - {getRuneText(spread.drawnRunes, 'center').text}</p>
                    <p><strong className="text-purple-300">Praeitis</strong> atskleidžia <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'bottom').name}</strong>, kuri rodo {getRuneText(spread.drawnRunes, 'bottom').text} Tai suformavo pagrindą dabartinei situacijai.</p>
                    <p><strong className="text-red-300">Kliūtys</strong> pasirodo kaip <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'left').name}</strong> - {getRuneText(spread.drawnRunes, 'left').text} Tai yra tai, ką reikia įveikti ar priimti.</p>
                    <p><strong className="text-green-300">Pagalba</strong> ateina per <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'right').name}</strong> - {getRuneText(spread.drawnRunes, 'right').text} Tai yra tavo stiprybė ir palaikymas.</p>
                    <p><strong className="text-amber-300">Ateitis</strong> rodo <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'top').name}</strong> energiją - {getRuneText(spread.drawnRunes, 'top').text} Tai yra tavo kelias, jei naudosi pagalba ir įveiksi kliūtis.</p>
                  </div>
                  <div className="mt-8 pt-8 border-t border-amber-500/30">
                    <p className="text-purple-300 text-lg text-center italic font-medium">Premium: Praktiniai veiksmai ir gilus įžvalgos laukia tavęs!</p>
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
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
