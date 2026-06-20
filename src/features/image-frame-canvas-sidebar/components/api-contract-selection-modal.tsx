import { clientV2 } from '@/api/client'
import { BetterDialogContent } from '@/components/better-dialog'
import { Label } from '@/components/ui/label'
import { SelectSearch } from '@/components/ui/select-search'
import {
  API_ENDPOINTS_V2,
  API_GROUPS_V2,
} from '@/features/services/api/api-endpoints-v2'
import {
  apiGroupToLegacy,
  endpointToLegacyWithMeta,
} from '@/features/services/api/api-v2-adapters'
import { SERVICES_V2 } from '@/features/services/api/services-v2'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { flattenMetaData } from '@uigraph/sdk'
import { arrayNonNullable } from 'daily-code'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import z from 'zod'

type ApiContractSelectionModalProps = {
  onSelect: SubmitHandler<z.infer<typeof apiContactSchema>>
}

const apiContactSchema = z.object({
  serviceId: z.string(),
  apiGroupId: z.string(),
  apiEndpointId: z.string(),
})

export function ApiContractSelectionModal({
  onSelect,
}: ApiContractSelectionModalProps) {
  const orgId = useCurrentOrganization().id

  const form = useForm({
    resolver: zodResolver(apiContactSchema),
    defaultValues: {
      serviceId: '',
      apiGroupId: '',
      apiEndpointId: '',
    },
  })

  const selectedServiceId = form.watch('serviceId')
  const selectedApiGroupId = form.watch('apiGroupId')

  const { data: servicesData, loading: servicesLoading } = useQuery(
    SERVICES_V2,
    {
      client: clientV2,
      variables: { orgId: orgId! },
      fetchPolicy: 'cache-first',
      skip: !orgId,
    }
  )

  const { data: apiGroupsData, loading: apiGroupsLoading } = useQuery(
    API_GROUPS_V2,
    {
      client: clientV2,
      variables: { orgId: orgId!, serviceId: selectedServiceId },
      fetchPolicy: 'cache-first',
      skip: !orgId || !selectedServiceId,
    }
  )

  const { data: apiEndpointsData, loading: apiEndpointsLoading } = useQuery(
    API_ENDPOINTS_V2,
    {
      client: clientV2,
      variables: {
        orgId: orgId!,
        serviceId: selectedServiceId,
        apiGroupId: selectedApiGroupId,
      },
      fetchPolicy: 'cache-first',
      skip: !orgId || !selectedServiceId || !selectedApiGroupId,
    }
  )

  const services = useMemo(
    () => arrayNonNullable(servicesData?.services),
    [servicesData]
  )

  const apiGroups = useMemo(
    () => arrayNonNullable(apiGroupsData?.apiGroups).map(apiGroupToLegacy),
    [apiGroupsData]
  )

  const apiEndpointOptions = useMemo(() => {
    const endpoints = arrayNonNullable(apiEndpointsData?.apiEndpoints)
    return endpoints.map((endpoint) => {
      const legacy = endpointToLegacyWithMeta(endpoint, orgId!)
      const fields = arrayNonNullable(
        legacy.componentMeta?.componentModalFields
      )
      const flattened = flattenMetaData(fields, fields)

      const nameId = fields.find(
        (field) => field?.label?.toLowerCase() === 'name'
      )?.componentFieldId

      const nameValue = nameId ? flattened[nameId] : null

      return {
        value: legacy.apiEndpoint.apiEndpointId ?? '',
        label: String(
          nameValue ||
            legacy.apiEndpoint.apiEndpointId ||
            `${endpoint.method} ${endpoint.path}`
        ),
      }
    })
  }, [apiEndpointsData, orgId])

  return (
    <BetterDialogContent
      title="Select API Contract"
      description="Select the API contract to link to this focal point"
      onFooterSubmitClick={form.handleSubmit(onSelect)}
      footerSubmitLoading={form.formState.isSubmitting}
      footerSubmit="Connect API Contract"
      footerCancel
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">Service</Label>

          {servicesLoading ? (
            <div className="flex !h-[56px] w-full items-center gap-2 rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[#6B7480]">
                Loading services...
              </span>
            </div>
          ) : (
            <SelectSearch
              value={selectedServiceId}
              options={services.map((service) => ({
                value: service.id ?? '',
                label: service.name ?? '',
              }))}
              onChange={(value) => {
                form.setValue('serviceId', value)
                form.setValue('apiGroupId', '')
                form.setValue('apiEndpointId', '')
              }}
              className="!h-[56px] w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">
            API Group
          </Label>

          {apiGroupsLoading ? (
            <div className="flex !h-[56px] w-full items-center gap-2 rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[#6B7480]">
                Loading API groups...
              </span>
            </div>
          ) : (
            <SelectSearch
              value={selectedApiGroupId}
              options={apiGroups.map((group) => ({
                value: group.serviceApiGroupId ?? '',
                label: group.name ?? group.version ?? '',
              }))}
              disabled={apiGroupsLoading || !selectedServiceId}
              onChange={(value) => form.setValue('apiGroupId', value)}
              className="!h-[56px] w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">
            API Endpoint
          </Label>

          {apiEndpointsLoading ? (
            <div className="flex !h-[56px] w-full items-center gap-2 rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[#6B7480]">
                Loading API endpoints...
              </span>
            </div>
          ) : (
            <SelectSearch
              value={form.watch('apiEndpointId')}
              options={apiEndpointOptions}
              disabled={apiEndpointsLoading || !selectedApiGroupId}
              onChange={(value) => form.setValue('apiEndpointId', value)}
              className="!h-[56px] w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none"
            />
          )}
        </div>
      </div>
    </BetterDialogContent>
  )
}
