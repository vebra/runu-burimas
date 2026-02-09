import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Star, Moon, Sun, Sparkles, Lock, Crown, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useRunes } from '../hooks/useRunes'
import { usePremium } from '../hooks/usePremium'
import { useSEO } from '../hooks/useSEO'
import { trackHoroscopeCalculation } from '../lib/analytics'
import { Button } from '../components/common/Button'
import { RuneLoader } from '../components/common/RuneLoader'
import type { Rune } from '../types/database'

// Numerologinis algoritmas: sumuok visus gimimo datos skaitmenis, redukuok iki 1-24
function calculateBirthNumber(date: Date): number {
  const dateStr = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  let sum = dateStr.split('').reduce((acc, d) => acc + parseInt(d, 10), 0)
  // Redukuok kol bus 1-24
  while (sum > 24) {
    sum = String(sum).split('').reduce((acc, d) => acc + parseInt(d, 10), 0)
  }
  return sum === 0 ? 1 : sum
}

// Savaitinė rūna: gimimo pozicija + savaitės numeris
function getWeeklyRunePosition(birthPos: number, date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const weekNumber = Math.ceil(((date.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7)
  return ((birthPos + weekNumber) % 24) + 1
}

// Mėnesinė rūna: gimimo pozicija + mėnuo + metai
function getMonthlyRunePosition(birthPos: number, date: Date): number {
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return ((birthPos + month + (year % 24)) % 24) + 1
}

// Metinė rūna: gimimo pozicija + metai
function getYearlyRunePosition(birthPos: number, date: Date): number {
  const year = date.getFullYear()
  return ((birthPos + year) % 24) + 1
}

function getRuneByPosition(runes: Rune[], position: number): Rune | undefined {
  return runes.find(r => r.position === position)
}

// Asmenybės aprašymas pagal gimimo rūną
function getPersonalityDescription(rune: Rune): string {
  const descriptions: Record<string, string> = {
    'Fehu': 'Jūs esate natūralus lyderis su stipriu verslumo jausmu. Jūsų energija traukia turtą ir galimybes. Mokate kurti ir dalintis.',
    'Uruz': 'Jūsų vidinė jėga ir ištvermė yra neįtikėtina. Esate drąsus ir ryžtingas, sugebate įveikti bet kokius iššūkius.',
    'Thurisaz': 'Esate galingas gynėjas su stipriu apsaugos instinktu. Jūsų ryžtas ir drąsa įkvepia kitus.',
    'Ansuz': 'Turite dievišką dovaną komunikacijai ir išminčiai. Esate natūralus mokytojas ir patarėjas.',
    'Raidho': 'Jūsų gyvenimas — nuolatinė kelionė ir augimas. Esate atviras naujoms patirtims ir nuotykiams.',
    'Kenaz': 'Jūsų kūrybiškumas ir vidinė ugnis apšviečia kelią kitiems. Esate menininkas ir novatorius.',
    'Gebo': 'Esate dosnumo ir harmonijos įsikūnijimas. Jūsų santykiai su žmonėmis yra jūsų didžiausia vertybė.',
    'Wunjo': 'Džiaugsmas ir optimizmas yra jūsų supergalia. Sugebate rasti šviesą net tamsiausiais laikais.',
    'Hagalaz': 'Esate transformacijos meistras. Iš kiekvieno iššūkio išeinate stipresnis ir išmintingesnis.',
    'Nauthiz': 'Jūsų ištvermė ir atsparumas yra legendiniai. Mokate paversti sunkumus galimybėmis.',
    'Isa': 'Turite gilią vidinę ramybę ir koncentraciją. Jūsų kantrybė ir apmąstymai veda prie tikrų atradimų.',
    'Jera': 'Esate kantrybės ir ciklų žinovas. Suprantate, kad viskas turi savo laiką ir sezoną.',
    'Eihwaz': 'Jūsų vidinė jėga jungia skirtingus pasaulius. Esate tiltas tarp praeities ir ateities.',
    'Perthro': 'Paslapčių ir intuicijos meistras. Jūsų vidinė išmintis veda per gyvenimo mįsles.',
    'Algiz': 'Esate natūralus saugotojas su stipria dvasine jungtimi. Jūsų intuicija saugo jus ir artimuosius.',
    'Sowilo': 'Saulės energija spinduliuoja iš jūsų. Esate pergalės ir sėkmės simbolis, įkvepiantis kitus.',
    'Tiwaz': 'Teisingumas ir garbė yra jūsų kelrodė žvaigždė. Esate tikras karžygys su kilnia širdimi.',
    'Berkano': 'Augimas ir atsinaujinimas yra jūsų esmė. Esate globėjas ir kūrėjas, puoselėjantis gyvybę.',
    'Ehwaz': 'Partnerystė ir judėjimas yra jūsų stiprybė. Esate ištikimas draugas ir patikimas bendražygis.',
    'Mannaz': 'Žmogiškumas ir savęs pažinimas yra jūsų kelias. Esate filosofas ir bendruomenės žmogus.',
    'Laguz': 'Intuicija ir emocinis gilumas yra jūsų dovana. Esate jautrus ir empatiškas, suprantantis kitus.',
    'Ingwaz': 'Potencialas ir vaisingumas apibrėžia jūsų kelią. Esate kūrėjas, kurio idėjos virsta realybe.',
    'Dagaz': 'Proveržis ir transformacija yra jūsų esmė. Esate šviesos nešėjas, keičiantis pasaulį.',
    'Othala': 'Paveldas ir tradicijos yra jūsų pagrindas. Esate šeimos ir bendruomenės ramstis.',
  }
  return descriptions[rune.name] || 'Jūsų gimimo rūna suteikia unikalią energiją ir gyvenimo kryptį.'
}

// Savaitinė prognozė
function getWeeklyForecast(rune: Rune): string {
  return `Ši savaitė pažymėta ${rune.name} energija. ${rune.interpretation} Leiskite šiai rūnai vesti jus per ateinančias dienas ir būkite atviri jos žinutei.`
}

// Mėnesinė prognozė
function getMonthlyForecast(rune: Rune): string {
  return `Šį mėnesį dominuoja ${rune.name} rūnos galia. ${rune.interpretation} Tai puikus laikas susitelkti į šios rūnos raktažodžius ir leisti jiems formuoti jūsų sprendimus.`
}

export function RuneHoroscope() {
  const { runes, loading } = useRunes()
  const { isPremium } = usePremium()
  const [birthDate, setBirthDate] = useState<string>('')
  const [showResults, setShowResults] = useState(false)

  useSEO({
    title: 'Rūnų Horoskopas',
    description: 'Sužinokite savo gimimo rūną pagal gimimo datą. Gaukite savaitines ir mėnesines rūnų prognozes su Elder Futhark runomis.',
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Rūnų Horoskopas',
      description: 'Asmeninis rūnų horoskopas pagal gimimo datą su savaitinėmis ir mėnesinėmis prognozėmis.',
      isPartOf: { '@type': 'WebApplication', name: 'Runų Būrimas' },
    },
  })

  const results = useMemo(() => {
    if (!birthDate || runes.length === 0) return null

    const date = new Date(birthDate)
    const now = new Date()
    const birthPos = calculateBirthNumber(date)
    const weeklyPos = getWeeklyRunePosition(birthPos, now)
    const monthlyPos = getMonthlyRunePosition(birthPos, now)
    const yearlyPos = getYearlyRunePosition(birthPos, now)

    const birthRune = getRuneByPosition(runes, birthPos)
    const weeklyRune = getRuneByPosition(runes, weeklyPos)
    const monthlyRune = getRuneByPosition(runes, monthlyPos)
    const yearlyRune = getRuneByPosition(runes, yearlyPos)

    return { birthRune, weeklyRune, monthlyRune, yearlyRune, birthPos }
  }, [birthDate, runes])

  const handleCalculate = () => {
    if (birthDate) {
      setShowResults(true)
      if (results?.birthRune) trackHoroscopeCalculation(results.birthRune.name)
    }
  }

  if (loading) return <RuneLoader symbol="ᛊ" />

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '896px' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
        >
          <div className="flex items-center justify-center gap-3">
            <Star className="w-8 h-8 text-amber-400" />
            <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-white">
              Rūnų Horoskopas
            </h1>
            <Star className="w-8 h-8 text-amber-400" />
          </div>
          <p className="text-gray-400 text-lg max-w-xl">
            Sužinokite savo gimimo rūną ir gaukite asmenines prognozes pagal senovės Elder Futhark tradiciją
          </p>
        </motion.div>

        {/* Birth date input */}
        {!showResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
            style={{ gap: '2rem' }}
          >
            <div
              className="w-full max-w-md bg-gray-800/50 border-2 border-purple-500/30 rounded-xl"
              style={{ padding: '2rem', boxShadow: '0 0 30px rgba(147, 51, 234, 0.2)' }}
            >
              <label className="block text-amber-200 font-cinzel font-semibold text-lg mb-4 text-center">
                <Calendar className="w-5 h-5 inline-block mr-2 mb-1" />
                Jūsų gimimo data
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full bg-gray-900/50 border-2 border-gray-700 rounded-lg p-4 text-white text-lg text-center focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-colors"
                style={{ colorScheme: 'dark' }}
              />
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleCalculate}
                size="xl"
                disabled={!birthDate}
                className="rounded-xl"
                style={{ boxShadow: '0 0 30px rgba(147, 51, 234, 0.3)' }}
              >
                <Sparkles className="w-6 h-6 md:w-7 md:h-7" />
                Apskaičiuoti Horoskopą
              </Button>
            </motion.div>

            {/* Info cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl" style={{ marginTop: '1rem' }}>
              {[
                { icon: Sun, label: 'Gimimo Rūna', desc: 'Jūsų asmeninė rūna visam gyvenimui', color: 'amber' },
                { icon: Star, label: 'Savaitinė', desc: 'Keičiasi kas savaitę', color: 'purple' },
                { icon: Moon, label: 'Mėnesinė', desc: 'Keičiasi kas mėnesį', color: 'blue' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className={`bg-gray-800/30 border border-${item.color}-500/20 rounded-xl p-4 text-center`}
                >
                  <item.icon className={`w-8 h-8 text-${item.color}-400 mx-auto mb-2`} />
                  <p className="text-white font-semibold text-sm">{item.label}</p>
                  <p className="text-gray-500 text-xs mt-1">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Results */}
        {showResults && results && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '57px' }}
          >
            {/* Change date button */}
            <div className="text-center">
              <button
                onClick={() => setShowResults(false)}
                className="text-gray-400 hover:text-amber-300 text-sm transition-colors"
              >
                ← Pakeisti gimimo datą
              </button>
            </div>

            {/* Birth Rune — FREE */}
            {results.birthRune && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div
                  className="bg-gray-800/50 border-2 border-amber-600/40 rounded-xl overflow-hidden"
                  style={{ boxShadow: '0 0 40px rgba(217, 119, 6, 0.25)' }}
                >
                  <div
                    className="text-center"
                    style={{
                      padding: '2rem 2rem 1.5rem',
                      background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.15), rgba(147, 51, 234, 0.1))',
                    }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Sun className="w-5 h-5 text-amber-400" />
                      <span className="text-amber-300 font-semibold text-sm uppercase tracking-wider">Jūsų Gimimo Rūna</span>
                      <Sun className="w-5 h-5 text-amber-400" />
                    </div>
                    <motion.span
                      className="text-8xl md:text-9xl block text-amber-400"
                      style={{ textShadow: '0 0 30px rgba(212, 175, 55, 0.5)', lineHeight: 1.2 }}
                      animate={{ scale: [1, 1.05, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {results.birthRune.symbol}
                    </motion.span>
                    <h2 className="text-3xl md:text-4xl font-cinzel font-bold text-white mt-4">
                      {results.birthRune.name}
                    </h2>
                    <p className="text-gray-400 text-base mt-2">{results.birthRune.meaning}</p>
                  </div>

                  <div style={{ padding: '1.5rem 2rem 2rem' }}>
                    <h3 className="text-amber-200 font-cinzel font-semibold text-lg mb-3">
                      Jūsų Asmenybė
                    </h3>
                    <p className="text-gray-300 text-base leading-relaxed">
                      {getPersonalityDescription(results.birthRune)}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {results.birthRune.keywords.map((kw, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-amber-500/10 text-amber-300 text-sm rounded-full border border-amber-500/20"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700/50">
                      <p className="text-gray-400 text-sm">
                        <span className="text-amber-400 font-semibold">Elementas:</span> {results.birthRune.element} &nbsp;•&nbsp;
                        <span className="text-amber-400 font-semibold">Aett:</span> {results.birthRune.aett} &nbsp;•&nbsp;
                        <span className="text-amber-400 font-semibold">Pozicija:</span> {results.birthRune.position}/24
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Weekly Rune — PREMIUM */}
            {results.weeklyRune && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <ForecastCard
                  icon={Star}
                  label="Savaitinė Prognozė"
                  sublabel={`Savaitė: ${getWeekLabel()}`}
                  rune={results.weeklyRune}
                  forecast={getWeeklyForecast(results.weeklyRune)}
                  isPremium={isPremium}
                  color="purple"
                />
              </motion.div>
            )}

            {/* Monthly Rune — PREMIUM */}
            {results.monthlyRune && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <ForecastCard
                  icon={Moon}
                  label="Mėnesinė Prognozė"
                  sublabel={new Date().toLocaleDateString('lt-LT', { year: 'numeric', month: 'long' })}
                  rune={results.monthlyRune}
                  forecast={getMonthlyForecast(results.monthlyRune)}
                  isPremium={isPremium}
                  color="blue"
                />
              </motion.div>
            )}

            {/* Yearly Rune — PREMIUM */}
            {results.yearlyRune && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <ForecastCard
                  icon={Sun}
                  label="Metinė Rūna"
                  sublabel={`${new Date().getFullYear()} metai`}
                  rune={results.yearlyRune}
                  forecast={`${new Date().getFullYear()} metams jūsų vedanti rūna yra ${results.yearlyRune.name}. ${results.yearlyRune.interpretation} Leiskite šiai energijai lydėti jus visus metus.`}
                  isPremium={isPremium}
                  color="amber"
                />
              </motion.div>
            )}

            {/* Premium CTA if not premium */}
            {!isPremium && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                style={{
                  padding: '2rem',
                  background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.1), rgba(147, 51, 234, 0.1))',
                  borderRadius: '1rem',
                  border: '2px solid rgba(217, 119, 6, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                }}
              >
                <Crown className="w-12 h-12 text-amber-400 mx-auto mb-4" />
                <h3 className="text-2xl font-cinzel font-bold text-white mb-2 text-center">
                  Atrakinkite Pilną Horoskopą
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto text-center">
                  Gaukite savaitines, mėnesines ir metines rūnų prognozes su Premium planu
                </p>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} className="inline-block">
                  <Link
                    to="/premium"
                    className="inline-flex items-center gap-3 bg-linear-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white font-semibold py-4 px-10 text-lg rounded-xl transition-all duration-300 shadow-lg"
                    style={{ boxShadow: '0 0 25px rgba(217, 119, 6, 0.4)' }}
                  >
                    <Crown className="w-6 h-6" />
                    Gauti Premium
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// Helper: dabartinės savaitės label
function getWeekLabel(): string {
  const now = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' })
  return `${fmt(monday)} – ${fmt(sunday)}`
}

// Forecast card component with premium blur
interface ForecastCardProps {
  icon: typeof Star
  label: string
  sublabel: string
  rune: Rune
  forecast: string
  isPremium: boolean
  color: 'purple' | 'blue' | 'amber'
}

function ForecastCard({ icon: Icon, label, sublabel, rune, forecast, isPremium, color }: ForecastCardProps) {
  const colorMap = {
    purple: { border: 'rgba(147, 51, 234, 0.3)', bg: 'rgba(147, 51, 234, 0.1)', text: 'text-purple-300', icon: 'text-purple-400', badge: 'bg-purple-500/10 border-purple-500/20 text-purple-300' },
    blue: { border: 'rgba(59, 130, 246, 0.3)', bg: 'rgba(59, 130, 246, 0.1)', text: 'text-blue-300', icon: 'text-blue-400', badge: 'bg-blue-500/10 border-blue-500/20 text-blue-300' },
    amber: { border: 'rgba(217, 119, 6, 0.3)', bg: 'rgba(217, 119, 6, 0.1)', text: 'text-amber-300', icon: 'text-amber-400', badge: 'bg-amber-500/10 border-amber-500/20 text-amber-300' },
  }
  const c = colorMap[color]

  return (
    <div
      className="bg-gray-800/50 rounded-xl overflow-hidden relative"
      style={{ border: `2px solid ${c.border}`, boxShadow: `0 0 30px ${c.bg}` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between" style={{ padding: '1.25rem 1.5rem', background: `linear-gradient(135deg, ${c.bg}, transparent)` }}>
        <div className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${c.icon}`} />
          <span className={`${c.text} font-semibold text-sm uppercase tracking-wider`}>{label}</span>
        </div>
        <span className="text-gray-500 text-sm">{sublabel}</span>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }} className={!isPremium ? 'relative' : ''}>
        <div className="flex items-start gap-5">
          <span
            className={`text-5xl ${c.icon} shrink-0`}
            style={{ textShadow: `0 0 15px ${c.bg}` }}
          >
            {rune.symbol}
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-cinzel font-semibold text-xl mb-1">{rune.name}</h3>
            <p className="text-gray-500 text-sm mb-3">{rune.meaning}</p>
            <p className="text-gray-300 text-base leading-relaxed">{forecast}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {rune.keywords.map((kw, i) => (
                <span key={i} className={`px-2.5 py-1 text-xs rounded-full border ${c.badge}`}>
                  {kw}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Premium blur overlay */}
        {!isPremium && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center"
            style={{
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              background: 'rgba(15, 10, 26, 0.6)',
            }}
          >
            <Lock className="w-8 h-8 text-amber-400 mb-3" />
            <p className="text-white font-semibold text-lg mb-1">Premium Funkcija</p>
            <p className="text-gray-400 text-sm mb-4">Atrakinkite su Premium planu</p>
            <Link
              to="/premium"
              className="inline-flex items-center gap-2 bg-linear-to-r from-amber-600 to-amber-500 text-white font-semibold py-2.5 px-6 text-sm rounded-lg transition-all hover:from-amber-500 hover:to-amber-400"
            >
              <Crown className="w-4 h-4" />
              Gauti Premium
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
