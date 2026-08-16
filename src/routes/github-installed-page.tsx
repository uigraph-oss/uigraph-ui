import { UiGraphLogo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Check } from 'lucide-react'
import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function GitHubInstalledPage() {
  useEffect(() => {
    const timer = window.setTimeout(() => window.close(), 1200)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center">
        <UiGraphLogo className="mb-8 size-16" />

        <span className="bg-success/10 text-success mb-5 flex size-12 items-center justify-center rounded-2xl">
          <Check className="size-6" />
        </span>

        <h1 className="text-foreground mb-2 text-xl font-semibold tracking-tight">
          GitHub connected
        </h1>

        <p className="text-paragraph mb-8 max-w-sm text-sm leading-relaxed text-balance">
          This tab closes on its own. Continue the onboarding in the UiGraph
          tab.
        </p>

        <Button asChild preset="outline">
          <Link to="/dashboard">Back to dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
