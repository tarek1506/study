import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from '@/hooks/useAuth'

export function Signup() {
  const navigate = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState('')
  const [success,  setSuccess]  = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { error: authError, data } = await signUp(email, password)
      if (authError) setError(authError.message)
      else if (data.session) navigate('/')
      else setSuccess(true)
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
          <h1 className="text-2xl font-bold text-[hsl(var(--text-primary))]">Start learning</h1>
          <p className="mt-1 text-xs text-[hsl(var(--text-secondary))]">Create your free StudyFlow account</p>
        </div>

        {/* Card */}
        <div className="rounded-[24px] border border-[hsl(var(--border-subtle))] bg-[hsl(var(--bg-elevated))] p-7 shadow-card">
          {success ? (
            <div className="text-center py-4">
              <div className="icon-circle h-12 w-12 bg-[hsl(var(--accent-soft))] mx-auto mb-3">
                <CheckCircle2 className="h-6 w-6 text-[hsl(var(--accent))]" strokeWidth={1.75} />
              </div>
              <h3 className="font-bold text-sm mb-1 text-[hsl(var(--text-primary))]">
                Check your email!
              </h3>
              <p className="text-xs text-[hsl(var(--text-secondary))]">
                We sent a confirmation link to <strong>{email}</strong>.
                Click it to activate your account.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-5 w-full"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[hsl(var(--text-primary))]">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-[hsl(var(--text-primary))]">Password</Label>
                <div className="relative">
                  <Input
                    id="signup-password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
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
                <p className="text-[11px] text-[hsl(var(--text-tertiary))]">
                  Must be at least 6 characters
                </p>
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 border border-red-100 px-4 py-3 text-xs text-red-600">
                  {error}
                </div>
              )}

              <Button id="signup-submit" type="submit" variant="accent" className="w-full" disabled={loading}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Create Account
              </Button>
            </form>
          )}

          {!success && (
            <p className="mt-5 text-center text-xs text-[hsl(var(--text-secondary))]">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[hsl(var(--accent))] hover:underline">
                Sign in
              </Link>
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-[11px] text-[hsl(var(--text-tertiary))]">
          StudyFlow · Track your learning journey
        </p>
      </div>
    </div>
  )
}
