import { clsx } from 'clsx'

type Variant = 'green' | 'yellow' | 'red' | 'blue' | 'gray' | 'purple' | 'orange'

const variants: Record<Variant, string> = {
  green:  'bg-[#EAF5EC] text-[#4A8A5A] border border-[#C4DFC8]',
  yellow: 'bg-[#FBF5E6] text-[#9A7A30] border border-[#E8D9A0]',
  red:    'bg-[#FAF0EE] text-[#A04040] border border-[#DDBCB8]',
  blue:   'bg-[#EDF2FB] text-[#405A8A] border border-[#C0CEEA]',
  gray:   'bg-[#F4F1EC] text-[#7A7067] border border-[#E0D8CE]',
  purple: 'bg-[#F2EDF8] text-[#6A4A8A] border border-[#D0B8E8]',
  orange: 'bg-[#FBF2E8] text-[#9A6030] border border-[#E8C8A0]',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: Variant
  className?: string
}

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.08em]',
      variants[variant],
      className
    )}>
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
