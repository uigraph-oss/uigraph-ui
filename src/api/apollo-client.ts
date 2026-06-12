import {
  ApolloClient,
  ApolloLink,
  DefaultOptions,
  InMemoryCache,
  Observable,
} from '@apollo/client'
import { resolveMock } from './mocks'

// No real backend in this build: every operation is served from local mocks.
const mockLink = new ApolloLink((operation) => {
  return new Observable((observer) => {
    const data = resolveMock(operation.operationName, operation.variables ?? {})
    observer.next({ data })
    observer.complete()
  })
})

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

export const privateClient = new ApolloClient({
  link: mockLink,
  cache: new InMemoryCache(),
  defaultOptions,
})

export const client = new ApolloClient({
  link: mockLink,
  cache: new InMemoryCache(),
  defaultOptions,
})

export async function fetchAPI(
  _query: string,
  { variables: _variables }: { variables?: Record<string, unknown> } = {}
) {
  return {}
}
