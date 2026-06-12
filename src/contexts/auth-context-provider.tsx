'use client'

import {
  bootstrapSession,
  signIn as storeSignIn,
  signOut as storeSignOut,
  useAuthStore,
  type AuthenticatedUser,
} from '@/store/auth-store'
import { TUserDetails } from '@/types'
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'

interface SignInResult {
  isSignedIn: boolean
  nextStep: { signInStep: string }
}

interface AuthContextType {
  user: TUserDetails | null
  setUser: (user: TUserDetails | null) => void

  continueWithGoogleV2: () => void

  isLoggedIn: boolean
  loading: boolean
  isAuthLoaded: boolean

  email: string
  password: string
  setEmail: (email: string) => void
  setPassword: (password: string) => void

  checkUserSession: () => Promise<void>
  setAuthEndpointsLoaded: (value: boolean) => void
  signIn: (email: string, password: string) => Promise<SignInResult>
  signUp: (name: string, email: string, password: string) => Promise<unknown>
  signout: () => Promise<void>
  confirmSignUp: (params: {
    username: string
    confirmationCode: string
  }) => Promise<unknown>
  signInWithGoogle: () => Promise<void>
  continueWithFakeGoogle: () => void
  forgetPassword: (email: string) => Promise<unknown>
  forgetPasswordSubmit: (params: {
    email: string
    code: string
    newPassword: string
  }) => Promise<void>
  confirmSignIn: (username: string, confirmationCode: string) => Promise<void>
  resendConfirmationCode: (username: string) => Promise<void>
}

export const LOCAL_STORAGE_KEY = 'user_data'
export const AuthContext = createContext<AuthContextType | undefined>(undefined)

function toUserDetails(user: AuthenticatedUser | null): TUserDetails | null {
  if (!user) return null

  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    sub: `account_${user.userId}`,
    loginProvider: user.authProvider,
  }
}

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const status = useAuthStore((state) => state.status)
  const storeUser = useAuthStore((state) => state.user)

  const user = toUserDetails(storeUser)
  const loading = status === 'loading'
  const isAuthLoaded = status !== 'loading'
  const isLoggedIn = status === 'authenticated'

  useEffect(() => {
    bootstrapSession().catch((error) => {
      console.error('Error bootstrapping session on mount:', error)
    })
  }, [])

  async function checkUserSession() {
    await bootstrapSession()
  }

  async function signInMethod(
    emailArg: string,
    passwordArg: string
  ): Promise<SignInResult> {
    await storeSignIn(emailArg, passwordArg)
    return { isSignedIn: true, nextStep: { signInStep: 'DONE' } }
  }

  async function signOutMethod() {
    await storeSignOut()
    window.location.href = '/sign-in'
  }

  function continueWithFakeGoogle() {
    storeSignIn('google@mock.dev', 'mock')
      .then(() => {
        window.location.href = '/dashboard'
      })
      .catch(console.error)
  }

  const contextValue: AuthContextType = {
    user,
    setUser: () => {},
    continueWithGoogleV2: continueWithFakeGoogle,

    isLoggedIn,
    loading,
    isAuthLoaded,

    email,
    password,
    setEmail,
    setPassword,

    checkUserSession,
    setAuthEndpointsLoaded: () => {},
    signIn: signInMethod,
    signUp: async () => ({}),
    signout: signOutMethod,
    confirmSignUp: async () => ({}),
    signInWithGoogle: async () => continueWithFakeGoogle(),
    continueWithFakeGoogle,
    forgetPassword: async () => ({}),
    forgetPasswordSubmit: async () => {},
    confirmSignIn: async () => {},
    resendConfirmationCode: async () => {},
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthContextProvider')
  }
  return context
}
