import { clientV2 } from '@/api/client'
import { useAutoRef } from '@/hooks/use-auto-ref'
import { useMutation } from '@apollo/client'
import { Edge, Node } from '@xyflow/react'
import axios from 'axios'
import { useEffectExceptOnMount, useEffectState } from 'daily-code/react'
import ms from 'ms'
import { useCallback, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { UPDATE_DIAGRAM } from '../api/diagram'
import {
  CONFIRM_DIAGRAM_THUMBNAIL_UPLOAD,
  PREPARE_DIAGRAM_THUMBNAIL_UPLOAD,
} from '../api/thumbnail'
import { convertDiagramServerDataToString } from '../helpers/diagram-data'
import { generateDiagramThumbnailFile } from '../helpers/download-image'
import { DataSource } from '../types/db-flow'
import { DiagramCustomComponent, ServerDiagramData } from '../types/diagram'

type TUseDiagramPortalMutationProps = ServerDiagramData & {
  diagramId: string | null
  organizationId: string | null
  folderId: string | null
  teamId: string | null
  diagramName: string
  initialLastUpdatedAt: string | undefined
  disabled: boolean
}

export function useDiagramPortalMutation({
  nodes,
  edges,

  components,
  dataSources,

  viewport,

  disabled,
  diagramId,
  diagramName,
  organizationId,
  folderId,
  teamId,
  initialLastUpdatedAt,
}: TUseDiagramPortalMutationProps) {
  const [loading, setLoading] = useState(false)
  const [updateDiagram] = useMutation(UPDATE_DIAGRAM, { client: clientV2 })

  const serverLastUpdatedAt = useMemo(() => {
    return initialLastUpdatedAt ? new Date(initialLastUpdatedAt).getTime() : 0
  }, [initialLastUpdatedAt])

  const [lastUpdatedAt, setLastUpdatedAt] = useEffectState(serverLastUpdatedAt)

  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const helpersRef = useAutoRef({
    updateDiagram,

    lastUpdatedAt,
    setLastUpdatedAt,

    nodes,
    edges,
    viewport,

    components,
    dataSources,

    disabled,
    diagramId,
    diagramName,
    organizationId,
    folderId,
    teamId,
  })

  const saveMetaData = useCallback(
    async (updateThumbnail = false) => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
      console.log('> Saving meta data')

      const {
        updateDiagram,

        lastUpdatedAt,
        setLastUpdatedAt,

        disabled,
        diagramId,
        diagramName,
        organizationId,
        folderId,
        teamId,
        ...data
      } = helpersRef.current

      if (!diagramId || !organizationId || disabled) return

      const updatesInput = {
        name: diagramName,
        content: convertDiagramServerDataToString({
          nodes: data.nodes,
          edges: data.edges,
          viewport: data.viewport,
          components: data.components,
          dataSources: data.dataSources,
        }),
        ...(folderId ? { folderId } : {}),
        ...(teamId ? { teamId } : {}),
      }

      const updateInputStringified = JSON.stringify(updatesInput)
      const isDiagramCached =
        CACHED_UPDATES.has(diagramId) &&
        CACHED_UPDATES.get(diagramId) === updateInputStringified

      if (isDiagramCached && !updateThumbnail) {
        return console.info('Diagram already up to date, skipping update')
      }

      try {
        setLoading(true)

        const thumbnail = updateThumbnail
          ? await getThumbnailFile({
              diagramId,
              force: true,
              nodes: data.nodes,
              edges: data.edges,
              components: data.components,
              dataSources: data.dataSources,
            })
          : null

        if (!isDiagramCached) {
          await updateDiagram({
            variables: {
              orgId: organizationId,
              id: diagramId,
              input: updatesInput,
            },
          })
          CACHED_UPDATES.set(diagramId, updateInputStringified)
        }

        if (thumbnail) {
          uploadThumbnailFile(
            organizationId,
            diagramId,
            thumbnail.thumbnailFile,
            thumbnail.updateHash
          )
            .then(() => {
              setLastUpdatedAt(Date.now())
              CACHED_THUMBNAIL_FILES.set(diagramId, thumbnail.updateHash)
            })
            .catch(() => {
              toast.error(
                'Failed to upload diagram thumbnail. Please try again.'
              )
            })
        }
      } catch {
        toast.error('Failed to update diagram. Please try again.')
      } finally {
        setLoading(false)
      }
    },
    [helpersRef]
  )

  useEffectExceptOnMount(() => {
    const { disabled } = helpersRef.current
    if (disabled) return

    updateTimeoutRef.current = setTimeout(
      saveMetaData,
      SAVE_DIAGRAM_DATA_TIMEOUT
    )

    return () => {
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current)
    }
  }, [
    viewport?.x ?? 0,
    viewport?.y ?? 0,
    viewport?.zoom ?? 1,

    nodes,
    edges,
    components,
    dataSources,
    diagramName,

    saveMetaData,
    helpersRef,
    updateTimeoutRef,
  ])

  return {
    isMetaUpdating: loading,
    triggerMetaUpdate: saveMetaData,
  }
}

const CACHED_UPDATES = new Map<string, string>()
const CACHED_THUMBNAIL_FILES = new Map<string, string>()

const SAVE_DIAGRAM_DATA_TIMEOUT = ms('1s')

type GetThumbnailFileProps = {
  force: boolean
  nodes: Node[]
  edges: Edge[]
  diagramId: string
  dataSources: DataSource[]
  components: DiagramCustomComponent[]
}

async function getThumbnailFile({
  force,
  nodes,
  edges,
  dataSources,
  components,
  diagramId,
}: GetThumbnailFileProps) {
  const updateHash = JSON.stringify({
    nodes,
    edges,
    components,
    dataSources,
  })

  if (!force) {
    const existsInCache = CACHED_THUMBNAIL_FILES.get(diagramId)
    if (existsInCache && existsInCache === updateHash) {
      console.info('Diagram thumbnail already up to date, skipping upload')
      return null
    }
  }

  const thumbnailFile = await generateDiagramThumbnailFile(nodes)
  return { thumbnailFile, updateHash }
}

async function uploadThumbnailFile(
  orgId: string,
  diagramId: string,
  file: File,
  updateHash: string
) {
  const { data: prepareData } = await clientV2.mutate({
    mutation: PREPARE_DIAGRAM_THUMBNAIL_UPLOAD,
    variables: { orgId, diagramId },
  })

  const uploadUrl = prepareData?.prepareDiagramThumbnailUpload?.uploadUrl
  if (!uploadUrl) throw new Error('Failed to get thumbnail upload URL')

  await axios.put(uploadUrl, file, {
    headers: { 'Content-Type': file.type },
    withCredentials: false, // presigned URL — no cookies needed
  })

  await clientV2.mutate({
    mutation: CONFIRM_DIAGRAM_THUMBNAIL_UPLOAD,
    variables: { orgId, diagramId, contentHash: updateHash },
  })
}
