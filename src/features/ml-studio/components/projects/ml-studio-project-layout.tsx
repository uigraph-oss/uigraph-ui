'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { useCurrentOrganization } from '@/store/auth-store'
import { URLPatternPolyfill } from '@/utils/polyfill'
import { useQuery } from '@apollo/client'
import { useMemo } from 'react'
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { ML_STUDIO_EXPERIMENT, ML_STUDIO_RUN } from '../../api/ml-studio'
import { ProjectProvider, useProject } from '../../contexts/project-context'

const modelsTab = { id: 'models', label: 'Models' } as const
const experimentsTab = { id: 'experiments', label: 'Experiments' } as const
const findingsTab = { id: 'findings', label: 'Findings' } as const

const tabURLPattern = new URLPatternPolyfill({
  pathname: '/dashboard/ml-studio/projects/:projectId/:tab{/*}?',
})

const runURLPattern = new URLPatternPolyfill({
  pathname:
    '/dashboard/ml-studio/projects/:projectId/experiments/:experimentId/runs/:runId',
})

export function MlStudioProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  return (
    <ProjectProvider projectId={projectId ?? ''}>
      <ProjectShell />
    </ProjectProvider>
  )
}

function ProjectShell() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { pathname } = useLocation()
  const { project } = useProject()
  const orgId = useCurrentOrganization()?.id

  const runMatch = useMemo(() => {
    return runURLPattern.exec({ pathname })?.pathname.groups
  }, [pathname])
  const isRunDetail = Boolean(runMatch?.runId)

  const experimentQuery = useQuery(ML_STUDIO_EXPERIMENT, {
    fetchPolicy: 'cache-first',
    skip: !orgId || !runMatch?.experimentId,
    variables: { orgId: orgId!, id: runMatch?.experimentId ?? '' },
  })
  const runQuery = useQuery(ML_STUDIO_RUN, {
    fetchPolicy: 'cache-first',
    skip: !orgId || !runMatch?.runId,
    variables: { orgId: orgId!, id: runMatch?.runId ?? '' },
  })

  const projectTabs = useMemo(() => {
    if (project?.type === 'model') {
      return [modelsTab, findingsTab]
    }
    if (project?.type === 'training') {
      return [experimentsTab, findingsTab]
    }
    return [modelsTab, experimentsTab, findingsTab]
  }, [project?.type])

  const activeTab = useMemo(() => {
    return tabURLPattern.exec({ pathname })?.pathname.groups.tab || 'models'
  }, [pathname])

  const crumbs = [
    { to: '/dashboard/ml-studio', label: 'ML Studio' },
    {
      to: `/dashboard/ml-studio/projects/${projectId}`,
      label: project?.name ?? 'Project',
    },
  ]
  if (isRunDetail) {
    crumbs.push({
      to: `/dashboard/ml-studio/projects/${projectId}/experiments/${runMatch!.experimentId}`,
      label: experimentQuery.data?.mlExperiment?.name ?? 'Experiment',
    })
    crumbs.push({
      to: pathname,
      label: runQuery.data?.mlRun?.name ?? 'Run',
    })
  }

  return (
    <div className="grid grid-rows-[auto_1fr] gap-[0.81rem] pt-3 pr-3">
      <DashboardHeader crumbs={crumbs} />

      <div
        className={cn(
          'grid rounded-t-[1.2rem] bg-[#141925]',
          isRunDetail ? 'grid-rows-[1fr]' : 'grid-rows-[auto_1fr]'
        )}
      >
        {isRunDetail ? null : (
          <div className="border-stock flex items-center overflow-x-auto border-b">
            {projectTabs.map((tab) => (
              <Button
                key={tab.id}
                variant="ghost"
                className={cn(
                  'h-11 rounded-none bg-transparent px-8 text-[#828DA3] hover:bg-transparent',
                  activeTab === tab.id &&
                    'text-[#F4F7FC] shadow-[inset_0_-2px_0_0_var(--color-primary)]'
                )}
                onClick={() =>
                  navigate(
                    `/dashboard/ml-studio/projects/${projectId}/${tab.id}`,
                    { replace: true }
                  )
                }
              >
                {tab.label}
              </Button>
            ))}
          </div>
        )}

        <GridScrollBody>
          <Outlet />
        </GridScrollBody>
      </div>
    </div>
  )
}

export function ProjectIndexRedirect() {
  const { projectId } = useParams<{ projectId: string }>()
  const { project, loading } = useProject()

  if (!project && loading) {
    return <div className="p-6 text-[#828DA3]">Loading…</div>
  }

  if (project?.type === 'training') {
    return (
      <Navigate
        to={`/dashboard/ml-studio/projects/${projectId}/experiments`}
        replace
      />
    )
  }
  if (project?.type === 'model') {
    return (
      <Navigate
        to={`/dashboard/ml-studio/projects/${projectId}/models`}
        replace
      />
    )
  }
  return (
    <Navigate
      to={`/dashboard/ml-studio/projects/${projectId}/models`}
      replace
    />
  )
}
