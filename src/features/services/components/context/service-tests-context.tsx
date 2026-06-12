'use client'

import { GT } from '@/api'
import { useOrganizationContext } from '@/contexts'
import { useApolloClient, useMutation, useQuery } from '@apollo/client'
import { arrayNonNullable } from 'daily-code'
import { createContext } from 'daily-code/react'
import { useCallback, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'
import {
  CREATE_TEST_CASE_MUTATION,
  DELETE_TEST_CASE_MUTATION,
  GET_TEST_CASES_QUERY,
  UPDATE_TEST_CASE_MUTATION,
} from '../../api/test-cases'
import {
  CREATE_TEST_PACK_MUTATION,
  DELETE_TEST_PACK_MUTATION,
  GET_TEST_PACKS_QUERY,
  UPDATE_TEST_PACK_MUTATION,
} from '../../api/test-packs'
import {
  CREATE_TEST_RUN_MUTATION,
  GET_TEST_RUNS_QUERY,
  GET_TEST_RUNS_SUMMARY_QUERY,
} from '../../api/test-runs'
import {
  transformTestCaseToSchema,
  transformToCreateTestCase,
} from '../tests/modals/configure-test-case-modal/transformers'

type ServiceTestsContextProps = {
  serviceId: string
}

export const [ServiceTestsContextProvider, useServiceTestsContext] =
  createContext(({ serviceId }: ServiceTestsContextProps) => {
    const navigate = useNavigate()
    const { pathname } = useLocation()
    const [searchParams] = useSearchParams()
    const client = useApolloClient()
    const { organizationId } = useOrganizationContext()

    const selectedPackId = searchParams.get('packId')

    const { data: packsData, loading: packsLoading } = useQuery(
      GET_TEST_PACKS_QUERY,
      {
        fetchPolicy: 'cache-first',
        variables: { serviceId },
        skip: !serviceId,
      }
    )

    const { data: casesData, loading: casesLoading } = useQuery(
      GET_TEST_CASES_QUERY,
      {
        fetchPolicy: 'cache-first',
        variables: { testPackId: selectedPackId ?? '' },
        skip: !selectedPackId,
      }
    )

    const { data: runsData } = useQuery(GET_TEST_RUNS_QUERY, {
      fetchPolicy: 'cache-first',
      variables: { serviceId },
      skip: !serviceId,
    })

    const testPacks = useMemo(() => {
      const packs = arrayNonNullable(packsData?.v1GetTestPacks)
      return [...packs].sort((a, b) => {
        const aTime = a.updatedAt ? new Date(a.updatedAt).getTime() : 0
        const bTime = b.updatedAt ? new Date(b.updatedAt).getTime() : 0
        return bTime - aTime
      })
    }, [packsData?.v1GetTestPacks])

    const testCases = useMemo<GT.TestCase[]>(() => {
      const cases = arrayNonNullable(casesData?.v1GetTestCases)
      return [...cases].sort((a, b) => {
        const aOrder = a.order ?? 0
        const bOrder = b.order ?? 0
        return aOrder - bOrder
      })
    }, [casesData?.v1GetTestCases])

    const testRuns = useMemo(
      () => arrayNonNullable(runsData?.v1GetTestRuns),
      [runsData?.v1GetTestRuns]
    )

    const selectedPack = useMemo(() => {
      return (
        testPacks.find((pack) => pack.testPackId === selectedPackId) ?? null
      )
    }, [testPacks, selectedPackId])

    const isTestPacksLoading = packsLoading && !packsData?.v1GetTestPacks
    const isTestCasesLoading = casesLoading && !casesData?.v1GetTestCases

    const [createTestPack] = useMutation(CREATE_TEST_PACK_MUTATION, {
      refetchQueries: [
        { query: GET_TEST_PACKS_QUERY, variables: { serviceId } },
        { query: GET_TEST_RUNS_QUERY, variables: { serviceId } },
        {
          query: GET_TEST_RUNS_SUMMARY_QUERY,
          variables: { testPackId: selectedPackId ?? '' },
        },
      ],
    })

    const [updateTestPack] = useMutation(UPDATE_TEST_PACK_MUTATION, {
      refetchQueries: [
        { query: GET_TEST_PACKS_QUERY, variables: { serviceId } },
        { query: GET_TEST_RUNS_QUERY, variables: { serviceId } },
        {
          query: GET_TEST_RUNS_SUMMARY_QUERY,
          variables: { testPackId: selectedPackId ?? '' },
        },
      ],
    })

    const [deleteTestPack] = useMutation(DELETE_TEST_PACK_MUTATION, {
      refetchQueries: [
        { query: GET_TEST_PACKS_QUERY, variables: { serviceId } },
        { query: GET_TEST_RUNS_QUERY, variables: { serviceId } },
        {
          query: GET_TEST_RUNS_SUMMARY_QUERY,
          variables: { testPackId: selectedPackId ?? '' },
        },
      ],
    })

    const [createTestCaseMutation] = useMutation(CREATE_TEST_CASE_MUTATION, {
      refetchQueries: [
        {
          query: GET_TEST_CASES_QUERY,
          variables: { testPackId: selectedPackId ?? '' },
        },
        { query: GET_TEST_RUNS_QUERY, variables: { serviceId } },
        {
          query: GET_TEST_RUNS_SUMMARY_QUERY,
          variables: { testPackId: selectedPackId ?? '' },
        },
      ],
    })

    const [updateTestCaseMutation] = useMutation(UPDATE_TEST_CASE_MUTATION, {
      refetchQueries: [
        {
          query: GET_TEST_CASES_QUERY,
          variables: { testPackId: selectedPackId ?? '' },
        },
        { query: GET_TEST_RUNS_QUERY, variables: { serviceId } },
        {
          query: GET_TEST_RUNS_SUMMARY_QUERY,
          variables: { testPackId: selectedPackId ?? '' },
        },
      ],
    })

    const [deleteTestCaseMutation] = useMutation(DELETE_TEST_CASE_MUTATION, {
      refetchQueries: [
        {
          query: GET_TEST_CASES_QUERY,
          variables: { testPackId: selectedPackId ?? '' },
        },
      ],
    })

    const [createTestRun] = useMutation(CREATE_TEST_RUN_MUTATION, {
      refetchQueries: [
        { query: GET_TEST_RUNS_QUERY, variables: { serviceId } },
        {
          query: GET_TEST_RUNS_SUMMARY_QUERY,
          variables: { testPackId: selectedPackId ?? '' },
        },
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
              input: {
                serviceId,
                name: data.name,
                type: data.type,
              },
            },
          })
          const newPackId = result.data?.v1CreateTestPack?.testPackId
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
      [createTestPack, handleSelectPack, serviceId]
    )

    const updatePack = useCallback(
      async (
        testPackId: string,
        data: { name: string; type: 'smoke' | 'regression' | 'manual' }
      ) => {
        try {
          await updateTestPack({
            variables: {
              testPackId,
              input: {
                serviceId,
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
      [serviceId, updateTestPack]
    )

    const deletePack = useCallback(
      async (testPackId: string) => {
        if (!organizationId) return

        try {
          await deleteTestPack({
            variables: {
              testPackId,
              organizationId,
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
      [clearSelectedPack, deleteTestPack, organizationId, selectedPackId]
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
      [createTestCaseMutation]
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
              testCaseId,
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
      [updateTestCaseMutation]
    )

    const duplicateTestCase = useCallback(
      async (testCase: GT.TestCase) => {
        if (!testCase.testPackId) {
          toast.error('Cannot duplicate test case: missing test pack ID')
          return
        }

        try {
          const { data: casesData } = await client.query({
            query: GET_TEST_CASES_QUERY,
            variables: { testPackId: testCase.testPackId },
            fetchPolicy: 'network-only',
          })
          const existingCases = arrayNonNullable(casesData?.v1GetTestCases)
          const maxOrder = existingCases.reduce(
            (max: number, tc: GT.TestCase) => Math.max(max, tc.order ?? 0),
            0
          )
          const newOrder = maxOrder + 1

          await createTestCaseMutation({
            variables: {
              input: {
                testPackId: testCase.testPackId,
                ...transformToCreateTestCase(
                  transformTestCaseToSchema(testCase)
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
      [client, createTestCaseMutation]
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
              testCaseId,
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
      [testCases, updateTestCaseMutation]
    )

    const confirmRunPack = useCallback(
      async (data: { environment: string; releaseLabel?: string }) => {
        if (!selectedPackId) return

        try {
          const result = await createTestRun({
            variables: {
              input: {
                testPackId: selectedPackId,
                serviceId,
                environment: data.environment,
                releaseLabel: data.releaseLabel,
              },
            },
          })

          const testRunId = result.data?.v1CreateTestRun?.testRunId
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
      [createTestRun, navigate, selectedPackId, serviceId]
    )

    return {
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
