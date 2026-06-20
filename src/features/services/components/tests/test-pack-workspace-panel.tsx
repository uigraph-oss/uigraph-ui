'use client'

import type { TestCase } from '@/api/.gql/graphql'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { BetterTabController, useBetterTabs } from '@/hooks/use-better-tabs'
import { Info, Play, Plus } from 'lucide-react'
import { useState } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import { useServiceTestsContext } from '../context/service-tests-context'
import { ConfigureTestCaseModal } from './modals/configure-test-case-modal'
import { transformToCreateTestCase } from './modals/configure-test-case-modal/transformers'
import { TestCaseList } from './test-case-list'
import { TestRunHistoryTable } from './test-run-history-table'

type TestPackWorkspacePanelProps = {
  onAddTestCase?: () => void
  onRunPack?: () => void
  onViewTestCase?: (testCase: TestCase) => void
}

export function TestPackWorkspacePanel({
  onAddTestCase,
  onRunPack,
  onViewTestCase,
}: TestPackWorkspacePanelProps) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [searchParams] = useSearchParams()
  const {
    orgId,
    serviceId,
    selectedPackId,
    selectedPack,
    testPacks,
    testCases,
    isTestCasesLoading,
    createTestCaseMutation,
  } = useServiceTestsContext()

  const [isCreateTestPackOpen, setIsCreateTestPackOpen] = useState(false)
  const activeTab = searchParams.get('tab') === 'runs' ? 'runs' : 'cases'

  const [baseControl] = useBetterTabs(
    [
      { id: 'cases', label: 'Cases' },
      { id: 'runs', label: 'Runs' },
    ],
    activeTab
  )

  function handleTabChange(nextTab: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (nextTab === 'runs') {
      params.set('tab', 'runs')
    } else {
      params.delete('tab')
    }

    const nextUrl = params.toString()
      ? `${pathname}?${params.toString()}`
      : pathname
    void navigate(nextUrl, { replace: true })
  }

  const control = {
    ...baseControl,
    activeTab,
    setActiveTab: handleTabChange,
  }

  const hasPacks = testPacks.length > 0

  if (!selectedPackId || !selectedPack) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground text-center text-sm">
          {hasPacks
            ? 'Select a test pack to view test cases and test runs.'
            : 'Test packs will appear here once created.'}
        </p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="border-border border-b bg-white pt-1">
        <BetterTabController
          control={control}
          className="m-0 mb-[-1px] rounded-none border-transparent bg-transparent p-0"
          overlayClassName="h-[2px] top-auto bottom-0 bg-primary"
          triggerClassName="text-sm h-9 px-5"
          activeTriggerClassName="text-foreground border-primary"
        />
      </div>

      <BetterDialogProvider
        open={isCreateTestPackOpen}
        onOpenChange={setIsCreateTestPackOpen}
      >
        <ConfigureTestCaseModal
          mode="create"
          onSubmit={async (data) => {
            await createTestCaseMutation({
              variables: {
                orgId: orgId!,
                serviceId,
                input: {
                  order: 0,
                  testPackId: selectedPackId!,
                  ...transformToCreateTestCase(data),
                },
              },
            })

            toast.success('Test case created successfully')
            setIsCreateTestPackOpen(false)
          }}
        />
      </BetterDialogProvider>

      <div className="border-border border-b bg-white px-4 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold">
                {activeTab === 'cases' ? 'Test cases' : 'Test runs'}
              </h3>
              {activeTab === 'cases' && (
                <Badge variant="secondary">{testCases.length}</Badge>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground focus-visible:ring-ring rounded-full p-0.5 transition-colors focus:outline-none focus-visible:ring-2"
                  >
                    <Info className="h-4 w-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  {activeTab === 'cases'
                    ? 'Test cases define what to verify. Drag to change execution order.'
                    : 'Each run records results for all test cases in this pack.'}
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="text-muted-foreground mt-1.5 text-sm">
              {activeTab === 'cases'
                ? 'Add and manage test cases in this pack. Drag to reorder.'
                : 'View test run history and results for this pack.'}
            </p>
          </div>
          <div className="shrink-0">
            {activeTab === 'cases' && (
              <Button
                preset="primary"
                onClick={() => setIsCreateTestPackOpen(true)}
              >
                <Plus className="h-4 w-4" />
                Add Test Case
              </Button>
            )}

            {activeTab === 'runs' && onRunPack && (
              <Button preset="primary" onClick={onRunPack}>
                <Play className="h-4 w-4" />
                Run Pack
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-4">
        {activeTab === 'cases' ? (
          isTestCasesLoading ? (
            <div className="flex h-full items-center justify-center">
              <SectionLoader label="Loading test cases..." />
            </div>
          ) : testCases.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex flex-col gap-2">
                <p className="text-foreground text-sm font-semibold">
                  No test cases yet
                </p>
                <p className="text-muted-foreground text-sm">
                  Add your first manual or API-linked test case.
                </p>
              </div>
              {onAddTestCase && (
                <Button preset="primary" onClick={onAddTestCase}>
                  <Plus className="h-4 w-4" />
                  Add Test Case
                </Button>
              )}
            </div>
          ) : (
            <div className="border-border rounded-2xl border bg-white p-4">
              <TestCaseList onView={onViewTestCase} />
            </div>
          )
        ) : (
          <TestRunHistoryTable testPackId={selectedPackId} />
        )}
      </div>
    </div>
  )
}
