import { CodegenConfig } from '@graphql-codegen/cli'
import { processEnv } from './environment'

export default {
  generates: {
    './src/api/.gql/': {
      schema:
        processEnv.CODEGEN_URL ??
        processEnv.GRAPHQL_URL ??
        '../uigraph-graphql/internal/graph/schema/*.graphqls',

      documents: ['./src/**/*.{ts,tsx}'],

      preset: 'client',

      presetConfig: {
        fragmentMasking: false,
      },

      config: {
        skipTypename: true,
        skipTypeNameForRoot: true,

        scalars: {
          Time: 'string',
          JSON: 'unknown',
        },
      },
    },
  },
} satisfies CodegenConfig
