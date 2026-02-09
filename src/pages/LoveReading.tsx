import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
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

type Position = 'you' | 'partner' | 'foundation' | 'challenges' | 'potential'

const positionLabels: Record<Position, PositionLabel> = {
  you: { label: 'Tu', description: 'Tavo energija santykiuose', emoji: '💜' },
  partner: { label: 'Partneris', description: 'Partnerio energija', emoji: '💙' },
  foundation: { label: 'Pagrindas', description: 'Kas jus jungia', emoji: '💕' },
  challenges: { label: 'Iššūkiai', description: 'Kliūtys santykiuose', emoji: '⚡' },
  potential: { label: 'Potencialas', description: 'Santykių ateitis', emoji: '✨' },
}

const POSITIONS: Position[] = ['you', 'partner', 'foundation', 'challenges', 'potential']

export function LoveReading() {
  useSEO({
    title: 'Meilės Būrimas',
    description: 'Meilės runų būrimas — sužinokite apie savo santykius, partnerio energiją ir meilės potencialą per Elder Futhark runas.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Meilės Būrimas',
      description: 'Sužinokite apie savo santykius ir meilės potencialą per Elder Futhark runas.',
      isPartOf: { '@type': 'WebApplication', name: 'Runų Būrimas' },
    },
  })
  const { isPremium, loading: premiumLoading, freemiumQuota } = usePremium()

  const spread = useSpread<Position>({
    positions: POSITIONS,
    divinationType: 'love_reading',
    drawDelay: 2000,
  })

  if (!spread.user) {
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

  if (!isPremium && freemiumQuota.isQuotaExceeded) {
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
        quotaExceeded
      />
    )
  }

  if (spread.runesLoading) {
    return <RuneLoader symbol="ᚹ" color="text-pink-400" />
  }

  const handleRequestAI = () => spread.requestAIInterpretation(positionLabels, 'love_reading')

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
            title="Užduok Klausimą Apie Meilę"
            description="Meilės Būrimas atskleidžia jūsų ir partnerio energijas, santykių pagrindą, iššūkius ir potencialą. Gali klausti apie esamą ar būsimą partnerį."
            placeholder="Pvz.: Kokia yra mano ir [vardas] santykių ateitis? Ar mes tinkami vienas kitam?"
            buttonText="Traukti 5 Meilės Runas"
            buttonIcon={<Heart className="w-6 h-6 md:w-7 md:h-7" />}
            buttonVariant="gradient"
            buttonClassName="!from-pink-600 !via-pink-500 !to-rose-600 hover:!from-pink-500 hover:!via-rose-500 hover:!to-pink-500"
            accentColor="text-pink-200"
            borderColor="border-pink-500/30"
            glowColor="rgba(236, 72, 153, 0.3)"
          />
        )}

        {/* Drawing Animation */}
        {spread.isDrawing && (
          <SpreadDrawingAnimation
            count={5}
            cardColors="from-pink-800 via-pink-700 to-rose-600"
            emoji="💕"
            emojiAnimation={{ scale: [1, 1.3, 1] }}
            emojiClassName="absolute -top-12 text-5xl"
            text="Traukiamos meilės runos..."
            textColor="text-pink-300"
          />
        )}

        {/* Drawn Runes */}
        {spread.drawnRunes.length > 0 && !spread.isDrawing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Heart-shaped layout - Desktop */}
            <div className="hidden md:flex justify-center px-4" style={{ marginBottom: '5rem' }}>
              <div className="relative w-150 h-150">
                {spread.drawnRunes.map((drawn) => {
                  const positionStyles: Record<Position, React.CSSProperties> = {
                    you: { top: '25%', left: '15%', transform: 'translate(-50%, -50%)' },
                    partner: { top: '25%', right: '15%', transform: 'translate(50%, -50%)' },
                    foundation: { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
                    challenges: { top: '75%', left: '25%', transform: 'translate(-50%, -50%)' },
                    potential: { top: '75%', right: '25%', transform: 'translate(50%, -50%)' },
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

            {/* Heart layout - Mobile (stacked) */}
            <div className="md:hidden flex flex-col items-center gap-3 px-4" style={{ marginBottom: '3rem' }}>
              {spread.drawnRunes.map((drawn) => (
                <RuneCard
                  key={drawn.position}
                  rune={drawn.rune}
                  orientation={drawn.orientation}
                  revealed={spread.revealedPositions.has(drawn.position)}
                  onReveal={() => spread.revealRune(drawn.position)}
                  label={`${positionLabels[drawn.position].emoji} ${positionLabels[drawn.position].label}`}
                  size="sm"
                />
              ))}
            </div>

            {spread.spreadComplete && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Individual interpretations */}
                {spread.drawnRunes.map((drawn) => (
                  <SpreadInterpretationCard
                    key={drawn.position}
                    drawn={drawn}
                    positionLabels={positionLabels}
                    accentColor="text-pink-400"
                    borderColor="border-pink-500/30"
                    glowColor="rgba(236, 72, 153, 0.2)"
                  />
                ))}

                {/* Overall interpretation - Meilės Istorija */}
                <div className="bg-linear-to-br from-pink-900/20 to-purple-900/20 border-2 border-pink-500/40 rounded-xl shadow-lg" style={{ padding: '3rem', boxShadow: '0 0 50px rgba(236, 72, 153, 0.4)' }}>
                  <div className="flex items-center gap-4 mb-8">
                    <Heart className="w-8 h-8 text-pink-400" />
                    <h3 className="text-3xl font-cinzel font-bold text-pink-300">
                      Meilės Istorija
                    </h3>
                  </div>

                  {spread.question && (
                    <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg mb-8" style={{ padding: '1.5rem' }}>
                      <p className="text-purple-300 text-lg font-semibold mb-2">Tavo klausimas:</p>
                      <p className="text-white italic text-xl">"{spread.question}"</p>
                    </div>
                  )}

                  <div className="space-y-5 text-gray-200 text-xl leading-relaxed">
                    <p>
                      <strong className="text-purple-300">Tu</strong> santykiuose atstovaujamas <strong className="text-pink-300">{getRuneText(spread.drawnRunes, 'you').name}</strong> energija - {getRuneText(spread.drawnRunes, 'you').text}
                    </p>
                    <p>
                      <strong className="text-blue-300">Partneris</strong> atneša <strong className="text-pink-300">{getRuneText(spread.drawnRunes, 'partner').name}</strong> energiją - {getRuneText(spread.drawnRunes, 'partner').text}
                    </p>
                    <p>
                      <strong className="text-pink-300">Jūsų santykių pagrindas</strong> yra <strong className="text-pink-300">{getRuneText(spread.drawnRunes, 'foundation').name}</strong> - {getRuneText(spread.drawnRunes, 'foundation').text} Tai yra tai, kas jus jungia.
                    </p>
                    <p>
                      <strong className="text-yellow-300">Iššūkiai</strong> pasirodo kaip <strong className="text-pink-300">{getRuneText(spread.drawnRunes, 'challenges').name}</strong> - {getRuneText(spread.drawnRunes, 'challenges').text} Tai yra sritys, kuriose reikia augti kartu.
                    </p>
                    <p>
                      <strong className="text-green-300">Santykių potencialas</strong> atskleidžia <strong className="text-pink-300">{getRuneText(spread.drawnRunes, 'potential').name}</strong> - {getRuneText(spread.drawnRunes, 'potential').text} Tai yra jūsų bendros ateities galimybės.
                    </p>
                  </div>

                  <div className="mt-8 pt-8 border-t border-pink-500/30">
                    <p className="text-pink-300 text-lg text-center italic font-medium">
                      💕 Meilė yra kelionė, ne tikslas. Leiskite runoms vesti jus abiem. 💕
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
                    title: 'Meilės Dienoraštis',
                    description: 'Užrašykite savo mintis, jausmus ar įžvalgas apie šį meilės būrimą.',
                    placeholder: 'Kaip šis būrimas atspindi mano santykius? Kokias įžvalgas gavau?',
                    borderColor: 'border-pink-600/30',
                    glowColor: 'rgba(236, 72, 153, 0.2)',
                    iconColor: 'text-pink-400',
                    focusColor: 'focus:border-pink-500 focus:ring-pink-500/50',
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
