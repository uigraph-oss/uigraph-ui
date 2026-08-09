import { useEffect, useState } from 'react'

export interface InstanceInfo {
  enterpriseEnabled: boolean
  billingUrl?: string
}

// Public, unauthenticated — lets the UI know whether this is the managed
// deployment (and where its billing settings live) without any Stripe/
// billing logic living in this repo. Self-hosted deployments never set
// UIGRAPH_ENTERPRISE_BILLING_URL, so enterpriseEnabled is always false there.
export function useInstanceInfo() {
  const [info, setInfo] = useState<InstanceInfo>({ enterpriseEnabled: false })

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch('/api/v1/instance-info')
        if (!res.ok) return
        setInfo((await res.json()) as InstanceInfo)
      } catch {
        // Self-hosted or offline — no billing link, nothing else to do.
      }
    })()
  }, [])

  return info
}
