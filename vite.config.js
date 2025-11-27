import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],
  server: {
    port: 3007
  },
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  },
  publicDir: 'public'
}))
