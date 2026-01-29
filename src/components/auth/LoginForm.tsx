import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { Button } from '../common/Button'
import { Input } from '../common/Input'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  onSwitchToSignup: () => void
  onForgotPassword: () => void
}

export function LoginForm({ onSubmit, onSwitchToSignup, onForgotPassword }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await onSubmit(email, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Prisijungimas nepavyko')
    } finally {
      setLoading(false)
    }
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
            Sveiki sugrįžę
          </h2>
          <p className="text-gray-400">Prisijunkite prie savo paskyros</p>
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

          <Input
            type="email"
            label="El. paštas"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jusu@email.lt"
            leftIcon={<Mail className="w-5 h-5" />}
            required
          />

          <Input
            type={showPassword ? 'text' : 'password'}
            label="Slaptažodis"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            leftIcon={<Lock className="w-5 h-5" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-gray-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            }
            required
            minLength={8}
          />

          <div className="flex items-center justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-sm text-amber-400 hover:text-amber-300 transition-colors"
            >
              Pamiršote slaptažodį?
            </button>
          </div>

          <Button type="submit" loading={loading} size="lg" className="w-full">
            {loading ? 'Jungiamasi...' : 'Prisijungti'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Neturite paskyros?{' '}
            <button
              onClick={onSwitchToSignup}
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Registruotis
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  )
}
