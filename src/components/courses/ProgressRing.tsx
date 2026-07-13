import { cn } from '@/lib/utils'

interface ProgressRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  className?: string
  label?: string
}

export function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 10,
  className,
  label = 'complete',
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track — light gray */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(0 0% 90%)"
          strokeWidth={strokeWidth}
        />
        {/* Coral progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--accent))"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Center label */}
      <div className="absolute flex flex-col items-center text-center">
        <span className="text-xl font-bold leading-none text-[hsl(var(--text-primary))]">
          {progress}%
        </span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[hsl(var(--text-tertiary))]">
          {label}
        </span>
      </div>
    </div>
  )
}
