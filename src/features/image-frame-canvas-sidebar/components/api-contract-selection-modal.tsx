import { BetterDialogContent } from '@/components/better-dialog'
import { Label } from '@/components/ui/label'
import { SelectSearch } from '@/components/ui/select-search'
import { useOrganizationContext } from '@/contexts'
import {
  GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY,
  GET_SERVICE_API_GROUPS_QUERY,
} from '@/features/services/api/api-endpoints'
import { GET_SERVICES_QUERY } from '@/features/services/api/services'
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
  const { organizationId } = useOrganizationContext()

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
    GET_SERVICES_QUERY,
    {
      variables: { organizationId },
      fetchPolicy: 'cache-first',
    }
  )

  const { data: apiGroupsData, loading: apiGroupsLoading } = useQuery(
    GET_SERVICE_API_GROUPS_QUERY,
    {
      variables: { serviceId: selectedServiceId },
      fetchPolicy: 'cache-first',
      skip: !selectedServiceId,
    }
  )

  const { data: apiEndpointsData, loading: apiEndpointsLoading } = useQuery(
    GET_SERVICE_API_ENDPOINTS_WITH_META_QUERY,
    {
      variables: { serviceApiGroupId: selectedApiGroupId },
      fetchPolicy: 'cache-first',
      skip: !selectedApiGroupId,
    }
  )

  const services = useMemo(
    () => arrayNonNullable(servicesData?.v1GetServices),
    [servicesData]
  )

  const apiGroups = useMemo(
    () => arrayNonNullable(apiGroupsData?.v1GetServiceAPIGroups),
    [apiGroupsData]
  )

  const apiEndpointOptions = useMemo(() => {
    const aes = arrayNonNullable(apiEndpointsData?.v1GetAPIEndpointsWithMeta)
    return aes
      .filter((ae) => ae.apiEndpoint?.componentMetaId)
      .map((ae) => {
        const fields = arrayNonNullable(ae.componentMeta?.componentModalFields)
        const flattened = flattenMetaData(fields, fields)

        const nameId = fields.find(
          (field) => field?.label?.toLowerCase() === 'name'
        )?.componentFieldId

        const nameValue = nameId ? flattened[nameId] : null

        return {
          value: ae.apiEndpoint!.componentMetaId!,
          label: nameValue ?? ae.apiEndpoint?.componentMetaId ?? '',
        }
      })
  }, [apiEndpointsData])

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
                value: service.serviceId ?? '',
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
