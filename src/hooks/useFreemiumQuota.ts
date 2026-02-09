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
  refetch: () => Promise<void>
}

export function useFreemiumQuota(): UseFreemiumQuotaResult {
  const { user } = useAuth()
  const [usedCount, setUsedCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchUsage = useCallback(async () => {
    if (!user) {
      setUsedCount(0)
      setLoading(false)
      return
    }

    try {
      setLoading(true)

      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

      const { count, error } = await supabase
        .from('divinations')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('divination_type', PREMIUM_DIVINATION_TYPES)
        .gte('created_at', monthStart)

      if (error) throw error

      setUsedCount(count ?? 0)
    } catch {
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
    refetch: fetchUsage,
  }
}
