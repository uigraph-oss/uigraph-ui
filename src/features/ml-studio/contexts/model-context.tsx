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
      () =>
        allVersions
          .filter((v) => v.modelId === modelId)
          .sort((a, b) => Number(b.version) - Number(a.version)),
      [allVersions, modelId]
    )

    const latestVersion = useMemo(
      () =>
        versions.reduce<(typeof versions)[number] | undefined>(
          (latest, v) =>
            !latest || Number(v.version) > Number(latest.version) ? v : latest,
          undefined
        ),
      [versions]
    )

    const defaultVersionId = latestVersion?.id || ''

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
      latestVersionId: latestVersion?.id,
      selectedVersionId,
      selectedVersion,
      setVersionId,
    }
  }
)
