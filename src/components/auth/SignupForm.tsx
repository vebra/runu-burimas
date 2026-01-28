import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2, Check, X } from 'lucide-react'

interface SignupFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  onSwitchToLogin: () => void
}

export function SignupForm({ onSubmit, onSwitchToLogin }: SignupFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const passwordRequirements = [
    { label: 'Mažiausiai 8 simboliai', met: password.length >= 8 },
    { label: 'Didžioji raidė', met: /[A-Z]/.test(password) },
    { label: 'Mažoji raidė', met: /[a-z]/.test(password) },
    { label: 'Skaičius', met: /\d/.test(password) },
  ]

  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0
  const allRequirementsMet = passwordRequirements.every(r => r.met)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!allRequirementsMet) {
      setError('Slaptažodis neatitinka reikalavimų')
      return
    }

    if (!passwordsMatch) {
      setError('Slaptažodžiai nesutampa')
      return
    }

    setLoading(true)

    try {
      await onSubmit(email, password)
      setSuccess(true)
    } catch (err) {
      console.error('Signup error:', err)
      const errorMessage = err instanceof Error ? err.message : 'Registracija nepavyko'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md mx-auto"
      >
        <div className="bg-gray-900/80 backdrop-blur-sm border border-green-500/20 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-400" />
          </div>
          <h2 className="text-2xl font-cinzel font-bold text-white mb-4">
            Registracija sėkminga!
          </h2>
          <p className="text-gray-400 mb-6">
            Patikrinkite savo el. paštą ir patvirtinkite paskyrą.
          </p>
          <button
            onClick={onSwitchToLogin}
            className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
          >
            Grįžti į prisijungimą
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-gray-900/80 backdrop-blur-sm border border-amber-600/20 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-cinzel font-bold text-white mb-2">
            Sukurti paskyrą
          </h2>
          <p className="text-gray-400">Pradėkite savo runų kelionę</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm"
            >
              {error}
            </motion.div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">El. paštas</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                placeholder="jusu@email.lt"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Slaptažodis</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-800/50 border border-gray-700 rounded-lg py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-1 mt-2"
              >
                {passwordRequirements.map((req, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    {req.met ? (
                      <Check className="w-3 h-3 text-green-400" />
                    ) : (
                      <X className="w-3 h-3 text-gray-500" />
                    )}
                    <span className={req.met ? 'text-green-400' : 'text-gray-500'}>
                      {req.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-300">Pakartokite slaptažodį</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-gray-800/50 border rounded-lg py-3 pl-11 pr-12 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                  confirmPassword.length > 0
                    ? passwordsMatch
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
                      : 'border-red-500 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-700 focus:border-amber-500 focus:ring-amber-500'
                }`}
                placeholder="••••••••"
                required
              />
              {confirmPassword.length > 0 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {passwordsMatch ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <X className="w-5 h-5 text-red-400" />
                  )}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !allRequirementsMet || !passwordsMatch}
            className="w-full bg-gradient-to-r from-purple-800 via-purple-700 to-violet-600 hover:from-purple-700 hover:via-purple-600 hover:to-violet-500 text-amber-100 font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 border border-amber-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Kuriama paskyra...
              </>
            ) : (
              'Registruotis'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Jau turite paskyrą?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Prisijungti
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
