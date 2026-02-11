import { useState, useRef, useEffect, Component, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Sparkles, RotateCcw } from 'lucide-react'
import { useChatSupport } from '../../hooks/useChatSupport'

const QUICK_ACTIONS = [
  { label: '💰 Kainos', message: 'Kokios yra prenumeratos kainos?' },
  { label: '✨ Premium', message: 'Ką gaunu su Premium prenumerata?' },
  { label: '🔮 Kaip naudoti?', message: 'Kaip naudotis runų būrimu?' },
  { label: '❌ Atšaukti', message: 'Kaip atšaukti prenumeratą?' },
]

class ChatErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  state = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(error: Error) { console.error('ChatWidget error:', error) }
  render() { return this.state.hasError ? null : this.props.children }
}

export function ChatWidget() {
  return createPortal(
    <ChatErrorBoundary>
      <ChatWidgetInner />
    </ChatErrorBoundary>,
    document.body
  )
}

function ChatWidgetInner() {
  const { messages, sendMessage, isLoading, isOpen, setIsOpen, clearMessages } = useChatSupport()
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const msg = input
    setInput('')
    await sendMessage(msg)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const showQuickActions = messages.length <= 1

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center
              bg-gradient-to-br from-purple-700 to-purple-900
              border-2 border-amber-500/40 shadow-lg shadow-purple-900/50
              cursor-pointer group"
            aria-label="Atidaryti pagalbos pokalbį"
          >
            <MessageCircle className="w-6 h-6 text-amber-300 group-hover:text-amber-200 transition-colors" />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-amber-400/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed z-50 flex flex-col rounded-2xl overflow-hidden
              bg-gray-950/95 backdrop-blur-xl border border-amber-600/20
              shadow-2xl shadow-purple-900/30
              bottom-0 right-0 w-full h-[75vh] rounded-b-none
              sm:bottom-6 sm:right-6 sm:w-[380px] sm:h-[500px] sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5
              bg-gradient-to-r from-purple-900/80 to-gray-900/80
              border-b border-amber-600/20 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-cinzel font-semibold text-amber-100">
                  Runų Pagalba
                </h3>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={clearMessages}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Išvalyti pokalbį"
                  title="Išvalyti pokalbį"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-purple-300" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  aria-label="Uždaryti pokalbį"
                >
                  <X className="w-3.5 h-3.5 text-purple-300" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3 min-h-0">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-2xl text-[13px] leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-purple-700/60 text-purple-50 rounded-br-sm'
                        : 'bg-gray-800/80 text-gray-200 rounded-bl-sm border border-amber-600/10'
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {/* Quick Actions */}
              {showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap gap-1.5 pt-2"
                >
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => sendMessage(action.message)}
                      disabled={isLoading}
                      className="px-2.5 py-1 text-xs rounded-full
                        bg-purple-800/40 border border-purple-500/30
                        text-purple-200 hover:bg-purple-700/50 hover:border-amber-500/30
                        transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {action.label}
                    </button>
                  ))}
                </motion.div>
              )}

              {/* Loading indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-gray-800/80 border border-amber-600/10 px-4 py-2 rounded-2xl rounded-bl-sm">
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <motion.span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-purple-400"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                        />
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-amber-600/15 bg-gray-900/80 shrink-0
              sm:py-2.5 sm:pb-2.5">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Rašykite žinutę..."
                  disabled={isLoading}
                  className="flex-1 bg-gray-800/60 border border-purple-500/20 rounded-xl
                    px-4 py-3.5 text-base text-white placeholder-gray-500
                    focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                    disabled:opacity-50 transition-colors
                    sm:py-2"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-3.5 rounded-xl bg-purple-700/70 hover:bg-purple-600/70
                    disabled:opacity-30 disabled:cursor-not-allowed
                    transition-colors cursor-pointer
                    sm:p-2"
                  aria-label="Siųsti žinutę"
                >
                  <Send className="w-6 h-6 text-amber-300 sm:w-4 sm:h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
