import { format } from 'date-fns'
import { BookOpen, CheckCircle2, Flame, TrendingUp, Plus, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { StatCard } from '@/components/dashboard/StatCard'
import { CourseCard } from '@/components/courses/CourseCard'
import { ProgressRing } from '@/components/courses/ProgressRing'
import { Button } from '@/components/ui/button'
import { useCourses } from '@/hooks/useCourses'
import { useProgress } from '@/hooks/useProgress'
import { getProfileDisplayName, useProfile } from '@/hooks/useProfile'
import type { User } from '@supabase/supabase-js'

interface DashboardProps { user: User }

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

export function Dashboard({ user }: DashboardProps) {
  const navigate = useNavigate()
  const { data: courses = [], isLoading } = useCourses(user.id)
  const { data: progress } = useProgress(user.id)
  const { data: profile } = useProfile(user)
  const displayName = getProfileDisplayName(profile, user)

  const activeCourses   = courses.filter((c) => c.progress < 100)
  const completedCount  = courses.filter((c) => c.progress === 100).length
  const topCourse       = activeCourses[0]
  const recentCourses   = activeCourses.slice(0, 4)
  const weeklyLessons   = progress?.weeklyData.slice(-7).reduce((a, d) => a + d.completed, 0) ?? 0

  return (
    <div className="space-y-6 max-w-[1100px] mx-auto">

      {/* ── Greeting banner ──────────────────────── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[20px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] px-6 py-4 shadow-card">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-[hsl(var(--text-tertiary))]">
            {format(new Date(), 'EEEE, MMMM d')}
          </p>
          <h1 className="mt-0.5 text-xl font-bold leading-tight text-[hsl(var(--text-primary))]">
            {getGreeting()},{' '}
            <span className="text-[hsl(var(--accent))]">
              {displayName} 👋
            </span>
          </h1>
        </div>
        <Button variant="accent" onClick={() => navigate('/courses')}>
          <Plus className="h-4 w-4" strokeWidth={2.5} />
          New Course
        </Button>
      </div>

      {/* ── Bento grid ──────────────────────────── */}
      <div className="grid grid-cols-12 gap-4 auto-rows-auto">

        {/* Stat: Active Courses */}
        <div className="col-span-6 sm:col-span-3">
          <StatCard
            title="Active Courses"
            value={activeCourses.length}
            description={`${completedCount} completed`}
            icon={BookOpen}
            iconBg="bg-blue-50"
            iconColor="text-blue-500"
          />
        </div>

        {/* Stat: Lessons Done */}
        <div className="col-span-6 sm:col-span-3">
          <StatCard
            title="Lessons Done"
            value={progress?.completedLessons ?? 0}
            icon={CheckCircle2}
            trend={weeklyLessons > 0 ? `+${weeklyLessons} this week` : undefined}
            iconBg="bg-[hsl(var(--accent-soft))]"
            iconColor="text-[hsl(var(--accent))]"
          />
        </div>

        {/* Stat: Streak — accent filled */}
        <div className="col-span-6 sm:col-span-3">
          <StatCard
            title="Day Streak 🔥"
            value={progress?.streak ?? 0}
            description="consecutive days"
            icon={Flame}
            accent
          />
        </div>

        {/* Stat: This Week */}
        <div className="col-span-6 sm:col-span-3">
          <StatCard
            title="This Week"
            value={weeklyLessons}
            description="lessons completed"
            icon={TrendingUp}
            iconBg="bg-green-50"
            iconColor="text-green-500"
          />
        </div>

        {/* Featured top course — wide card with progress ring */}
        {topCourse && (
          <div
            className="col-span-12 md:col-span-5 rounded-[20px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] p-6 shadow-card flex flex-col justify-between gap-4 cursor-pointer hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
            onClick={() => navigate(`/courses/${topCourse.id}`)}
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-[hsl(var(--text-tertiary))] mb-3">
                Top Active Course
              </p>
              <h2 className="text-lg font-bold text-[hsl(var(--text-primary))] leading-snug">
                {topCourse.title}
              </h2>
              {topCourse.description && (
                <p className="mt-1 text-xs text-[hsl(var(--text-secondary))] line-clamp-2">
                  {topCourse.description}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-[hsl(var(--text-secondary))]">
                <p><span className="font-semibold text-[hsl(var(--text-primary))]">{topCourse.completedLessons}</span> / {topCourse.totalLessons} lessons</p>
              </div>
              <ProgressRing progress={topCourse.progress} size={80} strokeWidth={7} label="done" />
            </div>

            <Button variant="accent-soft" size="sm" className="self-start">
              Continue <ArrowRight className="h-3.5 w-3.5" strokeWidth={2} />
            </Button>
          </div>
        )}

        {/* Course cards grid */}
        <div className="col-span-12 md:col-span-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[hsl(var(--text-primary))]">
              Active Courses
            </h2>
            <button
              className="text-xs font-semibold text-[hsl(var(--accent))] hover:underline flex items-center gap-0.5"
              onClick={() => navigate('/courses')}
            >
              View all <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div key={i} className="h-40 rounded-[20px] bg-[hsl(0_0%_93%)] animate-pulse" />
              ))}
            </div>
          ) : recentCourses.length === 0 ? (
            <EmptyState onAdd={() => navigate('/courses')} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {recentCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 text-center rounded-[20px] border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))]">
      <div className="icon-circle h-12 w-12 bg-[hsl(var(--accent-soft))] mb-4">
        <BookOpen className="h-5 w-5 text-[hsl(var(--accent))]" strokeWidth={1.75} />
      </div>
      <h3 className="font-semibold text-sm mb-1 text-[hsl(var(--text-primary))]">No courses yet</h3>
      <p className="text-xs text-[hsl(var(--text-secondary))] mb-5 max-w-xs">
        Add your first course to start tracking your learning journey.
      </p>
      <Button variant="accent" size="sm" onClick={onAdd}>
        <Plus className="h-4 w-4" strokeWidth={2.5} />
        Add Your First Course
      </Button>
    </div>
  )
}
