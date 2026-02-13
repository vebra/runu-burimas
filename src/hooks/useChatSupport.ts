import { useState, useCallback, useRef } from 'react'
import { useAuth } from './useAuth'
import { usePremium } from './usePremium'
import { supabase } from '../lib/supabase'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface UseChatSupportReturn {
  messages: ChatMessage[]
  sendMessage: (content: string) => Promise<void>
  isLoading: boolean
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  clearMessages: () => void
}

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Sveiki! 👋 Esu Runų Būrimo pagalbos asistentas. Kaip galiu jums padėti?',
  timestamp: new Date(),
}

export function useChatSupport(): UseChatSupportReturn {
  const { user, session } = useAuth()
  const { isPremium } = usePremium()
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  const detectLanguage = useCallback((text: string): 'lt' | 'en' => {
    const ltChars = /[ąčęėįšųūžĄČĘĖĮŠŲŪŽ]/
    const ltWords = /\b(kaip|kas|kur|kodėl|ar|noriu|pagalba|kaina|mėn|metai|naudoti|atšaukti|prenumerata)\b/i
    if (ltChars.test(text) || ltWords.test(text)) return 'lt'
    return 'en'
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      const language = detectLanguage(content)

      // Build history for context (last 10 messages)
      const history = [...messages.slice(-10), userMessage].map(m => ({
        role: m.role,
        content: m.content,
      }))

      const { data, error } = await supabase.functions.invoke('chat-support', {
        body: {
          message: content.trim(),
          history,
          language,
          context: {
            isPremium,
            email: user?.email,
          },
        },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      })

      if (error) throw error

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data?.reply || (language === 'lt'
          ? 'Atsiprašau, įvyko klaida. Bandykite dar kartą.'
          : 'Sorry, an error occurred. Please try again.'),
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      if ((err as Error).name === 'AbortError') return

      const assistantMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Atsiprašau, šiuo metu negaliu atsakyti. Bandykite vėliau arba kreipkitės el. paštu.',
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, assistantMessage])
    } finally {
      setIsLoading(false)
    }
  }, [messages, isLoading, detectLanguage, isPremium, user, session])

  const clearMessages = useCallback(() => {
    setMessages([WELCOME_MESSAGE])
  }, [])

  return {
    messages,
    sendMessage,
    isLoading,
    isOpen,
    setIsOpen,
    clearMessages,
  }
}
