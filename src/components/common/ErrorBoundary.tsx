import { Component, type ReactNode } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    // Auto-reload on chunk load errors (after new deployment)
    if (
      error.message.includes('Failed to fetch dynamically imported module') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('ChunkLoadError')
    ) {
      window.location.reload()
      return { hasError: false, error: null }
    }
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)

    // Log error to Supabase
    void supabase.from('error_logs').insert({
      error_message: error.message,
      error_stack: error.stack?.slice(0, 2000) || null,
      component_stack: errorInfo.componentStack?.slice(0, 2000) || null,
      url: window.location.href,
      user_agent: navigator.userAgent,
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full text-center"
          >
            {/* Animated error icon */}
            <motion.div
              className="relative w-32 h-32 mx-auto mb-8"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <div className="absolute inset-0 rounded-full bg-red-500/20 border-2 border-red-500/30" />
              <div className="absolute inset-4 rounded-full bg-red-500/10 border border-red-500/20" />
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <AlertTriangle className="w-12 h-12 text-red-400" />
              </motion.div>

              {/* Floating runes */}
              {['ᚾ', 'ᛁ', 'ᛃ'].map((rune, i) => (
                <motion.span
                  key={i}
                  className="absolute text-red-400/40 text-xl"
                  style={{
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: Math.cos((i / 3) * Math.PI * 2) * 50 - 10,
                    y: Math.sin((i / 3) * Math.PI * 2) * 50 - 10,
                    opacity: [0.2, 0.5, 0.2],
                  }}
                  transition={{
                    opacity: { duration: 2, repeat: Infinity, delay: i * 0.3 },
                  }}
                >
                  {rune}
                </motion.span>
              ))}
            </motion.div>

            <h1 className="text-3xl font-cinzel font-bold text-white mb-4">
              Kažkas nutiko...
            </h1>

            <p className="text-gray-400 mb-6">
              Runos susidūrė su nenumatyta kliūtimi. Atsiprašome už nepatogumus.
            </p>

            {/* Error details - always visible for debugging */}
            {this.state.error && (
              <div className="mb-6 p-3 bg-gray-900/50 border border-red-800/50 rounded-lg text-left">
                <p className="text-red-400 text-xs font-mono break-all">
                  {this.state.error.message}
                </p>
                <p className="text-gray-600 text-[10px] mt-1 break-all">
                  {navigator.userAgent.slice(0, 120)}
                </p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 bg-purple-600 hover:bg-purple-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Bandyti dar kartą
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={this.handleGoHome}
                className="flex-1 py-3 px-4 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-white font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Home className="w-5 h-5" />
                Pradžia
              </motion.button>
            </div>

            {/* Mystical message */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 text-gray-600 text-sm italic"
            >
              „Kartais net runos turi pailsėti..."
            </motion.p>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}
