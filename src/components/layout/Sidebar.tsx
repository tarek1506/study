import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, TrendingUp, LogOut,
  GraduationCap, ChevronLeft, ChevronRight, User,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { signOut, useAuth } from '@/hooks/useAuth'
import { ProfileAvatar } from '@/components/profile/ProfileAvatar'
import { getProfileDisplayName, useProfile } from '@/hooks/useProfile'

const NAV = [
  { to: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses',  icon: BookOpen,        label: 'Courses'   },
  { to: '/progress', icon: TrendingUp,      label: 'Progress'  },
]

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: profile } = useProfile(user)
  const displayName = getProfileDisplayName(profile, user)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'relative flex flex-col h-screen sticky top-0 z-30 select-none',
        'border-r border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))]',
        'transition-[width] duration-300 ease-in-out',
        collapsed ? 'w-[72px]' : 'w-[220px]'
      )}
    >
      {/* ── Collapse toggle ────────────────────────── */}
      <button
        onClick={() => setCollapsed(v => !v)}
        aria-label="Toggle sidebar"
        className={cn(
          'absolute -right-[13px] top-[54px] z-20',
          'flex h-6 w-6 items-center justify-center rounded-full',
          'border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))]',
          'text-[hsl(var(--text-tertiary))] shadow-card',
          'hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]',
          'transition-all duration-150'
        )}
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3" strokeWidth={2.5} />
          : <ChevronLeft  className="h-3 w-3" strokeWidth={2.5} />}
      </button>

      {/* ── Brand ──────────────────────────────────── */}
      <div className={cn(
        'flex shrink-0 items-center gap-3 overflow-hidden',
        collapsed ? 'justify-center px-0 py-5' : 'px-5 py-5'
      )}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--accent))]">
          <GraduationCap className="h-[18px] w-[18px] text-white" strokeWidth={2} />
        </div>

        <div
          className={cn(
            'overflow-hidden transition-all duration-300',
            collapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'
          )}
        >
          <p className="whitespace-nowrap text-sm font-bold leading-none text-[hsl(var(--text-primary))] tracking-tight">
            StudyFlow
          </p>
          <p className="mt-0.5 whitespace-nowrap text-[10px] font-medium uppercase tracking-widest text-[hsl(var(--text-tertiary))]">
            Learning Tracker
          </p>
        </div>
      </div>

      {/* ── Divider ────────────────────────────────── */}
      <div className="mx-3 h-px shrink-0 bg-[hsl(var(--border-subtle))]" />

      {/* ── Section label ──────────────────────────── */}
      <div
        className={cn(
          'overflow-hidden transition-all duration-300',
          collapsed ? 'h-0 opacity-0 mt-0' : 'h-auto opacity-100 mt-5'
        )}
      >
        <p className="mb-1 px-5 text-[10px] font-semibold uppercase tracking-widest text-[hsl(var(--text-tertiary))]">
          Menu
        </p>
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav className={cn(
        'flex flex-col gap-1 px-2',
        collapsed ? 'mt-4 items-center' : 'mt-1'
      )}>
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              cn(
                // base
                'relative group flex items-center gap-2.5 text-sm font-medium overflow-visible',
                'transition-all duration-150',
                // collapsed: bare wrapper — background lives on the icon circle only
                collapsed
                  ? 'w-10 h-10 justify-center rounded-full px-0 bg-transparent'
                  : [
                      'w-full px-3 py-2.5 rounded-xl',
                      isActive
                        ? 'bg-[hsl(var(--accent-soft))] text-[hsl(var(--accent))]'
                        : 'text-[hsl(var(--text-secondary))] hover:bg-[hsl(0_0%_95%)] hover:text-[hsl(var(--text-primary))]',
                    ].join(' ')
              )
            }
          >
            {({ isActive }) => (
              <>
                {/* Left accent pill — only visible when expanded + active */}
                {!collapsed && (
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-r-full bg-[hsl(var(--accent))]',
                      'transition-all duration-200',
                      isActive ? 'h-5 opacity-100' : 'h-0 opacity-0'
                    )}
                  />
                )}

                {/* Icon box */}
                <span
                  className={cn(
                    'flex shrink-0 items-center justify-center',
                    'transition-all duration-150',
                    collapsed ? 'h-9 w-9 rounded-full' : 'h-7 w-7 rounded-lg',
                    isActive
                      ? 'bg-[hsl(var(--accent))] text-white'
                      : collapsed
                        ? 'text-[hsl(var(--text-secondary))] group-hover:bg-[hsl(var(--accent-soft))] group-hover:text-[hsl(var(--accent))]'
                        : 'text-[hsl(var(--text-secondary))] group-hover:bg-[hsl(0_0%_90%)] group-hover:text-[hsl(var(--text-primary))]'
                  )}
                >
                  <Icon
                    className={collapsed ? 'h-[17px] w-[17px]' : 'h-[15px] w-[15px]'}
                    strokeWidth={isActive ? 2.25 : 1.75}
                  />
                </span>

                {/* Label — fades out when collapsed */}
                <span
                  className={cn(
                    'whitespace-nowrap leading-none font-medium',
                    'transition-all duration-300',
                    collapsed ? 'w-0 opacity-0 overflow-hidden' : 'opacity-100'
                  )}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Spacer ─────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Bottom divider ─────────────────────────── */}
      <div className="mx-3 h-px shrink-0 bg-[hsl(var(--border-subtle))]" />

      {/* ── User card ──────────────────────────────── */}
      <div className={cn('shrink-0 p-3', collapsed && 'flex justify-center')}>
        {!collapsed ? (
          <div className="rounded-[14px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-page))] p-3">
            {/* Avatar + name row */}
            <div className="flex items-center gap-2.5 mb-2.5">
              {/* Avatar circle */}
              <button
                onClick={() => navigate('/profile')}
                className="rounded-full transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2"
                title="Open profile"
              >
                <ProfileAvatar profile={profile} user={user} />
              </button>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold leading-none text-[hsl(var(--text-primary))]">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate text-[10px] leading-none text-[hsl(var(--text-tertiary))]">
                  {user?.email ?? ''}
                </p>
              </div>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5',
                'text-xs font-medium text-[hsl(var(--text-secondary))]',
                'hover:bg-red-50 hover:text-red-500 transition-colors duration-150'
              )}
            >
              <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
              Sign Out
            </button>
          </div>
        ) : (
          /* Collapsed: just avatar + sign out stacked */
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => navigate('/profile')}
              className="rounded-full transition-transform duration-150 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--accent))] focus:ring-offset-2"
              title="Open profile"
            >
              <ProfileAvatar profile={profile} user={user} size="md" />
            </button>
            <button
              onClick={handleSignOut}
              title="Sign Out"
              className="flex h-9 w-9 items-center justify-center rounded-full text-[hsl(var(--text-tertiary))] hover:bg-red-50 hover:text-red-500 transition-colors duration-150"
            >
              <LogOut className="h-[15px] w-[15px]" strokeWidth={1.75} />
            </button>
          </div>
        )}
      </div>

      <div className="h-2 shrink-0" />
    </aside>
  )
}
