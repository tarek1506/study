import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Flame, CheckCircle2, BookOpen, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useProgress } from '@/hooks/useProgress'
import { useCourses } from '@/hooks/useCourses'
import type { User } from '@supabase/supabase-js'

interface ProgressPageProps { user: User }

/* eslint-disable @typescript-eslint/no-explicit-any */
const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] px-3 py-2 shadow-card text-xs">
        <p className="font-semibold text-[hsl(var(--text-primary))] mb-0.5">{label}</p>
        <p className="text-[hsl(var(--accent))]">
          {payload[0].value} lesson{payload[0].value !== 1 ? 's' : ''}
        </p>
      </div>
    )
  }
  return null
}
/* eslint-enable */

export function ProgressPage({ user }: ProgressPageProps) {
  const { data: progress, isLoading } = useProgress(user.id)
  const { data: courses = [] }        = useCourses(user.id)

  const weeklyTotal = progress?.weeklyData.slice(-7).reduce((a, d) => a + d.completed, 0) ?? 0

  const stats = [
    { label: 'Day Streak',      value: progress?.streak          ?? 0, icon: Flame,       bg: 'bg-orange-50',                       color: 'text-orange-500' },
    { label: 'Total Completed', value: progress?.completedLessons ?? 0, icon: CheckCircle2, bg: 'bg-[hsl(var(--accent-soft))]',     color: 'text-[hsl(var(--accent))]' },
    { label: 'Courses',         value: progress?.totalCourses    ?? 0, icon: BookOpen,     bg: 'bg-blue-50',                         color: 'text-blue-500' },
    { label: 'This Week',       value: weeklyTotal,                     icon: TrendingUp,   bg: 'bg-green-50',                        color: 'text-green-500' },
  ]

  const tickStyle = { fill: 'hsl(0 0% 70%)', fontSize: 11, fontFamily: 'Manrope, sans-serif' }

  return (
    <div className="space-y-5 max-w-[900px] mx-auto">

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="flex flex-col gap-3 rounded-[20px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] p-5 shadow-card"
          >
            <div className={`icon-circle h-9 w-9 ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-2xl font-bold text-[hsl(var(--text-primary))] leading-none">{value}</p>
              <p className="mt-1 text-[11px] font-medium text-[hsl(var(--text-tertiary))]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 14-day area chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">14-Day Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-44 flex items-center justify-center">
              <p className="text-xs text-[hsl(var(--text-tertiary))]">Loading…</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={progress?.weeklyData ?? []} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <defs>
                  <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="hsl(18 77% 60%)" stopOpacity={0.18} />
                    <stop offset="95%" stopColor="hsl(18 77% 60%)" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 92%)" vertical={false} />
                <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'hsl(0 0% 90%)', strokeWidth: 1 }} />
                <Area
                  type="monotone"
                  dataKey="completed"
                  stroke="hsl(18 77% 60%)"
                  strokeWidth={2}
                  fill="url(#areaFill)"
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(18 77% 60%)', stroke: 'white', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly bar chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={progress?.weeklyData.slice(-7) ?? []} margin={{ top: 4, right: 4, bottom: 0, left: -24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 92%)" vertical={false} />
                <XAxis dataKey="date" tick={tickStyle} axisLine={false} tickLine={false} />
                <YAxis tick={tickStyle} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'hsl(0 0% 96%)' }} />
                <Bar
                  dataKey="completed"
                  radius={[4, 4, 0, 0]}
                  fill="hsl(0 0% 88%)"
                  /* Highlight bars with value > 0 */
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Per-course progress */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Course Completion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {courses.length === 0 ? (
              <p className="text-xs text-[hsl(var(--text-tertiary))] py-6 text-center">
                No courses yet.
              </p>
            ) : (
              courses.slice(0, 5).map((course) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-[hsl(var(--text-primary))] truncate max-w-[60%]">
                      {course.title}
                    </span>
                    <span className="text-xs font-bold text-[hsl(var(--accent))]">
                      {course.progress}%
                    </span>
                  </div>
                  <Progress value={course.progress} className="h-1.5" />
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
