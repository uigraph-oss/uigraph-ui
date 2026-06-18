import { clientV2 } from '@/api-v2/client'
import { ActorAvatar } from '@/components/actor-avatar'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SuperCircleLoader } from '@/components/loader'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { formatDistanceToNow } from 'date-fns'
import { useMemo, useState } from 'react'
import {
  LuArchiveRestore,
  LuArrowLeft,
  LuCloudUpload,
  LuColumns2,
} from 'react-icons/lu'
import { toast } from 'sonner'
import {
  CREATE_DIAGRAM_VERSION_V2,
  DIAGRAM_VERSION_CONTENT_V2,
  DIAGRAM_VERSIONS_V2,
  RESTORE_DIAGRAM_VERSION_V2,
} from '../api/versions-v2'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { convertDiagramServerData } from '../helpers/diagram-data'
import { CompareDiagramVersionModalContent } from './compare-diagram-version-modal-content'

export function DiagramVersion() {
  const {
    diagramId,
    organizationId,
    tempDiagramState,
    triggerMetaUpdate,
    setTempDiagramState,
    setLatestNodes,
    setLatestEdges,
    setLatestViewport,
    setLatestDataSources,
    setLatestFlowComponents,
  } = useFlowDiagramContext()

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false)
  const [showVersionCount, setShowVersionCount] = useState(5)

  const versionsQuery = useQuery(DIAGRAM_VERSIONS_V2, {
    client: clientV2,
    variables: { orgId: organizationId!, diagramId: diagramId! },
    skip: !diagramId || !organizationId,
  })

  const versionsRefetch = {
    client: clientV2,
    awaitRefetchQueries: true,
    refetchQueries: [
      {
        query: DIAGRAM_VERSIONS_V2,
        variables: { orgId: organizationId!, diagramId: diagramId! },
      },
    ],
  }

  const [isCreatingVersion, setIsCreatingVersion] = useState(false)
  const [createVersion] = useMutation(
    CREATE_DIAGRAM_VERSION_V2,
    versionsRefetch
  )

  const [restoreVersion, { loading: isRestoringVersion }] = useMutation(
    RESTORE_DIAGRAM_VERSION_V2,
    versionsRefetch
  )

  const versions = useMemo(() => {
    return arrayNonNullable(versionsQuery.data?.diagramVersions).sort(
      (a, b) => {
        return (
          new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
        )
      }
    )
  }, [versionsQuery.data])

  return (
    <div className="flex items-center gap-2">
      {tempDiagramState === null ? (
        <Button
          preset="outline"
          disabled={isCreatingVersion}
          onClick={async () => {
            try {
              setIsCreatingVersion(true)
              await triggerMetaUpdate(true)
              await createVersion({
                variables: {
                  orgId: organizationId!,
                  diagramId: diagramId!,
                },
              })

              toast.success('Version published successfully')
            } finally {
              setIsCreatingVersion(false)
            }
          }}
        >
          {isCreatingVersion ? <SuperCircleLoader /> : <LuCloudUpload />}
          Publish Version
        </Button>
      ) : (
        <>
          <Button preset="outline" onClick={() => setTempDiagramState(null)}>
            <LuArrowLeft />
            Back To Latest
          </Button>

          <Button preset="outline" onClick={() => setIsCompareModalOpen(true)}>
            <LuColumns2 />
            Compare Versions
          </Button>

          <Button
            preset="primary"
            onClick={async () => {
              try {
                if (tempDiagramState) {
                  const versionNumber = versions.find(
                    (version) => version.id === tempDiagramState.versionId
                  )?.versionNumber

                  if (versionNumber == null) {
                    return toast.error('Version not found')
                  }

                  await restoreVersion({
                    variables: {
                      orgId: organizationId!,
                      diagramId: diagramId!,
                      versionId: tempDiagramState.versionId,
                    },
                  })

                  toast.success(
                    `Version ${versionNumber} restored successfully`
                  )

                  setTempDiagramState(null)
                  setLatestNodes(tempDiagramState.nodes)
                  setLatestEdges(tempDiagramState.edges)
                  setLatestViewport(tempDiagramState.viewport)
                  setLatestDataSources(tempDiagramState.dataSources)
                  setLatestFlowComponents(tempDiagramState.components)
                } else {
                  toast.error('No version to restore')
                }
              } catch {
                toast.error('Failed to restore version')
              }
            }}
          >
            {isRestoringVersion ? <SuperCircleLoader /> : <LuArchiveRestore />}
            Restore Version
          </Button>
        </>
      )}

      <Select
        value={
          tempDiagramState === null ? 'current' : tempDiagramState.versionId
        }
        onValueChange={async (value) => {
          if (value === 'current') {
            return setTempDiagramState(null)
          }

          const version = versions.find((version) => version.id === value)

          if (version == null) {
            toast.error('Version not found')
            return setTempDiagramState(null)
          }

          try {
            const { data } = await clientV2.query({
              query: DIAGRAM_VERSION_CONTENT_V2,
              variables: {
                orgId: organizationId!,
                diagramId: diagramId!,
                versionId: version.id,
              },
            })

            setTempDiagramState({
              versionId: version.id,
              ...convertDiagramServerData(data?.diagramVersionContent?.content),
            })
          } catch {
            toast.error('Failed to load version')
            setTempDiagramState(null)
          }
        }}
      >
        <SelectTrigger
          className={cn(
            buttonVariants({ preset: 'outline' }),
            'w-32 justify-between'
          )}
        >
          <SelectValue placeholder="Select Version" />
        </SelectTrigger>

        <SelectContent align="end">
          <SelectItem value="current">Current</SelectItem>
          {versions.slice(0, showVersionCount).map((option) => (
            <SelectItem key={option.id} value={option.id ?? 'none'}>
              <ActorAvatar
                actor={option.createdByActor}
                className="size-4 border-0 shadow-none"
              />
              <span>Version {option.versionNumber}</span>

              {option.createdAt && (
                <span className="text-muted-foreground text-xs">
                  {formatDistanceToNow(option.createdAt, {
                    includeSeconds: true,
                    addSuffix: true,
                  })}
                </span>
              )}
            </SelectItem>
          ))}

          {versions.length > showVersionCount && (
            <Button
              type="button"
              preset="ghost"
              className="text-muted-foreground hover:text-foreground mt-1 h-8 w-full justify-center rounded-sm text-sm"
              onClick={() => setShowVersionCount((prev) => prev + 5)}
            >
              Show More
            </Button>
          )}
        </SelectContent>
      </Select>

      <BetterDialogProvider
        open={isCompareModalOpen}
        onOpenChange={setIsCompareModalOpen}
        className="h-[100%]! [--width:100%]"
      >
        <CompareDiagramVersionModalContent
          versions={versions}
          currentVersionId={tempDiagramState?.versionId ?? null}
        />
      </BetterDialogProvider>
    </div>
  )
}
