import { clsx } from 'clsx'

type Variant = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'orange'

const variants: Record<Variant, string> = {
  green: 'bg-green-100 text-green-800',
  yellow: 'bg-yellow-100 text-yellow-800',
  red: 'bg-red-100 text-red-800',
  blue: 'bg-blue-100 text-blue-800',
  gray: 'bg-gray-100 text-gray-800',
  purple: 'bg-purple-100 text-purple-800',
  orange: 'bg-orange-100 text-orange-800',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}

export function OrderStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    pending: 'yellow',
    paid: 'blue',
    processing: 'blue',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red',
  }
  return <Badge variant={map[status] ?? 'gray'}>{status}</Badge>
}

export function ProductStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    active: 'green',
    draft: 'yellow',
    archived: 'gray',
  }
  return <Badge variant={map[status] ?? 'gray'}>{status}</Badge>
}

export function AdvanceStatusBadge({ status }: { status: string }) {
  const map: Record<string, Variant> = {
    not_required: 'gray',
    pending: 'yellow',
    submitted: 'blue',
    verified: 'green',
    rejected: 'red',
  }
  return <Badge variant={map[status] ?? 'gray'}>{status.replace('_', ' ')}</Badge>
}
