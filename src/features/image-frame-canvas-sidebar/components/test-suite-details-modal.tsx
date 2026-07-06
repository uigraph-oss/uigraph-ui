import { BetterDialogContent } from '@/components/better-dialog'
import { TEST_CASES } from '@/features/services/api/tests'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { formatDistanceToNowStrict } from 'date-fns'
import { Loader2 } from 'lucide-react'
import { TEST_PACK_BY_ID } from '../api/component-link-nav'

type TestSuiteDetailsModalProps = {
  orgId: string
  testPackId: string
}

export function TestSuiteDetailsModal({
  orgId,
  testPackId,
}: TestSuiteDetailsModalProps) {
  const { data, loading } = useQuery(TEST_PACK_BY_ID, {
    variables: { orgId, id: testPackId },
    fetchPolicy: 'cache-first',
  })

  const testPack = data?.testPackById

  const { data: casesData, loading: casesLoading } = useQuery(TEST_CASES, {
    variables: {
      orgId,
      serviceId: testPack?.serviceId ?? '',
      testPackId,
    },
    fetchPolicy: 'cache-first',
    skip: !testPack,
  })

  if (loading) {
    return (
      <BetterDialogContent title="Test Suite">
        <div className="flex items-center gap-2 py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-paragraph text-sm">Loading test suite...</span>
        </div>
      </BetterDialogContent>
    )
  }

  if (!testPack) {
    return (
      <BetterDialogContent title="Test Suite">
        <div className="text-paragraph py-6 text-sm">Test suite not found.</div>
      </BetterDialogContent>
    )
  }

  const testCases = arrayNonNullable(casesData?.testCases)

  const updatedLabel = testPack.updatedAt
    ? formatDistanceToNowStrict(new Date(testPack.updatedAt), {
        addSuffix: true,
      })
    : null

  return (
    <BetterDialogContent
      title={testPack.name?.trim() || 'Test Suite'}
      description={
        updatedLabel ? (
          <span className="text-paragraph text-xs">Updated {updatedLabel}</span>
        ) : null
      }
      footerCancel="Close"
      footerSubmit="Open Test Suite"
      footerAlign="between"
      onFooterSubmitClick={() =>
        window.open(
          `/services/${testPack.serviceId}/tests?packId=${testPack.testPackId}`
        )
      }
    >
      <div className="flex flex-wrap items-center gap-1.5">
        {testPack.type?.trim() && (
          <span className="bg-primary/15 text-primary rounded-md px-2 py-1 text-xs font-medium">
            {testPack.type}
          </span>
        )}

        <span className="rounded-md bg-[#1E2533] px-2 py-1 text-xs font-medium text-[#828DA3]">
          {testCases.length} test case{testCases.length === 1 ? '' : 's'}
        </span>
      </div>

      {casesLoading && (
        <div className="flex items-center gap-2 py-6">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-paragraph text-sm">Loading test cases...</span>
        </div>
      )}

      {!casesLoading && testCases.length === 0 && (
        <p className="text-paragraph mt-4 text-sm">
          No test cases in this suite yet.
        </p>
      )}

      {!casesLoading && testCases.length > 0 && (
        <div className="mt-4 space-y-2">
          {testCases.map((testCase) => (
            <div
              key={testCase.testCaseId}
              className="rounded-lg border border-[#2A3242] bg-[#1E2533] px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-foreground min-w-0 truncate text-sm font-medium">
                  {testCase.title}
                </span>

                <span className="text-paragraph shrink-0 rounded-md bg-[#0F1420] px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase">
                  {testCase.type}
                </span>
              </div>

              {testCase.description?.trim() && (
                <p className="text-paragraph mt-1 line-clamp-2 text-xs">
                  {testCase.description}
                </p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {testCase.priority?.trim() && (
                  <span className="rounded bg-[#0F1420] px-1.5 py-0.5 text-[10px] text-[#828DA3]">
                    {testCase.priority}
                  </span>
                )}

                {testCase.status?.trim() && (
                  <span className="rounded bg-[#0F1420] px-1.5 py-0.5 text-[10px] text-[#828DA3]">
                    {testCase.status}
                  </span>
                )}

                {testCase.isCritical && (
                  <span className="text-destructive bg-destructive/10 rounded px-1.5 py-0.5 text-[10px]">
                    Critical
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </BetterDialogContent>
  )
}
