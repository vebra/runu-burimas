import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, ChevronDown, BookOpen } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useSEO } from '../hooks/useSEO'
import { EmptySearchResults } from '../components/common/EmptyState'
import { useRunes, useFavorites } from '../hooks/useRunes'
import type { Rune } from '../types/database'

export function RuneLibrary() {
  useSEO({
    title: 'Runų Biblioteka',
    description: 'Pilna Elder Futhark runų biblioteka — 24 runos su reikšmėmis, interpretacijomis, raktiniais žodžiais ir elementais. Išmokite runų simbolius.',
    keywords: 'runų reikšmės, Elder Futhark runos, 24 runos, runų simboliai, runų interpretacija, vikingų runos, runų abėcėlė, futhark',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Elder Futhark Runų Biblioteka',
      description: 'Pilna 24 Elder Futhark runų kolekcija su reikšmėmis ir interpretacijomis.',
      isPartOf: { '@type': 'WebApplication', name: 'Runų Būrimas' },
      about: {
        '@type': 'Thing',
        name: 'Elder Futhark',
        description: 'Seniausia žinoma runų abėcėlė, naudota nuo 2-8 amžiaus.',
      },
    },
  })
  const { user } = useAuth()
  const { runes, loading } = useRunes()
  const { fetchFavorites, toggleFavorite, isFavorite } = useFavorites()

  const [filterAett, setFilterAett] = useState<string | null>(null)
  const [revealedRunes, setRevealedRunes] = useState<Set<string>>(new Set())
  const [selectedRune, setSelectedRune] = useState<Rune | null>(null)
  const [showAbout, setShowAbout] = useState(false)

  useEffect(() => {
    if (user) {
      fetchFavorites(user.id)
    }
  }, [user?.id])

  const filteredRunes = useMemo(() => {
    return runes.filter(rune => {
      const matchesAett = filterAett === null || rune.aett === filterAett
      return matchesAett
    })
  }, [runes, filterAett])

  const aetts = useMemo(() => {
    const unique = new Set(runes.map(r => r.aett).filter(Boolean))
    return Array.from(unique) as string[]
  }, [runes])

  const handleToggleFavorite = async (runeId: string) => {
    if (!user) return
    try {
      await toggleFavorite(user.id, runeId)
    } catch {
      // Error handled silently
    }
  }

  const revealRune = (runeId: string) => {
    setRevealedRunes(prev => new Set(prev).add(runeId))
  }

  const isRevealed = (runeId: string) => revealedRunes.has(runeId)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 'clamp(5rem, 12vw, 100px)', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '896px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
        >
          <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-white">
            Runų Biblioteka
          </h1>
          <p className="text-gray-400 text-lg">
            24 Elder Futhark runos • Paspausk ant runos, kad atskleistum
          </p>
        </motion.div>

        {/* Apie runas */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          style={{ marginBottom: '3rem' }}
        >
          <div
            className="relative overflow-hidden rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(88, 28, 135, 0.3) 0%, rgba(107, 33, 168, 0.2) 50%, rgba(126, 34, 206, 0.3) 100%)',
              border: '1px solid rgba(217, 119, 6, 0.2)',
              boxShadow: '0 0 40px rgba(147, 51, 234, 0.15), inset 0 0 40px rgba(147, 51, 234, 0.05)',
            }}
          >
            {/* Decorative rune watermark - hidden on small screens */}
            <div
              className="absolute -right-6 -top-6 font-cinzel text-amber-500/5 select-none pointer-events-none hidden sm:block"
              style={{ fontSize: '12rem', lineHeight: 1 }}
            >
              ᚠ
            </div>
            <div
              className="absolute -left-4 -bottom-4 font-cinzel text-purple-500/5 select-none pointer-events-none hidden sm:block"
              style={{ fontSize: '10rem', lineHeight: 1 }}
            >
              ᛟ
            </div>

            {/* Toggle header */}
            <button
              onClick={() => setShowAbout(!showAbout)}
              className="relative z-10 w-full flex flex-col items-center text-center transition-colors"
              style={{ padding: '1.25rem 1rem' }}
            >
              <div
                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl"
                style={{
                  background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.25), rgba(147, 51, 234, 0.25))',
                  border: '1px solid rgba(217, 119, 6, 0.35)',
                  marginBottom: '0.75rem',
                }}
              >
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-cinzel font-bold text-white" style={{ marginBottom: '0.3rem' }}>
                Runos ir būrimas
              </h2>
              <p className="text-gray-400 text-xs sm:text-sm">Senovinė išmintis šiuolaikiniam žmogui</p>
              <motion.div
                animate={{ rotate: showAbout ? 180 : 0 }}
                transition={{ duration: 0.3 }}
                style={{ marginTop: '0.5rem' }}
              >
                <ChevronDown className="w-5 h-5 text-gray-500" />
              </motion.div>
            </button>

            {/* Expandable content */}
            <AnimatePresence>
              {showAbout && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="relative z-10 px-4 pb-5 sm:px-8 sm:pb-8">
                    {/* Divider */}
                    <div
                      className="w-full h-px mb-5 sm:mb-6"
                      style={{ background: 'linear-gradient(90deg, transparent, rgba(217, 119, 6, 0.3), rgba(147, 51, 234, 0.3), transparent)' }}
                    />

                    <div className="space-y-4 sm:space-y-5 text-gray-300 text-sm sm:text-base leading-relaxed">
                      <p>
                        Runos – tai senoviniai simboliai, kilę iš šiaurės Europos tradicijų, naudoti ne tik raštui,
                        bet ir kaip gilių prasmių bei vidinės išminties nešėjai. Kiekviena runa turi savitą energiją,
                        reikšmę ir simboliką, atspindinčią gyvenimo dėsnius, gamtos ciklus bei žmogaus kelią.
                      </p>

                      <p>
                        Runų būrimas – tai apmąstymų ir įžvalgos praktika, padedanti pažvelgti giliau į situacijas,
                        sprendimus ir vidinius klausimus. Tai nėra ateities „nuspėjimas" tiesiogine prasme. Runos veikia
                        kaip veidrodis: jos padeda išryškinti tai, kas jau slypi pasąmonėje, ir leidžia aiškiau suprasti
                        galimas kryptis.
                      </p>

                      {/* Feature cards */}
                      <div>
                        <h3 className="text-amber-300 font-cinzel font-semibold text-sm sm:text-base" style={{ marginBottom: '0.75rem' }}>
                          Ką gali atskleisti runų būrimas
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                          {[
                            { rune: 'ᚠ', text: 'Dabartinę situaciją ir jos esmę' },
                            { rune: 'ᚱ', text: 'Galimas ateities tendencijas ir pasirinkimų pasekmes' },
                            { rune: 'ᚺ', text: 'Vidinius blokus, stiprybes ir silpnybes' },
                            { rune: 'ᛗ', text: 'Santykių, darbo ar asmeninio kelio kryptį' },
                          ].map((item, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-2 sm:gap-3 rounded-lg"
                              style={{
                                padding: '0.6rem 0.75rem',
                                background: 'rgba(147, 51, 234, 0.1)',
                                border: '1px solid rgba(147, 51, 234, 0.15)',
                              }}
                            >
                              <span className="text-amber-500/60 text-base sm:text-lg shrink-0" style={{ textShadow: '0 0 8px rgba(217, 119, 6, 0.3)' }}>
                                {item.rune}
                              </span>
                              <span className="text-gray-300 text-xs sm:text-sm">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <p>
                        Runų kalba yra simbolinė ir daugiasluoksnė, todėl kiekvienas būrimas yra individualus.
                        Tas pats ženklas skirtingiems žmonėms gali kalbėti skirtingai – priklausomai nuo konteksto,
                        klausimo ir gyvenimo etapo.
                      </p>

                      <p>
                        Nors runos atkeliavo iš tolimos praeities, jų žinutės išlieka aktualios ir šiandien.
                        Šiuolaikiniame, greitame pasaulyje runų būrimas suteikia galimybę sustoti, susitelkti ir
                        priimti sprendimus sąmoningiau. Tai pagarbus dialogas su savimi ir tradicija, perduodama
                        per kartas.
                      </p>

                      {/* Closing quote */}
                      <div
                        className="relative rounded-xl"
                        style={{
                          padding: '1rem 1.25rem',
                          background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08), rgba(147, 51, 234, 0.08))',
                          borderLeft: '3px solid rgba(217, 119, 6, 0.4)',
                        }}
                      >
                        <p className="text-gray-400 italic text-xs sm:text-sm leading-relaxed">
                          Ši svetainė skirta tiems, kurie vertina senąją išmintį, ieško prasmės ir nori pažvelgti
                          į savo gyvenimo kelią giliau – ramiai, atsakingai ir su pagarba tradicijoms.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Filtrai */}
        <div style={{ marginBottom: '3rem' }}>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setFilterAett(null)}
              className={`px-5 py-2.5 rounded-lg text-base font-medium transition-colors shadow-lg ${
                filterAett === null
                  ? 'bg-purple-800/30 text-amber-300 border-2 border-amber-600/50'
                  : 'bg-gray-800/50 text-gray-400 border-2 border-gray-700 hover:border-amber-600/30'
              }`}
              style={{ boxShadow: filterAett === null ? '0 0 20px rgba(217, 119, 6, 0.3)' : 'none' }}
            >
              Visos
            </button>
            {aetts.map(aett => (
              <button
                key={aett}
                onClick={() => setFilterAett(aett)}
                className={`px-5 py-2.5 rounded-lg text-base font-medium transition-colors shadow-lg ${
                  filterAett === aett
                    ? 'bg-purple-800/30 text-amber-300 border-2 border-amber-600/50'
                    : 'bg-gray-800/50 text-gray-400 border-2 border-gray-700 hover:border-amber-600/30'
                }`}
                style={{ boxShadow: filterAett === aett ? '0 0 20px rgba(217, 119, 6, 0.3)' : 'none' }}
              >
                {aett} Aett
              </button>
            ))}
          </div>
        </div>

        {filteredRunes.length === 0 ? (
          <EmptySearchResults />
        ) : (
          /* Runų grid */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 sm:gap-6 justify-items-center"
          >
            {filteredRunes.map((rune, index) => (
              <motion.div
                key={rune.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex flex-col items-center"
              >
                <AnimatePresence mode="wait">
                  {!isRevealed(rune.id) ? (
                    <motion.button
                      key="hidden"
                      initial={{ rotateY: 0 }}
                      exit={{ rotateY: 90 }}
                      onClick={() => revealRune(rune.id)}
                      className="w-24 h-36 sm:w-28 sm:h-44 bg-linear-to-br from-gray-800 via-purple-950/30 to-gray-900 border-2 border-amber-600/50 rounded-xl flex flex-col items-center justify-center hover:border-amber-500 transition-colors cursor-pointer shadow-lg"
                      style={{ boxShadow: '0 0 25px rgba(217, 119, 6, 0.2)' }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="text-4xl sm:text-5xl text-amber-500/50">?</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      key="revealed"
                      initial={{ rotateY: -90 }}
                      animate={{ rotateY: 0 }}
                      onClick={() => setSelectedRune(rune)}
                      className="w-24 h-36 sm:w-28 sm:h-44 bg-linear-to-br from-gray-800 via-purple-950/30 to-gray-900 border-2 border-amber-600/30 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500/50 transition-colors shadow-lg"
                      style={{ boxShadow: '0 0 25px rgba(217, 119, 6, 0.2)' }}
                      whileHover={{ scale: 1.05 }}
                    >
                      <span className="text-4xl sm:text-5xl text-amber-400 animate-glow">
                        {rune.symbol}
                      </span>
                      <span className="text-white font-cinzel text-sm sm:text-base mt-2">
                        {rune.name}
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Detali runos informacija */}
        <AnimatePresence>
          {selectedRune && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={() => setSelectedRune(null)}
            >
              <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" aria-hidden="true" />

              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                role="dialog"
                aria-modal="true"
                aria-label={selectedRune?.name ? `Rūna: ${selectedRune.name}` : 'Runos informacija'}
                className="relative bg-gray-900 border border-amber-600/30 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-gray-800" style={{ padding: '2rem' }}>
                  <div className="flex items-center gap-4">
                    <span className="text-5xl text-amber-400 animate-glow">
                      {selectedRune.symbol}
                    </span>
                    <h2 className="text-2xl font-cinzel font-bold text-white">
                      {selectedRune.name}
                    </h2>
                  </div>
                  <button
                    onClick={() => setSelectedRune(null)}
                    aria-label="Uždaryti"
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Content */}
                <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  {/* Reikšmė */}
                  <div>
                    <p className="text-gray-400 text-base" style={{ marginBottom: '0.75rem' }}>Reikšmė</p>
                    <p className="text-white text-lg">{selectedRune.meaning}</p>
                  </div>

                  {/* Interpretacija */}
                  <div className="bg-gray-800/50 border-2 border-amber-600/30 rounded-xl shadow-lg" style={{ padding: '1.5rem', boxShadow: '0 0 25px rgba(217, 119, 6, 0.2)' }}>
                    <p className="text-amber-400 text-base font-medium" style={{ marginBottom: '1rem' }}>Interpretacija</p>
                    <p className="text-gray-300 text-base leading-relaxed">{selectedRune.interpretation}</p>
                  </div>

                  {/* Apversta interpretacija */}
                  {selectedRune.reversed_interpretation && (
                    <div className="bg-gray-800/50 border-2 border-red-600/30 rounded-xl shadow-lg" style={{ padding: '1.5rem', boxShadow: '0 0 25px rgba(220, 38, 38, 0.2)' }}>
                      <p className="text-red-400 text-base font-medium" style={{ marginBottom: '1rem' }}>Apversta interpretacija</p>
                      <p className="text-gray-300 text-base leading-relaxed">{selectedRune.reversed_interpretation}</p>
                    </div>
                  )}

                  {/* Raktažodžiai */}
                  <div>
                    <p className="text-gray-400 text-base" style={{ marginBottom: '1rem' }}>Raktažodžiai</p>
                    <div className="flex flex-wrap gap-3">
                      {selectedRune.keywords.map((keyword, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 bg-purple-800/30 text-amber-300 text-base rounded-full border-2 border-amber-600/30 shadow-lg"
                          style={{ boxShadow: '0 0 15px rgba(217, 119, 6, 0.15)' }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Elementas ir Aett */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRune.element && (
                      <div className="bg-gray-800/30 rounded-lg" style={{ padding: '1rem' }}>
                        <p className="text-gray-500 text-sm" style={{ marginBottom: '0.5rem' }}>Elementas</p>
                        <p className="text-white text-base">{selectedRune.element}</p>
                      </div>
                    )}
                    {selectedRune.aett && (
                      <div className="bg-gray-800/30 rounded-lg" style={{ padding: '1rem' }}>
                        <p className="text-gray-500 text-sm" style={{ marginBottom: '0.5rem' }}>Aett</p>
                        <p className="text-white text-base">{selectedRune.aett}</p>
                      </div>
                    )}
                  </div>

                  {/* Mėgstamų mygtukas */}
                  {user && (
                    <button
                      onClick={() => handleToggleFavorite(selectedRune.id)}
                      className={`w-full py-4 rounded-lg font-medium text-base transition-colors shadow-lg ${
                        isFavorite(selectedRune.id)
                          ? 'bg-amber-500/20 text-amber-300 border-2 border-amber-500/50'
                          : 'bg-gray-800 text-gray-300 border-2 border-gray-700 hover:border-amber-600/30'
                      }`}
                      style={{ boxShadow: isFavorite(selectedRune.id) ? '0 0 20px rgba(217, 119, 6, 0.3)' : 'none' }}
                    >
                      {isFavorite(selectedRune.id) ? '❤️ Pašalinti iš mėgstamų' : '🤍 Pridėti į mėgstamas'}
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
