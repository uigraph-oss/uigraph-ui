'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  AlertTriangle,
  ExternalLink,
  Lightbulb,
  PencilIcon,
  Scale,
  Target,
} from 'lucide-react'
import { ReactNode, useState } from 'react'
import { useModelContext } from '../../contexts/model-context'
import { Panel } from '../panel'
import { ModelCardEditModal } from './model-card-edit-modal'

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 flex-1 px-4 py-3">
      <div className="text-[0.65rem] tracking-wide text-[#586378] uppercase">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-medium text-[#F4F7FC]">
        {value || <span className="font-normal text-[#586378]">—</span>}
      </div>
    </div>
  )
}

function Consideration({
  icon,
  title,
  value,
}: {
  icon: ReactNode
  title: string
  value: string
}) {
  return (
    <div className="border-stock rounded-xl border bg-transparent px-4 py-3.5">
      <div className="flex items-center gap-2 text-[#F4F7FC]">
        <span className="text-[#828DA3]">{icon}</span>
        <h4 className="text-sm font-semibold">{title}</h4>
      </div>
      <p className="mt-1.5 text-sm leading-relaxed text-[#828DA3]">
        {value || <span className="text-[#586378] italic">Not documented</span>}
      </p>
    </div>
  )
}

export function ModelCard() {
  const { model } = useModelContext()
  const [editing, setEditing] = useState(false)

  return (
    <>
      <Panel
        description={model.description || 'No description.'}
        className="md:col-span-2"
        action={
          <Button preset="outline" onClick={() => setEditing(true)}>
            <PencilIcon />
            Edit
          </Button>
        }
      >
        <div className="border-stock flex flex-wrap divide-x divide-[var(--color-stock)] overflow-hidden rounded-xl border bg-transparent">
          <Stat
            label="Problem type"
            value={
              model.problemType.charAt(0).toUpperCase() +
              model.problemType.slice(1)
            }
          />
          <Stat label="Domain" value={model.domain} />
          <Stat label="License" value={model.license} />
          <Stat label="Owners" value={model.owners} />
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <Consideration
            icon={<Target className="size-4" />}
            title="Intended use"
            value={model.intendedUse}
          />
          <Consideration
            icon={<AlertTriangle className="size-4" />}
            title="Limitations"
            value={model.limitations}
          />
          <Consideration
            icon={<Scale className="size-4" />}
            title="Ethical considerations"
            value={model.ethicalConsiderations}
          />
          <Consideration
            icon={<Lightbulb className="size-4" />}
            title="Caveats & recommendations"
            value={model.caveats}
          />
        </div>

        {model.references.length > 0 && (
          <div>
            <div className="text-xs tracking-wide text-[#586378] uppercase">
              References
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {model.references.map((ref) => {
                const isLink = /^https?:\/\//.test(ref)
                return isLink ? (
                  <a
                    key={ref}
                    href={ref}
                    target="_blank"
                    rel="noreferrer"
                    className="border-stock hover:text-primary flex items-center gap-1.5 rounded-md border bg-[#1E2533] px-2.5 py-1 text-xs text-[#828DA3]"
                  >
                    <ExternalLink className="size-3" />
                    {ref}
                  </a>
                ) : (
                  <span
                    key={ref}
                    className="border-stock rounded-md border bg-[#1E2533] px-2.5 py-1 text-xs text-[#828DA3]"
                  >
                    {ref}
                  </span>
                )
              })}
            </div>
          </div>
        )}

        {model.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {model.tags.map((tag) => (
              <Badge
                key={tag}
                className="border-stock rounded-md border bg-[#1E2533] text-[#828DA3]"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </Panel>

      <ModelCardEditModal
        model={model}
        open={editing}
        onOpenChange={setEditing}
      />
    </>
  )
}
