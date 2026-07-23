'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { URLPatternPolyfill } from '@/utils/polyfill'
import { useMemo } from 'react'
import {
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import {
  MlStudioDataProvider,
  useMlStudioData,
} from '../../contexts/ml-studio-data-context'

const projectTabs = [
  { id: 'models', label: 'Models' },
  { id: 'experiments', label: 'Experiments' },
  { id: 'deployments', label: 'Deployments' },
  { id: 'findings', label: 'Findings' },
] as const

const tabURLPattern = new URLPatternPolyfill({
  pathname: '/dashboard/ml-studio/projects/:projectId/:tab{/*}?',
})

export function MlStudioProjectLayout() {
  return (
    <MlStudioDataProvider>
      <ProjectShell />
    </MlStudioDataProvider>
  )
}

function ProjectShell() {
  const navigate = useNavigate()
  const { projectId } = useParams<{ projectId: string }>()
  const { pathname } = useLocation()
  const { projects } = useMlStudioData()

  const project = projects.find((p) => p.id === projectId)

  const activeTab = useMemo(() => {
    return tabURLPattern.exec({ pathname })?.pathname.groups.tab || 'models'
  }, [pathname])

  return (
    <div className="grid grid-rows-[auto_1fr] gap-[0.81rem] pt-3 pr-3">
      <DashboardHeader
        crumbs={[
          { to: '/dashboard/ml-studio', label: 'ML Studio' },
          {
            to: `/dashboard/ml-studio/projects/${projectId}`,
            label: project?.name ?? 'Project',
          },
        ]}
      />

      <div className="grid grid-rows-[auto_1fr] rounded-t-[1.2rem] bg-[#141925]">
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

        <GridScrollBody>
          <Outlet />
        </GridScrollBody>
      </div>
    </div>
  )
}

export function ProjectIndexRedirect() {
  const { projectId } = useParams<{ projectId: string }>()
  const { projects } = useMlStudioData()

  const project = projects.find((p) => p.id === projectId)

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
