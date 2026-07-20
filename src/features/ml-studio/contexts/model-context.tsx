'use client'

import { createContext } from 'daily-code/react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { mockModels, mockVersions } from '../constants/mock-data'

export const [ModelContextProvider, useModelContext] = createContext(
  ({ modelId }: { modelId: string }) => {
    const model = mockModels.find((m) => m.id === modelId)

    const versions = useMemo(
      () => mockVersions.filter((v) => v.modelId === modelId),
      [modelId]
    )

    const defaultVersionId = model?.productionVersionId || versions[0]?.id || ''

    const [versionParam, setVersionId] = useQueryState('v', parseAsString)
    const selectedVersionId =
      versionParam && versions.some((v) => v.id === versionParam)
        ? versionParam
        : defaultVersionId

    const selectedVersion = versions.find((v) => v.id === selectedVersionId)

    return {
      model: model!,
      modelId,
      versions,
      selectedVersionId,
      selectedVersion,
      setVersionId,
    }
  }
)
