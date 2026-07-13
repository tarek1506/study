import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { CourseCard } from './CourseCard'
import type { CourseWithProgress } from '@/types/database'
import { cn } from '@/lib/utils'

interface SortableCourseCardProps {
  course: CourseWithProgress
  onDelete?: (id: string) => void
  onEdit?: (course: CourseWithProgress) => void
  isDragging?: boolean
}

export function SortableCourseCard({ course, onDelete, onEdit }: SortableCourseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
    over,
  } = useSortable({ id: course.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition ?? 'transform 200ms cubic-bezier(0.25, 1, 0.5, 1)',
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.4 : 1,
  }

  const isOverThis = over?.id === course.id

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group/sortable',
        isOverThis && !isDragging && 'ring-2 ring-[hsl(var(--accent))] ring-offset-2 rounded-[22px]'
      )}
    >
      {/* Drag handle — appears on hover */}
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        className={cn(
          'absolute -left-2 top-1/2 -translate-y-1/2 z-10',
          'flex h-7 w-7 items-center justify-center rounded-full',
          'border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] shadow-card',
          'text-[hsl(var(--text-tertiary))] cursor-grab active:cursor-grabbing',
          'opacity-0 group-hover/sortable:opacity-100',
          'transition-all duration-150 hover:text-[hsl(var(--accent))] hover:border-[hsl(var(--accent))]',
          isDragging && 'opacity-100 cursor-grabbing'
        )}
        title="Drag to reorder"
      >
        <GripVertical className="h-3.5 w-3.5" strokeWidth={2} />
      </button>

      <CourseCard course={course} onDelete={onDelete} onEdit={onEdit} />
    </div>
  )
}

/** Ghost placeholder shown in the drop slot while dragging */
export function CourseDragOverlay({ course }: { course: CourseWithProgress }) {
  return (
    <div className="rotate-[1.5deg] scale-[1.03] shadow-[0_12px_40px_hsl(18_77%_60%/0.18)]">
      <CourseCard course={course} />
    </div>
  )
}
