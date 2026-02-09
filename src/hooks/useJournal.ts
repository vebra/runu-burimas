import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { JournalEntry } from '../types/database'

interface UseJournalResult {
  entries: JournalEntry[]
  loading: boolean
  saving: boolean
  error: string | null
  fetchEntries: (userId: string, limit?: number) => Promise<void>
  fetchEntry: (userId: string, date: string) => Promise<JournalEntry | null>
  saveEntry: (userId: string, entry: {
    date: string
    content: string
    mood?: string | null
    rune_id?: string | null
    rune_name?: string | null
    rune_symbol?: string | null
    tags?: string[] | null
  }) => Promise<JournalEntry | null>
  deleteEntry: (entryId: string) => Promise<boolean>
  getMonthEntries: (userId: string, year: number, month: number) => Promise<JournalEntry[]>
  getStats: (userId: string) => Promise<JournalStats | null>
}

export interface JournalStats {
  totalEntries: number
  currentStreak: number
  longestStreak: number
  topMoods: { mood: string; count: number }[]
  topRunes: { name: string; symbol: string; count: number }[]
}

export function useJournal(): UseJournalResult {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEntries = useCallback(async (userId: string, limit = 30) => {
    setLoading(true)
    setError(null)
    try {
      const { data, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError
      setEntries((data as JournalEntry[]) || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko gauti įrašų')
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchEntry = useCallback(async (userId: string, date: string): Promise<JournalEntry | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', date)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      return (data as JournalEntry) || null
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko gauti įrašo')
      return null
    }
  }, [])

  const saveEntry = useCallback(async (userId: string, entry: {
    date: string
    content: string
    mood?: string | null
    rune_id?: string | null
    rune_name?: string | null
    rune_symbol?: string | null
    tags?: string[] | null
  }): Promise<JournalEntry | null> => {
    setSaving(true)
    setError(null)
    try {
      // Check if entry exists for this date
      const { data: existing } = await supabase
        .from('journal_entries')
        .select('id')
        .eq('user_id', userId)
        .eq('date', entry.date)
        .single()

      let result
      if (existing) {
        // Update
        const { data, error: updateError } = await supabase
          .from('journal_entries')
          .update({
            content: entry.content,
            mood: entry.mood || null,
            rune_id: entry.rune_id || null,
            rune_name: entry.rune_name || null,
            rune_symbol: entry.rune_symbol || null,
            tags: entry.tags || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single()

        if (updateError) throw updateError
        result = data
      } else {
        // Insert
        const { data, error: insertError } = await supabase
          .from('journal_entries')
          .insert({
            user_id: userId,
            date: entry.date,
            content: entry.content,
            mood: entry.mood || null,
            rune_id: entry.rune_id || null,
            rune_name: entry.rune_name || null,
            rune_symbol: entry.rune_symbol || null,
            tags: entry.tags || null,
          })
          .select()
          .single()

        if (insertError) throw insertError
        result = data
      }

      // Update local state
      setEntries(prev => {
        const filtered = prev.filter(e => e.date !== entry.date)
        return [result as JournalEntry, ...filtered].sort((a, b) => b.date.localeCompare(a.date))
      })

      return result as JournalEntry
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko išsaugoti')
      return null
    } finally {
      setSaving(false)
    }
  }, [])

  const deleteEntry = useCallback(async (entryId: string): Promise<boolean> => {
    try {
      const { error: deleteError } = await supabase
        .from('journal_entries')
        .delete()
        .eq('id', entryId)

      if (deleteError) throw deleteError
      setEntries(prev => prev.filter(e => e.id !== entryId))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko ištrinti įrašo')
      return false
    }
  }, [])

  const getMonthEntries = useCallback(async (userId: string, year: number, month: number): Promise<JournalEntry[]> => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`
    const endDate = `${year}-${String(month).padStart(2, '0')}-31`

    try {
      const { data, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })

      if (fetchError) throw fetchError
      return (data as JournalEntry[]) || []
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko gauti mėnesio įrašų')
      return []
    }
  }, [])

  const getStats = useCallback(async (userId: string): Promise<JournalStats | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('journal_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (fetchError) throw fetchError
      if (!data || data.length === 0) return null

      const allEntries = data as JournalEntry[]

      // Streak calculation
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      for (let i = 0; i < allEntries.length; i++) {
        const entryDate = new Date(allEntries[i].date)
        entryDate.setHours(0, 0, 0, 0)
        const expectedDate = new Date(today)
        expectedDate.setDate(today.getDate() - i)
        expectedDate.setHours(0, 0, 0, 0)

        if (entryDate.getTime() === expectedDate.getTime()) {
          tempStreak++
        } else {
          break
        }
      }
      currentStreak = tempStreak

      // Longest streak
      tempStreak = 1
      for (let i = 1; i < allEntries.length; i++) {
        const prev = new Date(allEntries[i - 1].date)
        const curr = new Date(allEntries[i].date)
        const diffDays = (prev.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24)
        if (Math.round(diffDays) === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      longestStreak = Math.max(longestStreak, tempStreak, currentStreak)

      // Top moods
      const moodCounts: Record<string, number> = {}
      allEntries.forEach(e => {
        if (e.mood) moodCounts[e.mood] = (moodCounts[e.mood] || 0) + 1
      })
      const topMoods = Object.entries(moodCounts)
        .map(([mood, count]) => ({ mood, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Top runes
      const runeCounts: Record<string, { name: string; symbol: string; count: number }> = {}
      allEntries.forEach(e => {
        if (e.rune_name && e.rune_symbol) {
          const key = e.rune_name
          if (!runeCounts[key]) runeCounts[key] = { name: e.rune_name, symbol: e.rune_symbol, count: 0 }
          runeCounts[key].count++
        }
      })
      const topRunes = Object.values(runeCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      return {
        totalEntries: allEntries.length,
        currentStreak,
        longestStreak,
        topMoods,
        topRunes,
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepavyko gauti statistikos')
      return null
    }
  }, [])

  return {
    entries,
    loading,
    saving,
    error,
    fetchEntries,
    fetchEntry,
    saveEntry,
    deleteEntry,
    getMonthEntries,
    getStats,
  }
}
