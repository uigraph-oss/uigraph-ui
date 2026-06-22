import { BetterDialogContent } from '@/components/better-dialog'
import { Label } from '@/components/ui/label'
import { SelectSearch } from '@/components/ui/select-search'
import {
  SERVICE_DOCS,
  serviceDocToLegacy,
} from '@/features/services/api/service-doc'
import { SERVICES } from '@/features/services/api/services'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { arrayNonNullable } from 'daily-code'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import z from 'zod'

const selectClassName =
  '!h-[56px] w-full rounded-[16px] border border-[#2A3242] bg-transparent px-6 text-[#F4F7FC] focus:outline-none'
const loadingClassName =
  'flex !h-[56px] w-full items-center gap-2 rounded-[16px] border border-[#2A3242] bg-transparent px-6 focus:outline-none'

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
  const orgId = useCurrentOrganization().id

  const form = useForm({
    resolver: zodResolver(serviceDocSchema),
    defaultValues: {
      serviceId: '',
      serviceDocId: '',
    },
  })

  const selectedServiceId = form.watch('serviceId')

  const { data: servicesData, loading: servicesLoading } = useQuery(SERVICES, {
    variables: { orgId: orgId! },
    fetchPolicy: 'cache-first',
    skip: !orgId,
  })

  const { data: serviceDocsData, loading: serviceDocsLoading } = useQuery(
    SERVICE_DOCS,
    {
      variables: { orgId: orgId!, serviceId: selectedServiceId },
      fetchPolicy: 'cache-first',
      skip: !orgId || !selectedServiceId,
    }
  )

  const services = useMemo(
    () => arrayNonNullable(servicesData?.services),
    [servicesData]
  )

  const serviceDocs = useMemo(
    () =>
      arrayNonNullable(serviceDocsData?.serviceDocs).map(serviceDocToLegacy),
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
            <div className={loadingClassName}>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[#828DA3]">
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
                form.setValue('serviceDocId', '')
              }}
              className={selectClassName}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">
            Document
          </Label>

          {serviceDocsLoading ? (
            <div className={loadingClassName}>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[#828DA3]">
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
              className={selectClassName}
            />
          )}
        </div>
      </div>
    </BetterDialogContent>
  )
}
