import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { History, ChevronDown, ChevronUp, Sparkles, MessageCircle, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useSEO } from '../hooks/useSEO'
import { useRunes } from '../hooks/useRunes'
import { supabase } from '../lib/supabase'
import { useToast } from '../components/common/Toast'
import type { Rune } from '../types/database'

interface DivinationRecord {
  id: string
  divination_type: string
  runes: { rune_id: string; position: string; orientation: string }[]
  question: string | null
  notes: string | null
  created_at: string
}

interface DailyRuneRecord {
  id: string
  rune_id: string
  date: string
  orientation: string
  reflection: string | null
  notes: string | null
  created_at: string
}

type HistoryItem = 
  | { type: 'divination'; data: DivinationRecord; date: string }
  | { type: 'daily'; data: DailyRuneRecord; date: string }

const DIVINATION_LABELS: Record<string, { name: string; emoji: string }> = {
  'three_rune': { name: '3 Runų Būrimas', emoji: '✨' },
  'yes_no': { name: 'Taip/Ne Būrimas', emoji: '🎱' },
  'five_rune_cross': { name: '5 Runų Kryžius', emoji: '✝️' },
  'seven_rune_map': { name: '7 Runų Žemėlapis', emoji: '🗺️' },
  'love_reading': { name: 'Meilės Būrimas', emoji: '💕' },
  'celtic_cross': { name: 'Keltų Kryžius', emoji: '🔮' },
}

function getRuneById(runes: Rune[], id: string): Rune | undefined {
  return runes.find(r => r.id === id)
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('lt-LT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ReadingHistory() {
  useSEO({
    title: 'Būrimų Istorija',
    description: 'Jūsų visų atliktų Elder Futhark runų būrimų ir kasdienių runų istorija.',
    noindex: true,
  })
  const { user } = useAuth()
  const { runes } = useRunes()
  const toast = useToast()
  const hasFetched = useRef(false)

  const [history, setHistory] = useState<HistoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'divinations' | 'daily'>('all')
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!user || hasFetched.current) return
    hasFetched.current = true
    loadHistory()
  }, [user])

  const loadHistory = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [divRes, dailyRes] = await Promise.all([
        supabase
          .from('divinations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase
          .from('daily_runes')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(50),
      ])

      const items: HistoryItem[] = []

      if (divRes.data) {
        for (const d of divRes.data) {
          items.push({ type: 'divination', data: d as DivinationRecord, date: d.created_at })
        }
      }

      if (dailyRes.data) {
        for (const d of dailyRes.data) {
          items.push({ type: 'daily', data: d as DailyRuneRecord, date: d.created_at })
        }
      }

      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      setHistory(items)
    } catch {
      toast.error('Nepavyko užkrauti istorijos')
    }
    setLoading(false)
  }

  const handleDelete = async (item: HistoryItem) => {
    const id = item.type === 'divination' ? item.data.id : item.data.id
    setDeleting(id)
    try {
      const table = item.type === 'divination' ? 'divinations' : 'daily_runes'
      const { error } = await supabase.from(table).delete().eq('id', id)
      if (error) throw error
      setHistory(prev => prev.filter(h => {
        const hId = h.type === 'divination' ? h.data.id : h.data.id
        return hId !== id
      }))
      toast.success('Įrašas ištrintas')
    } catch {
      toast.error('Nepavyko ištrinti')
    }
    setDeleting(null)
  }

  const filtered = history.filter(item => {
    if (filter === 'all') return true
    if (filter === 'divinations') return item.type === 'divination'
    return item.type === 'daily'
  })

  if (!user) {
    return (
      <div className="min-h-screen py-12 px-4" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <div className="text-center" style={{ width: '100%', maxWidth: '448px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <span className="text-6xl block">🔐</span>
          <h2 className="text-2xl font-cinzel font-bold text-white">Prisijunkite</h2>
          <p className="text-gray-400">Norėdami matyti istoriją, turite prisijungti.</p>
          <Link
            to="/auth"
            className="bg-linear-to-r from-purple-800 via-purple-700 to-violet-600 hover:from-purple-700 hover:via-purple-600 hover:to-violet-500 text-amber-100 font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-purple-900/30 border border-amber-600/20"
          >
            Prisijungti
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 pt-8 md:pt-32 pb-40" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '768px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-purple-900/50 border border-purple-500/30">
            <History className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-cinzel font-bold text-white">
            Būrimų Istorija
          </h1>
          <p className="text-gray-400 text-base">
            Jūsų visi atlikti būrimai ir kasdienės runos
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 justify-center flex-wrap"
          style={{ marginBottom: '2rem' }}
        >
          {[
            { key: 'all' as const, label: 'Visi', count: history.length },
            { key: 'divinations' as const, label: 'Būrimai', count: history.filter(h => h.type === 'divination').length },
            { key: 'daily' as const, label: 'Kasdienės', count: history.filter(h => h.type === 'daily').length },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === f.key
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white border border-gray-700'
              }`}
            >
              {f.label} ({f.count})
            </button>
          ))}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-5 animate-pulse">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-gray-700/50 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 w-40 bg-gray-700/50 rounded mb-2" />
                    <div className="h-3 w-24 bg-gray-700/50 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <span className="text-6xl block mb-4">📜</span>
            <h3 className="text-xl font-cinzel font-semibold text-white mb-2">
              Istorija tuščia
            </h3>
            <p className="text-gray-400 mb-6">
              Atlikite pirmą būrimą ir jis atsiras čia!
            </p>
            <Link
              to="/three-rune"
              className="inline-flex items-center gap-2 bg-linear-to-r from-purple-800 via-purple-700 to-violet-600 text-amber-100 font-semibold py-3 px-6 rounded-lg transition-all shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Pradėti būrimą
            </Link>
          </motion.div>
        )}

        {/* History list */}
        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <AnimatePresence>
              {filtered.map((item, index) => {
                const id = item.type === 'divination' ? item.data.id : item.data.id
                const isExpanded = expandedId === id

                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: Math.min(index * 0.03, 0.3) }}
                    className={`bg-gray-800/50 border rounded-xl overflow-hidden transition-colors ${
                      isExpanded ? 'border-purple-500/40' : 'border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    {/* Header row */}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                      className="w-full p-4 md:p-5 flex items-center gap-3 text-left"
                    >
                      <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                        item.type === 'divination'
                          ? 'bg-purple-900/50 border border-purple-500/30'
                          : 'bg-amber-900/50 border border-amber-500/30'
                      }`}>
                        {item.type === 'divination'
                          ? (DIVINATION_LABELS[(item.data as DivinationRecord).divination_type]?.emoji || '✨')
                          : '📅'
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium truncate">
                          {item.type === 'divination'
                            ? (DIVINATION_LABELS[(item.data as DivinationRecord).divination_type]?.name || (item.data as DivinationRecord).divination_type)
                            : 'Kasdienė Runa'
                          }
                        </div>
                        <div className="text-gray-500 text-sm">
                          {formatDate(item.date)}
                        </div>
                        {item.type === 'divination' && (item.data as DivinationRecord).question && (
                          <p className="text-gray-400 text-sm truncate mt-1">
                            „{(item.data as DivinationRecord).question}"
                          </p>
                        )}
                      </div>
                      <div className="shrink-0 text-gray-500">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </button>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-gray-700/50 pt-4">
                            {/* Runes display */}
                            {item.type === 'divination' ? (
                              <DivinationDetails
                                data={item.data as DivinationRecord}
                                allRunes={runes}
                              />
                            ) : (
                              <DailyRuneDetails
                                data={item.data as DailyRuneRecord}
                                allRunes={runes}
                              />
                            )}

                            {/* Notes */}
                            {((item.type === 'divination' && (item.data as DivinationRecord).notes) ||
                              (item.type === 'daily' && ((item.data as DailyRuneRecord).notes || (item.data as DailyRuneRecord).reflection))) && (
                              <div className="mt-4 p-3 bg-gray-900/50 border border-gray-700/50 rounded-lg">
                                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                                  <MessageCircle className="w-4 h-4" />
                                  Pastabos
                                </div>
                                <p className="text-gray-300 text-sm whitespace-pre-line">
                                  {item.type === 'divination'
                                    ? (item.data as DivinationRecord).notes
                                    : (item.data as DailyRuneRecord).reflection || (item.data as DailyRuneRecord).notes
                                  }
                                </p>
                              </div>
                            )}

                            {/* Delete button */}
                            <div className="mt-4 flex justify-end">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDelete(item)
                                }}
                                disabled={deleting === id}
                                className="flex items-center gap-2 text-red-400/70 hover:text-red-400 text-sm transition-colors disabled:opacity-50"
                              >
                                <Trash2 className="w-4 h-4" />
                                {deleting === id ? 'Trinama...' : 'Ištrinti'}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

function DivinationDetails({ data, allRunes }: { data: DivinationRecord; allRunes: Rune[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {data.runes.map((r, i) => {
        const rune = getRuneById(allRunes, r.rune_id)
        if (!rune) return null
        const isReversed = r.orientation === 'reversed'

        return (
          <div
            key={i}
            className={`p-3 rounded-lg border text-center ${
              isReversed
                ? 'bg-red-900/10 border-red-500/20'
                : 'bg-purple-900/10 border-purple-500/20'
            }`}
          >
            <div className="text-xs text-gray-500 mb-1 capitalize">{r.position}</div>
            <div className={`text-3xl mb-1 ${isReversed ? 'rotate-180 inline-block' : ''}`}>
              {rune.symbol}
            </div>
            <div className="text-white text-sm font-medium">{rune.name}</div>
            <div className={`text-xs mt-1 ${isReversed ? 'text-red-400' : 'text-purple-400'}`}>
              {isReversed ? 'Apversta' : 'Tiesi'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DailyRuneDetails({ data, allRunes }: { data: DailyRuneRecord; allRunes: Rune[] }) {
  const rune = getRuneById(allRunes, data.rune_id)
  if (!rune) return <p className="text-gray-500 text-sm">Runa nerasta</p>

  const isReversed = data.orientation === 'reversed'

  return (
    <div className={`p-4 rounded-lg border text-center ${
      isReversed
        ? 'bg-red-900/10 border-red-500/20'
        : 'bg-amber-900/10 border-amber-500/20'
    }`}>
      <div className={`text-5xl mb-2 ${isReversed ? 'rotate-180 inline-block' : ''}`}>
        {rune.symbol}
      </div>
      <div className="text-white text-lg font-cinzel font-semibold">{rune.name}</div>
      <div className="text-gray-400 text-sm mt-1">{rune.meaning}</div>
      <div className={`text-xs mt-2 ${isReversed ? 'text-red-400' : 'text-amber-400'}`}>
        {isReversed ? 'Apversta' : 'Tiesi'}
      </div>
    </div>
  )
}
