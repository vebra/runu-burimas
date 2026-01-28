import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Rune, DailyRune, Divination, RuneSpread } from '../types/database'
import { sanitizeNotes, sanitizeQuestion } from '../utils/sanitize'

export function useRunes() {
  const [runes, setRunes] = useState<Rune[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRunes()
  }, [])

  const fetchRunes = async () => {
    try {
      setLoading(true)
      console.log('Fetching runes...')
      const { data, error } = await supabase
        .from('runes')
        .select('*')
        .order('position', { ascending: true })

      console.log('Runes response:', { data, error })
      if (error) throw error
      setRunes(data || [])
    } catch (err) {
      console.error('Runes fetch error:', err)
      setError(err instanceof Error ? err.message : 'Nepavyko gauti runų')
    } finally {
      setLoading(false)
    }
  }

  const getRandomRune = (): Rune | null => {
    if (runes.length === 0) return null
    const randomIndex = Math.floor(Math.random() * runes.length)
    return runes[randomIndex]
  }

  const getRandomOrientation = (): 'upright' | 'reversed' => {
    return Math.random() > 0.5 ? 'upright' : 'reversed'
  }

  return {
    runes,
    loading,
    error,
    getRandomRune,
    getRandomOrientation,
    refetch: fetchRunes,
  }
}

export function useDailyRune() {
  const [todayRune, setTodayRune] = useState<DailyRune | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchTodayRune = async (userId: string) => {
    try {
      setLoading(true)
      const today = new Date().toISOString().split('T')[0]
      console.log('Fetching today rune for:', userId, today)

      const { data, error } = await supabase
        .from('daily_runes')
        .select(`
          *,
          rune:runes(*)
        `)
        .eq('user_id', userId)
        .eq('date', today)
        .maybeSingle()

      console.log('Today rune result:', { data, error })

      if (error) throw error
      setTodayRune(data as DailyRune | null)
    } catch (err) {
      console.error('Error fetching daily rune:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveDailyRune = async (
    userId: string,
    runeId: string,
    orientation: string
  ) => {
    const today = new Date().toISOString().split('T')[0]

    console.log('Saving daily rune:', { userId, runeId, orientation, today })

    const { data, error } = await supabase
      .from('daily_runes')
      .insert({
        user_id: userId,
        rune_id: runeId,
        date: today,
        orientation,
      })
      .select(`
        *,
        rune:runes(*)
      `)
      .single()

    console.log('Save result:', { data, error })

    if (error) throw error
    setTodayRune(data as DailyRune)
    return data
  }

  const updateReflection = async (dailyRuneId: string, reflection: string) => {
    const sanitized = sanitizeNotes(reflection)
    const { error } = await supabase
      .from('daily_runes')
      .update({ reflection: sanitized })
      .eq('id', dailyRuneId)

    if (error) throw error
    setTodayRune(prev => prev ? { ...prev, reflection: sanitized } : null)
  }

  const updateNotes = async (dailyRuneId: string, notes: string) => {
    const sanitized = sanitizeNotes(notes)
    const { error } = await supabase
      .from('daily_runes')
      .update({ notes: sanitized })
      .eq('id', dailyRuneId)

    if (error) throw error
    setTodayRune(prev => prev ? { ...prev, notes: sanitized } : null)
  }

  return {
    todayRune,
    loading,
    fetchTodayRune,
    saveDailyRune,
    updateReflection,
    updateNotes,
  }
}

export function useDivinations() {
  const [divinations, setDivinations] = useState<Divination[]>([])
  const [loading, setLoading] = useState(false)

  const fetchDivinations = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('divinations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setDivinations(data || [])
    } catch (err) {
      console.error('Error fetching divinations:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveThreeRuneSpread = async (
    userId: string,
    runeSpread: RuneSpread[],
    question?: string
  ) => {
    const { data, error } = await supabase
      .from('divinations')
      .insert({
        user_id: userId,
        divination_type: 'three_rune',
        runes: runeSpread,
        question: question || null,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const saveDivination = async (
    userId: string,
    divinationType: string,
    runeSpread: RuneSpread[],
    question?: string | null,
    notes?: string | null
  ) => {
    const sanitizedQuestion = question ? sanitizeQuestion(question) : null
    const sanitizedNotes = notes ? sanitizeNotes(notes) : null
    
    const { data, error } = await supabase
      .from('divinations')
      .insert({
        user_id: userId,
        divination_type: divinationType,
        runes: runeSpread,
        question: sanitizedQuestion,
        notes: sanitizedNotes,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  const updateDivinationNotes = async (divinationId: string, notes: string) => {
    const sanitized = sanitizeNotes(notes)
    const { error } = await supabase
      .from('divinations')
      .update({ notes: sanitized })
      .eq('id', divinationId)

    if (error) throw error
  }

  return {
    divinations,
    loading,
    fetchDivinations,
    saveThreeRuneSpread,
    saveDivination,
    updateDivinationNotes,
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const fetchFavorites = async (userId: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_favorite_runes')
        .select('rune_id')
        .eq('user_id', userId)

      if (error) throw error
      setFavorites(data?.map(f => f.rune_id) || [])
    } catch (err) {
      console.error('Error fetching favorites:', err)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (userId: string, runeId: string) => {
    const isFavorite = favorites.includes(runeId)

    if (isFavorite) {
      const { error } = await supabase
        .from('user_favorite_runes')
        .delete()
        .eq('user_id', userId)
        .eq('rune_id', runeId)

      if (error) throw error
      setFavorites(prev => prev.filter(id => id !== runeId))
    } else {
      const { error } = await supabase
        .from('user_favorite_runes')
        .insert({ user_id: userId, rune_id: runeId })

      if (error) throw error
      setFavorites(prev => [...prev, runeId])
    }
  }

  return {
    favorites,
    loading,
    fetchFavorites,
    toggleFavorite,
    isFavorite: (runeId: string) => favorites.includes(runeId),
  }
}
