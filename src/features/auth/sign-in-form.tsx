'use client'

import { GET_MY_ACCOUNT, privateClient } from '@/api'
import googleIcon from '@/assets/icons/google-icon.svg'
import lockIcon from '@/assets/icons/lock.svg'
import backgroundImg from '@/assets/images/auth/background.png'
import signinImg from '@/assets/images/auth/signup.png'
import { CircleLoader } from '@/components/loader/circle-loader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Paths } from '@/constants'
import { useAuth } from '@/contexts'
import { trackGTag } from '@/helpers/track'
import { zodResolver } from '@hookform/resolvers/zod'
import { EyeIcon, EyeOff, Mail } from 'lucide-react'
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
  const [showPassword, setShowPassword] = useState<boolean>(false)

  const {
    checkUserSession,
    signIn,
    continueWithFakeGoogle,
    forgetPassword,
    resendConfirmationCode,
    setEmail,
    setPassword,
    isAuthLoaded,
    user,
  } = useAuth()

  const methods = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  useEffect(() => {
    if (!isAuthLoaded && !user) checkUserSession().catch(console.error)

    if (isAuthLoaded && user) {
      navigate(Paths.dashboard.root)
      return
    }
    const { search } = window.location
    const query = new URLSearchParams(search)

    const redirect = query.get('redirect')
    const withToken = query.get('withToken')

    if (redirect) {
      localStorage.setItem('redirect', JSON.stringify({ redirect, withToken }))
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthLoaded])

  async function onLogin(values: SignInFormValues) {
    try {
      setLoading(true)
      setError('')

      const { nextStep: signInNextStep } = await signIn(
        values.email,
        values.password
      )

      if (signInNextStep.signInStep === 'CONFIRM_SIGN_UP') {
        setLoading(false)
        await resendConfirmationCode(values.email)

        setEmail(values.email)
        setPassword(values.password)

        window.location.replace(
          `${location.host + Paths.auth.emailConfirm}?email=${encodeURIComponent(values.email)}`
        )
      } else {
        try {
          const { data } = await privateClient.query({
            query: GET_MY_ACCOUNT,
            fetchPolicy: 'no-cache',
          })

          const accountId = data?.GetMyAccount?.accountId

          trackGTag('login', {
            method: 'email',
            email_domain: values.email.split('@')[1],
          })

          if (accountId) {
            navigate(`${Paths.dashboard.root}?accountId=${accountId}`)
          } else {
            window.location.replace(location.host + Paths.auth.signup)
          }
        } catch {
          window.location.replace(location.host + Paths.auth.signup)
        }
        setLoading(false)
      }
    } catch (e) {
      setError((e as Error).message)
      setLoading(false)
      if ((e as Error).name === 'UserNotConfirmedException') {
        window.location.replace(
          `${location.host + Paths.auth.emailConfirm}?email=${encodeURIComponent(values.email)}`
        )
      } else {
        setError((e as Error).message || 'An error occurred. Please try again.')
      }
    }
  }
  async function handleForgotPassword() {
    try {
      toast.success('Please check your email for the reset password link.')
      setError('')
      const email = methods.watch('email')
      if (!email) {
        toast.error('Please type the email!')
      }
      await forgetPassword(email)

      trackGTag('forgot_password', {
        email_domain: email.split('@')[1],
      })

      window.location.replace(
        `${location.host + Paths.auth.forgotPassword}?email=${encodeURIComponent(email)}`
      )
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <div className="bg-project-background-white flex min-h-screen flex-col gap-[3rem] p-2 *:flex-1 lg:flex-row lg:pr-[3rem] xl:gap-[5.9375rem] xl:py-1.5 xl:pr-[5.9375rem] xl:pl-1.5">
      {/* Left Section - Promotional Content */}
      <div
        style={{
          backgroundImage: `url(${backgroundImg.src})`,
        }}
        className="relative flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-cover bg-no-repeat p-6 text-white *:flex-1 lg:p-[3.590625rem]"
      >
        <div className="flex flex-col items-center justify-center">
          <div className="z-10 max-w-md text-center xl:pt-[3.75rem]">
            <h1 className="text-[2rem] leading-[1.2] font-medium text-white xl:text-[2.62rem]">
              Start mapping today.
            </h1>
            <p className="mt-4 text-[1.125rem] leading-[1.4] text-white/80 xl:text-[1.25rem]">
              Turn your UI into a live map of APIs, logic, and data — all in one
              place.
            </p>

            {/* User avatars and trust indicator */}
            {/* <div className="flex flex-col items-center justify-center gap-2 pt-[2rem] sm:flex-row">
              <div className="flex -space-x-2">
                <div className="border-project-blue1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border bg-orange-400 text-xs font-bold">
                  <img src={trustedImg1.src} alt="trusted-img-1" />
                </div>
                <div className="border-project-blue1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border bg-[#D9D9D9] text-xs font-bold">
                  <img src={trustedImg2.src} alt="trusted-img-1" />
                </div>
                <div className="border-project-blue1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border bg-[#D9D9D9] text-xs font-bold">
                  <img src={trustedImg3.src} alt="trusted-img-1" />
                </div>
                <div className="border-project-blue1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border bg-[#D9D9D9] text-xs font-bold"></div>
                <div className="border-project-blue1 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border bg-[#D9D9D9] text-xs font-bold"></div>
              </div>
              <span className="ml-2 text-[22px] leading-[1.6] font-normal whitespace-nowrap text-white">
                Trusted by 25,000+ users!
              </span>
            </div> */}
          </div>
          {/* UI Preview Image */}

          <div className="flex justify-center pt-[0.25rem] xl:pt-[0.5rem]">
            <img
              src={signinImg.src}
              alt="UI Mapping Tool Preview"
              className="h-auto w-full rounded"
            />
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="flex flex-col justify-center">
        <div>
          <div className="mb-8 text-center">
            <h2 className="text-project-black1 mb-2 text-2xl leading-[1] font-medium">
              Welcome Back!
            </h2>
          </div>

          <form onSubmit={methods.handleSubmit(onLogin)}>
            <div className="space-y-[0.75rem]">
              <Label
                htmlFor="email"
                className="text-project-black1 text-lg leading-[1] font-normal"
              >
                Email address
              </Label>

              <div className="relative w-full">
                <div className="absolute top-1/2 left-6 -translate-y-1/2 transform text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <Controller
                  name="email"
                  control={methods.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder="example@gmail.com"
                      className="placeholder:text-project-gray1 h-[3rem] w-full rounded-[1rem] border-[0.0625rem] border-[#E5E7E9] pr-6 pl-14 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none md:h-[3.5rem]"
                    />
                  )}
                />
              </div>
              {methods.formState.errors.email && (
                <p className="mt-1 text-sm text-red-500">
                  {methods.formState.errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-[0.75rem] pt-[1.5rem]">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-project-black1 text-lg leading-[1] font-normal"
                >
                  Password
                </Label>
                <button
                  onClick={handleForgotPassword}
                  className="text-project-blue1 block cursor-pointer text-[1rem] duration-300 hover:text-blue-500"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative w-full">
                <div className="absolute top-1/2 left-6 -translate-y-1/2 transform text-gray-400">
                  <img src={lockIcon.src} alt="lock-icon" />
                </div>
                <Controller
                  name="password"
                  control={methods.control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className="placeholder:text-project-gray1 h-[3rem] w-full rounded-[1rem] border-[0.0625rem] border-[#E5E7E9] pr-6 pl-14 shadow-[#0000000A] focus:outline-none md:h-[3.5rem]"
                    />
                  )}
                />
                <div
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-6 -translate-y-1/2 transform cursor-pointer text-gray-400"
                >
                  {showPassword ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeOff className="h-5 w-5" />
                  )}
                </div>
              </div>
              {methods.formState.errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {methods.formState.errors.password.message}
                </p>
              )}
            </div>

            {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

            <Button
              disabled={loading}
              className="mt-[2rem] h-[3rem] w-full cursor-pointer rounded-[1.5rem] bg-blue-600 px-4 py-2 text-lg leading-[1] font-medium text-white hover:bg-blue-700 md:h-[3.5rem]"
            >
              {loading && <CircleLoader />}
              Login Now
            </Button>
          </form>

          <div className="pt-4 md:pt-[3.84375rem]">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full bg-[#E5E7E9]" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="text-project-gray1 bg-gray-50 px-2 text-lg font-medium">
                  OR
                </span>
              </div>
            </div>

            <div className="pt-4 md:pt-[2.34375rem]">
              <Button
                variant="outline"
                onClick={() => {
                  trackGTag('login', {
                    method: 'google',
                  })
                  continueWithFakeGoogle()
                }}
                className="border-project-gray2 flex h-[3rem] w-full cursor-pointer items-center justify-center gap-3 rounded-[1.5rem] border bg-white px-4 py-2 text-lg leading-[1] font-normal text-[#111110] hover:bg-gray-50 md:h-[3.5rem]"
              >
                <img src={googleIcon.src} alt="google-icon" />
                Continue with Google
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
