# Cost Savings Insights Dashboard — Design

## Purpose

Add an "Insights" tab to the dashboard that shows organizations how much money and tokens they've saved by using Claude/Cursor with the uigraph MCP server, instead of having the agent read raw files/specs directly. The numbers need to support a license-renewal/ROI narrative ("this tool is paying for itself"), not just be an internal engineering metric.

## Background

`uigraph-mcp` already instruments all 13 of its tool calls and reports `tokensServed`, `tokensRawEquivalent`, and `tokensSaved` (= raw equivalent − served) per call to `uigraph-api`, which stores them in `mcp_usage_events` and prices them against the `llm_models` pricing catalog. A `GET /mcp/savings/summary` endpoint already exists but returns a single aggregate object for one period and one model — no time series, no breakdowns, and `model_id` is currently a required param (defaults to `claude-sonnet-4-6`), so it can't show blended usage across multiple models.

The frontend (`uigraph-ui`) talks to the backend exclusively through a GraphQL gateway (`uigraph-graphql`), which is a thin REST-proxy (gqlgen schema → REST client call → resolver, no direct DB access). That gateway has no schema/resolvers for this cost data yet. This feature therefore spans three repos: `uigraph-api` (new aggregation queries), `uigraph-graphql` (new GraphQL query layer), and `uigraph-ui` (the Insights tab itself).

## Goals

- Show org-wide cost/token savings from MCP usage, blended across all models by default, filterable to one model
- Daily trend chart over a selectable period (`1d | 7d | 30d | 1y`)
- Breakdowns by MCP tool, by model, and by user (leaderboard)
- Frame the numbers for a license-justification audience: projected annual savings, cost saved per active user, and a "with vs. without MCP" cost comparison
- Shareable via URL (period/model filters in query params)
- Visible to all org members (not admin-gated)

## Out of scope

- `llm_models` pricing CRUD/admin UI (already exists as a separate REST API for server admins; not part of this feature)
- Service-account-level drill-down beyond appearing as rows in the by-user breakdown
- Any change to how `uigraph-mcp` computes or reports `tokensSaved`

## Architecture

### uigraph-api

Extend `internal/store/postgres/mcp_usage.go` and `internal/api/mcpusage` with new aggregation queries, all joining `mcp_usage_events` to `llm_models` on `model_id`, same join shape as the existing `GetSavingsSummary`:

- `GET /api/v1/orgs/{orgID}/mcp/savings/timeseries?period=&model_id=` — daily buckets via `date_trunc('day', created_at)`. Returns one row per day in range: `{date, totalCalls, tokensServed, tokensSaved, costServedUsd, costRawUsd, costSavedUsd}`.
- `GET /api/v1/orgs/{orgID}/mcp/savings/by-tool?period=&model_id=` — grouped by `tool_name`: `{toolName, totalCalls, tokensSaved, costSavedUsd}`.
- `GET /api/v1/orgs/{orgID}/mcp/savings/by-model?period=` — grouped by `model_id`, joined to `llm_models.display_name`/`provider`: `{modelId, displayName, provider, totalCalls, tokensSaved, costSavedUsd}`.
- `GET /api/v1/orgs/{orgID}/mcp/savings/by-user?period=&model_id=` — grouped by `COALESCE(user_id, service_account_id)`: `{userId, serviceAccountId, totalCalls, tokensSaved, costSavedUsd}`. Both ID fields are nullable; exactly one is set per row.

**Breaking change to existing behavior (backward compatible at the param level):** `model_id` becomes optional on `/mcp/savings/summary` and all new endpoints above. Omitted = blended across all models (each event priced against its own `model_id`'s row in `llm_models`). Provided = filtered/priced to just that model, matching today's behavior exactly. If an event's `model_id` no longer has a matching row in `llm_models` (deactivated/removed), exclude it from cost sums but keep it in call/token counts.

### uigraph-graphql

New `internal/graph/schema/mcpsavings.graphqls`, following the existing `testRunsSummary` pattern (schema → `internal/uigraphapi/mcpsavings.go` REST client → `internal/graph/convert/mcpsavings.go` → resolver → wired into `resolver.go`/`server.go`):

```graphql
type SavingsSummary {
  orgId: ID!
  period: String!
  modelId: String
  totalCalls: Int!
  totalTokensServed: Int!
  totalTokensSaved: Int!
  costServedUsd: Float!
  costRawUsd: Float!
  costSavedUsd: Float!
  uniqueUsersCount: Int!
}

type DailySavings {
  date: Time!
  totalCalls: Int!
  tokensServed: Int!
  tokensSaved: Int!
  costServedUsd: Float!
  costRawUsd: Float!
  costSavedUsd: Float!
}

type ToolSavings {
  toolName: String!
  totalCalls: Int!
  tokensSaved: Int!
  costSavedUsd: Float!
}

type ModelSavings {
  modelId: String!
  displayName: String!
  provider: String!
  totalCalls: Int!
  tokensSaved: Int!
  costSavedUsd: Float!
}

type UserSavings {
  userId: ID
  serviceAccountId: ID
  displayName: String!
  totalCalls: Int!
  tokensSaved: Int!
  costSavedUsd: Float!
}

extend type Query {
  costSavingsSummary(
    orgId: ID!
    period: String
    modelId: String
  ): SavingsSummary!
  costSavingsTimeseries(
    orgId: ID!
    period: String
    modelId: String
  ): [DailySavings!]!
  costSavingsByTool(
    orgId: ID!
    period: String
    modelId: String
  ): [ToolSavings!]!
  costSavingsByModel(orgId: ID!, period: String): [ModelSavings!]!
  costSavingsByUser(
    orgId: ID!
    period: String
    modelId: String
  ): [UserSavings!]!
}
```

`UserSavings.displayName` is resolved by looking up the user (existing org-members lookup, same source Teams/Users settings pages use) or service account name; falls back to `"Service Account"` if no name is resolvable.

### uigraph-ui

- New nav entry in `src/constants/nav-links.tsx`: inserted into `DASHBOARD_NAV_LINKS`, immediately before the `/settings` entry, `id: '/dashboard/insights'`, `label: 'Insights'`, `nested: true`.
- New route in `src/router.tsx`: `/dashboard/insights` → lazy-loaded `InsightsPage`, inside the existing `DashboardLayout` route group.
- New feature folder `src/features/dashboard-insights/`:
  - `dashboard-insights-page.tsx` — page shell: header, period toggle, model filter, hero cards, comparison visual, trend chart, breakdown tabs
  - `api/insights.ts` — `COST_SAVINGS_SUMMARY`, `COST_SAVINGS_TIMESERIES`, `COST_SAVINGS_BY_TOOL`, `COST_SAVINGS_BY_MODEL`, `COST_SAVINGS_BY_USER` gql documents + `useQuery` hooks
  - `components/savings-hero-cards.tsx` — Cost Saved, Projected Annual Savings, Tokens Saved, Total Calls, Cost Saved / Active User
  - `components/savings-comparison.tsx` — "with vs. without MCP" visual (`costServedUsd` vs `costRawUsd`)
  - `components/savings-trend-chart.tsx` — recharts daily cost-saved chart from `costSavingsTimeseries`
  - `components/savings-breakdown-table.tsx` — generic ranked table (name, calls, tokens saved, $ saved, % of total), reused for tool/model/user tabs
  - `components/savings-export-button.tsx` — client-side CSV export of the currently displayed data (no new backend endpoint)
  - `components/savings-empty-state.tsx` — shown when the org has zero usage events

Period (`1d|7d|30d|1y`, default `7d`) and model filter (default: all/blended) live in URL search params so a filtered view is linkable.

## Data flow

1. Page loads → reads `period`/`modelId` from URL search params.
2. Apollo fires all five queries (summary, timeseries, by-tool, by-model, by-user) in parallel — data volume per org is small (handful of tools/models, org member count), so prefetching all breakdown tabs up front avoids refetching on tab switch.
3. Each GraphQL resolver calls its REST client method → `uigraph-api` runs the SQL aggregation → JSON → converted to GraphQL model.
4. "Projected annual savings" (`costSavedUsd / periodDays * 365`) and "cost saved per active user" (`costSavedUsd / uniqueUsersCount`) are derived client-side from the summary response — no new backend field.
5. Changing period or model updates the URL params, which triggers refetch of all five queries.

## Error handling & edge cases

- Zero `mcp_usage_events` for the org → `savings-empty-state.tsx` (setup CTA + docs link) instead of a page of zeros.
- `uniqueUsersCount = 0` → render `—` for "cost saved per user" instead of dividing by zero.
- GraphQL/network error → reuse the existing query-error UI pattern from comparable pages (e.g. `dashboard-service-overview.tsx`); confirm exact component during implementation.
- Stale/deactivated `model_id` referenced by old events → excluded from cost sums, still counted in calls/tokens (handled server-side, described above).

## Testing

- **uigraph-api**: unit tests for each new aggregation query — seed events spanning multiple days/tools/models/users, assert grouped sums, including the optional/blended `model_id` behavior and the deactivated-model exclusion case.
- **uigraph-graphql**: resolver tests with a mocked REST client, matching existing resolver test conventions in the repo.
- **uigraph-ui**: vitest unit tests for the derived math (projected annual savings, cost-saved-per-user, including the zero-division guard); a render test for the page with mocked Apollo responses (loading, populated, empty, error states).
