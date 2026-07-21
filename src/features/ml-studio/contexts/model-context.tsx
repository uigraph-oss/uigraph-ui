'use client'

import { createContext } from 'daily-code/react'
import { parseAsString, useQueryState } from 'nuqs'
import { useMemo } from 'react'
import { useMlStudioData } from './ml-studio-data-context'

export const [ModelContextProvider, useModelContext] = createContext(
  ({ modelId }: { modelId: string }) => {
    const { models, versions: allVersions } = useMlStudioData()
    const model = models.find((m) => m.id === modelId)

    const versions = useMemo(
      () => allVersions.filter((v) => v.modelId === modelId),
      [allVersions, modelId]
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
