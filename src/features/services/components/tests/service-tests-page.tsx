'use client'

import { V2 } from '@/api'
import type { TestCase } from '@/api/.gql/graphql'
import { BetterDeleteConfirmationModal } from '@/components/better-delete-confirmation-modal'
import { BetterDialogProvider } from '@/components/better-dialog'
import { SectionLoader } from '@/components/section-loader'
import { Button } from '@/components/ui/button'
import {
  DashboardSectionContent,
  DashboardSectionHeader,
} from '@/features/dashboard'
import { AnimatePresence } from 'framer-motion'
import { CirclePlus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { useServiceContext } from '../../contexts/service-context'
import {
  ServiceTestsContextProvider,
  useServiceTestsContext,
} from '../context/service-tests-context'
import { ConfigureTestCaseModal } from './modals/configure-test-case-modal'
import {
  transformTestCaseToSchema,
  transformToCreateTestCase,
  transformToUpdateTestCase,
} from './modals/configure-test-case-modal/transformers'
import { CreateTestPackModal } from './modals/create-test-pack-modal'
import { RunPackModal } from './modals/run-pack-modal'
import { TestInspector } from './test-inspector'
import { TestPackListPanel } from './test-pack-list-panel'
import { TestPackWorkspacePanel } from './test-pack-workspace-panel'

export function ServiceTestsPage() {
  const { serviceId } = useServiceContext()

  return (
    <ServiceTestsContextProvider serviceId={serviceId ?? ''}>
      <ServiceTestsPageContent />
    </ServiceTestsContextProvider>
  )
}

function ServiceTestsPageContent() {
  const {
    orgId,
    serviceId,
    selectedPackId,
    selectedPack,
    isTestPacksLoading,
    createPack,
    updatePack,
    deletePack,
    confirmRunPack,
    updateTestCaseMutation,
    createTestCaseMutation,
  } = useServiceTestsContext()

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [packToEdit, setPackToEdit] = useState<V2.TestPack | null>(null)
  const [packToDelete, setPackToDelete] = useState<V2.TestPack | null>(null)

  const [isCreateCaseModalOpen, setIsCreateCaseModalOpen] = useState(false)
  const [isUpdateCaseModalOpen, setIsUpdateCaseModalOpen] = useState(false)
  const [isTestCaseDetailDrawerOpen, setIsTestCaseDetailDrawerOpen] =
    useState(false)
  const [caseToEdit, setCaseToEdit] = useState<TestCase | null>(null)
  const [caseToView, setCaseToView] = useState<TestCase | null>(null)
  const [isRunPackModalOpen, setIsRunPackModalOpen] = useState(false)

  function handleNewTestPack() {
    setIsCreateModalOpen(true)
  }

  function handleEditPack(pack: V2.TestPack) {
    setPackToEdit(pack)
    setIsUpdateModalOpen(true)
  }

  function handleDeletePack(pack: V2.TestPack) {
    setPackToDelete(pack)
    setIsDeleteModalOpen(true)
  }

  async function handleCreatePack(data: {
    name: string
    type: 'smoke' | 'regression' | 'manual'
  }) {
    try {
      await createPack(data)
      setIsCreateModalOpen(false)
    } catch {
      // Error handled in context
    }
  }

  async function handleUpdatePack(data: {
    name: string
    type: 'smoke' | 'regression' | 'manual'
  }) {
    if (!packToEdit?.testPackId) return
    try {
      await updatePack(packToEdit.testPackId, data)
      setIsUpdateModalOpen(false)
      setPackToEdit(null)
    } catch {
      // Error handled in context
    }
  }

  async function handleConfirmDelete() {
    if (!packToDelete?.testPackId) return
    try {
      await deletePack(packToDelete.testPackId)
      setIsDeleteModalOpen(false)
      setPackToDelete(null)
    } catch {
      // Error handled in context
    }
  }

  function handleAddTestCase() {
    if (!selectedPackId) {
      toast.error('Please select a test pack first')
      return
    }
    setIsCreateCaseModalOpen(true)
  }

  function handleEditTestCase(testCase: TestCase) {
    setCaseToEdit(testCase)
    setIsUpdateCaseModalOpen(true)
  }

  function handleRunPack() {
    if (!selectedPackId) {
      toast.error('Please select a test pack first')
      return
    }
    setIsRunPackModalOpen(true)
  }

  async function handleConfirmRunPack(data: {
    environment: string
    releaseLabel?: string
  }) {
    try {
      await confirmRunPack(data)
      setIsRunPackModalOpen(false)
    } catch {
      // Error handled in context
    }
  }

  return (
    <div className="flex h-full flex-col">
      <DashboardSectionHeader
        title="Tests"
        description="Manage smoke, regression, and manual test packs."
      >
        <Button preset="primary" onClick={handleNewTestPack}>
          <CirclePlus className="h-4 w-4" />
          New Test Pack
        </Button>
      </DashboardSectionHeader>

      <DashboardSectionContent noPadding>
        {isTestPacksLoading ? (
          <div className="flex h-full min-h-[300px] w-full flex-col items-center justify-center">
            <SectionLoader label="Loading test packs..." />
          </div>
        ) : (
          <div className="flex h-full">
            <TestPackListPanel
              onCreatePack={handleNewTestPack}
              onEditPack={handleEditPack}
              onDeletePack={handleDeletePack}
            />

            <div className="flex-1 overflow-hidden p-3">
              <div className="size-full min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50 transition-all duration-200">
                <TestPackWorkspacePanel
                  onAddTestCase={handleAddTestCase}
                  onRunPack={handleRunPack}
                  onViewTestCase={(testCase) => {
                    setCaseToView(testCase)
                    setIsTestCaseDetailDrawerOpen(true)
                  }}
                />
              </div>
            </div>

            <AnimatePresence>
              {isTestCaseDetailDrawerOpen && caseToView && (
                <TestInspector
                  testCase={caseToView}
                  testPack={selectedPack}
                  open={isTestCaseDetailDrawerOpen}
                  onClose={() => {
                    setIsTestCaseDetailDrawerOpen(false)
                    setCaseToView(null)
                  }}
                  onEdit={handleEditTestCase}
                  onRunTest={() => selectedPackId && handleRunPack()}
                  onRerun={() => selectedPackId && handleRunPack()}
                />
              )}
            </AnimatePresence>
          </div>
        )}
      </DashboardSectionContent>

      <BetterDialogProvider
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
      >
        <CreateTestPackModal mode="create" onSubmit={handleCreatePack} />
      </BetterDialogProvider>

      <BetterDialogProvider
        open={isUpdateModalOpen}
        onOpenChange={(open) => {
          setIsUpdateModalOpen(open)
          if (!open) setPackToEdit(null)
        }}
      >
        <CreateTestPackModal
          mode="update"
          defaultValues={
            packToEdit
              ? {
                  name: packToEdit.name ?? undefined,
                  type:
                    (packToEdit.type as 'smoke' | 'regression' | 'manual') ??
                    undefined,
                }
              : undefined
          }
          onSubmit={handleUpdatePack}
        />
      </BetterDialogProvider>

      <BetterDeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={(open) => {
          setIsDeleteModalOpen(open)
          if (!open) setPackToDelete(null)
        }}
        title="Do you want to delete this test pack?"
        description="Deleting this test pack is a permanent action and cannot be undone. All associated test cases and test runs will also be deleted."
        onConfirm={handleConfirmDelete}
      />

      {selectedPackId && (
        <BetterDialogProvider
          open={isCreateCaseModalOpen}
          onOpenChange={setIsCreateCaseModalOpen}
        >
          <ConfigureTestCaseModal
            mode="create"
            onSubmit={async (data) => {
              await createTestCaseMutation({
                variables: {
                  orgId: orgId!,
                  serviceId,
                  input: {
                    order: 0,
                    testPackId: selectedPackId,
                    ...transformToCreateTestCase(data),
                  },
                },
              })

              toast.success('Test case created successfully')
              setIsCreateCaseModalOpen(false)
            }}
          />
        </BetterDialogProvider>
      )}

      {selectedPackId && caseToEdit && (
        <BetterDialogProvider
          open={isUpdateCaseModalOpen}
          onOpenChange={(open) => {
            setIsUpdateCaseModalOpen(open)
            if (!open) setCaseToEdit(null)
          }}
        >
          <ConfigureTestCaseModal
            mode="update"
            defaultValue={transformTestCaseToSchema(caseToEdit)}
            onSubmit={async (data) => {
              await updateTestCaseMutation({
                variables: {
                  orgId: orgId!,
                  serviceId,
                  id: caseToEdit.testCaseId!,
                  input: {
                    testPackId: caseToEdit.testPackId!,
                    order: caseToEdit.order ?? 0,
                    ...transformToUpdateTestCase(data),
                  },
                },
              })

              toast.success('Test case updated successfully')
              setIsUpdateCaseModalOpen(false)
              setCaseToEdit(null)
            }}
          />
        </BetterDialogProvider>
      )}

      {selectedPackId && (
        <BetterDialogProvider
          open={isRunPackModalOpen}
          onOpenChange={setIsRunPackModalOpen}
        >
          <RunPackModal onSubmit={handleConfirmRunPack} />
        </BetterDialogProvider>
      )}
    </div>
  )
}
