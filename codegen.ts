import { CodegenConfig } from '@graphql-codegen/cli'

export default {
  generates: {
    './src/api/.gql/': {
      schema: 'https://api.dev.uigraph.app/graphql/query',
      documents: ['./src/**/*.{ts,tsx}', '!./src/**/*-v2.{ts,tsx}'],

      preset: 'client',

      presetConfig: {
        fragmentMasking: false,
      },

      config: {
        skipTypename: true,
        skipTypeNameForRoot: true,

        scalars: {
          DateTime: 'string',
          SanitizedString: 'string',
        },
      },
    },

    './src/api-v2/.gql/': {
      schema: '../uigraph-graphql/internal/graph/schema/*.graphqls',
      documents: ['./src/**/*-v2.{ts,tsx}'],

      preset: 'client',

      presetConfig: {
        fragmentMasking: false,
      },

      config: {
        skipTypename: true,
        skipTypeNameForRoot: true,

        scalars: {
          Time: 'string',
        },
      },
    },
  },
} satisfies CodegenConfig
