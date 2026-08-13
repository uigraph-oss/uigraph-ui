import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const DEFAULT_TAG_CLASS =
  'border-stock rounded-md border bg-[#1E2533] px-2 py-0.5 text-xs font-medium text-paragraph'

const MAX_TOOLTIP_TAGS = 20

export function TagList({
  tags,
  max = 4,
  className,
  tagClassName,
}: {
  tags: string[]
  max?: number
  className?: string
  tagClassName?: string | ((tag: string) => string)
}) {
  const hidden = tags.slice(max)

  return (
    <div className={cn('flex flex-wrap items-center gap-1.5', className)}>
      {tags.slice(0, max).map((tag) => (
        <span
          key={tag}
          title={tag}
          className={cn(
            'inline-block max-w-[180px] truncate',
            typeof tagClassName === 'function'
              ? tagClassName(tag)
              : (tagClassName ?? DEFAULT_TAG_CLASS)
          )}
        >
          {tag}
        </span>
      ))}
      {hidden.length > 0 ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={(e) => e.stopPropagation()}
              className="text-paragraph hover:text-foreground cursor-default px-0.5 text-xs font-medium transition-colors"
            >
              +{hidden.length} more
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-[320px]">
            <div className="flex flex-wrap gap-1">
              {hidden.slice(0, MAX_TOOLTIP_TAGS).map((tag) => (
                <span
                  key={tag}
                  className="bg-primary-foreground/15 rounded px-1.5 py-0.5 break-all"
                >
                  {tag}
                </span>
              ))}
              {hidden.length > MAX_TOOLTIP_TAGS ? (
                <span className="px-1.5 py-0.5">
                  and {hidden.length - MAX_TOOLTIP_TAGS} more
                </span>
              ) : null}
            </div>
          </TooltipContent>
        </Tooltip>
      ) : null}
    </div>
  )
}
