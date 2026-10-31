import { defineConfig } from '@playwright/test';
import config from './playwright.config';
export default defineConfig({
  ...config,
  testDir: './screenshots',
  workers: 1,
  use: {
    ...config.use,
    viewport: { width: 1600, height: 1200 },
    colorScheme: 'light',
    deviceScaleFactor: 1,
  },
});
