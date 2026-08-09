import { SettingsIcon, UserIcon, UserListIcon } from '@/assets/svgs'
import { generateNavItems } from '@/utils/nav-items'
import { ReactNode } from 'react'
import { AiOutlineTeam } from 'react-icons/ai'
import {
  GoBeaker,
  GoGitCompare,
  GoGraph,
  GoOrganization,
  GoProject,
  GoProjectTemplate,
  GoShieldLock,
  GoStack,
} from 'react-icons/go'
import { HiOutlineDocumentText } from 'react-icons/hi2'
import { LuBot, LuCloud, LuFingerprint } from 'react-icons/lu'

type NavLinkMeta = {
  icon: ReactNode
  disabled?: boolean | string
  adminOnly?: boolean
  serverAdminOnly?: boolean
}

export const DASHBOARD_NAV_LINKS = generateNavItems<NavLinkMeta>(
  {
    id: '/dashboard/diagrams',
    label: 'Diagrams',
    icon: <GoGitCompare />,
    nested: true,
  },
  {
    id: '/dashboard/docs',
    label: 'Docs',
    icon: <HiOutlineDocumentText />,
    nested: true,
  },
  {
    id: '/services',
    label: 'Services',
    icon: <GoStack />,
    nested: true,
  },
  {
    id: '/dashboard/ml-studio',
    label: 'ML Studio',
    icon: <GoBeaker />,
    nested: true,
  },
  {
    id: '/dashboard/maps',
    label: 'Maps',
    icon: <GoProject />,
    nested: true,
  },
  {
    id: '/dashboard/insights',
    label: 'Insights',
    icon: <GoGraph />,
    nested: true,
  },
  {
    id: '/dashboard/ai',
    label: 'Assist',
    icon: (
      <svg
        width="1.15em"
        height="1.15em"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M0 0h24v24H0z" fill="none" />
        <path
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.25"
          d="M9 11v2m6-2v2m-2-9H7a4 4 0 0 0-4 4v12h14a4 4 0 0 0 4-4v-4M20 2l.13.378a4 4 0 0 0 2.492 2.493L23 5l-.378.13a4 4 0 0 0-2.493 2.492L20 8l-.13-.378a4 4 0 0 0-2.492-2.493L17 5l.378-.13a4 4 0 0 0 2.493-2.492z"
        />
      </svg>
    ),
    nested: true,
  },
  {
    id: '/dashboard/catalog',
    label: 'Catalog',
    icon: <GoProjectTemplate />,
    nested: true,
  },
  {
    id: '/settings',
    label: 'Settings',
    icon: <SettingsIcon />,
    nested: true,
  },
  {
    id: '/server',
    label: 'Admin',
    icon: <GoShieldLock />,
    nested: true,
    serverAdminOnly: true,
  }
)

export const SERVER_NAV_LINKS = generateNavItems<NavLinkMeta>(
  {
    id: '/server/overview',
    label: 'Overview',
    icon: <GoGraph />,
  },
  {
    id: '/server/orgs',
    label: 'Organizations',
    icon: <GoOrganization />,
  },
  {
    id: '/server/users',
    label: 'Users',
    icon: <UserListIcon />,
  }
)

export const DASHBOARD_SETTINGS_NAV_LINKS = generateNavItems<NavLinkMeta>(
  {
    id: '/settings/profile',
    label: 'Profile',
    icon: <UserIcon />,
  },
  {
    id: '/settings/teams',
    label: 'Teams',
    icon: <AiOutlineTeam />,
    adminOnly: true,
  },
  {
    id: '/settings/users',
    label: 'Users',
    icon: <UserListIcon />,
    adminOnly: true,
  },
  {
    id: '/settings/service-accounts',
    label: 'Service Accounts',
    icon: <LuBot />,
    adminOnly: true,
  },
  {
    id: '/settings/cloud-connections',
    label: 'Cloud Connections',
    icon: <LuCloud />,
    adminOnly: true,
  },
  {
    id: '/settings/authentication',
    label: 'Authentication',
    icon: <LuFingerprint />,
    adminOnly: true,
  }
  /* {
    id: '/settings/security',
    label: 'Security',
    icon: <BsShieldLock />,
  } */
)
