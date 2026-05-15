import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_PUSH_SERVER_URL || 'http://localhost:3000',
          changeOrigin: true
        },
        '/render-api': {
          target: 'https://api.render.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/render-api/, '')
        }
      }
    }
  };
})
