import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Database } from 'lucide-react'
import type { IconType } from 'react-icons'
import { SiMongodb, SiMysql, SiPostgresql, SiSqlite } from 'react-icons/si'

type DbTypeStyle = {
  label: string
  Icon: IconType
  className: string
  iconClassName: string
}

function getDbTypeStyle(type?: string | null): DbTypeStyle {
  const value = type?.toLowerCase()

  if (value === 'postgresql' || value === 'postgres') {
    return {
      label: 'PostgreSQL',
      Icon: SiPostgresql,
      className: 'border-sky-500/30 bg-sky-500/10 text-sky-300',
      iconClassName: 'text-sky-400',
    }
  }
  if (value === 'mysql') {
    return {
      label: 'MySQL',
      Icon: SiMysql,
      className: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
      iconClassName: 'text-amber-400',
    }
  }
  if (value === 'mongodb' || value === 'document') {
    return {
      label: 'MongoDB',
      Icon: SiMongodb,
      className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
      iconClassName: 'text-emerald-400',
    }
  }
  if (value === 'dynamodb') {
    return {
      label: 'DynamoDB',
      Icon: Database,
      className: 'border-violet-500/30 bg-violet-500/10 text-violet-300',
      iconClassName: 'text-violet-400',
    }
  }
  if (value === 'sqlite') {
    return {
      label: 'SQLite',
      Icon: SiSqlite,
      className: 'border-blue-500/30 bg-blue-500/10 text-blue-300',
      iconClassName: 'text-blue-400',
    }
  }

  return {
    label: type ?? 'Unknown',
    Icon: Database,
    className: 'border-[#2A3242] bg-[#1E2533] text-[#C7D0E0]',
    iconClassName: 'text-[#828DA3]',
  }
}

export function DbTypeBadge({
  type,
  className,
}: {
  type?: string | null
  className?: string
}) {
  const style = getDbTypeStyle(type)

  return (
    <Badge
      className={cn(
        'gap-1.5 border px-2 py-0.5 text-xs font-medium',
        style.className,
        className
      )}
    >
      <style.Icon className={cn('h-3.5 w-3.5', style.iconClassName)} />
      {style.label}
    </Badge>
  )
}
