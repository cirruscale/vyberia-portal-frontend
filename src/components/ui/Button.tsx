import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 outline-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer'

const variants: Record<string, string> = {
  primary: 'bg-dark text-white hover:bg-brand rounded-full',
  secondary: 'bg-white text-dark border border-[#ddd] hover:border-dark rounded-full',
  danger: 'bg-red-600 text-white hover:bg-red-700 rounded-full',
  ghost: 'text-[#666] hover:text-dark hover:bg-[#f5f5f5] rounded-[3px]',
  outline: 'border border-[#ddd] text-dark hover:border-dark rounded-full',
}

const sizes: Record<string, string> = {
  sm: 'text-[12px] px-4 py-2 gap-1.5',
  md: 'text-[13px] px-5 py-2.5 gap-2',
  lg: 'text-[13px] px-7 py-3 gap-2',
}

export function Button({ variant = 'primary', size = 'md', loading, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  )
}
