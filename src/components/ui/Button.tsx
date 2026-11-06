import { type ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
}

const base = 'inline-flex items-center justify-center font-medium transition-all duration-200 outline-none disabled:opacity-40 disabled:pointer-events-none cursor-pointer uppercase tracking-[0.1em]'

const variants: Record<string, string> = {
  primary:   'bg-[#B8956A] text-[#FAF9F7] border border-[#B8956A] hover:bg-[#9A7A54] hover:border-[#9A7A54]',
  secondary: 'bg-transparent text-[#2A1F14] border border-[#B8956A] hover:bg-[#B8956A] hover:text-[#FAF9F7]',
  danger:    'bg-red-600 text-white border border-red-600 hover:bg-red-700 hover:border-red-700',
  ghost:     'text-[#7A7067] hover:text-[#0C0B0A] hover:bg-[#F2EDE5] border border-transparent',
  outline:   'border border-[#E0D8CE] text-[#0C0B0A] hover:border-[#B8956A] hover:text-[#B8956A]',
}

const sizes: Record<string, string> = {
  sm: 'text-[10px] px-4 py-2 gap-1.5',
  md: 'text-[11px] px-5 py-2.5 gap-2',
  lg: 'text-[11px] px-7 py-3.5 gap-2.5',
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
