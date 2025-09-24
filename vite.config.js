import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3007
  },
  base: process.env.NODE_ENV === 'production' ? '/pottery-booking-flow/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
