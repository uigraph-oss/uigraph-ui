'use client'

import { graphql, privateClient } from '@/api'
import {
  ApiContextOption,
  ApiContextToolbar,
} from '@/components/api/api-context-toolbar'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import {
  getDisplayGroup,
  getDisplayProtocol,
  looksLikeSemver,
} from '@/utils/api/display'
import { AuthKind, createOpenApiRuntime } from '@/utils/api/openapi-runtime'
import { ArrowLeft, FileCode2, List } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { LuCloudUpload, LuColumns2 } from 'react-icons/lu'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ServiceApiEndpointsContextProvider,
  useServiceApiEndpointsContext,
} from '../../contexts/service-api-endpoints'
import { useServiceContext } from '../../contexts/service-context'
import { ApiSpecDownload } from './api-spec-download'
import { RestApiSpecViewer } from './api-spec-viewer'
import { CompareApiGroupVersionsModal } from './compare-api-group-versions-modal'
import { GraphqlSpecViewer } from './graphql-spec-viewer'
import { GrpcSpecViewer } from './grpc-spec-viewer'
import { CreateApiGroupVersionModal } from './modals/create-api-group-version-modal'
import { ServiceApiEndpoints } from './service-apis'

const GET_FILE_BY_ID_QUERY = graphql(`
  query GetFileByID_ApiContextToolbar($fileId: String!) {
    GetFileByID(fileId: $fileId, download: true) {
      fileId
      fileDownloadURL
    }
  }
`)

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

const viewModeTabs = [
  {
    id: 'list' as const,
    label: (
      <>
        <List className="h-3.5 w-3.5" />
        Endpoints
      </>
    ),
  },
  {
    id: 'spec' as const,
    label: (
      <>
        <FileCode2 className="h-3.5 w-3.5" />
        Spec
      </>
    ),
  },
]

function ApiGroupEndpointsPageContent() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { service } = useServiceContext()

  const [isCreatingVersion, setIsCreatingVersion] = useState(false)
  const [isComparingVersions, setIsComparingVersions] = useState(false)
  const [control, viewMode] = useBetterTabs(viewModeTabs, 'list')
  const [openApiSpec, setOpenApiSpec] = useState<Record<
    string,
    unknown
  > | null>(null)

  const {
    apiGroup,
    apiGroups,
    serviceId,

    apiGroupVersions,
    selectedVersionId,
    setSelectedVersionId,
    selectedRelease,
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
  useEffect(() => {
    const protocol = (apiGroup.protocol || '').toLowerCase()
    const isRestLikeProtocol =
      protocol === 'rest' || protocol === 'openapi' || protocol === 'swagger'

    if (!specFileId || !isRestLikeProtocol) {
      setOpenApiSpec(null)
      return
    }

    let cancelled = false
    async function run() {
      try {
        const { data } = await privateClient.query({
          query: GET_FILE_BY_ID_QUERY,
          variables: { fileId: specFileId! },
          fetchPolicy: 'cache-first',
        })
        const downloadURL = data?.GetFileByID?.fileDownloadURL

        if (!downloadURL) return

        const response = await fetch(downloadURL)
        if (!response.ok) return
        const raw = await response.text()

        let parsed: unknown = null
        try {
          parsed = JSON.parse(raw)
        } catch {
          const yaml = await import('js-yaml')
          parsed = yaml.load(raw)
        }

        if (!cancelled && parsed && typeof parsed === 'object') {
          setOpenApiSpec(parsed as Record<string, unknown>)
        }
      } catch {
        if (!cancelled) setOpenApiSpec(null)
      }
    }

    void run()
    return () => {
      cancelled = true
    }
  }, [apiGroup.protocol, specFileId])

  const openApiRuntime = useMemo(
    () => createOpenApiRuntime(openApiSpec),
    [openApiSpec]
  )

  const envOptions = useMemo<ApiContextOption[]>(
    () =>
      openApiRuntime.envOptions.map((value) => ({
        value,
        label: toTitleCase(value),
      })),
    [openApiRuntime.envOptions]
  )
  const authOptions = useMemo<ApiContextOption[]>(
    () => mapSecuritySchemesToAuthOptions(openApiRuntime.securitySchemes),
    [openApiRuntime.securitySchemes]
  )

  const specIssue = useMemo(() => {
    const protocol = (apiGroup?.protocol || '').toLowerCase()
    const isRestLike =
      protocol === 'rest' || protocol === 'openapi' || protocol === 'swagger'

    if (!isRestLike) return null
    if (!specFileId) return { message: 'No spec file configured' }
    if (!openApiSpec) return { message: 'Spec failed to load' }
    if (!openApiRuntime.servers || openApiRuntime.servers.length === 0) {
      return { message: 'No servers defined in spec' }
    }
    if (!openApiRuntime.defaultServer?.url) {
      return { message: 'Cannot resolve base URL' }
    }
    return null
  }, [
    apiGroup?.protocol,
    specFileId,
    openApiSpec,
    openApiRuntime.servers,
    openApiRuntime.defaultServer?.url,
  ])

  const activeGroupId = apiGroup.serviceApiGroupId ?? ''
  const activeGroupDisplay = useMemo(
    () =>
      getDisplayGroup({
        groupName: apiGroup?.name ?? apiGroup?.version,
        fallbackGroupName: 'public',
        protocol: apiGroup?.protocol,
      }),
    [apiGroup?.protocol, apiGroup?.name, apiGroup?.version]
  )
  const protocolBadge = useMemo(
    () =>
      getDisplayProtocol({
        protocol: apiGroup?.protocol,
        groupName: apiGroup?.name ?? apiGroup?.version,
      }),
    [apiGroup?.protocol, apiGroup?.name, apiGroup?.version]
  )

  const groupOptions = useMemo<ApiContextOption[]>(() => {
    const options = apiGroups
      .filter(
        (
          group
        ): group is typeof group & {
          serviceApiGroupId: string
        } => typeof group.serviceApiGroupId === 'string'
      )
      .map((group) => ({
        value: group.serviceApiGroupId,
        label: getDisplayGroup({
          groupName: group.version,
          fallbackGroupName: 'public',
          protocol: group.protocol,
        }).label,
      }))
    return options.length > 0
      ? options
      : [{ value: activeGroupId || 'default', label: activeGroupDisplay.label }]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeGroupId, apiGroups])

  const releaseOptions = useMemo<ApiContextOption[]>(() => {
    if (apiGroupVersions.length === 0) {
      return [{ value: '__none__', label: 'No versions yet' }]
    }
    return apiGroupVersions.map((version, index) => {
      const num = version.versionNumber
      const label = num != null ? `v${num}` : version.label?.trim() || 'Latest'
      return {
        value: version.versionId!,
        label,
        isLatest: index === 0,
      }
    })
  }, [apiGroupVersions])

  const provenance = useMemo(() => {
    const repoUrl = service?.gitRepoUrl?.trim() || null
    const repoName = service?.gitRepoName?.trim()
    const commitFull = service?.lastCommitSha?.trim() || null
    const commitShort = commitFull?.slice(0, 7) || null
    const compactLabel = getCompactRepoLabel(repoUrl, repoName, commitShort)

    return {
      compactLabel,
      repoUrl,
      commitShort,
      commitFull,
      lastSyncedAt: selectedRelease?.createdAt ?? apiGroup?.updatedAt ?? null,
      importedBy: selectedRelease?.createdBy ?? apiGroup?.createdBy ?? null,
    }
  }, [
    apiGroup?.createdBy,
    apiGroup?.updatedAt,
    selectedRelease?.createdAt,
    selectedRelease?.createdBy,
    service?.gitRepoName,
    service?.gitRepoUrl,
    service?.lastCommitSha,
  ])

  const handleGroupChange = useCallback(
    (groupId: string) => {
      if (groupId === activeGroupId) return
      const query = searchParams.toString()
      navigate(
        `/services/${serviceId}/apis/${groupId}${query ? `?${query}` : ''}`
      )
    },
    [activeGroupId, navigate, searchParams, serviceId]
  )

  console.log(apiGroup)

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="API & Behavior"
        description="Manage API endpoints, business logic, request/response samples, and test cases."
      >
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            {/* View Mode Toggle - only show when spec exists */}
            {hasSpec && (
              <BetterTabController
                control={control}
                className="rounded-[0.80315625rem] border bg-white p-0.5"
                overlayClassName="rounded-[11px] bg-primary shadow-sm"
                triggerClassName="flex h-full items-center justify-center gap-1.5 rounded-[0.80315625rem] px-4 py-[9.5px] text-sm font-medium"
                activeTriggerClassName="text-primary-foreground rounded-[0.80315625rem]"
              />
            )}

            {/* Download Spec button */}
            {hasSpec && <ApiSpecDownload specFileId={specFileId} />}

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

      <ApiContextToolbar
        groupOptions={groupOptions}
        releaseOptions={releaseOptions}
        currentGroupId={activeGroupId || groupOptions[0]?.value || 'default'}
        currentReleaseId={
          selectedVersionId ??
          releaseOptions.find((o) => o.isLatest)?.value ??
          releaseOptions[0]?.value ??
          ''
        }
        groupProtocol={protocolBadge}
        groupProtocolWarning={specIssue?.message}
        showGroupSemverWarning={
          looksLikeSemver(apiGroup?.name ?? apiGroup?.version) ||
          !!activeGroupDisplay.warning
        }
        groupSemverWarningText={activeGroupDisplay.warning}
        provenance={provenance}
        lastUpdatedAt={apiGroup?.updatedAt}
        onGroupChange={handleGroupChange}
        onReleaseChange={(releaseId) => {
          setSelectedVersionId(
            releaseId === '' ||
              releaseId === '__none__' ||
              releaseId === 'working-copy'
              ? null
              : releaseId
          )
        }}
        environmentOptions={envOptions}
        environmentMode={envOptions.length > 0 ? 'spec' : 'manual'}
        showAuthSelector={openApiRuntime.hasSecuritySchemes}
        authOptions={authOptions}
        authPreview={openApiRuntime.hasSecuritySchemes}
      />

      <DashboardSectionContent noPadding>
        {viewMode === 'spec' && hasSpec ? (
          apiGroup.protocol === 'REST' ? (
            <RestApiSpecViewer specFileId={specFileId} />
          ) : apiGroup.protocol === 'GraphQL' ? (
            <GraphqlSpecViewer
              specFileIds={(apiGroup?.graphqlSpecFileIds ?? []).filter(
                (value): value is string => Boolean(value)
              )}
            />
          ) : apiGroup.protocol === 'gRPC' ? (
            <GrpcSpecViewer
              specFileIds={(apiGroup?.grpcSpecFileIds ?? []).filter(
                (value): value is string => Boolean(value)
              )}
            />
          ) : (
            <div className="flex size-full items-center justify-center">
              <div className="text-muted-foreground text-sm font-medium">
                Unsupported protocol
              </div>
            </div>
          )
        ) : isApiEndpointsLoading ? (
          <SectionLoader label="Loading API endpoints..." />
        ) : (
          <ServiceApiEndpoints specFileId={specFileId ?? undefined} />
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

function getCompactRepoLabel(
  repoUrl?: string | null,
  repoName?: string | null,
  commitShort?: string | null
): string {
  if (!repoUrl && !repoName) {
    return commitShort ? `source @ ${commitShort}` : 'source unavailable'
  }

  const normalizedRepoName = repoName?.trim() || extractRepoNameFromUrl(repoUrl)
  const provider = detectProvider(repoUrl)
  const base = `${provider} · ${normalizedRepoName || 'repository'}`
  return commitShort ? `${base} @ ${commitShort}` : base
}

function extractRepoNameFromUrl(repoUrl?: string | null): string {
  try {
    if (!repoUrl) return ''
    const parsedUrl = new URL(repoUrl)
    const parts = parsedUrl.pathname
      .replace(/^\/+/, '')
      .replace(/\.git$/, '')
      .split('/')
      .filter(Boolean)

    if (parts.length === 0) return ''
    return parts[parts.length - 1] || ''
  } catch {
    return ''
  }
}

function detectProvider(repoUrl?: string | null): 'gitlab' | 'github' | 'git' {
  if (!repoUrl) return 'git'
  const normalized = repoUrl.toLowerCase()
  if (normalized.includes('gitlab')) return 'gitlab'
  if (normalized.includes('github')) return 'github'
  return 'git'
}

function toTitleCase(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function mapSecuritySchemesToAuthOptions(
  schemes: Record<string, { type?: string; scheme?: string }>
): ApiContextOption[] {
  const kinds = new Set<AuthKind>()
  for (const scheme of Object.values(schemes)) {
    const type = (scheme.type || '').toLowerCase()
    const httpScheme = (scheme.scheme || '').toLowerCase()
    if (type === 'oauth2') kinds.add('oauth2')
    else if (type === 'apikey') kinds.add('api-key')
    else if (type === 'http' && httpScheme === 'bearer') kinds.add('bearer')
    else kinds.add('other')
  }

  const ordered: AuthKind[] = ['none', 'bearer', 'api-key', 'oauth2', 'other']
  return ordered
    .filter((kind) => kind === 'none' || kinds.has(kind))
    .map((kind) => ({
      value: kind,
      label:
        kind === 'none'
          ? 'No auth'
          : kind === 'api-key'
            ? 'API key'
            : kind === 'oauth2'
              ? 'OAuth2'
              : kind === 'bearer'
                ? 'Bearer token'
                : 'Other',
    }))
}
