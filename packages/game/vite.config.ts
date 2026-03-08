import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: process.env.BASE_URL || '/',
  build: {
    outDir: 'dist',
  },
})
