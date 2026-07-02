'use client'

import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { LuCloudUpload, LuColumns2 } from 'react-icons/lu'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ServiceApiEndpointsContextProvider,
  useServiceApiEndpointsContext,
} from '../../contexts/service-api-endpoints'
import { useServiceContext } from '../../contexts/service-context'
import { ApiSpecDownload } from './api-spec-download'
import { CompareApiGroupVersionsModal } from './compare-api-group-versions-modal'
import { CreateApiGroupVersionModal } from './modals/create-api-group-version-modal'
import { ServiceApiEndpoints } from './service-apis'

export function ApiGroupEndpointsPage() {
  const { serviceId } = useServiceContext()
  const { apiGroupId } = useParams() as { apiGroupId: string }

  return (
    <ServiceApiEndpointsContextProvider
      serviceId={serviceId}
      serviceApiGroupId={apiGroupId}
    >
      <ApiGroupEndpointsPageContent />
    </ServiceApiEndpointsContextProvider>
  )
}

function ApiGroupEndpointsPageContent() {
  const navigate = useNavigate()

  const [isCreatingVersion, setIsCreatingVersion] = useState(false)
  const [isComparingVersions, setIsComparingVersions] = useState(false)

  const {
    apiGroup,
    serviceId,
    apiGroupVersions,
    selectedVersionId,
    isApiEndpointsLoading,
  } = useServiceApiEndpointsContext()

  const specFileId = useMemo(() => {
    return (
      apiGroup?.openApiSpecFileId ??
      apiGroup?.swaggerSpecFileId ??
      apiGroup?.graphqlSpecFileIds?.[0] ??
      apiGroup?.grpcSpecFileIds?.[0] ??
      null
    )
  }, [apiGroup])

  const hasSpec = specFileId !== null
  const activeGroupId = apiGroup.serviceApiGroupId ?? ''

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="API & Behavior"
        description="Manage API endpoints, business logic, request/response samples, and test cases."
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {hasSpec && (
              <ApiSpecDownload
                serviceId={serviceId}
                apiGroupId={activeGroupId}
                versionId={selectedVersionId}
              />
            )}

            <Button preset="outline" onClick={() => setIsCreatingVersion(true)}>
              <LuCloudUpload />
              Publish Release
            </Button>

            {apiGroupVersions.length > 0 && (
              <Button
                preset="outline"
                onClick={() => setIsComparingVersions(true)}
              >
                <LuColumns2 />
                Compare Releases
              </Button>
            )}
          </div>

          <Button
            preset="outline"
            onClick={() => navigate(`/services/${serviceId}/apis`)}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to APIs
          </Button>
        </div>
      </DashboardSectionHeader>

      <DashboardSectionContent noPadding>
        {isApiEndpointsLoading ? (
          <SectionLoader label="Loading API endpoints..." />
        ) : (
          <ServiceApiEndpoints />
        )}
      </DashboardSectionContent>

      <CreateApiGroupVersionModal
        open={isCreatingVersion}
        onOpenChange={setIsCreatingVersion}
      />

      <BetterDialogProvider
        open={isComparingVersions}
        onOpenChange={setIsComparingVersions}
        className="h-[100%]! [--width:100%]"
      >
        <CompareApiGroupVersionsModal />
      </BetterDialogProvider>
    </div>
  )
}
