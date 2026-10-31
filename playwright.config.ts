import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://127.0.0.1:4500/nextjs-ai-support-assistant/',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://127.0.0.1:4500/nextjs-ai-support-assistant/',
    reuseExistingServer: false,
  },
});
