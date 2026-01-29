import { motion } from 'framer-motion'
import { Sparkles, AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface AIInterpretationProps {
  interpretation: string | null
  loading: boolean
  error: string | null
  onRequestInterpretation: () => void
  onRetry?: () => void
}

export function AIInterpretation({
  interpretation,
  loading,
  error,
  onRequestInterpretation,
  onRetry
}: AIInterpretationProps) {
  // Not requested yet - show button
  if (!loading && !interpretation && !error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <Button
          onClick={onRequestInterpretation}
          variant="magic"
          size="lg"
          className="w-full"
        >
          <Sparkles className="w-5 h-5" />
          Gauti AI Interpretaciją
        </Button>
      </motion.div>
    )
  }

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 bg-purple-900/20 border border-purple-500/30 rounded-2xl p-6"
      >
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-8 h-8 text-purple-400" />
          </motion.div>
          <div className="text-center">
            <p className="text-purple-300 font-medium">Runų išmintis atskleidžiama...</p>
            <p className="text-gray-500 text-sm mt-1">AI analizuoja jūsų būrimą</p>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-purple-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 bg-red-900/20 border border-red-500/30 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-red-300 font-medium">Nepavyko gauti interpretacijos</p>
            <p className="text-gray-400 text-sm mt-1">{error}</p>
            {onRetry && (
              <Button
                onClick={onRetry}
                variant="secondary"
                size="sm"
                className="mt-4"
              >
                <RefreshCw className="w-4 h-4" />
                Bandyti dar kartą
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  // Success - show interpretation
  if (interpretation) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8"
      >
        <div className="bg-gradient-to-br from-purple-900/30 via-indigo-900/20 to-amber-900/20 border border-purple-500/30 rounded-2xl p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-lg font-cinzel font-semibold text-white">
                Runų Išmintis
              </h3>
              <p className="text-gray-500 text-sm">AI interpretacija</p>
            </div>
          </div>

          {/* Interpretation text */}
          <div className="prose prose-invert max-w-none">
            {interpretation.split('\n\n').map((paragraph, index) => (
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-gray-300 leading-relaxed mb-4 last:mb-0"
              >
                {paragraph}
              </motion.p>
            ))}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 pt-4 border-t border-purple-500/20 flex items-center justify-between"
          >
            <p className="text-gray-600 text-xs italic">
              „Runos kalba tiems, kurie klausosi širdimi"
            </p>
            <div className="flex items-center gap-2 text-purple-400/50 text-xs">
              <Sparkles className="w-3 h-3" />
              <span>Powered by AI</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    )
  }

  return null
}
