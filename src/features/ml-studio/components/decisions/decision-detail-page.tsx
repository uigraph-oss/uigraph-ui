'use client'

import { useParams } from 'react-router-dom'
import { mockDecisions } from '../../constants/mock-data'
import { ModelVersionLink } from '../model-version-link'
import { InfoRow, Panel } from '../panel'

export function DecisionDetailPage() {
  const { decisionId } = useParams<{ decisionId: string }>()
  const decision = mockDecisions.find((d) => d.id === decisionId)

  if (!decision) {
    return <div className="p-6 text-[#828DA3]">Decision not found.</div>
  }

  return (
    <div className="flex flex-col gap-5 p-6">
      <div>
        <h2 className="text-xl font-semibold text-[#F4F7FC]">
          {decision.title}
        </h2>
        <p className="mt-1 text-sm text-[#828DA3]">
          {decision.decisionMaker} ·{' '}
          {new Date(decision.decidedAt).toLocaleDateString()}
        </p>
      </div>

      <Panel>
        <InfoRow label="Linked to">
          <ModelVersionLink
            modelId={decision.modelId}
            versionId={decision.versionId}
          />
        </InfoRow>
        <InfoRow label="Decision">{decision.decision}</InfoRow>
        <InfoRow label="Reason">{decision.reason}</InfoRow>
        <InfoRow label="Impact">{decision.impact}</InfoRow>
        <InfoRow label="Decision maker">{decision.decisionMaker}</InfoRow>
      </Panel>
    </div>
  )
}
