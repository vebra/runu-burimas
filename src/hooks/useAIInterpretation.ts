import { useState } from 'react'
import { supabase } from '../lib/supabase'

interface RuneData {
  name: string
  symbol: string
  meaning: string
  reversed_meaning?: string
  orientation: 'upright' | 'reversed'
  position: string
}

type SpreadType = 'daily' | 'three_rune' | 'five_rune' | 'seven_rune' | 'yes_no' | 'celtic_cross' | 'love_reading'

interface UseAIInterpretationReturn {
  interpretation: string | null
  loading: boolean
  error: string | null
  getInterpretation: (runes: RuneData[], spreadType: SpreadType, question?: string) => Promise<void>
  clearInterpretation: () => void
}

export function useAIInterpretation(): UseAIInterpretationReturn {
  const [interpretation, setInterpretation] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getInterpretation = async (
    runes: RuneData[],
    spreadType: SpreadType,
    question?: string
  ) => {
    setLoading(true)
    setError(null)
    setInterpretation(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Turite būti prisijungę')
      }

      const response = await supabase.functions.invoke('interpret-runes', {
        body: {
          runes,
          spread_type: spreadType,
          question
        }
      })

      if (response.error) {
        throw new Error(response.error.message || 'Nepavyko gauti interpretacijos')
      }

      setInterpretation(response.data.interpretation)
    } catch (err) {
      console.error('AI interpretation error:', err)
      setError(err instanceof Error ? err.message : 'Klaida gaunant interpretaciją')
    } finally {
      setLoading(false)
    }
  }

  const clearInterpretation = () => {
    setInterpretation(null)
    setError(null)
  }

  return {
    interpretation,
    loading,
    error,
    getInterpretation,
    clearInterpretation
  }
}
