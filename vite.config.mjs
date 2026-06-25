import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { defineConfig } from 'vite'
import z from 'zod'

const __dirname = new URL('.', import.meta.url).pathname.replace(
  /^\/([A-Za-z]:)/,
  '$1'
)

const processEnvSchema = z.object({
  API_URL: z.url(),
  ASSETS_URL: z.url(),
  GRAPHQL_URL: z.url(),
})

const processEnv = processEnvSchema.parse(process.env)

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],

    resolve: {
      alias: {
        '@': path.join(__dirname, 'src'),
      },
    },

    optimizeDeps: {
      include: ['@apollo/client', 'graphql'],
    },

    server: {
      host: true,
      port: process.env.PORT || 3000,
      allowedHosts: ['host.docker.internal', 'localhost', 'uigraph-ui'],

      proxy: {
        '/api': { target: processEnv.API_URL, changeOrigin: true },
        '/assets': { target: processEnv.ASSETS_URL, changeOrigin: true },
        '/graphql': { target: processEnv.GRAPHQL_URL, changeOrigin: true },
      },
    },
  }
})
