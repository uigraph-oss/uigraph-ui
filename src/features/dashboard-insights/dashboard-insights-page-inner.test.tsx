import { useAuthStore } from '@/store/auth-store'
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { render, screen, waitFor } from '@testing-library/react'
import type { DocumentNode } from 'graphql'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
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

function emptyListMock(query: DocumentNode, field: string): MockedResponse {
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
    organizations: [
      { id: ORG_ID, name: 'Test Org', role: 'OWNER', logoUrl: null } as never,
    ],
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
