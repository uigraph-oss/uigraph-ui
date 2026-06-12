import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useOrganizationContext } from '@/contexts'
import { GET_SERVICE_API_GROUPS_QUERY } from '@/features/services/api/api-endpoints'
import { GET_SERVICES_QUERY } from '@/features/services/api/services'
import { useServiceContext } from '@/features/services/contexts/service-context'
import { cn } from '@/lib/utils'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { useMemo, useState } from 'react'
import { LuChevronDown, LuChevronRight, LuLoaderCircle } from 'react-icons/lu'
import { buildApiSpecValue, parseApiSpecValue } from './api-selection-utils'

function ApiGroupsSection({
  serviceId,
  value,
  onChange,
}: {
  serviceId: string
  value: string
  onChange: (value: string) => void
}) {
  const { data, loading } = useQuery(GET_SERVICE_API_GROUPS_QUERY, {
    fetchPolicy: 'cache-first',
    variables: { serviceId },
    skip: !serviceId,
  })

  const groups = arrayNonNullable(data?.v1GetServiceAPIGroups).filter((group) =>
    Boolean(group.serviceApiGroupId)
  )

  if (loading) {
    return (
      <p className="px-5 py-2 text-[12px] text-[#94a3b8]">Loading groups...</p>
    )
  }

  if (groups.length === 0) {
    return <p className="px-5 py-2 text-[12px] text-[#94a3b8]">No API groups</p>
  }

  return groups.map((group) => {
    const apiSpecValue = buildApiSpecValue(serviceId, group.serviceApiGroupId!)

    return (
      <Button
        key={group.serviceApiGroupId}
        type="button"
        variant="ghost"
        onClick={() => onChange(apiSpecValue)}
        className={cn(
          'h-auto w-full justify-start rounded-none px-5 py-3 text-left text-[13px] font-normal text-[#1f2937] hover:bg-[#f8fafc]',
          value === apiSpecValue &&
            'bg-[#eef2ff] text-[#1d4ed8] hover:bg-[#eef2ff]'
        )}
      >
        <span>
          {group.name?.trim() || group.version?.trim() || 'Untitled API Group'}
        </span>
      </Button>
    )
  })
}

export function LinkApiSpecSelect({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}) {
  const { organizationId } = useOrganizationContext()
  const { serviceId: currentServiceId } = useServiceContext()
  const [open, setOpen] = useState(false)

  const { serviceId, apiGroupId } = parseApiSpecValue(value)

  const { data: servicesData, loading: isServicesLoading } = useQuery(
    GET_SERVICES_QUERY,
    {
      fetchPolicy: 'cache-first',
      variables: { organizationId },
      skip: !organizationId,
    }
  )

  const services = arrayNonNullable(servicesData?.v1GetServices).filter(
    (service) => Boolean(service.serviceId)
  )

  const defaultExpandedServiceIds = useMemo(
    () => arrayNonNullable(services.map((service) => service.serviceId)),
    [services]
  )

  const { data: selectedGroupsData, loading: isSelectedGroupsLoading } =
    useQuery(GET_SERVICE_API_GROUPS_QUERY, {
      fetchPolicy: 'cache-first',
      variables: { serviceId },
      skip: !serviceId,
    })

  const selectedService = services.find(
    (service) => service.serviceId === serviceId
  )
  const selectedGroup = selectedGroupsData?.v1GetServiceAPIGroups?.find(
    (group) => group?.serviceApiGroupId === apiGroupId
  )
  const hasSelectedValue = Boolean(value)
  const hasResolvedSelectedInfo = Boolean(selectedService && selectedGroup)
  const isSelectedInfoLoading =
    hasSelectedValue &&
    !hasResolvedSelectedInfo &&
    (isServicesLoading || isSelectedGroupsLoading)
  const selectedServiceLabel =
    selectedService?.name?.trim() || 'Untitled Service'
  const selectedGroupLabel =
    selectedGroup?.name?.trim() ||
    selectedGroup?.version?.trim() ||
    'Untitled API Group'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          aria-expanded={open}
          aria-label="Select service API group"
          preset="outline"
          className={cn(
            "h-[56px] w-full rounded-[16px] border border-[#dfe5ec] bg-white px-5 text-left [font-family:'DM_Sans',sans-serif] text-[13px] shadow-[0_1px_2px_rgba(15,23,42,0.04)]",
            'focus-visible:border-ring focus-visible:ring-ring/50 flex items-center justify-between gap-2 outline-none focus-visible:ring-[3px]',
            value ? 'text-[#1e293b]' : 'text-[#94a3b8]'
          )}
        >
          {hasResolvedSelectedInfo ? (
            <span className="flex items-center gap-3">
              <span>{selectedServiceLabel}</span>
              <LuChevronRight className="size-4 text-[#94a3b8]" />
              <span>{selectedGroupLabel}</span>
            </span>
          ) : isSelectedInfoLoading ? (
            <span className="flex items-center gap-2 text-[#64748b]">
              <LuLoaderCircle className="size-4 animate-spin" />
              Loading API spec...
            </span>
          ) : (
            <span className="line-clamp-1">
              {value || 'Link a service and API group...'}
            </span>
          )}
          <LuChevronDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="max-h-[360px] w-[var(--radix-popover-trigger-width)] overflow-y-auto bg-white p-0!"
        onWheel={(event) => event.stopPropagation()}
      >
        {isServicesLoading && (
          <p className="px-3 py-2 text-[13px] text-[#64748b]">
            Loading services...
          </p>
        )}

        {!isServicesLoading && services.length === 0 && (
          <p className="px-3 py-2 text-[13px] text-[#64748b]">
            No services found.
          </p>
        )}

        {!isServicesLoading && services.length > 0 && (
          <Accordion
            type="multiple"
            className="w-full"
            defaultValue={
              defaultExpandedServiceIds.length > 0
                ? defaultExpandedServiceIds
                : currentServiceId
                  ? [currentServiceId]
                  : []
            }
          >
            {services.map((service) => (
              <AccordionItem
                key={service.serviceId}
                value={service.serviceId!}
                className="rounded-none border-b border-[#e8edf3] last:border-b-0"
              >
                <AccordionTrigger className="border-b border-[#e8edf3] px-3 py-2.5 hover:no-underline">
                  <span className="flex w-full items-center justify-between gap-2 pr-2">
                    <span className="text-sm font-medium text-[#111827]">
                      {service.name?.trim() || 'Untitled Service'}
                    </span>
                    {service.serviceId === currentServiceId && (
                      <span className="rounded-full bg-[#eef2ff] px-2 py-0.5 text-[11px] font-medium text-[#4f46e5]">
                        Current
                      </span>
                    )}
                  </span>
                </AccordionTrigger>

                <AccordionContent className="pt-0 pb-0">
                  <ApiGroupsSection
                    serviceId={service.serviceId!}
                    value={value}
                    onChange={(nextValue) => {
                      setOpen(false)
                      onChange(nextValue)
                    }}
                  />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </PopoverContent>
    </Popover>
  )
}
