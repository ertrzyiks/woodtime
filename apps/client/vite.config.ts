import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/

const isPWAEnabled = process.env.VITE_ENABLE_PWA === 'true';

export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    isPWAEnabled &&
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'generateSW',
        filename: 'service-worker.js',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        },
      }),
    {
      name: 'copy-index-to-404',
      apply: 'build',
      closeBundle() {
        const fs = require('fs');
        fs.copyFileSync('dist/index.html', 'dist/404.html');
      },
    },
  ],
});
