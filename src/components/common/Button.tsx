import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'gradient' | 'gold' | 'magic'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  children: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      children,
      className = '',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

    const variants = {
      // Main purple gradient - most common
      primary:
        'bg-linear-to-r from-purple-800 via-purple-700 to-violet-600 hover:from-purple-700 hover:via-purple-600 hover:to-violet-500 text-amber-100 shadow-lg shadow-purple-900/30 border border-amber-600/20',

      // Dark gray with amber border
      secondary:
        'bg-gray-800 hover:bg-gray-700 text-white border border-amber-600/30 hover:border-amber-500/50',

      // Transparent with hover effect
      ghost:
        'bg-transparent hover:bg-purple-900/30 text-gray-300 hover:text-amber-200',

      // Vibrant purple-pink for hero sections
      gradient:
        'bg-linear-to-r from-purple-600 via-purple-500 to-pink-600 hover:from-purple-500 hover:via-pink-500 hover:to-purple-500 text-white shadow-xl shadow-purple-900/50 border border-purple-400/30',

      // Gold/amber for CTAs
      gold:
        'bg-linear-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:via-yellow-400 hover:to-amber-400 text-gray-900 shadow-2xl shadow-amber-900/30',

      // Magic button with CSS animations (uses index.css .magic-button)
      magic:
        'magic-button text-white',
    }

    const sizes = {
      sm: 'px-4 py-2 text-sm gap-2',
      md: 'px-6 py-3 text-base gap-2.5',
      lg: 'px-8 py-4 text-lg gap-3',
      xl: 'px-12 py-5 text-xl md:text-2xl gap-3',
    }

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading && (
          <Loader2 className={`animate-spin ${size === 'xl' ? 'w-6 h-6' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'}`} />
        )}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
