import { test, expect } from '@playwright/test';

test('Validation des erreurs API', async ({ page }) => {
  await page.goto('/modules');
  await page.click('text=Générer le document');
  // Ne pas remplir les champs obligatoires
  await page.click('text=Générer le document');
  await expect(page.locator('.bg-red-100')).toBeVisible();
});
