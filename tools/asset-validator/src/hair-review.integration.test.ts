import { cp, mkdtemp, readFile, readdir, rm, stat, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decode } from 'fast-png';
import { describe, expect, it } from 'vitest';
import { blankImage, decodePng, encodePng } from '@character-studio/render-utils';
import { prepareHairReview } from './hair-review';
import { hairReviewSchema } from './hair-review-schema';
import { matteReference } from './matte';
import { referenceImportSettingsSchema } from './schema';
import { sha256 } from './reference-import';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const sourceDirectory = resolve(repository, 'assets/source/heroine-v1/hair-long-waves-v1');

// Recreate just S/N from tracked inputs, never depend on ignored local staging.
async function references(directory: string) {
  await mkdir(directory, { recursive: true });
  const settings = referenceImportSettingsSchema.parse(JSON.parse(await readFile(resolve(repository, 'assets/references/heroine-v1/import-v1.json'), 'utf8')));
  for (const direction of ['S', 'N'] as const) {
    const decoded = decode(await readFile(resolve(repository, 'assets/references/heroine-v1/detailed', `${direction}.png`)), { checkCrc: true });
    const image = blankImage(1024, 1536);
    for (let p = 0; p < 1024 * 1536; p++) {
      image.data.set(decoded.data.subarray(p * decoded.channels, p * decoded.channels + 3), p * 4);
      image.data[p * 4 + 3] = decoded.channels === 4 ? decoded.data[p * 4 + 3]! : 255;
    }
    const frame = settings.frames[direction];
    await writeFile(resolve(directory, `${direction}.png`), encodePng(matteReference(image, frame.labelExclusions, settings.matte, frame.backgroundCorrections).image));
  }
}

describe('S/N modular hair authoring review', () => {
  it('prepares reproducible detached layers with native attachments, facing depth, hidden north fringe and immutable inputs', async () => {
    const temporary = await mkdtemp(resolve(tmpdir(), 'character-hair-review-'));
    try {
      const referenceDirectory = resolve(temporary, 'references');
      await references(referenceDirectory);
      const draft = hairReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v1.json'), 'utf8')));
      const parts = [draft.frames.S.rear, draft.frames.N.rear, ...(draft.frames.S.front.visibility === 'visible' ? [draft.frames.S.front.artwork] : [])];
      const before = await Promise.all(parts.map(async (part) => ({ path: resolve(sourceDirectory, part.source), hash: sha256(await readFile(resolve(sourceDirectory, part.source))), mtime: (await stat(resolve(sourceDirectory, part.source))).mtimeMs })));
      const options = { sourceDirectory, referenceDirectory, outputDirectory: resolve(temporary, 'staging') };
      const first = await prepareHairReview(options);
      expect(first.published).toBe(false);
      expect(first.paletteReady).toBe(false);
      expect(first.sourcePose).toBe('standing-reference');
      expect(first.rigCompatibility).toBe('unverified');
      expect(first.missingDirections).toEqual(['NE', 'E', 'SE', 'SW', 'W', 'NW']);
      expect(first.hiddenLayers).toMatchObject([{ direction: 'N', part: 'front' }]);
      expect(first.measurements).toHaveLength(3);
      for (const layer of first.measurements) {
        expect(layer.position).toEqual({ x: 0, y: 0 });
        expect(layer.alpha.transparent).toBeGreaterThan(0);
        expect(layer.greenCandidates).toBe(0);
        const image = decodePng(await readFile(resolve(options.outputDirectory, `layers/${layer.direction}-${layer.part}.png`)));
        expect([image.width, image.height]).toEqual([1024, 1536]);
        for (let i = 0; i < image.data.length; i += 4) if (!image.data[i + 3] && (image.data[i] || image.data[i + 1] || image.data[i + 2])) throw new Error('Invisible RGB was not normalized.');
      }
      expect(sha256(await readFile(resolve(options.outputDirectory, 'assembled/N.png')))).toBe(first.measurements.find((m) => m.direction === 'N')!.outputSha256);
      const green = decodePng(await readFile(resolve(options.outputDirectory, 'inspection/green/S-assembled.png')));
      expect([...green.data.slice(0, 4)]).toEqual([0, 255, 0, 255]);
      expect([...green.data.slice((8 * 1024 + 8) * 4, (8 * 1024 + 8) * 4 + 4)]).toEqual([255, 255, 0, 255]);
      const outputs = new Map<string, string>();
      for (const path of await readdir(options.outputDirectory, { recursive: true })) if ((await stat(resolve(options.outputDirectory, path))).isFile()) outputs.set(path, sha256(await readFile(resolve(options.outputDirectory, path))));
      expect(await prepareHairReview(options)).toEqual(first);
      for (const [path, hash] of outputs) expect(sha256(await readFile(resolve(options.outputDirectory, path)))).toBe(hash);
      for (const input of before) {
        expect(sha256(await readFile(input.path))).toBe(input.hash);
        expect((await stat(input.path)).mtimeMs).toBe(input.mtime);
      }
    } finally { await rm(temporary, { recursive: true, force: true }); }
  }, 120_000);

  it('rejects changed inputs, non-native geometry and label contamination before creating outputs', async () => {
    const temporary = await mkdtemp(resolve(tmpdir(), 'character-hair-errors-'));
    try {
      const copy = resolve(temporary, 'source'), referenceDirectory = resolve(temporary, 'references'), outputDirectory = resolve(temporary, 'staging');
      await cp(sourceDirectory, copy, { recursive: true });
      await references(referenceDirectory);
      const path = resolve(copy, 'authoring-v1.json');
      const draft = JSON.parse(await readFile(path, 'utf8'));
      const source = resolve(copy, draft.frames.S.rear.source);
      const original = await readFile(source);
      await writeFile(source, new Uint8Array([1, 2, 3]));
      await expect(prepareHairReview({ sourceDirectory: copy, referenceDirectory, outputDirectory })).rejects.toThrow('hash changed');
      await expect(stat(outputDirectory)).rejects.toThrow('ENOENT');
      for (const image of [blankImage(128, 192), blankImage(1024, 1536)]) {
        image.data.set([255, 255, 0, 255], (8 * image.width + 8) * 4);
        const bytes = encodePng(image);
        await writeFile(source, bytes);
        draft.frames.S.rear.sourceSha256 = sha256(bytes);
        await writeFile(path, JSON.stringify(draft));
        await expect(prepareHairReview({ sourceDirectory: copy, referenceDirectory, outputDirectory })).rejects.toThrow(image.width === 128 ? 'no resampling' : 'authoring envelope');
        await expect(stat(outputDirectory)).rejects.toThrow('ENOENT');
      }
      await writeFile(source, original);
      await expect(prepareHairReview({ sourceDirectory, referenceDirectory, outputDirectory: sourceDirectory })).rejects.toThrow('disjoint');
    } finally { await rm(temporary, { recursive: true, force: true }); }
  }, 30_000);
});
