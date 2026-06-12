import { describe, expect, it } from 'vitest'
import { PermissionManager } from './permissions'

const manager = new PermissionManager(['admin', 'editor', 'viewer'], {
  settings: {
    organization: {
      modify: ['admin'],
      view: ['admin', 'editor', 'viewer'],
    },
    users: {
      invite: ['admin', 'editor'],
      remove: ['admin'],
      view: ['admin', 'editor', 'viewer'],
    },
  },
  content: {
    create: ['admin', 'editor'],
    edit: ['admin', 'editor'],
    delete: ['admin'],
    view: ['admin', 'editor', 'viewer'],
  },
})

describe('PermissionManager', () => {
  describe('hasAccess - basic role checks', () => {
    it('should return true for admin with admin-only permission', () => {
      expect(manager.hasAccess('settings:organization:modify', 'admin')).toBe(
        true
      )
    })

    it('should return false for editor with admin-only permission', () => {
      expect(manager.hasAccess('settings:organization:modify', 'editor')).toBe(
        false
      )
    })

    it('should return false for viewer with admin-only permission', () => {
      expect(manager.hasAccess('settings:organization:modify', 'viewer')).toBe(
        false
      )
    })

    it('should return true for all roles with view permission', () => {
      expect(manager.hasAccess('settings:organization:view', 'admin')).toBe(
        true
      )
      expect(manager.hasAccess('settings:organization:view', 'editor')).toBe(
        true
      )
      expect(manager.hasAccess('settings:organization:view', 'viewer')).toBe(
        true
      )
    })

    it('should return true for admin and editor with invite permission', () => {
      expect(manager.hasAccess('settings:users:invite', 'admin')).toBe(true)
      expect(manager.hasAccess('settings:users:invite', 'editor')).toBe(true)
    })

    it('should return false for viewer with invite permission', () => {
      expect(manager.hasAccess('settings:users:invite', 'viewer')).toBe(false)
    })

    it('should handle content permissions for admin', () => {
      expect(manager.hasAccess('content:create', 'admin')).toBe(true)
      expect(manager.hasAccess('content:edit', 'admin')).toBe(true)
      expect(manager.hasAccess('content:delete', 'admin')).toBe(true)
      expect(manager.hasAccess('content:view', 'admin')).toBe(true)
    })

    it('should handle content permissions for editor', () => {
      expect(manager.hasAccess('content:create', 'editor')).toBe(true)
      expect(manager.hasAccess('content:edit', 'editor')).toBe(true)
      expect(manager.hasAccess('content:delete', 'editor')).toBe(false)
      expect(manager.hasAccess('content:view', 'editor')).toBe(true)
    })

    it('should handle content permissions for viewer', () => {
      expect(manager.hasAccess('content:create', 'viewer')).toBe(false)
      expect(manager.hasAccess('content:edit', 'viewer')).toBe(false)
      expect(manager.hasAccess('content:delete', 'viewer')).toBe(false)
      expect(manager.hasAccess('content:view', 'viewer')).toBe(true)
    })

    it('should return false for unknown role', () => {
      expect(manager.hasAccess('settings:users:invite', 'guest')).toBe(false)
    })
  })

  describe('deeply nested permissions', () => {
    it('should handle deeply nested permission paths', () => {
      expect(manager.hasAccess('settings:users:remove', 'admin')).toBe(true)
      expect(manager.hasAccess('settings:users:remove', 'editor')).toBe(false)
    })

    it('should handle view permissions at different nesting levels', () => {
      expect(manager.hasAccess('settings:users:view', 'viewer')).toBe(true)
      expect(manager.hasAccess('content:view', 'viewer')).toBe(true)
    })

    it('should traverse three levels correctly for admin', () => {
      expect(manager.hasAccess('settings:organization:modify', 'admin')).toBe(
        true
      )
      expect(manager.hasAccess('settings:organization:view', 'admin')).toBe(
        true
      )
      expect(manager.hasAccess('settings:users:invite', 'admin')).toBe(true)
      expect(manager.hasAccess('settings:users:remove', 'admin')).toBe(true)
      expect(manager.hasAccess('settings:users:view', 'admin')).toBe(true)
    })

    it('should traverse three levels correctly for editor', () => {
      expect(manager.hasAccess('settings:organization:modify', 'editor')).toBe(
        false
      )
      expect(manager.hasAccess('settings:organization:view', 'editor')).toBe(
        true
      )
      expect(manager.hasAccess('settings:users:invite', 'editor')).toBe(true)
      expect(manager.hasAccess('settings:users:remove', 'editor')).toBe(false)
      expect(manager.hasAccess('settings:users:view', 'editor')).toBe(true)
    })

    it('should traverse three levels correctly for viewer', () => {
      expect(manager.hasAccess('settings:organization:modify', 'viewer')).toBe(
        false
      )
      expect(manager.hasAccess('settings:organization:view', 'viewer')).toBe(
        true
      )
      expect(manager.hasAccess('settings:users:invite', 'viewer')).toBe(false)
      expect(manager.hasAccess('settings:users:remove', 'viewer')).toBe(false)
      expect(manager.hasAccess('settings:users:view', 'viewer')).toBe(true)
    })
  })

  describe('invalid permission paths', () => {
    it('should return false for non-existent top-level permission', () => {
      expect(manager.hasAccess('nonexistent', 'admin')).toBe(false)
    })

    it('should return false for non-existent nested permission', () => {
      expect(manager.hasAccess('settings:nonexistent', 'admin')).toBe(false)
    })

    it('should return false for non-existent deeply nested permission', () => {
      expect(
        manager.hasAccess('settings:organization:nonexistent', 'admin')
      ).toBe(false)
    })

    it('should return false for empty permission string', () => {
      expect(manager.hasAccess('', 'admin')).toBe(false)
    })

    it('should return false for permission with extra colons', () => {
      expect(
        manager.hasAccess('settings:organization:modify:extra', 'admin')
      ).toBe(false)
    })

    it('should return false for permission pointing to a group not a leaf', () => {
      expect(manager.hasAccess('settings', 'admin')).toBe(false)
    })

    it('should return false for permission pointing to nested group', () => {
      expect(manager.hasAccess('settings:organization', 'admin')).toBe(false)
    })

    it('should return false for permission pointing to users group', () => {
      expect(manager.hasAccess('settings:users', 'admin')).toBe(false)
    })
  })

  describe('edge cases - flat structure', () => {
    it('should work with a simple flat permission structure', () => {
      const flatManager = new PermissionManager(['admin', 'user'], {
        read: ['admin', 'user'],
        write: ['admin'],
      })
      expect(flatManager.hasAccess('read', 'user')).toBe(true)
      expect(flatManager.hasAccess('write', 'user')).toBe(false)
    })

    it('should handle flat structure with multiple permissions', () => {
      const flatManager = new PermissionManager(['admin', 'user', 'guest'], {
        read: ['admin', 'user', 'guest'],
        write: ['admin', 'user'],
        delete: ['admin'],
        manage: ['admin'],
      })
      expect(flatManager.hasAccess('read', 'guest')).toBe(true)
      expect(flatManager.hasAccess('write', 'guest')).toBe(false)
      expect(flatManager.hasAccess('delete', 'guest')).toBe(false)
      expect(flatManager.hasAccess('manage', 'guest')).toBe(false)
    })

    it('should handle flat structure admin has all permissions', () => {
      const flatManager = new PermissionManager(['admin', 'user', 'guest'], {
        read: ['admin', 'user', 'guest'],
        write: ['admin', 'user'],
        delete: ['admin'],
        manage: ['admin'],
      })
      expect(flatManager.hasAccess('read', 'admin')).toBe(true)
      expect(flatManager.hasAccess('write', 'admin')).toBe(true)
      expect(flatManager.hasAccess('delete', 'admin')).toBe(true)
      expect(flatManager.hasAccess('manage', 'admin')).toBe(true)
    })
  })

  describe('edge cases - single role', () => {
    it('should work with single role permission', () => {
      const singleRoleManager = new PermissionManager(['superadmin'], {
        everything: ['superadmin'],
      })
      expect(singleRoleManager.hasAccess('everything', 'superadmin')).toBe(true)
    })

    it('should return false for non-existent role in single role manager', () => {
      const singleRoleManager = new PermissionManager(['superadmin'], {
        everything: ['superadmin'],
      })
      expect(singleRoleManager.hasAccess('everything', 'admin')).toBe(false)
    })

    it('should handle single role with nested permissions', () => {
      const singleRoleManager = new PermissionManager(['root'], {
        system: {
          admin: {
            full: ['root'],
          },
        },
      })
      expect(singleRoleManager.hasAccess('system:admin:full', 'root')).toBe(
        true
      )
      expect(singleRoleManager.hasAccess('system:admin:full', 'other')).toBe(
        false
      )
    })
  })

  describe('edge cases - empty arrays', () => {
    it('should work with empty roles array in permission', () => {
      const restrictedManager = new PermissionManager(['admin', 'user'], {
        restricted: [],
      })
      expect(restrictedManager.hasAccess('restricted', 'admin')).toBe(false)
      expect(restrictedManager.hasAccess('restricted', 'user')).toBe(false)
    })

    it('should return false for empty array even with valid role', () => {
      const m = new PermissionManager(['admin'], {
        locked: [],
      })
      expect(m.hasAccess('locked', 'admin')).toBe(false)
    })

    it('should handle mixed empty and non-empty arrays', () => {
      const m = new PermissionManager(['admin', 'user'], {
        open: ['admin', 'user'],
        closed: [],
      })
      expect(m.hasAccess('open', 'admin')).toBe(true)
      expect(m.hasAccess('open', 'user')).toBe(true)
      expect(m.hasAccess('closed', 'admin')).toBe(false)
      expect(m.hasAccess('closed', 'user')).toBe(false)
    })
  })

  describe('complex nested structures', () => {
    it('should handle 4 levels of nesting', () => {
      const deepManager = new PermissionManager(['admin', 'user'], {
        level1: {
          level2: {
            level3: {
              level4: ['admin'],
            },
          },
        },
      })
      expect(
        deepManager.hasAccess('level1:level2:level3:level4', 'admin')
      ).toBe(true)
      expect(deepManager.hasAccess('level1:level2:level3:level4', 'user')).toBe(
        false
      )
    })

    it('should handle 5 levels of nesting', () => {
      const deepManager = new PermissionManager(['admin'], {
        a: {
          b: {
            c: {
              d: {
                e: ['admin'],
              },
            },
          },
        },
      })
      expect(deepManager.hasAccess('a:b:c:d:e', 'admin')).toBe(true)
    })

    it('should handle mixed nesting depths in same schema', () => {
      const mixedManager = new PermissionManager(['admin', 'user'], {
        shallow: ['admin', 'user'],
        medium: {
          action: ['admin'],
        },
        deep: {
          nested: {
            action: ['admin'],
          },
        },
      })
      expect(mixedManager.hasAccess('shallow', 'user')).toBe(true)
      expect(mixedManager.hasAccess('medium:action', 'admin')).toBe(true)
      expect(mixedManager.hasAccess('medium:action', 'user')).toBe(false)
      expect(mixedManager.hasAccess('deep:nested:action', 'admin')).toBe(true)
      expect(mixedManager.hasAccess('deep:nested:action', 'user')).toBe(false)
    })

    it('should handle sibling groups at same level', () => {
      const siblingManager = new PermissionManager(['admin', 'editor'], {
        moduleA: {
          read: ['admin', 'editor'],
          write: ['admin'],
        },
        moduleB: {
          read: ['admin', 'editor'],
          write: ['admin'],
        },
        moduleC: {
          read: ['admin'],
          write: ['admin'],
        },
      })
      expect(siblingManager.hasAccess('moduleA:read', 'editor')).toBe(true)
      expect(siblingManager.hasAccess('moduleB:read', 'editor')).toBe(true)
      expect(siblingManager.hasAccess('moduleC:read', 'editor')).toBe(false)
      expect(siblingManager.hasAccess('moduleA:write', 'editor')).toBe(false)
      expect(siblingManager.hasAccess('moduleB:write', 'editor')).toBe(false)
      expect(siblingManager.hasAccess('moduleC:write', 'editor')).toBe(false)
    })
  })

  describe('role variations', () => {
    it('should handle many roles', () => {
      const manyRolesManager = new PermissionManager(
        [
          'superadmin',
          'admin',
          'manager',
          'editor',
          'contributor',
          'viewer',
          'guest',
        ],
        {
          admin: ['superadmin'],
          manage: ['superadmin', 'admin'],
          edit: ['superadmin', 'admin', 'manager', 'editor'],
          contribute: [
            'superadmin',
            'admin',
            'manager',
            'editor',
            'contributor',
          ],
          view: [
            'superadmin',
            'admin',
            'manager',
            'editor',
            'contributor',
            'viewer',
          ],
          public: [
            'superadmin',
            'admin',
            'manager',
            'editor',
            'contributor',
            'viewer',
            'guest',
          ],
        }
      )
      expect(manyRolesManager.hasAccess('admin', 'superadmin')).toBe(true)
      expect(manyRolesManager.hasAccess('admin', 'admin')).toBe(false)
      expect(manyRolesManager.hasAccess('manage', 'admin')).toBe(true)
      expect(manyRolesManager.hasAccess('manage', 'manager')).toBe(false)
      expect(manyRolesManager.hasAccess('edit', 'editor')).toBe(true)
      expect(manyRolesManager.hasAccess('edit', 'contributor')).toBe(false)
      expect(manyRolesManager.hasAccess('contribute', 'contributor')).toBe(true)
      expect(manyRolesManager.hasAccess('contribute', 'viewer')).toBe(false)
      expect(manyRolesManager.hasAccess('view', 'viewer')).toBe(true)
      expect(manyRolesManager.hasAccess('view', 'guest')).toBe(false)
      expect(manyRolesManager.hasAccess('public', 'guest')).toBe(true)
    })

    it('should handle role names with special characters', () => {
      const specialManager = new PermissionManager(
        ['admin-level-1', 'user_basic', 'guest.temp'],
        {
          action: ['admin-level-1', 'user_basic'],
        }
      )
      expect(specialManager.hasAccess('action', 'admin-level-1')).toBe(true)
      expect(specialManager.hasAccess('action', 'user_basic')).toBe(true)
      expect(specialManager.hasAccess('action', 'guest.temp')).toBe(false)
    })

    it('should handle numeric-like role names', () => {
      const numericManager = new PermissionManager(['1', '2', '3'], {
        action: ['1', '2'],
      })
      expect(numericManager.hasAccess('action', '1')).toBe(true)
      expect(numericManager.hasAccess('action', '2')).toBe(true)
      expect(numericManager.hasAccess('action', '3')).toBe(false)
    })

    it('should handle uppercase role names', () => {
      const upperManager = new PermissionManager(['ADMIN', 'USER'], {
        action: ['ADMIN'],
      })
      expect(upperManager.hasAccess('action', 'ADMIN')).toBe(true)
      expect(upperManager.hasAccess('action', 'USER')).toBe(false)
      expect(upperManager.hasAccess('action', 'admin')).toBe(false)
    })

    it('should be case sensitive for role names', () => {
      const caseSensitiveManager = new PermissionManager(['Admin', 'admin'], {
        action: ['Admin'],
      })
      expect(caseSensitiveManager.hasAccess('action', 'Admin')).toBe(true)
      expect(caseSensitiveManager.hasAccess('action', 'admin')).toBe(false)
    })
  })

  describe('permission key variations', () => {
    it('should handle permission keys with underscores', () => {
      const m = new PermissionManager(['admin'], {
        user_management: {
          create_user: ['admin'],
        },
      })
      expect(m.hasAccess('user_management:create_user', 'admin')).toBe(true)
    })

    it('should handle permission keys with hyphens', () => {
      const m = new PermissionManager(['admin'], {
        'user-management': {
          'create-user': ['admin'],
        },
      })
      expect(m.hasAccess('user-management:create-user', 'admin')).toBe(true)
    })

    it('should handle permission keys with numbers', () => {
      const m = new PermissionManager(['admin'], {
        module1: {
          action2: ['admin'],
        },
      })
      expect(m.hasAccess('module1:action2', 'admin')).toBe(true)
    })

    it('should handle single character permission keys', () => {
      const m = new PermissionManager(['admin'], {
        a: {
          b: ['admin'],
        },
      })
      expect(m.hasAccess('a:b', 'admin')).toBe(true)
    })
  })

  describe('comprehensive permission matrix', () => {
    const matrixManager = new PermissionManager(
      ['owner', 'admin', 'moderator', 'member', 'guest'],
      {
        organization: {
          delete: ['owner'],
          settings: ['owner', 'admin'],
          members: {
            add: ['owner', 'admin', 'moderator'],
            remove: ['owner', 'admin'],
            view: ['owner', 'admin', 'moderator', 'member'],
          },
        },
        content: {
          create: ['owner', 'admin', 'moderator', 'member'],
          edit: ['owner', 'admin', 'moderator'],
          delete: ['owner', 'admin'],
          view: ['owner', 'admin', 'moderator', 'member', 'guest'],
        },
        comments: {
          create: ['owner', 'admin', 'moderator', 'member'],
          delete: ['owner', 'admin', 'moderator'],
          view: ['owner', 'admin', 'moderator', 'member', 'guest'],
        },
      }
    )

    it('should verify owner has all permissions', () => {
      expect(matrixManager.hasAccess('organization:delete', 'owner')).toBe(true)
      expect(matrixManager.hasAccess('organization:settings', 'owner')).toBe(
        true
      )
      expect(matrixManager.hasAccess('organization:members:add', 'owner')).toBe(
        true
      )
      expect(
        matrixManager.hasAccess('organization:members:remove', 'owner')
      ).toBe(true)
      expect(
        matrixManager.hasAccess('organization:members:view', 'owner')
      ).toBe(true)
      expect(matrixManager.hasAccess('content:create', 'owner')).toBe(true)
      expect(matrixManager.hasAccess('content:edit', 'owner')).toBe(true)
      expect(matrixManager.hasAccess('content:delete', 'owner')).toBe(true)
      expect(matrixManager.hasAccess('content:view', 'owner')).toBe(true)
      expect(matrixManager.hasAccess('comments:create', 'owner')).toBe(true)
      expect(matrixManager.hasAccess('comments:delete', 'owner')).toBe(true)
      expect(matrixManager.hasAccess('comments:view', 'owner')).toBe(true)
    })

    it('should verify admin permissions', () => {
      expect(matrixManager.hasAccess('organization:delete', 'admin')).toBe(
        false
      )
      expect(matrixManager.hasAccess('organization:settings', 'admin')).toBe(
        true
      )
      expect(matrixManager.hasAccess('organization:members:add', 'admin')).toBe(
        true
      )
      expect(
        matrixManager.hasAccess('organization:members:remove', 'admin')
      ).toBe(true)
      expect(
        matrixManager.hasAccess('organization:members:view', 'admin')
      ).toBe(true)
      expect(matrixManager.hasAccess('content:create', 'admin')).toBe(true)
      expect(matrixManager.hasAccess('content:edit', 'admin')).toBe(true)
      expect(matrixManager.hasAccess('content:delete', 'admin')).toBe(true)
      expect(matrixManager.hasAccess('content:view', 'admin')).toBe(true)
    })

    it('should verify moderator permissions', () => {
      expect(matrixManager.hasAccess('organization:delete', 'moderator')).toBe(
        false
      )
      expect(
        matrixManager.hasAccess('organization:settings', 'moderator')
      ).toBe(false)
      expect(
        matrixManager.hasAccess('organization:members:add', 'moderator')
      ).toBe(true)
      expect(
        matrixManager.hasAccess('organization:members:remove', 'moderator')
      ).toBe(false)
      expect(
        matrixManager.hasAccess('organization:members:view', 'moderator')
      ).toBe(true)
      expect(matrixManager.hasAccess('content:create', 'moderator')).toBe(true)
      expect(matrixManager.hasAccess('content:edit', 'moderator')).toBe(true)
      expect(matrixManager.hasAccess('content:delete', 'moderator')).toBe(false)
      expect(matrixManager.hasAccess('content:view', 'moderator')).toBe(true)
      expect(matrixManager.hasAccess('comments:delete', 'moderator')).toBe(true)
    })

    it('should verify member permissions', () => {
      expect(matrixManager.hasAccess('organization:delete', 'member')).toBe(
        false
      )
      expect(matrixManager.hasAccess('organization:settings', 'member')).toBe(
        false
      )
      expect(
        matrixManager.hasAccess('organization:members:add', 'member')
      ).toBe(false)
      expect(
        matrixManager.hasAccess('organization:members:remove', 'member')
      ).toBe(false)
      expect(
        matrixManager.hasAccess('organization:members:view', 'member')
      ).toBe(true)
      expect(matrixManager.hasAccess('content:create', 'member')).toBe(true)
      expect(matrixManager.hasAccess('content:edit', 'member')).toBe(false)
      expect(matrixManager.hasAccess('content:delete', 'member')).toBe(false)
      expect(matrixManager.hasAccess('content:view', 'member')).toBe(true)
      expect(matrixManager.hasAccess('comments:create', 'member')).toBe(true)
      expect(matrixManager.hasAccess('comments:delete', 'member')).toBe(false)
    })

    it('should verify guest permissions', () => {
      expect(matrixManager.hasAccess('organization:delete', 'guest')).toBe(
        false
      )
      expect(matrixManager.hasAccess('organization:settings', 'guest')).toBe(
        false
      )
      expect(matrixManager.hasAccess('organization:members:add', 'guest')).toBe(
        false
      )
      expect(
        matrixManager.hasAccess('organization:members:remove', 'guest')
      ).toBe(false)
      expect(
        matrixManager.hasAccess('organization:members:view', 'guest')
      ).toBe(false)
      expect(matrixManager.hasAccess('content:create', 'guest')).toBe(false)
      expect(matrixManager.hasAccess('content:edit', 'guest')).toBe(false)
      expect(matrixManager.hasAccess('content:delete', 'guest')).toBe(false)
      expect(matrixManager.hasAccess('content:view', 'guest')).toBe(true)
      expect(matrixManager.hasAccess('comments:create', 'guest')).toBe(false)
      expect(matrixManager.hasAccess('comments:delete', 'guest')).toBe(false)
      expect(matrixManager.hasAccess('comments:view', 'guest')).toBe(true)
    })
  })

  describe('boundary conditions', () => {
    it('should handle permission with single role in array', () => {
      const m = new PermissionManager(['admin', 'user'], {
        exclusive: ['admin'],
      })
      expect(m.hasAccess('exclusive', 'admin')).toBe(true)
      expect(m.hasAccess('exclusive', 'user')).toBe(false)
    })

    it('should handle permission with all roles in array', () => {
      const m = new PermissionManager(['a', 'b', 'c'], {
        universal: ['a', 'b', 'c'],
      })
      expect(m.hasAccess('universal', 'a')).toBe(true)
      expect(m.hasAccess('universal', 'b')).toBe(true)
      expect(m.hasAccess('universal', 'c')).toBe(true)
    })

    it('should handle very long permission paths', () => {
      const m = new PermissionManager(['admin'], {
        a: { b: { c: { d: { e: { f: { g: { h: ['admin'] } } } } } } },
      })
      expect(m.hasAccess('a:b:c:d:e:f:g:h', 'admin')).toBe(true)
    })

    it('should return false for partial path traversal', () => {
      const m = new PermissionManager(['admin'], {
        level1: { level2: { level3: ['admin'] } },
      })
      expect(m.hasAccess('level1', 'admin')).toBe(false)
      expect(m.hasAccess('level1:level2', 'admin')).toBe(false)
      expect(m.hasAccess('level1:level2:level3', 'admin')).toBe(true)
    })
  })

  describe('real-world scenarios', () => {
    it('should handle e-commerce permission structure', () => {
      const ecommerceManager = new PermissionManager(
        ['superadmin', 'admin', 'seller', 'buyer'],
        {
          products: {
            create: ['superadmin', 'admin', 'seller'],
            edit: ['superadmin', 'admin', 'seller'],
            delete: ['superadmin', 'admin'],
            view: ['superadmin', 'admin', 'seller', 'buyer'],
          },
          orders: {
            create: ['superadmin', 'admin', 'seller', 'buyer'],
            cancel: ['superadmin', 'admin'],
            view: ['superadmin', 'admin', 'seller', 'buyer'],
            refund: ['superadmin', 'admin'],
          },
          users: {
            create: ['superadmin'],
            ban: ['superadmin', 'admin'],
            view: ['superadmin', 'admin'],
          },
        }
      )
      expect(ecommerceManager.hasAccess('products:create', 'seller')).toBe(true)
      expect(ecommerceManager.hasAccess('products:delete', 'seller')).toBe(
        false
      )
      expect(ecommerceManager.hasAccess('orders:create', 'buyer')).toBe(true)
      expect(ecommerceManager.hasAccess('orders:refund', 'buyer')).toBe(false)
      expect(ecommerceManager.hasAccess('users:ban', 'admin')).toBe(true)
      expect(ecommerceManager.hasAccess('users:create', 'admin')).toBe(false)
    })

    it('should handle CMS permission structure', () => {
      const cmsManager = new PermissionManager(
        ['admin', 'editor', 'author', 'subscriber'],
        {
          posts: {
            publish: ['admin', 'editor'],
            edit: ['admin', 'editor', 'author'],
            delete: ['admin'],
            view: ['admin', 'editor', 'author', 'subscriber'],
          },
          media: {
            upload: ['admin', 'editor', 'author'],
            delete: ['admin', 'editor'],
            view: ['admin', 'editor', 'author', 'subscriber'],
          },
          settings: {
            general: ['admin'],
            theme: ['admin', 'editor'],
          },
        }
      )
      expect(cmsManager.hasAccess('posts:publish', 'author')).toBe(false)
      expect(cmsManager.hasAccess('posts:edit', 'author')).toBe(true)
      expect(cmsManager.hasAccess('media:upload', 'subscriber')).toBe(false)
      expect(cmsManager.hasAccess('settings:theme', 'editor')).toBe(true)
      expect(cmsManager.hasAccess('settings:general', 'editor')).toBe(false)
    })

    it('should handle SaaS multi-tenant permission structure', () => {
      const saasManager = new PermissionManager(
        ['owner', 'admin', 'member', 'viewer'],
        {
          workspace: {
            delete: ['owner'],
            settings: ['owner', 'admin'],
            invite: ['owner', 'admin'],
          },
          projects: {
            create: ['owner', 'admin', 'member'],
            archive: ['owner', 'admin'],
            view: ['owner', 'admin', 'member', 'viewer'],
          },
          api: {
            keys: {
              create: ['owner', 'admin'],
              revoke: ['owner'],
              view: ['owner', 'admin'],
            },
          },
        }
      )
      expect(saasManager.hasAccess('workspace:delete', 'admin')).toBe(false)
      expect(saasManager.hasAccess('workspace:invite', 'admin')).toBe(true)
      expect(saasManager.hasAccess('projects:create', 'member')).toBe(true)
      expect(saasManager.hasAccess('projects:archive', 'member')).toBe(false)
      expect(saasManager.hasAccess('api:keys:create', 'admin')).toBe(true)
      expect(saasManager.hasAccess('api:keys:revoke', 'admin')).toBe(false)
    })
  })

  describe('consistency checks', () => {
    it('should return consistent results on repeated calls', () => {
      for (let i = 0; i < 100; i++) {
        expect(manager.hasAccess('settings:users:invite', 'admin')).toBe(true)
        expect(manager.hasAccess('settings:users:invite', 'viewer')).toBe(false)
      }
    })
  })

  describe('super deep nested structures (10+ levels)', () => {
    const superDeepManager = new PermissionManager(
      [
        'god',
        'superadmin',
        'admin',
        'manager',
        'lead',
        'senior',
        'mid',
        'junior',
        'intern',
        'guest',
      ],
      {
        system: {
          core: {
            infrastructure: {
              servers: {
                production: {
                  critical: {
                    database: {
                      master: {
                        credentials: {
                          rotate: ['god'],
                          view: ['god', 'superadmin'],
                        },
                        backup: {
                          create: ['god', 'superadmin'],
                          restore: ['god'],
                          delete: ['god'],
                          view: ['god', 'superadmin', 'admin'],
                        },
                      },
                      replica: {
                        manage: ['god', 'superadmin', 'admin'],
                        view: ['god', 'superadmin', 'admin', 'manager'],
                      },
                    },
                    cache: {
                      flush: ['god', 'superadmin'],
                      configure: ['god', 'superadmin', 'admin'],
                      view: ['god', 'superadmin', 'admin', 'manager', 'lead'],
                    },
                  },
                  standard: {
                    deploy: ['god', 'superadmin', 'admin', 'manager'],
                    rollback: ['god', 'superadmin', 'admin'],
                    view: [
                      'god',
                      'superadmin',
                      'admin',
                      'manager',
                      'lead',
                      'senior',
                    ],
                  },
                },
                staging: {
                  deploy: [
                    'god',
                    'superadmin',
                    'admin',
                    'manager',
                    'lead',
                    'senior',
                  ],
                  view: [
                    'god',
                    'superadmin',
                    'admin',
                    'manager',
                    'lead',
                    'senior',
                    'mid',
                  ],
                },
                development: {
                  deploy: [
                    'god',
                    'superadmin',
                    'admin',
                    'manager',
                    'lead',
                    'senior',
                    'mid',
                    'junior',
                  ],
                  view: [
                    'god',
                    'superadmin',
                    'admin',
                    'manager',
                    'lead',
                    'senior',
                    'mid',
                    'junior',
                    'intern',
                  ],
                },
              },
            },
          },
        },
      }
    )

    it('should handle 10-level deep path for god role', () => {
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:credentials:rotate',
          'god'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:credentials:view',
          'god'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:backup:create',
          'god'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:backup:restore',
          'god'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:backup:delete',
          'god'
        )
      ).toBe(true)
    })

    it('should restrict superadmin from god-only permissions', () => {
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:credentials:rotate',
          'superadmin'
        )
      ).toBe(false)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:credentials:view',
          'superadmin'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:backup:restore',
          'superadmin'
        )
      ).toBe(false)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:backup:delete',
          'superadmin'
        )
      ).toBe(false)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:backup:create',
          'superadmin'
        )
      ).toBe(true)
    })

    it('should handle admin role at deep levels', () => {
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:backup:view',
          'admin'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:replica:manage',
          'admin'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:cache:configure',
          'admin'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:standard:deploy',
          'admin'
        )
      ).toBe(false)
    })

    it('should handle manager role permissions', () => {
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:replica:view',
          'manager'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:standard:deploy',
          'manager'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:cache:view',
          'manager'
        )
      ).toBe(false)
    })

    it('should handle lead role permissions', () => {
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:cache:view',
          'lead'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:standard:view',
          'lead'
        )
      ).toBe(false)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:staging:deploy',
          'lead'
        )
      ).toBe(true)
    })

    it('should handle senior role permissions', () => {
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:standard:view',
          'senior'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:staging:deploy',
          'senior'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:staging:view',
          'senior'
        )
      ).toBe(false)
    })

    it('should handle mid role permissions', () => {
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:staging:view',
          'mid'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:development:deploy',
          'mid'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:staging:deploy',
          'mid'
        )
      ).toBe(false)
    })

    it('should handle junior role permissions', () => {
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:development:deploy',
          'junior'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:development:view',
          'junior'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:staging:view',
          'junior'
        )
      ).toBe(false)
    })

    it('should handle intern role permissions', () => {
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:development:view',
          'intern'
        )
      ).toBe(true)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:development:deploy',
          'intern'
        )
      ).toBe(false)
    })

    it('should deny guest from all deep permissions', () => {
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:development:view',
          'guest'
        )
      ).toBe(false)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:development:deploy',
          'guest'
        )
      ).toBe(false)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:staging:view',
          'guest'
        )
      ).toBe(false)
    })

    it('should return false for partial deep paths', () => {
      expect(superDeepManager.hasAccess('system', 'god')).toBe(false)
      expect(superDeepManager.hasAccess('system:core', 'god')).toBe(false)
      expect(
        superDeepManager.hasAccess('system:core:infrastructure', 'god')
      ).toBe(false)
      expect(
        superDeepManager.hasAccess('system:core:infrastructure:servers', 'god')
      ).toBe(false)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production',
          'god'
        )
      ).toBe(false)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical',
          'god'
        )
      ).toBe(false)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database',
          'god'
        )
      ).toBe(false)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master',
          'god'
        )
      ).toBe(false)
      expect(
        superDeepManager.hasAccess(
          'system:core:infrastructure:servers:production:critical:database:master:credentials',
          'god'
        )
      ).toBe(false)
    })
  })

  describe('enterprise-grade complex permission structure', () => {
    const enterpriseManager = new PermissionManager(
      [
        'ceo',
        'cto',
        'vp_engineering',
        'director',
        'engineering_manager',
        'tech_lead',
        'senior_engineer',
        'engineer',
        'associate',
        'contractor',
      ],
      {
        company: {
          financials: {
            budget: {
              view: ['ceo', 'cto', 'vp_engineering'],
              approve: ['ceo'],
              modify: ['ceo'],
            },
            expenses: {
              view: ['ceo', 'cto', 'vp_engineering', 'director'],
              approve: ['ceo', 'cto', 'vp_engineering'],
              submit: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
              ],
            },
          },
          hr: {
            hiring: {
              approve_headcount: ['ceo', 'cto', 'vp_engineering'],
              create_requisition: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
              ],
              view_candidates: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
              ],
              interview: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
                'senior_engineer',
              ],
            },
            performance: {
              write_review: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
              ],
              view_team_reviews: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
              ],
              view_own_review: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
                'senior_engineer',
                'engineer',
                'associate',
              ],
            },
            compensation: {
              view_all: ['ceo', 'cto'],
              view_team: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
              ],
              modify: ['ceo'],
            },
          },
        },
        engineering: {
          architecture: {
            decisions: {
              create: ['cto', 'vp_engineering', 'director'],
              approve: ['cto', 'vp_engineering'],
              view: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
                'senior_engineer',
              ],
            },
            standards: {
              create: ['cto', 'vp_engineering', 'director', 'tech_lead'],
              modify: ['cto', 'vp_engineering', 'director'],
              view: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
                'senior_engineer',
                'engineer',
              ],
            },
          },
          codebase: {
            production: {
              deploy: [
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
              ],
              rollback: [
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
              ],
              hotfix: [
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
                'senior_engineer',
              ],
            },
            staging: {
              deploy: [
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
                'senior_engineer',
                'engineer',
              ],
              view: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
                'senior_engineer',
                'engineer',
                'associate',
              ],
            },
            development: {
              commit: [
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
                'senior_engineer',
                'engineer',
                'associate',
                'contractor',
              ],
              review: [
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
                'senior_engineer',
                'engineer',
              ],
              merge: [
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
                'senior_engineer',
              ],
            },
          },
          infrastructure: {
            cloud: {
              resources: {
                create: [
                  'cto',
                  'vp_engineering',
                  'director',
                  'engineering_manager',
                  'tech_lead',
                ],
                delete: ['cto', 'vp_engineering', 'director'],
                modify: [
                  'cto',
                  'vp_engineering',
                  'director',
                  'engineering_manager',
                  'tech_lead',
                ],
                view: [
                  'ceo',
                  'cto',
                  'vp_engineering',
                  'director',
                  'engineering_manager',
                  'tech_lead',
                  'senior_engineer',
                ],
              },
            },
            security: {
              audit_logs: {
                view: ['ceo', 'cto', 'vp_engineering', 'director'],
                export: ['cto', 'vp_engineering'],
              },
              access_control: {
                manage: ['cto', 'vp_engineering'],
                view: [
                  'ceo',
                  'cto',
                  'vp_engineering',
                  'director',
                  'engineering_manager',
                ],
              },
              secrets: {
                create: ['cto', 'vp_engineering', 'director'],
                rotate: ['cto', 'vp_engineering'],
                view: [
                  'cto',
                  'vp_engineering',
                  'director',
                  'engineering_manager',
                  'tech_lead',
                ],
                delete: ['cto'],
              },
            },
          },
        },
        product: {
          roadmap: {
            strategic: {
              create: ['ceo', 'cto'],
              modify: ['ceo', 'cto'],
              view: ['ceo', 'cto', 'vp_engineering', 'director'],
            },
            tactical: {
              create: ['ceo', 'cto', 'vp_engineering', 'director'],
              modify: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
              ],
              view: [
                'ceo',
                'cto',
                'vp_engineering',
                'director',
                'engineering_manager',
                'tech_lead',
              ],
            },
          },
          features: {
            prioritize: ['ceo', 'cto', 'vp_engineering', 'director'],
            create: [
              'ceo',
              'cto',
              'vp_engineering',
              'director',
              'engineering_manager',
              'tech_lead',
            ],
            view: [
              'ceo',
              'cto',
              'vp_engineering',
              'director',
              'engineering_manager',
              'tech_lead',
              'senior_engineer',
              'engineer',
              'associate',
            ],
          },
        },
      }
    )

    it('should verify CEO has highest financial access', () => {
      expect(
        enterpriseManager.hasAccess('company:financials:budget:view', 'ceo')
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess('company:financials:budget:approve', 'ceo')
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess('company:financials:budget:modify', 'ceo')
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess('company:hr:compensation:view_all', 'ceo')
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess('company:hr:compensation:modify', 'ceo')
      ).toBe(true)
    })

    it('should verify CTO financial access is limited', () => {
      expect(
        enterpriseManager.hasAccess('company:financials:budget:view', 'cto')
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess('company:financials:budget:approve', 'cto')
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess('company:financials:budget:modify', 'cto')
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess('company:hr:compensation:view_all', 'cto')
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess('company:hr:compensation:modify', 'cto')
      ).toBe(false)
    })

    it('should verify engineering hierarchy for code access', () => {
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:production:deploy',
          'tech_lead'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:production:deploy',
          'senior_engineer'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:production:hotfix',
          'senior_engineer'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:production:hotfix',
          'engineer'
        )
      ).toBe(false)
    })

    it('should verify staging deployment permissions', () => {
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:staging:deploy',
          'engineer'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:staging:deploy',
          'associate'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:staging:view',
          'associate'
        )
      ).toBe(true)
    })

    it('should verify development access for all engineering roles', () => {
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:development:commit',
          'contractor'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:development:review',
          'contractor'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:development:review',
          'engineer'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:development:merge',
          'engineer'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'engineering:codebase:development:merge',
          'senior_engineer'
        )
      ).toBe(true)
    })

    it('should verify infrastructure security permissions', () => {
      expect(
        enterpriseManager.hasAccess(
          'engineering:infrastructure:security:secrets:delete',
          'cto'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:infrastructure:security:secrets:delete',
          'vp_engineering'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'engineering:infrastructure:security:secrets:rotate',
          'vp_engineering'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:infrastructure:security:secrets:rotate',
          'director'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'engineering:infrastructure:security:secrets:view',
          'tech_lead'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:infrastructure:security:secrets:view',
          'senior_engineer'
        )
      ).toBe(false)
    })

    it('should verify HR hiring permissions cascade', () => {
      expect(
        enterpriseManager.hasAccess(
          'company:hr:hiring:approve_headcount',
          'director'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'company:hr:hiring:create_requisition',
          'director'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'company:hr:hiring:view_candidates',
          'tech_lead'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'company:hr:hiring:view_candidates',
          'senior_engineer'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'company:hr:hiring:interview',
          'senior_engineer'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess('company:hr:hiring:interview', 'engineer')
      ).toBe(false)
    })

    it('should verify performance review access', () => {
      expect(
        enterpriseManager.hasAccess(
          'company:hr:performance:view_own_review',
          'associate'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'company:hr:performance:view_own_review',
          'contractor'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'company:hr:performance:write_review',
          'tech_lead'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'company:hr:performance:write_review',
          'senior_engineer'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'company:hr:performance:view_team_reviews',
          'engineering_manager'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'company:hr:performance:view_team_reviews',
          'tech_lead'
        )
      ).toBe(false)
    })

    it('should verify architecture decision access', () => {
      expect(
        enterpriseManager.hasAccess(
          'engineering:architecture:decisions:create',
          'director'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:architecture:decisions:create',
          'engineering_manager'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'engineering:architecture:decisions:approve',
          'director'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'engineering:architecture:decisions:approve',
          'vp_engineering'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:architecture:decisions:view',
          'senior_engineer'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:architecture:decisions:view',
          'engineer'
        )
      ).toBe(false)
    })

    it('should verify product roadmap access', () => {
      expect(
        enterpriseManager.hasAccess('product:roadmap:strategic:create', 'cto')
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'product:roadmap:strategic:create',
          'vp_engineering'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'product:roadmap:strategic:view',
          'director'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'product:roadmap:strategic:view',
          'engineering_manager'
        )
      ).toBe(false)
      expect(
        enterpriseManager.hasAccess(
          'product:roadmap:tactical:modify',
          'engineering_manager'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'product:roadmap:tactical:modify',
          'tech_lead'
        )
      ).toBe(false)
    })

    it('should verify cloud infrastructure access', () => {
      expect(
        enterpriseManager.hasAccess(
          'engineering:infrastructure:cloud:resources:delete',
          'director'
        )
      ).toBe(true)
      expect(
        enterpriseManager.hasAccess(
          'engineering:infrastructure:cloud:resources:delete',
          'engineering_manager'
        )
      ).toBe(false)
    })
  })

  describe('complex multi-tenant SaaS with feature flags', () => {
    const multiTenantManager = new PermissionManager(
      [
        'platform_admin',
        'tenant_owner',
        'tenant_admin',
        'tenant_manager',
        'tenant_user',
        'tenant_viewer',
        'api_service',
      ],
      {
        platform: {
          tenants: {
            create: ['platform_admin'],
            delete: ['platform_admin'],
            suspend: ['platform_admin'],
            view_all: ['platform_admin'],
            configure: ['platform_admin'],
          },
          features: {
            flags: {
              create: ['platform_admin'],
              modify: ['platform_admin'],
              delete: ['platform_admin'],
              view: ['platform_admin'],
            },
            rollout: {
              manage: ['platform_admin'],
              view: ['platform_admin'],
            },
          },
        },
        tenant: {
          settings: {
            branding: {
              modify: ['tenant_owner', 'tenant_admin'],
              view: ['tenant_owner', 'tenant_admin', 'tenant_manager'],
            },
            security: {
              sso: {
                configure: ['tenant_owner'],
                view: ['tenant_owner', 'tenant_admin'],
              },
              mfa: {
                enforce: ['tenant_owner', 'tenant_admin'],
                view: ['tenant_owner', 'tenant_admin', 'tenant_manager'],
              },
              ip_whitelist: {
                modify: ['tenant_owner'],
                view: ['tenant_owner', 'tenant_admin'],
              },
            },
            integrations: {
              webhooks: {
                create: ['tenant_owner', 'tenant_admin'],
                delete: ['tenant_owner', 'tenant_admin'],
                view: ['tenant_owner', 'tenant_admin', 'tenant_manager'],
                trigger: [
                  'tenant_owner',
                  'tenant_admin',
                  'tenant_manager',
                  'api_service',
                ],
              },
              oauth: {
                configure: ['tenant_owner', 'tenant_admin'],
                view: ['tenant_owner', 'tenant_admin', 'tenant_manager'],
              },
            },
          },
          users: {
            invite: ['tenant_owner', 'tenant_admin', 'tenant_manager'],
            remove: ['tenant_owner', 'tenant_admin'],
            modify_role: ['tenant_owner', 'tenant_admin'],
            view: [
              'tenant_owner',
              'tenant_admin',
              'tenant_manager',
              'tenant_user',
            ],
            deactivate: ['tenant_owner', 'tenant_admin'],
          },
          data: {
            export: {
              full: ['tenant_owner'],
              partial: ['tenant_owner', 'tenant_admin'],
              view_history: ['tenant_owner', 'tenant_admin', 'tenant_manager'],
            },
            import: {
              bulk: ['tenant_owner', 'tenant_admin'],
              single: [
                'tenant_owner',
                'tenant_admin',
                'tenant_manager',
                'tenant_user',
              ],
            },
            delete: {
              bulk: ['tenant_owner'],
              single: ['tenant_owner', 'tenant_admin'],
            },
          },
        },
        api: {
          keys: {
            create: ['tenant_owner', 'tenant_admin'],
            revoke: ['tenant_owner', 'tenant_admin'],
            rotate: ['tenant_owner', 'tenant_admin', 'api_service'],
            view: ['tenant_owner', 'tenant_admin', 'tenant_manager'],
          },
          rate_limits: {
            modify: ['platform_admin', 'tenant_owner'],
            view: ['platform_admin', 'tenant_owner', 'tenant_admin'],
          },
          logs: {
            view: [
              'platform_admin',
              'tenant_owner',
              'tenant_admin',
              'tenant_manager',
            ],
            export: ['platform_admin', 'tenant_owner', 'tenant_admin'],
            delete: ['platform_admin'],
          },
        },
      }
    )

    it('should verify platform admin has full platform access', () => {
      expect(
        multiTenantManager.hasAccess(
          'platform:tenants:create',
          'platform_admin'
        )
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess(
          'platform:tenants:delete',
          'platform_admin'
        )
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess(
          'platform:features:flags:create',
          'platform_admin'
        )
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess('api:logs:delete', 'platform_admin')
      ).toBe(true)
    })

    it('should verify tenant owner cannot access platform features', () => {
      expect(
        multiTenantManager.hasAccess('platform:tenants:create', 'tenant_owner')
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess(
          'platform:features:flags:view',
          'tenant_owner'
        )
      ).toBe(false)
    })

    it('should verify tenant owner has full tenant access', () => {
      expect(
        multiTenantManager.hasAccess(
          'tenant:settings:security:sso:configure',
          'tenant_owner'
        )
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess(
          'tenant:settings:security:ip_whitelist:modify',
          'tenant_owner'
        )
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess('tenant:data:export:full', 'tenant_owner')
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess('tenant:data:delete:bulk', 'tenant_owner')
      ).toBe(true)
    })

    it('should verify tenant admin limitations', () => {
      expect(
        multiTenantManager.hasAccess(
          'tenant:settings:security:sso:configure',
          'tenant_admin'
        )
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess(
          'tenant:settings:security:sso:view',
          'tenant_admin'
        )
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess(
          'tenant:settings:security:ip_whitelist:modify',
          'tenant_admin'
        )
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess('tenant:data:export:full', 'tenant_admin')
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess(
          'tenant:data:export:partial',
          'tenant_admin'
        )
      ).toBe(true)
    })

    it('should verify tenant manager permissions', () => {
      expect(
        multiTenantManager.hasAccess('tenant:users:invite', 'tenant_manager')
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess('tenant:users:remove', 'tenant_manager')
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess(
          'tenant:users:modify_role',
          'tenant_manager'
        )
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess(
          'tenant:data:import:single',
          'tenant_manager'
        )
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess(
          'tenant:data:import:bulk',
          'tenant_manager'
        )
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess(
          'tenant:settings:integrations:webhooks:view',
          'tenant_manager'
        )
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess(
          'tenant:settings:integrations:webhooks:trigger',
          'tenant_manager'
        )
      ).toBe(true)
    })

    it('should verify tenant user limited access', () => {
      expect(
        multiTenantManager.hasAccess('tenant:users:view', 'tenant_user')
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess('tenant:users:invite', 'tenant_user')
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess('tenant:data:import:single', 'tenant_user')
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess(
          'tenant:data:export:view_history',
          'tenant_user'
        )
      ).toBe(false)
    })

    it('should verify tenant viewer is read-only', () => {
      expect(
        multiTenantManager.hasAccess('tenant:users:view', 'tenant_viewer')
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess(
          'tenant:data:import:single',
          'tenant_viewer'
        )
      ).toBe(false)
    })

    it('should verify api_service special permissions', () => {
      expect(
        multiTenantManager.hasAccess('api:keys:rotate', 'api_service')
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess('api:keys:create', 'api_service')
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess(
          'tenant:settings:integrations:webhooks:trigger',
          'api_service'
        )
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess(
          'tenant:settings:integrations:webhooks:view',
          'api_service'
        )
      ).toBe(false)
    })

    it('should verify API logs access hierarchy', () => {
      expect(
        multiTenantManager.hasAccess('api:logs:delete', 'platform_admin')
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess('api:logs:delete', 'tenant_owner')
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess('api:logs:export', 'tenant_owner')
      ).toBe(true)
      expect(
        multiTenantManager.hasAccess('api:logs:export', 'tenant_manager')
      ).toBe(false)
      expect(
        multiTenantManager.hasAccess('api:logs:view', 'tenant_manager')
      ).toBe(true)
      expect(multiTenantManager.hasAccess('api:logs:view', 'tenant_user')).toBe(
        false
      )
    })
  })

  describe('gaming platform permission structure', () => {
    const gamingManager = new PermissionManager(
      ['system', 'developer', 'moderator', 'vip', 'premium', 'member', 'trial'],
      {
        game: {
          servers: {
            dedicated: {
              create: ['system', 'developer', 'vip'],
              manage: ['system', 'developer', 'vip'],
              delete: ['system', 'developer'],
            },
            shared: {
              join: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
              ],
              create: ['system', 'developer', 'moderator', 'vip', 'premium'],
            },
            trial: {
              join: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
                'trial',
              ],
            },
          },
          matchmaking: {
            ranked: {
              queue: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
              ],
              view_stats: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
              ],
            },
            casual: {
              queue: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
                'trial',
              ],
            },
            tournaments: {
              create: ['system', 'developer', 'moderator'],
              join: ['system', 'developer', 'moderator', 'vip', 'premium'],
              spectate: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
                'trial',
              ],
            },
          },
        },
        social: {
          chat: {
            global: {
              write: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
              ],
              read: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
                'trial',
              ],
            },
            private: {
              create: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
              ],
              invite: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
              ],
            },
            moderation: {
              mute: ['system', 'developer', 'moderator'],
              ban: ['system', 'developer', 'moderator'],
              delete_message: ['system', 'developer', 'moderator'],
              view_logs: ['system', 'developer', 'moderator'],
            },
          },
          clans: {
            create: ['system', 'developer', 'moderator', 'vip', 'premium'],
            manage: {
              settings: ['system', 'developer'],
              members: ['system', 'developer', 'moderator'],
              disband: ['system', 'developer'],
            },
          },
          friends: {
            add: [
              'system',
              'developer',
              'moderator',
              'vip',
              'premium',
              'member',
            ],
            remove: [
              'system',
              'developer',
              'moderator',
              'vip',
              'premium',
              'member',
            ],
            block: [
              'system',
              'developer',
              'moderator',
              'vip',
              'premium',
              'member',
            ],
          },
        },
        store: {
          items: {
            exclusive: {
              purchase: ['system', 'developer', 'vip'],
              view: ['system', 'developer', 'moderator', 'vip', 'premium'],
            },
            premium: {
              purchase: ['system', 'developer', 'moderator', 'vip', 'premium'],
              view: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
              ],
            },
            standard: {
              purchase: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
              ],
              view: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
                'trial',
              ],
            },
          },
          trading: {
            marketplace: {
              list: ['system', 'developer', 'vip', 'premium', 'member'],
              buy: ['system', 'developer', 'vip', 'premium', 'member'],
              auction: ['system', 'developer', 'vip', 'premium'],
            },
            direct: {
              send: ['system', 'developer', 'moderator', 'vip', 'premium'],
              receive: [
                'system',
                'developer',
                'moderator',
                'vip',
                'premium',
                'member',
              ],
            },
          },
        },
        admin: {
          users: {
            ban: ['system', 'developer', 'moderator'],
            unban: ['system', 'developer', 'moderator'],
            view_history: ['system', 'developer', 'moderator'],
            modify_rank: ['system', 'developer'],
            reset_progress: ['system'],
          },
          economy: {
            grant_currency: ['system', 'developer'],
            remove_currency: ['system', 'developer'],
            view_transactions: ['system', 'developer', 'moderator'],
          },
          content: {
            upload: ['system', 'developer'],
            modify: ['system', 'developer'],
            delete: ['system', 'developer'],
            review: ['system', 'developer', 'moderator'],
          },
        },
      }
    )

    it('should verify system has absolute access', () => {
      expect(
        gamingManager.hasAccess('admin:users:reset_progress', 'system')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('admin:economy:grant_currency', 'system')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('game:servers:dedicated:delete', 'system')
      ).toBe(true)
    })

    it('should verify developer access', () => {
      expect(
        gamingManager.hasAccess('admin:users:reset_progress', 'developer')
      ).toBe(false)
      expect(
        gamingManager.hasAccess('admin:users:modify_rank', 'developer')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('admin:economy:grant_currency', 'developer')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('game:servers:dedicated:create', 'developer')
      ).toBe(true)
    })

    it('should verify moderator access', () => {
      expect(gamingManager.hasAccess('admin:users:ban', 'moderator')).toBe(true)
      expect(
        gamingManager.hasAccess('admin:users:modify_rank', 'moderator')
      ).toBe(false)
      expect(
        gamingManager.hasAccess('admin:economy:view_transactions', 'moderator')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('admin:economy:grant_currency', 'moderator')
      ).toBe(false)
      expect(
        gamingManager.hasAccess('social:chat:moderation:ban', 'moderator')
      ).toBe(true)
      expect(
        gamingManager.hasAccess(
          'game:matchmaking:tournaments:create',
          'moderator'
        )
      ).toBe(true)
    })

    it('should verify VIP exclusive access', () => {
      expect(
        gamingManager.hasAccess('game:servers:dedicated:create', 'vip')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('store:items:exclusive:purchase', 'vip')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('store:trading:marketplace:auction', 'vip')
      ).toBe(true)
      expect(gamingManager.hasAccess('admin:users:ban', 'vip')).toBe(false)
    })

    it('should verify premium user access', () => {
      expect(
        gamingManager.hasAccess('game:servers:dedicated:create', 'premium')
      ).toBe(false)
      expect(
        gamingManager.hasAccess('game:servers:shared:create', 'premium')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('store:items:exclusive:view', 'premium')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('store:items:exclusive:purchase', 'premium')
      ).toBe(false)
      expect(
        gamingManager.hasAccess('store:trading:direct:send', 'premium')
      ).toBe(true)
      expect(gamingManager.hasAccess('social:clans:create', 'premium')).toBe(
        true
      )
    })

    it('should verify member standard access', () => {
      expect(
        gamingManager.hasAccess('game:matchmaking:ranked:queue', 'member')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('game:matchmaking:tournaments:join', 'member')
      ).toBe(false)
      expect(
        gamingManager.hasAccess(
          'game:matchmaking:tournaments:spectate',
          'member'
        )
      ).toBe(true)
      expect(
        gamingManager.hasAccess('store:items:premium:view', 'member')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('store:items:premium:purchase', 'member')
      ).toBe(false)
      expect(
        gamingManager.hasAccess('store:trading:direct:receive', 'member')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('store:trading:direct:send', 'member')
      ).toBe(false)
    })

    it('should verify trial restrictions', () => {
      expect(gamingManager.hasAccess('game:servers:trial:join', 'trial')).toBe(
        true
      )
      expect(gamingManager.hasAccess('game:servers:shared:join', 'trial')).toBe(
        false
      )
      expect(
        gamingManager.hasAccess('game:matchmaking:casual:queue', 'trial')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('game:matchmaking:ranked:queue', 'trial')
      ).toBe(false)
      expect(gamingManager.hasAccess('social:chat:global:read', 'trial')).toBe(
        true
      )
      expect(gamingManager.hasAccess('social:chat:global:write', 'trial')).toBe(
        false
      )
      expect(gamingManager.hasAccess('social:friends:add', 'trial')).toBe(false)
      expect(
        gamingManager.hasAccess('store:items:standard:view', 'trial')
      ).toBe(true)
      expect(
        gamingManager.hasAccess('store:items:standard:purchase', 'trial')
      ).toBe(false)
    })
  })

  describe('extreme depth testing (15 levels)', () => {
    const extremeDepthManager = new PermissionManager(['root'], {
      l1: {
        l2: {
          l3: {
            l4: {
              l5: {
                l6: {
                  l7: {
                    l8: {
                      l9: {
                        l10: {
                          l11: {
                            l12: {
                              l13: {
                                l14: {
                                  l15: ['root'],
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    it('should handle 15 levels of nesting', () => {
      expect(
        extremeDepthManager.hasAccess(
          'l1:l2:l3:l4:l5:l6:l7:l8:l9:l10:l11:l12:l13:l14:l15',
          'root'
        )
      ).toBe(true)
      expect(
        extremeDepthManager.hasAccess(
          'l1:l2:l3:l4:l5:l6:l7:l8:l9:l10:l11:l12:l13:l14:l15',
          'other'
        )
      ).toBe(false)
    })

    it('should return false for all partial paths at extreme depth', () => {
      expect(extremeDepthManager.hasAccess('l1', 'root')).toBe(false)
      expect(extremeDepthManager.hasAccess('l1:l2:l3:l4:l5', 'root')).toBe(
        false
      )
      expect(
        extremeDepthManager.hasAccess('l1:l2:l3:l4:l5:l6:l7:l8:l9:l10', 'root')
      ).toBe(false)
      expect(
        extremeDepthManager.hasAccess(
          'l1:l2:l3:l4:l5:l6:l7:l8:l9:l10:l11:l12:l13:l14',
          'root'
        )
      ).toBe(false)
    })
  })

  describe('wide structure with many siblings', () => {
    const wideManager = new PermissionManager(['admin', 'user'], {
      module1: { action: ['admin'] },
      module2: { action: ['admin'] },
      module3: { action: ['admin'] },
      module4: { action: ['admin'] },
      module5: { action: ['admin'] },
      module6: { action: ['admin', 'user'] },
      module7: { action: ['admin', 'user'] },
      module8: { action: ['admin', 'user'] },
      module9: { action: ['admin', 'user'] },
      module10: { action: ['admin', 'user'] },
      module11: { action: ['user'] },
      module12: { action: ['user'] },
      module13: { action: [] },
      module14: { action: [] },
      module15: { action: [] },
    })

    it('should correctly handle admin-only modules', () => {
      expect(wideManager.hasAccess('module1:action', 'admin')).toBe(true)
      expect(wideManager.hasAccess('module1:action', 'user')).toBe(false)
      expect(wideManager.hasAccess('module5:action', 'admin')).toBe(true)
      expect(wideManager.hasAccess('module5:action', 'user')).toBe(false)
    })

    it('should correctly handle shared modules', () => {
      expect(wideManager.hasAccess('module6:action', 'admin')).toBe(true)
      expect(wideManager.hasAccess('module6:action', 'user')).toBe(true)
      expect(wideManager.hasAccess('module10:action', 'admin')).toBe(true)
      expect(wideManager.hasAccess('module10:action', 'user')).toBe(true)
    })

    it('should correctly handle user-only modules', () => {
      expect(wideManager.hasAccess('module11:action', 'admin')).toBe(false)
      expect(wideManager.hasAccess('module11:action', 'user')).toBe(true)
      expect(wideManager.hasAccess('module12:action', 'admin')).toBe(false)
      expect(wideManager.hasAccess('module12:action', 'user')).toBe(true)
    })

    it('should correctly handle restricted modules', () => {
      expect(wideManager.hasAccess('module13:action', 'admin')).toBe(false)
      expect(wideManager.hasAccess('module13:action', 'user')).toBe(false)
      expect(wideManager.hasAccess('module15:action', 'admin')).toBe(false)
      expect(wideManager.hasAccess('module15:action', 'user')).toBe(false)
    })
  })
})
