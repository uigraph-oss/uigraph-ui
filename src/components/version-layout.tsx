import { useState } from 'react'
import { Button } from './ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select'

type VersionLayoutProps = {
  leftContent: React.ReactNode
  rightContent: React.ReactNode

  currentVersionId?: string | null
  versions: {
    versionId?: string | null
    versionNumber?: number | null
  }[]

  selectedLeftVersionId: string | null
  setSelectedLeftVersionId: (versionId: string | null) => void

  selectedRightVersionId: string | null
  setSelectedRightVersionId: (versionId: string | null) => void
}

export function VersionLayout({
  leftContent,
  rightContent,

  versions,
  currentVersionId,

  selectedLeftVersionId,
  setSelectedLeftVersionId,

  selectedRightVersionId,
  setSelectedRightVersionId,
}: VersionLayoutProps) {
  return (
    <>
      <div className="border-stock relative rounded-[1rem] border">
        {leftContent}

        <CompareVersionsSelector
          versions={versions}
          currentVersionId={currentVersionId}
          selectedVersionId={selectedLeftVersionId}
          setSelectedVersionId={setSelectedLeftVersionId}
        />
      </div>

      <div className="border-stock relative rounded-[1rem] border">
        {rightContent}

        <CompareVersionsSelector
          versions={versions}
          currentVersionId={currentVersionId}
          selectedVersionId={selectedRightVersionId}
          setSelectedVersionId={setSelectedRightVersionId}
        />
      </div>
    </>
  )
}

type VersionSelectorProps = {
  versions: {
    versionId?: string | null
    versionNumber?: number | null
  }[]

  currentVersionId?: number | string | null

  selectedVersionId: string | null
  setSelectedVersionId: (versionId: string | null) => void
}

export function CompareVersionsSelector({
  versions,
  currentVersionId,
  selectedVersionId,
  setSelectedVersionId,
}: VersionSelectorProps) {
  const [showCount, setShowCount] = useState(5)

  const options = versions
    .map((v, index) => ({
      ...v,
      versionId:
        v.versionId != null && v.versionId !== '' ? String(v.versionId) : null,
      versionNumber: v.versionNumber ?? index + 1,
    }))
    .filter((v): v is typeof v & { versionId: string } => v.versionId != null)

  const firstVersionId = options[0]?.versionId ?? null
  const displayValue =
    options.length === 0
      ? '__none__'
      : selectedVersionId != null && selectedVersionId !== ''
        ? String(selectedVersionId)
        : firstVersionId !== null
          ? firstVersionId
          : ''

  return (
    <div className="absolute top-2 left-3 z-10">
      <style>
        {`
          [data-radix-popper-content-wrapper] {
            z-index: 99999999 !important;
          }
        `}
      </style>

      <Select
        value={displayValue}
        onValueChange={(value) => setSelectedVersionId(value)}
      >
        <SelectTrigger className="bg-card text-card-foreground hover:bg-accent h-auto border-0 px-3 py-1.5 text-sm shadow-lg shadow-black/5 transition-all">
          <SelectValue placeholder="Select version" />
        </SelectTrigger>
        <SelectContent
          className="z-[100] max-h-[min(70vh,24rem)]"
          position="popper"
        >
          {options.length === 0 ? (
            <SelectItem value="__none__" disabled>
              No versions available
            </SelectItem>
          ) : (
            options.slice(0, showCount).map((version, i) => {
              const isCurrent =
                currentVersionId === version.versionId ||
                currentVersionId === version.versionNumber

              return (
                <SelectItem key={version.versionId} value={version.versionId}>
                  Version {version.versionNumber}
                  {i === 0 ? (
                    <span className="text-paragraph text-xs"> (Latest)</span>
                  ) : (
                    isCurrent && (
                      <span className="text-paragraph text-xs"> (Current)</span>
                    )
                  )}
                </SelectItem>
              )
            })
          )}

          {options.length > showCount && (
            <Button
              type="button"
              preset="ghost"
              className="text-muted-foreground hover:text-foreground mt-1 h-8 w-full justify-center rounded-sm text-sm"
              onClick={() => setShowCount((prev) => prev + 5)}
            >
              Show More
            </Button>
          )}
        </SelectContent>
      </Select>
    </div>
  )
}
