import { clsx } from 'clsx'

type Variant = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'orange'

const variants: Record<Variant, string> = {
  green: 'bg-green-50 text-green-700',
  yellow: 'bg-amber-50 text-amber-700',
  red: 'bg-red-50 text-red-700',
  blue: 'bg-blue-50 text-blue-700',
  gray: 'bg-[#f0f0f0] text-[#666]',
  purple: 'bg-purple-50 text-purple-700',
  orange: 'bg-orange-50 text-orange-700',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium uppercase tracking-[0.03em]', variants[variant], className)}>
      {children}
    </span>
  )
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    pending: 'yellow', paid: 'blue', processing: 'blue',
    shipped: 'purple', delivered: 'green', cancelled: 'red',
  }
  return <Badge variant={map[status] ?? 'gray'}>{status}</Badge>
}

export function ProductStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = { active: 'green', draft: 'yellow', archived: 'gray' }
  return <Badge variant={map[status] ?? 'gray'}>{status}</Badge>
}

export function AdvanceStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    not_required: 'gray', pending: 'yellow', submitted: 'blue',
    verified: 'green', rejected: 'red',
  }
  return <Badge variant={map[status] ?? 'gray'}>{status.replace('_', ' ')}</Badge>
}
