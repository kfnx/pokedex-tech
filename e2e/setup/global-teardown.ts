import { FullConfig } from '@playwright/test';

async function globalTeardown(config: FullConfig) {
  console.log('E2E tests completed');
}

export default globalTeardown;