'use client'

import { GT } from '@/api'
import { CrossButton } from '@/components/cross-button'
import { Badge } from '@/components/ui/badge'

type TestInspectorHeaderProps = {
  testCase: GT.TestCase
  onClose: () => void
}

export function TestInspectorHeader({
  testCase,
  onClose,
}: TestInspectorHeaderProps) {
  const isApi = testCase.type?.toLowerCase() === 'api'
  const isManual = testCase.type?.toLowerCase() === 'manual'

  return (
    <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-gray-900">
          {testCase.title ?? 'Untitled'}
        </h2>
        {testCase.type && (
          <Badge
            variant={isApi ? 'default' : 'secondary'}
            className="px-2 py-0.5 text-xs font-medium"
          >
            {testCase.type.toUpperCase()}
          </Badge>
        )}
        {isManual && testCase.evidenceRequired && (
          <Badge variant="outline" className="px-2 py-0.5 text-xs font-medium">
            Requires Evidence
          </Badge>
        )}
        {testCase.isCritical && (
          <Badge
            variant="destructive"
            className="px-2 py-0.5 text-xs font-medium"
          >
            Critical
          </Badge>
        )}
      </div>

      <CrossButton onClick={onClose} className="size-8 shrink-0" />
    </div>
  )
}
