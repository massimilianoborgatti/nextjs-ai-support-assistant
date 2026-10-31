import { test, expect } from '@playwright/test';
for (const [question, file, text] of [
  ['How long does shipping take?', '01-answer.png', 'We do not dispatch on weekends.'],
  ['Who won the chess championship?', '02-not-covered.png', 'does not send contact requests.'],
])
  test(file, async ({ page }) => {
    await page.goto('./');
    await page.getByLabel('Your question').fill(question);
    await page.getByRole('button', { name: /Send question/ }).click();
    await expect(page.getByTestId('answer')).toContainText(text);
    await expect(page.getByRole('button', { name: /Answering/ })).toHaveCount(0);
    await page.screenshot({ path: 'docs/screenshots/' + file, animations: 'disabled' });
  });
