import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo } from 'react'

type Props = {
  currentPage: number
  totalPages: number
  setCurrentPage: (page: number) => void
}

export function FunctionalPagination({
  currentPage,
  totalPages,
  setCurrentPage,
}: Props) {
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages]
    }
    if (currentPage >= totalPages - 3) {
      return [
        1,
        '...',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ]
    }
    return [
      1,
      '...',
      currentPage - 1,
      currentPage,
      currentPage + 1,
      '...',
      totalPages,
    ]
  }, [currentPage, totalPages])

  return (
    <div className="flex items-center space-x-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 rounded-md border border-[#2A3242] p-0 hover:bg-[#1E2533] disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => setCurrentPage(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      {pageNumbers.map((num, idx) =>
        typeof num === 'number' ? (
          <Button
            key={num}
            size="sm"
            className={
              num === currentPage
                ? 'h-8 min-w-[36px] rounded-md border border-blue-500/30 bg-blue-500/15 px-3 py-1.5 text-sm font-medium text-blue-300 hover:bg-blue-500/25'
                : 'h-8 min-w-[36px] rounded-md border border-[#2A3242] bg-[#1E2533] px-3 py-1.5 text-sm text-[#D2D9E6] hover:bg-[#2A3242] hover:text-[#F4F7FC]'
            }
            variant="ghost"
            onClick={() => setCurrentPage(num)}
          >
            {num}
          </Button>
        ) : (
          <span key={idx} className="px-2 text-[#828DA3]">
            ...
          </span>
        )
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 rounded-md border border-[#2A3242] p-0 hover:bg-[#1E2533] disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
