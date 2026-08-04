import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { PROVIDERS } from '../constants/providers'
import { breakdownBy } from '../lib/derive-cost-metrics'
import type {
  BreakdownDimension,
  CostBreakdownRow,
  InfraResource,
} from '../types'
import { CostBreakdownBarList } from './cost-breakdown-bar-list'
import { CostsExportButton } from './costs-export-button'

const DIMENSION_LABELS: Record<BreakdownDimension, string> = {
  environment: 'By Environment',
  provider: 'By Provider',
  region: 'By Region',
  resourceType: 'By Type',
}

export function CostBreakdownPanel({
  resources,
  dimension,
  onDimensionChange,
  activeKey,
  onRowClick,
}: {
  resources: InfraResource[]
  dimension: BreakdownDimension
  onDimensionChange: (dimension: BreakdownDimension) => void
  activeKey: string | null
  onRowClick: (row: CostBreakdownRow) => void
}) {
  const rows = breakdownBy(resources, dimension)

  return (
    <div>
      <div className="border-stock flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
        <p className="text-paragraph mr-2 text-sm font-medium">
          Cost breakdown
        </p>
        <ToggleGroup
          type="single"
          value={dimension}
          onValueChange={(value) =>
            value && onDimensionChange(value as BreakdownDimension)
          }
          variant="outline"
        >
          {(Object.keys(DIMENSION_LABELS) as BreakdownDimension[]).map((d) => (
            <ToggleGroupItem
              key={d}
              value={d}
              className="hover:bg-muted hover:text-foreground px-5"
            >
              {DIMENSION_LABELS[d]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>

        <CostsExportButton
          rows={rows}
          filename={`service-cost-breakdown-${dimension}.csv`}
          columns={[
            { header: 'Name', value: (r) => r.label },
            { header: 'Monthly Cost (USD)', value: (r) => r.costUsd },
            { header: 'Resources', value: (r) => r.resourceCount },
            { header: '% of Total', value: (r) => r.pctOfTotal.toFixed(1) },
          ]}
        />
      </div>

      <CostBreakdownBarList
        rows={rows}
        activeKey={activeKey}
        onRowClick={onRowClick}
      />

      <p className="text-paragraph/60 border-stock border-t px-6 py-2 text-xs">
        Click a row to filter the resource inventory below.{' '}
        {dimension === 'provider'
          ? `Colors match ${PROVIDERS.aws.label}/${PROVIDERS.azure.label}/${PROVIDERS.gcp.label} across this page.`
          : null}
      </p>
    </div>
  )
}
