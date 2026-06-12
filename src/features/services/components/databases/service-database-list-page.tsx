'use client'

import { DynamoDBIcon } from '@/assets/svgs'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { SectionNotFound } from '@/components/section-not-found'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { ChevronDown, Upload } from 'lucide-react'
import { useMemo, useState } from 'react'
import { GET_SERVICE_DB_QUERY } from '../../api/service-db'
import { useServiceContext } from '../../contexts/service-context'
import { DBSchemaUploadModal } from './components/db-schema-upload-modal'
import { NosqlBuilderModal } from './components/nosql-builder-modal'
import { ServiceDatabaseCard } from './service-database-card'

export function ServiceDatabaseListPage() {
  const { serviceId } = useServiceContext()
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false)
  const [isNosqlBuilderModalOpen, setIsNosqlBuilderModalOpen] = useState(false)

  const { data, loading } = useQuery(GET_SERVICE_DB_QUERY, {
    fetchPolicy: 'cache-first',
    variables: {
      serviceId: serviceId,
    },
  })

  const databaseSchemas = useMemo(() => {
    return arrayNonNullable(data?.v1GetServiceDB)
  }, [data])

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="Databases"
        description="Manage database schemas, access patterns, and event messages."
      >
        <div className="flex items-center">
          <Button
            onClick={() => setIsUploadModalOpen(true)}
            preset="primary"
            className="rounded-r-none pr-3!"
          >
            <Upload className="h-4 w-4" />
            Upload Schema
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                preset="primary"
                className="border-stock/10 rounded-l-none border-l pl-3!"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent side="bottom" align="end">
              <DropdownMenuItem
                onClick={() => setIsNosqlBuilderModalOpen(true)}
              >
                <DynamoDBIcon className="h-4 w-4" />
                Open NoSQL Editor
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </DashboardSectionHeader>

      <DashboardSectionContent>
        {loading ? (
          <SectionLoader />
        ) : databaseSchemas.length > 0 ? (
          <div
            className="grid gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            }}
          >
            {databaseSchemas.map((db) => (
              <ServiceDatabaseCard key={db.serviceDBId} db={db} />
            ))}
          </div>
        ) : (
          <SectionNotFound plain label="No database schemas found" />
        )}
      </DashboardSectionContent>

      <BetterDialogProvider
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
      >
        <DBSchemaUploadModal onOpenChange={setIsUploadModalOpen} />
      </BetterDialogProvider>

      <NosqlBuilderModal
        open={isNosqlBuilderModalOpen}
        onOpenChange={setIsNosqlBuilderModalOpen}
      />
    </div>
  )
}
