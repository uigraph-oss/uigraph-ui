type NavItem = {
  id: string
  label: string
  nested?: boolean
  hidden?: boolean
}

export function generateNavItems<T = object>(...input: (NavItem & T)[]) {
  return input
    .filter((item) => !item.hidden)
    .map((item) => ({
      ...item,

      isActive: (pathname: string) => {
        if (item.nested) {
          return pathname.startsWith(item.id)
        }

        return pathname === item.id
      },
    }))
}
