'use client'

import { CircleLoader } from '@/components/loader/circle-loader'
import { UigraphMark } from '@/components/logo'
import { Input } from '@/components/ui/input'
import { Paths } from '@/constants'
import { useOAuthProviders } from '@/hooks/use-oauth-providers'
import { signIn, useAuthStore } from '@/store/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOff, Lock, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().max(20, 'Password must be at most 20 characters long'),
})

type SignInFormValues = z.infer<typeof signInSchema>

export function SignInForm() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const { oAuthProviders } = useOAuthProviders()

  const methods = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' },
  })

  useEffect(() => {
    if (status === 'authenticated' && user) {
      void navigate(Paths.dashboard.root)
      return
    }

    const query = new URLSearchParams(window.location.search)
    const redirect = query.get('redirect')
    const withToken = query.get('withToken')

    if (redirect) {
      localStorage.setItem('redirect', JSON.stringify({ redirect, withToken }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function onLogin(values: SignInFormValues) {
    try {
      setLoading(true)
      setError('')
      await signIn(values.email, values.password)

      void navigate(Paths.dashboard.root)
    } catch (e) {
      setError((e as Error).message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleForgotPassword() {
    const email = methods.watch('email')
    if (!email) {
      toast.error('Please type the email!')
      return
    }

    window.location.replace(
      `${location.host + Paths.auth.forgotPassword}?email=${encodeURIComponent(email)}`
    )
  }

  function handleSSO() {
    const provider = oAuthProviders[0]
    if (!provider) return
    trackGTag('login', { method: provider.name })
    window.location.href = provider.loginUrl
  }

  return (
    <div
      className="relative flex min-h-screen flex-col items-center justify-center px-6 py-12"
      style={{
        background: '#0B0E16',
        backgroundImage:
          'radial-gradient(rgba(59,107,255,0.10) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
        fontFamily: 'var(--font-jakarta, var(--font-poppins), sans-serif)',
      }}
    >
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: 400,
          background:
            'radial-gradient(ellipse at 50% 0%, rgba(59,107,255,0.12) 0%, transparent 70%)',
        }}
      />

      {/* Card */}
      <div
        className="relative z-10 w-full"
        style={{
          maxWidth: 420,
          background: '#141925',
          border: '1px solid #2A3242',
          borderRadius: 20,
          padding: '40px 40px 36px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px rgba(0,0,0,0.55)',
          animation: 'ug-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Logo + wordmark */}
        <div className="mb-8 flex items-center gap-2.5">
          <UigraphMark />
          <span
            style={{
              fontFamily:
                'var(--font-space-grotesk, var(--font-poppins), sans-serif)',
              fontSize: 17,
              fontWeight: 600,
              color: '#F4F7FC',
              letterSpacing: '-0.01em',
            }}
          >
            UIGraph
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{
            fontFamily:
              'var(--font-space-grotesk, var(--font-poppins), sans-serif)',
            fontSize: 26,
            fontWeight: 700,
            color: '#F4F7FC',
            letterSpacing: '-0.02em',
            lineHeight: 1.15,
            marginBottom: 6,
          }}
        >
          Welcome back
        </h1>
        <p style={{ fontSize: 14, color: '#828DA3', marginBottom: 28 }}>
          Sign in to your UIGraph workspace
        </p>

        <form onSubmit={methods.handleSubmit(onLogin)}>
          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor="email"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 500,
                color: '#D2D9E6',
                marginBottom: 6,
              }}
            >
              Email address
            </label>
            <div className="relative">
              <Mail
                size={15}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                style={{ color: '#586378' }}
              />
              <Controller
                name="email"
                control={methods.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="email"
                    type="email"
                    placeholder="you@company.com"
                    className="h-10 w-full rounded-[10px] border-[#2A3242] bg-[#0F131D] pl-[38px] text-sm text-[#F4F7FC] placeholder:text-[#586378] focus-visible:border-[#5C84FF] focus-visible:ring-[rgba(92,132,255,0.45)]"
                  />
                )}
              />
            </div>
            {methods.formState.errors.email && (
              <p className="mt-1 text-xs text-red-400">
                {methods.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div style={{ marginBottom: 22 }}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <label
                htmlFor="password"
                style={{ fontSize: 13, fontWeight: 500, color: '#D2D9E6' }}
              >
                Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                style={{
                  fontSize: 12,
                  color: '#5C84FF',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <Lock
                size={15}
                className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
                style={{ color: '#586378' }}
              />
              <Controller
                name="password"
                control={methods.control}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="h-10 w-full rounded-[10px] border-[#2A3242] bg-[#0F131D] pr-10 pl-[38px] text-sm text-[#F4F7FC] placeholder:text-[#586378] focus-visible:border-[#5C84FF] focus-visible:ring-[rgba(92,132,255,0.45)]"
                  />
                )}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-3 flex -translate-y-1/2 cursor-pointer items-center"
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#586378',
                  padding: 2,
                }}
              >
                {showPassword ? <EyeIcon size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
            {methods.formState.errors.password && (
              <p className="mt-1 text-xs text-red-400">
                {methods.formState.errors.password.message}
              </p>
            )}
          </div>

          {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

          {/* Sign in CTA */}
          <button
            type="submit"
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              padding: '12px 24px',
              background: '#3B6BFF',
              border: 'none',
              borderRadius: 10,
              color: '#fff',
              fontFamily:
                'var(--font-jakarta, var(--font-poppins), sans-serif)',
              fontSize: 15,
              fontWeight: 600,
              letterSpacing: '-0.01em',
              marginBottom: 28,
              animation: 'ug-glow-pulse 3s ease-in-out infinite',
              transition: 'background 0.15s, transform 0.1s',
            }}
          >
            {loading ? (
              <CircleLoader />
            ) : (
              <>
                Sign in
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </>
            )}
          </button>
        </form>

        {oAuthProviders.length > 0 && (
          <>
            {/* Divider */}
            <div className="mb-3.5 flex items-center gap-3">
              <div style={{ flex: 1, height: 1, background: '#2A3242' }} />
              <span
                style={{
                  fontSize: 11,
                  color: '#586378',
                  fontFamily: 'var(--font-jetbrains, monospace)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                or
              </span>
              <div style={{ flex: 1, height: 1, background: '#2A3242' }} />
            </div>

            {/* SSO button */}
            <button
              type="button"
              onClick={handleSSO}
              className="flex w-full cursor-pointer items-center justify-center gap-2 transition-colors hover:border-[#3B4658] hover:bg-[#1E2533] hover:text-[#F4F7FC]"
              style={{
                padding: '11px 16px',
                background: 'transparent',
                border: '1px solid #3B4658',
                borderRadius: 10,
                color: '#D2D9E6',
                fontFamily:
                  'var(--font-jakarta, var(--font-poppins), sans-serif)',
                fontSize: 14,
                fontWeight: 500,
                letterSpacing: '-0.01em',
              }}
            >
              <Lock size={15} style={{ color: '#828DA3' }} />
              Continue with SSO
            </button>
          </>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: 24, fontSize: 12, color: '#586378' }}>
        © 2026 UIGraph · Open Source ·{' '}
        {/* <a
          href="#"
          style={{
            color: '#586378',
            textDecoration: 'none',
            borderBottom: '1px solid #3B4658',
          }}
        >
          Privacy
        </a>
        {' · '}
        <a
          href="#"
          style={{
            color: '#586378',
            textDecoration: 'none',
            borderBottom: '1px solid #3B4658',
          }}
        >
          Terms
        </a> */}
      </p>
    </div>
  )
}
