import { useState } from 'react'
import { CheckCircle2, Circle, Clock, Trash2, ChevronDown, ChevronUp, Plus, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SectionWithLessons } from '@/types/database'
import { useToggleLesson, useCreateLesson, useDeleteLesson, useDeleteSection } from '@/hooks/useLessons'

interface SectionAccordionProps {
  section: SectionWithLessons
  courseId: string
}

export function SectionAccordion({ section, courseId }: SectionAccordionProps) {
  const [open, setOpen] = useState(true)
  const [addingLesson, setAddingLesson] = useState(false)
  const [lessonTitle, setLessonTitle] = useState('')
  const [lessonDuration, setLessonDuration] = useState('')

  const toggleLesson  = useToggleLesson(courseId)
  const createLesson  = useCreateLesson(courseId)
  const deleteLesson  = useDeleteLesson(courseId)
  const deleteSection = useDeleteSection(courseId)

  const completedCount = section.lessons.filter((l) => l.is_completed).length
  const totalCount     = section.lessons.length

  const handleAddLesson = async () => {
    if (!lessonTitle.trim()) return
    await createLesson.mutateAsync({
      section_id:       section.id,
      title:            lessonTitle.trim(),
      duration_minutes: lessonDuration ? parseInt(lessonDuration) : null,
      position:         totalCount,
      is_completed:     false,
      completed_at:     null,
    })
    setLessonTitle('')
    setLessonDuration('')
    setAddingLesson(false)
  }

  return (
    <div className="rounded-[16px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] overflow-hidden shadow-card">
      {/* Section header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-[hsl(0_0%_98%)] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          <div className="icon-circle h-8 w-8 bg-[hsl(var(--accent-soft))]">
            {open
              ? <ChevronUp   className="h-4 w-4 text-[hsl(var(--accent))]" strokeWidth={2} />
              : <ChevronDown className="h-4 w-4 text-[hsl(var(--accent))]" strokeWidth={2} />}
          </div>
          <div>
            <p className="font-semibold text-sm text-[hsl(var(--text-primary))]">{section.title}</p>
            <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
              {completedCount}/{totalCount} completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            className="flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--text-tertiary))] hover:bg-red-50 hover:text-red-500 transition-colors"
            onClick={() => deleteSection.mutate(section.id)}
          >
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Lessons list */}
      {open && (
        <div className="border-t border-[hsl(var(--border-subtle))] divide-y divide-[hsl(var(--border-subtle))]">
          {section.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className={cn(
                'group flex items-center gap-3 px-4 py-3 transition-colors',
                lesson.is_completed ? 'bg-[hsl(18_85%_96%)]' : 'hover:bg-[hsl(0_0%_98%)]'
              )}
            >
              {/* Checkbox toggle */}
              <button
                onClick={() =>
                  toggleLesson.mutate({ id: lesson.id, is_completed: !lesson.is_completed })
                }
                disabled={toggleLesson.isPending}
                className="shrink-0 transition-colors"
              >
                {lesson.is_completed ? (
                  <CheckCircle2
                    className="h-[18px] w-[18px] text-[hsl(var(--accent))]"
                    strokeWidth={2}
                  />
                ) : (
                  <Circle
                    className="h-[18px] w-[18px] text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--accent))]"
                    strokeWidth={1.75}
                  />
                )}
              </button>

              {/* Title */}
              <p
                className={cn(
                  'flex-1 min-w-0 truncate text-sm font-medium',
                  lesson.is_completed
                    ? 'line-through text-[hsl(var(--text-tertiary))]'
                    : 'text-[hsl(var(--text-primary))]'
                )}
              >
                {lesson.title}
              </p>

              {lesson.duration_minutes && (
                <span className="flex items-center gap-1 text-[11px] text-[hsl(var(--text-tertiary))] shrink-0">
                  <Clock className="h-3 w-3" strokeWidth={1.75} />
                  {lesson.duration_minutes}m
                </span>
              )}

              <button
                className="flex h-6 w-6 items-center justify-center rounded-full text-[hsl(var(--text-tertiary))] hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                onClick={() => deleteLesson.mutate(lesson.id)}
              >
                <Trash2 className="h-3 w-3" strokeWidth={1.75} />
              </button>
            </div>
          ))}

          {/* Add lesson form */}
          {addingLesson ? (
            <div className="flex items-center gap-2 px-4 py-3 bg-[hsl(0_0%_98%)]">
              <Circle className="h-[18px] w-[18px] text-[hsl(var(--text-tertiary))] shrink-0" strokeWidth={1.75} />
              <Input
                autoFocus
                placeholder="Lesson title"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddLesson()}
                className="h-8 text-sm flex-1 rounded-full"
              />
              <Input
                placeholder="Min"
                type="number"
                value={lessonDuration}
                onChange={(e) => setLessonDuration(e.target.value)}
                className="h-8 text-sm w-16 rounded-full"
              />
              <Button size="sm" variant="accent" className="h-8" onClick={handleAddLesson} disabled={createLesson.isPending}>
                {createLesson.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Add'}
              </Button>
              <Button size="sm" variant="ghost" className="h-8" onClick={() => setAddingLesson(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <button
              className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-soft))] transition-colors"
              onClick={() => setAddingLesson(true)}
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add lesson
            </button>
          )}
        </div>
      )}
    </div>
  )
}
