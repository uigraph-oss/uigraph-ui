// Mock GraphQL data registry. There is no real backend in this build, so the
// Apollo link (see ../apollo-client.ts) resolves every operation from here,
// keyed by operation name. Unregistered operations fall back to `{}` — enrich
// this file per feature as needed (a console warning lists the missing names).

type MockResolver = (
  variables: Record<string, unknown>
) => Record<string, unknown>

const mockOrg = {
  __typename: 'Organization',
  name: 'Mock Organization',
  organizationId: 'mock-org-id',
  logoImgId: null,
  owner: 'mock-user-id',
  domain: 'mock.uigraph.app',
  domainSlug: 'hello-kduf',
  isActive: true,
  allowDomainJoin: true,
}

const mockAccount = {
  __typename: 'Account',
  accountId: 'mock-user-id',
  accountInfo: {
    __typename: 'AccountInfo',
    firstName: 'Mock',
    lastName: 'User',
    email: 'mock@example.com',
    image: null,
    imageUrl: null,
    dateOfBirth: null,
  },
}

export const mockResolvers: Record<string, MockResolver> = {
  GetMyAccount: () => ({ GetMyAccount: mockAccount }),

  GetInitialOrganizationsByRoleAndUser: () => ({
    GetMyAccount: mockAccount,
    GetOrganizations: [mockOrg],
  }),

  GetOrganizationsByRole: () => ({ GetOrganizations: [mockOrg] }),

  GetOrganizationBySubdomain: () => ({ GetOrganizationBySubdomain: mockOrg }),

  VerifyOrgDomain: () => ({ VerifyOrgDomain: true }),
}

const warned = new Set<string>()

export function resolveMock(
  operationName: string | undefined,
  variables: Record<string, unknown>
): Record<string, unknown> {
  if (operationName && mockResolvers[operationName]) {
    return mockResolvers[operationName](variables)
  }

  if (operationName && !warned.has(operationName)) {
    warned.add(operationName)
    console.warn(
      `[mock] no fixture for operation "${operationName}" — returning {}`
    )
  }

  return {}
}
