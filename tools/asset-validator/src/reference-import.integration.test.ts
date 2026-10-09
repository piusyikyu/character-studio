import { mkdtemp, readFile, readdir, rm, stat, writeFile, cp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { decode } from 'fast-png';
import { DIRECTIONS } from '@character-studio/core';
import { blankImage, decodePng, encodePng } from '@character-studio/render-utils';
import { importReferencePack, sha256 } from './reference-import';
import { matteReference } from './matte';
import { referenceImportSettingsSchema } from './schema';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const sourceDirectory = resolve(repository, 'assets/references/heroine-v1/detailed');
const settingsPath = resolve(repository, 'assets/references/heroine-v1/import-v1.json');

describe('reference import review workflows', () => {
  it('unmixes soft curl edges, removes labels and preserves opaque artwork and existing alpha', async () => {
    const settings = referenceImportSettingsSchema.parse(JSON.parse(await readFile(settingsPath, 'utf8')));
    const image = blankImage(32, 32);
    for (let p = 0; p < 1024; p++) image.data.set([2, 245, 3, 255], p * 4);
    for (let y = 12; y < 20; y++) for (let x = 12; x < 20; x++) image.data.set([180, 140, 220, 255], (y * 32 + x) * 4);
    const edge = (15 * 32 + 11) * 4, curl = (11 * 32 + 12) * 4;
    image.data.set([91, 193, 112, 255], edge); // 50% purple over observed green
    image.data.set([47, 219, 57, 255], curl); // 25% fine curl, retained rather than hard-keyed
    image.data.set([255, 255, 0, 255], (2 * 32 + 2) * 4);
    image.data.set([180, 140, 220, 128], (16 * 32 + 16) * 4);
    for (let y = 12; y < 18; y++) for (let x = 25; x < 31; x++) image.data.set([85, 232, 115, 255], (y * 32 + x) * 4);
    const before = image.data.slice();
    const result = matteReference(image, [{ x: 0, y: 0, width: 6, height: 6 }], settings.matte);
    expect(image.data).toEqual(before);
    expect(result.image.data.slice(0, 4)).toEqual(new Uint8Array(4));
    expect(result.image.data.slice((2 * 32 + 2) * 4, (2 * 32 + 2) * 4 + 4)).toEqual(new Uint8Array(4));
    expect(result.labelsRemoved).toBe(1);
    expect(result.image.data[edge + 3]).toBeGreaterThanOrEqual(126);
    expect(result.image.data[edge + 3]).toBeLessThanOrEqual(129);
    expect(result.image.data[curl + 3]).toBeGreaterThan(55);
    expect(result.image.data[curl + 3]).toBeLessThan(75);
    for (let c = 0; c < 3; c++) expect(Math.abs(result.image.data[edge + c]! - [180, 140, 220][c]!)).toBeLessThanOrEqual(2);
    expect(result.image.data.slice((16 * 32 + 16) * 4, (16 * 32 + 16) * 4 + 4)).toEqual(new Uint8Array([180, 140, 220, 128]));
    expect(encodePng(result.image)).toEqual(encodePng(matteReference(image, [{ x: 0, y: 0, width: 6, height: 6 }], settings.matte).image));
    expect(result.image.data[(15 * 32 + 28) * 4 + 3]).toBe(255); // lighter enclosed screen missed by the global key
    const corrected = matteReference(image, [{ x: 0, y: 0, width: 6, height: 6 }], settings.matte, [{ id: 'mint-gap-v1', region: { x: 24, y: 10, width: 8, height: 10 }, maxRedBlue: 160, note: 'Observed mint-green background.' }]);
    expect(corrected.image.data[(15 * 32 + 28) * 4 + 3]).toBe(0);
    expect(corrected.image.data.slice(edge, edge + 4)).toEqual(result.image.data.slice(edge, edge + 4));
    expect(image.data).toEqual(before);
  });

  it('imports the real eight-facing pack repeatably without changing sources or publishing layers', async () => {
    const temporary = await mkdtemp(resolve(tmpdir(), 'character-reference-review-'));
    try {
      const hashes = await Promise.all(DIRECTIONS.map(async (d) => ({ direction: d, hash: sha256(await readFile(resolve(sourceDirectory, `${d}.png`))), mtime: (await stat(resolve(sourceDirectory, `${d}.png`))).mtimeMs })));
      const options = { sourceDirectory, settingsPath, outputDirectory: resolve(temporary, 'staging') };
      const first = await importReferencePack(options);
      expect(first.frames).toHaveLength(8);
      expect(first.modular).toBe(false); expect(first.published).toBe(false);
      expect(first.pose).toBe('standing-reference');
      expect(first.baselineAudit.inconsistent).toBe(true);
      const outputFiles = await readdir(options.outputDirectory, { recursive: true });
      const outputs = new Map<string, string>();
      for (const path of outputFiles) if ((await stat(resolve(options.outputDirectory, path))).isFile()) outputs.set(path, sha256(await readFile(resolve(options.outputDirectory, path))));
      for (const frame of first.frames) {
        const image = decodePng(await readFile(resolve(options.outputDirectory, 'transparent', `${frame.direction}.png`)));
        expect([image.width, image.height]).toEqual([1024, 1536]);
        expect(frame.sourceAlpha.opaque).toBe(1024 * 1536);
        expect(frame.stagingAlpha.partial).toBeGreaterThan(0);
        expect(frame.stagingAlpha.transparent).toBeGreaterThan(0);
        expect(frame.stagingAlpha.opaque).toBeGreaterThan(0);
        expect(frame.background.distinctColours).toBeGreaterThan(100);
        expect(frame.anchorCandidates).toHaveLength(9);
        expect(frame.approximateFootBaseline.y).not.toBeNull();
        const original = decode(await readFile(resolve(sourceDirectory, `${frame.direction}.png`)), { checkCrc: true });
        let preservedCorePixels = 0;
        for (let p = 0; p < image.width * image.height; p++) if (original.data[p * original.channels + 1]! - Math.max(original.data[p * original.channels]!, original.data[p * original.channels + 2]!) <= first.settings.matte.greenExcess && !(p % image.width < 180 && Math.floor(p / image.width) < 110)) {
          if (image.data[p * 4 + 3] !== 255) throw new Error(`${frame.direction}: core foreground alpha changed at pixel ${p}.`);
          for (let c = 0; c < 3; c++) if (image.data[p * 4 + c] !== original.data[p * original.channels + c]) throw new Error(`${frame.direction}: opaque foreground artwork changed at pixel ${p}.`);
          preservedCorePixels++;
        }
        expect(preservedCorePixels).toBeGreaterThan(100_000);
        if (frame.direction === 'SE') {
          expect(first.processingRevision).toBe(2);
          expect(frame.backgroundCorrections[0]?.id).toBe('se-curl-gap-v1');
          expect(image.data[(750 * 1024 + 308) * 4 + 3]).toBe(0);
          for (let y = 720; y < 780; y++) for (let x = 290; x < 335; x++) {
            const i = (y * image.width + x) * 4;
            if (image.data[i + 3] && image.data[i + 1]! - Math.max(image.data[i]!, image.data[i + 2]!) > 20) throw new Error('SE curl gap retained green contamination.');
          }
        }
        if (!['N', 'S'].includes(frame.direction)) {
          expect(frame.labelForegroundPixelsRemoved).toBeGreaterThan(100);
          for (let y = 0; y < 110; y++) for (let x = 0; x < 180; x++) expect(image.data[(y * image.width + x) * 4 + 3]).toBe(0);
        }
        for (let p = 0; p < image.width * image.height; p++) if (image.data[p * 4 + 3] === 0) {
          if (image.data[p * 4] || image.data[p * 4 + 1] || image.data[p * 4 + 2]) throw new Error('Transparent RGB must be zero.');
        }
        const green = decodePng(await readFile(resolve(options.outputDirectory, 'inspection/green', `${frame.direction}.png`)));
        expect(green.data.slice(0, 4)).toEqual(new Uint8Array([0, 255, 0, 255]));
        expect(green.data.slice((8 * green.width + 8) * 4, (8 * green.width + 8) * 4 + 4)).toEqual(new Uint8Array([255, 255, 0, 255]));
      }
      expect(decodePng(await readFile(resolve(options.outputDirectory, 'contact-originals.png')))).toMatchObject({ width: 4096, height: 3072 });
      expect(await importReferencePack(options)).toEqual(first);
      for (const [path, hash] of outputs) expect(sha256(await readFile(resolve(options.outputDirectory, path)))).toBe(hash);
      for (const source of hashes) {
        expect(sha256(await readFile(resolve(sourceDirectory, `${source.direction}.png`)))).toBe(source.hash);
        expect((await stat(resolve(sourceDirectory, `${source.direction}.png`))).mtimeMs).toBe(source.mtime);
      }
    } finally { await rm(temporary, { recursive: true, force: true }); }
  }, 180_000);

  it('rejects missing, wrong-size, changed and overlapping sources before writing staging', async () => {
    const temporary = await mkdtemp(resolve(tmpdir(), 'character-reference-errors-'));
    try {
      const outputDirectory = resolve(temporary, 'output');
      await expect(importReferencePack({ sourceDirectory, settingsPath, outputDirectory: sourceDirectory })).rejects.toThrow('disjoint');
      const copy = resolve(temporary, 'sources'); await cp(sourceDirectory, copy, { recursive: true });
      await rm(resolve(copy, 'NW.png'));
      await expect(importReferencePack({ sourceDirectory: copy, settingsPath, outputDirectory })).rejects.toThrow('ENOENT');
      await expect(stat(outputDirectory)).rejects.toThrow('ENOENT');
      await cp(resolve(sourceDirectory, 'NW.png'), resolve(copy, 'NW.png'));
      await writeFile(resolve(copy, 'N.png'), encodePng(blankImage(128, 192)));
      await expect(importReferencePack({ sourceDirectory: copy, settingsPath, outputDirectory })).rejects.toThrow('1024 × 1536');
      await cp(resolve(sourceDirectory, 'S.png'), resolve(copy, 'N.png'));
      await expect(importReferencePack({ sourceDirectory: copy, settingsPath, outputDirectory })).rejects.toThrow('approved source hash differs');
      await expect(stat(outputDirectory)).rejects.toThrow('ENOENT');
    } finally { await rm(temporary, { recursive: true, force: true }); }
  });
});
