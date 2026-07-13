import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

export function getProgress(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    programming: 'from-violet-500 to-purple-600',
    design: 'from-pink-500 to-rose-600',
    math: 'from-blue-500 to-cyan-600',
    science: 'from-green-500 to-emerald-600',
    language: 'from-orange-500 to-amber-600',
    business: 'from-teal-500 to-green-600',
    other: 'from-slate-500 to-gray-600',
  }
  return colors[category.toLowerCase()] || colors.other
}
