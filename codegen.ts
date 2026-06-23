import { CodegenConfig } from '@graphql-codegen/cli'

export default {
  watchConfig: {
    usePolling: process.env.CHOKIDAR_USEPOLLING === 'true',
    interval: 300,
  },

  generates: {
    './src/api/.gql/': {
      schema: `${process.env.VITE_GRAPHQL_TARGET ?? 'http://localhost:8090'}/graphql`,
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
