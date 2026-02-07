import { motion } from 'framer-motion'
import { Compass } from 'lucide-react'
import { usePremium } from '../hooks/usePremium'
import { useSEO } from '../hooks/useSEO'
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

type Position = 'self' | 'foundation' | 'past' | 'future' | 'obstacles' | 'help' | 'outcome'

const positionLabels: Record<Position, PositionLabel> = {
  self: { label: 'Tu Centre', description: 'Tavo dabartinė esmė ir vidinė būsena', emoji: '🧘' },
  foundation: { label: 'Pagrindas', description: 'Kas tave laiko ir palaiko', emoji: '🏛️' },
  past: { label: 'Praeitis', description: 'Kas formavo tavo kelią', emoji: '📜' },
  future: { label: 'Ateitis', description: 'Kur veda tavo kelias', emoji: '🌟' },
  obstacles: { label: 'Kliūtys', description: 'Kas reikalauja dėmesio ir augimo', emoji: '⚠️' },
  help: { label: 'Pagalba', description: 'Tavo stiprybės ir palaikymas', emoji: '🤝' },
  outcome: { label: 'Tikslas', description: 'Tavo aukščiausias potencialas', emoji: '🎯' },
}

const POSITIONS: Position[] = ['self', 'foundation', 'past', 'future', 'obstacles', 'help', 'outcome']

export function SevenRuneMap() {
  useSEO({
    title: 'Septynių Runų Žemėlapis',
    description: 'Septynių runų žemėlapio būrimas — išsamus gyvenimo situacijos žemėlapis per Elder Futhark runas. Premium būrimas su 7 pozicijomis.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Septynių Runų Žemėlapis',
      description: 'Išsamus gyvenimo situacijos žemėlapis per 7 Elder Futhark runas.',
      isPartOf: { '@type': 'WebApplication', name: 'Runų Būrimas' },
    },
  })
  const { isPremium, loading: premiumLoading } = usePremium()

  const spread = useSpread<Position>({
    positions: POSITIONS,
    divinationType: 'seven_rune_map',
    drawDelay: 2500,
  })

  if (!spread.user) {
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

  if (spread.runesLoading) {
    return <RuneLoader symbol="ᛁ" color="text-purple-400" />
  }

  const handleRequestAI = () => spread.requestAIInterpretation(positionLabels, 'seven_rune')

  return (
    <div className="px-4 pt-8 md:pt-32 pb-24" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '1152px' }}>
        {/* Header */}
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

        {/* Question Form */}
        {spread.drawnRunes.length === 0 && !spread.isDrawing && (
          <SpreadQuestionForm
            question={spread.question}
            onQuestionChange={spread.setQuestion}
            onDraw={spread.draw}
            title="Užduok Gyvenimo Klausimą"
            description="Suformuluok klausimą apie savo gyvenimo kelią, tikslą ar dvasinį augimą. 7 Runų Gyvenimo Žemėlapis atskleis gilias įžvalgas apie tavo kelionę."
            placeholder="Pvz.: Koks yra mano tikrasis kelias ir tikslas gyvenime?"
            buttonText="Traukti 7 Runas"
            buttonIcon={<Compass className="w-6 h-6 md:w-7 md:h-7" />}
            buttonVariant="gradient"
            borderColor="border-purple-500/30"
            glowColor="rgba(147, 51, 234, 0.3)"
          />
        )}

        {/* Drawing Animation */}
        {spread.isDrawing && (
          <SpreadDrawingAnimation
            count={7}
            cardColors="from-purple-800 via-purple-700 to-pink-600"
            emoji="ᛚ"
            emojiAnimation={{ rotate: 360, scale: [1, 1.4, 1] }}
            emojiClassName="absolute -top-12 text-5xl text-pink-400/40"
            text="Traukiamos runos..."
            textColor="text-purple-300"
          />
        )}

        {/* Drawn Runes */}
        {spread.drawnRunes.length > 0 && !spread.isDrawing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Circular layout - Desktop */}
            <div className="hidden md:flex justify-center px-4" style={{ marginBottom: '5rem' }}>
              <div className="relative w-175 h-175">
                {spread.drawnRunes.map((drawn) => {
                  const position = drawn.position

                  let positionStyle: React.CSSProperties = {}

                  if (position === 'self') {
                    positionStyle = { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
                  } else {
                    const outerPositions: Position[] = ['foundation', 'past', 'future', 'obstacles', 'help', 'outcome']
                    const index = outerPositions.indexOf(position)
                    const angle = (index * 60) - 90
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
                        revealed={spread.revealedPositions.has(drawn.position)}
                        onReveal={() => spread.revealRune(drawn.position)}
                        label={`${positionLabels[position].emoji} ${positionLabels[position].label}`}
                        size={isCenterRune ? 'md' : 'sm'}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Stacked layout - Mobile */}
            <div className="md:hidden flex flex-col items-center gap-4 px-4" style={{ marginBottom: '3rem' }}>
              {/* Centras - Tu */}
              {spread.drawnRunes.find(r => r.position === 'self') && (
                <RuneCard
                  rune={spread.drawnRunes.find(r => r.position === 'self')!.rune}
                  orientation={spread.drawnRunes.find(r => r.position === 'self')!.orientation}
                  revealed={spread.revealedPositions.has('self')}
                  onReveal={() => spread.revealRune('self')}
                  label={`${positionLabels.self.emoji} ${positionLabels.self.label}`}
                  size="md"
                />
              )}
              {/* 6 aplinkinės runos - po 2 eilutėje */}
              <div className="grid grid-cols-2 gap-4">
                {(['foundation', 'past', 'future', 'obstacles', 'help', 'outcome'] as Position[]).map((pos) => {
                  const drawn = spread.drawnRunes.find(r => r.position === pos)
                  if (!drawn) return null
                  return (
                    <div key={pos} className="flex justify-center">
                      <RuneCard
                        rune={drawn.rune}
                        orientation={drawn.orientation}
                        revealed={spread.revealedPositions.has(pos)}
                        onReveal={() => spread.revealRune(pos)}
                        label={`${positionLabels[pos].emoji} ${positionLabels[pos].label}`}
                        size="sm"
                      />
                    </div>
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
                    accentColor="text-purple-400"
                    borderColor={drawn.position === 'self' ? 'border-purple-500/40' : 'border-purple-500/30'}
                    glowColor={drawn.position === 'self' ? 'rgba(147, 51, 234, 0.3)' : 'rgba(147, 51, 234, 0.2)'}
                  />
                ))}

                {/* Overall interpretation */}
                <div className="bg-linear-to-br from-purple-900/30 to-pink-900/20 border-2 border-purple-500/50 rounded-xl shadow-lg" style={{ padding: '1.5rem', boxShadow: '0 0 30px rgba(147, 51, 234, 0.3)' }}>
                  <div className="flex items-center gap-2" style={{ marginBottom: '1rem' }}>
                    <Compass className="w-5 h-5 text-purple-400" />
                    <h3 className="text-xl font-cinzel font-bold text-purple-300">
                      Tavo Gyvenimo Kelias
                    </h3>
                  </div>

                  {spread.question && (
                    <div className="bg-purple-900/40 border border-purple-500/40 rounded-lg" style={{ padding: '0.75rem', marginBottom: '1rem' }}>
                      <p className="text-purple-300 text-xs font-semibold mb-1">Tavo klausimas:</p>
                      <p className="text-white italic text-sm">"{spread.question}"</p>
                    </div>
                  )}

                  <div className="text-gray-200 text-sm leading-relaxed" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p>
                      <strong className="text-purple-300">Tavo esmė</strong> šiuo metu yra <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'self').name}</strong> - {getRuneText(spread.drawnRunes, 'self').text} Tai yra tavo dabartinė vidinė būsena.
                    </p>

                    <p>
                      <strong className="text-amber-300">Pagrindas</strong>, ant kurio stovi, yra <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'foundation').name}</strong> - {getRuneText(spread.drawnRunes, 'foundation').text} Tai tave palaiko ir duoda jėgų.
                    </p>

                    <p>
                      <strong className="text-blue-300">Praeitis</strong> atskleidžia <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'past').name}</strong> - {getRuneText(spread.drawnRunes, 'past').text} Tai formavo tavo kelią iki šiol.
                    </p>

                    <p>
                      <strong className="text-red-300">Kliūtys</strong> pasirodo kaip <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'obstacles').name}</strong> - {getRuneText(spread.drawnRunes, 'obstacles').text} Tai yra tavo augimo galimybė.
                    </p>

                    <p>
                      <strong className="text-green-300">Pagalba</strong> ateina per <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'help').name}</strong> - {getRuneText(spread.drawnRunes, 'help').text} Tai yra tavo stiprybė ir resursai.
                    </p>

                    <p>
                      <strong className="text-pink-300">Ateitis</strong> rodo <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'future').name}</strong> energiją - {getRuneText(spread.drawnRunes, 'future').text} Tai yra tavo kelias į priekį.
                    </p>

                    <p style={{ paddingTop: '0.75rem', borderTop: '1px solid rgba(147, 51, 234, 0.3)' }}>
                      <strong className="text-amber-300">Tavo tikslas</strong> yra <strong className="text-amber-300">{getRuneText(spread.drawnRunes, 'outcome').name}</strong> - {getRuneText(spread.drawnRunes, 'outcome').text} Tai yra tavo aukščiausias potencialas ir siekis.
                    </p>
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(147, 51, 234, 0.4)' }}>
                    <p className="text-purple-300 text-xs text-center italic font-medium">
                      Tavo kelias yra unikalus. Pasitikėk procesu ir leisk runoms tave vesti.
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
                    placeholder: 'Kaip šis būrimas atspindi mano gyvenimo kelią? Kokios įžvalgos kilo?',
                    borderColor: 'border-pink-600/30',
                    glowColor: 'rgba(219, 39, 119, 0.2)',
                    iconColor: 'text-pink-400',
                    focusColor: 'focus:border-purple-500 focus:ring-purple-500/50',
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
