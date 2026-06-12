type JoinNestedPath<K extends string, P extends string> = `${K}:${P}`

type LeafPermissionPaths<T> = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [K in keyof T]: T[K] extends readonly any[]
    ? K & string
    : // eslint-disable-next-line @typescript-eslint/no-explicit-any
      T[K] extends Record<string, any>
      ? JoinNestedPath<K & string, LeafPermissionPaths<T[K]>>
      : never
}[keyof T]

type PermissionLeaf<Role extends string = string> = readonly Role[]

type PermissionGroup<Role extends string = string> = {
  readonly [key: string]: PermissionLeaf<Role> | PermissionGroup<Role>
}

type PermissionSchema<Role extends string = string> = PermissionGroup<Role>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PermissionManagerEntities<M extends PermissionManager<any, any>> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  M extends PermissionManager<any, infer Schema>
    ? LeafPermissionPaths<Schema>
    : never

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PermissionManagerRoles<M extends PermissionManager<any, any>> =
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  M extends PermissionManager<infer Roles, any> ? Roles : never

export class PermissionManager<
  const T extends string,
  const U extends PermissionSchema<T>,
> {
  constructor(
    private readonly roles: T[],
    private readonly definitions: U
  ) {
    this.roles = roles
    this.definitions = definitions
  }

  public hasAccess(
    permission: LeafPermissionPaths<U> | (string & {}),
    role: T | (string & {})
  ) {
    const path = permission.split(':')
    let current: PermissionGroup<T> | PermissionLeaf<T> | undefined =
      this.definitions

    for (const p of path) {
      // @ts-expect-error - Complex
      current = current[p]
    }

    if (!current || !Array.isArray(current) || current.length === 0) {
      return false
    }

    return current.includes(role)
  }

  public hasAccessStrict(
    permission: LeafPermissionPaths<U> | (string & {}),
    role: T | (string & {})
  ) {
    return this.hasAccess(permission, role)
  }
}
