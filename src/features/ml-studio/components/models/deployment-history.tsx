'use client'

import { useQuery } from '@apollo/client'
import { format, formatDistanceToNow } from 'date-fns'
import { ML_VERSION_DEPLOYMENT_UPDATES } from '../../api/ml-studio'
import { useMlStudioData } from '../../contexts/ml-studio-data-context'
import { MlUser } from '../ml-user'
import { Panel } from '../panel'
import { StatusBadge } from '../status-badge'

export function DeploymentHistory({ versionId }: { versionId: string }) {
  const { orgId } = useMlStudioData()
  const { data } = useQuery(ML_VERSION_DEPLOYMENT_UPDATES, {
    fetchPolicy: 'cache-and-network',
    skip: !orgId,
    variables: { orgId: orgId!, versionId },
  })

  const updates = data?.mlVersionDeploymentUpdates ?? []

  return (
    <Panel title="Deployment history" className="md:col-span-2">
      {updates.length > 0 ? (
        <ol className="flex flex-col gap-4">
          {updates.map((u) => (
            <li key={u.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                {u.fromStatus ? (
                  <>
                    <StatusBadge value={u.fromStatus} />
                    <span className="text-[#586378]">→</span>
                  </>
                ) : null}
                <StatusBadge value={u.toStatus} />
              </div>
              <span className="flex items-center gap-1.5 text-sm text-[#828DA3]">
                by <MlUser identifier={u.changedBy} />
              </span>
              {u.changedAt && (
                <span
                  className="ml-auto text-xs text-[#586378]"
                  title={format(new Date(u.changedAt), 'PPpp')}
                >
                  {formatDistanceToNow(new Date(u.changedAt), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-sm text-[#586378]">
          No deployment changes recorded.
        </p>
      )}
    </Panel>
  )
}
