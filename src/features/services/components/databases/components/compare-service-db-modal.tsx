import { BetterDialogContent } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { VersionLayout } from '@/components/version-layout'
import { DIAGRAM, DIAGRAM_CONTENT } from '@/features/diagram-portal/api/diagram'
import { FlowDiagramPreview } from '@/features/diagram-portal/flow-diagram-preview'
import { convertDiagramServerData } from '@/features/diagram-portal/helpers/diagram-data'
import { ServerDiagramData } from '@/features/diagram-portal/types/diagram'
import { useServiceDbContext } from '@/features/services/contexts/service-db-context'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { useMemo, useState } from 'react'
import {
  DatabaseSchemaContent,
  getSchemaSectionTitle,
} from '../database-schema-view'
import { getSchemaViewKind } from '../schema-view-utils'

type DiagramCompareSideProps = {
  selectedVersion: string
}

function DiagramCompareSide({ selectedVersion }: DiagramCompareSideProps) {
  const { dbVersions } = useServiceDbContext()
  const orgId = useCurrentOrganization().id

  const selectedDiagramId = useMemo(() => {
    const version = dbVersions.find(
      (version) => version.versionId === selectedVersion
    )
    return version?.serviceDB?.dbDiagramId
  }, [dbVersions, selectedVersion])

  const skip = !selectedDiagramId || !orgId

  const { loading } = useQuery(DIAGRAM, {
    variables: { orgId: orgId!, id: selectedDiagramId! },
    skip,
    fetchPolicy: 'cache-first',
  })

  const { data: contentData, loading: contentLoading } = useQuery(
    DIAGRAM_CONTENT,
    {
      variables: { orgId: orgId!, id: selectedDiagramId! },
      skip,
      fetchPolicy: 'cache-first',
    }
  )

  const diagramData = useMemo<ServerDiagramData | null>(() => {
    const content = contentData?.diagramContent?.content
    if (!content) return null
    return convertDiagramServerData(content)
  }, [contentData?.diagramContent?.content])

  const versionName = useMemo(() => {
    if (selectedVersion === null) return 'Latest'
    return `Version ${selectedVersion}`
  }, [selectedVersion])

  if (loading || contentLoading) {
    return (
      <div className="flex size-full items-center justify-center">
        <SectionLoader />
      </div>
    )
  }

  if (!diagramData) {
    return (
      <div className="flex size-full items-center justify-center">
        <p>No diagram found</p>
      </div>
    )
  }

  return (
    <FlowDiagramPreview
      key={selectedVersion ?? 'latest'}
      name={versionName}
      data={diagramData}
    />
  )
}

function DataTableCompareSide({ selectedVersion }: DiagramCompareSideProps) {
  const { dbVersions } = useServiceDbContext()

  const db = useMemo(() => {
    return dbVersions.find((v) => v.versionId === selectedVersion)?.serviceDB
  }, [dbVersions, selectedVersion])

  if (!db) {
    return (
      <div className="flex size-full items-center justify-center">
        <p>No database found</p>
      </div>
    )
  }

  const kind = getSchemaViewKind(db)

  return (
    <>
      <h3 className="px-6 py-2 text-right text-[1.385rem] font-semibold text-[#F4F7FC]">
        {getSchemaSectionTitle(kind)}
      </h3>

      <DatabaseSchemaContent db={db} />
    </>
  )
}

export function CompareServiceDbModal() {
  const { dbVersions, selectedDbVersionId } = useServiceDbContext()

  const latestVersionId = useMemo(() => {
    return dbVersions.at(0)?.versionId ?? selectedDbVersionId!
  }, [dbVersions, selectedDbVersionId])

  const [tabs] = useBetterTabs([
    {
      id: 'data-table',
      label: 'Schema',
    },
    {
      id: 'diagram',
      label: 'Data model',
    },
  ])

  const [selectedVersionLeft, setSelectedVersionLeft] = useState<string | null>(
    selectedDbVersionId ?? null
  )
  const [selectedVersionRight, setSelectedVersionRight] = useState<
    string | null
  >(null)

  const leftVersionName = useMemo(() => {
    if (selectedVersionLeft === null) return 'Latest'
    const version = dbVersions.find((v) => v.versionId === selectedVersionLeft)
    return version ? `Version ${version.versionNumber}` : 'Latest'
  }, [selectedVersionLeft, dbVersions])

  const rightVersionName = useMemo(() => {
    if (selectedVersionRight === null) return 'Latest'
    const version = dbVersions.find((v) => v.versionId === selectedVersionRight)
    return version ? `Version ${version.versionNumber}` : 'Latest'
  }, [selectedVersionRight, dbVersions])

  return (
    <BetterDialogContent
      title="Compare Versions"
      className="grid grid-cols-2 gap-3 p-3"
      description={
        <span>
          Compare <span className="font-medium">{leftVersionName}</span> with{' '}
          <span className="font-medium">{rightVersionName}</span>.
        </span>
      }
    >
      <VersionLayout
        versions={dbVersions}
        currentVersionId={selectedDbVersionId}
        selectedLeftVersionId={selectedVersionLeft}
        setSelectedLeftVersionId={setSelectedVersionLeft}
        selectedRightVersionId={selectedVersionRight}
        setSelectedRightVersionId={setSelectedVersionRight}
        leftContent={
          <>
            {tabs.activeTab === 'diagram' && (
              <DiagramCompareSide
                selectedVersion={selectedVersionLeft ?? latestVersionId}
              />
            )}

            {tabs.activeTab === 'data-table' && (
              <DataTableCompareSide
                selectedVersion={selectedVersionLeft ?? latestVersionId}
              />
            )}
          </>
        }
        rightContent={
          <>
            {tabs.activeTab === 'diagram' && (
              <DiagramCompareSide
                selectedVersion={selectedVersionRight ?? latestVersionId}
              />
            )}

            {tabs.activeTab === 'data-table' && (
              <DataTableCompareSide
                selectedVersion={selectedVersionRight ?? latestVersionId}
              />
            )}
          </>
        }
      />

      <div className="absolute top-4 left-[50%] -translate-x-1/2">
        <BetterTabController control={tabs} />
      </div>
    </BetterDialogContent>
  )
}
