// RioCapitalBlog-frontend/vite.config.js

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    react(),
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src'),
    },
  },

  build: {
    target: 'es2020',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    proxy: {
      // Inoltra tutte le richieste /api al tuo backend Flask
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false, // Aggiungi per sicurezza, a volte aiuta con localhost
      },
      // Inoltra tutte le richieste /static (immagini, etc.) al tuo backend Flask
      '/static': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false, // Aggiungi per sicurezza
      },
    },
  },
});