import process from 'node:process';

import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  if (env.VITE_CLIENT_HOST === undefined) {
    throw new Error('VITE_CLIENT_HOST is not defined in the environment variables');
  }

  if (env.VITE_CLIENT_PORT === undefined) {
    throw new Error('VITE_CLIENT_PORT is not defined in the environment variables');
  }

  return {
    plugins: [react()],
    server: {
      host: env.VITE_CLIENT_HOST,
      port: parseInt(env.VITE_CLIENT_PORT),
    },
  }
})
