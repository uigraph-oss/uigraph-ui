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
  CREATE_DIAGRAM_VERSION_MUTATION,
  GET_DIAGRAM_VERSIONS_QUERY,
  RESTORE_DIAGRAM_VERSION_MUTATION,
} from '../api'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { convertDiagramServerData } from '../helpers/diagram-data'
import { CompareDiagramVersionModalContent } from './compare-diagram-version-modal-content'

export function DiagramVersion() {
  const {
    diagramId,
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

  const versionsQuery = useQuery(GET_DIAGRAM_VERSIONS_QUERY, {
    variables: { diagramId: diagramId! },
    skip: !diagramId,
  })

  const [isCreatingVersion, setIsCreatingVersion] = useState(false)
  const [createVersion] = useMutation(CREATE_DIAGRAM_VERSION_MUTATION, {
    awaitRefetchQueries: true,
    refetchQueries: [GET_DIAGRAM_VERSIONS_QUERY],
  })

  const [restoreVersion, { loading: isRestoringVersion }] = useMutation(
    RESTORE_DIAGRAM_VERSION_MUTATION,
    {
      awaitRefetchQueries: true,
      refetchQueries: [GET_DIAGRAM_VERSIONS_QUERY],
    }
  )

  const versions = useMemo(() => {
    return arrayNonNullable(versionsQuery.data?.v1GetDiagramVersions).sort(
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
                variables: { diagramId: diagramId! },
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
                    (version) =>
                      version.versionId === tempDiagramState.versionId
                  )?.versionNumber

                  if (versionNumber == null) {
                    return toast.error('Version not found')
                  }

                  await restoreVersion({
                    variables: {
                      diagramId: diagramId!,
                      versionNumber: versionNumber,
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
        onValueChange={(value) => {
          if (value === 'current') {
            return setTempDiagramState(null)
          }

          const version = versions.find(
            (version) => version.versionId === value
          )

          if (version == null) {
            toast.error('Version not found')
            return setTempDiagramState(null)
          }

          setTempDiagramState({
            versionId: version.versionId!,
            ...convertDiagramServerData(version.diagram?.componentFlowDiagram),
          })
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
            <SelectItem
              key={option.versionId}
              value={option.versionId ?? 'none'}
            >
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
