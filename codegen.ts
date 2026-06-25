import { CodegenConfig } from '@graphql-codegen/cli'

export default {
  generates: {
    './src/api/.gql/': {
      schema:
        process.env.CODEGEN_URL ??
        process.env.GRAPHQL_URL ??
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
