import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { compression } from 'vite-plugin-compression2'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    compression({ algorithms: ['gzip', 'brotliCompress'] }),
  ],
  base: '/',
  resolve: {
    alias: {
      // Stub unused Supabase modules to reduce bundle size (~96KB savings)
      '@supabase/realtime-js': path.resolve(__dirname, 'src/lib/supabase-realtime-stub.ts'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'vendor-react-dom'
            if (id.includes('react-router-dom') || id.includes('@remix-run') || id.includes('turbo-stream')) return 'vendor-router'
            if (id.includes('framer-motion') || id.includes('motion-dom') || id.includes('motion-utils')) return 'vendor-motion'
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('lucide-react')) return 'vendor-icons'
          }
        },
      },
    },
  },
})
