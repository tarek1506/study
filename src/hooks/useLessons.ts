import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { SectionInsert, LessonInsert } from '@/types/database'
import { pushNotification } from '@/lib/notifications'

// ─── Sections ──────────────────────────────────────────────────────────────

export function useCreateSection(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: SectionInsert) => {
      const { data: section, error } = await supabase
        .from('sections')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return section
    },
    onSuccess: (section) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      if (section) {
        pushNotification(`Section "${section.title}" added`)
      }
    },
  })
}

export function useDeleteSection(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sections').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      pushNotification('Section deleted')
    },
  })
}

// ─── Lessons ───────────────────────────────────────────────────────────────

export function useCreateLesson(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (data: LessonInsert) => {
      const { data: lesson, error } = await supabase
        .from('lessons')
        .insert(data)
        .select()
        .single()
      if (error) throw error
      return lesson
    },
    onSuccess: (lesson) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      if (lesson) {
        pushNotification(`Lesson "${lesson.title}" added`)
      }
    },
  })
}

export function useToggleLesson(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, is_completed }: { id: string; is_completed: boolean }) => {
      const { data: lesson, error } = await supabase
        .from('lessons')
        .update({
          is_completed,
          completed_at: is_completed ? new Date().toISOString() : null,
        })
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return lesson
    },
    onSuccess: (lesson) => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      queryClient.invalidateQueries({ queryKey: ['progress'] })
      if (lesson) {
        pushNotification(
          lesson.is_completed
            ? `Lesson "${lesson.title}" completed`
            : `Lesson "${lesson.title}" marked incomplete`
        )
      }
    },
  })
}

export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('lessons').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
      queryClient.invalidateQueries({ queryKey: ['courses'] })
      pushNotification('Lesson deleted')
    },
  })
}
