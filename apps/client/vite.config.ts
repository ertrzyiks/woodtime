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
        fs.copyFileSync('dist/index.html', 'dist/404.html');
      },
    },
  ],
});
