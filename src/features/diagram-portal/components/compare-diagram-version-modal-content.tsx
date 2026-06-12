import { GT } from '@/api'
import { BetterDialogContent } from '@/components/better-dialog'
import { VersionLayout } from '@/components/version-layout'
import { useMemo, useState } from 'react'
import { useFlowDiagramContext } from '../context/flow-diagram-context'
import { FlowDiagramPreview } from '../flow-diagram-preview'
import { convertDiagramServerData } from '../helpers/diagram-data'

export type VersionCompareModalContentProps = {
  versions: GT.DiagramVersion[]
  currentVersionId: string | null
}

type CompareSideProps = {
  versions: GT.DiagramVersion[]
  selectedVersionId: string | null
}

function CompareSide({ versions, selectedVersionId }: CompareSideProps) {
  const { latestData } = useFlowDiagramContext()

  const versionData = useMemo(() => {
    if (selectedVersionId === null) {
      return { name: 'Latest', ...latestData }
    }

    const version = versions.find(
      (version) => version.versionId === selectedVersionId
    )

    if (!version) return null

    return {
      name: `Version ${version.versionNumber}`,
      ...convertDiagramServerData(version.diagram?.componentFlowDiagram),
    }
  }, [selectedVersionId, versions, latestData])

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
    return versions.at(0)?.versionId ?? currentVersionId
  }, [versions, currentVersionId])

  const leftVersionName = useMemo(() => {
    if (selectedLeftVersionId === null) return 'Latest'
    const version = versions.find(
      (version) => version.versionId === selectedLeftVersionId
    )
    return version ? `Version ${version.versionNumber}` : 'Latest'
  }, [selectedLeftVersionId, versions])

  const rightVersionName = useMemo(() => {
    if (selectedRightVersionId === null) return 'Latest'
    const version = versions.find(
      (version) => version.versionId === selectedRightVersionId
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
        versions={versions}
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
