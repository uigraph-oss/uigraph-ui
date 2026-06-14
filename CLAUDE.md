## GraphQL

For v2 queries:

- Name the file `*-v2.{ts,tsx}`.
- Import `graphql` from `@/api-v2`.

```ts
import { graphql } from '@/api-v2'

export const GET_ME_V2 = graphql(`
  query Me {
    me {
      userId
    }
  }
`)
```
