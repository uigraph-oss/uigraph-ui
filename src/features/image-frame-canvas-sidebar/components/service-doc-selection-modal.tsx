import { BetterDialogContent } from '@/components/better-dialog'
import { Label } from '@/components/ui/label'
import { SelectSearch } from '@/components/ui/select-search'
import { useOrganizationContext } from '@/contexts'
import { GET_SERVICE_DOC_QUERY } from '@/features/services/api/service-doc'
import { GET_SERVICES_QUERY } from '@/features/services/api/services'
import { useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { arrayNonNullable } from 'daily-code'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import z from 'zod'

type ServiceDocSelectionModalProps = {
  onSelect: SubmitHandler<z.infer<typeof serviceDocSchema>>
}

const serviceDocSchema = z.object({
  serviceId: z.string(),
  serviceDocId: z.string(),
})

export function ServiceDocSelectionModal({
  onSelect,
}: ServiceDocSelectionModalProps) {
  const { organizationId } = useOrganizationContext()

  const form = useForm({
    resolver: zodResolver(serviceDocSchema),
    defaultValues: {
      serviceId: '',
      serviceDocId: '',
    },
  })

  const selectedServiceId = form.watch('serviceId')

  const { data: servicesData, loading: servicesLoading } = useQuery(
    GET_SERVICES_QUERY,
    {
      variables: { organizationId },
      fetchPolicy: 'cache-first',
    }
  )

  const { data: serviceDocsData, loading: serviceDocsLoading } = useQuery(
    GET_SERVICE_DOC_QUERY,
    {
      variables: { serviceId: selectedServiceId },
      fetchPolicy: 'cache-first',
      skip: !selectedServiceId,
    }
  )

  const services = useMemo(
    () => arrayNonNullable(servicesData?.v1GetServices),
    [servicesData]
  )

  const serviceDocs = useMemo(
    () => arrayNonNullable(serviceDocsData?.v1GetServiceDoc),
    [serviceDocsData]
  )

  return (
    <BetterDialogContent
      title="Select Documentation"
      description="Select the document to link to this focal point"
      onFooterSubmitClick={form.handleSubmit(onSelect)}
      footerSubmitLoading={form.formState.isSubmitting}
      footerSubmit="Connect Document"
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
                form.setValue('serviceDocId', '')
              }}
              className="!h-[56px] w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">
            Document
          </Label>

          {serviceDocsLoading ? (
            <div className="flex !h-[56px] w-full items-center gap-2 rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[#6B7480]">
                Loading documents...
              </span>
            </div>
          ) : (
            <SelectSearch
              value={form.watch('serviceDocId')}
              options={serviceDocs.map((doc) => ({
                value: doc.serviceDocId ?? '',
                label: doc.fileName ?? doc.serviceDocId ?? '',
              }))}
              disabled={serviceDocsLoading || !selectedServiceId}
              onChange={(value) => form.setValue('serviceDocId', value)}
              className="!h-[56px] w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none"
            />
          )}
        </div>
      </div>
    </BetterDialogContent>
  )
}
