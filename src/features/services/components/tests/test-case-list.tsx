'use client'

import type { TestCase } from '@/api-v2/.gql/graphql'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Reorder } from 'framer-motion'
import {
  Copy,
  EllipsisVertical,
  GripVertical,
  Pencil,
  Trash2,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useServiceTestsContext } from '../context/service-tests-context'
import { ConfigureTestCaseModal } from './modals/configure-test-case-modal'
import {
  transformTestCaseToSchema,
  transformToUpdateTestCase,
} from './modals/configure-test-case-modal/transformers'

type TestCaseListProps = {
  onView?: (testCase: TestCase) => void
}

type DragState = {
  originalItems: TestCase[]
  draggedItemId: string | null
}

function getOrder(item: TestCase | undefined, fallbackIndex: number): number {
  return item?.order ?? fallbackIndex + 1
}

function calculateNewOrder(
  items: TestCase[],
  movedIndex: number
): number | null {
  if (items.length === 0) return null
  if (items.length === 1) return 1

  const movedItem = items[movedIndex]
  if (!movedItem?.testCaseId) return null

  const prevItem = movedIndex > 0 ? items[movedIndex - 1] : undefined
  const nextItem =
    movedIndex < items.length - 1 ? items[movedIndex + 1] : undefined

  const prevOrder = prevItem ? getOrder(prevItem, movedIndex - 1) : 0
  const nextOrder = nextItem
    ? getOrder(nextItem, movedIndex + 1)
    : prevOrder + 1

  if (prevOrder === 0) {
    return nextOrder / 2
  }

  if (!nextItem) {
    return prevOrder + 1
  }

  return prevOrder + (nextOrder - prevOrder) / 2
}

export function TestCaseList({ onView }: TestCaseListProps) {
  const { testCases, serviceId, duplicateTestCase, reorderTestCase } =
    useServiceTestsContext()

  const [items, setItems] = useState<TestCase[]>(testCases)
  const dragStateRef = useRef<DragState>({
    originalItems: [],
    draggedItemId: null,
  })

  useEffect(() => {
    setItems(testCases)
  }, [testCases])

  function handleReorder(newItems: TestCase[]) {
    setItems(newItems)
  }

  function handleDragStart(itemId: string) {
    dragStateRef.current = {
      originalItems: [...items],
      draggedItemId: itemId,
    }
  }

  function handleDragEnd() {
    const { originalItems, draggedItemId } = dragStateRef.current

    if (!draggedItemId || originalItems.length === 0) {
      dragStateRef.current = { originalItems: [], draggedItemId: null }
      return
    }

    const originalIndex = originalItems.findIndex(
      (item) => item.testCaseId === draggedItemId
    )
    const newIndex = items.findIndex(
      (item) => item.testCaseId === draggedItemId
    )

    if (originalIndex === -1 || newIndex === -1 || originalIndex === newIndex) {
      dragStateRef.current = { originalItems: [], draggedItemId: null }
      return
    }

    const newOrder = calculateNewOrder(items, newIndex)

    if (newOrder !== null) {
      void reorderTestCase(draggedItemId, newOrder)
    }

    dragStateRef.current = { originalItems: [], draggedItemId: null }
  }

  return (
    <Reorder.Group
      axis="y"
      values={items}
      onReorder={handleReorder}
      className="flex flex-col gap-3"
    >
      {items.map((testCase) => (
        <TestCaseRow
          key={testCase.testCaseId}
          testCase={testCase}
          serviceId={serviceId}
          onView={onView}
          onDuplicate={duplicateTestCase}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        />
      ))}
    </Reorder.Group>
  )
}

type TestCaseRowProps = {
  testCase: TestCase
  serviceId: string
  onView?: (testCase: TestCase) => void
  onDuplicate: (testCase: TestCase) => void
  onDragStart?: (itemId: string) => void
  onDragEnd?: () => void
}

function TestCaseRow({
  testCase,
  onView,
  onDuplicate,
  onDragStart,
  onDragEnd,
}: TestCaseRowProps) {
  const { orgId, serviceId, updateTestCaseMutation, deleteTestCaseMutation } =
    useServiceTestsContext()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const isDraggingRef = useRef(false)

  const isManual = testCase.type?.toLowerCase() === 'manual'

  function handleCardClick() {
    if (onView) {
      onView(testCase)
    }
  }

  function handleDeleteClick(e: React.MouseEvent) {
    e.stopPropagation()
    setIsMenuOpen(false)
    setIsDeleteDialogOpen(true)
  }

  async function handleConfirmDelete() {
    if (!testCase.testCaseId || !testCase.testPackId || !orgId) {
      toast.error('Unable to delete test case')
      return
    }

    try {
      await deleteTestCaseMutation({
        variables: {
          orgId,
          serviceId,
          id: testCase.testCaseId,
        },
      })
      toast.success('Test case deleted successfully')
    } catch (error) {
      toast.error('Failed to delete test case')
      console.error(error)
      throw error
    }
  }

  return (
    <Reorder.Item
      value={testCase}
      className={cn(
        'group border-border relative flex items-center gap-3 rounded-[16px] border bg-white p-4 transition-colors',
        'hover:bg-accent/50 hover:border-primary/30',
        onView && 'cursor-pointer'
      )}
      whileDrag={{ scale: 1.02, boxShadow: '0 10px 30px rgba(0,0,0,0.15)' }}
      onDragStart={() => {
        isDraggingRef.current = true
        if (testCase.testCaseId) {
          onDragStart?.(testCase.testCaseId)
        }
      }}
      onDragEnd={() => {
        setTimeout(() => {
          isDraggingRef.current = false
        }, 100)
        onDragEnd?.()
      }}
      onClick={(e) => {
        if (isDraggingRef.current) return

        const target = e.target as HTMLElement
        if (
          target.closest('button') ||
          target.closest('[role="menuitem"]') ||
          target.closest('[data-dropdown]') ||
          target.closest('[data-radix-popper-content-wrapper]')
        ) {
          return
        }
        if (onView) {
          handleCardClick()
        }
      }}
    >
      <div className="text-muted-foreground hover:text-foreground flex h-8 w-8 shrink-0 cursor-move items-center justify-center">
        <GripVertical className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="grid grid-cols-[1fr_1fr] items-center gap-3">
          <span className="min-w-0 truncate font-semibold">
            {testCase.title ?? 'Untitled'}
          </span>
          {(testCase.type ||
            testCase.isCritical ||
            (isManual && testCase.evidenceRequired) ||
            testCase.baselineRunResultId) && (
            <div className="flex flex-wrap items-center gap-1.5">
              {testCase.type && (
                <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs">
                  {testCase.type.toUpperCase()}
                </span>
              )}
              {testCase.isCritical && (
                <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs">
                  Critical
                </span>
              )}
              {isManual && testCase.evidenceRequired && (
                <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs">
                  Requires Evidence
                </span>
              )}
              {testCase.baselineRunResultId && (
                <span className="bg-muted text-muted-foreground rounded-md px-2 py-0.5 text-xs">
                  Baseline
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center">
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'h-8 w-8 opacity-0 group-hover:opacity-100',
                isMenuOpen && 'opacity-100'
              )}
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              <EllipsisVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(false)
                setIsEditModalOpen(true)
              }}
            >
              <Pencil className="h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation()
                setIsMenuOpen(false)
                onDuplicate(testCase)
              }}
            >
              <Copy className="h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDeleteClick}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="stroke-destructive h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <BetterDeleteConfirmationModal
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleConfirmDelete}
        title="Delete Test Case?"
        description="This action cannot be undone. The test case will be permanently deleted."
        deleteButtonText="Delete"
      />
      {testCase.testPackId && (
        <BetterDialogProvider
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
        >
          <ConfigureTestCaseModal
            mode="update"
            defaultValue={transformTestCaseToSchema(testCase)}
            onSubmit={async (data) => {
              await updateTestCaseMutation({
                variables: {
                  orgId: orgId!,
                  serviceId,
                  id: testCase.testCaseId!,
                  input: {
                    order: testCase.order ?? 0,
                    testPackId: testCase.testPackId!,
                    ...transformToUpdateTestCase(data),
                  },
                },
              })

              toast.success('Test case updated successfully')
              setIsEditModalOpen(false)
            }}
          />
        </BetterDialogProvider>
      )}
    </Reorder.Item>
  )
}
