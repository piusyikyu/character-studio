import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { decodePng } from '../../packages/render-utils/src/index';

async function ready(page: Page, target = 'detailed', facing = 'S') {
  await expect(page.getByRole('status')).toHaveText(`Preview ready · ${target} · ${facing}`, { timeout: 30_000 });
}
async function canvasHash(page: Page, label: string): Promise<number> {
  return page.getByLabel(label, { exact: true }).evaluate((element) => {
    const canvas = element as HTMLCanvasElement;
    const data = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
    let hash = 2166136261;
    for (const value of data) hash = Math.imul(hash ^ value, 16777619) >>> 0;
    return hash;
  });
}
async function download(page: Page, name: string) {
  const pending = page.waitForEvent('download'); await page.getByRole('button', { name, exact: true }).click();
  const file = await pending; const path = await file.path();
  if (!path) throw new Error('Download was not saved.');
  return { name: file.suggestedFilename(), bytes: await readFile(path) };
}

test('edits the shared character with live native previews, facing comparison, palettes and history', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = []; page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/'); await ready(page);
  await expect(page.getByRole('heading', { name: 'Female Character Studio', exact: true })).toBeVisible();
  const initial = await canvasHash(page, 'detailed S character preview');
  await page.getByLabel('Primary ancestry', { exact: true }).selectOption('elf');
  await page.getByLabel('Secondary ancestry', { exact: true }).selectOption('vampire');
  await expect(page.getByLabel('Visible fangs')).toBeChecked();
  await page.getByLabel('Body build', { exact: true }).selectOption('slender');
  await expect(page.getByLabel('Height', { exact: true })).toHaveValue('tall');
  await expect(page.getByLabel('Chest preset', { exact: true })).toHaveValue('small');
  await page.getByLabel('Chest preset', { exact: true }).selectOption('medium');
  await expect(page.getByLabel('Body build', { exact: true })).toHaveValue('balanced');
  await page.getByLabel('Height', { exact: true }).selectOption('tall');
  await expect(page.getByLabel('Body build', { exact: true })).toHaveValue('slender');
  await page.getByLabel('Hair length / style', { exact: true }).selectOption('long-waves');
  await page.getByLabel('Head shape', { exact: true }).selectOption('angular');
  await page.getByLabel('Skin palette', { exact: true }).selectOption('skin.deep');
  await page.getByLabel('Hair palette', { exact: true }).selectOption('hair.silver');
  await page.getByLabel('Left eye palette', { exact: true }).selectOption('eyes.blue');
  await page.getByLabel('Right eye palette', { exact: true }).selectOption('eyes.crimson');
  await page.getByLabel('Outfit palette', { exact: true }).selectOption('outfit.ink');
  await page.getByLabel('Expression', { exact: true }).selectOption('stern'); await ready(page);
  expect(await canvasHash(page, 'detailed S character preview')).not.toBe(initial);
  await page.getByRole('button', { name: 'Undo', exact: true }).click(); await expect(page.getByLabel('Expression', { exact: true })).toHaveValue('neutral');
  await page.getByRole('button', { name: 'Redo', exact: true }).click(); await expect(page.getByLabel('Expression', { exact: true })).toHaveValue('stern');
  await page.getByRole('heading', { name: 'Female Character Studio', exact: true }).click(); await page.keyboard.press('Control+z');
  await expect(page.getByLabel('Expression', { exact: true })).toHaveValue('neutral');
  await page.keyboard.press('Control+Shift+z'); await expect(page.getByLabel('Expression', { exact: true })).toHaveValue('stern');
  await page.getByLabel('Visible fangs').uncheck(); await ready(page);
  expect(await page.getByLabel('Visible layer').locator('option').allTextContents()).not.toEqual(expect.arrayContaining([expect.stringContaining('fangs')]));
  await page.getByLabel('Renderer', { exact: true }).selectOption('pixel'); await ready(page, 'pixel');
  for (const facing of ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']) {
    await page.getByRole('button', { name: `Face ${facing}`, exact: true }).click(); await ready(page, 'pixel', facing);
    const canvas = page.getByLabel(`pixel ${facing} character preview`, { exact: true });
    await expect(canvas).toHaveAttribute('width', '128'); await expect(canvas).toHaveAttribute('height', '192');
    if (['N', 'NE', 'NW'].includes(facing)) expect(await page.getByLabel('Visible layer').locator('option').allTextContents()).not.toEqual(expect.arrayContaining([expect.stringContaining('eyes')]));
  }
  await page.getByLabel('Compare S / N', { exact: true }).check(); await ready(page, 'pixel', 'S / N');
  await expect(page.locator('.preview-frames canvas')).toHaveCount(2);
  await page.getByLabel('Zoom', { exact: true }).selectOption('3');
  expect(await page.getByLabel('pixel S character preview', { exact: true }).evaluate((canvas) => ({ width: canvas.getBoundingClientRect().width, rendering: getComputedStyle(canvas).imageRendering }))).toEqual({ width: 384, rendering: 'pixelated' });
  await page.getByLabel('Preview background', { exact: true }).selectOption('green');
  await expect(page.locator('.preview-stage')).toHaveCSS('background-color', 'rgb(0, 255, 0)');
  await page.getByLabel('Visible layer').selectOption({ label: '1. hair-rear · rear' });
  await expect(page.locator('.layer-info')).toContainText('hair.long-waves');
  expect(errors).toEqual([]);
});

test('replays seeds, persists presets, round-trips JSON and exports native PNGs and the eight-facing sheet', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/'); await ready(page);
  await page.getByLabel('Random seed', { exact: true }).fill('editor-seed-42'); await page.getByRole('button', { name: 'Randomize', exact: true }).click(); await ready(page);
  const first = await download(page, 'Export character JSON'); const document = JSON.parse(first.bytes.toString('utf8'));
  expect(document.catalogVersion).toBe('placeholder.v1'); expect(document.recipe.schemaVersion).toBe(1);
  await page.getByLabel('Preset name', { exact: true }).fill('Saved hybrid'); await page.getByRole('button', { name: 'Save preset', exact: true }).click();
  await page.getByRole('button', { name: 'Reset character', exact: true }).click(); await ready(page);
  await page.getByRole('button', { name: 'Randomize', exact: true }).click(); await ready(page);
  expect(JSON.parse((await download(page, 'Export character JSON')).bytes.toString('utf8'))).toEqual(document);
  await page.reload(); await ready(page);
  await page.getByLabel('Saved preset', { exact: true }).selectOption('Saved hybrid'); await page.getByRole('button', { name: 'Load preset', exact: true }).click(); await ready(page);
  expect(JSON.parse((await download(page, 'Export character JSON')).bytes.toString('utf8'))).toEqual(document);
  await page.getByRole('button', { name: 'Reset character', exact: true }).click();
  await page.getByLabel('Character JSON file', { exact: true }).setInputFiles({ name: 'character.json', mimeType: 'application/json', buffer: first.bytes });
  await expect(page.locator('.operation-notice')).toHaveText('Imported character JSON.'); await ready(page);
  expect(JSON.parse((await download(page, 'Export character JSON')).bytes.toString('utf8'))).toEqual(document);
  await page.getByLabel('Preview background', { exact: true }).selectOption('dark');
  const detailed = decodePng((await download(page, 'Export detailed PNG · S')).bytes);
  expect([detailed.width, detailed.height]).toEqual([1024, 1536]); expect([...detailed.data.slice(0, 4)]).toEqual([0, 255, 0, 255]);
  expect([...detailed.data.slice((8 * 1024 + 8) * 4, (8 * 1024 + 8) * 4 + 4)]).toEqual([255, 255, 0, 255]);
  await page.getByLabel('Renderer', { exact: true }).selectOption('pixel'); await ready(page, 'pixel');
  const pixel = decodePng((await download(page, 'Export pixel PNG · S')).bytes); expect([pixel.width, pixel.height]).toEqual([128, 192]);
  const sheet = decodePng((await download(page, 'Export pixel sprite sheet')).bytes); expect([sheet.width, sheet.height]).toEqual([512, 384]);
  for (let i = 0; i < 8; i++) {
    const x = i % 4 * 128, y = Math.floor(i / 4) * 192;
    expect([...sheet.data.slice((y * 512 + x) * 4, (y * 512 + x) * 4 + 4)]).toEqual([0, 255, 0, 255]);
    expect([...sheet.data.slice(((y + 2) * 512 + x + 2) * 4, ((y + 2) * 512 + x + 2) * 4 + 4)]).toEqual([255, 255, 0, 255]);
  }
  await page.getByLabel('Transparent export background', { exact: true }).check();
  const transparent = decodePng((await download(page, 'Export pixel PNG · S')).bytes); expect([...transparent.data.slice(0, 4)]).toEqual([0, 0, 0, 0]);
  await page.getByRole('button', { name: 'Delete preset', exact: true }).click();
  await expect(page.getByLabel('Saved preset', { exact: true }).locator('option')).toHaveCount(1);
});

test('keeps the last valid character when imports or asset selections are unavailable', async ({ page }) => {
  await page.route('**/placeholder-assets/catalog.json', async (route) => {
    const response = await route.fetch(); const catalog = await response.json();
    catalog.bindings = catalog.bindings.filter((binding: { key: string }) => binding.key !== 'hair.long-waves');
    await route.fulfill({ response, json: catalog });
  });
  await page.goto('/'); await ready(page);
  const original = await canvasHash(page, 'detailed S character preview');
  await page.getByLabel('Hair length / style', { exact: true }).selectOption('long-waves');
  await expect(page.getByRole('alert')).toContainText('hair.long-waves');
  await expect(page.getByLabel('Hair length / style', { exact: true })).toHaveValue('short-bob');
  expect(await canvasHash(page, 'detailed S character preview')).toBe(original);
  await page.getByLabel('JSON document', { exact: true }).fill('{not-valid'); await page.getByRole('button', { name: 'Import JSON', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Import was not applied');
  const json = await download(page, 'Export character JSON'); const wrongCatalog = JSON.parse(json.bytes.toString('utf8')); wrongCatalog.catalogVersion = 'unavailable.v2';
  await page.getByLabel('JSON document', { exact: true }).fill(JSON.stringify(wrongCatalog)); await page.getByRole('button', { name: 'Import JSON', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('matching asset catalog');
  expect(await canvasHash(page, 'detailed S character preview')).toBe(original);
  await page.getByRole('button', { name: 'Dismiss warning', exact: true }).click(); await expect(page.getByRole('alert')).toHaveCount(0);
});

test('reports missing PNGs without partial artwork and recovers when assets become available', async ({ page }) => {
  let missing = true;
  await page.route('**/placeholder-assets/**/*.png', async (route) => {
    if (missing) await route.fulfill({ status: 404, body: 'Asset missing' }); else await route.continue();
  });
  await page.goto('/'); await expect(page.getByRole('alert')).toContainText('Missing character layer', { timeout: 30_000 });
  await expect(page.locator('.preview-frames canvas')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Export detailed PNG · S', exact: true })).toBeDisabled();
  missing = false; await page.getByRole('button', { name: 'Retry preview', exact: true }).click(); await ready(page);
  await expect(page.getByRole('alert')).toHaveCount(0); await expect(page.getByRole('button', { name: 'Export detailed PNG · S', exact: true })).toBeEnabled();
});
