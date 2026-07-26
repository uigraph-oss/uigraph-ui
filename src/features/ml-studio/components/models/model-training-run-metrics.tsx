'use client'

import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { format, formatDistanceToNow } from 'date-fns'
import { ML_VERSION_EVALUATIONS } from '../../api/evaluations'
import { useModelContext } from '../../contexts/model-context'
import { formatMetric } from '../../format'
import { MlUser } from '../ml-user'
import { Panel } from '../panel'

export function ModelTrainingRunMetrics({
  onOpenTab,
}: {
  onOpenTab: (tab: string) => void
}) {
  const { selectedVersion, selectedRun, selectedRunExperiment, versions } =
    useModelContext()
  const orgId = useCurrentOrganization()?.id

  const evaluationsQuery = useQuery(ML_VERSION_EVALUATIONS, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId || !selectedVersion?.id,
    variables: { orgId: orgId!, versionId: selectedVersion?.id ?? '' },
  })

  const evaluationCount =
    evaluationsQuery.data?.mlVersionEvaluations?.length ?? 0
  const scalars = Object.entries(selectedRun?.metrics ?? {})

  return (
    <Panel>
      <div className="flex items-start justify-between gap-8">
        <div>
          <h3 className="font-semibold text-[#F4F7FC]">Metrics</h3>
          <p className="mt-0.5 text-sm text-[#828DA3]">
            {`Final metrics from the training run ${selectedRun?.name ?? ''}.`}
          </p>
        </div>

        <div
          className="flex items-center gap-1.5 text-sm text-[#586378]"
          title={
            selectedRun?.startedAt
              ? format(new Date(selectedRun.startedAt), 'PP pp')
              : undefined
          }
        >
          <span>Trained by</span>
          <MlUser identifier={selectedRunExperiment?.createdBy} />
          {selectedRun?.startedAt && (
            <span>
              ,{' '}
              {formatDistanceToNow(new Date(selectedRun.startedAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
      </div>

      {scalars.length > 0 ? (
        <div className="mt-3 grid grid-cols-3 gap-x-8 gap-y-7">
          {scalars.map(([key, value]) => (
            <div key={key}>
              <div className="text-2xl font-bold text-[#F4F7FC]">
                {formatMetric(value)}
              </div>
              <div className="mt-1 text-xs tracking-wide text-[#586378] uppercase">
                {key.replace(/_/g, ' ')}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-[#586378]">
          No training run metrics recorded for this version.
        </p>
      )}

      <div className="border-stock mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 border-t pt-4 text-sm text-[#586378]">
        <span>
          These are the final metrics recorded when this version was trained. To
          see how it holds up afterwards, open the
        </span>
        <button
          type="button"
          onClick={() => onOpenTab('evaluations')}
          className="text-[#3B6BFF] hover:underline"
        >
          {evaluationCount === 1
            ? '1 evaluation run'
            : `${evaluationCount} evaluation runs`}
        </button>
        <span>of this version, or compare it against the</span>
        <button
          type="button"
          onClick={() => onOpenTab('versions')}
          className="text-[#3B6BFF] hover:underline"
        >
          {versions.length === 1 ? '1 version' : `${versions.length} versions`}
        </button>
        <span>of this model.</span>
      </div>
    </Panel>
  )
}
