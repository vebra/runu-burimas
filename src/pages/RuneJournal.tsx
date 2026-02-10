import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Save, ChevronLeft, ChevronRight, Trash2, Calendar, Flame, Star, Lock, Crown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useJournal } from '../hooks/useJournal'
import type { JournalStats } from '../hooks/useJournal'
import { usePremium } from '../hooks/usePremium'
import { useRunes } from '../hooks/useRunes'
import { trackJournalEntry } from '../lib/analytics'
import { useSEO } from '../hooks/useSEO'
import { Button } from '../components/common/Button'
import { useToast } from '../components/common/Toast'
import { RuneLoader } from '../components/common/RuneLoader'
import type { Rune, JournalEntry } from '../types/database'

const MOODS = [
  { emoji: '😊', label: 'Puiku' },
  { emoji: '😌', label: 'Ramu' },
  { emoji: '🤔', label: 'Susimąstęs' },
  { emoji: '😐', label: 'Neutralu' },
  { emoji: '😔', label: 'Liūdna' },
  { emoji: '🔥', label: 'Energinga' },
  { emoji: '✨', label: 'Įkvėpta' },
  { emoji: '🌙', label: 'Mistiška' },
]

const FREE_ENTRIES_PER_MONTH = 3

export function RuneJournal() {
  const { user } = useAuth()
  const { runes, loading: runesLoading } = useRunes()
  const { isPremium } = usePremium()
  const { entries, loading, saving, fetchEntries, fetchEntry, saveEntry, deleteEntry, getMonthEntries, getStats } = useJournal()
  const toast = useToast()

  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string | null>(null)
  const [selectedRune, setSelectedRune] = useState<Rune | null>(null)
  const [showRunePicker, setShowRunePicker] = useState(false)
  const [calendarMonth, setCalendarMonth] = useState(() => new Date())
  const [monthEntries, setMonthEntries] = useState<JournalEntry[]>([])
  const [stats, setStats] = useState<JournalStats | null>(null)
  const [showStats, setShowStats] = useState(false)
  const [currentEntry, setCurrentEntry] = useState<JournalEntry | null>(null)
  const [monthEntriesCount, setMonthEntriesCount] = useState(0)

  useSEO({
    title: 'Rūnų Dienoraštis',
    description: 'Asmeninis mistinis dienoraštis — užrašykite mintis, priskirkite dienos rūną ir stebėkite savo dvasinę kelionę.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Rūnų Dienoraštis',
      description: 'Asmeninis rūnų dienoraštis su nuotaikų sekimu ir statistika.',
      isPartOf: { '@type': 'WebApplication', name: 'Runų Būrimas' },
    },
  })

  // Fetch entries on mount
  useEffect(() => {
    if (user) {
      fetchEntries(user.id)
      loadMonthEntries()
      getStats(user.id).then(setStats)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  // Load entry for selected date
  useEffect(() => {
    if (user) {
      loadDateEntry()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, user?.id])

  // Load month entries when calendar changes
  useEffect(() => {
    if (user) {
      loadMonthEntries()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarMonth, user?.id])

  async function loadDateEntry() {
    if (!user) return
    const entry = await fetchEntry(user.id, selectedDate)
    setCurrentEntry(entry)
    if (entry) {
      setContent(entry.content)
      setMood(entry.mood)
      if (entry.rune_id && entry.rune_name && entry.rune_symbol) {
        const rune = runes.find(r => r.id === entry.rune_id)
        setSelectedRune(rune || null)
      } else {
        setSelectedRune(null)
      }
    } else {
      setContent('')
      setMood(null)
      setSelectedRune(null)
    }
  }

  async function loadMonthEntries() {
    if (!user) return
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth() + 1
    const data = await getMonthEntries(user.id, year, month)
    setMonthEntries(data)

    // Count entries this month for free limit
    const now = new Date()
    if (year === now.getFullYear() && month === now.getMonth() + 1) {
      setMonthEntriesCount(data.length)
    }
  }

  const isAtFreeLimit = !isPremium && monthEntriesCount >= FREE_ENTRIES_PER_MONTH && !currentEntry

  const handleSave = async () => {
    if (!user || !content.trim()) return

    if (isAtFreeLimit) {
      toast.error('Pasiektas nemokamų įrašų limitas (3/mėn). Atnaujinkite į Premium!')
      return
    }

    const result = await saveEntry(user.id, {
      date: selectedDate,
      content: content.trim(),
      mood,
      rune_id: selectedRune?.id || null,
      rune_name: selectedRune?.name || null,
      rune_symbol: selectedRune?.symbol || null,
    })

    if (result) {
      setCurrentEntry(result)
      trackJournalEntry(mood, !!selectedRune)
      toast.success('Dienoraštis išsaugotas!')
      loadMonthEntries()
      getStats(user.id).then(setStats)
    } else {
      toast.error('Nepavyko išsaugoti')
    }
  }

  const handleDelete = async () => {
    if (!currentEntry) return
    const ok = await deleteEntry(currentEntry.id)
    if (ok) {
      setCurrentEntry(null)
      setContent('')
      setMood(null)
      setSelectedRune(null)
      toast.success('Įrašas ištrintas')
      loadMonthEntries()
      if (user) getStats(user.id).then(setStats)
    }
  }

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startPad = (firstDay.getDay() + 6) % 7 // Monday start
    const days: (number | null)[] = []
    for (let i = 0; i < startPad; i++) days.push(null)
    for (let d = 1; d <= lastDay.getDate(); d++) days.push(d)
    return days
  }, [calendarMonth])

  const entryDates = useMemo(() => {
    return new Set(monthEntries.map(e => e.date))
  }, [monthEntries])

  const today = new Date().toISOString().split('T')[0]

  if (!user) {
    return (
      <div className="px-4 pb-16 text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', paddingTop: 'clamp(5rem, 12vw, 100px)' }}>
        <BookOpen className="w-16 h-16 text-purple-400 mx-auto" />
        <h1 className="text-3xl font-cinzel font-bold text-white">Rūnų Dienoraštis</h1>
        <p className="text-gray-400 max-w-md">Prisijunkite, kad galėtumėte rašyti savo asmeninį rūnų dienoraštį.</p>
        <Link
          to="/prisijungti"
          className="inline-flex items-center gap-2 bg-linear-to-r from-purple-700 to-violet-600 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all shadow-lg shadow-purple-500/20 hover:from-purple-600 hover:to-violet-500"
        >
          Prisijungti
        </Link>
      </div>
    )
  }

  if (runesLoading || loading) return <RuneLoader symbol="ᛈ" />

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '896px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '2rem', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <div className="flex items-center justify-center gap-3">
            <BookOpen className="w-7 h-7 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-cinzel font-bold text-white">
              Rūnų Dienoraštis
            </h1>
          </div>
          <p className="text-gray-400 text-base">
            Užrašykite savo mintis ir stebėkite dvasinę kelionę
          </p>
          {!isPremium && (
            <p className="text-amber-400/70 text-sm">
              Nemokamas planas: {monthEntriesCount}/{FREE_ENTRIES_PER_MONTH} įrašai šį mėnesį
            </p>
          )}
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left: Calendar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-1"
          >
            <div
              className="bg-gray-800/50 border border-purple-500/30 rounded-xl"
              style={{ padding: '1.25rem' }}
            >
              {/* Month navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-white font-semibold text-sm capitalize">
                  {calendarMonth.toLocaleDateString('lt-LT', { year: 'numeric', month: 'long' })}
                </span>
                <button
                  onClick={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700/50 transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 gap-1 mb-1">
                {['Pr', 'An', 'Tr', 'Kt', 'Pn', 'Št', 'Sk'].map(d => (
                  <div key={d} className="text-center text-gray-500 text-xs font-medium py-1">{d}</div>
                ))}
              </div>

              {/* Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, i) => {
                  if (day === null) return <div key={`pad-${i}`} />
                  const dateStr = `${calendarMonth.getFullYear()}-${String(calendarMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                  const hasEntry = entryDates.has(dateStr)
                  const isSelected = dateStr === selectedDate
                  const isToday = dateStr === today

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`relative w-full aspect-square rounded-lg text-sm font-medium transition-all ${
                        isSelected
                          ? 'bg-purple-600 text-white'
                          : isToday
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                      }`}
                    >
                      {day}
                      {hasEntry && (
                        <div className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${
                          isSelected ? 'bg-white' : 'bg-amber-400'
                        }`} />
                      )}
                    </button>
                  )
                })}
              </div>

              {/* Stats button */}
              {isPremium && (
                <button
                  onClick={() => setShowStats(!showStats)}
                  className="w-full mt-4 py-2.5 text-sm text-purple-300 hover:text-purple-200 bg-purple-500/10 hover:bg-purple-500/20 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  {showStats ? 'Slėpti statistiką' : 'Rodyti statistiką'}
                </button>
              )}
            </div>

            {/* Stats panel */}
            <AnimatePresence>
              {showStats && stats && isPremium && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-gray-800/50 border border-amber-500/20 rounded-xl mt-4 overflow-hidden"
                  style={{ padding: '1.25rem' }}
                >
                  <h3 className="text-amber-300 font-semibold text-sm mb-3 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Statistika
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Viso įrašų</span>
                      <span className="text-white font-semibold">{stats.totalEntries}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Dabartinė serija</span>
                      <span className="text-amber-300 font-semibold flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5" />
                        {stats.currentStreak} d.
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ilgiausia serija</span>
                      <span className="text-white font-semibold">{stats.longestStreak} d.</span>
                    </div>
                    {stats.topMoods.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-xs">Dažniausios nuotaikos</span>
                        <div className="flex gap-2 mt-1">
                          {stats.topMoods.map(m => (
                            <span key={m.mood} className="text-lg" title={`${m.count}x`}>{m.mood}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {stats.topRunes.length > 0 && (
                      <div>
                        <span className="text-gray-500 text-xs">Dažniausios runos</span>
                        <div className="flex gap-2 mt-1">
                          {stats.topRunes.map(r => (
                            <span key={r.name} className="text-lg text-amber-400" title={`${r.name} (${r.count}x)`}>{r.symbol}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Premium stats CTA */}
            {!isPremium && (
              <div
                className="mt-4 rounded-xl text-center"
                style={{
                  padding: '1rem',
                  background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(147, 51, 234, 0.08))',
                  border: '1px solid rgba(217, 119, 6, 0.2)',
                }}
              >
                <Lock className="w-5 h-5 text-amber-400 mx-auto mb-2" />
                <p className="text-gray-400 text-xs mb-2">Statistika ir neriboti įrašai su Premium</p>
                <Link
                  to="/premium"
                  className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-xs font-semibold transition-colors"
                >
                  <Crown className="w-3.5 h-3.5" />
                  Gauti Premium
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </motion.div>

          {/* Right: Editor */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-2"
          >
            <div
              className="bg-gray-800/50 border border-purple-500/30 rounded-xl"
              style={{ padding: '1.5rem' }}
            >
              {/* Date header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-amber-400" />
                  <span className="text-white font-semibold capitalize">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('lt-LT', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                {currentEntry && (
                  <button
                    onClick={handleDelete}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    title="Ištrinti įrašą"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Mood picker */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Nuotaika</label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map(m => (
                    <button
                      key={m.emoji}
                      onClick={() => setMood(mood === m.emoji ? null : m.emoji)}
                      title={m.label}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                        mood === m.emoji
                          ? 'bg-purple-600/50 ring-2 ring-purple-400 scale-110'
                          : 'bg-gray-700/50 hover:bg-gray-700 hover:scale-105'
                      }`}
                    >
                      {m.emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rune picker */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Dienos rūna</label>
                {selectedRune ? (
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-lg px-3 py-2">
                      <span className="text-2xl text-amber-400">{selectedRune.symbol}</span>
                      <span className="text-white font-medium text-sm">{selectedRune.name}</span>
                    </div>
                    <button
                      onClick={() => setSelectedRune(null)}
                      className="text-gray-500 hover:text-red-400 text-sm transition-colors"
                    >
                      Pašalinti
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowRunePicker(!showRunePicker)}
                    className="text-purple-400 hover:text-purple-300 text-sm bg-purple-500/10 hover:bg-purple-500/20 px-4 py-2 rounded-lg transition-colors"
                  >
                    + Priskirti rūną
                  </button>
                )}

                <AnimatePresence>
                  {showRunePicker && !selectedRune && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-2 overflow-hidden"
                    >
                      <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                        {runes.map(rune => (
                          <button
                            key={rune.id}
                            onClick={() => {
                              setSelectedRune(rune)
                              setShowRunePicker(false)
                            }}
                            title={rune.name}
                            className="w-full aspect-square rounded-lg bg-gray-800/50 hover:bg-purple-600/30 border border-gray-700/50 hover:border-purple-500/30 flex items-center justify-center text-xl text-amber-400 hover:text-amber-300 transition-all hover:scale-110"
                          >
                            {rune.symbol}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Content editor */}
              <div className="mb-4">
                <label className="text-gray-400 text-sm mb-2 block">Jūsų mintys</label>
                {isAtFreeLimit ? (
                  <div
                    className="rounded-xl text-center"
                    style={{
                      padding: '2rem',
                      background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(147, 51, 234, 0.08))',
                      border: '2px solid rgba(217, 119, 6, 0.3)',
                    }}
                  >
                    <Lock className="w-10 h-10 text-amber-400 mx-auto mb-3" />
                    <h3 className="text-white font-cinzel font-bold text-lg mb-2">
                      Pasiektas nemokamas limitas
                    </h3>
                    <p className="text-gray-400 text-sm mb-4">
                      Šį mėnesį jau parašėte {FREE_ENTRIES_PER_MONTH} įrašus. Atnaujinkite į Premium neribotiems įrašams.
                    </p>
                    <Link
                      to="/premium"
                      className="inline-flex items-center gap-2 bg-linear-to-r from-amber-600 to-amber-500 text-white font-semibold py-2.5 px-6 rounded-lg text-sm"
                    >
                      <Crown className="w-4 h-4" />
                      Gauti Premium
                    </Link>
                  </div>
                ) : (
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Ką šiandien patyriau? Kokios mintys kilo? Kaip rūnos atsiliepia mano gyvenime?..."
                    className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-colors resize-none text-base leading-relaxed"
                    style={{ minHeight: '200px' }}
                  />
                )}
              </div>

              {/* Save button */}
              {!isAtFreeLimit && (
                <div className="flex items-center justify-between">
                  <Button
                    onClick={handleSave}
                    loading={saving}
                    disabled={!content.trim()}
                    size="lg"
                  >
                    <Save className="w-5 h-5" />
                    {currentEntry ? 'Atnaujinti' : 'Išsaugoti'}
                  </Button>
                  {currentEntry && (
                    <span className="text-gray-500 text-xs">
                      Atnaujinta: {new Date(currentEntry.updated_at).toLocaleTimeString('lt-LT', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Recent entries */}
            {entries.length > 0 && (
              <div className="mt-6">
                <h3 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  Paskutiniai įrašai
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {entries.slice(0, 7).map(entry => (
                    <button
                      key={entry.id}
                      onClick={() => setSelectedDate(entry.date)}
                      className={`w-full text-left p-3 rounded-lg transition-all ${
                        entry.date === selectedDate
                          ? 'bg-purple-600/20 border border-purple-500/30'
                          : 'bg-gray-800/30 border border-gray-700/30 hover:bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          {entry.mood && <span className="text-base">{entry.mood}</span>}
                          {entry.rune_symbol && <span className="text-amber-400 text-base">{entry.rune_symbol}</span>}
                          <span className="text-gray-400 text-xs">
                            {new Date(entry.date + 'T00:00:00').toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm mt-1 line-clamp-2 overflow-hidden" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {entry.content}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
