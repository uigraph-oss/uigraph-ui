import { BetterDialogContent } from '@/components/better-dialog'
import { Label } from '@/components/ui/label'
import { SelectSearch } from '@/components/ui/select-search'
import { useOrganizationContext } from '@/contexts'
import { GET_SERVICES_QUERY } from '@/features/services/api/services'
import { GET_TEST_PACKS_QUERY } from '@/features/services/api/test-packs'
import { useQuery } from '@apollo/client'
import { zodResolver } from '@hookform/resolvers/zod'
import { arrayNonNullable } from 'daily-code'
import { Loader2 } from 'lucide-react'
import { useMemo } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import z from 'zod'

type TestSuiteSelectionModalProps = {
  onSelect: SubmitHandler<z.infer<typeof testSuiteSchema>>
}

const testSuiteSchema = z.object({
  serviceId: z.string(),
  testPackId: z.string(),
})

export function TestSuiteSelectionModal({
  onSelect,
}: TestSuiteSelectionModalProps) {
  const { organizationId } = useOrganizationContext()

  const form = useForm({
    resolver: zodResolver(testSuiteSchema),
    defaultValues: {
      serviceId: '',
      testPackId: '',
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

  const { data: testPacksData, loading: testPacksLoading } = useQuery(
    GET_TEST_PACKS_QUERY,
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

  const testPacks = useMemo(
    () => arrayNonNullable(testPacksData?.v1GetTestPacks),
    [testPacksData]
  )

  return (
    <BetterDialogContent
      title="Select Test Suite"
      description="Select the test suite to link to this focal point"
      onFooterSubmitClick={form.handleSubmit(onSelect)}
      footerSubmitLoading={form.formState.isSubmitting}
      footerSubmit="Connect Test Suite"
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
                form.setValue('testPackId', '')
              }}
              className="!h-[56px] w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none"
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">
            Test Pack
          </Label>

          {testPacksLoading ? (
            <div className="flex !h-[56px] w-full items-center gap-2 rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[#6B7480]">
                Loading test packs...
              </span>
            </div>
          ) : (
            <SelectSearch
              value={form.watch('testPackId')}
              options={testPacks.map((pack) => ({
                value: pack.testPackId ?? '',
                label: pack.name ?? pack.testPackId ?? '',
              }))}
              disabled={testPacksLoading || !selectedServiceId}
              onChange={(value) => form.setValue('testPackId', value)}
              className="!h-[56px] w-full rounded-[16px] border border-[#E5E7E9] bg-white px-6 focus:outline-none"
            />
          )}
        </div>
      </div>
    </BetterDialogContent>
  )
}
