'use client'

import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { TEST_RUN, UPDATE_TEST_PACK } from '../../api/tests'
import { useServiceContext } from '../../contexts/service-context'
import { LoadRunResultsView } from './load-run-results-view'
import { RunDetailsView } from './run-details-view'

export function TestRunDetailsPage() {
  const params = useParams() as {
    serviceId?: string | string[]
    testRunId?: string | string[]
  }
  const navigate = useNavigate()
  const { serviceId } = useServiceContext()
  const orgId = useCurrentOrganization().id
  const [updateTestPack] = useMutation(UPDATE_TEST_PACK)

  async function pinBaselineRun(testPackId: string, testRunId: string) {
    try {
      await updateTestPack({
        variables: {
          orgId: orgId!,
          serviceId,
          id: testPackId,
          input: { baselineRunId: testRunId },
        },
      })
      toast.success('Pinned as baseline')
    } catch (error) {
      toast.error('Failed to pin baseline')
      console.error(error)
      throw error
    }
  }

  const testRunId =
    typeof params.testRunId === 'string'
      ? params.testRunId
      : Array.isArray(params.testRunId)
        ? params.testRunId[0]
        : undefined

  const { data, loading } = useQuery(TEST_RUN, {
    variables: { orgId: orgId!, serviceId, id: testRunId ?? '' },
    skip: !orgId || !serviceId || !testRunId,
  })

  const testRun = data?.testRun

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <SectionLoader label="Loading test run..." />
      </div>
    )
  }

  if (!testRun) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-foreground text-sm font-semibold">
            Test run not found
          </p>
          <p className="text-muted-foreground mt-1 text-sm">
            The test run you&apos;re looking for doesn&apos;t exist or has been
            deleted.
          </p>
          <Button
            variant="secondary"
            className="mt-4"
            onClick={() => navigate(-1)}
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (testRun.loadMetrics) {
    return (
      <LoadRunResultsView
        testRun={testRun}
        serviceId={serviceId ?? ''}
        onPinBaseline={pinBaselineRun}
      />
    )
  }

  return (
    <RunDetailsView
      testRunId={testRunId ?? ''}
      testPackId={testRun.testPackId ?? null}
      serviceId={serviceId}
    />
  )
}
