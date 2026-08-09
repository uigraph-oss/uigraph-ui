'use client'

import { CircleLoader } from '@/components/loader/circle-loader'
import { UigraphMark } from '@/components/logo'
import { Input } from '@/components/ui/input'
import { Paths } from '@/constants'
import {
  discoverOrgs,
  useOrgAuthProviders,
  type DiscoveredOrg,
} from '@/hooks/use-org-auth-providers'
import { cn } from '@/lib/utils'
import { signIn, useAuthStore } from '@/store/auth-store'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Building2, EyeIcon, EyeOff, Lock, Mail } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { z } from 'zod'

const emailSchema = z.object({
  email: z.string().email('Invalid email address'),
})

const passwordSchema = z.object({
  password: z.string().max(20, 'Password must be at most 20 characters long'),
})

type EmailFormValues = z.infer<typeof emailSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

type Step = 'email' | 'org' | 'provider'

const signInInputClassName =
  'override-autofill [--autofill-bg:#0F131D] h-10 w-full rounded-[10px] border-[#2A3242] bg-[#0F131D] text-sm text-[#F4F7FC] placeholder:text-[#586378] focus-visible:border-[#5C84FF] focus-visible:ring-[rgba(92,132,255,0.45)]'

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: '#D2D9E6',
  marginBottom: 6,
} as const

const primaryButtonStyle = {
  padding: '12px 24px',
  background: '#3B6BFF',
  border: 'none',
  borderRadius: 10,
  color: '#fff',
  fontFamily: 'var(--font-jakarta, var(--font-poppins), sans-serif)',
  fontSize: 15,
  fontWeight: 600,
  letterSpacing: '-0.01em',
  transition: 'background 0.15s, transform 0.1s',
} as const

const outlineButtonStyle = {
  padding: '11px 16px',
  background: 'transparent',
  border: '1px solid #3B4658',
  borderRadius: 10,
  color: '#D2D9E6',
  fontFamily: 'var(--font-jakarta, var(--font-poppins), sans-serif)',
  fontSize: 14,
  fontWeight: 500,
  letterSpacing: '-0.01em',
} as const

export function SignInForm() {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('email')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const [email, setEmail] = useState('')
  const [orgs, setOrgs] = useState<DiscoveredOrg[]>([])
  const [selectedOrg, setSelectedOrg] = useState<DiscoveredOrg | null>(null)

  const status = useAuthStore((state) => state.status)
  const user = useAuthStore((state) => state.user)
  const { providers, isLoading: providersLoading } = useOrgAuthProviders(
    selectedOrg?.id ?? null
  )

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '' },
  })

  useEffect(() => {
    if (status === 'authenticated' && user) {
      void navigate(Paths.dashboard.root)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  function selectOrg(org: DiscoveredOrg) {
    setSelectedOrg(org)
    setStep('provider')
  }

  async function onContinue(values: EmailFormValues) {
    try {
      setLoading(true)
      setError('')

      const found = await discoverOrgs(values.email)
      setEmail(values.email)
      setOrgs(found)

      if (found.length === 1) {
        selectOrg(found[0])
        return
      }

      setStep('org')
    } catch (e) {
      setError((e as Error).message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  async function onLogin(values: PasswordFormValues) {
    try {
      setLoading(true)
      setError('')
      await signIn(email, values.password)

      const next = new URLSearchParams(window.location.search).get('next')
      if (next) {
        window.location.href = next
        return
      }

      void navigate(Paths.dashboard.root)
    } catch (e) {
      setError((e as Error).message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function handleForgotPassword() {
    if (!email) {
      toast.error('Please type the email!')
      return
    }

    window.location.replace(
      `${location.host + Paths.auth.forgotPassword}?email=${encodeURIComponent(email)}`
    )
  }

  function handleSSO(loginUrl: string) {
    window.location.href = loginUrl
  }

  function back() {
    setError('')
    if (step === 'provider' && orgs.length > 1) {
      setSelectedOrg(null)
      setStep('org')
      return
    }
    setSelectedOrg(null)
    setStep('email')
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
          padding: '34px 34px 30px',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.04) inset, 0 24px 60px rgba(0,0,0,0.55)',
          animation: 'ug-fade-up 0.45s cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Logo + wordmark */}
        <div className="mb-6 flex items-center gap-2.5">
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

        {step !== 'email' && (
          <button
            type="button"
            onClick={back}
            className="mb-4 flex cursor-pointer items-center gap-1.5"
            style={{
              fontSize: 12,
              color: '#828DA3',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
          >
            <ArrowLeft size={13} />
            Back
          </button>
        )}

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
          {step === 'email' && 'Welcome back'}
          {step === 'org' && 'Choose a workspace'}
          {step === 'provider' && (selectedOrg?.name ?? 'Sign in')}
        </h1>
        <p style={{ fontSize: 14, color: '#828DA3', marginBottom: 22 }}>
          {step === 'email' && 'Sign in to your UIGraph workspace'}
          {step === 'org' && `Workspaces available for ${email}`}
          {step === 'provider' &&
            (providersLoading || providers.length > 0
              ? 'Choose how you want to sign in'
              : 'Enter your password to continue')}
        </p>

        {step === 'email' && (
          <form onSubmit={emailForm.handleSubmit(onContinue)}>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor="email" style={labelStyle}>
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
                  control={emailForm.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      autoComplete="email"
                      className={cn(signInInputClassName, 'pl-[38px]')}
                    />
                  )}
                />
              </div>
              {emailForm.formState.errors.email && (
                <p className="mt-1 text-xs text-red-400">
                  {emailForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
              style={{
                ...primaryButtonStyle,
                animation: 'ug-glow-pulse 3s ease-in-out infinite',
              }}
            >
              {loading ? (
                <CircleLoader />
              ) : (
                <>
                  Continue
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
        )}

        {step === 'org' && orgs.length === 0 && (
          <p style={{ fontSize: 13, color: '#828DA3' }}>
            No workspaces are associated with this email address. Ask an
            administrator to invite you, or add your email domain to the
            workspace.
          </p>
        )}

        {step === 'org' && orgs.length > 0 && (
          <div className="flex flex-col gap-2.5">
            {orgs.map((org) => (
              <button
                key={org.id}
                type="button"
                onClick={() => selectOrg(org)}
                className="flex w-full cursor-pointer items-center gap-2.5 transition-colors hover:border-[#3B4658] hover:bg-[#1E2533] hover:text-[#F4F7FC]"
                style={outlineButtonStyle}
              >
                {org.logoUrl ? (
                  <img
                    src={org.logoUrl}
                    alt=""
                    width={18}
                    height={18}
                    style={{ objectFit: 'contain', borderRadius: 4 }}
                  />
                ) : (
                  <Building2 size={16} style={{ color: '#828DA3' }} />
                )}
                {org.name}
              </button>
            ))}
          </div>
        )}

        {step === 'provider' && providersLoading && (
          <div className="flex justify-center py-6">
            <CircleLoader />
          </div>
        )}

        {step === 'provider' && !providersLoading && (
          <>
            {providers.length > 0 && (
              <div className="mb-6 flex flex-col gap-2.5">
                {providers.map((provider) => (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleSSO(provider.loginUrl)}
                    className="flex w-full cursor-pointer items-center justify-center gap-2 transition-colors hover:border-[#3B4658] hover:bg-[#1E2533] hover:text-[#F4F7FC]"
                    style={outlineButtonStyle}
                  >
                    {provider.iconUrl ? (
                      <img
                        src={provider.iconUrl}
                        alt=""
                        width={16}
                        height={16}
                        style={{ objectFit: 'contain' }}
                      />
                    ) : (
                      <Lock size={15} style={{ color: '#828DA3' }} />
                    )}
                    Continue with {provider.displayName}
                  </button>
                ))}
              </div>
            )}

            {providers.length > 0 && (
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
            )}

            <form onSubmit={passwordForm.handleSubmit(onLogin)}>
              <div style={{ marginBottom: 16 }}>
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
                    control={passwordForm.control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        className={cn(signInInputClassName, 'pr-10 pl-[38px]')}
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
                    {showPassword ? (
                      <EyeIcon size={16} />
                    ) : (
                      <EyeOff size={16} />
                    )}
                  </button>
                </div>
                {passwordForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-red-400">
                    {passwordForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full cursor-pointer items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60"
                style={primaryButtonStyle}
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
          </>
        )}
      </div>

      {/* Footer */}
      <p style={{ marginTop: 24, fontSize: 12, color: '#586378' }}>
        © 2026 UIGraph · Open Source ·{' '}
      </p>
    </div>
  )
}
