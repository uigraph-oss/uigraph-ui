'use client'

import { SectionLoader } from '@/components/section-loader'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DashboardPageSectionLayout } from '@/features/dashboard'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { useState } from 'react'
import {
  COST_SAVINGS_BY_CLIENT,
  COST_SAVINGS_BY_MODEL,
  COST_SAVINGS_BY_TOOL,
  COST_SAVINGS_BY_USER,
  COST_SAVINGS_SUMMARY,
  COST_SAVINGS_TIMESERIES,
} from './api/insights'
import {
  SavingsBreakdownTable,
  type BreakdownRow,
} from './components/savings-breakdown-table'
import { SavingsComparison } from './components/savings-comparison'
import { SavingsEmptyState } from './components/savings-empty-state'
import { SavingsExportButton } from './components/savings-export-button'
import { SavingsFilters } from './components/savings-filters'
import { SavingsHeroCards } from './components/savings-hero-cards'
import { SavingsTrendChart } from './components/savings-trend-chart'
import { agentDisplay } from './lib/agent-display'

type BreakdownDimension = 'tool' | 'client' | 'model' | 'user'

export function DashboardInsightsPageInner() {
  const orgId = useCurrentOrganization().id
  const [{ period: periodParam, model: modelParam }, setSearchParams] =
    useSearchParamsState('period', 'model')
  const period = periodParam ?? '7d'
  const modelId = modelParam && modelParam !== 'all' ? modelParam : undefined
  const [dimension, setDimension] = useState<BreakdownDimension>('tool')

  const summary = useQuery(COST_SAVINGS_SUMMARY, {
    variables: { orgId, period, modelId },
  })
  const timeseries = useQuery(COST_SAVINGS_TIMESERIES, {
    variables: { orgId, period, modelId },
  })
  const byTool = useQuery(COST_SAVINGS_BY_TOOL, {
    variables: { orgId, period, modelId },
  })
  const byClient = useQuery(COST_SAVINGS_BY_CLIENT, {
    variables: { orgId, period, modelId },
  })
  const byModel = useQuery(COST_SAVINGS_BY_MODEL, {
    variables: { orgId, period },
  })
  const byUser = useQuery(COST_SAVINGS_BY_USER, {
    variables: { orgId, period, modelId },
  })

  const loading =
    summary.loading ||
    timeseries.loading ||
    byTool.loading ||
    byClient.loading ||
    byModel.loading ||
    byUser.loading
  const error =
    summary.error ||
    timeseries.error ||
    byTool.error ||
    byClient.error ||
    byModel.error ||
    byUser.error

  const modelOptions = (byModel.data?.costSavingsByModel ?? []).map((m) => ({
    value: m.modelId,
    label: m.displayName,
  }))

  const breakdownRows: BreakdownRow[] =
    dimension === 'tool'
      ? (byTool.data?.costSavingsByTool ?? []).map((r) => ({
          key: r.toolName,
          label: r.toolName,
          totalCalls: r.totalCalls,
          tokensSaved: r.tokensSaved,
          estimatedCostUsd: 0,
          costSavedUsd: r.costSavedUsd,
          totalDurationMs: r.totalDurationMs,
        }))
      : dimension === 'client'
        ? (byClient.data?.costSavingsByClient ?? []).map((r) => ({
            key: r.clientName,
            label: agentDisplay(r.clientName).label,
            iconUrl: agentDisplay(r.clientName).iconUrl,
            totalCalls: r.totalCalls,
            tokensSaved: r.tokensSaved,
            estimatedCostUsd: 0,
            costSavedUsd: r.costSavedUsd,
            totalDurationMs: r.totalDurationMs,
          }))
        : dimension === 'model'
          ? (byModel.data?.costSavingsByModel ?? []).map((r) => ({
              key: r.modelId,
              label: r.displayName,
              totalCalls: r.totalCalls,
              tokensSaved: r.tokensSaved,
              estimatedCostUsd: r.costRawUsd,
              costSavedUsd: r.costSavedUsd,
            }))
          : (byUser.data?.costSavingsByUser ?? []).map((r) => ({
              key: r.userId ?? r.serviceAccountId ?? r.displayName,
              label: r.displayName,
              totalCalls: r.totalCalls,
              tokensSaved: r.tokensSaved,
              estimatedCostUsd: 0,
              costSavedUsd: r.costSavedUsd,
              totalDurationMs: r.totalDurationMs,
            }))

  const isEmpty =
    !loading &&
    !error &&
    (summary.data?.costSavingsSummary.totalCalls ?? 0) === 0

  return (
    <DashboardPageSectionLayout
      title="Insights"
      description="Cost and token savings from using Claude/Cursor with the uigraph MCP server."
      crumbs={[{ to: '/dashboard/insights', label: 'Insights' }]}
      headerContent={
        <SavingsFilters
          period={period}
          onPeriodChange={(value) => setSearchParams({ period: value })}
          modelId={modelParam ?? 'all'}
          onModelChange={(value) =>
            setSearchParams({ model: value === 'all' ? null : value })
          }
          modelOptions={modelOptions}
        />
      }
    >
      {loading ? (
        <SectionLoader label="Loading insights..." />
      ) : error ? (
        <p className="text-paragraph px-6 py-16 text-center text-sm">
          Couldn&apos;t load insights right now. Please try again.
        </p>
      ) : isEmpty ? (
        <SavingsEmptyState />
      ) : (
        <div className="space-y-6 p-6">
          <SavingsHeroCards
            period={period}
            totalCalls={summary.data!.costSavingsSummary.totalCalls}
            totalTokensSaved={summary.data!.costSavingsSummary.totalTokensSaved}
            costSavedUsd={summary.data!.costSavingsSummary.costSavedUsd}
            uniqueUsersCount={summary.data!.costSavingsSummary.uniqueUsersCount}
            timeSavedMs={summary.data!.costSavingsSummary.timeSavedMs}
            totalDurationMs={summary.data!.costSavingsSummary.totalDurationMs}
          />

          <p className="text-paragraph text-center text-xs">
            &ldquo;Time Saved&rdquo; is an estimate of the codebase-search time
            an agent would have spent without uigraph, compared against
            uigraph&apos;s measured resolve time.
          </p>

          <SavingsComparison
            costServedUsd={summary.data!.costSavingsSummary.costServedUsd}
            costRawUsd={summary.data!.costSavingsSummary.costRawUsd}
          />

          <SavingsTrendChart
            data={(timeseries.data?.costSavingsTimeseries ?? []).map((d) => ({
              date: d.date,
              costSavedUsd: d.costSavedUsd,
            }))}
          />

          <div className="border-stock bg-shading/40 rounded-[12px] border">
            <div className="border-stock flex flex-wrap items-center justify-between gap-3 border-b px-6 py-4">
              <p className="text-paragraph mr-2 text-sm font-medium">
                Breakdown
              </p>
              <ToggleGroup
                type="single"
                value={dimension}
                onValueChange={(value) =>
                  value && setDimension(value as BreakdownDimension)
                }
                variant="outline"
              >
                <ToggleGroupItem
                  value="tool"
                  className="hover:bg-muted hover:text-foreground px-5"
                >
                  By Tool
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="client"
                  className="hover:bg-muted hover:text-foreground px-5"
                >
                  By Agent
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="model"
                  className="hover:bg-muted hover:text-foreground px-5"
                >
                  By Model
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="user"
                  className="hover:bg-muted hover:text-foreground px-5"
                >
                  By User
                </ToggleGroupItem>
              </ToggleGroup>

              <SavingsExportButton
                rows={breakdownRows}
                filename={`insights-${dimension}-${period}.csv`}
                columns={[
                  { header: 'Name', value: (r) => r.label },
                  { header: 'Calls', value: (r) => r.totalCalls },
                  { header: 'Tokens Saved', value: (r) => r.tokensSaved },
                  { header: 'Cost Saved (USD)', value: (r) => r.costSavedUsd },
                ]}
              />
            </div>
            <SavingsBreakdownTable
              rows={breakdownRows}
              variant={dimension === 'model' ? 'model' : 'default'}
            />
            {dimension === 'model' ? (
              <p className="text-paragraph border-stock border-t px-6 py-4 text-center text-xs">
                This isn&apos;t actual uigraph MCP usage — it&apos;s an estimate
                of what these tokens would have cost on each model if it had
                been used.
              </p>
            ) : null}
          </div>
        </div>
      )}
    </DashboardPageSectionLayout>
  )
}
