import { test, expect } from '@playwright/test';

// Replace with a valid module id from your API or seed
const MODULE_ID = 'mod-1';
const MODULE_URL = `/modules/${MODULE_ID}`;

// Minimal answers for the wizard (adapt to your schema)
const minimalAnswers = { a: 'test' };

// Helper to extract document id from network response
async function getDocumentId(page) {
  const [response] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes('/api/documents') && resp.request().method() === 'POST'),
    page.click('button:has-text("Générer le document")'),
  ]);
  const json = await response.json();
  return json.id;
}

test('smoke: create -> view -> pdf', async ({ page }) => {
  // 1. Go to module wizard
  await page.goto(MODULE_URL);
  await expect(page).toHaveURL(MODULE_URL);

  // 2. Fill wizard (adapt selectors to your UI)
  await page.fill('input[name="a"]', minimalAnswers.a);

  // 3. Submit and get document id
  const docId = await getDocumentId(page);
  expect(docId).toBeTruthy();

  // 4. Go to document view
  await page.goto(`/documents/${docId}`);
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('text=draft')).toBeVisible();

  // 5. Download PDF and check response
  const [pdfResponse] = await Promise.all([
    page.waitForResponse(resp => resp.url().includes(`/api/documents/${docId}/pdf`) && resp.status() === 200),
    page.click('button:has-text("Télécharger le PDF")'),
  ]);
  expect(pdfResponse.headers()['content-type']).toContain('application/pdf');
});
