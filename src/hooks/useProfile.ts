import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import type { Profile } from '@/types/database'

export function getDefaultDisplayName(user: User | null | undefined) {
  return user?.email?.split('@')[0] || 'User'
}

export function getProfileDisplayName(profile: Profile | null | undefined, user: User | null | undefined) {
  return profile?.display_name?.trim() || getDefaultDisplayName(user)
}

export function getProfileInitial(profile: Profile | null | undefined, user: User | null | undefined) {
  return getProfileDisplayName(profile, user)[0]?.toUpperCase() || 'U'
}

async function ensureProfile(user: User) {
  const fallbackName = getDefaultDisplayName(user)

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (error) throw error
  if (data) return data as Profile

  const { data: created, error: createError } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email ?? '',
      display_name: fallbackName,
    })
    .select('*')
    .single()

  if (createError) throw createError
  return created as Profile
}

export function useProfile(user: User | null | undefined) {
  return useQuery({
    queryKey: ['profile', user?.id],
    enabled: !!user,
    queryFn: () => ensureProfile(user!),
  })
}

export function useUpdateProfile(user: User) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ displayName, avatarUrl }: { displayName: string; avatarUrl?: string | null }) => {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          email: user.email ?? '',
          display_name: displayName.trim() || getDefaultDisplayName(user),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .select('*')
        .single()

      if (error) throw error
      return data as Profile
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(['profile', user.id], profile)
      queryClient.invalidateQueries({ queryKey: ['profile', user.id] })
    },
  })
}

export async function uploadAvatar(userId: string, file: File) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/avatar-${Date.now()}.${extension}`

  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true })

  if (error) throw error

  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  return data.publicUrl
}