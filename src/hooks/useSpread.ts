import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { useRunes, useDivinations } from './useRunes'
import { useToast } from '../components/common/Toast'
import { useAIInterpretation } from './useAIInterpretation'
import type { Rune } from '../types/database'

export interface DrawnRune<P extends string = string> {
  rune: Rune
  position: P
  orientation: 'upright' | 'reversed'
}

export interface PositionLabel {
  label: string
  description: string
  emoji?: string
}

interface SpreadConfig<P extends string> {
  positions: P[]
  divinationType: string
  drawDelay?: number
}

export function useSpread<P extends string>(config: SpreadConfig<P>) {
  const { positions, divinationType, drawDelay = 2000 } = config

  const { user } = useAuth()
  const { runes, loading: runesLoading, getRandomOrientation } = useRunes()
  const { saveDivination, updateDivinationNotes } = useDivinations()
  const toast = useToast()

  const {
    interpretation,
    loading: aiLoading,
    error: aiError,
    getInterpretation,
    clearInterpretation
  } = useAIInterpretation()

  const [question, setQuestion] = useState('')
  const [isDrawing, setIsDrawing] = useState(false)
  const [drawnRunes, setDrawnRunes] = useState<DrawnRune<P>[]>([])
  const [revealedPositions, setRevealedPositions] = useState<Set<P>>(new Set())
  const [spreadComplete, setSpreadComplete] = useState(false)
  const [saving, setSaving] = useState(false)
  const [notes, setNotes] = useState('')
  const [savingNotes, setSavingNotes] = useState(false)
  const [divinationId, setDivinationId] = useState<string | null>(null)

  const runeCount = positions.length

  // Detect spread completion
  useEffect(() => {
    if (drawnRunes.length === runeCount && revealedPositions.size === runeCount) {
      setSpreadComplete(true)
      if (user) {
        saveDivinationToDb()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedPositions])

  const saveDivinationToDb = async () => {
    if (!user || drawnRunes.length !== runeCount) return

    setSaving(true)
    try {
      const result = await saveDivination(
        user.id,
        divinationType,
        drawnRunes.map(d => ({
          rune_id: d.rune.id,
          position: d.position,
          orientation: d.orientation,
        })),
        question || null
      )
      if (result?.id) {
        setDivinationId(result.id)
        toast.success('Būrimas išsaugotas!')
      }
    } catch {
      toast.error('Nepavyko išsaugoti būrimo')
    }
    setSaving(false)
  }

  const saveNotes = useCallback(async () => {
    if (!divinationId) return

    setSavingNotes(true)
    try {
      await updateDivinationNotes(divinationId, notes)
      toast.success('Dienoraštis išsaugotas!')
    } catch {
      toast.error('Nepavyko išsaugoti dienoraščio')
    }
    setSavingNotes(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [divinationId, notes])

  const draw = useCallback(async () => {
    if (!user || runes.length === 0 || !question.trim()) return

    setIsDrawing(true)
    setRevealedPositions(new Set())
    setSpreadComplete(false)

    await new Promise(resolve => setTimeout(resolve, drawDelay))

    const drawn: DrawnRune<P>[] = []
    const usedIndices = new Set<number>()

    for (const position of positions) {
      let runeIndex: number
      do {
        runeIndex = Math.floor(Math.random() * runes.length)
      } while (usedIndices.has(runeIndex))

      usedIndices.add(runeIndex)
      drawn.push({
        rune: runes[runeIndex],
        position,
        orientation: getRandomOrientation(),
      })
    }

    setDrawnRunes(drawn)
    setIsDrawing(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, runes, question, positions, drawDelay])

  const revealRune = useCallback((position: P) => {
    setRevealedPositions(prev => new Set([...prev, position]))
  }, [])

  const reset = useCallback(() => {
    setQuestion('')
    setDrawnRunes([])
    setRevealedPositions(new Set())
    setSpreadComplete(false)
    setNotes('')
    setDivinationId(null)
    clearInterpretation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const requestAIInterpretation = useCallback((
    positionLabels: Record<P, PositionLabel>,
    spreadType?: string
  ) => {
    const runeData = drawnRunes.map(r => ({
      name: r.rune.name,
      symbol: r.rune.symbol,
      meaning: r.rune.interpretation,
      reversed_meaning: r.rune.reversed_interpretation || undefined,
      orientation: r.orientation,
      position: `${positionLabels[r.position].emoji || ''} ${positionLabels[r.position].label}`.trim()
    }))
    getInterpretation(runeData, (spreadType || divinationType) as Parameters<typeof getInterpretation>[1], question || undefined)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drawnRunes, question, divinationType])

  return {
    // Auth & loading
    user,
    runesLoading,
    runes,

    // State
    question,
    setQuestion,
    isDrawing,
    drawnRunes,
    revealedPositions,
    spreadComplete,
    saving,
    notes,
    setNotes,
    savingNotes,
    divinationId,

    // AI
    interpretation,
    aiLoading,
    aiError,

    // Actions
    draw,
    revealRune,
    reset,
    saveNotes,
    requestAIInterpretation,
  }
}
