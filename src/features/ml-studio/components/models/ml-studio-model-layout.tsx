'use client'

import { GridScrollBody } from '@/components/grid-scroll-body'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardHeader } from '@/features/dashboard'
import { cn } from '@/lib/utils'
import { URLPatternPolyfill } from '@/utils/polyfill'
import { useMutation } from '@apollo/client'
import { ArrowLeftIcon, ChevronDownIcon } from 'lucide-react'
import { useMemo } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { CREATE_ML_VERSION_DEPLOYMENT_UPDATE } from '../../api/ml-studio'
import { useModelContext } from '../../contexts/model-context'
import { useProject } from '../../contexts/project-context'
import { deploymentTransitions } from '../../deployment-transitions'
import { StatusBadge } from '../status-badge'

const modelTabs = [
  { id: '', label: 'Overview' },
  { id: 'metrics', label: 'Metrics' },
  { id: 'artifacts', label: 'Artifacts' },
  { id: 'timeline', label: 'Timeline' },
] as const

const tabURLPattern = new URLPatternPolyfill({
  pathname: '/dashboard/ml-studio/projects/:projectId/models/:modelId{/:tab}?',
})

export function MlStudioModelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const {
    model,
    versions,
    latestVersionId,
    selectedVersionId,
    selectedVersion,
    setVersionId,
  } = useModelContext()
  const { orgId, project } = useProject()
  const [createVersionDeploymentUpdate] = useMutation(
    CREATE_ML_VERSION_DEPLOYMENT_UPDATE,
    {
      refetchQueries: [
        'MlStudioModelVersions',
        'MlVersionDeploymentUpdates',
        'MlStudioDeploymentUpdates',
      ],
      awaitRefetchQueries: true,
    }
  )
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
            to: `/dashboard/ml-studio/projects/${projectId}/models`,
            label: project?.name ?? 'Project',
          },
          {
            to: `/dashboard/ml-studio/projects/${projectId}/models/${model.id}`,
            label: model.name,
          },
        ]}
      />

      <div className="grid grid-rows-[auto_auto_1fr] rounded-t-[1.2rem] bg-[#141925]">
        <div className="flex items-center justify-between gap-4 pt-3 pr-3 pb-3 pl-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-[#F4F7FC]">
              {model.name}
            </h1>
            {selectedVersion && (
              <StatusBadge value={selectedVersion.deploymentStatus} />
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedVersion &&
              (() => {
                const transitions =
                  deploymentTransitions[selectedVersion.deploymentStatus]
                const primary = transitions[0]
                const rest = transitions.slice(1)
                return (
                  <div className="flex items-center">
                    <Button
                      preset="outline"
                      className={cn(
                        primary.accent,
                        rest.length > 0 && 'rounded-r-none border-r-0'
                      )}
                      onClick={() =>
                        void createVersionDeploymentUpdate({
                          variables: {
                            orgId: orgId!,
                            versionId: selectedVersion.id,
                            toStatus: primary.to,
                          },
                        })
                      }
                    >
                      <primary.icon />
                      {primary.label}
                    </Button>
                    {rest.length > 0 && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            preset="outline"
                            aria-label="More deployment actions"
                            className={cn(
                              primary.accent,
                              'rounded-l-none px-3'
                            )}
                          >
                            <ChevronDownIcon />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {rest.map((t) => (
                            <DropdownMenuItem
                              key={t.to}
                              className={t.accentItem}
                              onClick={() =>
                                void createVersionDeploymentUpdate({
                                  variables: {
                                    orgId: orgId!,
                                    versionId: selectedVersion.id,
                                    toStatus: t.to,
                                  },
                                })
                              }
                            >
                              <t.icon className={t.iconColor} />
                              {t.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                )
              })()}
            <Select
              value={selectedVersionId}
              onValueChange={(value) => void setVersionId(value)}
            >
              <SelectTrigger className="border-stock text-foreground/80 h-[2.7938125rem] w-40 rounded-[0.80315625rem] bg-transparent px-4">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {versions.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <span>{v.version}</span>
                    {v.id === latestVersionId && (
                      <Badge className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]">
                        Latest
                      </Badge>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              preset="outline"
              onClick={() =>
                navigate(`/dashboard/ml-studio/projects/${projectId}/models`)
              }
            >
              <ArrowLeftIcon />
              Go To Model Registry
            </Button>
          </div>
        </div>

        <div className="border-stock flex items-center overflow-x-auto border-b">
          {modelTabs.map((tab) => (
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
                  `/dashboard/ml-studio/projects/${projectId}/models/${model.id}${tab.id ? `/${tab.id}` : ''}`,
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
