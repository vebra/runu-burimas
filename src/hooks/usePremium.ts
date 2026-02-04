import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import type { Subscription } from '../types/database'

// Admin code for free premium access
const ADMIN_CODE = 'RUNOSADMIN2026'

interface UsePremiumResult {
  isPremium: boolean
  subscription: Subscription | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  createCheckout: (priceId: string) => Promise<string | null>
  openCustomerPortal: () => Promise<string | null>
  activateWithCode: (code: string) => Promise<boolean>
}

export function usePremium(): UsePremiumResult {
  const { user, session } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async () => {
    if (!user) {
      setSubscription(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine for new users
        throw fetchError
      }

      setSubscription(data as Subscription | null)
    } catch (err) {
      console.error('Error fetching subscription:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch subscription')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const createCheckout = useCallback(async (priceId: string): Promise<string | null> => {
    if (!session?.access_token) {
      setError('Not authenticated')
      return null
    }

    try {
      const response = await supabase.functions.invoke('create-checkout', {
        body: { priceId },
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      return response.data?.url || null
    } catch (err) {
      console.error('Checkout error:', err)
      setError(err instanceof Error ? err.message : 'Failed to create checkout')
      return null
    }
  }, [session?.access_token])

  const openCustomerPortal = useCallback(async (): Promise<string | null> => {
    if (!session?.access_token) {
      setError('Not authenticated')
      return null
    }

    try {
      const response = await supabase.functions.invoke('create-portal', {})

      if (response.error) {
        throw new Error(response.error.message)
      }

      return response.data?.url || null
    } catch (err) {
      console.error('Portal error:', err)
      setError(err instanceof Error ? err.message : 'Failed to open portal')
      return null
    }
  }, [session?.access_token])

  const activateWithCode = useCallback(async (code: string): Promise<boolean> => {
    if (!user) {
      setError('Not authenticated')
      return false
    }

    if (code !== ADMIN_CODE) {
      setError('Neteisingas kodas')
      return false
    }

    try {
      // Set expiry to 100 years from now
      const expiryDate = new Date()
      expiryDate.setFullYear(expiryDate.getFullYear() + 100)

      // Check if subscription exists
      const { data: existing } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (existing) {
        // Update existing subscription
        const { error: updateError } = await supabase
          .from('subscriptions')
          .update({
            status: 'active',
            plan_type: 'admin',
            current_period_start: new Date().toISOString(),
            current_period_end: expiryDate.toISOString(),
            cancel_at_period_end: false,
          })
          .eq('user_id', user.id)

        if (updateError) throw updateError
      } else {
        // Create new subscription
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert({
            user_id: user.id,
            status: 'active',
            plan_type: 'admin',
            current_period_start: new Date().toISOString(),
            current_period_end: expiryDate.toISOString(),
            cancel_at_period_end: false,
          })

        if (insertError) throw insertError
      }

      await fetchSubscription()
      return true
    } catch (err) {
      console.error('Admin activation error:', err)
      setError(err instanceof Error ? err.message : 'Failed to activate')
      return false
    }
  }, [user, fetchSubscription])

  // Check if user has active premium
  const isPremium = subscription?.status === 'active'

  return {
    isPremium,
    subscription,
    loading,
    error,
    refetch: fetchSubscription,
    createCheckout,
    openCustomerPortal,
    activateWithCode,
  }
}
