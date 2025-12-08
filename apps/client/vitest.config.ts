import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/vitest.setup.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.pw.spec.ts', '**/*.pw.spec.tsx'],
  },
});
