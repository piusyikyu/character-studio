import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decode } from 'fast-png';
import { expect, it } from 'vitest';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import { prepareEarReview, earReviewSchema } from './ear-review';
import { matteReference } from './matte';
import { referenceImportSettingsSchema } from './schema';
import { sha256 } from './reference-import';

const repository = fileURLToPath(new URL('../../../', import.meta.url));

it('reviews separate S human ears and smaller revision with concealed skin, bounded native ownership and immutable sources', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-ear-review-'));
  try {
    const sourceDirectory = resolve(repository, 'assets/source/heroine-v1/ears-human-v1'), headDirectory = resolve(repository, 'assets/source/heroine-v1/head-soft-oval-v1');
    const referenceDirectory = resolve(temporary, 'references'); await mkdir(referenceDirectory);
    const settings = referenceImportSettingsSchema.parse(JSON.parse(await readFile(resolve(repository, 'assets/references/heroine-v1/import-v1.json'), 'utf8')));
    const raw = decode(await readFile(resolve(repository, 'assets/references/heroine-v1/detailed/S.png')), { checkCrc: true }), reference = blankImage(1024, 1536);
    for (let p = 0; p < 1024 * 1536; p++) { reference.data.set(raw.data.subarray(p * raw.channels, p * raw.channels + 3), p * 4); reference.data[p * 4 + 3] = raw.channels === 4 ? raw.data[p * 4 + 3]! : 255; }
    await writeFile(resolve(referenceDirectory, 'S.png'), encodePng(matteReference(reference, settings.frames.S.labelExclusions, settings.matte, settings.frames.S.backgroundCorrections).image));
    const files = [];
    for (const directory of [sourceDirectory, headDirectory]) for (const path of await readdir(directory, { recursive: true })) if ((await stat(resolve(directory, path))).isFile()) files.push(resolve(directory, path));
    const before = await Promise.all(files.map(async (path) => ({ path, hash: sha256(await readFile(path)), mtime: (await stat(path)).mtimeMs })));
    const options = { sourceDirectory, headDirectory, referenceDirectory, outputDirectory: resolve(temporary, 'review') };
    const report = await prepareEarReview(options);
    expect(report).toMatchObject({ anatomyApproved: false, published: false, humanAssemblyMatchesAcceptedHead: true, humanFitMatchesAcceptedS5: true });
    const config = earReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v1.json'), 'utf8')));
    const original = decodePng(await readFile(resolve(headDirectory, 'S-head-v1.png')));
    for (let i = 0; i < original.data.length; i += 4) if (original.data[i + 3]! < 8) original.data.fill(0, i, i + 4);
    const underlay = decodePng(await readFile(resolve(options.outputDirectory, 'layers/S-head-underlay.png'))), retention = decodePng(await readFile(resolve(options.outputDirectory, 'masks/S-human-head-retention.png')));
    const masked = { ...underlay, data: underlay.data.slice() };
    for (let i = 0; i < masked.data.length; i += 4) if (!retention.data[i + 3]) masked.data.fill(0, i, i + 4);
    const reconstructed = blankImage(1024, 1536); drawRgba(reconstructed, masked, 0, 0);
    for (const side of ['right', 'left']) drawRgba(reconstructed, decodePng(await readFile(resolve(options.outputDirectory, `layers/S-${side}-ear.png`))), 0, 0);
    expect(sha256(reconstructed.data)).toBe(sha256(original.data));
    // Complete root skin remains with ears absent, while former ear protrusions disappear.
    for (const [x, y] of [[449, 208], [574, 208]]) expect(underlay.data[(y! * 1024 + x!) * 4 + 3]).toBeGreaterThanOrEqual(8);
    for (const [x, y] of [[431, 211], [592, 208]]) { const i = (y! * 1024 + x!) * 4; expect(original.data[i + 3]).toBeGreaterThanOrEqual(8); expect(underlay.data[i + 3]).toBe(0); }
    const approval = JSON.parse(await readFile(resolve(headDirectory, 'review-fit-v5.json'), 'utf8'));
    expect(report.humanFitSha256).toBe(approval.fitMeasurements.find((m: { direction: string }) => m.direction === 'S').outputSha256);
    expect(report.earlessFitSha256).not.toBe(report.humanFitSha256);
    expect(await prepareEarReview({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    const smallerOptions = { ...options, configFile: 'authoring-v2.json' as const, outputDirectory: resolve(temporary, 'smaller-review') };
    const smaller = await prepareEarReview(smallerOptions);
    expect(smaller).toMatchObject({ assetVersion: 2, anatomyApproved: false, published: false, humanAssemblyMatchesAcceptedHead: false, humanFitMatchesAcceptedS5: false });
    expect(smaller.earlessFitSha256).toBe(report.earlessFitSha256);
    const corrected = decodePng(await readFile(resolve(smallerOptions.outputDirectory, 'assembled/S-head-human.png')));
    let changed = 0;
    for (let p = 0; p < 1024 * 1536; p++) {
      const x = p % 1024, y = Math.floor(p / 1024), local = y >= 183 && y < 241 && ((x >= 422 && x < 455) || (x >= 568 && x < 603));
      if (corrected.data.subarray(p * 4, p * 4 + 4).some((v, c) => v !== original.data[p * 4 + c])) { expect(local).toBe(true); changed++; }
    }
    expect(changed).toBeGreaterThan(0);
    // Smaller anatomy must reduce each ear's exposed area beyond the fixed ear-free scalp.
    for (const side of ['right', 'left']) {
      const oldEar = decodePng(await readFile(resolve(options.outputDirectory, `layers/S-${side}-ear.png`)));
      const smallEar = decodePng(await readFile(resolve(smallerOptions.outputDirectory, `layers/S-${side}-ear.png`)));
      let oldArea = 0, smallArea = 0;
      for (let i = 3; i < underlay.data.length; i += 4) if (underlay.data[i]! < 8) { if (oldEar.data[i]! >= 8) oldArea++; if (smallEar.data[i]! >= 8) smallArea++; }
      expect(smallArea).toBeGreaterThan(0); expect(smallArea).toBeLessThan(oldArea * 0.8);
    }
    expect(await prepareEarReview({ ...smallerOptions, outputDirectory: resolve(temporary, 'smaller-repeat') })).toEqual(smaller);
    for (const output of smaller.outputs) expect(sha256(await readFile(resolve(smallerOptions.outputDirectory, output.path)))).toBe(output.sha256);
    const copied = resolve(temporary, 'sources'); await cp(sourceDirectory, copied, { recursive: true });
    const left = decodePng(await readFile(resolve(copied, config.sides.left.source)));
    const pixel = left.data.findIndex((v, i) => i % 4 === 3 && v >= 8) - 3;
    left.data[pixel] = left.data[pixel]! ^ 1;
    const earBytes = encodePng(left); await writeFile(resolve(copied, config.sides.left.source), earBytes); config.sides.left.sourceSha256 = sha256(earBytes);
    await writeFile(resolve(copied, 'authoring-v1.json'), JSON.stringify(config));
    await expect(prepareEarReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'forged-ear') })).rejects.toThrow('ear pixels must retain their own accepted native side ownership');
    await writeFile(resolve(copied, config.sides.left.source), await readFile(resolve(sourceDirectory, config.sides.left.source)));
    const cleanConfig = earReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v1.json'), 'utf8')));
    const head = decodePng(await readFile(resolve(copied, cleanConfig.head.source))), outside = (100 * 1024 + 511) * 4;
    expect(head.data[outside + 3]).toBeGreaterThanOrEqual(8); head.data[outside] = head.data[outside]! ^ 1;
    const headBytes = encodePng(head); await writeFile(resolve(copied, cleanConfig.head.source), headBytes); cleanConfig.head.sourceSha256 = sha256(headBytes);
    await writeFile(resolve(copied, 'authoring-v1.json'), JSON.stringify(cleanConfig));
    await expect(prepareEarReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'forged-head') })).rejects.toThrow('Concealed head must preserve all accepted skin outside');
    await writeFile(resolve(copied, 'authoring-v1.json'), await readFile(resolve(sourceDirectory, 'authoring-v1.json')));
    await writeFile(resolve(copied, cleanConfig.head.source), await readFile(resolve(sourceDirectory, cleanConfig.head.source)));
    const smallerConfig = earReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v2.json'), 'utf8')));
    const smallerEar = decodePng(await readFile(resolve(copied, smallerConfig.sides.left.source)));
    const outsideEar = (100 * 1024 + 511) * 4; smallerEar.data.set([255, 128, 128, 255], outsideEar);
    const smallerBytes = encodePng(smallerEar); await writeFile(resolve(copied, smallerConfig.sides.left.source), smallerBytes); smallerConfig.sides.left.sourceSha256 = sha256(smallerBytes);
    await writeFile(resolve(copied, 'authoring-v2.json'), JSON.stringify(smallerConfig));
    await expect(prepareEarReview({ ...smallerOptions, sourceDirectory: copied, outputDirectory: resolve(temporary, 'forged-smaller-ear') })).rejects.toThrow('native side ownership');
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.hash); expect((await stat(file.path)).mtimeMs).toBe(file.mtime); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 120_000);
