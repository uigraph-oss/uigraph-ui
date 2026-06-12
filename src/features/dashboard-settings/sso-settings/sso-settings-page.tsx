'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { SettingsHeader } from '../components/settings-header'

export function SSOSettingsPage() {
  const [domain, setDomain] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleEnableSSO() {
    if (!domain) return

    setIsLoading(true)

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      console.log('Redirecting to WorkOS setup for domain:', domain)
      alert(
        `In a real app, you would be redirected to the SSO provider setup for ${domain}`
      )
    } catch (error) {
      console.error('Failed to initiate SSO setup', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <SettingsHeader
        title="SSO Settings"
        description="Manage your Single Sign-On (SSO) configuration and security preferences."
      />
      <div className="space-y-3 p-6">
        <div className="rounded-[12px] border border-[#E5E7E9] bg-white p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-50 p-2">
              <ShieldCheck className="h-6 w-6 text-[#015AEB]" />
            </div>
            <div className="flex-1">
              <h3 className="mb-1 text-[16px] leading-[1.33] font-semibold text-[#111110]">
                Configure Single Sign-On
              </h3>
              <p className="mb-6 max-w-2xl text-sm text-[#6B7480]">
                Enable SSO to allow your team members to log in using your
                organization&apos;s identity provider (IdP). We support SAML and
                OIDC protocols.
              </p>

              <div className="max-w-md space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm leading-[1.33] font-normal text-[#6B7480]">
                    Organization Domain
                  </label>
                  <Input
                    placeholder="e.g. acme.com"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    className="h-11"
                  />
                  <p className="mt-1.5 text-xs text-[#6B7480]">
                    Enter the email domain your team uses for authentication.
                  </p>
                </div>

                <Button
                  className="h-[44px] w-full rounded-[12.85px] bg-[#015AEB] text-sm leading-[1.33] text-white hover:bg-blue-700"
                  onClick={handleEnableSSO}
                  disabled={!domain || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Enable SSO'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
