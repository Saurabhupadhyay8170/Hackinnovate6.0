import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    optimizeDeps: {
      include: [
        '@tiptap/react',
        '@tiptap/starter-kit',
        '@tiptap/extension-underline',
        '@tiptap/extension-text-align',
        'socket.io-client',
        'lodash',
        'framer-motion'
      ]
    },
    server: {
      hmr: {
        overlay: false
      }
    },
    define: {
      __API_URL__: JSON.stringify(env.VITE_API_URL),
    }
  }
});
