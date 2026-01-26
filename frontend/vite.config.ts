import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
    port: 5173,
    watch: {
      usePolling: true,
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  // Added this to ensure Sonner and other UI libs are ready
  optimizeDeps: {
    include: ['sonner', 'react', 'react-dom'],
  },
  build: {
    outDir: 'dist',
    target: 'esnext', // Ensure modern JS execution order
    rollupOptions: {
      output: {
        // Inside vite.config.js -> build -> rollupOptions -> output
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Grouping the "Big Four" that need to talk to each other immediately
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('sonner') ||
              id.includes('zustand')
            ) {
              return 'core-vendor';
            }
            return 'vendor';
          }
        },
      },
    },
  },
});
