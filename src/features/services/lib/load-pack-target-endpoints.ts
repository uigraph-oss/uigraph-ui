export type PackTargetEndpoint = {
  apiEndpointId: string
  method: string
  path: string
}

/**
 * TestPack.loadConfig.targetEndpoints is a bare string array in the schema
 * (no structured id field), so the endpoint's id is packed into the string
 * itself. That's what lets the Add Run modal resolve a scoped pack's
 * declared endpoints straight back to an apiEndpointId without re-querying
 * the API catalog.
 */
export function encodePackTargetEndpoint(endpoint: PackTargetEndpoint): string {
  return `${endpoint.apiEndpointId}::${endpoint.method} ${endpoint.path}`
}

export function decodePackTargetEndpoint(
  raw: string
): PackTargetEndpoint | null {
  const [id, rest] = raw.split('::')
  if (!id || !rest) return null
  const [method, ...pathParts] = rest.split(' ')
  const path = pathParts.join(' ')
  if (!method || !path) return null
  return { apiEndpointId: id, method, path }
}

export function decodePackTargetEndpoints(
  raw: readonly (string | null | undefined)[] | null | undefined
): PackTargetEndpoint[] {
  return (raw ?? [])
    .map((r) => (r ? decodePackTargetEndpoint(r) : null))
    .filter((e): e is PackTargetEndpoint => e !== null)
}
