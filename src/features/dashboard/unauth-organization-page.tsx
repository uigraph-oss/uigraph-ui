import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useOrganizationContext } from '@/contexts'
import { env } from '@/env'

export function UnauthOrganizationPage() {
  const { organizations, account } = useOrganizationContext()
  const clientUrl = new URL(env.clientOrigin)
  const hostname = clientUrl.hostname
  const protocol = clientUrl.protocol
  const portSuffix = clientUrl.port ? `:${clientUrl.port}` : ''

  return (
    <div className="bg-shading-gray flex min-h-screen items-center justify-center px-4 py-10">
      <div className="border-stock w-full max-w-3xl space-y-8 rounded-[1.5rem] border bg-white p-10 shadow-xs">
        <div className="space-y-3 text-center">
          <p className="text-paragraph text-sm">
            {account?.email ? `Signed in as ${account.email}` : 'Signed in'}
          </p>
          <h1 className="text-foreground text-[2rem] leading-tight font-semibold">
            Choose an organization
          </h1>
          <p className="text-paragraph text-base">
            Select a workspace to continue. Each organization uses its own
            domain.
          </p>
        </div>

        {organizations.length === 0 ? (
          <div className="border-stock/70 bg-shading rounded-[1.25rem] border-2 border-dashed px-8 py-12 text-center">
            <p className="text-foreground text-base font-semibold">
              No organizations found for this account.
            </p>
            <p className="text-paragraph mt-2 text-sm">
              Contact an admin or create a workspace from the main site.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {organizations.map((org) => {
              const initial =
                org?.name?.trim()?.charAt(0)?.toUpperCase() ??
                org?.domainSlug?.trim()?.charAt(0)?.toUpperCase() ??
                'U'
              const domain = org?.domainSlug
                ? `${org.domainSlug}.${hostname}`
                : hostname

              return (
                <li
                  key={org?.organizationId ?? org?.domainSlug ?? org?.name}
                  className="border-stock bg-shading flex items-center justify-between rounded-[1.2rem] border px-5 py-4"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="size-12">
                      <AvatarFallback className="border-stock/60 text-foreground bg-white text-lg font-semibold">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-foreground text-base leading-tight font-semibold">
                        {org?.name || 'Untitled workspace'}
                      </p>
                      <p className="text-paragraph text-sm">{domain}</p>
                    </div>
                  </div>

                  <Button
                    asChild
                    preset="primary"
                    disabled={!org?.domainSlug}
                    className="min-w-[8rem]"
                  >
                    <a
                      href={`${protocol}//${org?.domainSlug}.${hostname}${portSuffix}`}
                    >
                      Open
                    </a>
                  </Button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
