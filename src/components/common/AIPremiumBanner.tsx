import { Link } from 'react-router-dom'
import { Crown, Sparkles } from 'lucide-react'

export function AIPremiumBanner() {
  return (
    <div
      className="rounded-xl border-2 border-amber-500/30 text-center"
      style={{
        padding: '1.5rem',
        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
      }}
    >
      <div className="flex items-center justify-center gap-2" style={{ marginBottom: '19px' }}>
        <Sparkles className="w-5 h-5 text-amber-400" />
        <span className="text-amber-300 font-cinzel font-semibold text-lg">AI Interpretacija</span>
        <Sparkles className="w-5 h-5 text-amber-400" />
      </div>
      <p className="text-gray-300 text-base" style={{ marginBottom: '19px' }}>
        Norite gauti AI interpretaciją? Jums reikalinga{' '}
        <strong className="text-amber-400">PREMIUM</strong> prenumerata
      </p>
      <Link
        to="/premium"
        className="inline-flex items-center gap-3 bg-linear-to-r from-amber-500 to-yellow-500 text-gray-900 font-bold text-lg py-4 px-10 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/20"
      >
        <Crown className="w-6 h-6" />
        Gauti Premium
      </Link>
    </div>
  )
}
