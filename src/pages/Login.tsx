import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/hooks/useAuth'

export function Login() {
  const navigate = useNavigate()
  const [email,   setEmail]   = useState('')
  const [password, setPassword] = useState('')
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { error: authError } = await signIn(email, password)
      if (authError) setError(authError.message)
      else navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--bg-page))] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo + heading */}
        <div className="text-center mb-8">
          <div className="icon-circle h-14 w-14 bg-[hsl(var(--accent))] mx-auto mb-4 shadow-sm">
            <GraduationCap className="h-7 w-7 text-white" strokeWidth={1.75} />
          </div>
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Welcome back</h1>
          <p className="mt-1 text-xs text-[hsl(var(--text-secondary))]">Sign in to continue learning</p>
        </div>

        {/* Card */}
        <div className="rounded-[24px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] p-7 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[hsl(var(--text-primary))]">Email</Label>
              <Input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-[hsl(var(--text-primary))]">Password</Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[hsl(var(--text-tertiary))] hover:text-[hsl(var(--text-primary))] transition-colors"
                  onClick={() => setShowPw(!showPw)}
                >
                  {showPw
                    ? <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                    : <Eye    className="h-4 w-4" strokeWidth={1.75} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600">
                {error}
              </div>
            )}

            <Button id="login-submit" type="submit" variant="accent" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>

          <p className="mt-5 text-center text-xs text-[hsl(var(--text-secondary))]">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-[hsl(var(--accent))] hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="mt-6 text-center text-[11px] text-[hsl(var(--text-tertiary))]">
          StudyFlow · Track your learning journey
        </p>
      </div>
    </div>
  )
}
