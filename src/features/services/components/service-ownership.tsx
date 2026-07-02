'use client'

import { ExternalLinkIcon, MessageIcon, UserIcon } from '@/assets/svgs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import {
  mockCollaborationInfo,
  mockOwners,
} from '@/features/services/constants/mock-data'

interface ServiceOwnershipProps {
  serviceId: string
}

export function ServiceOwnership({}: ServiceOwnershipProps) {
  function getRoleColor(role: string) {
    switch (role) {
      case 'owner':
        return 'bg-red-100 text-red-800'
      case 'contributor':
        return 'bg-blue-100 text-blue-800'
      case 'reviewer':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-[#1E2533] text-[#F4F7FC]'
    }
  }

  function getRoleDescription(role: string) {
    switch (role) {
      case 'owner':
        return 'Primary owner responsible for the service'
      case 'contributor':
        return 'Active contributor to the service codebase'
      case 'reviewer':
        return 'Code reviewer and quality gatekeeper'
      default:
        return 'Team member'
    }
  }

  return (
    <div className="space-y-6">
      {/* Ownership Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {mockOwners.map((owner) => (
          <div
            key={owner.id}
            className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm"
          >
            <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#2A3242]">
                    <UserIcon className="h-5 w-5 text-[#828DA3]" />
                  </div>
                  <div>
                    <h3 className="text-lg leading-none font-semibold">
                      {owner.name}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {owner.email}
                    </p>
                  </div>
                </div>
                <Badge className={getRoleColor(owner.role)}>{owner.role}</Badge>
              </div>
            </div>
            <div className="px-6">
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-[#D2D9E6]">Team</h4>
                  <p className="text-sm text-[#828DA3]">{owner.team}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-[#D2D9E6]">
                    Role Description
                  </h4>
                  <p className="text-sm text-[#828DA3]">
                    {getRoleDescription(owner.role)}
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <MessageIcon className="h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLinkIcon className="h-4 w-4" />
                    Profile
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Collaboration Information */}
      <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
        <div className="@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6">
          <h3 className="leading-none font-semibold">
            Collaboration & Communication
          </h3>
          <p className="text-muted-foreground text-sm">
            Channels and contacts for team collaboration
          </p>
        </div>
        <div className="px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-[#D2D9E6]">
                  Communication Channels
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageIcon className="h-4 w-4 text-[#828DA3]" />
                      <span className="text-sm">Slack Channel</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-[#1E2533] px-2 py-1 text-sm">
                        {mockCollaborationInfo.slackChannel}
                      </code>
                      <Button variant="ghost" size="sm">
                        <ExternalLinkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserIcon className="h-4 w-4 text-[#828DA3]" />
                      <span className="text-sm">On-Call</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#828DA3]">
                        Active rotation
                      </span>
                      <Button variant="ghost" size="sm">
                        <ExternalLinkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-[#D2D9E6]">
                  Team Resources
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Team Wiki</span>
                    <Button variant="ghost" size="sm">
                      <ExternalLinkIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="mb-2 text-sm font-medium text-[#D2D9E6]">
                  Code Reviewers
                </h4>
                <div className="space-y-1">
                  {mockCollaborationInfo.codeReviewers.map((email) => (
                    <div key={email} className="text-sm text-[#828DA3]">
                      {email}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="mb-2 text-sm font-medium text-[#D2D9E6]">
                  Escalation Contacts
                </h4>
                <div className="space-y-1">
                  {mockCollaborationInfo.escalationContacts.map((email) => (
                    <div key={email} className="text-sm text-[#828DA3]">
                      {email}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4 px-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-[#F4F7FC]">
                {mockOwners.length}
              </div>
              <div className="text-sm text-[#828DA3]">Team Members</div>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4 px-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {mockOwners.filter((o) => o.role === 'owner').length}
              </div>
              <div className="text-sm text-[#828DA3]">Owners</div>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4 px-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {mockOwners.filter((o) => o.role === 'contributor').length}
              </div>
              <div className="text-sm text-[#828DA3]">Contributors</div>
            </div>
          </div>
        </div>
        <div className="bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6 shadow-sm">
          <div className="p-4 px-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mockOwners.filter((o) => o.role === 'reviewer').length}
              </div>
              <div className="text-sm text-[#828DA3]">Reviewers</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
