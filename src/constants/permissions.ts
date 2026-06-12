import {
  PermissionManager,
  PermissionManagerEntities,
  PermissionManagerRoles,
} from '@/lib/permissions'

export type PermissionRoles = 'admin' | 'editor' | 'viewer'

export const PERMISSIONS = new PermissionManager(
  ['admin', 'editor', 'viewer'],
  {
    project: {
      create: ['admin', 'editor'],
      edit: ['admin', 'editor'],
      delete: ['admin'],
      view: ['admin', 'editor', 'viewer'],
    },
  }
)

export type PermissionsRoles = PermissionManagerRoles<typeof PERMISSIONS>
export type PermissionsEntities = PermissionManagerEntities<typeof PERMISSIONS>
