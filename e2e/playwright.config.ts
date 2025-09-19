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
  // For Docker-based testing, comment out webServer and ensure containers are running
  // webServer: [
  //   {
  //     command: 'bun run dev',
  //     cwd: '../pokedex-backend',
  //     port: 3000,
  //   },
  //   {
  //     command: 'bun run web',
  //     cwd: '../pokedex-frontend',
  //     port: 8081,
  //   }
  // ],

  // Expect services to be running (via Docker Compose)
  // globalSetup: process.env.USE_DOCKER ? undefined : require.resolve('./setup/global-setup.ts'),
  // globalTeardown: process.env.USE_DOCKER ? undefined : require.resolve('./setup/global-teardown.ts'),

  timeout: 30000,
  expect: {
    timeout: 10000,
  },
});