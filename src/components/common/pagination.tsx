import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function Pagination() {
  return (
    <div className="flex items-center space-x-1">
      <Button variant="ghost" size="sm" className="p-2">
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        size="sm"
        className="h-[36px] w-[40px] rounded-[8px] border border-[#015AEB99] bg-[#015AEB33] text-black hover:bg-[#015AEB33]"
      >
        1
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="min-w-[32px] text-gray-600 hover:text-gray-900"
      >
        2
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="min-w-[32px] text-gray-600 hover:text-gray-900"
      >
        3
      </Button>

      <Button
        variant="ghost"
        size="sm"
        className="min-w-[32px] text-gray-600 hover:text-gray-900"
      >
        4
      </Button>

      <span className="px-2 text-gray-500">...</span>

      <Button
        variant="ghost"
        size="sm"
        className="min-w-[32px] text-gray-600 hover:text-gray-900"
      >
        10
      </Button>

      <Button variant="ghost" size="sm" className="p-2">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
