import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Loader2, CalendarIcon, Tag, Palette } from 'lucide-react'
import { format } from 'date-fns'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { CourseInsert, CourseWithProgress } from '@/types/database'

interface CourseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: CourseInsert) => Promise<void>
  userId: string
  course?: CourseWithProgress
}

const CATEGORIES = [
  { value: 'Programming', emoji: '💻' },
  { value: 'Design',      emoji: '🎨' },
  { value: 'Math',        emoji: '📐' },
  { value: 'Science',     emoji: '🔬' },
  { value: 'Language',    emoji: '🌐' },
  { value: 'Business',    emoji: '📈' },
  { value: 'Other',       emoji: '📚' },
]

const ACCENT_COLORS = [
  { hex: '#E8734A', label: 'Coral'   },
  { hex: '#1A1A1A', label: 'Onyx'    },
  { hex: '#5C6BC0', label: 'Indigo'  },
  { hex: '#26A69A', label: 'Teal'    },
  { hex: '#EC407A', label: 'Rose'    },
  { hex: '#8D6E63', label: 'Mocha'   },
  { hex: '#78909C', label: 'Steel'   },
]

interface FormData {
  title: string
  description: string
}

export function CourseForm({ open, onOpenChange, onSubmit, userId, course }: CourseFormProps) {
  const [loading,       setLoading]       = useState(false)
  const [selectedColor, setSelectedColor] = useState(ACCENT_COLORS[0].hex)
  const [category,      setCategory]      = useState(CATEGORIES[0].value)
  const [startDate,     setStartDate]     = useState<Date | undefined>(undefined)
  const [endDate,       setEndDate]       = useState<Date | undefined>(undefined)
  const [startCalOpen,  setStartCalOpen]  = useState(false)
  const [endCalOpen,    setEndCalOpen]    = useState(false)

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>()

  useEffect(() => {
    if (open) {
      if (course) {
        setValue('title', course.title)
        setValue('description', course.description || '')
        setSelectedColor(course.color)
        setCategory(course.category || CATEGORIES[0].value)
        setStartDate(course.start_date ? new Date(course.start_date) : undefined)
        setEndDate(course.end_date ? new Date(course.end_date) : undefined)
      } else {
        reset()
        setSelectedColor(ACCENT_COLORS[0].hex)
        setCategory(CATEGORIES[0].value)
        setStartDate(undefined)
        setEndDate(undefined)
      }
    }
  }, [open, course, setValue, reset])

  const handleClose = () => {
    reset()
    setCategory(CATEGORIES[0].value)
    setStartDate(undefined)
    setEndDate(undefined)
    setSelectedColor(ACCENT_COLORS[0].hex)
    onOpenChange(false)
  }

  const onFormSubmit = async (data: FormData) => {
    setLoading(true)
    try {
      await onSubmit({
        user_id:      userId,
        title:        data.title,
        description:  data.description || null,
        category,
        color:        selectedColor,
        thumbnail_url: null,
        start_date:   startDate ? format(startDate, 'yyyy-MM-dd') : null,
        end_date:     endDate ? format(endDate, 'yyyy-MM-dd') : null,
        position:     course ? course.position : 0,
      })
      handleClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden gap-0">

        {/* ── Header strip with accent color ──────── */}
        <div
          className="h-1.5 w-full transition-colors duration-300"
          style={{ backgroundColor: selectedColor }}
        />

        <div className="p-6">
          <DialogHeader className="mb-5">
            <DialogTitle className="text-base font-bold">
              {course ? 'Edit Course' : 'Add New Course'}
            </DialogTitle>
            <DialogDescription className="text-xs text-[hsl(var(--text-secondary))]">
              {course ? 'Update your course details below.' : 'Fill in the details to start tracking a new course.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-5">

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                Course Title <span className="text-[hsl(var(--accent))]">*</span>
              </Label>
              <Input
                placeholder="e.g. React for Beginners"
                {...register('title', { required: 'Title is required' })}
                className={errors.title ? 'ring-2 ring-red-400 border-transparent' : ''}
              />
              {errors.title && (
                <p className="text-[11px] text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[hsl(var(--text-primary))]">
                Description
                <span className="ml-1 text-[10px] font-normal text-[hsl(var(--text-tertiary))]">(optional)</span>
              </Label>
              <Textarea
                placeholder="What will you learn from this course?"
                rows={2}
                {...register('description')}
              />
            </div>

            {/* Category — Shadcn Select */}
            <div className="space-y-1.5">
              <Label className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--text-primary))]">
                <Tag className="h-3 w-3 text-[hsl(var(--text-tertiary))]" strokeWidth={1.75} />
                Category
              </Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="course-category">
                  <SelectValue placeholder="Pick one…" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <span className="flex items-center gap-2">
                        <span>{cat.emoji}</span>
                        <span>{cat.value}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Start Date + End Date — side by side */}
            <div className="grid grid-cols-2 gap-3">
              {/* Start Date */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--text-primary))]">
                  <CalendarIcon className="h-3 w-3 text-[hsl(var(--text-tertiary))]" strokeWidth={1.75} />
                  Start Date
                </Label>
                <Popover open={startCalOpen} onOpenChange={setStartCalOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      id="course-start-date"
                      className={cn(
                        'flex h-10 w-full items-center justify-between rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(0_0%_96%)] px-4 text-sm transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2',
                        startDate ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-tertiary))]'
                      )}
                    >
                      <span className="truncate">
                        {startDate ? format(startDate, 'MMM d, yyyy') : 'Pick a date'}
                      </span>
                      <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--text-tertiary))]" strokeWidth={1.75} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    <Calendar
                      selected={startDate}
                      onSelect={(d) => { setStartDate(d); setStartCalOpen(false) }}
                    />
                    {startDate && (
                      <button
                        type="button"
                        className="mt-2 w-full rounded-full py-1.5 text-xs font-medium text-[hsl(var(--text-secondary))] hover:bg-[hsl(0_0%_93%)] transition-colors"
                        onClick={() => { setStartDate(undefined); setStartCalOpen(false) }}
                      >
                        Clear date
                      </button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-1.5">
                <Label className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--text-primary))]">
                  <CalendarIcon className="h-3 w-3 text-[hsl(var(--text-tertiary))]" strokeWidth={1.75} />
                  End Date
                </Label>
                <Popover open={endCalOpen} onOpenChange={setEndCalOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      id="course-end-date"
                      className={cn(
                        'flex h-10 w-full items-center justify-between rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(0_0%_96%)] px-4 text-sm transition-colors',
                        'focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2',
                        endDate ? 'text-[hsl(var(--text-primary))]' : 'text-[hsl(var(--text-tertiary))]'
                      )}
                    >
                      <span className="truncate">
                        {endDate ? format(endDate, 'MMM d, yyyy') : 'Pick a date'}
                      </span>
                      <CalendarIcon className="h-3.5 w-3.5 shrink-0 text-[hsl(var(--text-tertiary))]" strokeWidth={1.75} />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-3" align="start">
                    <Calendar
                      selected={endDate}
                      onSelect={(d) => { setEndDate(d); setEndCalOpen(false) }}
                      disabled={(d) => startDate ? d < startDate : false}
                    />
                    {endDate && (
                      <button
                        type="button"
                        className="mt-2 w-full rounded-full py-1.5 text-xs font-medium text-[hsl(var(--text-secondary))] hover:bg-[hsl(0_0%_93%)] transition-colors"
                        onClick={() => { setEndDate(undefined); setEndCalOpen(false) }}
                      >
                        Clear date
                      </button>
                    )}
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Accent Color */}
            <div className="space-y-2">
              <Label className="flex items-center gap-1 text-xs font-semibold text-[hsl(var(--text-primary))]">
                <Palette className="h-3 w-3 text-[hsl(var(--text-tertiary))]" strokeWidth={1.75} />
                Accent Color
              </Label>
              <div className="flex items-center gap-2">
                {ACCENT_COLORS.map((col) => {
                  const active = selectedColor === col.hex
                  return (
                    <button
                      key={col.hex}
                      type="button"
                      title={col.label}
                      onClick={() => setSelectedColor(col.hex)}
                      className={cn(
                        'relative h-7 w-7 rounded-full transition-all duration-200',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[hsl(var(--accent))]',
                        active ? 'scale-125 ring-2 ring-white ring-offset-2' : 'hover:scale-110 opacity-70 hover:opacity-100'
                      )}
                      style={{
                        backgroundColor: col.hex,
                        boxShadow: active ? `0 0 0 2px white, 0 0 0 4px ${col.hex}` : undefined,
                      }}
                    >
                      {active && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="h-2 w-2 rounded-full bg-white/90" />
                        </span>
                      )}
                    </button>
                  )
                })}

                {/* Selected color preview chip */}
                <div
                  className="ml-auto flex items-center gap-1.5 rounded-full border border-[hsl(var(--border-subtle))] px-3 py-1"
                  style={{ borderColor: selectedColor + '44' }}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: selectedColor }}
                  />
                  <span className="text-[11px] font-medium text-[hsl(var(--text-secondary))]">
                    {ACCENT_COLORS.find(c => c.hex === selectedColor)?.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <DialogFooter className="pt-2 gap-2 sm:gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
                style={{ backgroundColor: selectedColor, borderColor: selectedColor }}
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {course ? 'Save Changes' : 'Create Course'}
              </Button>
            </DialogFooter>

          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
