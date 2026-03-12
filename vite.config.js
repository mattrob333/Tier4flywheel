import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(rootDir, 'index.html'),
        about: resolve(rootDir, 'about/index.html'),
        contact: resolve(rootDir, 'contact/index.html'),
        services: resolve(rootDir, 'services/index.html'),
        servicesProgrammaticSeo: resolve(rootDir, 'services/programmatic-seo/index.html'),
        servicesPaidLeadGeneration: resolve(rootDir, 'services/paid-lead-generation/index.html'),
        servicesAiVoiceAgents: resolve(rootDir, 'services/ai-voice-agents/index.html'),
        servicesSmartDispatch: resolve(rootDir, 'services/smart-dispatch/index.html'),
        servicesReputationManagement: resolve(rootDir, 'services/reputation-management/index.html'),
      },
    },
  },
})
