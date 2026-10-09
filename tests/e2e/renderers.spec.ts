import { expect, test } from '@playwright/test';
import type { DemoApi } from '../../apps/studio/src/render-demo';

type DemoWindow = Window & { renderDemo: DemoApi };
test('real Pixi and pixel renders satisfy native geometry, facing visibility, depth, palette isolation and deterministic PNG export', async ({ page }) => {
  test.setTimeout(90_000);
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/render-demo.html');
  await expect(page.getByRole('status')).toHaveText('Ready: 16 native renders and the pixel sheet.', { timeout: 60_000 });
  await expect(page.locator('.gallery img')).toHaveCount(16);
  const result = await page.evaluate(async () => {
    const api = (window as DemoWindow).renderDemo;
    const moduleUrl: string = '/src/render-test-api.ts';
    const { DEFAULT_PALETTES, OUTLINE, encodePng, decodePng, DetailedRenderer } = await import(moduleUrl) as typeof import('../../apps/studio/src/render-test-api');
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
    const count = (data: Uint8Array, colour: readonly number[]) => { let n = 0; for (let i = 0; i < data.length; i += 4) if (data[i] === colour[0] && data[i + 1] === colour[1] && data[i + 2] === colour[2] && data[i + 3] === 255) n++; return n; };
    const summaries = [];
    for (const target of ['pixel', 'detailed'] as const) for (const direction of directions) {
      const { plan, image } = await api.render(target, direction);
      let occupied = 0, crossesBoundary = false;
      for (let y = 0; y < image.height; y++) for (let x = 0; x < image.width; x++) if (image.data[(y * image.width + x) * 4 + 3]) { occupied++; if (x === 0 || y === 0 || x === image.width - 1 || y === image.height - 1) crossesBoundary = true; }
      const eyeCount = count(image.data, DEFAULT_PALETTES['eyes.blue']!.base) + count(image.data, DEFAULT_PALETTES['eyes.crimson']!.base);
      summaries.push({ target, direction, width: image.width, height: image.height, corner: [...image.data.subarray(0, 4)], occupied, crossesBoundary, eyeCount, outlines: count(image.data, OUTLINE), hair: plan.layers.filter((layer) => layer.plane.startsWith('hair')).map((layer) => layer.frameId), head: plan.layers.find((layer) => layer.plane === 'head')!.position, sources: plan.layers.every((layer) => layer.sprite.includes(`/${direction}-`)) });
    }
    const front = await api.render('detailed', 'S');
    const changed = await api.render('detailed', 'S', { ...api.recipe, hair: { ...api.recipe.hair, colour: 'hair.gold' } });
    const allowed = new Set(Object.values(DEFAULT_PALETTES['hair.silver']!).map((colour) => colour.join(',')));
    let changedPixels = 0, unrelatedChanges = 0;
    for (let i = 0; i < front.image.data.length; i += 4) if (front.image.data.subarray(i, i + 4).some((value, c) => value !== changed.image.data[i + c])) { changedPixels++; if (!allowed.has([...front.image.data.subarray(i, i + 3)].join(',')) || front.image.data[i + 3] !== changed.image.data[i + 3]) unrelatedChanges++; }
    const repeated = await api.render('detailed', 'S');
    const png = encodePng(front.image), repeatPng = encodePng(repeated.image);
    const decoded = decodePng(png);
    // Inspect actual GPU pixels at a known native position; counts alone would
    // miss a flipped readback or incorrect alpha/depth/mask handling.
    const probe = await DetailedRenderer.create();
    let probePixels: number[][];
    try {
      const source = { assetId: 'probe', assetVersion: 1, frameId: 'bottom', plane: 'head' as const, order: 0, visibility: 'visible' as const, sprite: 'bottom.png', size: { width: 1, height: 1 }, attachTo: 'head_center' as const, origin: { x: 0, y: 0 }, offset: { x: 100 - front.plan.anchors.head_center.x, y: 100 - front.plan.anchors.head_center.y }, position: { x: 100, y: 100 }, palettes: {} };
      const load = async (name: string) => ({ width: 1, height: 1, data: new Uint8Array(name === 'bottom.png' ? [255, 0, 0, 255] : name === 'top.png' ? [0, 0, 255, 128] : [0, 0, 0, 0]) });
      const top = { ...source, frameId: 'top', order: 1, sprite: 'top.png' };
      const read = (image: Awaited<ReturnType<typeof probe.render>>) => [...image.data.subarray((100 * 1024 + 100) * 4, (100 * 1024 + 100) * 4 + 4)];
      probePixels = [
        read(await probe.render({ ...front.plan, layers: [source, top] }, load)),
        read(await probe.render({ ...front.plan, layers: [{ ...top, order: 0 }] }, load)),
        read(await probe.render({ ...front.plan, layers: [source, { ...top, occlusionMask: { source: 'cut.png', size: { width: 1, height: 1 } } }] }, load)),
      ];
    } finally { await probe.destroy(); }
    return { summaries, changedPixels, unrelatedChanges, probePixels, deterministic: png.length === repeatPng.length && png.every((value, i) => value === repeatPng[i]), roundTrip: decoded.data.every((value, i) => value === front.image.data[i]) };
  });
  for (const summary of result.summaries) {
    expect([summary.width, summary.height]).toEqual(summary.target === 'pixel' ? [128, 192] : [1024, 1536]);
    expect(summary.corner).toEqual([0, 0, 0, 0]);
    expect(summary.occupied).toBeGreaterThan(100); expect(summary.crossesBoundary).toBe(false);
    expect(summary.sources).toBe(true); expect(summary.outlines).toBeGreaterThan(0);
    if (['N', 'NE', 'NW'].includes(summary.direction)) { expect(summary.eyeCount).toBe(0); expect(summary.hair).toEqual(['front', 'rear']); }
    if (['S', 'SE', 'SW'].includes(summary.direction)) { expect(summary.eyeCount).toBeGreaterThan(0); expect(summary.hair).toEqual(['rear', 'front']); }
  }
  for (const target of ['pixel', 'detailed']) expect(new Set(result.summaries.filter((entry) => entry.target === target).map((entry) => JSON.stringify(entry.head))).size).toBeGreaterThan(3);
  expect(result.changedPixels).toBeGreaterThan(0); expect(result.unrelatedChanges).toBe(0);
  expect(result.deterministic).toBe(true); expect(result.roundTrip).toBe(true);
  expect(result.probePixels).toEqual([[127, 0, 128, 255], [0, 0, 255, 128], [255, 0, 0, 255]]);
  expect(errors).toEqual([]);
});

test('downloads native green/yellow detailed and pixel PNGs plus a correctly ordered sprite sheet', async ({ page }) => {
  test.setTimeout(90_000);
  await page.goto('/render-demo.html');
  await expect(page.getByRole('status')).toContainText('Ready:', { timeout: 60_000 });
  const files = await page.evaluate(async () => {
    const api = (window as DemoWindow).renderDemo;
    const moduleUrl: string = '/src/render-test-api.ts';
    const { decodePng } = await import(moduleUrl) as typeof import('../../apps/studio/src/render-test-api');
    const files = await api.exports();
    return files.map((file) => {
      const image = decodePng(file.bytes), scale = image.width === 1024 ? 4 : 1;
      const at = (x: number, y: number) => [...image.data.subarray((y * image.width + x) * 4, (y * image.width + x) * 4 + 4)];
      return { name: file.name, width: image.width, height: image.height, corner: at(0, 0), label: at(2 * scale, 2 * scale), opaque: image.data.filter((_, i) => i % 4 === 3).every((alpha) => alpha === 255), cells: image.width === 512 ? Array.from({ length: 8 }, (_, i) => ({ corner: at((i % 4) * 128, Math.floor(i / 4) * 192), label: at((i % 4) * 128 + 2, Math.floor(i / 4) * 192 + 2) })) : [] };
    });
  });
  expect(files).toHaveLength(17);
  for (const file of files) {
    expect([file.width, file.height]).toEqual(file.name === 'pixel/sheet.png' ? [512, 384] : file.name.startsWith('pixel/') ? [128, 192] : [1024, 1536]);
    expect(file.corner).toEqual([0, 255, 0, 255]); expect(file.label).toEqual([255, 255, 0, 255]); expect(file.opaque).toBe(true);
    for (const cell of file.cells) { expect(cell.corner).toEqual([0, 255, 0, 255]); expect(cell.label).toEqual([255, 255, 0, 255]); }
  }
  const download = page.waitForEvent('download');
  await page.locator('#sheet-download').click();
  expect((await download).suggestedFilename()).toBe('pixel-sheet.png');
  expect(await page.locator('#pixel img').first().evaluate((element) => getComputedStyle(element).imageRendering)).toBe('pixelated');
});
