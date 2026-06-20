export type ServerUser = {
  id: string
  email: string
  name: string
  login: string
  disabled: boolean
  role: string
  lastSeenAt?: string
  createdAt: string
  updatedAt: string
}

export const SERVER_USER_ROLES = ['user', 'server_admin'] as const

async function parseError(res: Response): Promise<never> {
  let message = `Request failed (${res.status})`
  try {
    const body = (await res.json()) as { error?: string }
    if (body.error) {
      message = body.error
    }
  } catch {
    message = `Request failed (${res.status})`
  }
  throw new Error(message)
}

export async function listServerUsers(): Promise<ServerUser[]> {
  const res = await fetch('/api/v1/users', { credentials: 'include' })
  if (!res.ok) {
    return parseError(res)
  }
  const data = (await res.json()) as { users: ServerUser[] }
  return data.users
}

export async function createServerUser(input: {
  email: string
  name: string
  password: string
  role: string
}): Promise<ServerUser> {
  const res = await fetch('/api/v1/users', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    return parseError(res)
  }
  return (await res.json()) as ServerUser
}

export async function updateServerUser(
  userId: string,
  input: { name?: string; role?: string; disabled?: boolean }
): Promise<ServerUser> {
  const res = await fetch(`/api/v1/users/${userId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  if (!res.ok) {
    return parseError(res)
  }
  return (await res.json()) as ServerUser
}

export async function disableServerUser(userId: string): Promise<void> {
  const res = await fetch(`/api/v1/users/${userId}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    return parseError(res)
  }
}
