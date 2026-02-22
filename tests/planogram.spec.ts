import { test, expect } from '@playwright/test';

test.describe('Planogram Tool', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads with correct title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Planogram Tool' })).toBeVisible();
  });

  test('product catalog sidebar is visible', async ({ page }) => {
    const productCards = page.locator('[data-testid="product-card"]');
    await expect(productCards.first()).toBeVisible();
    const count = await productCards.count();
    expect(count).toBeGreaterThanOrEqual(1);

    await expect(page.locator('[data-testid="product-search"]')).toBeVisible();
  });

  test('search filters products', async ({ page }) => {
    const productCards = page.locator('[data-testid="product-card"]');
    const initialCount = await productCards.count();
    expect(initialCount).toBeGreaterThan(1);

    await page.locator('[data-testid="product-search"]').fill('Lipstick');

    await expect(async () => {
      const filteredCount = await productCards.count();
      expect(filteredCount).toBeLessThan(initialCount);
    }).toPass({ timeout: 2000 });

    await expect(productCards.first()).toContainText('Lipstick');
  });

  test('rack template selector exists and has 3 options', async ({ page }) => {
    const select = page.locator('[data-testid="rack-template-select"]');
    await expect(select).toBeVisible();

    const options = select.locator('option');
    await expect(options).toHaveCount(3);
  });

  test('changing rack template updates the canvas', async ({ page }) => {
    const select = page.locator('[data-testid="rack-template-select"]');
    const canvas = page.locator('canvas');

    await expect(canvas).toBeVisible();

    await select.selectOption({ label: 'Small Promo Rack' });

    await expect(canvas).toBeVisible();
  });

  test('gap config inputs exist with correct defaults', async ({ page }) => {
    const edgeMarginInput = page.locator('[data-testid="edge-margin-input"]');
    const gapInput = page.locator('[data-testid="gap-input"]');

    await expect(edgeMarginInput).toBeVisible();
    await expect(gapInput).toBeVisible();

    await expect(edgeMarginInput).toHaveValue('2');
    await expect(gapInput).toHaveValue('2');
  });

  test('export PNG button is clickable', async ({ page }) => {
    const exportButton = page.getByRole('button', { name: 'Export PNG' });
    await expect(exportButton).toBeVisible();

    const errors: Error[] = [];
    page.on('pageerror', (error) => errors.push(error));

    await exportButton.click();

    await page.waitForTimeout(500);

    expect(errors).toHaveLength(0);
  });
});
