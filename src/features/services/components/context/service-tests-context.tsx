'use client'

import { GT } from '@/api'
import type { TestCase } from '@/api-v2/.gql/graphql'
import { clientV2 } from '@/api-v2/client'
import { useCurrentOrganization } from '@/store/auth-store'
import { useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CREATE_TEST_CASE_V2,
  CREATE_TEST_PACK_V2,
  CREATE_TEST_RUN_V2,
  DELETE_TEST_CASE_V2,
  DELETE_TEST_PACK_V2,
  TEST_CASES_V2,
  TEST_PACKS_V2,
  TEST_RUNS_SUMMARY_V2,
  TEST_RUNS_V2,
  UPDATE_TEST_CASE_V2,
  UPDATE_TEST_PACK_V2,
} from '../../api/tests-v2'
import {
  transformTestCaseToSchema,
  transformToCreateTestCase,
} from '../tests/modals/configure-test-case-modal/transformers'

type ServiceTestsContextProps = {
  serviceId: string
}

type TestCaseRow = TestCase

export const [ServiceTestsContextProvider, useServiceTestsContext] =
  createContext(({ serviceId }: ServiceTestsContextProps) => {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [searchParams] = useSearchParams()
    const orgId = useCurrentOrganization().id

    const selectedPackId = searchParams.get('packId')

    const packsVars = { orgId: orgId!, serviceId }
    const casesVars = {
      orgId: orgId!,
      serviceId,
      testPackId: selectedPackId ?? '',
    }
    const runsVars = {
      orgId: orgId!,
      serviceId,
      testPackId: selectedPackId ?? undefined,
    }
    const packRunsVars = {
      orgId: orgId!,
      serviceId,
      testPackId: selectedPackId ?? '',
    }

    const { data: packsData, loading: packsLoading } = useQuery(TEST_PACKS_V2, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: packsVars,
      skip: !orgId || !serviceId,
    })

    const { data: casesData, loading: casesLoading } = useQuery(TEST_CASES_V2, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: casesVars,
      skip: !orgId || !serviceId || !selectedPackId,
    })

    const { data: packRunsData } = useQuery(TEST_RUNS_V2, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: packRunsVars,
      skip: !orgId || !serviceId || !selectedPackId,
    })

    const { data: summaryRunsData } = useQuery(TEST_RUNS_SUMMARY_V2, {
      client: clientV2,
      fetchPolicy: 'cache-first',
      variables: runsVars,
      skip: !orgId || !serviceId || !!selectedPackId,
    })

    const testPacks = useMemo(() => {
      const packs = arrayNonNullable(packsData?.testPacks)
      return [...packs].sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return bTime - aTime
      })
    }, [packsData?.testPacks])

    const testCases = useMemo<TestCaseRow[]>(() => {
      const cases = arrayNonNullable(casesData?.testCases)
      return [...cases].sort((a, b) => {
        const aOrder = a.order ?? 0
        const bOrder = b.order ?? 0
        return aOrder - bOrder
      })
    }, [casesData?.testCases])

    const testRuns = useMemo(() => {
      if (selectedPackId) {
        return arrayNonNullable(packRunsData?.testRuns)
      }
      return arrayNonNullable(summaryRunsData?.testRunsSummary)
    }, [
      packRunsData?.testRuns,
      selectedPackId,
      summaryRunsData?.testRunsSummary,
    ])

    const selectedPack = useMemo(() => {
      return (
        testPacks.find((pack) => pack.testPackId === selectedPackId) ?? null
      )
    }, [testPacks, selectedPackId])

    const isTestPacksLoading = packsLoading && !packsData?.testPacks
    const isTestCasesLoading = casesLoading && !casesData?.testCases

    const packRefetchQueries = [
      { query: TEST_PACKS_V2, variables: packsVars },
      selectedPackId
        ? { query: TEST_RUNS_V2, variables: packRunsVars }
        : { query: TEST_RUNS_SUMMARY_V2, variables: runsVars },
    ]

    const caseRefetchQueries = [
      { query: TEST_CASES_V2, variables: casesVars },
      selectedPackId
        ? { query: TEST_RUNS_V2, variables: packRunsVars }
        : { query: TEST_RUNS_SUMMARY_V2, variables: runsVars },
    ]

    const [createTestPack] = useMutation(CREATE_TEST_PACK_V2, {
      client: clientV2,
      refetchQueries: packRefetchQueries,
    })

    const [updateTestPack] = useMutation(UPDATE_TEST_PACK_V2, {
      client: clientV2,
      refetchQueries: packRefetchQueries,
    })

    const [deleteTestPack] = useMutation(DELETE_TEST_PACK_V2, {
      client: clientV2,
      refetchQueries: packRefetchQueries,
    })

    const [createTestCaseMutation] = useMutation(CREATE_TEST_CASE_V2, {
      client: clientV2,
      refetchQueries: caseRefetchQueries,
    })

    const [updateTestCaseMutation] = useMutation(UPDATE_TEST_CASE_V2, {
      client: clientV2,
      refetchQueries: caseRefetchQueries,
    })

    const [deleteTestCaseMutation] = useMutation(DELETE_TEST_CASE_V2, {
      client: clientV2,
      refetchQueries: [{ query: TEST_CASES_V2, variables: casesVars }],
    })

    const [createTestRun] = useMutation(CREATE_TEST_RUN_V2, {
      client: clientV2,
      refetchQueries: [
        { query: TEST_RUNS_V2, variables: packRunsVars },
        { query: TEST_RUNS_SUMMARY_V2, variables: runsVars },
      ],
    })

    const handleSelectPack = useCallback(
      (newPackId: string) => {
        const currentParams = new URLSearchParams(searchParams.toString())
        currentParams.set('packId', newPackId)
        navigate(`${pathname}?${currentParams.toString()}`, { replace: true })
      },
      [pathname, navigate, searchParams]
    )

    const clearSelectedPack = useCallback(() => {
      const currentParams = new URLSearchParams(searchParams.toString())
      currentParams.delete('packId')
      navigate(`${pathname}?${currentParams.toString()}`, { replace: true })
    }, [pathname, navigate, searchParams])

    const createPack = useCallback(
      async (data: {
        name: string
        type: 'smoke' | 'regression' | 'manual'
      }) => {
        try {
          const result = await createTestPack({
            variables: {
              orgId: orgId!,
              serviceId,
              input: {
                name: data.name,
                type: data.type,
              },
            },
          })
          const newPackId = result.data?.createTestPack?.testPackId
          if (newPackId) {
            handleSelectPack(newPackId)
            toast.success('Test pack created successfully')
            return newPackId
          }
          toast.error('Failed to create test pack')
          return null
        } catch (error) {
          toast.error('Failed to create test pack')
          console.error(error)
          throw error
        }
      },
      [createTestPack, handleSelectPack, orgId, serviceId]
    )

    const updatePack = useCallback(
      async (
        testPackId: string,
        data: { name: string; type: 'smoke' | 'regression' | 'manual' }
      ) => {
        try {
          await updateTestPack({
            variables: {
              orgId: orgId!,
              serviceId,
              id: testPackId,
              input: {
                name: data.name,
                type: data.type,
              },
            },
          })
          toast.success('Test pack updated successfully')
        } catch (error) {
          toast.error('Failed to update test pack')
          console.error(error)
          throw error
        }
      },
      [orgId, serviceId, updateTestPack]
    )

    const deletePack = useCallback(
      async (testPackId: string) => {
        if (!orgId) return

        try {
          await deleteTestPack({
            variables: {
              orgId,
              serviceId,
              id: testPackId,
            },
          })

          if (selectedPackId === testPackId) {
            clearSelectedPack()
          }

          toast.success('Test pack deleted successfully')
        } catch (error) {
          toast.error('Failed to delete test pack')
          console.error(error)
          throw error
        }
      },
      [clearSelectedPack, deleteTestPack, orgId, selectedPackId, serviceId]
    )

    const createTestCaseHandler = useCallback(
      async (data: {
        testPackId: string
        title: string
        type: 'api' | 'manual'
        isCritical?: boolean
        operationId?: string
        expectedStatusCode?: number
        requestTemplate?: string
        steps?: string
        expectedOutcome?: string
        requiresEvidence?: boolean
      }) => {
        try {
          await createTestCaseMutation({
            variables: {
              orgId: orgId!,
              serviceId,
              input: {
                testPackId: data.testPackId,
                title: data.title,
                type: data.type,
                order: 0,
                isCritical: data.isCritical ?? false,
                evidenceRequired: data.requiresEvidence ?? false,
                api:
                  data.type === 'api'
                    ? {
                        httpMethod: 'GET',
                        operationId: data.operationId,
                        expectedStatusCode: data.expectedStatusCode,
                        requestBody: data.requestTemplate,
                      }
                    : undefined,
                manual:
                  data.type === 'manual'
                    ? {
                        testData: data.steps,
                        expectedOutcome: data.expectedOutcome,
                      }
                    : undefined,
              },
            },
          })
          toast.success('Test case created successfully')
        } catch (error) {
          toast.error('Failed to create test case')
          console.error(error)
          throw error
        }
      },
      [createTestCaseMutation, orgId, serviceId]
    )

    const updateTestCaseHandler = useCallback(
      async (
        testCaseId: string,
        data: {
          testPackId: string
          title: string
          type: 'api' | 'manual'
          order?: number
          isCritical?: boolean
          operationId?: string
          expectedStatusCode?: number
          requestTemplate?: string
          steps?: string
          expectedOutcome?: string
          requiresEvidence?: boolean
        }
      ) => {
        try {
          await updateTestCaseMutation({
            variables: {
              orgId: orgId!,
              serviceId,
              id: testCaseId,
              input: {
                testPackId: data.testPackId,
                title: data.title,
                type: data.type,
                order: data.order ?? 0,
                isCritical: data.isCritical ?? false,
                evidenceRequired: data.requiresEvidence ?? false,
                api:
                  data.type === 'api'
                    ? {
                        httpMethod: 'GET',
                        operationId: data.operationId,
                        expectedStatusCode: data.expectedStatusCode,
                        requestBody: data.requestTemplate,
                      }
                    : undefined,
                manual:
                  data.type === 'manual'
                    ? {
                        testData: data.steps,
                        expectedOutcome: data.expectedOutcome,
                      }
                    : undefined,
              },
            },
          })
          toast.success('Test case updated successfully')
        } catch (error) {
          toast.error('Failed to update test case')
          console.error(error)
          throw error
        }
      },
      [orgId, serviceId, updateTestCaseMutation]
    )

    const duplicateTestCase = useCallback(
      async (testCase: TestCaseRow) => {
        if (!testCase.testPackId) {
          toast.error('Cannot duplicate test case: missing test pack ID')
          return
        }

        try {
          const { data: freshCasesData } = await clientV2.query({
            query: TEST_CASES_V2,
            variables: {
              orgId: orgId!,
              serviceId,
              testPackId: testCase.testPackId,
            },
            fetchPolicy: 'network-only',
          })
          const existingCases = arrayNonNullable(freshCasesData?.testCases)
          const maxOrder = existingCases.reduce(
            (max, tc) => Math.max(max, tc.order ?? 0),
            0
          )
          const newOrder = maxOrder + 1

          await createTestCaseMutation({
            variables: {
              orgId: orgId!,
              serviceId,
              input: {
                testPackId: testCase.testPackId,
                ...transformToCreateTestCase(
                  transformTestCaseToSchema(testCase as GT.TestCase)
                ),
                title: `${testCase.title || 'Untitled'} (Copy)`,
                order: newOrder,
                baselineRunResultId: null,
              },
            },
          })

          toast.success('Test case duplicated successfully')
        } catch (error) {
          toast.error('Failed to duplicate test case')
          console.error(error)
        }
      },
      [clientV2, createTestCaseMutation, orgId, serviceId]
    )

    const reorderTestCase = useCallback(
      async (testCaseId: string, newOrder: number) => {
        try {
          const testCaseToUpdate = testCases.find(
            (tc) => tc.testCaseId === testCaseId
          )

          if (!testCaseToUpdate || !testCaseToUpdate.testPackId) {
            toast.error('Test case not found')
            return
          }

          await updateTestCaseMutation({
            variables: {
              orgId: orgId!,
              serviceId,
              id: testCaseId,
              input: {
                testPackId: testCaseToUpdate.testPackId,
                type: testCaseToUpdate.type || 'manual',
                title: testCaseToUpdate.title || 'Untitled',
                order: newOrder,
                evidenceRequired: testCaseToUpdate.evidenceRequired || false,
                api:
                  testCaseToUpdate.type === 'api'
                    ? {
                        httpMethod: testCaseToUpdate.api?.httpMethod || 'GET',
                        operationId: testCaseToUpdate.api?.operationId || null,
                        expectedStatusCode:
                          testCaseToUpdate.api?.expectedStatusCode || null,
                        requestBody: testCaseToUpdate.api?.requestBody || null,
                      }
                    : undefined,
                manual:
                  testCaseToUpdate.type === 'manual'
                    ? {
                        testData: testCaseToUpdate.manual?.testData || null,
                        expectedOutcome:
                          testCaseToUpdate.manual?.expectedOutcome || null,
                      }
                    : undefined,
                baselineRunResultId:
                  testCaseToUpdate.baselineRunResultId || null,
                isCritical: testCaseToUpdate.isCritical || false,
              },
            },
          })

          toast.success('Test case order updated')
        } catch (error) {
          toast.error('Failed to reorder test case')
          console.error(error)
        }
      },
      [orgId, serviceId, testCases, updateTestCaseMutation]
    )

    const confirmRunPack = useCallback(
      async (data: { environment: string; releaseLabel?: string }) => {
        if (!selectedPackId) return

        try {
          const result = await createTestRun({
            variables: {
              orgId: orgId!,
              serviceId,
              input: {
                testPackId: selectedPackId,
                environment: data.environment,
                releaseLabel: data.releaseLabel,
              },
            },
          })

          const testRunId = result.data?.createTestRun?.testRunId
          if (testRunId) {
            navigate(`/services/${serviceId}/tests/run/${testRunId}`)
            toast.success('Test run created successfully')
          } else {
            toast.error('Failed to create test run')
          }
        } catch (error) {
          toast.error('Failed to create test run')
          console.error(error)
          throw error
        }
      },
      [createTestRun, navigate, orgId, selectedPackId, serviceId]
    )

    return {
      orgId,
      serviceId,
      selectedPackId,
      selectedPack,
      testPacks,
      testCases,
      testRuns,
      isTestPacksLoading,
      isTestCasesLoading,
      handleSelectPack,
      createPack,
      updatePack,
      deletePack,
      createTestCase: createTestCaseHandler,
      updateTestCase: updateTestCaseHandler,
      updateTestCaseMutation,
      deleteTestCaseMutation,
      createTestCaseMutation,
      duplicateTestCase,
      reorderTestCase,
      confirmRunPack,
    }
  })
