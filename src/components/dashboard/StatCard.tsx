import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  iconBg?: string      // Tailwind class for icon circle background
  iconColor?: string   // Tailwind class for icon color
  trend?: string
  accent?: boolean     // if true, renders with coral accent tint
  className?: string
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconBg = 'bg-[hsl(var(--accent-soft))]',
  iconColor = 'text-[hsl(var(--accent))]',
  trend,
  accent,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-4 rounded-[20px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] p-5 shadow-card transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5',
        accent && 'bg-[hsl(var(--accent))] border-transparent text-white',
        className
      )}
    >
      {/* Top row: icon + label */}
      <div className="flex items-center justify-between">
        {/* Icon circle */}
        <div
          className={cn(
            'icon-circle h-10 w-10',
            accent ? 'bg-white/20' : iconBg
          )}
        >
          <Icon
            className={cn('h-[18px] w-[18px]', accent ? 'text-white' : iconColor)}
            strokeWidth={1.75}
          />
        </div>
        {trend && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-semibold',
              accent
                ? 'bg-white/20 text-white'
                : 'bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent))]'
            )}
          >
            {trend}
          </span>
        )}
      </div>

      {/* Value */}
      <div>
        <p
          className={cn(
            'text-[26px] font-bold leading-none tracking-tight',
            accent ? 'text-white' : 'text-[hsl(var(--text-primary))]'
          )}
        >
          {value}
        </p>
        <p
          className={cn(
            'mt-1.5 text-xs font-medium',
            accent ? 'text-white/70' : 'text-[hsl(var(--text-secondary))]'
          )}
        >
          {title}
        </p>
        {description && (
          <p
            className={cn(
              'mt-0.5 text-[11px]',
              accent ? 'text-white/50' : 'text-[hsl(var(--text-tertiary))]'
            )}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
