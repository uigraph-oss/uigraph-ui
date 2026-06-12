export * from './utils'

export interface MyAccountInfo {
  firstName: string
  lastName: string
  email: string
}

export interface PageProfile {
  id: string
  name: string
  description: string
  icon: string
  color: string
  tags: string[]
}

export interface Team {
  id: string
  name: string
  memberCount: number
}

export interface TUserDetails {
  name?: string
  email?: string
  pic?: string
  token?: string
  userId: string
  sub: string
  loginProvider?: string | undefined | null
}

export interface User {
  deletedAt: string
  email?: string
  isActive: boolean
  joinedAt: string
  organizationId: string
  role: string
  status: string
  userId: string
}

export interface OrganizationInfo {
  name?: string
  organizationId?: string
  logoImgId?: string
  owner?: string
  domain?: string
  domainSlug?: string
  isActive?: boolean
  allowDomainJoin?: boolean
}
