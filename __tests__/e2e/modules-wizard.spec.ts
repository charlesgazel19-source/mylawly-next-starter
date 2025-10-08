import { test, expect } from '@playwright/test';

test('Navigation modules → wizard', async ({ page }) => {
  await page.goto('/modules');
  await page.click('text=Commencer');
  await expect(page).toHaveURL(/\/modules\//);
  await expect(page.locator('form')).toBeVisible();
});
