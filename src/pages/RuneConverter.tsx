import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check, Download, Type } from 'lucide-react'
import { textToRunes, getRuneString, getUniqueRunes } from '../utils/runeConverter'

export function RuneConverter() {
  const [text, setText] = useState('')
  const [copied, setCopied] = useState(false)

  const converted = useMemo(() => textToRunes(text), [text])
  const runeString = useMemo(() => getRuneString(converted), [converted])
  const uniqueRunes = useMemo(() => getUniqueRunes(converted), [converted])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(runeString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleDownload = () => {
    const content = `Originalus tekstas: ${text}\n\nRunos: ${runeString}\n\nRunų reikšmės:\n${uniqueRunes.map(r => `${r.rune} (${r.name})`).join('\n')}`
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'runos.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="px-4" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '4rem', paddingBottom: '6rem' }}>
      <div style={{ width: '100%', maxWidth: '672px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '3rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}
        >
          <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-white">
            Runų Konverteris
          </h1>
          <p className="text-gray-400 text-lg">
            Paverskite tekstą Elder Futhark runomis
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <label className="flex items-center gap-2 text-base font-medium text-gray-300">
              <Type className="w-5 h-5" />
              Įveskite tekstą
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Pvz: Meilė, Jėga, Laimė..."
              className="w-full bg-gray-800/50 border-2 border-amber-600/30 rounded-xl p-6 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 transition-colors resize-none text-xl shadow-lg shadow-amber-600/20 text-center"
              style={{ height: '150px', boxShadow: '0 0 30px rgba(217, 119, 6, 0.2)' }}
            />
          </div>

          {text.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
            >
              <div className="bg-gray-800/50 border-2 border-amber-600/30 rounded-xl shadow-lg" style={{ padding: '2rem', boxShadow: '0 0 40px rgba(217, 119, 6, 0.3)' }}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3" style={{ marginBottom: '2rem' }}>
                  <span className="text-base font-medium text-gray-300">Runos</span>
                  <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                    <button
                      onClick={handleCopy}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm sm:text-base text-gray-300 transition-colors"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 sm:w-5 h-4 sm:h-5 text-green-400" />
                          <span className="hidden sm:inline">Nukopijuota!</span>
                          <span className="sm:hidden">✓</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 sm:w-5 h-4 sm:h-5" />
                          Kopijuoti
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm sm:text-base text-gray-300 transition-colors"
                    >
                      <Download className="w-4 sm:w-5 h-4 sm:h-5" />
                      <span className="hidden sm:inline">Atsisiųsti</span>
                      <span className="sm:hidden">Siųsti</span>
                    </button>
                  </div>
                </div>

                <div className="text-5xl md:text-6xl text-amber-400 font-bold tracking-wider break-all animate-glow">
                  {runeString || '...'}
                </div>
              </div>

              {uniqueRunes.length > 0 && (
                <div className="bg-gray-800/50 border-2 border-amber-600/20 rounded-xl shadow-lg" style={{ padding: '2rem', boxShadow: '0 0 30px rgba(217, 119, 6, 0.2)' }}>
                  <h3 className="text-base font-medium text-gray-300" style={{ marginBottom: '1.5rem' }}>
                    Naudotos runos ({uniqueRunes.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {uniqueRunes.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-4"
                      >
                        <span className="text-3xl text-amber-400">{item.rune}</span>
                        <div>
                          <span className="text-white font-medium text-base block">
                            {item.name}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {item.original.toUpperCase()}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-purple-900/30 border-2 border-amber-600/20 rounded-xl shadow-lg" style={{ padding: '1.5rem', boxShadow: '0 0 25px rgba(217, 119, 6, 0.15)' }}>
                <h4 className="text-amber-300 font-medium text-base" style={{ marginBottom: '1rem' }}>💡 Patarimas</h4>
                <p className="text-gray-400 text-base leading-relaxed">
                  Elder Futhark runos neturi visų šiuolaikinių raidžių atitikmenų. 
                  Kai kurios raidės (pvz. Q, X) bus pakeistos artimiausiomis runomis.
                  Lietuviškos raidės (ą, č, ė, etc.) taip pat konvertuojamos.
                </p>
              </div>
            </motion.div>
          )}

          {text.length === 0 && (
            <div className="text-center" style={{ padding: '4rem 0' }}>
              <div className="text-7xl mb-6 text-amber-400 animate-glow">ᚠᚢᚦᚨᚱᚲ</div>
              <p className="text-gray-400 text-lg">
                Pradėkite rašyti, kad pamatytumėte runas
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
