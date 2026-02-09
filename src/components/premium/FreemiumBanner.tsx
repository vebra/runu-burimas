import { motion } from 'framer-motion'
import { Crown, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

interface FreemiumBannerProps {
  usedCount: number
  monthlyLimit: number
}

export function FreemiumBanner({ usedCount, monthlyLimit }: FreemiumBannerProps) {
  const remaining = Math.max(0, monthlyLimit - usedCount)
  const progress = usedCount / monthlyLimit

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto mb-6"
    >
      <div className="bg-purple-900/30 border border-amber-500/40 rounded-xl p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span className="text-amber-200 text-sm sm:text-base font-medium">
              Liko {remaining}/{monthlyLimit} nemokami premium burimai si menesi
            </span>
          </div>
          <Link
            to="/premium"
            className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-sm font-semibold transition-colors"
          >
            <Crown className="w-4 h-4" />
            <span className="hidden sm:inline">Premium</span>
          </Link>
        </div>

        <div className="w-full bg-purple-900/50 rounded-full h-2.5 overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background: progress >= 1
                ? 'linear-gradient(to right, #ef4444, #dc2626)'
                : progress >= 0.67
                  ? 'linear-gradient(to right, #f59e0b, #d97706)'
                  : 'linear-gradient(to right, #10b981, #059669)',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        {remaining <= 1 && remaining > 0 && (
          <p className="text-amber-300/80 text-xs mt-2">
            Paskutinis nemokamas burimas! Prenumeruok Premium neribotam naudojimui.
          </p>
        )}
      </div>
    </motion.div>
  )
}
