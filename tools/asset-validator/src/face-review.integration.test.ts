import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decode } from 'fast-png';
import { expect, it } from 'vitest';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { prepareFaceReview, faceReviewSchema } from './face-review';
import { matteReference } from './matte';
import { referenceImportSettingsSchema } from './schema';
import { sha256 } from './reference-import';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
it('reviews native S facial features with approved ears, actual hair depth, deterministic exports and immutable source ownership', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-face-review-'));
  try {
    const sourceDirectory = resolve(repository, 'assets/source/heroine-v1/face-reference-v1'), earDirectory = resolve(repository, 'assets/source/heroine-v1/ears-human-v1'), headDirectory = resolve(repository, 'assets/source/heroine-v1/head-soft-oval-v1');
    const referenceDirectory = resolve(temporary, 'references'); await mkdir(referenceDirectory);
    const settings = referenceImportSettingsSchema.parse(JSON.parse(await readFile(resolve(repository, 'assets/references/heroine-v1/import-v1.json'), 'utf8')));
    const raw = decode(await readFile(resolve(repository, 'assets/references/heroine-v1/detailed/S.png')), { checkCrc: true }), reference = blankImage(1024, 1536);
    for (let p = 0; p < 1024 * 1536; p++) { reference.data.set(raw.data.subarray(p * raw.channels, p * raw.channels + 3), p * 4); reference.data[p * 4 + 3] = raw.channels === 4 ? raw.data[p * 4 + 3]! : 255; }
    await writeFile(resolve(referenceDirectory, 'S.png'), encodePng(matteReference(reference, settings.frames.S.labelExclusions, settings.matte, settings.frames.S.backgroundCorrections).image));
    const files: string[] = [];
    for (const root of [sourceDirectory, earDirectory, headDirectory]) for (const path of await readdir(root, { recursive: true })) if ((await stat(resolve(root, path))).isFile()) files.push(resolve(root, path));
    const before = await Promise.all(files.map(async (path) => ({ path, hash: sha256(await readFile(path)), mtime: (await stat(path)).mtimeMs })));
    const options = { sourceDirectory, earDirectory, headDirectory, referenceDirectory, outputDirectory: resolve(temporary, 'review') };
    const report = await prepareFaceReview(options);
    expect(report).toMatchObject({ assetVersion: 4, anatomyApproved: false, published: false, paletteReady: false, supportedReviewDirections: ['S'], missingDirections: ['N', 'NE', 'E', 'SE', 'SW', 'W', 'NW'], nativePosition: { x: 0, y: 0 } });
    const approval = JSON.parse(await readFile(resolve(earDirectory, 'review-fit-v2.json'), 'utf8'));
    expect(report.approvedEarFitSha256).toBe(approval.fitMeasurements[0].outputSha256);
    expect(report.faceFitSha256).not.toBe(report.approvedEarFitSha256);
    expect(report.measurements.some((m) => m.foregroundHairOverlapPixels > 0)).toBe(true);
    const config = faceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v4.json'), 'utf8')));
    const historical = await prepareFaceReview({ ...options, configFile: 'authoring-v3.json', outputDirectory: resolve(temporary, 'historical-v3') });
    expect(report.previousFitSha256).toBe(historical.faceFitSha256);
    expect(report.faceFitSha256).not.toBe(historical.faceFitSha256);
    expect(report.alignmentMeasurements).toMatchObject({ referenceNeck: 23, frontHair: 386 });
    expect(report.overlayInspection!.gapMeasurements.every(m => m.pixels === 0)).toBe(true);
    const rejected = await prepareFaceReview({ ...options, configFile: 'authoring-v2.json', outputDirectory: resolve(temporary, 'historical') });
    expect(historical.previousFitSha256).toBe(rejected.faceFitSha256);
    expect(report.faceFitSha256).not.toBe(rejected.faceFitSha256);
    const prior = faceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v1.json'), 'utf8')));
    for (const name of ['rightEye', 'leftEye', 'rightBrow', 'leftBrow', 'mouth'] as const) expect({ ...config.features[name], owner: undefined }).toEqual({ ...prior.features[name], owner: undefined });
    const ears = JSON.parse(await readFile(resolve(earDirectory, 'authoring-v2.json'), 'utf8'));
    const load = async (directory: string, source: string) => {
      const image = decodePng(await readFile(resolve(directory, source)));
      for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4);
      return image;
    };
    const originalUnderlay = await load(earDirectory, ears.head.source), underlay = await load(sourceDirectory, config.alignmentRepair!.head.source), retention = await load(sourceDirectory, config.alignmentRepair!.retention.source);
    const widthAtCheek = (image: RgbaImage) => { const xs: number[] = []; for (let x = 430; x < 610; x++) if (image.data[(240 * 1024 + x) * 4 + 3]! >= 8) xs.push(x); return xs.at(-1)! - xs[0]! + 1; };
    expect(widthAtCheek(underlay)).toBeLessThan(widthAtCheek(originalUnderlay) * 0.9);
    for (let i = 0; i < underlay.data.length; i += 4) if (retention.data[i + 3] === 0) underlay.data.fill(0, i, i + 4);
    const parts = new Map<string, RgbaImage[]>([
      ['head', [underlay]], ['ears', [await load(sourceDirectory, config.headFit!.rightEar.source), await load(sourceDirectory, config.alignmentRepair!.leftEar.source)]],
      ['neck', [await load(sourceDirectory, config.alignmentRepair!.neck.source)]], ['hair-rear', [await load(sourceDirectory, config.alignmentRepair!.rear.source)]], ['hair-front', [await load(sourceDirectory, config.alignmentRepair!.front.source)]],
    ]);
    for (const part of Object.values(config.features)) {
      const image = await load(sourceDirectory, part.source); parts.set(part.plane, [...(parts.get(part.plane) ?? []), image]);
    }
    const expected = blankImage(1024, 1536);
    for (const plane of DIRECTION_PLANE_ORDER.S) for (const image of parts.get(plane) ?? []) drawRgba(expected, image, 0, 0);
    expect(sha256(encodePng(expected))).toBe(report.faceFitSha256);
    // This order matters: foreground hair must remain above eyes/brows, even in the small overlapping region.
    const nativeLeft = await load(sourceDirectory, config.alignmentRepair!.leftEar.source);
    expect(nativeLeft.data.slice((195 * 1024 + 593) * 4, (195 * 1024 + 593) * 4 + 4)).toEqual(reference.data.slice((195 * 1024 + 593) * 4, (195 * 1024 + 593) * 4 + 4));
    expect(sha256(encodePng(nativeLeft))).not.toBe(sha256(encodePng(await load(sourceDirectory, config.headFit!.leftEar.source))));
    expect(sha256(await readFile(resolve(options.outputDirectory, 'layers/S-right-ear.png')))).toBe(sha256(encodePng(await load(sourceDirectory, config.headFit!.rightEar.source))));
    const correctedNeck = await load(sourceDirectory, config.alignmentRepair!.neck.source);
    expect(correctedNeck.data.slice((281 * 1024 + 541) * 4, (281 * 1024 + 541) * 4 + 4)).toEqual(reference.data.slice((281 * 1024 + 541) * 4, (281 * 1024 + 541) * 4 + 4));
    const incorrectDepth = blankImage(1024, 1536);
    for (const plane of ['hair-rear', 'neck', 'head', 'ears', 'hair-front', 'eyes', 'eyebrows', 'mouth']) for (const image of parts.get(plane) ?? []) drawRgba(incorrectDepth, image, 0, 0);
    expect(sha256(incorrectDepth.data)).not.toBe(sha256(expected.data));
    expect(await prepareFaceReview({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    const copied = resolve(temporary, 'copied'); await cp(sourceDirectory, copied, { recursive: true });
    const altered = await load(copied, config.features.leftEye.source);
    altered.data.set([255, 255, 255, 255], (100 * 1024 + 511) * 4);
    const alteredBytes = encodePng(altered); await writeFile(resolve(copied, config.features.leftEye.source), alteredBytes); config.features.leftEye.sourceSha256 = sha256(alteredBytes);
    await writeFile(resolve(copied, 'authoring-v4.json'), JSON.stringify(config));
    await expect(prepareFaceReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'forged-layer') })).rejects.toThrow('restore exact original reference feature layers');
    // A re-pinned mask cannot expand into a different feature or direction's artwork.
    await cp(sourceDirectory, copied, { recursive: true });
    const cleanConfig = faceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v3.json'), 'utf8')));
    const ownership = JSON.parse(await readFile(resolve(copied, cleanConfig.settings.source), 'utf8'));
    ownership.features.rightEye.polygon[0] = [600, 300];
    const ownershipBytes = Buffer.from(JSON.stringify(ownership)); await writeFile(resolve(copied, cleanConfig.settings.source), ownershipBytes); cleanConfig.settings.sourceSha256 = sha256(ownershipBytes);
    await writeFile(resolve(copied, 'authoring-v3.json'), JSON.stringify(cleanConfig));
    await expect(prepareFaceReview({ ...options, sourceDirectory: copied, configFile: 'authoring-v3.json', outputDirectory: resolve(temporary, 'forged-selection') })).rejects.toThrow('native facing/side/feature ownership');
    await cp(sourceDirectory, copied, { recursive: true });
    const outsideConfig = faceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v4.json'), 'utf8'))), changedHead = await load(copied, outsideConfig.alignmentRepair!.head.source);
    const upperSkullPixel = (100 * 1024 + 511) * 4; changedHead.data[upperSkullPixel] = changedHead.data[upperSkullPixel]! ^ 1;
    const outsideBytes = encodePng(changedHead); await writeFile(resolve(copied, outsideConfig.alignmentRepair!.head.source), outsideBytes); outsideConfig.alignmentRepair!.head.sourceSha256 = sha256(outsideBytes);
    await writeFile(resolve(copied, 'authoring-v4.json'), JSON.stringify(outsideConfig));
    await expect(prepareFaceReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'forged-head') })).rejects.toThrow('Head: aligned fit must preserve native source ownership');
    await cp(sourceDirectory, copied, { recursive: true });
    const sideConfig = faceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v4.json'), 'utf8'))), wrongSide = await load(copied, sideConfig.alignmentRepair!.leftEar.source);
    wrongSide.data.set([255, 180, 160, 255], (202 * 1024 + 435) * 4);
    const wrongSideBytes = encodePng(wrongSide); await writeFile(resolve(copied, sideConfig.alignmentRepair!.leftEar.source), wrongSideBytes); sideConfig.alignmentRepair!.leftEar.sourceSha256 = sha256(wrongSideBytes);
    await writeFile(resolve(copied, 'authoring-v4.json'), JSON.stringify(sideConfig));
    await expect(prepareFaceReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'forged-ear-side') })).rejects.toThrow('Character-left ear: aligned fit must preserve native source ownership');
    for (const source of before) { expect(sha256(await readFile(source.path))).toBe(source.hash); expect((await stat(source.path)).mtimeMs).toBe(source.mtime); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 180_000);
