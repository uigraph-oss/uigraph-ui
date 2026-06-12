'use client'

import { useParams } from 'react-router-dom'

export function UserInvitePage() {
  const { orgId } = useParams() as { orgId: string }

  console.log(orgId)

  return <div>user-invite-page</div>
}
