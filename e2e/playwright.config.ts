import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // Start services automatically unless using Docker
  webServer: process.env.USE_DOCKER ? undefined : [
    {
      command: 'PORT=3000 bun run dev',
      cwd: '../pokedex-backend',
      port: 3000,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      env: {
        PORT: '3000',
        NODE_ENV: 'test',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pokedex_test',
        DIRECT_URL: process.env.DIRECT_URL || 'postgresql://postgres:postgres@localhost:5432/pokedex_test'
      }
    },
    {
      command: 'bun run web',
      cwd: '../pokedex-frontend',
      port: 8081,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
    }
  ],

  // Use global setup for Docker mode to verify services are ready
  globalSetup: process.env.USE_DOCKER ? require.resolve('./setup/global-setup.ts') : undefined,
  globalTeardown: process.env.USE_DOCKER ? require.resolve('./setup/global-teardown.ts') : undefined,

  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});