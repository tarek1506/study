import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft, Plus, Loader2, BookOpen, CheckCircle2, Clock, Calendar, Pencil,
} from 'lucide-react'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ProgressRing } from '@/components/courses/ProgressRing'
import { SectionAccordion } from '@/components/lessons/SectionAccordion'
import { useCourse, useUpdateCourse } from '@/hooks/useCourses'
import { useCreateSection } from '@/hooks/useLessons'
import { useAuth } from '@/hooks/useAuth'
import { CourseForm } from '@/components/courses/CourseForm'

type CategoryVariant = 'programming' | 'design' | 'math' | 'science' | 'language' | 'business'

export function CourseDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [addingSection, setAddingSection] = useState(false)
  const [sectionTitle, setSectionTitle] = useState('')
  const [editOpen, setEditOpen] = useState(false)

  const { user } = useAuth()
  const { data: course, isLoading, error } = useCourse(id)
  const createSection = useCreateSection(id!)
  const updateCourse = useUpdateCourse()

  const handleAddSection = async () => {
    if (!sectionTitle.trim() || !id) return
    await createSection.mutateAsync({
      course_id: id,
      title:     sectionTitle.trim(),
      position:  course?.sections.length ?? 0,
    })
    setSectionTitle('')
    setAddingSection(false)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-7 w-7 animate-spin text-[hsl(var(--accent))]" />
      </div>
    )
  }

  if (error || !course) {
    return (
      <div className="text-center py-20">
        <p className="text-sm text-[hsl(var(--text-secondary))]">Course not found.</p>
        <Button variant="outline" size="sm" className="mt-4" onClick={() => navigate('/courses')}>
          Back to Courses
        </Button>
      </div>
    )
  }

  const category = (course.category?.toLowerCase() ?? 'secondary') as CategoryVariant

  return (
    <div className="space-y-5 max-w-[820px] mx-auto">

      {/* Back */}
      <button
        onClick={() => navigate('/courses')}
        className="flex items-center gap-1.5 text-xs font-medium text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        My Courses
      </button>

      {/* Hero card */}
      <div className="rounded-[24px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] p-6 shadow-card">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Progress ring */}
          <ProgressRing progress={course.progress} size={110} strokeWidth={9} />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <Badge variant={category} className="capitalize">{course.category ?? 'Other'}</Badge>
              {course.progress === 100 && (
                <Badge variant="accent">✓ Completed</Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-[hsl(var(--text-primary))] leading-snug">
                {course.title}
              </h1>
              <button
                onClick={() => setEditOpen(true)}
                className="flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--text-tertiary))] hover:bg-[hsl(0_0%_93%)] hover:text-[hsl(var(--text-primary))] transition-colors"
                title="Edit Course"
              >
                <Pencil className="h-3.5 w-3.5" strokeWidth={2} />
              </button>
            </div>
            {course.description && (
              <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">{course.description}</p>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-[hsl(var(--text-secondary))]">
              <span className="flex items-center gap-1.5">
                <BookOpen className="h-3.5 w-3.5" strokeWidth={1.75} />
                {course.totalLessons} lessons
              </span>
              <span className="flex items-center gap-1.5 text-[hsl(var(--accent))]">
                <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                {course.completedLessons} completed
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" strokeWidth={1.75} />
                {course.totalLessons - course.completedLessons} remaining
              </span>
              {course.start_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Starts {format(new Date(course.start_date), 'MMM d, yyyy')}
                </span>
              )}
              {course.end_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Ends {format(new Date(course.end_date), 'MMM d, yyyy')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="mt-5">
          <div className="flex justify-between text-[11px] font-medium mb-1.5">
            <span className="text-[hsl(var(--text-secondary))]">Overall Progress</span>
            <span className="text-[hsl(var(--accent))]">{course.progress}%</span>
          </div>
          <Progress value={course.progress} className="h-2" />
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">
            Sections
            <span className="ml-2 text-xs font-normal text-[hsl(var(--text-tertiary))]">
              ({course.sections.length})
            </span>
          </h2>
          <Button variant="outline" size="sm" onClick={() => setAddingSection(true)}>
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Add Section
          </Button>
        </div>

        {addingSection && (
          <div className="flex items-center gap-2 rounded-[16px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] p-4 shadow-card">
            <Input
              autoFocus
              placeholder="Section title (e.g. Introduction)"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
            />
            <Button variant="accent" onClick={handleAddSection} disabled={createSection.isPending}>
              {createSection.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : 'Add'}
            </Button>
            <Button variant="outline" onClick={() => setAddingSection(false)}>Cancel</Button>
          </div>
        )}

        {course.sections.length === 0 ? (
          <div className="py-14 text-center rounded-[20px] border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))]">
            <div className="icon-circle h-12 w-12 bg-[hsl(var(--accent-soft))] mb-3 mx-auto">
              <BookOpen className="h-5 w-5 text-[hsl(var(--accent))]" strokeWidth={1.75} />
            </div>
            <p className="font-semibold text-sm text-[hsl(var(--text-primary))] mb-1">No sections yet</p>
            <p className="text-xs text-[hsl(var(--text-secondary))] mb-4">
              Add sections to organize your lessons
            </p>
            <Button variant="accent" size="sm" onClick={() => setAddingSection(true)}>
              <Plus className="h-4 w-4" strokeWidth={2.5} />
              Add First Section
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {course.sections.map((section) => (
              <SectionAccordion key={section.id} section={section} courseId={id!} />
            ))}
          </div>
        )}
      </div>

      {user && (
        <CourseForm
          open={editOpen}
          onOpenChange={setEditOpen}
          userId={user.id}
          course={course}
          onSubmit={async (data) => {
            await updateCourse.mutateAsync({ id: course.id, data })
          }}
        />
      )}
    </div>
  )
}
