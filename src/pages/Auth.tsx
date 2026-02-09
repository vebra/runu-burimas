import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail } from 'lucide-react'
import { LoginForm } from '../components/auth/LoginForm'
import { SignupForm } from '../components/auth/SignupForm'
import { useAuth } from '../hooks/useAuth'
import { useSEO } from '../hooks/useSEO'
import { Button } from '../components/common/Button'
import { Input } from '../components/common/Input'
import { useToast } from '../components/common/Toast'

export function Auth() {
  useSEO({
    title: 'Prisijungimas',
    description: 'Prisijunkite prie Runų Būrimo — išsaugokite savo būrimus, kasdienę runą ir mėgstamas runas.',
    noindex: true,
  })
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login')
  const { signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const handleLogin = async (email: string, password: string) => {
    await signIn(email, password)
    toast.success('Sėkmingai prisijungta!')
    navigate('/')
  }

  const handleSignup = async (email: string, password: string) => {
    await signUp(email, password)
    toast.success('Registracija sėkminga! Patikrinkite el. paštą.')
  }

  const handleForgotPassword = async (email: string) => {
    await resetPassword(email)
  }

  return (
    <div className="min-h-screen py-12 px-4" style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
          style={{ marginBottom: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
        >
          <span className="text-6xl block">🔮</span>
          <h1 className="text-3xl font-cinzel font-bold text-white">
            Runų Būrimas
          </h1>
        </motion.div>

        {mode === 'login' && (
          <LoginForm
            onSubmit={handleLogin}
            onSwitchToSignup={() => setMode('signup')}
            onForgotPassword={() => setMode('forgot')}
          />
        )}

        {mode === 'signup' && (
          <SignupForm
            onSubmit={handleSignup}
            onSwitchToLogin={() => setMode('login')}
          />
        )}

        {mode === 'forgot' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/80 backdrop-blur-sm border border-amber-600/20 rounded-2xl p-8 shadow-2xl"
          >
            <h2 className="text-2xl font-cinzel font-bold text-white mb-4 text-center">
              Atkurti slaptažodį
            </h2>
            <p className="text-gray-400 text-center mb-6">
              Įveskite savo el. paštą ir mes atsiųsime slaptažodžio atkūrimo nuorodą.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const form = e.target as HTMLFormElement
                const email = (form.elements.namedItem('email') as HTMLInputElement).value
                try {
                  await handleForgotPassword(email)
                  toast.success('Patikrinkite savo el. paštą!')
                  setMode('login')
                } catch {
                  toast.error('Klaida siunčiant el. laišką')
                }
              }}
              className="space-y-4"
            >
              <Input
                type="email"
                name="email"
                placeholder="jusu@email.lt"
                leftIcon={<Mail className="w-5 h-5" />}
                required
              />
              <Button type="submit" size="lg" className="w-full">
                Siųsti nuorodą
              </Button>
            </form>
            <button
              onClick={() => setMode('login')}
              className="w-full text-center text-amber-400 hover:text-amber-300 mt-4 transition-colors"
            >
              Grįžti į prisijungimą
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
