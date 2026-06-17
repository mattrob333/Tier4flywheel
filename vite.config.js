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
        servicesAiOpportunityAudit: resolve(rootDir, 'services/ai-opportunity-audit/index.html'),
        servicesAiStrategyBlueprint: resolve(rootDir, 'services/ai-strategy-blueprint/index.html'),
        servicesCustomAiSolutions: resolve(rootDir, 'services/custom-ai-solutions/index.html'),
        servicesAiEnablementTraining: resolve(rootDir, 'services/ai-enablement-training/index.html'),
        servicesFractionalAiLeadership: resolve(rootDir, 'services/fractional-ai-leadership/index.html'),
      },
    },
  },
})
