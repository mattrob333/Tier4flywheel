import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import process from 'node:process'
import { loadEnv } from 'vite'

// https://vite.dev/config/
const rootDir = fileURLToPath(new URL('.', import.meta.url))

const apiHandlers = {
  '/api/audit-research': () => import('./api/audit-research.js'),
  '/api/audit-report': () => import('./api/audit-report.js'),
  '/api/audit-followup': () => import('./api/audit-followup.js'),
}

function createVercelLikeResponse(res) {
  return {
    status(code) {
      res.statusCode = code
      return this
    },
    json(payload) {
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify(payload))
    },
  }
}

export default defineConfig(({ mode }) => {
  Object.assign(process.env, loadEnv(mode, rootDir, ''))

  return {
    plugins: [
      react(),
      {
        name: 'tier4-local-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const path = req.url?.split('?')[0]
            const loadHandler = apiHandlers[path]
            if (!loadHandler) return next()

            try {
              const mod = await loadHandler()
              await mod.default(req, createVercelLikeResponse(res))
            } catch (error) {
              console.error('[local-api]', error)
              res.statusCode = 500
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: error.message || 'Local API failed.' }))
            }
          })
        },
      },
    ],
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
  }
})
