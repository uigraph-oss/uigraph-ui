# Cost Savings Insights Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an "Insights" tab to the dashboard (above Settings) showing org-wide MCP cost/token savings: hero stats, a daily trend chart, a with-vs-without-MCP comparison, and tool/model/user breakdowns — backed by the new `costSavings*` GraphQL queries from the uigraph-graphql plan.

**Architecture:** A new `/dashboard/insights` route following the existing `lazy(...) + Suspense` shell + `*-page-inner.tsx` + `DashboardPageSectionLayout` pattern (same as `/dashboard/diagrams`). Five Apollo `useQuery` calls fan out in parallel; period/model filters live in URL search params via the existing `useSearchParamsState` hook. This is the **first chart consumer** (`recharts` is installed but unused beyond a UI wrapper), the **first date/period-filter query** in this codebase, and the **first component-render test** (no `@testing-library/react` or jsdom test environment exists yet) — each of those gaps is called out explicitly in the task that first needs it.

**Tech Stack:** React 19, TypeScript, Apollo Client 3.14 + GraphQL Code Generator, Tailwind, shadcn/ui primitives (`ToggleGroup`, `Select`), `recharts` 2.15, Vitest 4.

## Global Constraints

- **Cross-repo prerequisite:** Task 2 requires the `uigraph-graphql` server (from the sibling plan `2026-06-23-mcp-cost-savings-graphql.md`) running locally and reachable at `VITE_GRAPHQL_TARGET` (default `http://127.0.0.1:8090`, see `vite.config.mjs` and `codegen.ts`) with the `costSavings*` schema already deployed — `npm run cg` introspects this live server. Start it with `make run` (or `go run ./cmd/server`) from the `uigraph-graphql` repo before running codegen.
- Run all commands from the repo root: `/Users/kranthi/workspace/go/uigraph/backend/uigraph-oss/uigraph-ui/.claude/worktrees/insights-cost-dashboard` (this worktree)
- All new feature code lives under `src/features/dashboard-insights/`
- Period values are exactly `1d|7d|30d|1y` (matching the backend); model filter `"all"` in the UI means "omit modelId" (blended), matching the backend's optional `modelId` convention
- No new dependency for charts (`recharts` + the existing `src/components/ui/chart.tsx` wrapper) or for CSV (hand-rolled, matching `src/features/services/components/apis/api-spec-download.tsx`'s `downloadBlob` pattern) — only Task 8 adds new dependencies (test-only: `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`)
- Verify with `npm run typecheck` after every task that touches `.ts`/`.tsx` files; run `npm test` after every task that adds a `.test.ts(x)` file

---

### Task 1: Nav entry, route, and page shell

**Files:**

- Modify: `src/constants/nav-links.tsx`
- Modify: `src/router.tsx`
- Create: `src/features/dashboard-insights/dashboard-insights-page.tsx`
- Create: `src/features/dashboard-insights/dashboard-insights-page-inner.tsx`

**Interfaces:**

- Produces: route `/dashboard/insights`, exported component `DashboardInsightsPage` — consumed by `router.tsx`; `DashboardInsightsPageInner` — replaced with the full implementation in Task 7

- [ ] **Step 1: Add the nav entry**

In `src/constants/nav-links.tsx`, insert a new entry into `DASHBOARD_NAV_LINKS` immediately before the `/settings` entry (reusing the already-imported `GoGraph` icon, which this file already imports from `react-icons/go` for `SERVER_NAV_LINKS`):

```tsx
  {
    id: '/dashboard/insights',
    label: 'Insights',
    icon: <GoGraph />,
    nested: true,
  },
  {
    id: '/settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    nested: true,
  },
```

- [ ] **Step 2: Create the thin lazy page shell**

Create `src/features/dashboard-insights/dashboard-insights-page.tsx`:

```tsx
'use client'

import { lazy, Suspense } from 'react'

const DashboardInsightsPageInner = lazy(() =>
  import('@/features/dashboard-insights/dashboard-insights-page-inner').then(
    (mod) => ({ default: mod.DashboardInsightsPageInner })
  )
)

export function DashboardInsightsPage() {
  return (
    <Suspense>
      <DashboardInsightsPageInner />
    </Suspense>
  )
}
```

- [ ] **Step 3: Create a placeholder page-inner (full version comes in Task 7)**

Create `src/features/dashboard-insights/dashboard-insights-page-inner.tsx`:

```tsx
'use client'

import { DashboardPageSectionLayout } from '@/features/dashboard'

export function DashboardInsightsPageInner() {
  return (
    <DashboardPageSectionLayout
      title="Insights"
      description="Cost and token savings from using Claude/Cursor with the uigraph MCP server."
      crumbs={[{ to: '/dashboard/insights', label: 'Insights' }]}
    >
      <p className="text-paragraph p-6 text-sm">Loading insights…</p>
    </DashboardPageSectionLayout>
  )
}
```

- [ ] **Step 4: Wire the route**

In `src/router.tsx`, add the lazy import near the other dashboard page imports:

```tsx
const DashboardInsightsPage = lazy(() =>
  import('@/features/dashboard-insights/dashboard-insights-page').then(
    (mod) => ({ default: mod.DashboardInsightsPage })
  )
)
```

And add the route inside the existing `DashboardLayout` route group, after the `/dashboard/ai` block and before `/services`:

```tsx
<Route path="/dashboard/insights" element={<DashboardInsightsPage />} />
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck`

Expected: no errors.

Then start the dev server (`npm run dev`) and visit `http://localhost:3000/dashboard/insights`. Expected: the sidebar shows an "Insights" tab between "Assist" and "Settings", and the page renders the "Insights" header with "Loading insights…" beneath it.

- [ ] **Step 6: Commit**

```bash
git add src/constants/nav-links.tsx src/router.tsx src/features/dashboard-insights/dashboard-insights-page.tsx src/features/dashboard-insights/dashboard-insights-page-inner.tsx
git commit -m "feat: add Insights nav entry, route, and page shell"
```

---

### Task 2: GraphQL queries

**Prerequisite:** the `uigraph-graphql` server is running locally with the `costSavings*` schema deployed (see Global Constraints).

**Files:**

- Create: `src/features/dashboard-insights/api/insights.ts`
- Generated (do not hand-edit): `src/api/.gql/*`

**Interfaces:**

- Produces: typed query documents `COST_SAVINGS_SUMMARY`, `COST_SAVINGS_TIMESERIES`, `COST_SAVINGS_BY_TOOL`, `COST_SAVINGS_BY_MODEL`, `COST_SAVINGS_BY_USER` — consumed by Task 7's `useQuery` calls and Task 8's tests

- [ ] **Step 1: Write the query file**

Create `src/features/dashboard-insights/api/insights.ts`:

```ts
import { graphql } from '@/api'

export const COST_SAVINGS_SUMMARY = graphql(`
  query CostSavingsSummary($orgId: ID!, $period: String, $modelId: String) {
    costSavingsSummary(orgId: $orgId, period: $period, modelId: $modelId) {
      orgId
      period
      modelId
      totalCalls
      totalTokensServed
      totalTokensSaved
      costServedUsd
      costRawUsd
      costSavedUsd
      uniqueUsersCount
    }
  }
`)

export const COST_SAVINGS_TIMESERIES = graphql(`
  query CostSavingsTimeseries($orgId: ID!, $period: String, $modelId: String) {
    costSavingsTimeseries(orgId: $orgId, period: $period, modelId: $modelId) {
      date
      totalCalls
      totalTokensServed
      totalTokensSaved
      costServedUsd
      costRawUsd
      costSavedUsd
    }
  }
`)

export const COST_SAVINGS_BY_TOOL = graphql(`
  query CostSavingsByTool($orgId: ID!, $period: String, $modelId: String) {
    costSavingsByTool(orgId: $orgId, period: $period, modelId: $modelId) {
      toolName
      totalCalls
      tokensSaved
      costSavedUsd
    }
  }
`)

export const COST_SAVINGS_BY_MODEL = graphql(`
  query CostSavingsByModel($orgId: ID!, $period: String) {
    costSavingsByModel(orgId: $orgId, period: $period) {
      modelId
      displayName
      provider
      totalCalls
      tokensSaved
      costSavedUsd
    }
  }
`)

export const COST_SAVINGS_BY_USER = graphql(`
  query CostSavingsByUser($orgId: ID!, $period: String, $modelId: String) {
    costSavingsByUser(orgId: $orgId, period: $period, modelId: $modelId) {
      userId
      serviceAccountId
      displayName
      totalCalls
      tokensSaved
      costSavedUsd
    }
  }
`)
```

- [ ] **Step 2: Run codegen**

Run: `npm run cg`

Expected: completes without errors and updates `src/api/.gql/graphql.ts` (and related generated files) to include `CostSavingsSummaryQuery`, `CostSavingsTimeseriesQuery`, etc. types. If this fails with a connection error, confirm the `uigraph-graphql` server is running and reachable at the configured `VITE_GRAPHQL_TARGET`.

- [ ] **Step 3: Verify**

Run: `npm run typecheck`

Expected: no errors (confirms the generated types are well-formed and the query file compiles).

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard-insights/api/insights.ts src/api/.gql
git commit -m "feat: add Insights GraphQL queries"
```

---

### Task 3: Derived metrics (pure functions)

**Files:**

- Create: `src/features/dashboard-insights/lib/derived-metrics.ts`
- Create: `src/features/dashboard-insights/lib/derived-metrics.test.ts`

**Interfaces:**

- Produces: `periodToDays(period: string): number`, `projectedAnnualSavings(costSavedUsd: number, period: string): number`, `costSavedPerUser(costSavedUsd: number, uniqueUsersCount: number): number | null` — consumed by Task 5's `SavingsHeroCards`

- [ ] **Step 1: Write the failing tests**

Create `src/features/dashboard-insights/lib/derived-metrics.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import {
  costSavedPerUser,
  periodToDays,
  projectedAnnualSavings,
} from './derived-metrics'

describe('periodToDays', () => {
  it('maps known periods to day counts', () => {
    expect(periodToDays('1d')).toBe(1)
    expect(periodToDays('7d')).toBe(7)
    expect(periodToDays('30d')).toBe(30)
    expect(periodToDays('1y')).toBe(365)
  })

  it('defaults unknown periods to 7 days', () => {
    expect(periodToDays('bogus')).toBe(7)
  })
})

describe('projectedAnnualSavings', () => {
  it('extrapolates a 7-day total to a year', () => {
    expect(projectedAnnualSavings(70, '7d')).toBeCloseTo(3650, 5)
  })

  it('extrapolates a 1-day total to a year', () => {
    expect(projectedAnnualSavings(10, '1d')).toBeCloseTo(3650, 5)
  })

  it('returns 0 for 0 savings', () => {
    expect(projectedAnnualSavings(0, '30d')).toBe(0)
  })
})

describe('costSavedPerUser', () => {
  it('divides cost saved by unique users', () => {
    expect(costSavedPerUser(100, 4)).toBe(25)
  })

  it('returns null when there are zero users (guards division by zero)', () => {
    expect(costSavedPerUser(100, 0)).toBeNull()
  })

  it('returns null for a negative user count (defensive)', () => {
    expect(costSavedPerUser(100, -1)).toBeNull()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/dashboard-insights/lib/derived-metrics.test.ts`

Expected: FAIL — `derived-metrics.ts` doesn't exist yet.

- [ ] **Step 3: Implement**

Create `src/features/dashboard-insights/lib/derived-metrics.ts`:

```ts
const PERIOD_DAYS: Record<string, number> = {
  '1d': 1,
  '7d': 7,
  '30d': 30,
  '1y': 365,
}

export function periodToDays(period: string): number {
  return PERIOD_DAYS[period] ?? PERIOD_DAYS['7d']
}

export function projectedAnnualSavings(
  costSavedUsd: number,
  period: string
): number {
  const days = periodToDays(period)
  return (costSavedUsd / days) * 365
}

export function costSavedPerUser(
  costSavedUsd: number,
  uniqueUsersCount: number
): number | null {
  if (uniqueUsersCount <= 0) return null
  return costSavedUsd / uniqueUsersCount
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/dashboard-insights/lib/derived-metrics.test.ts`

Expected: `PASS`, 9 tests.

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard-insights/lib/derived-metrics.ts src/features/dashboard-insights/lib/derived-metrics.test.ts
git commit -m "feat: add Insights derived-metrics calculations"
```

---

### Task 4: CSV export (pure function)

**Files:**

- Create: `src/features/dashboard-insights/lib/csv-export.ts`
- Create: `src/features/dashboard-insights/lib/csv-export.test.ts`

**Interfaces:**

- Produces: `type CsvColumn<T> = { header: string; value: (row: T) => string | number }`, `buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string` — consumed by Task 7's `SavingsExportButton`

- [ ] **Step 1: Write the failing tests**

Create `src/features/dashboard-insights/lib/csv-export.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { buildCsv } from './csv-export'

describe('buildCsv', () => {
  it('builds a header row plus one row per item', () => {
    const csv = buildCsv(
      [{ name: 'get_api_spec', calls: 3 }],
      [
        { header: 'Tool', value: (r) => r.name },
        { header: 'Calls', value: (r) => r.calls },
      ]
    )
    expect(csv).toBe('Tool,Calls\nget_api_spec,3')
  })

  it('quotes and escapes values containing commas or quotes', () => {
    const csv = buildCsv(
      [{ label: 'Claude "Sonnet", 4.6' }],
      [{ header: 'Label', value: (r) => r.label }]
    )
    expect(csv).toBe('Label\n"Claude ""Sonnet"", 4.6"')
  })

  it('returns just the header row for an empty input', () => {
    const csv = buildCsv<{ x: number }>(
      [],
      [{ header: 'X', value: (r) => r.x }]
    )
    expect(csv).toBe('X')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/features/dashboard-insights/lib/csv-export.test.ts`

Expected: FAIL — `csv-export.ts` doesn't exist yet.

- [ ] **Step 3: Implement**

Create `src/features/dashboard-insights/lib/csv-export.ts`:

```ts
export type CsvColumn<T> = {
  header: string
  value: (row: T) => string | number
}

export function buildCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const escape = (value: string | number) => {
    const str = String(value)
    return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str
  }

  const header = columns.map((c) => escape(c.header)).join(',')
  const lines = rows.map((row) =>
    columns.map((c) => escape(c.value(row))).join(',')
  )
  return [header, ...lines].join('\n')
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run src/features/dashboard-insights/lib/csv-export.test.ts`

Expected: `PASS`, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/features/dashboard-insights/lib/csv-export.ts src/features/dashboard-insights/lib/csv-export.test.ts
git commit -m "feat: add Insights CSV export helper"
```

---

### Task 5: Presentational components — hero cards, comparison, trend chart, empty state

**Files:**

- Create: `src/features/dashboard-insights/components/savings-hero-cards.tsx`
- Create: `src/features/dashboard-insights/components/savings-comparison.tsx`
- Create: `src/features/dashboard-insights/components/savings-trend-chart.tsx`
- Create: `src/features/dashboard-insights/components/savings-empty-state.tsx`

**Interfaces:**

- Consumes: `projectedAnnualSavings`/`costSavedPerUser` from Task 3
- Produces: `SavingsHeroCards`, `SavingsComparison`, `SavingsTrendChart` (prop `data: TrendPoint[]` where `TrendPoint = { date: string; costSavedUsd: number }`), `SavingsEmptyState` — all consumed by Task 7

There's no existing precedent in this codebase for testing presentational components in isolation (zero React component tests exist before Task 8), so this task has no test step of its own — it's verified visually once wired up in Task 7, and indirectly covered by Task 8's page-level render tests.

- [ ] **Step 1: Hero cards**

Create `src/features/dashboard-insights/components/savings-hero-cards.tsx`:

```tsx
import {
  costSavedPerUser,
  projectedAnnualSavings,
} from '../lib/derived-metrics'

type SavingsHeroCardsProps = {
  period: string
  totalCalls: number
  totalTokensSaved: number
  costSavedUsd: number
  uniqueUsersCount: number
}

export function SavingsHeroCards({
  period,
  totalCalls,
  totalTokensSaved,
  costSavedUsd,
  uniqueUsersCount,
}: SavingsHeroCardsProps) {
  const annual = projectedAnnualSavings(costSavedUsd, period)
  const perUser = costSavedPerUser(costSavedUsd, uniqueUsersCount)

  const usd = (value: number) =>
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
      <StatCard label="Cost Saved" value={usd(costSavedUsd)} highlight />
      <StatCard label="Projected Annual Savings" value={usd(annual)} />
      <StatCard
        label="Tokens Saved"
        value={totalTokensSaved.toLocaleString()}
      />
      <StatCard label="Total Calls" value={totalCalls.toLocaleString()} />
      <StatCard
        label="Cost Saved / Active User"
        value={perUser === null ? '—' : usd(perUser)}
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="border-stock rounded-[12px] border px-6 py-6">
      <p className="text-paragraph text-sm font-medium">{label}</p>
      <p
        className={
          highlight
            ? 'text-primary mt-3 text-3xl font-semibold tracking-tight'
            : 'text-foreground mt-3 text-3xl font-semibold tracking-tight'
        }
      >
        {value}
      </p>
    </div>
  )
}
```

- [ ] **Step 2: With-vs-without comparison**

Create `src/features/dashboard-insights/components/savings-comparison.tsx`:

```tsx
type SavingsComparisonProps = {
  costServedUsd: number
  costRawUsd: number
}

export function SavingsComparison({
  costServedUsd,
  costRawUsd,
}: SavingsComparisonProps) {
  const max = Math.max(costServedUsd, costRawUsd, 1)
  const usd = (value: number) =>
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  return (
    <div className="border-stock space-y-4 rounded-[12px] border px-6 py-6">
      <p className="text-paragraph text-sm font-medium">
        With vs. without uigraph MCP
      </p>
      <Bar
        label="With uigraph MCP"
        value={costServedUsd}
        max={max}
        usd={usd}
        color="bg-primary"
      />
      <Bar
        label="Without uigraph MCP"
        value={costRawUsd}
        max={max}
        usd={usd}
        color="bg-muted-foreground/40"
      />
    </div>
  )
}

function Bar({
  label,
  value,
  max,
  usd,
  color,
}: {
  label: string
  value: number
  max: number
  usd: (n: number) => string
  color: string
}) {
  const widthPct = Math.max((value / max) * 100, 2)
  return (
    <div>
      <div className="text-paragraph mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-foreground font-medium">{usd(value)}</span>
      </div>
      <div className="bg-muted/30 h-2 w-full overflow-hidden rounded-full">
        <div
          className={`h-full rounded-full ${color}`}
          style={{ width: `${widthPct}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Trend chart (first recharts consumer in this codebase)**

Create `src/features/dashboard-insights/components/savings-trend-chart.tsx`:

```tsx
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

export type TrendPoint = {
  date: string
  costSavedUsd: number
}

const chartConfig: ChartConfig = {
  costSavedUsd: { label: 'Cost Saved (USD)', color: 'var(--primary)' },
}

export function SavingsTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[280px] w-full">
      <AreaChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={(value: string) => value.slice(5)}
          tickLine={false}
          axisLine={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="costSavedUsd"
          type="monotone"
          fill="var(--color-costSavedUsd)"
          stroke="var(--color-costSavedUsd)"
          fillOpacity={0.2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
```

- [ ] **Step 4: Empty state**

Create `src/features/dashboard-insights/components/savings-empty-state.tsx`:

```tsx
export function SavingsEmptyState() {
  return (
    <div className="border-stock flex flex-col items-center gap-2 rounded-[12px] border px-6 py-16 text-center">
      <p className="text-foreground text-lg font-semibold">
        No MCP usage recorded yet
      </p>
      <p className="text-paragraph max-w-md text-sm">
        Connect Claude or Cursor to the uigraph MCP server to start tracking
        cost and token savings here.
      </p>
    </div>
  )
}
```

- [ ] **Step 5: Verify**

Run: `npm run typecheck`

Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/dashboard-insights/components/savings-hero-cards.tsx src/features/dashboard-insights/components/savings-comparison.tsx src/features/dashboard-insights/components/savings-trend-chart.tsx src/features/dashboard-insights/components/savings-empty-state.tsx
git commit -m "feat: add Insights hero cards, comparison, trend chart, empty state"
```

---

### Task 6: Breakdown table and filters

**Files:**

- Create: `src/features/dashboard-insights/components/savings-breakdown-table.tsx`
- Create: `src/features/dashboard-insights/components/savings-filters.tsx`

**Interfaces:**

- Produces: `SavingsBreakdownTable` (prop `rows: BreakdownRow[]` where `BreakdownRow = { key: string; label: string; totalCalls: number; tokensSaved: number; costSavedUsd: number }`), `SavingsFilters` (props `period`, `onPeriodChange`, `modelId`, `onModelChange`, `modelOptions: { value: string; label: string }[]`) — both consumed by Task 7. Uses `ToggleGroup` (not `Tabs`) for the period selector since `ToggleGroup` already has 4 real consumers in this codebase and `Tabs` has zero — lower risk to build on the proven pattern.

- [ ] **Step 1: Breakdown table**

Create `src/features/dashboard-insights/components/savings-breakdown-table.tsx`:

```tsx
export type BreakdownRow = {
  key: string
  label: string
  totalCalls: number
  tokensSaved: number
  costSavedUsd: number
}

export function SavingsBreakdownTable({ rows }: { rows: BreakdownRow[] }) {
  const totalSaved = rows.reduce((sum, r) => sum + r.costSavedUsd, 0)
  const usd = (value: number) =>
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

  if (rows.length === 0) {
    return (
      <p className="text-paragraph px-6 py-8 text-center text-sm">
        No data for this period.
      </p>
    )
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-paragraph border-stock border-b text-left">
          <th className="px-6 py-3 font-medium">Name</th>
          <th className="px-6 py-3 font-medium">Calls</th>
          <th className="px-6 py-3 font-medium">Tokens Saved</th>
          <th className="px-6 py-3 font-medium">$ Saved</th>
          <th className="px-6 py-3 font-medium">% of Total</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.key} className="border-stock border-b last:border-b-0">
            <td className="text-foreground px-6 py-3">{row.label}</td>
            <td className="text-foreground px-6 py-3">
              {row.totalCalls.toLocaleString()}
            </td>
            <td className="text-foreground px-6 py-3">
              {row.tokensSaved.toLocaleString()}
            </td>
            <td className="text-foreground px-6 py-3">
              {usd(row.costSavedUsd)}
            </td>
            <td className="text-foreground px-6 py-3">
              {totalSaved > 0
                ? `${((row.costSavedUsd / totalSaved) * 100).toFixed(1)}%`
                : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
```

- [ ] **Step 2: Filters**

Create `src/features/dashboard-insights/components/savings-filters.tsx`:

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const PERIODS = [
  { value: '1d', label: 'Today' },
  { value: '7d', label: '7d' },
  { value: '30d', label: '30d' },
  { value: '1y', label: '1y' },
]

export type ModelOption = { value: string; label: string }

type SavingsFiltersProps = {
  period: string
  onPeriodChange: (period: string) => void
  modelId: string
  onModelChange: (modelId: string) => void
  modelOptions: ModelOption[]
}

export function SavingsFilters({
  period,
  onPeriodChange,
  modelId,
  onModelChange,
  modelOptions,
}: SavingsFiltersProps) {
  return (
    <div className="flex items-center gap-3">
      <ToggleGroup
        type="single"
        value={period}
        onValueChange={(value) => value && onPeriodChange(value)}
        variant="outline"
      >
        {PERIODS.map((p) => (
          <ToggleGroupItem key={p.value} value={p.value} aria-label={p.label}>
            {p.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>

      <Select value={modelId} onValueChange={onModelChange}>
        <SelectTrigger className="h-10 w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Models</SelectItem>
          {modelOptions.map((m) => (
            <SelectItem key={m.value} value={m.value}>
              {m.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck`

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard-insights/components/savings-breakdown-table.tsx src/features/dashboard-insights/components/savings-filters.tsx
git commit -m "feat: add Insights breakdown table and filters"
```

---

### Task 7: Full page wiring and CSV export button

**Files:**

- Create: `src/features/dashboard-insights/components/savings-export-button.tsx`
- Modify: `src/features/dashboard-insights/dashboard-insights-page-inner.tsx` (replace Task 1's placeholder)

**Interfaces:**

- Consumes: everything from Tasks 2-6
- Produces: the complete `DashboardInsightsPageInner` — consumed by Task 8's render tests

- [ ] **Step 1: Export button**

Create `src/features/dashboard-insights/components/savings-export-button.tsx`:

```tsx
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'
import { buildCsv, type CsvColumn } from '../lib/csv-export'

function downloadBlob(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export function SavingsExportButton<T>({
  rows,
  columns,
  filename,
}: {
  rows: T[]
  columns: CsvColumn<T>[]
  filename: string
}) {
  return (
    <Button
      preset="outline"
      onClick={() =>
        downloadBlob(buildCsv(rows, columns), filename, 'text/csv')
      }
    >
      <Download className="h-4 w-4" />
      Export CSV
    </Button>
  )
}
```

- [ ] **Step 2: Replace the page-inner placeholder with the full implementation**

Replace the full contents of `src/features/dashboard-insights/dashboard-insights-page-inner.tsx`:

```tsx
'use client'

import { SectionLoader } from '@/components/section-loader'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { DashboardPageSectionLayout } from '@/features/dashboard'
import { useSearchParamsState } from '@/hooks/use-search-params-state'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { useState } from 'react'
import {
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

type BreakdownDimension = 'tool' | 'model' | 'user'

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
    byModel.loading ||
    byUser.loading
  const error =
    summary.error ||
    timeseries.error ||
    byTool.error ||
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
          costSavedUsd: r.costSavedUsd,
        }))
      : dimension === 'model'
        ? (byModel.data?.costSavingsByModel ?? []).map((r) => ({
            key: r.modelId,
            label: r.displayName,
            totalCalls: r.totalCalls,
            tokensSaved: r.tokensSaved,
            costSavedUsd: r.costSavedUsd,
          }))
        : (byUser.data?.costSavingsByUser ?? []).map((r) => ({
            key: r.userId ?? r.serviceAccountId ?? r.displayName,
            label: r.displayName,
            totalCalls: r.totalCalls,
            tokensSaved: r.tokensSaved,
            costSavedUsd: r.costSavedUsd,
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
          />

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

          <div className="border-stock rounded-[12px] border">
            <div className="border-stock flex items-center justify-between border-b px-6 py-4">
              <ToggleGroup
                type="single"
                value={dimension}
                onValueChange={(value) =>
                  value && setDimension(value as BreakdownDimension)
                }
                variant="outline"
              >
                <ToggleGroupItem value="tool">By Tool</ToggleGroupItem>
                <ToggleGroupItem value="model">By Model</ToggleGroupItem>
                <ToggleGroupItem value="user">By User</ToggleGroupItem>
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
            <SavingsBreakdownTable rows={breakdownRows} />
          </div>
        </div>
      )}
    </DashboardPageSectionLayout>
  )
}
```

- [ ] **Step 3: Verify**

Run: `npm run typecheck && npm test`

Expected: no type errors; existing test suite still passes (4 pre-existing `permissions.test.ts` failures are unrelated and pre-date this work).

Then in the dev server, visit `/dashboard/insights`: confirm hero stats, the with/without comparison, the trend chart, and the By Tool/Model/User breakdown table all render with live data (assuming the org has some MCP usage events — if not, confirm the empty state renders instead). Toggle the period and model filters and confirm the URL search params update and data refetches. Click "Export CSV" and confirm a file downloads.

- [ ] **Step 4: Commit**

```bash
git add src/features/dashboard-insights/components/savings-export-button.tsx src/features/dashboard-insights/dashboard-insights-page-inner.tsx
git commit -m "feat: wire up full Insights dashboard page"
```

---

### Task 8: Test infrastructure + page render tests

**This is the first component-render test in this codebase** — there is no `@testing-library/react`, no jsdom test environment, and no `MockedProvider` usage anywhere yet. This task adds that infrastructure and uses it once, for this page.

**Files:**

- Modify: `package.json` (add devDependencies)
- Modify: `vite.config.mjs` (add `test` config block)
- Create: `src/test/setup.ts`
- Create: `src/features/dashboard-insights/dashboard-insights-page-inner.test.tsx`

- [ ] **Step 1: Add test dependencies**

Run:

```bash
npm install --save-dev @testing-library/react@^16.1.0 @testing-library/jest-dom@^6.6.3 jsdom@^25.0.1
```

- [ ] **Step 2: Configure the jsdom test environment**

In `vite.config.mjs`, add a `test` key to the object returned from `defineConfig`, alongside the existing `plugins`/`define`/`resolve`/`server` keys:

```js
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
```

- [ ] **Step 3: Create the setup file**

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Write the failing render tests**

Create `src/features/dashboard-insights/dashboard-insights-page-inner.test.tsx`:

```tsx
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { useAuthStore } from '@/store/auth-store'
import {
  COST_SAVINGS_BY_MODEL,
  COST_SAVINGS_BY_TOOL,
  COST_SAVINGS_BY_USER,
  COST_SAVINGS_SUMMARY,
  COST_SAVINGS_TIMESERIES,
} from './api/insights'
import { DashboardInsightsPageInner } from './dashboard-insights-page-inner'

const ORG_ID = 'org-1'
const VARS = { orgId: ORG_ID, period: '7d', modelId: undefined }

function renderPage(mocks: MockedResponse[]) {
  return render(
    <MemoryRouter>
      <MockedProvider mocks={mocks} addTypename={false}>
        <DashboardInsightsPageInner />
      </MockedProvider>
    </MemoryRouter>
  )
}

function summaryMock(overrides: Record<string, unknown> = {}): MockedResponse {
  return {
    request: { query: COST_SAVINGS_SUMMARY, variables: VARS },
    result: {
      data: {
        costSavingsSummary: {
          orgId: ORG_ID,
          period: '7d',
          modelId: null,
          totalCalls: 12,
          totalTokensServed: 1000,
          totalTokensSaved: 5000,
          costServedUsd: 3,
          costRawUsd: 18,
          costSavedUsd: 15,
          uniqueUsersCount: 2,
          ...overrides,
        },
      },
    },
  }
}

function emptyListMock(
  query: typeof COST_SAVINGS_TIMESERIES,
  field: string
): MockedResponse {
  return {
    request: { query, variables: VARS },
    result: { data: { [field]: [] } },
  }
}

function allListMocks(): MockedResponse[] {
  return [
    emptyListMock(COST_SAVINGS_TIMESERIES, 'costSavingsTimeseries'),
    emptyListMock(COST_SAVINGS_BY_TOOL, 'costSavingsByTool'),
    emptyListMock(COST_SAVINGS_BY_MODEL, 'costSavingsByModel'),
    emptyListMock(COST_SAVINGS_BY_USER, 'costSavingsByUser'),
  ]
}

beforeEach(() => {
  useAuthStore.setState({
    organizations: [{ id: ORG_ID, name: 'Test Org' } as never],
    currentOrganizationId: ORG_ID,
  })
})

describe('DashboardInsightsPageInner', () => {
  it('shows a loading state before data arrives', () => {
    renderPage([summaryMock(), ...allListMocks()])
    expect(screen.getByText(/Loading insights/i)).toBeInTheDocument()
  })

  it('renders the cost saved hero stat once data loads', async () => {
    renderPage([summaryMock(), ...allListMocks()])
    await waitFor(() => {
      expect(screen.getByText('$15.00')).toBeInTheDocument()
    })
  })

  it('shows the empty state when there is no usage yet', async () => {
    renderPage([
      summaryMock({ totalCalls: 0, costSavedUsd: 0 }),
      ...allListMocks(),
    ])
    await waitFor(() => {
      expect(screen.getByText(/No MCP usage recorded yet/i)).toBeInTheDocument()
    })
  })

  it('shows an error message when a query fails', async () => {
    renderPage([
      {
        request: { query: COST_SAVINGS_SUMMARY, variables: VARS },
        error: new Error('network error'),
      },
      ...allListMocks(),
    ])
    await waitFor(() => {
      expect(screen.getByText(/Couldn.t load insights/i)).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 5: Run tests to verify they fail**

Run: `npx vitest run src/features/dashboard-insights/dashboard-insights-page-inner.test.tsx`

Expected: FAIL at this point — likely either a missing-module error (before Step 1/2/3 are done) or assertion failures if the Apollo mock variable shapes don't exactly match what the component sends (Apollo's `MockedProvider` matches requests by deep equality of `query` + `variables`). If a test fails with "No more mocked responses" or similar, compare the actual variables your component passes (log them, or check the Apollo dev tools) against `VARS` in the test and adjust the mock's `variables` to match exactly — this is expected first-time friction with `MockedProvider` and is the reason this step exists before declaring victory.

- [ ] **Step 6: Fix forward until green**

Iterate on either the test mocks or (if a genuine bug) the component until all 4 tests pass. Do not weaken assertions to force a pass — if `$15.00` isn't rendering, find out why (wrong currency formatting locale, wrong field name, etc.) rather than changing the assertion to match incorrect output.

Run: `npx vitest run src/features/dashboard-insights/dashboard-insights-page-inner.test.tsx`

Expected: `PASS`, 4 tests.

- [ ] **Step 7: Run the full suite one final time**

Run: `npm run typecheck && npm test`

Expected: no type errors; all test files pass except the 4 pre-existing unrelated `permissions.test.ts` failures noted at the start of this work.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json vite.config.mjs src/test/setup.ts src/features/dashboard-insights/dashboard-insights-page-inner.test.tsx
git commit -m "test: add component-render test infra and Insights page tests"
```
