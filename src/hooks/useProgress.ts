import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { subDays, format, eachDayOfInterval } from 'date-fns'

export interface DailyProgress {
  date: string
  completed: number
}

export interface ProgressStats {
  totalCourses: number
  completedLessons: number
  streak: number
  weeklyData: DailyProgress[]
}

interface LessonData {
  is_completed: boolean
  completed_at: string | null
}

interface SectionData {
  lessons: LessonData[]
}

interface CourseData {
  sections: SectionData[]
}

export function useProgress(userId: string | undefined) {
  return useQuery({
    queryKey: ['progress', userId],
    enabled: !!userId,
    queryFn: async (): Promise<ProgressStats> => {
      const { data, error } = await supabase
        .from('courses')
        .select(`sections(lessons(is_completed, completed_at))`)
        .eq('user_id', userId!)

      if (error) throw error

      const courses = (data ?? []) as unknown as CourseData[]
      const allLessons = courses.flatMap((c) =>
        (c.sections ?? []).flatMap((s) => s.lessons ?? [])
      )

      const completedLessons = allLessons.filter((l) => l.is_completed)
      const totalCourses = courses.length

      // Calculate streak
      const completedDates = new Set(
        completedLessons
          .filter((l) => l.completed_at)
          .map((l) => format(new Date(l.completed_at!), 'yyyy-MM-dd'))
      )

      let streak = 0
      const today = new Date()
      for (let i = 0; i <= 365; i++) {
        const day = format(subDays(today, i), 'yyyy-MM-dd')
        if (completedDates.has(day)) {
          streak++
        } else if (i > 0) {
          break
        }
      }

      // Build last-14-days data
      const last14Days = eachDayOfInterval({
        start: subDays(today, 13),
        end: today,
      })

      const weeklyData: DailyProgress[] = last14Days.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd')
        const count = completedLessons.filter(
          (l) => l.completed_at && format(new Date(l.completed_at), 'yyyy-MM-dd') === dayStr
        ).length
        return { date: format(day, 'MMM d'), completed: count }
      })

      return {
        totalCourses,
        completedLessons: completedLessons.length,
        streak,
        weeklyData,
      }
    },
  })
}
