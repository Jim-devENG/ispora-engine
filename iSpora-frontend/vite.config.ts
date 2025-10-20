import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-tooltip',
          ],
        },
        entryFileNames: 'assets/[name]-[hash]-v4.js',
        chunkFileNames: 'assets/[name]-[hash]-v4.js',
        assetFileNames: 'assets/[name]-[hash]-v4.[ext]',
      },
    },
  },
  base: '/',
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://ispora-backend.onrender.com/api'),
  },
});
