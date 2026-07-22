import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMlStudioData } from '../contexts/ml-studio-data-context'
import { deploymentTransitions } from '../deployment-transitions'
import type { ModelVersion } from '../types'
import { StatusBadge } from './status-badge'

const dotColor: Record<string, string> = {
  production: 'bg-[#21AD6D]',
  staging: 'bg-[#3B6BFF]',
  candidate: 'bg-[#7FA0FF]',
  retired: 'bg-[#586378]',
}

export function VersionTimeline({
  versions,
  selectedVersionId,
  onSelect,
}: {
  versions: ModelVersion[]
  selectedVersionId?: string
  onSelect?: (id: string) => void
}) {
  const { orgId, createVersionDeploymentUpdate } = useMlStudioData()

  const ordered = [...versions].sort(
    (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)
  )

  return (
    <ol className="relative flex flex-col">
      {ordered.map((v, i) => (
        <li key={v.id} className="relative flex gap-4 pb-6 last:pb-0">
          <div className="flex flex-col items-center">
            <span
              className={cn(
                'z-10 mt-1 size-3 rounded-full',
                dotColor[v.deploymentStatus] || 'bg-[#586378]'
              )}
            />
            {i < ordered.length - 1 && (
              <span className="absolute top-4 h-full w-px bg-[#2A3242]" />
            )}
          </div>

          <div className="flex w-40 shrink-0 flex-col gap-1">
            {deploymentTransitions[v.deploymentStatus].map((t) => (
              <Button
                key={t.to}
                preset="outline"
                className="h-auto justify-start px-3 py-1.5 text-left text-xs"
                onClick={() =>
                  void createVersionDeploymentUpdate({
                    variables: {
                      orgId: orgId!,
                      versionId: v.id,
                      toStatus: t.to,
                    },
                  })
                }
              >
                {t.label}
              </Button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onSelect?.(v.id)}
            className={cn(
              'flex-1 rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:bg-[#1E2533]',
              selectedVersionId === v.id && 'border-[#2A3242] bg-[#1E2533]'
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-[#F4F7FC]">{v.version}</span>
              <StatusBadge value={v.deploymentStatus} />
            </div>
            <p className="mt-1 text-sm text-[#828DA3]">{v.description}</p>
            <p className="mt-1 text-xs text-[#586378]">
              {`Created ${new Date(v.createdAt).toLocaleDateString()}`}
            </p>
          </button>
        </li>
      ))}
    </ol>
  )
}
