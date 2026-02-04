import { type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Save, RotateCcw, Loader2 } from 'lucide-react'
import { Button } from '../common/Button'
import { AIInterpretation } from '../common/AIInterpretation'
import type { DrawnRune, PositionLabel } from '../../hooks/useSpread'

// --- Question Form ---

interface QuestionFormProps {
  question: string
  onQuestionChange: (q: string) => void
  onDraw: () => void
  title: string
  description: string
  placeholder: string
  buttonText: string
  buttonIcon: ReactNode
  buttonVariant?: 'gold' | 'gradient' | 'primary'
  buttonClassName?: string
  accentColor?: string
  borderColor?: string
  glowColor?: string
}

export function SpreadQuestionForm({
  question,
  onQuestionChange,
  onDraw,
  title,
  description,
  placeholder,
  buttonText,
  buttonIcon,
  buttonVariant = 'gold',
  buttonClassName,
  accentColor = 'text-amber-200',
  borderColor = 'border-purple-500/30',
  glowColor = 'rgba(147, 51, 234, 0.3)',
}: QuestionFormProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full flex items-center justify-center"
    >
      <div className="max-w-2xl w-full">
        <div
          className={`bg-gray-800/50 border-2 ${borderColor} rounded-xl shadow-lg`}
          style={{ padding: '3rem', marginBottom: '3rem', boxShadow: `0 0 40px ${glowColor}` }}
        >
          <h2 className={`text-3xl font-cinzel font-semibold ${accentColor}`} style={{ marginBottom: '2rem' }}>
            {title}
          </h2>
          <p className="text-gray-400 text-lg" style={{ marginBottom: '2rem' }}>
            {description}
          </p>
          <textarea
            value={question}
            onChange={(e) => onQuestionChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-colors resize-none text-xl"
            rows={5}
            style={{ marginBottom: '2rem', padding: '1.5rem' }}
          />
          <motion.div
            whileHover={{ scale: question.trim() ? 1.05 : 1 }}
            whileTap={{ scale: question.trim() ? 0.95 : 1 }}
          >
            <Button
              onClick={onDraw}
              disabled={!question.trim()}
              variant={buttonVariant}
              size="xl"
              className={buttonClassName}
            >
              {buttonIcon}
              {buttonText}
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// --- Drawing Animation ---

interface DrawingAnimationProps {
  count: number
  cardColors: string
  emoji: string
  emojiAnimation?: { rotate?: number | number[]; scale?: number[] }
  emojiClassName?: string
  text: string
  textColor?: string
}

export function SpreadDrawingAnimation({
  count,
  cardColors,
  emoji,
  emojiAnimation = { rotate: 360, scale: [1, 1.3, 1] },
  emojiClassName = 'absolute -top-12 text-5xl text-amber-400/40',
  text,
  textColor = 'text-amber-300',
}: DrawingAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center"
    >
      <div className="flex justify-center relative">
        {Array.from({ length: count }, (_, i) => (
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
            className={`w-24 h-36 bg-linear-to-br ${cardColors} rounded-xl shadow-lg border border-amber-500/30 -ml-4 first:ml-0`}
          />
        ))}
        <motion.div
          animate={emojiAnimation}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          className={emojiClassName}
        >
          {emoji}
        </motion.div>
      </div>
      <p className={`${textColor} animate-pulse mt-8 text-2xl font-semibold`}>{text}</p>
    </motion.div>
  )
}

// --- Rune Interpretation Card ---

interface InterpretationCardProps {
  drawn: DrawnRune
  positionLabels: Record<string, PositionLabel>
  accentColor?: string
  borderColor?: string
  glowColor?: string
}

export function SpreadInterpretationCard({
  drawn,
  positionLabels,
  accentColor = 'text-purple-400',
  borderColor = 'border-purple-500/30',
  glowColor = 'rgba(147, 51, 234, 0.2)',
}: InterpretationCardProps) {
  const label = positionLabels[drawn.position]
  return (
    <div
      className={`bg-gray-800/50 border-2 ${borderColor} rounded-xl shadow-lg`}
      style={{ padding: '1.5rem', boxShadow: `0 0 25px ${glowColor}` }}
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
            <span className={`${accentColor} text-sm font-semibold`}>
              {label.emoji && `${label.emoji} `}{label.label}
            </span>
            <span className="text-gray-600">&bull;</span>
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
            {label.description}
          </p>
          <p className="text-gray-300 text-sm leading-relaxed">
            {drawn.orientation === 'reversed' && drawn.rune.reversed_interpretation
              ? drawn.rune.reversed_interpretation
              : drawn.rune.interpretation}
          </p>
        </div>
      </div>
    </div>
  )
}

// --- Notes Section ---

interface NotesSectionProps {
  notes: string
  onNotesChange: (n: string) => void
  onSave: () => void
  disabled: boolean
  loading: boolean
  title?: string
  description?: string
  placeholder?: string
  borderColor?: string
  glowColor?: string
  iconColor?: string
  focusColor?: string
}

export function SpreadNotes({
  notes,
  onNotesChange,
  onSave,
  disabled,
  loading,
  title = 'Dienoraštis',
  description = 'Užrašykite savo mintis, įžvalgas ar pastebėjimus apie šį būrimą.',
  placeholder = 'Kaip šis būrimas atspindi mano situaciją? Kokius veiksmus turiu atlikti?',
  borderColor = 'border-amber-600/30',
  glowColor = 'rgba(217, 119, 6, 0.2)',
  iconColor = 'text-amber-400',
  focusColor = 'focus:border-amber-500 focus:ring-amber-500/50',
}: NotesSectionProps) {
  return (
    <div
      className={`bg-gray-800/50 border-2 ${borderColor} rounded-xl shadow-lg`}
      style={{ padding: '2rem', boxShadow: `0 0 30px ${glowColor}` }}
    >
      <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
        <BookOpen className={`w-5 h-5 ${iconColor}`} />
        <h3 className="text-xl font-cinzel font-semibold text-amber-200">
          {title}
        </h3>
      </div>
      <p className="text-gray-400 text-sm" style={{ marginBottom: '1rem' }}>
        {description}
      </p>
      <textarea
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg p-6 text-white placeholder-gray-500 focus:outline-none ${focusColor} transition-colors resize-none text-xl shadow-lg`}
        style={{ height: '200px', boxShadow: '0 0 20px rgba(107, 114, 128, 0.2)' }}
      />
      <Button
        onClick={onSave}
        disabled={disabled}
        loading={loading}
        variant="secondary"
        size="lg"
        className="mt-6"
      >
        <Save className="w-5 h-5 md:w-6 md:h-6" />
        Išsaugoti Dienoraštį
      </Button>
    </div>
  )
}

// --- AI + Notes + Reset + Saving (complete bottom section) ---

interface SpreadBottomSectionProps {
  interpretation: string | null
  aiLoading: boolean
  aiError: string | null
  onRequestAI: () => void
  notes: string
  onNotesChange: (n: string) => void
  onSaveNotes: () => void
  notesDisabled: boolean
  savingNotes: boolean
  saving: boolean
  onReset: () => void
  notesProps?: Partial<NotesSectionProps>
}

export function SpreadBottomSection({
  interpretation,
  aiLoading,
  aiError,
  onRequestAI,
  notes,
  onNotesChange,
  onSaveNotes,
  notesDisabled,
  savingNotes,
  saving,
  onReset,
  notesProps,
}: SpreadBottomSectionProps) {
  return (
    <>
      <AIInterpretation
        interpretation={interpretation}
        loading={aiLoading}
        error={aiError}
        onRequestInterpretation={onRequestAI}
        onRetry={onRequestAI}
      />

      <SpreadNotes
        notes={notes}
        onNotesChange={onNotesChange}
        onSave={onSaveNotes}
        disabled={notesDisabled}
        loading={savingNotes}
        {...notesProps}
      />

      <div className="flex justify-center pt-8">
        <Button onClick={onReset} variant="ghost" size="lg">
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
    </>
  )
}

// --- Interpretation helper ---

export function getRuneText(drawnRunes: DrawnRune[], position: string): { name: string; text: string } {
  const rune = drawnRunes.find(r => r.position === position)
  if (!rune) return { name: '', text: '' }
  const text = rune.orientation === 'reversed' && rune.rune.reversed_interpretation
    ? rune.rune.reversed_interpretation.toLowerCase()
    : rune.rune.interpretation.toLowerCase()
  return { name: rune.rune.name, text }
}
