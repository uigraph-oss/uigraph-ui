'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { URLPatternPolyfill } from '@/utils/polyfill'
import { ArrowLeftIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useExperimentContext } from '../../contexts/experiment-context'
import { useProject } from '../../contexts/project-context'
import { StatusBadge } from '../status-badge'

const experimentTabs = [
  { id: '', label: 'Overview' },
  { id: 'runs', label: 'Training Runs' },
  { id: 'datasets', label: 'Datasets' },
  { id: 'metrics', label: 'Metrics' },
] as const

const tabURLPattern = new URLPatternPolyfill({
  pathname:
    '/dashboard/ml-studio/projects/:projectId/experiments/:experimentId{/:tab}?',
})

export function MlStudioExperimentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { experiment } = useExperimentContext()
  const { project } = useProject()
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  const activeTab = useMemo(() => {
    return tabURLPattern.exec({ pathname })?.pathname.groups.tab || ''
  }, [pathname])

  return (
    <div className="grid grid-rows-[auto_1fr] gap-[0.81rem] pt-3 pr-3">
      <DashboardHeader
        crumbs={[
          { to: '/dashboard/ml-studio', label: 'ML Studio' },
          {
            to: `/dashboard/ml-studio/projects/${projectId}/experiments`,
            label: project?.name ?? 'Project',
          },
          {
            to: `/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}`,
            label: experiment.name,
          },
        ]}
      />

      <div className="grid grid-rows-[auto_auto_1fr] rounded-t-[1.2rem] bg-[#141925]">
        <div className="flex items-center justify-between gap-4 pt-3 pr-3 pb-3 pl-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[#F4F7FC]">
              {experiment.name}
            </h1>
            <StatusBadge value={experiment.status} />
          </div>

          <Button
            preset="outline"
            onClick={() =>
              navigate(`/dashboard/ml-studio/projects/${projectId}/experiments`)
            }
          >
            <ArrowLeftIcon />
            Go to All Experiments
          </Button>
        </div>

        <div className="border-stock flex items-center overflow-x-auto border-b">
          {experimentTabs.map((tab) => (
            <Button
              key={tab.id}
              variant="ghost"
              className={cn(
                'h-auto items-end rounded-none bg-transparent px-8 pt-0 pb-3 text-[#828DA3] hover:bg-transparent',
                activeTab === tab.id &&
                  'text-[#F4F7FC] shadow-[inset_0_-2px_0_0_var(--color-primary)]'
              )}
              onClick={() =>
                navigate(
                  `/dashboard/ml-studio/projects/${projectId}/experiments/${experiment.id}${tab.id ? `/${tab.id}` : ''}`,
                  { replace: true }
                )
              }
            >
              {tab.label}
            </Button>
          ))}
        </div>

        <GridScrollBody>{children}</GridScrollBody>
      </div>
    </div>
  )
}
