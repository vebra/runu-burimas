import { Link } from 'react-router-dom'
import { Crown, Sparkles } from 'lucide-react'

export function AIPremiumBanner() {
  return (
    <div
      className="rounded-xl border-2 border-amber-500/30 text-center p-4 sm:p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(217, 119, 6, 0.08) 0%, rgba(147, 51, 234, 0.08) 100%)',
      }}
    >
      <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
        <span
          className="text-amber-300 font-cinzel font-semibold"
          style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.125rem)' }}
        >
          AI Interpretacija
        </span>
        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
      </div>
      <p className="text-gray-300 text-sm sm:text-base mb-3 sm:mb-4">
        Norite gauti AI interpretaciją? Jums reikalinga{' '}
        <strong className="text-amber-400">PREMIUM</strong> prenumerata
      </p>
      <Link
        to="/premium"
        className="inline-flex items-center gap-2 sm:gap-3 bg-linear-to-r from-amber-500 to-yellow-500 text-gray-900 font-bold py-3 sm:py-3.5 px-6 sm:px-8 rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/20"
        style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)' }}
      >
        <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
        Gauti Premium
      </Link>
    </div>
  )
}
