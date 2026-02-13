import { useState, Component, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, X, Send, Sparkles, CheckCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

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
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || sending) return

    const senderEmail = email.trim() || user?.email || 'Nenurodyta'
    const senderName = name.trim() || 'Anonimas'

    setSending(true)
    try {
      // Save to Supabase for record keeping
      await supabase.from('contact_messages').insert({
        name: senderName,
        email: senderEmail,
        message: message.trim(),
        user_id: user?.id || null,
      })

      // Open mailto as fallback to ensure delivery
      const subject = encodeURIComponent(`Žinutė iš runes.lt - ${senderName}`)
      const body = encodeURIComponent(
        `Vardas: ${senderName}\nEl. paštas: ${senderEmail}\n\nŽinutė:\n${message.trim()}`
      )
      window.open(`mailto:info@runes.lt?subject=${subject}&body=${body}`, '_blank')

      setSent(true)
      setMessage('')
      setName('')
      setEmail('')

      setTimeout(() => {
        setSent(false)
        setIsOpen(false)
      }, 3000)
    } catch {
      // If Supabase fails, still open mailto
      const subject = encodeURIComponent(`Žinutė iš runes.lt`)
      const body = encodeURIComponent(
        `Vardas: ${name.trim() || 'Anonimas'}\nEl. paštas: ${email.trim() || 'Nenurodyta'}\n\nŽinutė:\n${message.trim()}`
      )
      window.location.href = `mailto:info@runes.lt?subject=${subject}&body=${body}`
    } finally {
      setSending(false)
    }
  }

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
            aria-label="Susisiekti"
          >
            <Mail className="w-6 h-6 text-amber-300 group-hover:text-amber-200 transition-colors" />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-amber-400/30"
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Contact Form Window */}
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
              bottom-0 right-0 w-full rounded-b-none
              sm:bottom-6 sm:right-6 sm:w-[380px] sm:rounded-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5
              bg-gradient-to-r from-purple-900/80 to-gray-900/80
              border-b border-amber-600/20 shrink-0">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-cinzel font-semibold text-amber-100">
                  Susisiekite su mumis
                </h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                aria-label="Uždaryti"
              >
                <X className="w-3.5 h-3.5 text-purple-300" />
              </button>
            </div>

            {/* Form */}
            {sent ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-3 py-12 px-4"
              >
                <CheckCircle className="w-12 h-12 text-green-400" />
                <p className="text-white font-cinzel font-semibold">Žinutė išsiųsta!</p>
                <p className="text-gray-400 text-sm text-center">
                  Atsakysime kuo greičiau į jūsų el. paštą.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
                <p className="text-gray-400 text-xs mb-1">
                  Parašykite mums ir atsakysime el. paštu.
                </p>

                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jūsų vardas"
                  className="bg-gray-800/60 border border-purple-500/20 rounded-xl
                    px-4 py-2.5 text-sm text-white placeholder-gray-500
                    focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                    transition-colors"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={user?.email || 'Jūsų el. paštas'}
                  className="bg-gray-800/60 border border-purple-500/20 rounded-xl
                    px-4 py-2.5 text-sm text-white placeholder-gray-500
                    focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                    transition-colors"
                />

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Jūsų žinutė..."
                  required
                  rows={4}
                  className="bg-gray-800/60 border border-purple-500/20 rounded-xl
                    px-4 py-2.5 text-sm text-white placeholder-gray-500
                    focus:outline-none focus:border-amber-500/40 focus:ring-1 focus:ring-amber-500/20
                    transition-colors resize-none"
                />

                <button
                  type="submit"
                  disabled={!message.trim() || sending}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl
                    bg-purple-700/70 hover:bg-purple-600/70 text-amber-200
                    disabled:opacity-30 disabled:cursor-not-allowed
                    transition-colors cursor-pointer font-medium text-sm"
                >
                  <Send className="w-4 h-4" />
                  {sending ? 'Siunčiama...' : 'Siųsti žinutę'}
                </button>

                <a
                  href="mailto:info@runes.lt"
                  className="text-center text-xs text-gray-500 hover:text-amber-400 transition-colors"
                >
                  arba rašykite tiesiogiai: info@runes.lt
                </a>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
