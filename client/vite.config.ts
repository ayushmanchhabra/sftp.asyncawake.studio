import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const host = env.VITE_CLIENT_HOST?.replace(/^https?:\/\//, '') || 'localhost'
  const port = Number(env.VITE_CLIENT_PORT) || 3001

  return {
    plugins: [react()],
    server: {
      host,
      port,
    },
  }
})
