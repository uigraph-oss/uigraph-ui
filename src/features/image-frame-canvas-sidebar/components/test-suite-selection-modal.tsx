import { clientV2 } from '@/api/client'
import { BetterDialogContent } from '@/components/better-dialog'
import { Label } from '@/components/ui/label'
import { SelectSearch } from '@/components/ui/select-search'
import { SERVICES } from '@/features/services/api/services'
import { TEST_PACKS } from '@/features/services/api/tests'
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
  const orgId = useCurrentOrganization().id

  const form = useForm({
    resolver: zodResolver(testSuiteSchema),
    defaultValues: {
      serviceId: '',
      testPackId: '',
    },
  })

  const selectedServiceId = form.watch('serviceId')

  const { data: servicesData, loading: servicesLoading } = useQuery(SERVICES, {
    client: clientV2,
    variables: { orgId: orgId! },
    fetchPolicy: 'cache-first',
    skip: !orgId,
  })

  const { data: testPacksData, loading: testPacksLoading } = useQuery(
    TEST_PACKS,
    {
      client: clientV2,
      variables: { orgId: orgId!, serviceId: selectedServiceId },
      fetchPolicy: 'cache-first',
      skip: !orgId || !selectedServiceId,
    }
  )

  const services = useMemo(
    () => arrayNonNullable(servicesData?.services),
    [servicesData]
  )

  const testPacks = useMemo(
    () => arrayNonNullable(testPacksData?.testPacks),
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
                form.setValue('testPackId', '')
              }}
              className={selectClassName}
            />
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-foreground text-sm font-medium">
            Test Pack
          </Label>

          {testPacksLoading ? (
            <div className={loadingClassName}>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-[#828DA3]">
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
              className={selectClassName}
            />
          )}
        </div>
      </div>
    </BetterDialogContent>
  )
}
