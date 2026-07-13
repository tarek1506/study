import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { Plus, Search, Grid, List, BookOpen, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CourseCard } from '@/components/courses/CourseCard'
import { CourseForm } from '@/components/courses/CourseForm'
import { SortableCourseCard, CourseDragOverlay } from '@/components/courses/SortableCourseCard'
import { useCourses, useCreateCourse, useUpdateCourse, useDeleteCourse, useReorderCourses } from '@/hooks/useCourses'
import type { CourseWithProgress } from '@/types/database'
import type { User } from '@supabase/supabase-js'

interface CoursesProps { user: User }

const CATEGORIES = ['All', 'Programming', 'Design', 'Math', 'Science', 'Language', 'Business', 'Other']

export function Courses({ user }: CoursesProps) {
  const [open,            setOpen]           = useState(false)
  const [editingCourse,   setEditingCourse]  = useState<CourseWithProgress | null>(null)
  const [search,          setSearch]         = useState('')
  const [activeCategory,  setActiveCategory] = useState('All')
  const [view,            setView]           = useState<'grid' | 'list'>('grid')
  const [activeCard,      setActiveCard]     = useState<CourseWithProgress | null>(null)

  // Local ordered list so we can do optimistic reordering
  const [localOrder, setLocalOrder] = useState<string[] | null>(null)

  const { data: courses = [], isLoading } = useCourses(user.id)
  const createCourse  = useCreateCourse()
  const updateCourse  = useUpdateCourse()
  const deleteCourse  = useDeleteCourse()
  const reorderCourses = useReorderCourses(user.id)

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      setEditingCourse(null)
    }
  }

  const handleEdit = (course: CourseWithProgress) => {
    setEditingCourse(course)
    setOpen(true)
  }

  // Use local order if set (after drag), otherwise use server order
  const orderedCourses = localOrder
    ? localOrder.map(id => courses.find(c => c.id === id)).filter(Boolean) as CourseWithProgress[]
    : courses

  const filtered = orderedCourses.filter((c) => {
    const matchSearch   = c.title.toLowerCase().includes(search.toLowerCase())
    const matchCategory = activeCategory === 'All' || c.category === activeCategory
    return matchSearch && matchCategory
  })

  // Is the list filtered? If so, disable drag (order doesn't make sense when filtered)
  const isDragEnabled = !search && activeCategory === 'All'

  // DnD sensors — require 8px move or space/enter key before drag starts
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const found = courses.find(c => c.id === event.active.id)
    setActiveCard(found ?? null)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveCard(null)

    if (!over || active.id === over.id) return

    const ids = orderedCourses.map(c => c.id)
    const oldIndex = ids.indexOf(active.id as string)
    const newIndex = ids.indexOf(over.id  as string)

    if (oldIndex === -1 || newIndex === -1) return

    const newOrder = arrayMove(ids, oldIndex, newIndex)
    setLocalOrder(newOrder)
    reorderCourses.mutate(newOrder)
  }

  return (
    <div className="space-y-5 max-w-[1100px] mx-auto">

      {/* Header action */}
      <div className="flex items-center justify-between gap-3">
        {/* Drag hint — hidden on small screens */}
        {isDragEnabled && courses.length > 1 && (
          <p className="hidden md:flex items-center gap-1.5 text-[11px] text-[hsl(var(--text-tertiary))]">
            <GripVertical className="h-3.5 w-3.5" strokeWidth={2} />
            Drag cards to reorder
          </p>
        )}
        <div className="ml-auto">
          <Button variant="accent" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            <span className="hidden xs:inline">Add Course</span>
          </Button>
        </div>
      </div>

      {/* Filter + search bar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search pill */}
        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[hsl(var(--text-tertiary))]"
            strokeWidth={1.75}
          />
          <Input
            placeholder="Search courses…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* Category chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={
                activeCategory === cat
                  ? 'rounded-full px-3 py-1 text-xs font-semibold bg-[hsl(var(--accent))] text-white transition-all'
                  : 'rounded-full px-3 py-1 text-xs font-medium bg-[hsl(0_0%_93%)] text-[hsl(var(--text-secondary))] hover:bg-[hsl(0_0%_88%)] transition-all'
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] p-1 gap-0.5">
          {(['grid', 'list'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                view === v
                  ? 'bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent))]'
                  : 'text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))]'
              }`}
            >
              {v === 'grid'
                ? <Grid className="h-3.5 w-3.5" strokeWidth={1.75} />
                : <List className="h-3.5 w-3.5" strokeWidth={1.75} />}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid / list */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="h-48 rounded-[20px] bg-[hsl(0_0%_93%)] animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState search={search} onAdd={() => setOpen(true)} />
      ) : isDragEnabled ? (
        /* ── DnD sortable grid ─────────────────────────────── */
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filtered.map(c => c.id)}
            strategy={rectSortingStrategy}
          >
            <div className={
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-3'
            }>
              {filtered.map((course) => (
                <SortableCourseCard
                  key={course.id}
                  course={course}
                  onEdit={handleEdit}
                  onDelete={(id) => {
                    deleteCourse.mutate(id)
                    setLocalOrder(prev =>
                      prev ? prev.filter(i => i !== id) : null
                    )
                  }}
                />
              ))}
            </div>
          </SortableContext>

          {/* Floating drag ghost */}
          <DragOverlay dropAnimation={{
            duration: 200,
            easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
          }}>
            {activeCard ? <CourseDragOverlay course={activeCard} /> : null}
          </DragOverlay>
        </DndContext>
      ) : (
        /* ── Static list when search/filter active ─────────── */
        <div className={
          view === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
            : 'flex flex-col gap-3'
        }>
          {filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEdit}
              onDelete={(id) => deleteCourse.mutate(id)}
            />
          ))}
        </div>
      )}

      <CourseForm
        open={open}
        onOpenChange={handleOpenChange}
        userId={user.id}
        course={editingCourse || undefined}
        onSubmit={async (data) => {
          if (editingCourse) {
            await updateCourse.mutateAsync({ id: editingCourse.id, data })
          } else {
            await createCourse.mutateAsync(data)
          }
        }}
      />
    </div>
  )
}

function EmptyState({ search, onAdd }: { search: string; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center rounded-[20px] border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))]">
      <div className="icon-circle h-12 w-12 bg-[hsl(var(--accent-soft))] mb-3">
        <BookOpen className="h-5 w-5 text-[hsl(var(--accent))]" strokeWidth={1.75} />
      </div>
      <p className="font-semibold text-sm text-[hsl(var(--text-primary))] mb-1">
        {search ? 'No results found' : 'No courses yet'}
      </p>
      <p className="text-xs text-[hsl(var(--text-secondary))] mb-4">
        {search ? `Nothing matched "${search}"` : 'Add your first course to get started'}
      </p>
      {!search && (
        <Button variant="accent" size="sm" onClick={onAdd}>
          <Plus className="h-4 w-4" /> Add Course
        </Button>
      )}
    </div>
  )
}
