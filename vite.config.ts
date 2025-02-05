import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  // Add proxy configuration for development
  server: {
    proxy: {
      // Proxy all /v1 requests to the Letta server
      '/v1': {
        target: 'http://localhost:8283',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
