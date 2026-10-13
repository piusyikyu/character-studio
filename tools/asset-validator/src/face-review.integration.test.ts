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
    const sourceDirectory = resolve(repository, 'assets/source/heroine-v1/face/reference-v1'), earDirectory = resolve(repository, 'assets/source/heroine-v1/ears/human-v1'), headDirectory = resolve(repository, 'assets/source/heroine-v1/head/soft-oval-v1');
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
    expect(report).toMatchObject({ assetVersion: 11, anatomyApproved: false, published: false, paletteReady: false, supportedReviewDirections: ['S'], missingDirections: ['N', 'NE', 'E', 'SE', 'SW', 'W', 'NW'], nativePosition: { x: 0, y: 0 } });
    const approval = JSON.parse(await readFile(resolve(earDirectory, 'review-fit-v2.json'), 'utf8'));
    expect(report.approvedEarFitSha256).toBe(approval.fitMeasurements[0].outputSha256);
    expect(report.faceFitSha256).not.toBe(report.approvedEarFitSha256);
    expect(report.measurements.some((m) => m.foregroundHairOverlapPixels > 0)).toBe(true);
    const config = faceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v11.json'), 'utf8')));
    const depth = await prepareFaceReview({ ...options, configFile: 'authoring-v10.json', outputDirectory: resolve(temporary, 'historical-v10') });
    expect(depth.faceFitSha256).toBe('6e920d4722d9b8e42662c2331fe3d0fe8979af66cd8d0849b2ad2e5d7dd64bb6');
    expect(report.rejectedBrowFitSha256).toBe(depth.faceFitSha256);
    expect(config.browRepair!.front).toBeUndefined(); expect(report.frontRevealMeasurements).toBeUndefined();
    const thin = await prepareFaceReview({ ...options, configFile: 'authoring-v9.json', outputDirectory: resolve(temporary, 'historical-v9') });
    expect(thin.faceFitSha256).toBe('14b587818bd43507ef034422e2dd4fc49013a1269b475aa405bb508233cc792c');
    expect(thin.rejectedBrowFitSha256).toBe('8dc1cf5cdcdfd131e6c9caa077d5c3f8a4a3363cb46fda57cc34aee55f4acd92');
    const lines = await prepareFaceReview({ ...options, configFile: 'authoring-v7.json', outputDirectory: resolve(temporary, 'historical-v7') });
    expect(lines.faceFitSha256).toBe('19a9ad67a73ae671d06e735c88cc5728aa9cb85ca518636ab04d87cdf844a9c2');
    expect(depth.rejectedBrowFitSha256).toBe(thin.faceFitSha256);
    expect(lines.rejectedBrowFitSha256).toBe('f263cec9a9593251cdab8cdd2ed30606a798d3d01eca6e1e35736640e664113d');
    const approved = await prepareFaceReview({ ...options, configFile: 'authoring-v5.json', outputDirectory: resolve(temporary, 'historical-v5') });
    const aligned = await prepareFaceReview({ ...options, configFile: 'authoring-v4.json', outputDirectory: resolve(temporary, 'historical-v4') });
    const historical = await prepareFaceReview({ ...options, configFile: 'authoring-v3.json', outputDirectory: resolve(temporary, 'historical-v3') });
    expect(report.previousFitSha256).toBe(approved.faceFitSha256);
    expect(approved.previousFitSha256).toBe(aligned.faceFitSha256);
    expect(approved.faceFitSha256).toBe('d91ba3564312f1bacbd7f4822709e93a2a4b9db9e9c388a828f88481e3525ea9');
    expect(report.approvedPreviousFit?.outputSha256).toBe(approved.faceFitSha256);
    expect(report.eyelidFolds).toMatchObject([{ side: 'right', plane: 'eyes', pixels: 70 }, { side: 'left', plane: 'eyes', pixels: 56 }]);
    expect(aligned.previousFitSha256).toBe(historical.faceFitSha256);
    expect(aligned.faceFitSha256).toBe('e850aca7d6ae7f04c503524dd472a3f9a8bc1b6cd84695650bff24099b202545');
    expect(report.faceFitSha256).not.toBe(historical.faceFitSha256);
    expect(report.alignmentMeasurements).toMatchObject({ referenceNeck: 23, frontHair: 386 });
    expect(report.neckEdgeMeasurements).toMatchObject({ neckReset: 23, rearReset: 109 });
    expect(report.overlayInspection!.gapMeasurements.every(m => m.pixels === 0)).toBe(true);
    const rejected = await prepareFaceReview({ ...options, configFile: 'authoring-v2.json', outputDirectory: resolve(temporary, 'historical') });
    expect(historical.previousFitSha256).toBe(rejected.faceFitSha256);
    expect(report.faceFitSha256).not.toBe(rejected.faceFitSha256);
    const prior = faceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v1.json'), 'utf8')));
    for (const name of ['rightEye', 'leftEye', 'mouth'] as const) expect({ ...config.features[name], owner: undefined }).toEqual({ ...prior.features[name], owner: undefined });
    for (const name of ['rightBrow', 'leftBrow'] as const) expect(config.features[name].sourceSha256).not.toBe(prior.features[name].sourceSha256);
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
      ['neck', [await load(sourceDirectory, config.neckEdgeRepair!.neck.source)]], ['hair-rear', [await load(sourceDirectory, config.neckEdgeRepair!.rear.source)]], ['hair-front', [await load(sourceDirectory, config.neckEdgeRepair!.front.source)]],
    ]);
    for (const part of Object.values(config.features)) {
      const image = await load(sourceDirectory, part.source); parts.set(part.plane, [...(parts.get(part.plane) ?? []), image]);
    }
    for (const side of ['right', 'left'] as const) {
      const fold = await load(options.outputDirectory, `layers/S-${side}UpperLidFold.png`);
      expect(sha256(encodePng(fold))).toBe(sha256(encodePng(await load(sourceDirectory, prior.features[side === 'right' ? 'rightBrow' : 'leftBrow'].source))));
      parts.set('eyes', [...parts.get('eyes')!, fold]);
    }
    const expected = blankImage(1024, 1536);
    for (const plane of DIRECTION_PLANE_ORDER.S) for (const image of parts.get(plane) ?? []) drawRgba(expected, image, 0, 0);
    expect(sha256(encodePng(expected))).toBe(report.faceFitSha256);
    // This order matters: foreground hair must remain above eyes/brows, even in the small overlapping region.
    const nativeLeft = await load(sourceDirectory, config.alignmentRepair!.leftEar.source);
    expect(nativeLeft.data.slice((195 * 1024 + 593) * 4, (195 * 1024 + 593) * 4 + 4)).toEqual(reference.data.slice((195 * 1024 + 593) * 4, (195 * 1024 + 593) * 4 + 4));
    expect(sha256(encodePng(nativeLeft))).not.toBe(sha256(encodePng(await load(sourceDirectory, config.headFit!.leftEar.source))));
    expect(sha256(await readFile(resolve(options.outputDirectory, 'layers/S-right-ear.png')))).toBe(sha256(encodePng(await load(sourceDirectory, config.headFit!.rightEar.source))));
    const correctedNeck = await load(sourceDirectory, config.neckEdgeRepair!.neck.source), anatomyStudy = await load(sourceDirectory, config.alignmentRepair!.study.source);
    expect(correctedNeck.data.slice((281 * 1024 + 541) * 4, (281 * 1024 + 541) * 4 + 4)).toEqual(anatomyStudy.data.slice((281 * 1024 + 541) * 4, (281 * 1024 + 541) * 4 + 4));
    const oldFit = decodePng(await readFile(resolve(temporary, 'historical-v4/fit/S.png')));
    // Partial-alpha skin edges must have continuous backing too, not just empty-pixel repairs.
    for (const [x, y] of [[488, 271], [540, 272]]) {
      const i = (y! * 1024 + x!) * 4; expect(oldFit.data[i + 3]).toBeLessThan(128); expect(expected.data[i + 3]).toBeGreaterThanOrEqual(250);
    }
    const backing = parts.get('hair-rear')![0]!;
    for (const [x, y] of [[541, 280], [542, 284], [543, 286]]) {
      const i = (y! * 1024 + x!) * 4; expect(backing.data[i + 2]!).toBeGreaterThan(backing.data[i]! + 10);
    }
    for (const [x, y] of [[544, 293], [545, 296], [545, 297], [546, 299], [547, 302]]) expect(parts.get('hair-front')![0]!.data[(y! * 1024 + x!) * 4 + 3]).toBe(0);
    expect(sha256(await readFile(resolve(options.outputDirectory, 'layers/S-head-underlay.png')))).toBe(sha256(await readFile(resolve(temporary, 'historical-v4/layers/S-head-underlay.png'))));
    expect(sha256(await readFile(resolve(options.outputDirectory, 'layers/S-left-ear.png')))).toBe(sha256(await readFile(resolve(temporary, 'historical-v4/layers/S-left-ear.png'))));
    for (const path of ['layers/S-neck.png', 'layers/S-front-hair.png', 'layers/S-rear-hair.png']) expect(sha256(await readFile(resolve(options.outputDirectory, path)))).toBe(sha256(await readFile(resolve(temporary, 'historical-v5', path))));
    // Eyelid folds stay on the eye plane; real reference brows change only the selected forehead pixels.
    const oldApprovedFit = decodePng(await readFile(resolve(temporary, 'historical-v5/fit/S.png')));
    const browMasks = await Promise.all((['rightBrow', 'leftBrow'] as const).map(name => load(sourceDirectory, config.features[name].selection.source)));
    const outsideCurrent = expected.data.slice(), outsideApproved = oldApprovedFit.data.slice();
    for (let p = 0; p < 1024 * 1536; p++) if (browMasks.some(mask => mask.data[p * 4 + 3]! > 0)) { outsideCurrent.fill(0, p * 4, p * 4 + 4); outsideApproved.fill(0, p * 4, p * 4 + 4); }
    expect(sha256(outsideCurrent)).toBe(sha256(outsideApproved));
    // Both full study curves retain native RGB with authored coverage in actual composition.
    const junctionStudy = await load(sourceDirectory, config.browRepair!.study!.source);
    const clippedConfig = faceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v6.json'), 'utf8')));
    for (const [name, x, y] of [['rightBrow', 459, 176], ['leftBrow', 547, 164]] as const) {
      const i = (y * 1024 + x) * 4, brow = await load(sourceDirectory, config.features[name].source), oldBrow = await load(sourceDirectory, clippedConfig.features[name].source);
      expect(oldBrow.data[i + 3]).toBe(0);
      const mask = await load(sourceDirectory, config.features[name].selection.source), owner = junctionStudy;
      const covered = owner.data.slice(i, i + 4); covered[3] = Math.round(covered[3]! * mask.data[i + 3]! / 255);
      expect(brow.data.slice(i, i + 4)).toEqual(covered);
      expect(parts.get('hair-front')![0]!.data[i + 3]).toBe(0);
      const joinedPixel = blankImage(1, 1); joinedPixel.data.set(oldApprovedFit.data.subarray(i, i + 4));
      drawRgba(joinedPixel, { width: 1, height: 1, data: brow.data.slice(i, i + 4) }, 0, 0);
      expect(expected.data.slice(i, i + 4)).toEqual(joinedPixel.data);
    }
    // Reference fringe stubs from the rejected brow extraction are excluded, without editing foreground hair.
    const linesConfig = faceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v7.json'), 'utf8')));
    for (const [name, x, y] of [['rightBrow', 461, 173], ['leftBrow', 549, 167]] as const) {
      const i = (y * 1024 + x) * 4, brow = await load(sourceDirectory, config.features[name].source), stub = await load(sourceDirectory, linesConfig.features[name].source);
      expect(stub.data[i + 3]).toBeGreaterThan(0); expect(brow.data[i + 3]).toBe(0);
    }
    // The full left brow is retained beneath original foreground opacity, not painted over the hair.
    const tail = await load(sourceDirectory, config.features.leftBrow.source), currentFront = parts.get('hair-front')![0]!;
    const oldDepthConfig = faceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v10.json'), 'utf8')));
    expect(config.features).toEqual(oldDepthConfig.features);
    const oldDepthFront = await load(sourceDirectory, oldDepthConfig.browRepair!.front!.source);
    for (const [x, y] of [[549, 162], [550, 161]]) {
      const i = (y! * 1024 + x!) * 4;
      expect(oldDepthFront.data[i + 3]).toBe(0); expect(currentFront.data[i + 3]).toBeGreaterThan(250);
      expect(tail.data[i + 2]!).toBeGreaterThan(tail.data[i]! + 20);
      expect(expected.data.slice(i, i + 4)).not.toEqual(tail.data.slice(i, i + 4));
      for (let c = 0; c < 3; c++) expect(Math.abs(expected.data[i + c]! - currentFront.data[i + c]!)).toBeLessThanOrEqual(2);
    }
    const oldDepthFit = await load(resolve(temporary, 'historical-v10'), 'fit/S.png');
    for (let y = 148; y <= 188; y++) {
      const start = (y * 1024 + 435) * 4, end = (y * 1024 + 490) * 4;
      expect(expected.data.slice(start, end)).toEqual(oldDepthFit.data.slice(start, end));
    }
    const thinConfig = faceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v9.json'), 'utf8')));
    // Native right-brow bands retain the fuller study, including pixels lost by the thin v9 curve.
    const right = await load(sourceDirectory, config.features.rightBrow.source), thinRight = await load(sourceDirectory, thinConfig.features.rightBrow.source);
    const fullnessPixel = (175 * 1024 + 466) * 4;
    expect(right.data[fullnessPixel + 2]!).toBeGreaterThan(right.data[fullnessPixel]! + 20);
    expect(right.data[fullnessPixel + 3]!).toBeGreaterThan(thinRight.data[fullnessPixel + 3]!);
    const incorrectDepth = blankImage(1024, 1536);
    for (const plane of ['hair-rear', 'neck', 'head', 'ears', 'hair-front', 'eyes', 'eyebrows', 'mouth']) for (const image of parts.get(plane) ?? []) drawRgba(incorrectDepth, image, 0, 0);
    expect(sha256(incorrectDepth.data)).not.toBe(sha256(expected.data));
    expect(await prepareFaceReview({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    const copied = resolve(temporary, 'copied'); await cp(sourceDirectory, copied, { recursive: true });
    const altered = await load(copied, config.features.leftEye.source);
    altered.data.set([255, 255, 255, 255], (100 * 1024 + 511) * 4);
    const alteredBytes = encodePng(altered); await writeFile(resolve(copied, config.features.leftEye.source), alteredBytes); config.features.leftEye.sourceSha256 = sha256(alteredBytes);
    await writeFile(resolve(copied, 'authoring-v11.json'), JSON.stringify(config));
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
    await expect(prepareFaceReview({ ...options, sourceDirectory: copied, configFile: 'authoring-v4.json', outputDirectory: resolve(temporary, 'forged-head') })).rejects.toThrow('Head: aligned fit must preserve native source ownership');
    await cp(sourceDirectory, copied, { recursive: true });
    const sideConfig = faceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v4.json'), 'utf8'))), wrongSide = await load(copied, sideConfig.alignmentRepair!.leftEar.source);
    wrongSide.data.set([255, 180, 160, 255], (202 * 1024 + 435) * 4);
    const wrongSideBytes = encodePng(wrongSide); await writeFile(resolve(copied, sideConfig.alignmentRepair!.leftEar.source), wrongSideBytes); sideConfig.alignmentRepair!.leftEar.sourceSha256 = sha256(wrongSideBytes);
    await writeFile(resolve(copied, 'authoring-v4.json'), JSON.stringify(sideConfig));
    await expect(prepareFaceReview({ ...options, sourceDirectory: copied, configFile: 'authoring-v4.json', outputDirectory: resolve(temporary, 'forged-ear-side') })).rejects.toThrow('Character-left ear: aligned fit must preserve native source ownership');
    await cp(sourceDirectory, copied, { recursive: true });
    const outsideEdgeConfig = faceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v5.json'), 'utf8'))), changedRear = await load(copied, outsideEdgeConfig.neckEdgeRepair!.rear.source);
    changedRear.data.set([255, 255, 255, 255], (500 * 1024 + 511) * 4);
    const edgeBytes = encodePng(changedRear); await writeFile(resolve(copied, outsideEdgeConfig.neckEdgeRepair!.rear.source), edgeBytes); outsideEdgeConfig.neckEdgeRepair!.rear.sourceSha256 = sha256(edgeBytes);
    await writeFile(resolve(copied, 'authoring-v5.json'), JSON.stringify(outsideEdgeConfig));
    await expect(prepareFaceReview({ ...options, sourceDirectory: copied, configFile: 'authoring-v5.json', outputDirectory: resolve(temporary, 'forged-neck-edge') })).rejects.toThrow('Rear hair: neck-edge correction must preserve native source ownership');
    await cp(sourceDirectory, copied, { recursive: true });
    const browConfig = faceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v11.json'), 'utf8'))), changedBrow = await load(copied, browConfig.features.rightBrow.source);
    changedBrow.data.set([255, 255, 255, 255], (170 * 1024 + 529) * 4);
    const browBytes = encodePng(changedBrow); await writeFile(resolve(copied, browConfig.features.rightBrow.source), browBytes); browConfig.features.rightBrow.sourceSha256 = sha256(browBytes);
    await writeFile(resolve(copied, 'authoring-v11.json'), JSON.stringify(browConfig));
    await expect(prepareFaceReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'forged-brow-side') })).rejects.toThrow('preserve both exact revision-10 brow layers');
    await cp(sourceDirectory, copied, { recursive: true });
    const fringeConfig = faceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v10.json'), 'utf8'))), expandedFront = await load(copied, fringeConfig.browRepair!.front!.source);
    expandedFront.data.set([255, 255, 255, 255], (500 * 1024 + 511) * 4);
    const expandedBytes = encodePng(expandedFront); await writeFile(resolve(copied, fringeConfig.browRepair!.front!.source), expandedBytes); fringeConfig.browRepair!.front!.sourceSha256 = sha256(expandedBytes);
    await writeFile(resolve(copied, 'authoring-v10.json'), JSON.stringify(fringeConfig));
    await expect(prepareFaceReview({ ...options, sourceDirectory: copied, configFile: 'authoring-v10.json', outputDirectory: resolve(temporary, 'forged-fringe') })).rejects.toThrow('Front hair: brow-tail reveal must preserve native ownership');
    for (const source of before) { expect(sha256(await readFile(source.path))).toBe(source.hash); expect((await stat(source.path)).mtimeMs).toBe(source.mtime); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 300_000);
