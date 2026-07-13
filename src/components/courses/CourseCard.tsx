import { useNavigate } from 'react-router-dom'
import { BookOpen, Clock, MoreVertical, Trash2, ArrowRight, Pencil, Calendar } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { CourseWithProgress } from '@/types/database'
import { cn } from '@/lib/utils'
import { useState } from 'react'

function getDurationText(start: string | null, end: string | null): string | null {
  if (!start || !end) return null
  const startDate = new Date(start)
  const endDate = new Date(end)
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null

  const days = differenceInDays(endDate, startDate) + 1
  if (days <= 0) return null

  if (days < 14) {
    return `${days} day${days !== 1 ? 's' : ''}`
  }
  const weeks = Math.round(days / 7)
  if (weeks < 8) {
    return `${weeks} week${weeks !== 1 ? 's' : ''}`
  }
  const months = Math.round(days / 30.4)
  return `${months} month${months !== 1 ? 's' : ''}`
}

interface CourseCardProps {
  course: CourseWithProgress
  onDelete?: (id: string) => void
  onEdit?: (course: CourseWithProgress) => void
}

type CategoryVariant = 'programming' | 'design' | 'math' | 'science' | 'language' | 'business'

export function CourseCard({ course, onDelete, onEdit }: CourseCardProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const category = (course.category?.toLowerCase() ?? 'secondary') as CategoryVariant

  return (
    <div
      className="group relative flex flex-col gap-4 rounded-[20px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] p-5 shadow-card cursor-pointer transition-all duration-200 hover:shadow-card-hover hover:-translate-y-0.5 hover:border-[hsl(var(--accent)/0.25)]"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <Badge variant={category} className="capitalize">
          {course.category ?? 'Other'}
        </Badge>

        {/* Menu */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--text-tertiary))] hover:bg-[hsl(0_0%_93%)] hover:text-[hsl(var(--text-primary))] transition-colors opacity-0 group-hover:opacity-100"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 top-8 z-10 min-w-[140px] rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] shadow-card overflow-hidden"
              onMouseLeave={() => setMenuOpen(false)}
            >
              <button
                className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-[hsl(var(--text-primary))] hover:bg-[hsl(0_0%_96%)] transition-colors"
                onClick={() => { navigate(`/courses/${course.id}`); setMenuOpen(false) }}
              >
                <ArrowRight className="h-3.5 w-3.5" /> Open
              </button>
              {onEdit && (
                <button
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-[hsl(var(--text-primary))] hover:bg-[hsl(0_0%_96%)] transition-colors"
                  onClick={() => { onEdit(course); setMenuOpen(false) }}
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </button>
              )}
              {onDelete && (
                <button
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
                  onClick={() => { onDelete(course.id); setMenuOpen(false) }}
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <h3 className="font-semibold text-[15px] leading-snug text-[hsl(var(--text-primary))] line-clamp-2">
          {course.title}
        </h3>
        {course.description && (
          <p className="mt-1 text-xs text-[hsl(var(--text-secondary))] line-clamp-2">
            {course.description}
          </p>
        )}
      </div>

      {/* Meta row */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-[hsl(var(--text-tertiary))]">
        <span className="flex items-center gap-1">
          <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
          {course.totalLessons} lessons
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
          {course.completedLessons} done
        </span>
        {course.start_date && course.end_date && (
          <span className="flex items-center gap-1 text-[hsl(var(--accent))]">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
            {format(new Date(course.start_date), 'MMM d')} – {format(new Date(course.end_date), 'MMM d, yyyy')} ({getDurationText(course.start_date, course.end_date)})
          </span>
        )}
        {course.start_date && !course.end_date && (
          <span className="flex items-center gap-1 text-[hsl(var(--accent))]">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
            Starts {format(new Date(course.start_date), 'MMM d, yyyy')}
          </span>
        )}
        {!course.start_date && course.end_date && (
          <span className="flex items-center gap-1 text-[hsl(var(--accent))]">
            <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
            Ends {format(new Date(course.end_date), 'MMM d, yyyy')}
          </span>
        )}
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-medium text-[hsl(var(--text-secondary))]">Progress</span>
          <span className={cn(
            'text-[11px] font-bold',
            course.progress === 100
              ? 'text-green-500'
              : 'text-[hsl(var(--accent))]'
          )}>
            {course.progress}%
          </span>
        </div>
        <Progress value={course.progress} className="h-1.5" />
      </div>
    </div>
  )
}
