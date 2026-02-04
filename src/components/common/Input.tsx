import { forwardRef, useId, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'

type BaseProps = {
  label?: string
  error?: string
  hint?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  variant?: 'default' | 'glow'
  inputSize?: 'sm' | 'md' | 'lg'
}

type InputProps = BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & {
  as?: 'input'
}

type TextareaProps = BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> & {
  as: 'textarea'
  rows?: number
}

type Props = InputProps | TextareaProps

const baseStyles =
  'w-full bg-gray-800/50 border text-white placeholder-gray-500 focus:outline-none transition-colors'

const variants = {
  default: 'border-gray-700 focus:border-amber-500 focus:ring-1 focus:ring-amber-500',
  glow: 'border-2 border-amber-600/30 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/50 shadow-lg',
}

const sizes = {
  sm: 'rounded-lg py-2 px-3 text-sm',
  md: 'rounded-lg py-3 px-4 text-base',
  lg: 'rounded-xl p-4 text-lg',
}

const glowShadow = '0 0 20px rgba(217, 119, 6, 0.15)'

export const Input = forwardRef<HTMLInputElement | HTMLTextAreaElement, Props>(
  (
    {
      label,
      error,
      hint,
      leftIcon,
      rightIcon,
      variant = 'default',
      inputSize = 'md',
      className = '',
      as = 'input',
      ...props
    },
    ref
  ) => {
    const id = useId()
    const inputId = props.id || id
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`
    
    const hasLeftIcon = !!leftIcon
    const hasRightIcon = !!rightIcon

    const inputClasses = `
      ${baseStyles}
      ${variants[variant]}
      ${sizes[inputSize]}
      ${hasLeftIcon ? 'pl-11' : ''}
      ${hasRightIcon ? 'pr-11' : ''}
      ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
      ${className}
    `.trim()

    const style = variant === 'glow' ? { boxShadow: glowShadow } : undefined
    
    const ariaDescribedBy = [
      error ? errorId : null,
      hint && !error ? hintId : null,
    ].filter(Boolean).join(' ') || undefined

    return (
      <div className="space-y-2">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300">
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" aria-hidden="true">
              {leftIcon}
            </div>
          )}

          {as === 'textarea' ? (
            <textarea
              ref={ref as React.Ref<HTMLTextAreaElement>}
              id={inputId}
              className={`${inputClasses} resize-none`}
              style={style}
              aria-invalid={!!error}
              aria-describedby={ariaDescribedBy}
              {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          ) : (
            <input
              ref={ref as React.Ref<HTMLInputElement>}
              id={inputId}
              className={inputClasses}
              style={style}
              aria-invalid={!!error}
              aria-describedby={ariaDescribedBy}
              {...(props as InputHTMLAttributes<HTMLInputElement>)}
            />
          )}

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 flex items-center" aria-hidden="true">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-sm text-red-400" role="alert">
            {error}
          </p>
        )}

        {hint && !error && (
          <p id={hintId} className="text-sm text-gray-500">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Convenience component for Textarea with better defaults
export const Textarea = forwardRef<
  HTMLTextAreaElement,
  Omit<TextareaProps, 'as'>
>((props, ref) => (
  <Input as="textarea" ref={ref} {...props} />
))

Textarea.displayName = 'Textarea'
