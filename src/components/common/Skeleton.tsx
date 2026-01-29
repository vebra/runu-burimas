import { motion } from 'framer-motion'

interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rune-card'
  width?: string | number
  height?: string | number
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height
}: SkeletonProps) {
  const baseClasses = 'bg-gray-800/50 overflow-hidden relative'

  const variantClasses = {
    text: 'rounded h-4',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
    'rune-card': 'rounded-xl',
  }

  const style = {
    width: width || (variant === 'circular' ? '40px' : '100%'),
    height: height || (variant === 'circular' ? '40px' : variant === 'text' ? '16px' : '100px'),
  }

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      style={style}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-700/30 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  )
}

// Pre-built skeleton layouts
export function RuneCardSkeleton() {
  return (
    <div className="w-24 h-36 sm:w-28 sm:h-44 bg-gray-800/50 border-2 border-gray-700 rounded-xl flex flex-col items-center justify-center">
      <Skeleton variant="circular" width={48} height={48} className="mb-2" />
      <Skeleton variant="text" width={60} height={12} />
    </div>
  )
}

export function ProfileStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-gray-800/50 border border-gray-700 rounded-xl p-4">
          <Skeleton variant="circular" width={24} height={24} className="mx-auto mb-2" />
          <Skeleton variant="text" width={40} height={24} className="mx-auto mb-1" />
          <Skeleton variant="text" width={80} height={12} className="mx-auto" />
        </div>
      ))}
    </div>
  )
}

export function DivinationHistorySkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-gray-700">
          <div className="flex-1">
            <Skeleton variant="text" width={120} height={16} className="mb-2" />
            <Skeleton variant="text" width={200} height={12} />
          </div>
          <Skeleton variant="text" width={80} height={12} />
        </div>
      ))}
    </div>
  )
}

export function DailyRuneSkeleton() {
  return (
    <div className="flex flex-col items-center">
      <Skeleton variant="rectangular" width={192} height={288} className="rounded-2xl mb-6" />
      <Skeleton variant="text" width={120} height={32} className="mb-2" />
      <Skeleton variant="text" width={80} height={20} className="mb-4" />
      <Skeleton variant="text" width={300} height={16} className="mb-2" />
      <Skeleton variant="text" width={250} height={16} />
    </div>
  )
}
