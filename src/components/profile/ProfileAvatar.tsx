import { cn } from '@/lib/utils'
import type { User } from '@supabase/supabase-js'
import type { Profile } from '@/types/database'
import { getProfileInitial } from '@/hooks/useProfile'

interface ProfileAvatarProps {
  profile?: Profile | null
  user?: User | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-9 w-9 text-xs',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-24 w-24 text-3xl',
}

export function ProfileAvatar({ profile, user, size = 'sm', className }: ProfileAvatarProps) {
  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-[hsl(var(--accent-soft))]',
        SIZES[size],
        className
      )}
      title={profile?.display_name || user?.email || 'User'}
    >
      {profile?.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt={profile.display_name || 'Profile avatar'}
          className="h-full w-full object-cover"
        />
      ) : (
        <span className="font-bold text-[hsl(var(--accent))]">
          {getProfileInitial(profile, user)}
        </span>
      )}
    </div>
  )
}