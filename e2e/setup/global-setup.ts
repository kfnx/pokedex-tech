import { chromium, FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Wait for services to be ready
  const browser = await chromium.launch();
  const page = await browser.newPage();

  console.log('Checking if services are ready...');

  // Check backend health
  try {
    const response = await page.request.get('http://localhost:3000/health');
    if (response.status() !== 200) {
      throw new Error(`Backend health check failed: ${response.status()}`);
    }
    console.log('✓ Backend is ready');
  } catch (error) {
    console.error('✗ Backend is not ready:', error);
    throw error;
  }

  // Check frontend
  try {
    await page.goto('http://localhost:8081/');
    await page.waitForLoadState('networkidle');
    console.log('✓ Frontend is ready');
  } catch (error) {
    console.error('✗ Frontend is not ready:', error);
    throw error;
  }

  await browser.close();
}

export default globalSetup;