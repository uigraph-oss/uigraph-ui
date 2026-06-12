'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { cn } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { LuCloudUpload, LuColumns2 } from 'react-icons/lu'
import { useNavigate } from 'react-router-dom'
import {
  ServiceDbContextProvider,
  useServiceDbContext,
} from '../../contexts/service-db-context'
import { CompareServiceDbModal } from './components/compare-service-db-modal'
import { DBVersionPublishModal } from './components/db-version-publish-modal'
import { SelectedDatabaseDiagramSection } from './selected-database-diagram-section'
import { SelectedDatabaseSchemaSection } from './selected-database-schema-section'

export function ServiceDatabasePageInner() {
  return (
    <ServiceDbContextProvider>
      <ServiceDatabasePageContent />
    </ServiceDbContextProvider>
  )
}

function ServiceDatabasePageContent() {
  const navigate = useNavigate()
  const {
    serviceId,
    serviceDb,
    dbVersions,
    selectedDbVersionId,
    setSelectedDbVersionId,
  } = useServiceDbContext()

  const [isCreatingVersion, setIsCreatingVersion] = useState(false)
  const [isComparingVersions, setIsComparingVersions] = useState(false)
  const [showVersionCount, setShowVersionCount] = useState(5)

  const [control] = useBetterTabs([
    { id: 'schema', label: 'Schema' },
    { id: 'diagrams', label: 'Data model' },
  ])

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="Database Schema"
        description="Manage database schema, data model."
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {selectedDbVersionId === null ? (
              <Button
                preset="outline"
                onClick={() => setIsCreatingVersion(true)}
              >
                <LuCloudUpload />
                Publish Version
              </Button>
            ) : (
              <>
                <Button
                  preset="outline"
                  onClick={() => setIsComparingVersions(true)}
                >
                  <LuColumns2 />
                  Compare Versions
                </Button>

                {/* <Button
                  preset="primary"
                  onClick={async () => {
                    try {
                      setIsRestoringVersion(true)

                      const versionNum = dbVersions.find(
                        (v) => v.versionId === dbVersionId
                      )?.versionNumber

                      if (!versionNum) {
                        throw new Error('Version not found')
                      }

                      await restoreServiceDbVersion({
                        variables: {
                          serviceDBId: serviceDb.serviceDBId!,
                          versionNumber: versionNum,
                        },
                      })
                      toast.success('Version restored successfully')
                    } finally {
                      setIsRestoringVersion(false)
                      setDbVersionId(null)
                    }
                  }}
                >
                  {isRestoringVersion ? (
                    <SuperCircleLoader />
                  ) : (
                    <LuArchiveRestore />
                  )}
                  Restore Version
                </Button> */}
              </>
            )}

            <Select
              value={selectedDbVersionId ?? 'latest'}
              onValueChange={(value) =>
                setSelectedDbVersionId(value === 'latest' ? null : value)
              }
            >
              <SelectTrigger
                className={cn(
                  buttonVariants({ preset: 'outline' }),
                  'w-44 justify-between'
                )}
              >
                <SelectValue placeholder="Select Version" />
              </SelectTrigger>

              <SelectContent>
                {dbVersions.slice(0, showVersionCount).map((version, i) => (
                  <SelectItem
                    key={version.versionId}
                    value={i === 0 ? 'latest' : version.versionId!}
                  >
                    Version {version.versionNumber}
                    {i === 0 && (
                      <span className="text-paragraph text-xs">(Latest)</span>
                    )}
                  </SelectItem>
                ))}

                {dbVersions.length > showVersionCount && (
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
          </div>

          <Button
            preset="outline"
            onClick={() =>
              selectedDbVersionId
                ? setSelectedDbVersionId(null)
                : navigate(`/services/${serviceId}/data`)
            }
          >
            <ArrowLeft />
            {selectedDbVersionId ? 'Back to Latest' : 'Go to All Data'}
          </Button>
        </div>
      </DashboardSectionHeader>

      <DashboardSectionContent>
        <BetterTabController control={control} />

        {control.activeTab === 'schema' && (
          <SelectedDatabaseSchemaSection db={serviceDb} />
        )}

        {control.activeTab === 'diagrams' && (
          <SelectedDatabaseDiagramSection db={serviceDb} />
        )}
      </DashboardSectionContent>

      <BetterDialogProvider
        open={isCreatingVersion}
        onOpenChange={setIsCreatingVersion}
      >
        <DBVersionPublishModal onOpenChange={setIsCreatingVersion} />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={isComparingVersions}
        onOpenChange={setIsComparingVersions}
        className="h-[100%]! [--width:100%]"
      >
        <CompareServiceDbModal />
      </BetterDialogProvider>
    </div>
  )
}
