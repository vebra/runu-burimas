import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export const FREE_MONTHLY_LIMIT = 3

const PREMIUM_DIVINATION_TYPES = [
  'celtic_cross',
  'five_rune_cross',
  'seven_rune_map',
  'love_reading',
]

interface UseFreemiumQuotaResult {
  usedCount: number
  remainingCount: number
  isQuotaExceeded: boolean
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useFreemiumQuota(): UseFreemiumQuotaResult {
  const { user } = useAuth()
  const [usedCount, setUsedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setUsedCount(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { count, error: fetchError } = await supabase
        .from('divinations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('divination_type', PREMIUM_DIVINATION_TYPES)
        .gte('created_at', monthStart)

      if (fetchError) throw fetchError

      setUsedCount(count ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko patikrinti kvotos')
      setUsedCount(0)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  const remainingCount = Math.max(0, FREE_MONTHLY_LIMIT - usedCount)
  const isQuotaExceeded = usedCount >= FREE_MONTHLY_LIMIT

  return {
    usedCount,
    remainingCount,
    isQuotaExceeded,
    loading,
    error,
    refetch: fetchUsage,
  }
}
