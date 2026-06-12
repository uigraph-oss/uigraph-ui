'use client'

import { SectionLoader } from '@/components/section-loader'
import { useOrganizationContext } from '@/contexts'
import { DashboardPageLayout } from '@/features/dashboard/dashboard-layout'
import { DashboardSectionHeader } from '@/features/dashboard/dashboard-section'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import {
  CREATE_PAGE,
  DELETE_PAGE,
  GET_PROJECT_AND_PAGES,
  UPDATE_PAGE,
} from '../api'

export const [SingleProjectProvider, useSingleProject] = createContext(
  () => {
    const { organizationId } = useOrganizationContext()
    const { projectSlug } = useParams() as { projectSlug: string }

    const { data, loading } = useQuery(GET_PROJECT_AND_PAGES, {
      variables: { projectId: projectSlug, organizationId },
      fetchPolicy: 'cache-and-network',
    })

    const [createPage, { loading: isCreatingPage }] = useMutation(CREATE_PAGE, {
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: GET_PROJECT_AND_PAGES,
          variables: { projectId: projectSlug, organizationId },
        },
      ],
    })

    const [deletePage, { loading: isPageDeleting }] = useMutation(DELETE_PAGE, {
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: GET_PROJECT_AND_PAGES,
          variables: { projectId: projectSlug, organizationId },
        },
      ],
    })

    const [updatePage, { loading: isPageUpdating }] = useMutation(UPDATE_PAGE, {
      awaitRefetchQueries: true,
      refetchQueries: [
        {
          query: GET_PROJECT_AND_PAGES,
          variables: { projectId: projectSlug, organizationId },
        },
      ],
    })

    return {
      loading: loading && !data?.v1GetProject,
      project: useMemo(
        () => arrayNonNullable(data?.v1GetProject)[0],
        [data?.v1GetProject]
      ),
      pages: useMemo(
        () => arrayNonNullable(data?.v1GetPage),
        [data?.v1GetPage]
      ),

      projectSlug,

      createPage,
      deletePage,
      updatePage,

      isCreatingPage,
      isPageDeleting,
      isPageUpdating,
    }
  },
  {
    useChildrenProvider(children, value) {
      if (!value.loading && value.project) return children

      return (
        <DashboardPageLayout
          crumbs={[{ to: '/dashboard/maps', label: 'Maps' }]}
        >
          <DashboardSectionHeader
            title="Frames"
            description="Manage and organize all frames within this map. Create, edit, and collaborate on individual frames."
          />

          {value.loading && <SectionLoader />}

          {!value.loading && !value.project && (
            <div className="flex h-[400px] w-full items-center justify-center">
              <p className="text-gray-500">No map found</p>
            </div>
          )}
        </DashboardPageLayout>
      )
    },
  }
)
