import { SettingsIcon, UserIcon, UserListIcon } from '@/assets/svgs'
import { env } from '@/env'
import { generateNavItems } from '@/utils/nav-items'
import { RoboticIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { ReactNode } from 'react'
import { AiOutlineTeam } from 'react-icons/ai'
import {
  GoGitCompare,
  GoGraph,
  GoOrganization,
  GoProject,
  GoProjectTemplate,
  GoStack,
} from 'react-icons/go'
import { LuBot, LuFingerprint, LuServer } from 'react-icons/lu'

type NavLinkMeta = {
  icon: ReactNode
  disabled?: boolean | string
  adminOnly?: boolean
}

export const DASHBOARD_NAV_LINKS = generateNavItems<NavLinkMeta>(
  {
    id: '/dashboard/diagrams',
    label: 'Diagrams',
    icon: <GoGitCompare />,
    nested: true,
  },
  {
    id: '/services',
    label: 'Services',
    icon: <GoStack />,
    nested: true,
  },
  {
    id: '/dashboard/maps',
    label: 'Maps',
    icon: <GoProject />,
    nested: true,
  },
  {
    id: '/dashboard/components',
    label: 'Components',
    icon: <GoProjectTemplate />,
    nested: true,
  },
  {
    id: '/dashboard/ai',
    label: 'Assist',
    icon: <HugeiconsIcon icon={RoboticIcon} size={30} strokeWidth={1} />,
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
    label: 'Server',
    icon: <LuServer />,
    nested: true,
  }
)

export const SERVER_NAV_LINKS = generateNavItems<NavLinkMeta>(
  {
    id: '/server/overview',
    label: 'Overview',
    icon: <GoGraph />,
  },
  {
    id: '/server/users',
    label: 'Users',
    icon: <UserListIcon />,
  },
  {
    id: '/server/sso',
    label: 'SSO',
    icon: <LuFingerprint />,
  }
)

export const DASHBOARD_SETTINGS_NAV_LINKS = generateNavItems<NavLinkMeta>(
  {
    id: '/settings/profile',
    label: 'Profile',
    icon: <UserIcon />,
  },
  {
    id: '/settings/organization',
    label: 'Organization',
    icon: <GoOrganization />,
    adminOnly: true,
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
    id: '/settings/sso',
    label: 'SSO Settings',
    icon: <LuFingerprint />,
    hidden: !env.features.ssoEnabled,
    adminOnly: true,
  }
  /* {
    id: '/settings/security',
    label: 'Security',
    icon: <BsShieldLock />,
  } */
)
