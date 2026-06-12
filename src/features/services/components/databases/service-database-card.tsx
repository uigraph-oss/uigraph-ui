'use client'

import { GT } from '@/api'
import { MoreVerticalIcon } from '@/assets/svgs'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GET_DIAGRAM_QUERY } from '@/features/diagram-portal/api'
import { cn } from '@/lib/utils'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { formatDistanceToNow } from 'date-fns'
import { Calendar, Table2 } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import {
  DELETE_SERVICE_DB_MUTATION,
  GET_SERVICE_DB_QUERY,
} from '../../api/service-db'
import { useServiceContext } from '../../contexts/service-context'

type ServiceDatabaseCardProps = {
  db: GT.ServiceDb
}

export function ServiceDatabaseCard({ db }: ServiceDatabaseCardProps) {
  const { serviceId } = useServiceContext()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const { data: diagramData } = useQuery(GET_DIAGRAM_QUERY, {
    skip: !db.dbDiagramId,
    fetchPolicy: 'cache-first',
    variables: {
      diagramId: db.dbDiagramId!,
    },
  })

  const [deleteServiceDb] = useMutation(DELETE_SERVICE_DB_MUTATION, {
    awaitRefetchQueries: true,
    refetchQueries: [GET_SERVICE_DB_QUERY],
  })

  async function handleDelete() {
    if (!db.serviceDBId) return
    try {
      await deleteServiceDb({
        variables: { serviceDBId: db.serviceDBId },
      })
      toast.success('Database deleted successfully')
      setDeleteOpen(false)
    } catch (error) {
      console.error('Delete error:', error)
      toast.error('Failed to delete database')
    }
  }

  function getTypeBadgeClass(type?: string | null) {
    const value = type?.toLowerCase()
    if (value === 'postgresql' || value === 'postgres') {
      return 'bg-blue-100 text-blue-800'
    }
    if (value === 'mysql') {
      return 'bg-amber-100 text-amber-800'
    }
    if (value === 'mongodb' || value === 'document') {
      return 'bg-emerald-100 text-emerald-800'
    }
    if (value === 'dynamodb') {
      return 'bg-purple-100 text-purple-800'
    }
    if (value === 'sqlite') {
      return 'bg-green-100 text-green-800'
    }
    return 'bg-gray-100 text-gray-800'
  }

  const updatedDate = db.updatedAt
    ? new Date(db.updatedAt)
    : db.createdAt
      ? new Date(db.createdAt)
      : null

  const tables = arrayNonNullable(db.tables)
  const totalColumns = tables.reduce(
    (sum, table) => sum + (table?.columns?.length ?? 0),
    0
  )
  const totalIndexes = tables.reduce(
    (sum, table) => sum + (table?.indexes?.length ?? 0),
    0
  )

  return (
    <div className="group relative">
      <Link
        to={`/services/${serviceId}/data/${db.serviceDBId}`}
        className="group magic-shadow hover:ring-primary relative block cursor-pointer rounded-[1.4525rem] bg-white p-[0.62rem] pb-6 ring-1 ring-[#E5E7E9] transition-all duration-500 hover:shadow-[0_1.2313rem_2.4625rem_0_#00000029] hover:ring-2"
      >
        <Avatar
          className={cn(
            'border-stock/40 pointer-events-none aspect-square size-full rounded-[0.875rem] border-2 bg-white object-contain object-center'
          )}
        >
          <AvatarImage
            alt={db.dbName ?? ''}
            src={diagramData?.v1GetDiagram?.previewImageFileId ?? ''}
            className="object-contain"
          />
          <AvatarFallback className="bg-background/60 rounded-none">
            <span className="text-paragraph text-sm">
              Publish to get preview
            </span>
          </AvatarFallback>
        </Avatar>

        <div className="px-4 pt-[1.2313rem]">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h4 className="line-clamp-1 text-[1.385rem] font-semibold text-[#161616]">
              {db.dbName ?? 'Untitled Database'}
            </h4>
            <Badge className={cn('text-xs', getTypeBadgeClass(db.dbType))}>
              {db.dbType ?? 'unknown'}
            </Badge>
          </div>

          <div className="mb-4 flex items-center gap-4 text-sm text-[#939395]">
            <div className="flex items-center space-x-1">
              <Table2 className="h-4 w-4" />
              <span>{tables.length} tables</span>
            </div>
            <div className="flex items-center space-x-1">
              <span>{totalColumns} columns</span>
            </div>
            {totalIndexes > 0 && (
              <div className="flex items-center space-x-1">
                <span>{totalIndexes} indexes</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            {updatedDate && (
              <div className="flex items-center space-x-1 text-[#939395]">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">
                  Updated{' '}
                  {formatDistanceToNow(updatedDate, { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              'absolute top-2 right-2 h-6 w-6 bg-white/80 opacity-0 shadow-[0_5.81px_23.241px_0_rgba(0,0,0,0.12)] group-hover:opacity-100 hover:bg-white',
              isDropdownOpen && 'opacity-100'
            )}
          >
            <MoreVerticalIcon className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            Delete Database
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BetterDeleteConfirmationModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete Database"
        description={`Are you sure you want to delete "${db.dbName ?? 'this database'}"? This action cannot be undone and will remove all associated tables, columns, and data.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}
