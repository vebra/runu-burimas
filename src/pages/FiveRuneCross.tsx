import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
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
  useSEO({
    title: 'Penkių Runų Kryžius',
    description: 'Penkių runų kryžiaus būrimas — gilesnė situacijos analizė per Elder Futhark runas. Premium būrimas su centrine runa ir keturiomis kryptimis.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Penkių Runų Kryžius',
      description: 'Gilesnė situacijos analizė per penkių Elder Futhark runų kryžiaus išdėstymą.',
      isPartOf: { '@type': 'WebApplication', name: 'Runų Būrimas' },
    },
  })
  const { isPremium, loading: premiumLoading, freemiumQuota } = usePremium()

  const spread = useSpread<Position>({
    positions: POSITIONS,
    divinationType: 'five_rune_cross',
    drawDelay: 2000,
    freemium: !isPremium ? { usedCount: freemiumQuota.usedCount, remainingCount: freemiumQuota.remainingCount } : undefined,
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

  if (!isPremium && freemiumQuota.isQuotaExceeded) {
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
        quotaExceeded
      />
    )
  }

  if (spread.runesLoading) {
    return <RuneLoader symbol="ᚲ" />
  }

  const handleRequestAI = () => spread.requestAIInterpretation(positionLabels, 'five_rune')

  return (
    <div className="px-4 pb-24 w-full flex flex-col items-center" style={{ paddingTop: 'clamp(5rem, 12vw, 100px)' }}>
      <div className="w-full flex flex-col items-center" style={{ maxWidth: '1024px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full text-center flex flex-col items-center"
          style={{ marginBottom: 'clamp(1.5rem, 4vw, 3rem)', gap: 'clamp(0.5rem, 2vw, 1rem)' }}
        >
          <div className="flex items-center justify-center gap-4">
            <motion.div animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Crown className="w-7 h-7 sm:w-10 sm:h-10 text-amber-400" />
            </motion.div>
            <motion.h1
              className="font-cinzel font-bold text-white tracking-wide uppercase"
              style={{ fontSize: 'clamp(1.6rem, 6vw, 3rem)' }}
              animate={{ textShadow: ["0 0 20px rgba(251, 191, 36, 0.3)", "0 0 40px rgba(251, 191, 36, 0.6)", "0 0 20px rgba(251, 191, 36, 0.3)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              5 Runų Kryžius
            </motion.h1>
            <motion.div animate={{ rotate: [0, -10, 10, 0], scale: [1, 1.1, 1] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}>
              <Crown className="w-7 h-7 sm:w-10 sm:h-10 text-amber-400" />
            </motion.div>
          </div>
          <p className="font-cormorant italic text-gray-300" style={{ fontSize: 'clamp(1rem, 3vw, 1.75rem)' }}>Situacijos analizė su praktiniais veiksmais</p>
          <p className="text-purple-300" style={{ fontSize: 'clamp(0.8rem, 2.2vw, 1.05rem)' }}>Centro runa + 4 aspektai (praeitis, ateitis, kliūtys, pagalba)</p>
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {spread.drawnRunes.map((drawn) => (
                  <SpreadInterpretationCard key={drawn.position} drawn={drawn} positionLabels={positionLabels} />
                ))}

                {/* Overall Synthesis */}
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <div className="bg-linear-to-br from-amber-900/20 to-purple-900/20 border-2 border-amber-500/40 rounded-xl shadow-lg" style={{ padding: 'clamp(1.25rem, 3vw, 2.5rem)', boxShadow: '0 0 30px rgba(217, 119, 6, 0.4)' }}>
                  <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400" />
                    <h3 className="font-cinzel font-bold text-amber-300" style={{ fontSize: 'clamp(1.1rem, 3vw, 1.75rem)' }}>Situacijos Analizė</h3>
                  </div>
                  {spread.question && (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg mb-4 sm:mb-6" style={{ padding: 'clamp(0.75rem, 2vw, 1.25rem)' }}>
                      <p className="text-purple-300 text-sm sm:text-base font-semibold mb-2">Tavo klausimas:</p>
                      <p className="text-white italic text-sm sm:text-lg">"{spread.question}"</p>
                    </div>
                  )}
                  <div className="space-y-3 sm:space-y-4 text-gray-200 text-sm sm:text-base leading-relaxed">
                    <p><strong className="text-amber-300">Dabartinė situacija</strong> yra <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'center').name}</strong> - {getRuneText(spread.drawnRunes, 'center').text}</p>
                    <p><strong className="text-purple-300">Praeitis</strong> atskleidžia <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'bottom').name}</strong>, kuri rodo {getRuneText(spread.drawnRunes, 'bottom').text} Tai suformavo pagrindą dabartinei situacijai.</p>
                    <p><strong className="text-red-300">Kliūtys</strong> pasirodo kaip <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'left').name}</strong> - {getRuneText(spread.drawnRunes, 'left').text} Tai yra tai, ką reikia įveikti ar priimti.</p>
                    <p><strong className="text-green-300">Pagalba</strong> ateina per <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'right').name}</strong> - {getRuneText(spread.drawnRunes, 'right').text} Tai yra tavo stiprybė ir palaikymas.</p>
                    <p><strong className="text-amber-300">Ateitis</strong> rodo <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'top').name}</strong> energiją - {getRuneText(spread.drawnRunes, 'top').text} Tai yra tavo kelias, jei naudosi pagalba ir įveiksi kliūtis.</p>
                  </div>
                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-amber-500/30">
                    <p className="text-purple-300 text-sm sm:text-base text-center italic font-medium">Premium: Praktiniai veiksmai ir gilus įžvalgos laukia tavęs!</p>
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
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}
