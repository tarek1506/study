import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Course, CourseInsert, CourseUpdate, CourseWithProgress, Lesson, SectionWithLessons } from '@/types/database'
import { getProgress } from '@/lib/utils'
import { pushNotification } from '@/lib/notifications'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enrichCourse(raw: any, index: number): CourseWithProgress {
  const sections: SectionWithLessons[] = ((raw.sections ?? []) as Array<{
    id: string; course_id: string; title: string; position: number; created_at: string
    lessons: Lesson[]
  }>).map((s) => ({
    ...s,
    lessons: [...(s.lessons ?? [])].sort((a, b) => a.position - b.position),
  })).sort((a, b) => a.position - b.position)

  const allLessons = sections.flatMap((s) => s.lessons)
  const totalLessons = allLessons.length
  const completedLessons = allLessons.filter((l) => l.is_completed).length

  return {
    ...(raw as Course),
    position: raw.position ?? index,
    sections,
    totalLessons,
    completedLessons,
    progress: getProgress(completedLessons, totalLessons),
    displayIndex: index,
  }
}

export function useCourses(userId: string | undefined) {
  return useQuery({
    queryKey: ['courses', userId],
    enabled: !!userId,
    queryFn: async (): Promise<CourseWithProgress[]> => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, sections(*, lessons(*))')
        .eq('user_id', userId!)
        .order('position', { ascending: true })
        .order('created_at', { ascending: false })

      if (error) throw error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return ((data ?? []) as any[]).map((row, i) => enrichCourse(row, i))
    },
  })
}

export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course', courseId],
    enabled: !!courseId,
    queryFn: async (): Promise<CourseWithProgress> => {
      const { data, error } = await supabase
        .from('courses')
        .select('*, sections(*, lessons(*))')
        .eq('id', courseId!)
        .single()

      if (error) throw error
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return enrichCourse(data as any, 0)
    },
  })
}

export function useCreateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: CourseInsert) => {
      const { data: course, error } = await supabase
        .from('courses')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return course
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      if (course) {
        pushNotification(`Course "${course.title}" added`)
      }
    },
  })
}

export function useUpdateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: CourseUpdate }) => {
      const { data: course, error } = await supabase
        .from('courses')
        .update(data)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return course
    },
    onSuccess: (course) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      if (course) {
        pushNotification(`Course "${course.title}" updated`)
      }
    },
  })
}

export function useDeleteCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('courses').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      pushNotification('Course deleted')
    },
  })
}

/** Optimistically reorder courses and persist positions to Supabase */
export function useReorderCourses(userId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (orderedIds: string[]) => {
      // Batch update each course's position
      await Promise.all(
        orderedIds.map((id, index) =>
          supabase.from('courses').update({ position: index }).eq('id', id)
        )
      )
    },
    // Optimistic update — immediately reorder in cache without waiting for server
    onMutate: async (orderedIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: ['courses', userId] })
      const prev = queryClient.getQueryData<CourseWithProgress[]>(['courses', userId])

      queryClient.setQueryData<CourseWithProgress[]>(['courses', userId], (old) => {
        if (!old) return old
        const map = new Map(old.map((c) => [c.id, c]))
        return orderedIds
          .map((id, i) => {
            const c = map.get(id)
            return c ? { ...c, position: i, displayIndex: i } : null
          })
          .filter(Boolean) as CourseWithProgress[]
      })

      return { prev }
    },
    onError: (_err, _ids, ctx) => {
      if (ctx?.prev) {
        queryClient.setQueryData(['courses', userId], ctx.prev)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['courses', userId] })
    },
  })
}
