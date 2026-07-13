import { useLocation, useNavigate } from 'react-router-dom'
import { Search, Bell } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { useProfile } from '@/hooks/useProfile'
import type { NotificationItem } from '@/lib/notifications'

const TITLES: Record<string, { title: string; sub: string }> = {
  '/':         { title: 'Dashboard',   sub: "Welcome back \u2014 here's your overview" },
  '/courses':  { title: 'My Courses',  sub: 'Manage and track all your courses'   },
  '/progress': { title: 'Progress',    sub: 'Visualise your learning over time'   },
  '/profile':  { title: 'Profile',     sub: 'Manage your name and avatar'         },
}

function matchTitle(pathname: string) {
  if (pathname.startsWith('/courses/')) return { title: 'Course Detail', sub: 'Sections, lessons & progress' }
  return TITLES[pathname] ?? { title: 'StudyFlow', sub: '' }
}

function formatRelativeTime(date: Date) {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  if (seconds < 10) return 'Just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: profile } = useProfile(user)
  const [search, setSearch] = useState('')
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notifOpen, setNotifOpen] = useState(false)
  const { title, sub } = matchTitle(pathname)

  useEffect(() => {
    const handleNotification = (e: Event) => {
      const item = (e as CustomEvent<NotificationItem>).detail
      setNotifications(prev => [item, ...prev])
    }
    window.addEventListener('studyflow-notification', handleNotification)
    return () => window.removeEventListener('studyflow-notification', handleNotification)
  }, [])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleOpenBell = () => {
    setNotifOpen(!notifOpen)
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }

  const handleClearAll = () => {
    setNotifications([])
    setNotifOpen(false)
  }

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] px-6">

      {/* Left — page title */}
      <div className="min-w-0">
        <h2 className="text-sm font-bold leading-none text-[hsl(var(--text-primary))] truncate">
          {title}
        </h2>
        {sub && (
          <p className="mt-0.5 text-[11px] text-[hsl(var(--text-tertiary))] truncate">{sub}</p>
        )}
      </div>

      {/* Right — search + actions */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search pill */}
        <div className="relative hidden sm:flex items-center">
          <Search
            className="absolute left-3.5 h-3.5 w-3.5 text-[hsl(var(--text-tertiary))]"
            strokeWidth={1.75}
          />
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="h-8 w-44 rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-page))] pl-8 pr-3 text-xs text-[hsl(var(--text-primary))] placeholder:text-[hsl(var(--text-tertiary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:w-56 transition-all duration-200"
          />
        </div>

        {/* Notification bell and dropdown */}
        <div className="relative">
          <button
            onClick={handleOpenBell}
            className="relative flex h-8 w-8 items-center justify-center rounded-full border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-page))] text-[hsl(var(--text-secondary))] hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] transition-all duration-150"
            title="Notifications"
          >
            <Bell className="h-3.5 w-3.5" strokeWidth={1.75} />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-2.5 w-2.5 rounded-full bg-[hsl(var(--accent))] ring-2 ring-white animate-pulse" />
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-10 z-50 w-72 rounded-2xl border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] shadow-card p-4 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setNotifOpen(false)}
            >
              <div className="flex items-center justify-between mb-3 border-b border-[hsl(var(--border-subtle))] pb-2">
                <span className="text-xs font-bold text-[hsl(var(--text-primary))]">Notifications</span>
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-[10px] font-semibold text-[hsl(var(--accent))] hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className="text-center py-6 text-xs text-[hsl(var(--text-tertiary))]">
                  No notifications yet.
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto scrollbar-thin divide-y divide-[hsl(var(--border-subtle))] pr-1">
                  {notifications.map((n) => (
                    <div key={n.id} className="py-2 flex flex-col gap-0.5 first:pt-0 last:pb-0">
                      <p className="text-xs text-[hsl(var(--text-primary))] font-medium leading-relaxed">
                        {n.message}
                      </p>
                      <p className="text-[9px] text-[hsl(var(--text-tertiary))]">
                        {formatRelativeTime(n.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          className="rounded-full transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2"
          title="Open profile"
        >
          <ProfileAvatar profile={profile} user={user} />
        </button>
      </div>
    </header>
  )
}
