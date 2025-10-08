import { test, expect } from '@playwright/test';

test('Génération document → PDF', async ({ page }) => {
  await page.goto('/modules');
  await page.click('text=Générer le document');
  await page.fill('input[name="identite"]', 'Test User');
  await page.fill('input[name="adverse"]', 'Test Adverse');
  await page.fill('textarea[name="faits"]', 'Test situation');
  await page.click('text=Générer le document');
  await page.waitForURL(/\/documents\//);
  await expect(page).toHaveURL(/\/documents\//);
  await page.click('text=Télécharger le PDF');
  // Vérifier que le PDF est téléchargé (optionnel)
});
