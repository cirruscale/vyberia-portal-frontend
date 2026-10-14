import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none rounded-lg cursor-pointer'

const variants: Record<string, string> = {
  primary: 'bg-dark text-white hover:bg-brand focus:ring-brand/40 shadow-sm',
  secondary: 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 focus:ring-stone-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300',
  ghost: 'text-stone-600 hover:text-stone-900 hover:bg-stone-100 focus:ring-stone-200',
  outline: 'border border-stone-300 text-stone-700 hover:border-dark hover:text-dark focus:ring-stone-300',
}

const sizes: Record<string, string> = {
  sm: 'text-xs px-3 py-1.5 gap-1.5',
  md: 'text-sm px-4 py-2 gap-2',
  lg: 'text-sm px-5 py-2.5 gap-2',
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
