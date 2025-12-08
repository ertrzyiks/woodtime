import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/integration',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:6006',
    trace: 'on-first-retry',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: [
    {
      command: 'cd ../api && pnpm start:test',
      url: 'https://localhost:8080/woodtime',
      reuseExistingServer: !process.env.CI,
      ignoreHTTPSErrors: true,
      timeout: 120 * 1000,
    },
    {
      command: 'pnpm storybook',
      url: 'http://localhost:6006',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    },
  ],
});
