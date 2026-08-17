'use client'

import { DashboardPageSectionLayout } from '@/features/dashboard'
import { SETTINGS_TEAMS } from '@/features/dashboard-settings/api/teams'
import { usePermissions } from '@/hooks/use-permissions'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { Loader2 } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { ConnectGitHubStep } from './connect-github-step'
import {
  SelectRepositoryStep,
  type SelectedRepository,
} from './select-repository-step'
import { StepBody, StepFooter, StepHeader } from './step-layout'
import { SyncOptionStep } from './sync-option-step'

type Step = 'connect' | 'repository' | 'sync'

export function ImportWizardPage() {
  const organization = useCurrentOrganization()
  const { isAdmin } = usePermissions()

  if (!isAdmin) return <Navigate to="/services" replace />
  if (!organization) return null

  return (
    <DashboardPageSectionLayout
      title="Import from GitHub"
      description="Connect a repository so UIGraph can document it and keep it in sync."
      crumbs={[
        { to: '/services', label: 'Services' },
        { to: '/repositories/import', label: 'Import from GitHub' },
      ]}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col pb-8">
        <ImportWizard orgID={organization.id} />
      </div>
    </DashboardPageSectionLayout>
  )
}

function ImportWizard({ orgID }: { orgID: string }) {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('connect')
  const [teamID, setTeamID] = useState('')
  const [repository, setRepository] = useState<SelectedRepository | null>(null)

  const teamsQuery = useQuery(SETTINGS_TEAMS, { variables: { orgId: orgID } })

  const teams = arrayNonNullable(teamsQuery.data?.teams)
  const team = teams.find((item) => item.id === teamID) ?? teams[0]

  if (teamsQuery.loading && !teamsQuery.data) {
    return (
      <div className="text-paragraph flex items-center justify-center gap-2 py-16 text-sm">
        <Loader2 className="size-4 animate-spin" /> Loading teams
      </div>
    )
  }

  if (!team) {
    return (
      <>
        <StepHeader
          title="Create a team first"
          description="Every repository UIGraph imports is owned by one of your teams."
        />
        <StepBody>
          <p className="text-paragraph text-sm">
            You have no teams yet. Create one in settings, then come back to
            import a repository.
          </p>
        </StepBody>
        <StepFooter>
          <span />
          <Link
            to="/settings/teams"
            className="text-primary text-sm hover:underline"
          >
            Go to team settings
          </Link>
        </StepFooter>
      </>
    )
  }

  if (step === 'connect') {
    return (
      <ConnectGitHubStep orgID={orgID} onNext={() => setStep('repository')} />
    )
  }

  if (step === 'repository' || !repository) {
    return (
      <SelectRepositoryStep
        orgID={orgID}
        teamID={team.id}
        teamName={team.name}
        teams={teams}
        selected={repository}
        onBack={() => setStep('connect')}
        onSelectTeam={setTeamID}
        onSelect={setRepository}
        onNext={() => setStep('sync')}
      />
    )
  }

  return (
    <SyncOptionStep
      orgID={orgID}
      teamID={team.id}
      repository={repository}
      onBack={() => setStep('repository')}
      onStarted={(importID) => navigate(`/repositories/import/${importID}`)}
    />
  )
}
