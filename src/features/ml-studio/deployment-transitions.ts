import type { VersionStage } from './types'

export const deploymentTransitions: Record<
  VersionStage,
  { to: VersionStage; label: string }[]
> = {
  candidate: [{ to: 'staging', label: 'Move to Staging' }],
  staging: [
    { to: 'production', label: 'Mark as Deployed to Production' },
    { to: 'candidate', label: 'Roll Back to Candidate' },
  ],
  production: [
    { to: 'staging', label: 'Roll Back to Staging' },
    { to: 'retired', label: 'Retire' },
  ],
  retired: [{ to: 'staging', label: 'Reactivate to Staging' }],
}
