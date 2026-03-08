import { defineConfig } from 'vite'

export default defineConfig({
  root: '.',
  base: process.env.BASE_URL || '/',
  publicDir: 'assets',
  build: {
    outDir: 'dist',
  },
})
