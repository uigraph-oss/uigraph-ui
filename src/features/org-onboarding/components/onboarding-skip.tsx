import { Button } from '@/components/ui/button'
import {
  refreshOrganizations,
  useCurrentOrganization,
} from '@/store/auth-store'
import { useMutation } from '@apollo/client'
import { Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { COMPLETE_ONBOARDING } from '../api/onboarding'
import { clearOnboardingProgress } from '../context/onboarding-context'

export function OnboardingSkip() {
  const navigate = useNavigate()
  const organization = useCurrentOrganization()
  const [completeOnboarding, { loading }] = useMutation(COMPLETE_ONBOARDING)

  if (!organization) return null

  async function handleSkip() {
    try {
      await completeOnboarding({ variables: { orgId: organization.id } })
      await refreshOrganizations()
      clearOnboardingProgress(organization.id)
      void navigate('/services')
    } catch (caught) {
      toast.error(
        caught instanceof Error ? caught.message : 'Could not skip the setup'
      )
    }
  }

  return (
    <Button
      preset="ghost"
      className="text-paragraph hover:text-foreground h-8 rounded-md px-3 text-xs has-[>svg]:px-3"
      disabled={loading}
      onClick={() => void handleSkip()}
    >
      {loading && <Loader2 className="size-3.5 animate-spin" />}
      Skip setup
    </Button>
  )
}
