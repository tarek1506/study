import { useEffect, useState } from 'react'
import { ImagePlus, Loader2, Save, UploadCloud } from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { getDefaultDisplayName, useProfile, useUpdateProfile, uploadAvatar } from '@/hooks/useProfile'

interface ProfilePageProps { user: User }

export function ProfilePage({ user }: ProfilePageProps) {
  const { data: profile, isLoading } = useProfile(user)
  const updateProfile = useUpdateProfile(user)
  const [displayName, setDisplayName] = useState(getDefaultDisplayName(user))
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.display_name || getDefaultDisplayName(user))
    setAvatarUrl(profile.avatar_url)
  }, [profile, user])

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')
    setMessage('')

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file.')
      return
    }

    setUploading(true)
    try {
      const publicUrl = await uploadAvatar(user.id, file)
      setAvatarUrl(publicUrl)
      await updateProfile.mutateAsync({ displayName, avatarUrl: publicUrl })
      setMessage('Profile image updated.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload image.')
    } finally {
      setUploading(false)
      event.target.value = ''
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      await updateProfile.mutateAsync({ displayName, avatarUrl })
      setMessage('Profile saved.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <p className="text-[11px] font-medium uppercase tracking-widest text-[hsl(var(--text-tertiary))]">
          Account
        </p>
        <h1 className="mt-1 text-2xl font-bold text-[hsl(var(--text-primary))]">Profile</h1>
        <p className="mt-1 text-sm text-[hsl(var(--text-secondary))]">
          Choose the name and picture shown around StudyFlow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your public profile</CardTitle>
          <CardDescription>
            Your display name starts as the first part of your email until you change it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-sm text-[hsl(var(--text-secondary))]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading profile...
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <ProfileAvatar
                  profile={profile ? { ...profile, avatar_url: avatarUrl } : profile}
                  user={user}
                  size="xl"
                  className="ring-4 ring-[hsl(var(--bg-page))]"
                />

                <div className="flex-1 space-y-2">
                  <Label htmlFor="avatar-upload">Avatar image</Label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={uploading || updateProfile.isPending}
                    className="sr-only"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="group flex min-h-28 cursor-pointer items-center gap-4 rounded-[22px] border border-dashed border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-page))] p-4 transition-all duration-150 hover:border-[hsl(var(--accent))] hover:bg-[hsl(var(--accent-soft))]"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-[hsl(var(--accent))] shadow-sm transition-transform duration-150 group-hover:scale-105">
                      {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-[hsl(var(--text-primary))]">
                        {uploading ? 'Uploading image...' : 'Choose a new photo'}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5 text-xs text-[hsl(var(--text-secondary))]">
                        <ImagePlus className="h-3.5 w-3.5" /> JPG, PNG, or WebP
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="display-name">Display name</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  placeholder={getDefaultDisplayName(user)}
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={user.email ?? ''} disabled />
              </div>

              {error && (
                <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-600">
                  {error}
                </div>
              )}
              {message && (
                <div className="rounded-2xl border border-green-100 bg-green-50 px-4 py-3 text-xs text-green-700">
                  {message}
                </div>
              )}

              <Button type="submit" variant="accent" disabled={updateProfile.isPending || uploading}>
                {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Profile
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}