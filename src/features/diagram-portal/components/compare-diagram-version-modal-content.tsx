import type { V2 } from '@/api'
import { clientV2 } from '@/api/client'
import { BetterDialogContent } from '@/components/better-dialog'
import { VersionLayout } from '@/components/version-layout'
import { useEffect, useMemo, useState } from 'react'
import { DIAGRAM_VERSION_CONTENT_V2 } from '../api/versions-v2'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { FlowDiagramPreview } from '../flow-diagram-preview'
import { convertDiagramServerData } from '../helpers/diagram-data'
import { ServerDiagramData } from '../types/diagram'

type DiagramVersionSummary = Pick<V2.DiagramVersion, 'id' | 'versionNumber'>

export type VersionCompareModalContentProps = {
  versions: DiagramVersionSummary[]
  currentVersionId: string | null
}

type CompareSideProps = {
  versions: DiagramVersionSummary[]
  selectedVersionId: string | null
}

function CompareSide({ versions, selectedVersionId }: CompareSideProps) {
  const { latestData, organizationId, diagramId } = useFlowDiagramContext()

  const [content, setContent] = useState<ServerDiagramData | null>(null)
  const [loading, setLoading] = useState(false)

  const version = useMemo(
    () => versions.find((version) => version.id === selectedVersionId) ?? null,
    [versions, selectedVersionId]
  )

  useEffect(() => {
    if (selectedVersionId === null || !version) {
      setContent(null)
      return
    }

    let cancelled = false
    setLoading(true)

    void clientV2
      .query({
        query: DIAGRAM_VERSION_CONTENT_V2,
        variables: {
          orgId: organizationId!,
          diagramId: diagramId!,
          versionId: version.id,
        },
      })
      .then(({ data }) => {
        if (cancelled) return
        setContent(
          convertDiagramServerData(data?.diagramVersionContent?.content)
        )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedVersionId, version, organizationId, diagramId])

  const versionData = useMemo(() => {
    if (selectedVersionId === null) {
      return { name: 'Latest', ...latestData }
    }
    if (!version || !content) return null
    return { name: `Version ${version.versionNumber}`, ...content }
  }, [selectedVersionId, version, content, latestData])

  if (loading) {
    return (
      <div className="flex size-full shrink-0 items-center justify-center">
        <p>Loading…</p>
      </div>
    )
  }

  if (!versionData) {
    return (
      <div className="flex size-full shrink-0 items-center justify-center">
        <p>No version data</p>
      </div>
    )
  }

  return (
    <FlowDiagramPreview
      key={versionData.name}
      name={versionData.name}
      data={versionData}
    />
  )
}

export function CompareDiagramVersionModalContent({
  versions,
  currentVersionId,
}: VersionCompareModalContentProps) {
  const [selectedLeftVersionId, setSelectedLeftVersionId] = useState<
    string | null
  >(currentVersionId)

  const [selectedRightVersionId, setSelectedRightVersionId] = useState<
    string | null
  >(null)

  const latestVersionId = useMemo(() => {
    return versions.at(0)?.id ?? currentVersionId
  }, [versions, currentVersionId])

  const leftVersionName = useMemo(() => {
    if (selectedLeftVersionId === null) return 'Latest'
    const version = versions.find(
      (version) => version.id === selectedLeftVersionId
    )
    return version ? `Version ${version.versionNumber}` : 'Latest'
  }, [selectedLeftVersionId, versions])

  const rightVersionName = useMemo(() => {
    if (selectedRightVersionId === null) return 'Latest'
    const version = versions.find(
      (version) => version.id === selectedRightVersionId
    )
    return version ? `Version ${version.versionNumber}` : 'Latest'
  }, [selectedRightVersionId, versions])

  return (
    <BetterDialogContent
      title="Compare Versions"
      className="grid grid-cols-2 gap-4 p-4"
      description={
        <span>
          Compare <span className="font-medium">{leftVersionName}</span> with{' '}
          <span className="font-medium">{rightVersionName}</span>.
        </span>
      }
    >
      <VersionLayout
        versions={versions.map((v) => ({
          versionId: v.id,
          versionNumber: v.versionNumber,
        }))}
        currentVersionId={currentVersionId}
        selectedLeftVersionId={selectedLeftVersionId}
        setSelectedLeftVersionId={setSelectedLeftVersionId}
        selectedRightVersionId={selectedRightVersionId}
        setSelectedRightVersionId={setSelectedRightVersionId}
        leftContent={
          <CompareSide
            versions={versions}
            selectedVersionId={selectedLeftVersionId ?? latestVersionId}
          />
        }
        rightContent={
          <CompareSide
            versions={versions}
            selectedVersionId={selectedRightVersionId ?? latestVersionId}
          />
        }
      />
    </BetterDialogContent>
  )
}
