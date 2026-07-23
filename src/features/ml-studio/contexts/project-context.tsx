'use client'

import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import { ML_STUDIO_PROJECT } from '../api/ml-studio'
import type { Project } from '../types'

export const [ProjectProvider, useProject] = createContext(
  ({ projectId }: { projectId: string }) => {
    const orgId = useCurrentOrganization()?.id

    const { data, loading, error } = useQuery(ML_STUDIO_PROJECT, {
      fetchPolicy: 'cache-and-network',
      skip: !orgId || !projectId,
      variables: { orgId: orgId!, id: projectId },
    })

    const project: Project | undefined = useMemo(() => {
      const p = data?.mlProject
      if (!p) {
        return undefined
      }
      return {
        id: p.id,
        name: p.name,
        type: p.type as Project['type'],
        description: p.description,
        sourceType: p.sourceType,
        sourceUrl: p.sourceUrl,
        teamId: p.teamId ?? null,
      }
    }, [data?.mlProject])

    return { orgId, projectId, project, loading, error }
  }
)
