import { useCurrentOrganization } from '@/store/auth-store'
import { useLocalStorage } from './use-localstorage'

export function useScopedStorage<T>(scope: string, initialValue: T) {
  const orgId = useCurrentOrganization()?.id ?? 'no-org'
  return useLocalStorage<T>(`${orgId}:${scope}`, initialValue)
}
