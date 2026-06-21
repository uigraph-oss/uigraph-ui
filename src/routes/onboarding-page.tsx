import { UiGraphLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { signOut, useAuthStore } from '@/store/auth-store'
import { LogOut, Shield } from 'lucide-react'
import { Link } from 'react-router-dom'

export function OnboardingPage() {
  const isServerAdmin = useAuthStore((state) => state.user?.isServerAdmin)

  return (
    <div className="bg-muted/30 flex min-h-screen items-center justify-center px-6">
      <div className="bg-shading border-stock w-full max-w-md rounded-2xl border p-10 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <UiGraphLogo className="h-14 w-14" />
        </div>

        <h1 className="text-2xl font-semibold">Welcome to UIGraph</h1>
        <p className="text-paragraph mx-auto mt-3 max-w-sm text-sm leading-relaxed">
          You&apos;re not part of any organization yet. Onboarding isn&apos;t
          available in this build.
        </p>

        {isServerAdmin && (
          <Link
            to="/server"
            className="border-stock hover:bg-stock mt-8 flex items-center gap-3 rounded-xl border p-4 text-left transition-colors"
          >
            <span className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Shield className="size-5" />
            </span>
            <span className="flex flex-col">
              <span className="font-medium">Manage Server</span>
              <span className="text-paragraph text-xs">
                Configure users, SSO, and more
              </span>
            </span>
          </Link>
        )}

        <Button
          preset="destructive"
          onClick={async () => {
            await signOut()
            window.location.href = '/sign-in'
          }}
          className="mt-8 w-full"
        >
          <LogOut />
          Logout
        </Button>
      </div>
    </div>
  )
}
