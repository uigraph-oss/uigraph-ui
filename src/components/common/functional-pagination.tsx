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
        className="h-8 w-8 rounded-md border border-gray-200 p-0 hover:bg-gray-50 disabled:opacity-50"
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
                ? 'h-8 min-w-[36px] rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100'
                : 'h-8 min-w-[36px] rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }
            variant="ghost"
            onClick={() => setCurrentPage(num)}
          >
            {num}
          </Button>
        ) : (
          <span key={idx} className="px-2 text-gray-500">
            ...
          </span>
        )
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 rounded-md border border-gray-200 p-0 hover:bg-gray-50 disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
