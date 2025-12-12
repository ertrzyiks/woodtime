import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 3000,
  },
  plugins: [
    react(),
    {
      name: 'copy-index-to-404',
      apply: 'build',
      closeBundle() {
        const fs = require('fs');
        const path = require('path');
        const distPath = path.resolve('dist');
        const indexPath = path.join(distPath, 'index.html');
        const notFoundPath = path.join(distPath, '404.html');
        if (fs.existsSync(indexPath)) {
          fs.copyFileSync(indexPath, notFoundPath);
        }
      },
    },
  ],
});
