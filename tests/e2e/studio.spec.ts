import { expect, test } from '@playwright/test';

test('studio boots and its existing preview controls work', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Female Character Studio', exact: true })).toBeVisible();
  await expect(page.getByRole('status')).toHaveText('Preview ready · no character assets loaded');
  await expect(page.getByLabel('Empty character preview')).toHaveCount(1);

  await page.getByLabel('Direction', { exact: true }).selectOption('north');
  await page.getByLabel('Renderer', { exact: true }).selectOption('canvas');
  await expect(page.getByRole('status')).toHaveText('Preview ready · no character assets loaded');
  await expect(page.getByLabel('Empty character preview')).toHaveCount(1);
  await expect(page.getByLabel('Direction', { exact: true })).toHaveValue('north');

  await page.getByRole('button', { name: 'Reset view' }).click();
  await expect(page.getByLabel('Direction', { exact: true })).toHaveValue('south');
  await expect(page.getByLabel('Renderer', { exact: true })).toHaveValue('pixi');
  await expect(page.getByRole('status')).toHaveText('Preview ready · no character assets loaded');
  await expect(page.getByLabel('Empty character preview')).toHaveCount(1);
  expect(errors).toEqual([]);
});
