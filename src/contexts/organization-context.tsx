'use client'

import { GET_INITIAL_ORGANIZATIONS } from '@/api'
import { env } from '@/env'
import { getClientSubdomain } from '@/utils/subdomain.client'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useMemo } from 'react'

export const [OrganizationProvider, useOrganizationContext] = createContext(
  ({ subdomain }: { subdomain: string | null }) => {
    const { loading, data } = useQuery(GET_INITIAL_ORGANIZATIONS, {
      errorPolicy: 'ignore',
      fetchPolicy: 'cache-first',
    })

    const account = useMemo(
      () => ({
        ...data?.GetMyAccount?.accountInfo,
        userId: data?.GetMyAccount?.accountId as string,
      }),
      [data?.GetMyAccount?.accountId, data?.GetMyAccount?.accountInfo]
    )

    const organizations = useMemo(() => {
      return arrayNonNullable(data?.GetOrganizations)
    }, [data?.GetOrganizations])

    const organization = useMemo(() => {
      const slug = subdomain ?? getClientSubdomain()
      if (!env.bypassDomainCheck && !slug) return null

      let organization = organizations.find((org) => org?.domainSlug === slug)
      if (env.bypassDomainCheck) {
        organization ??= organizations[0]
      }

      if (!organization) return null
      return {
        ...organization,
        organizationId: organization?.organizationId as string,
      }
    }, [organizations, subdomain])

    return {
      account,
      accountId: account.userId,

      organization,
      organizations,
      organizationId: organization?.organizationId as string,

      isLoading: loading && (!data?.GetMyAccount || !data?.GetOrganizations),
    }
  }
)
