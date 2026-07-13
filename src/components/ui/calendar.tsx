import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameMonth, isSameDay, isToday,
  startOfWeek, endOfWeek,
} from "date-fns"
import { cn } from "@/lib/utils"

interface CalendarProps {
  selected?: Date
  onSelect?: (date: Date) => void
  disabled?: (date: Date) => boolean
  className?: string
}

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function Calendar({ selected, onSelect, disabled, className }: CalendarProps) {
  const [viewDate, setViewDate] = React.useState(selected ?? new Date())

  const monthStart  = startOfMonth(viewDate)
  const monthEnd    = endOfMonth(viewDate)
  const calStart    = startOfWeek(monthStart)
  const calEnd      = endOfWeek(monthEnd)
  const days        = eachDayOfInterval({ start: calStart, end: calEnd })

  return (
    <div className={cn("select-none", className)}>
      {/* Month navigation */}
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate(subMonths(viewDate, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--text-secondary))] hover:bg-[hsl(0_0%_93%)] hover:text-[hsl(var(--text-primary))] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={2} />
        </button>

        <p className="text-sm font-semibold text-[hsl(var(--text-primary))]">
          {format(viewDate, "MMMM yyyy")}
        </p>

        <button
          type="button"
          onClick={() => setViewDate(addMonths(viewDate, 1))}
          className="flex h-7 w-7 items-center justify-center rounded-full text-[hsl(var(--text-secondary))] hover:bg-[hsl(0_0%_93%)] hover:text-[hsl(var(--text-primary))] transition-colors"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={2} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="mb-1 grid grid-cols-7 gap-0">
        {WEEKDAYS.map((d) => (
          <div
            key={d}
            className="flex h-7 items-center justify-center text-[10px] font-semibold uppercase tracking-wide text-[hsl(var(--text-tertiary))]"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7 gap-0">
        {days.map((day) => {
          const isSelected   = selected ? isSameDay(day, selected) : false
          const isCurrentDay = isToday(day)
          const isOutside    = !isSameMonth(day, viewDate)
          const isDisabled   = disabled ? disabled(day) : false

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={isDisabled}
              onClick={() => !isDisabled && onSelect?.(day)}
              className={cn(
                "flex h-8 w-8 mx-auto items-center justify-center rounded-full text-xs font-medium transition-all duration-100",
                isOutside   && "text-[hsl(var(--text-tertiary))] opacity-40",
                isDisabled  && "pointer-events-none opacity-30",
                !isSelected && !isOutside && !isDisabled &&
                  "text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--accent-soft))] hover:text-[hsl(var(--accent))]",
                isCurrentDay && !isSelected &&
                  "border border-[hsl(var(--accent))] text-[hsl(var(--accent))]",
                isSelected &&
                  "bg-[hsl(var(--accent))] text-white shadow-sm hover:bg-[hsl(18_77%_53%)]"
              )}
            >
              {format(day, "d")}
            </button>
          )
        })}
      </div>
    </div>
  )
}
