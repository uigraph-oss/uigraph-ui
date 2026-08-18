import type { GT } from '@/api'
import { useMutation, useQuery } from '@apollo/client'
import { ONBOARDING_PROGRESS, SAVE_ONBOARDING_PROGRESS } from './api'

export type OnboardingProgress =
  GT.OnboardingProgressQuery['onboardingProgress']

type ProgressPatch = {
  step: GT.OnboardingStep
  teamId?: string | null
  runner?: GT.OnboardingRunner | null
  repoOwner?: string | null
  repoName?: string | null
  importId?: string | null
}

export function useOnboardingProgress(orgID: string) {
  const progressQuery = useQuery(ONBOARDING_PROGRESS, {
    variables: { orgID },
    fetchPolicy: 'network-only',
  })
  const [saveProgress, { loading: isSaving }] = useMutation(
    SAVE_ONBOARDING_PROGRESS
  )

  const progress = progressQuery.data?.onboardingProgress ?? null

  async function save(patch: ProgressPatch) {
    const input = {
      step: patch.step,
      teamId: patch.teamId === undefined ? progress?.teamId : patch.teamId,
      runner: patch.runner === undefined ? progress?.runner : patch.runner,
      repoOwner:
        patch.repoOwner === undefined ? progress?.repoOwner : patch.repoOwner,
      repoName:
        patch.repoName === undefined ? progress?.repoName : patch.repoName,
      importId:
        patch.importId === undefined ? progress?.importId : patch.importId,
    }
    await saveProgress({
      variables: { orgID, input },
      update: (cache, result) => {
        if (!result.data) return
        cache.writeQuery({
          query: ONBOARDING_PROGRESS,
          variables: { orgID },
          data: { onboardingProgress: result.data.saveOnboardingProgress },
        })
      },
    })
  }

  return {
    progress,
    isLoading: progressQuery.loading && !progressQuery.data,
    error: progressQuery.error,
    isSaving,
    save,
  }
}
