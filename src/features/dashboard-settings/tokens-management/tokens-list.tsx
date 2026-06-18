'use client'

import { FunctionalPagination } from '@/components/common/functional-pagination'
import { SectionLoader } from '@/components/section-loader'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useCurrentOrganization } from '@/store/auth-store'
import { useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import Fuse from 'fuse.js'
import { Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { LIST_TOKENS } from '../api/tokens'
import { TokenTable } from './token-table'

export function TokensList({
  onRevoke,
  onRotate,
}: {
  onRevoke: (tokenId: string) => Promise<void>
  onRotate: (tokenId: string) => Promise<{ plaintext: string } | null>
}) {
  const organizationId = useCurrentOrganization()?.id

  const tokensQuery = useQuery(LIST_TOKENS, {
    fetchPolicy: 'cache-first',
    variables: { organizationId },
  })

  const [searchTerm, setSearchTerm] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(20)
  const [currentPage, setCurrentPage] = useState(1)

  const tokensFuse = useMemo(() => {
    const tokens = arrayNonNullable(tokensQuery.data?.ListTokens || [])

    const fuse = new Fuse(tokens, {
      keys: ['name', 'tokenId', 'fingerprint'],
    })

    return { tokens, fuse }
  }, [tokensQuery.data?.ListTokens])

  const filteredTokens = useMemo(() => {
    if (!searchTerm.trim()) return tokensFuse.tokens

    const term = searchTerm.toLowerCase()
    return tokensFuse.fuse.search(term).map((result) => result.item)
  }, [tokensFuse, searchTerm])

  const paginatedTokens = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage
    const endIndex = startIndex + rowsPerPage
    return filteredTokens.slice(startIndex, endIndex)
  }, [filteredTokens, currentPage, rowsPerPage])

  useEffect(() => {
    setCurrentPage((prev) => {
      const maxPage = Math.max(
        1,
        Math.ceil(filteredTokens.length / rowsPerPage)
      )
      return Math.min(prev, maxPage)
    })
  }, [filteredTokens.length, rowsPerPage])

  return (
    <>
      <div className="px-6 pt-4">
        <div className="space-y-6 rounded-[12px] border border-[#E5E7E9]">
          <div className="flex items-center justify-between px-6 pt-6 pb-4">
            <div className="relative max-w-[420px]">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search tokens"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="h-11 w-full rounded-[12px] border-gray-300 bg-white pt-3 pb-3 pl-10"
              />
            </div>

            <div className="text-muted-foreground flex items-center gap-2 text-sm">
              <span>Show per page:</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(value) => {
                  setRowsPerPage(Number(value))
                  setCurrentPage(1)
                }}
              >
                <SelectTrigger className="h-12 w-[120px] rounded-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 rows</SelectItem>
                  <SelectItem value="10">10 rows</SelectItem>
                  <SelectItem value="20">20 rows</SelectItem>
                  <SelectItem value="50">50 rows</SelectItem>
                  <SelectItem value="100">100 rows</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-stock overflow-x-auto border-t">
            {tokensQuery.loading && !tokensQuery.data ? (
              <SectionLoader label="Loading tokens..." />
            ) : (
              <TokenTable
                tokens={paginatedTokens}
                onRevoke={onRevoke}
                onRotate={onRotate}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between px-6">
        <div className="text-muted-foreground text-sm">
          Total{' '}
          <span className="font-medium text-gray-700">
            {tokensFuse.tokens.length}
          </span>{' '}
          token{tokensFuse.tokens.length !== 1 ? 's' : ''}
        </div>

        <FunctionalPagination
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          totalPages={Math.max(
            1,
            Math.ceil(filteredTokens.length / rowsPerPage)
          )}
        />
      </div>
    </>
  )
}
