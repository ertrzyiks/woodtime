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
        const indexPath = path.resolve('dist', 'index.html');
        const notFoundPath = path.resolve('dist', '404.html');
        fs.copyFileSync(indexPath, notFoundPath);
      },
    },
  ],
});
