# Integration Tests

This directory contains integration tests for the Client application using Playwright.

## Overview

The integration tests verify the end-to-end functionality of the client application with a real API backend. The tests use:

- **Playwright** for browser automation
- **Real API server** running in test mode with a separate SQLite database (`.test.sqlite3`)
- **Vite dev server** to serve the client application
- **Seed data** to ensure consistent test state

## Prerequisites

Before running the integration tests, make sure you have:

1. Installed all dependencies: `pnpm install` (from the root directory)
2. Installed Playwright browsers: `pnpm exec playwright install` (from `apps/client` directory)

## Running the Tests

### Run all integration tests

```bash
cd apps/client
pnpm test:integration
```

### Run tests in headed mode (see the browser)

```bash
cd apps/client
pnpm exec playwright test --headed
```

### Run tests in debug mode

```bash
cd apps/client
pnpm exec playwright test --debug
```

### View test report

After running tests, you can view the HTML report:

```bash
cd apps/client
pnpm exec playwright show-report
```

## How It Works

1. **API Test Mode**: When you run the integration tests, Playwright automatically starts the API server in test mode using `NODE_ENV=test`. This:
   - Uses a separate database file (`.test.sqlite3`)
   - Runs database migrations
   - Seeds the database with test data (see `apps/api/seeds/test_data.js`)
   - Starts the server on `https://localhost:8080/woodtime`

2. **Client Dev Server**: Playwright also starts the Vite development server on `http://localhost:3000`

3. **Test Execution**: The tests interact with the running application through the browser, performing actions like:
   - Signing in as a test user
   - Creating events
   - Verifying the event list is updated

4. **Cleanup**: After tests complete, the servers are automatically shut down

## Test Database

The test database is located at `apps/api/.test.sqlite3` and is automatically:
- Created and migrated before tests run
- Seeded with consistent test data
- Cleaned up between test runs (by the seed script)
- Ignored by git (added to `.gitignore`)

## Writing New Tests

To add new integration tests:

1. Create a new `.pw.spec.ts` file in `apps/client/tests/integration/`
2. Import the test utilities: `import { test, expect } from '@playwright/test';`
3. Write your test following the existing pattern
4. Use the base URL from the config: `http://localhost:3000`

**Note**: Playwright tests use the `.pw.spec.ts` suffix to avoid being picked up by vitest.

Example:

```typescript
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    // ... test steps
  });
});
```

## Configuration

The Playwright configuration is in `apps/client/playwright.config.ts`. Key settings:

- **testDir**: `./tests/integration` - where test files are located
- **testMatch**: `**/*.pw.spec.ts` - pattern for Playwright test files
- **baseURL**: `http://localhost:3000` - the client application URL
- **webServer**: Configuration for starting API and client servers automatically
- **retries**: Tests are retried 2 times in CI, 0 times locally
- **workers**: 1 worker to avoid database conflicts

The vitest configuration excludes `*.pw.spec.ts` and `*.pw.spec.tsx` files to prevent conflicts.

## Troubleshooting

### Tests fail with timeout errors

- Check that the API and client servers start successfully
- Increase timeout values in the Playwright config if needed
- Check the error context files in `test-results/` for details

### Database issues

- Delete `.test.sqlite3` and `.test.sessions.sqlite3` in `apps/api/` and try again
- Check that migrations run successfully: `cd apps/api && NODE_ENV=test pnpm exec knex migrate:latest`

### Port conflicts

- Make sure ports 8080 and 3000 are not in use by other processes
- You can change the ports in `playwright.config.ts` if needed
