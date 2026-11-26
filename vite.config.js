import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      // Local development proxy to eliminate browser CORS blocks against the remote API
      '/api': {
        target: 'https://api.blogtec.co.in',
        changeOrigin: true,
        secure: false,
      },
      '/storage': {
        target: 'https://api.blogtec.co.in',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
