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

it('reviews independent SE/SW facial layers with approved native anatomy, real foreground depth and immutable ownership', async () => {
  const { prepareDiagonalFaceReview, diagonalFaceReviewSchema } = await import('./face-diagonal-review');
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-diagonal-face-review-'));
  try {
    const sourceDirectory = resolve(repository, 'assets/source/heroine-v1/face/reference-v1/front-diagonals-v1'), headDirectory = resolve(repository, 'assets/source/heroine-v1/head/soft-oval-v1'), hairDirectory = resolve(repository, 'assets/source/heroine-v1/hair/long-waves-v1'), referenceDirectory = resolve(temporary, 'references');
    await mkdir(referenceDirectory);
    const settings = referenceImportSettingsSchema.parse(JSON.parse(await readFile(resolve(repository, 'assets/references/heroine-v1/import-v1.json'), 'utf8')));
    for (const direction of ['SE', 'SW'] as const) {
      const raw = decode(await readFile(resolve(repository, `assets/references/heroine-v1/detailed/${direction}.png`)), { checkCrc: true }), image = blankImage(1024, 1536);
      for (let p = 0; p < 1024 * 1536; p++) { image.data.set(raw.data.subarray(p * raw.channels, p * raw.channels + 3), p * 4); image.data[p * 4 + 3] = raw.channels === 4 ? raw.data[p * 4 + 3]! : 255; }
      await writeFile(resolve(referenceDirectory, `${direction}.png`), encodePng(matteReference(image, settings.frames[direction].labelExclusions, settings.matte, settings.frames[direction].backgroundCorrections).image));
    }
    const files: string[] = [];
    for (const root of [sourceDirectory, headDirectory, hairDirectory, resolve(repository, 'assets/source/heroine-v1/face/reference-v1')]) for (const path of await readdir(root, { recursive: true })) if ((await stat(resolve(root, path))).isFile()) files.push(resolve(root, path));
    const before = await Promise.all([...new Set(files)].map(async path => ({ path, hash: sha256(await readFile(path)), mtime: (await stat(path)).mtimeMs })));
    const options = { sourceDirectory, headDirectory, hairDirectory, referenceDirectory, configFile: 'authoring-v2.json' as const, outputDirectory: resolve(temporary, 'review') }, report = await prepareDiagonalFaceReview(options);
    expect(report).toMatchObject({ supportedReviewDirections: ['SE', 'SW'], published: false, anatomyApproved: false, bodyOcclusionVerified: false, nativePosition: { x: 0, y: 0 } });
    expect(report.measurements).toHaveLength(10); expect(report.measurements.some(m => m.foregroundHairOverlapPixels > 0)).toBe(true);
    expect(report.futureBodyFitObligations.length).toBeGreaterThan(0);
    const approval = JSON.parse(await readFile(resolve(headDirectory, 'front-diagonals-review-fit-v4.json'), 'utf8'));
    const config = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v2.json'), 'utf8')));
    const previousConfig = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring.json'), 'utf8')));
    const historical = await prepareDiagonalFaceReview({ ...options, configFile: 'authoring.json', outputDirectory: resolve(temporary, 'historical-v1') });
    expect(config.assetVersion).toBe(2);
    expect(historical.fitMeasurements.find(m => m.direction === 'SE')!.outputSha256).toBe('7800ce09aee55e3191ab2e2f8625a0a7548246c725caf6ed9b1a14debf15dcd7');
    expect(historical.fitMeasurements.find(m => m.direction === 'SW')!.outputSha256).toBe('11c8442abf2b30beb7c0b3abbd7c0d127568be7822b3490853364875b2a722b7');
    expect(report.fitMeasurements.find(m => m.direction === 'SW')).toEqual(historical.fitMeasurements.find(m => m.direction === 'SW'));
    for (const direction of ['SE', 'SW'] as const) for (const name of ['rightEye', 'leftEye', 'rightBrow', 'leftBrow', 'mouth'] as const) if (!(direction === 'SE' && name === 'rightEye')) expect(config.frames[direction].features[name]).toEqual(previousConfig.frames[direction].features[name]);
    const load = async (root: string, file: string) => { const image = decodePng(await readFile(resolve(root, file))); for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4); return image; };
    for (const direction of ['SE', 'SW'] as const) {
      const parts = new Map<string, RgbaImage[]>([
        ['head', [await load(options.outputDirectory, `layers/${direction}-head.png`)]], ['neck', [await load(options.outputDirectory, `layers/${direction}-neck.png`)]],
        ['hair-front', [await load(options.outputDirectory, `layers/${direction}-front-hair.png`)]], ['hair-rear', [await load(options.outputDirectory, `layers/${direction}-rear-hair.png`)]],
      ]);
      const headConfig = JSON.parse(await readFile(resolve(headDirectory, 'front-diagonals-authoring-v4.json'), 'utf8'));
      for (const part of ['head', 'neck'] as const) expect(sha256(encodePng(parts.get(part)![0]!))).toBe(sha256(encodePng(await load(headDirectory, headConfig.frames[direction][part].source))));
      const baseline = blankImage(1024, 1536); for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const part of parts.get(plane) ?? []) drawRgba(baseline, part, 0, 0);
      expect(sha256(encodePng(baseline))).toBe(approval.fitMeasurements.find((m: { direction: string }) => m.direction === direction).outputSha256);
      for (const feature of Object.values(config.frames[direction].features)) { const part = await load(sourceDirectory, feature.source); parts.set(feature.plane, [...parts.get(feature.plane) ?? [], part]); }
      const expected = blankImage(1024, 1536); for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const part of parts.get(plane) ?? []) drawRgba(expected, part, 0, 0);
      expect(sha256(encodePng(expected))).toBe(report.fitMeasurements.find(m => m.direction === direction)!.outputSha256);
      if (direction === 'SE') {
        const eye = await load(sourceDirectory, config.frames.SE.features.rightEye.source), oldEye = await load(sourceDirectory, previousConfig.frames.SE.features.rightEye.source), oldFit = await load(resolve(temporary, 'historical-v1'), 'fit/SE.png');
        // The rosy cheek patch is excluded; approved head skin supplies these pixels.
        for (const [x, y] of [[550, 187], [546, 184], [557, 187]]) {
          const i = (y! * 1024 + x!) * 4; expect(oldEye.data[i + 3]).toBe(255); expect(eye.data[i + 3]).toBe(0);
          expect(expected.data.slice(i, i + 4)).toEqual(baseline.data.slice(i, i + 4));
          expect(expected.data.slice(i, i + 4)).not.toEqual(oldFit.data.slice(i, i + 4));
        }
        // Iris, lashes, whites and the retained lower-lid edge stay native and exact.
        for (const [x, y] of [[548, 170], [545, 177], [541, 162], [562, 177], [550, 180]]) {
          const i = (y! * 1024 + x!) * 4; expect(eye.data.slice(i, i + 4)).toEqual(oldEye.data.slice(i, i + 4));
          expect(expected.data.slice(i, i + 4)).toEqual(oldFit.data.slice(i, i + 4));
        }
        const outsideCurrent = expected.data.slice(), outsideOld = oldFit.data.slice(); let changedPixels = 0;
        for (let p = 0; p < 1024 * 1536; p++) {
          const i = p * 4; if (eye.data.subarray(i, i + 4).some((v, c) => v !== oldEye.data[i + c])) { changedPixels++; outsideCurrent.fill(0, i, i + 4); outsideOld.fill(0, i, i + 4); }
        }
        expect(changedPixels).toBe(306); expect(sha256(outsideCurrent)).toBe(sha256(outsideOld));
      }
      const wrongDepth = blankImage(1024, 1536); for (const plane of ['hair-rear', 'neck', 'head', 'hair-front', 'eyes', 'eyebrows', 'mouth']) for (const part of parts.get(plane) ?? []) drawRgba(wrongDepth, part, 0, 0);
      expect(sha256(wrongDepth.data)).not.toBe(sha256(expected.data));
    }
    // The revision-4 far eye excludes fringe/outer strands, preserving the approved near eye and every other feature.
    const candidateOptions = { ...options, configFile: 'authoring-v4.json' as const, outputDirectory: resolve(temporary, 'candidate') }, candidate = await prepareDiagonalFaceReview(candidateOptions);
    const candidateConfig = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v4.json'), 'utf8')));
    expect(candidateConfig.assetVersion).toBe(4); expect(candidate).toMatchObject({ eyeComparisonColumns: ['reference', 'rejected-revision-3', 'far-eye-candidate-revision-4'] });
    expect(candidate.fitMeasurements.find(m => m.direction === 'SW')).toEqual(report.fitMeasurements.find(m => m.direction === 'SW'));
    for (const direction of ['SE', 'SW'] as const) for (const name of ['rightEye', 'leftEye', 'rightBrow', 'leftBrow', 'mouth'] as const) if (!(direction === 'SE' && name === 'leftEye')) expect(candidateConfig.frames[direction].features[name]).toEqual(config.frames[direction].features[name]);
    const oldFarEye = await load(sourceDirectory, config.frames.SE.features.leftEye.source), farEye = await load(sourceDirectory, candidateConfig.frames.SE.features.leftEye.source), oldBare = await load(options.outputDirectory, 'fit/SE-bare.png'), bare = await load(candidateOptions.outputDirectory, 'fit/SE-bare.png'), nativeHead = await load(candidateOptions.outputDirectory, 'layers/SE-head.png');
    for (const [x, y] of [[610, 185], [614, 190], [606, 195], [595, 174]]) { const i = (y! * 1024 + x!) * 4; expect(oldFarEye.data[i + 3]).toBe(255); expect(farEye.data[i + 3]).toBe(0); expect(bare.data.slice(i, i + 4)).toEqual(nativeHead.data.slice(i, i + 4)); }
    for (const [x, y] of [[600, 174], [604, 175], [610, 176], [604, 180], [604, 183]]) { const i = (y! * 1024 + x!) * 4; expect(farEye.data.slice(i, i + 4)).toEqual(oldFarEye.data.slice(i, i + 4)); expect(bare.data.slice(i, i + 4)).toEqual(oldBare.data.slice(i, i + 4)); }
    // The previous trim cut this visible lower-left eye arc. Every recovered pixel comes from the same native reference.
    const rejectedFarEye = await load(sourceDirectory, 'SE-leftEye-v3.png');
    for (const [x, y] of [[598, 184], [599, 185], [600, 186], [600, 187], [601, 188]]) {
      const i = (y! * 1024 + x!) * 4; expect(rejectedFarEye.data[i + 3]).toBe(0); expect(farEye.data[i + 3]).toBe(255);
      expect(farEye.data.slice(i, i + 4)).toEqual(oldFarEye.data.slice(i, i + 4)); expect(bare.data.slice(i, i + 4)).toEqual(oldBare.data.slice(i, i + 4));
    }
    if (candidateConfig.assetVersion !== 4) throw new Error('Far-eye revision 4 required.');
    const eyeRelease = await load(sourceDirectory, candidateConfig.hairRepair.eyeReleaseSelection.source); let releasedPixels = 0;
    for (const kind of ['SE', 'SE-bare']) {
      const oldFit = await load(options.outputDirectory, `fit/${kind}.png`), current = await load(candidateOptions.outputDirectory, `fit/${kind}.png`); let changed = 0;
      for (let i = 0; i < current.data.length; i += 4) if (farEye.data.subarray(i, i + 4).some((v, c) => v !== oldFarEye.data[i + c]) || (kind === 'SE' && (eyeRelease.data[i + 3] ?? 0) > 0)) { changed++; oldFit.data.fill(0, i, i + 4); current.data.fill(0, i, i + 4); }
      expect(changed).toBeGreaterThan(0); expect(sha256(current.data)).toBe(sha256(oldFit.data));
    }
    const originalFront = await load(headDirectory, candidateConfig.hairRepair.original.source), repairedFront = await load(sourceDirectory, candidateConfig.hairRepair.source), hairOwnership = await load(sourceDirectory, candidateConfig.hairRepair.selection.source), approvedFit = await load(options.outputDirectory, 'fit/SE.png'), repairedFit = await load(candidateOptions.outputDirectory, 'fit/SE.png'); let hairPixels = 0;
    for (let i = 0; i < originalFront.data.length; i += 4) {
      if (hairOwnership.data[i + 3]) { hairPixels++; expect(repairedFit.data.slice(i, i + 4)).toEqual(approvedFit.data.slice(i, i + 4)); }
      else if (eyeRelease.data[i + 3]) { releasedPixels++; expect(farEye.data[i + 3]).toBe(255); expect(repairedFront.data.slice(i, i + 4)).toEqual(new Uint8Array(4)); expect(repairedFit.data.slice(i, i + 4)).toEqual(farEye.data.slice(i, i + 4)); }
      else if (repairedFront.data.subarray(i, i + 4).some((v, c) => v !== originalFront.data[i + c])) throw new Error('Front hair changed outside local ownership.');
    }
    expect(releasedPixels).toBe(34); expect(releasedPixels).toBe(candidateConfig.hairRepair.eyeReleasePixels); expect(hairPixels).toBe(candidateConfig.hairRepair.pixelCount); expect(hairPixels).toBeGreaterThan(0);
    const planes = new Map<string, RgbaImage[]>();
    for (const [plane, file] of [['head', 'head'], ['neck', 'neck'], ['hair-front', 'front-hair'], ['hair-rear', 'rear-hair']]) planes.set(plane!, [await load(candidateOptions.outputDirectory, `layers/SE-${file}.png`)]);
    for (const feature of Object.values(candidateConfig.frames.SE.features)) planes.set(feature.plane, [...planes.get(feature.plane) ?? [], await load(sourceDirectory, feature.source)]);
    const composed = blankImage(1024, 1536); for (const plane of DIRECTION_PLANE_ORDER.SE) for (const layer of planes.get(plane) ?? []) drawRgba(composed, layer, 0, 0);
    expect(sha256(encodePng(composed))).toBe(candidate.fitMeasurements.find(m => m.direction === 'SE')!.outputSha256);
    expect(await prepareDiagonalFaceReview({ ...candidateOptions, outputDirectory: resolve(temporary, 'repeat') })).toEqual(candidate);
    for (const output of candidate.outputs) expect(sha256(await readFile(resolve(candidateOptions.outputDirectory, output.path)))).toBe(output.sha256);
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    const copied = resolve(temporary, 'forged'); await cp(sourceDirectory, copied, { recursive: true });
    const changed = await load(copied, config.frames.SE.features.rightEye.source); changed.data.set([255, 255, 255, 255], (200 * 1024 + 405) * 4);
    const changedBytes = encodePng(changed); await writeFile(resolve(copied, config.frames.SE.features.rightEye.source), changedBytes); config.frames.SE.features.rightEye.sourceSha256 = sha256(changedBytes); await writeFile(resolve(copied, 'authoring-v2.json'), JSON.stringify(config));
    await expect(prepareDiagonalFaceReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'wrong-side') })).rejects.toThrow('SE-rightEye: layer/mask must retain only its own native reference pixels');
    // Re-pinning both files cannot restore excluded cheek pixels inside the old eye polygon.
    await cp(sourceDirectory, copied, { recursive: true });
    const expanded = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v2.json'), 'utf8'))), newEye = await load(copied, expanded.frames.SE.features.rightEye.source), newMask = await load(copied, expanded.frames.SE.features.rightEye.selection.source), originalEye = await load(sourceDirectory, previousConfig.frames.SE.features.rightEye.source), cheekPixel = (187 * 1024 + 550) * 4;
    newEye.data.set(originalEye.data.subarray(cheekPixel, cheekPixel + 4), cheekPixel); newMask.data.fill(255, cheekPixel, cheekPixel + 4);
    const newEyeBytes = encodePng(newEye), newMaskBytes = encodePng(newMask); await writeFile(resolve(copied, expanded.frames.SE.features.rightEye.source), newEyeBytes); await writeFile(resolve(copied, expanded.frames.SE.features.rightEye.selection.source), newMaskBytes);
    expanded.frames.SE.features.rightEye.sourceSha256 = sha256(newEyeBytes); expanded.frames.SE.features.rightEye.selection.sourceSha256 = sha256(newMaskBytes); await writeFile(resolve(copied, 'authoring-v2.json'), JSON.stringify(expanded));
    await expect(prepareDiagonalFaceReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'expanded-cheek') })).rejects.toThrow('SE-rightEye: layer/mask must retain only its own native reference pixels');
    await cp(sourceDirectory, copied, { recursive: true });
    const mirrored = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v2.json'), 'utf8'))); mirrored.frames.SE.reference = mirrored.frames.SW.reference; await writeFile(resolve(copied, 'authoring-v2.json'), JSON.stringify(mirrored));
    await expect(prepareDiagonalFaceReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'mirrored') })).rejects.toThrow('Eye correction must retain both native references');
    // Re-pinning cannot assign the removed outer strand back to the far eye.
    await cp(sourceDirectory, copied, { recursive: true });
    const restored = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v4.json'), 'utf8'))), badEye = await load(copied, restored.frames.SE.features.leftEye.source), badMask = await load(copied, restored.frames.SE.features.leftEye.selection.source), strandPixel = (185 * 1024 + 610) * 4;
    badEye.data.set(oldFarEye.data.subarray(strandPixel, strandPixel + 4), strandPixel); badMask.data.fill(255, strandPixel, strandPixel + 4);
    const badBytes = encodePng(badEye), badMaskBytes = encodePng(badMask); await writeFile(resolve(copied, restored.frames.SE.features.leftEye.source), badBytes); await writeFile(resolve(copied, restored.frames.SE.features.leftEye.selection.source), badMaskBytes);
    restored.frames.SE.features.leftEye.sourceSha256 = sha256(badBytes); restored.frames.SE.features.leftEye.selection.sourceSha256 = sha256(badMaskBytes); await writeFile(resolve(copied, 'authoring-v4.json'), JSON.stringify(restored));
    await expect(prepareDiagonalFaceReview({ ...candidateOptions, sourceDirectory: copied, outputDirectory: resolve(temporary, 'restored-strand') })).rejects.toThrow('SE-leftEye: layer/mask must retain only its own native reference pixels');
    await cp(sourceDirectory, copied, { recursive: true });
    const forgedHairConfig = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v4.json'), 'utf8')));
    if (forgedHairConfig.assetVersion !== 4) throw new Error('Far-eye revision 4 required.');
    const forgedHair = await load(copied, forgedHairConfig.hairRepair.source); forgedHair.data.set([255, 255, 255, 255], (300 * 1024 + 500) * 4);
    const forgedHairBytes = encodePng(forgedHair); await writeFile(resolve(copied, forgedHairConfig.hairRepair.source), forgedHairBytes); forgedHairConfig.hairRepair.sourceSha256 = sha256(forgedHairBytes); await writeFile(resolve(copied, 'authoring-v4.json'), JSON.stringify(forgedHairConfig));
    await expect(prepareDiagonalFaceReview({ ...candidateOptions, sourceDirectory: copied, outputDirectory: resolve(temporary, 'forged-hair') })).rejects.toThrow('SE front hair must preserve exact native ownership outside the far-eye strands');
    // The user requires complete eye anatomy under the fringe, independently authored in the same facing.
    const completionOptions = { ...options, configFile: 'authoring-v5.json' as const, outputDirectory: resolve(temporary, 'complete-eye') }, completion = await prepareDiagonalFaceReview(completionOptions);
    const completeConfig = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v5.json'), 'utf8')));
    if (completeConfig.assetVersion !== 5) throw new Error('Complete eye revision 5 required.');
    expect(completion).toMatchObject({ authoredCompletedFeatures: ['SE-leftEye'], published: false, anatomyApproved: false });
    expect(completion.fitMeasurements.find(m => m.direction === 'SW')).toEqual(candidate.fitMeasurements.find(m => m.direction === 'SW'));
    for (const direction of ['SE', 'SW'] as const) for (const name of ['rightEye', 'leftEye', 'rightBrow', 'leftBrow', 'mouth'] as const) if (!(direction === 'SE' && name === 'leftEye')) expect(completeConfig.frames[direction].features[name]).toEqual(candidateConfig.frames[direction].features[name]);
    const completedEye = await load(sourceDirectory, completeConfig.frames.SE.features.leftEye.source), study = await load(sourceDirectory, completeConfig.completeEye.study.source), completedBare = await load(completionOptions.outputDirectory, 'fit/SE-bare.png'), completedFit = await load(completionOptions.outputDirectory, 'fit/SE.png'), retainedFringe = await load(sourceDirectory, completeConfig.completeEye.foreground.source);
    expect(completeConfig.frames.SE.features.leftEye.owner).toBe('study'); expect(completeConfig.frames.SE.features.leftEye.pixelCount).toBeGreaterThan(candidateConfig.frames.SE.features.leftEye.pixelCount);
    // Iris beneath the former fringe cut is present in the eye layer and bare head, then naturally hidden by foreground hair.
    const hidden = (181 * 1024 + 594) * 4;
    expect(farEye.data[hidden + 3]).toBe(0); expect(completedEye.data.slice(hidden, hidden + 4)).toEqual(study.data.slice(hidden, hidden + 4));
    expect(completedEye.data[hidden + 3]).toBeGreaterThan(240); expect(completedBare.data[hidden + 1]).toBeLessThan(60);
    expect(retainedFringe.data[hidden + 3]).toBeGreaterThanOrEqual(240);
    const hiddenResult = blankImage(1, 1), fringePixel = blankImage(1, 1); hiddenResult.data.set(completedBare.data.subarray(hidden, hidden + 4)); fringePixel.data.set(retainedFringe.data.subarray(hidden, hidden + 4)); drawRgba(hiddenResult, fringePixel, 0, 0);
    expect(completedFit.data.slice(hidden, hidden + 4)).toEqual(hiddenResult.data);
    for (const [x, y] of [[598, 180], [609, 173], [615, 171]]) { const i = (y! * 1024 + x!) * 4; expect(completedEye.data.slice(i, i + 4)).toEqual(study.data.slice(i, i + 4)); }
    const completePlanes = new Map<string, RgbaImage[]>();
    for (const [plane, file] of [['head', 'head'], ['neck', 'neck'], ['hair-front', 'front-hair'], ['hair-rear', 'rear-hair']]) completePlanes.set(plane!, [await load(completionOptions.outputDirectory, `layers/SE-${file}.png`)]);
    for (const feature of Object.values(completeConfig.frames.SE.features)) completePlanes.set(feature.plane, [...completePlanes.get(feature.plane) ?? [], await load(sourceDirectory, feature.source)]);
    const completeComposition = blankImage(1024, 1536); for (const plane of DIRECTION_PLANE_ORDER.SE) for (const layer of completePlanes.get(plane) ?? []) drawRgba(completeComposition, layer, 0, 0);
    expect(sha256(encodePng(completeComposition))).toBe(completion.fitMeasurements.find(m => m.direction === 'SE')!.outputSha256);
    expect(await prepareDiagonalFaceReview({ ...completionOptions, outputDirectory: resolve(temporary, 'complete-repeat') })).toEqual(completion);
    for (const output of completion.outputs) expect(sha256(await readFile(resolve(completionOptions.outputDirectory, output.path)))).toBe(output.sha256);
    await cp(sourceDirectory, copied, { recursive: true });
    const forgedComplete = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v5.json'), 'utf8'))), outsideEye = await load(copied, forgedComplete.frames.SE.features.leftEye.source); outsideEye.data.set([255, 255, 255, 255], (220 * 1024 + 550) * 4);
    const outsideBytes = encodePng(outsideEye); await writeFile(resolve(copied, forgedComplete.frames.SE.features.leftEye.source), outsideBytes); forgedComplete.frames.SE.features.leftEye.sourceSha256 = sha256(outsideBytes); await writeFile(resolve(copied, 'authoring-v5.json'), JSON.stringify(forgedComplete));
    await expect(prepareDiagonalFaceReview({ ...completionOptions, sourceDirectory: copied, outputDirectory: resolve(temporary, 'complete-outside') })).rejects.toThrow('SE-leftEye: layer/mask must retain only its own native authored study pixels');
    // A later brow repair removes only the reference skin stripe, retaining the accepted full eye.
    const browOptions = { ...options, configFile: 'authoring-v6.json' as const, outputDirectory: resolve(temporary, 'brow-repair') }, browReport = await prepareDiagonalFaceReview(browOptions);
    const browConfig = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v6.json'), 'utf8')));
    if (browConfig.assetVersion !== 6) throw new Error('Brow revision 6 required.');
    expect(browReport).toMatchObject({ acceptedNativeFeatures: ['SE-leftEye'], browComparisonColumns: ['reference', 'revision-5-before-brow-trim', 'revision-6-brow-candidate'], published: false, anatomyApproved: false });
    expect(browConfig.completeEye).toEqual(completeConfig.completeEye);
    for (const direction of ['SE', 'SW'] as const) for (const name of ['rightEye', 'leftEye', 'rightBrow', 'leftBrow', 'mouth'] as const) if (!(direction === 'SE' && name === 'rightBrow')) expect(browConfig.frames[direction].features[name]).toEqual(completeConfig.frames[direction].features[name]);
    expect(browReport.fitMeasurements.find(m => m.direction === 'SW')).toEqual(completion.fitMeasurements.find(m => m.direction === 'SW'));
    const oldBrow = await load(sourceDirectory, completeConfig.frames.SE.features.rightBrow.source), newBrow = await load(sourceDirectory, browConfig.frames.SE.features.rightBrow.source), browBare = await load(browOptions.outputDirectory, 'fit/SE-bare.png'), browFit = await load(browOptions.outputDirectory, 'fit/SE.png');
    for (const [x, y] of [[550, 149], [557, 152], [564, 155]]) {
      const i = (y! * 1024 + x!) * 4; expect(oldBrow.data[i + 3]).toBe(255); expect(newBrow.data[i + 3]).toBe(0);
      expect(browBare.data.slice(i, i + 4)).toEqual(nativeHead.data.slice(i, i + 4));
      expect(browBare.data.slice(i, i + 4)).not.toEqual(completedBare.data.slice(i, i + 4));
    }
    for (const [x, y] of [[531, 143], [535, 143], [541, 143]]) { const i = (y! * 1024 + x!) * 4; expect(newBrow.data.slice(i, i + 4)).toEqual(oldBrow.data.slice(i, i + 4)); }
    // Compare every native pixel; assembled and bare output may change only where this brow's alpha changed.
    for (const [current, old] of [[browFit, completedFit], [browBare, completedBare]]) {
      const currentOutside = current!.data.slice(), oldOutside = old!.data.slice(); let changed = 0;
      for (let i = 0; i < newBrow.data.length; i += 4) if (newBrow.data.subarray(i, i + 4).some((v, c) => v !== oldBrow.data[i + c])) { changed++; currentOutside.fill(0, i, i + 4); oldOutside.fill(0, i, i + 4); }
      expect(changed).toBeGreaterThan(0); expect(sha256(currentOutside)).toBe(sha256(oldOutside));
    }
    expect(await prepareDiagonalFaceReview({ ...browOptions, outputDirectory: resolve(temporary, 'brow-repeat') })).toEqual(browReport);
    for (const output of browReport.outputs) expect(sha256(await readFile(resolve(browOptions.outputDirectory, output.path)))).toBe(output.sha256);
    await cp(sourceDirectory, copied, { recursive: true });
    const expandedBrow = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v6.json'), 'utf8'))), lineBrow = await load(copied, expandedBrow.frames.SE.features.rightBrow.source), lineMask = await load(copied, expandedBrow.frames.SE.features.rightBrow.selection.source), line = (149 * 1024 + 550) * 4;
    lineBrow.data.set(oldBrow.data.subarray(line, line + 4), line); lineMask.data.fill(255, line, line + 4);
    const lineBytes = encodePng(lineBrow), lineMaskBytes = encodePng(lineMask); await writeFile(resolve(copied, expandedBrow.frames.SE.features.rightBrow.source), lineBytes); await writeFile(resolve(copied, expandedBrow.frames.SE.features.rightBrow.selection.source), lineMaskBytes);
    expandedBrow.frames.SE.features.rightBrow.sourceSha256 = sha256(lineBytes); expandedBrow.frames.SE.features.rightBrow.selection.sourceSha256 = sha256(lineMaskBytes); await writeFile(resolve(copied, 'authoring-v6.json'), JSON.stringify(expandedBrow));
    await expect(prepareDiagonalFaceReview({ ...browOptions, sourceDirectory: copied, outputDirectory: resolve(temporary, 'expanded-brow-line') })).rejects.toThrow('SE-rightBrow: layer/mask must retain only its own native reference pixels');
    await cp(sourceDirectory, copied, { recursive: true });
    const changedAcceptedEye = diagonalFaceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring-v6.json'), 'utf8'))); changedAcceptedEye.frames.SE.features.leftEye.sourceSha256 = 'f'.repeat(64); await writeFile(resolve(copied, 'authoring-v6.json'), JSON.stringify(changedAcceptedEye));
    await expect(prepareDiagonalFaceReview({ ...browOptions, sourceDirectory: copied, outputDirectory: resolve(temporary, 'changed-accepted-eye') })).rejects.toThrow('Native correction must preserve all nine other features, including the accepted eye');
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.hash); expect((await stat(file.path)).mtimeMs).toBe(file.mtime); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 360_000);

it('reviews independent E/W facial layers with hidden far-side features, approved profile geometry and immutable native ownership', async () => {
  const { prepareProfileFaceReview, profileFaceReviewSchema } = await import('./face-profile-review');
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-profile-face-review-'));
  try {
    const sourceDirectory = resolve(repository, 'assets/source/heroine-v1/face/reference-v1/profiles-v1'), headDirectory = resolve(repository, 'assets/source/heroine-v1/head/soft-oval-v1'), hairDirectory = resolve(repository, 'assets/source/heroine-v1/hair/long-waves-v1'), referenceDirectory = resolve(temporary, 'references');
    await mkdir(referenceDirectory);
    const settings = referenceImportSettingsSchema.parse(JSON.parse(await readFile(resolve(repository, 'assets/references/heroine-v1/import-v1.json'), 'utf8')));
    for (const direction of ['E', 'W'] as const) {
      const raw = decode(await readFile(resolve(repository, `assets/references/heroine-v1/detailed/${direction}.png`)), { checkCrc: true }), image = blankImage(1024, 1536);
      for (let p = 0; p < 1024 * 1536; p++) { image.data.set(raw.data.subarray(p * raw.channels, p * raw.channels + 3), p * 4); image.data[p * 4 + 3] = raw.channels === 4 ? raw.data[p * 4 + 3]! : 255; }
      await writeFile(resolve(referenceDirectory, `${direction}.png`), encodePng(matteReference(image, settings.frames[direction].labelExclusions, settings.matte, settings.frames[direction].backgroundCorrections).image));
    }
    const files: string[] = [];
    for (const root of [headDirectory, hairDirectory, resolve(repository, 'assets/source/heroine-v1/face/reference-v1')]) for (const path of await readdir(root, { recursive: true })) if ((await stat(resolve(root, path))).isFile()) files.push(resolve(root, path));
    const before = await Promise.all(files.map(async path => ({ path, hash: sha256(await readFile(path)), mtime: (await stat(path)).mtimeMs })));
    const options = { sourceDirectory, headDirectory, hairDirectory, referenceDirectory, outputDirectory: resolve(temporary, 'review') }, report = await prepareProfileFaceReview(options);
    expect(report).toMatchObject({ supportedReviewDirections: ['E', 'W'], published: false, anatomyApproved: false, bodyOcclusionVerified: false, nativePosition: { x: 0, y: 0 }, hiddenFeatures: { E: ['leftEye', 'leftBrow'], W: ['rightEye', 'rightBrow'] } });
    expect(report.measurements).toHaveLength(6);
    const config = profileFaceReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring.json'), 'utf8'))), head = JSON.parse(await readFile(resolve(headDirectory, 'profiles-authoring-v3.json'), 'utf8'));
    const load = async (root: string, file: string) => { const image = decodePng(await readFile(resolve(root, file))); for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4); return image; };
    for (const direction of ['E', 'W'] as const) {
      const parts = new Map<string, RgbaImage[]>([['head', [await load(options.outputDirectory, `layers/${direction}-head.png`)]], ['neck', [await load(options.outputDirectory, `layers/${direction}-neck.png`)]], ['hair-front', [await load(options.outputDirectory, `layers/${direction}-front-hair.png`)]], ['hair-rear', [await load(options.outputDirectory, `layers/${direction}-rear-hair.png`)]]]);
      for (const part of ['head', 'neck'] as const) expect(sha256(encodePng(parts.get(part)![0]!))).toBe(sha256(encodePng(await load(headDirectory, head.frames[direction][part].source))));
      for (const [plane, name] of [['hair-front', 'front'], ['hair-rear', 'rear']] as const) expect(sha256(encodePng(parts.get(plane)![0]!))).toBe(sha256(encodePng(await load(headDirectory, head.profileFit.frames[direction][name].source))));
      const baseline = blankImage(1024, 1536); for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const part of parts.get(plane) ?? []) drawRgba(baseline, part, 0, 0);
      expect(sha256(encodePng(baseline))).toBe(direction === 'E' ? 'e6d55f666456d8fbde0b34b84af954c1b08dd0f12a134172eb2c666c25e166ed' : 'a1bc94736e2b4237c37603eb97910b10ecf4fcc992e0bd04d7997ca48b88fdbe');
      const masks: RgbaImage[] = [];
      for (const feature of Object.values(config.frames[direction].features)) { expect(feature.side).toBe(feature.plane === 'mouth' ? 'center' : direction === 'E' ? 'right' : 'left'); const part = await load(sourceDirectory, feature.source); parts.set(feature.plane, [...parts.get(feature.plane) ?? [], part]); masks.push(await load(sourceDirectory, feature.selection.source)); }
      const expected = blankImage(1024, 1536); for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const part of parts.get(plane) ?? []) drawRgba(expected, part, 0, 0);
      expect(sha256(encodePng(expected))).toBe(report.fitMeasurements.find(m => m.direction === direction)!.outputSha256);
      const reference = await load(referenceDirectory, `${direction}.png`), eye = await load(sourceDirectory, config.frames[direction].features.eye.source), [x, y] = direction === 'E' ? [594, 180] : [414, 186], eyePixel = (y! * 1024 + x!) * 4;
      expect(eye.data.slice(eyePixel, eyePixel + 4)).toEqual(reference.data.slice(eyePixel, eyePixel + 4));
      expect(expected.data.slice(eyePixel, eyePixel + 4)).toEqual(reference.data.slice(eyePixel, eyePixel + 4));
      if (direction === 'W') {
        const brow = await load(sourceDirectory, config.frames.W.features.brow.source), lidPixel = (173 * 1024 + 411) * 4, fringeFragment = (154 * 1024 + 425) * 4;
        expect(eye.data.slice(lidPixel, lidPixel + 4)).toEqual(reference.data.slice(lidPixel, lidPixel + 4));
        expect(expected.data.slice(lidPixel, lidPixel + 4)).toEqual(reference.data.slice(lidPixel, lidPixel + 4));
        expect(brow.data[fringeFragment + 3]).toBe(0);
      }
      const outsideCurrent = expected.data.slice(), outsideBaseline = baseline.data.slice();
      for (let p = 0; p < 1024 * 1536; p++) if (masks.some(mask => mask.data[p * 4 + 3]! > 0)) { outsideCurrent.fill(0, p * 4, p * 4 + 4); outsideBaseline.fill(0, p * 4, p * 4 + 4); }
      expect(sha256(outsideCurrent)).toBe(sha256(outsideBaseline));
      // Preserve every native nose/chin landmark and visible ear coordinate in the actual fit.
      for (const landmark of head.profileFit.frames[direction].facialLandmarks.filter((l: { name: string }) => l.name !== 'near-eye')) { const i = (landmark.position.y * 1024 + landmark.position.x) * 4; expect(expected.data.slice(i, i + 4)).toEqual(baseline.data.slice(i, i + 4)); }
      const earMask = await load(headDirectory, head.earRepair.frames[direction].referenceSelection.source);
      for (let p = 0; p < 1024 * 1536; p++) if (earMask.data[p * 4 + 3] === 255) expect(expected.data.slice(p * 4, p * 4 + 4)).toEqual(reference.data.slice(p * 4, p * 4 + 4));
      // Both parts own the same reference RGB at some overlaps, so reverse order
      // can produce the same pixels. Verify the exported fit with core order above.
      const front = parts.get('hair-front')![0]!;
      for (let p = 0; p < 1024 * 1536; p++) if (front.data[p * 4 + 3] === 255 && masks.some(mask => mask.data[p * 4 + 3]! > 0)) expect(expected.data.slice(p * 4, p * 4 + 4)).toEqual(front.data.slice(p * 4, p * 4 + 4));
    }
    expect(report.measurements.some(m => m.foregroundHairOverlapPixels > 0)).toBe(true);
    expect(await prepareProfileFaceReview({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    const copied = resolve(temporary, 'forged'); await cp(sourceDirectory, copied, { recursive: true });
    const changed = await load(copied, config.frames.E.features.eye.source); changed.data.set([255, 255, 255, 255], (186 * 1024 + 414) * 4);
    const changedBytes = encodePng(changed); await writeFile(resolve(copied, config.frames.E.features.eye.source), changedBytes); config.frames.E.features.eye.sourceSha256 = sha256(changedBytes); await writeFile(resolve(copied, 'authoring.json'), JSON.stringify(config));
    await expect(prepareProfileFaceReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'outside-mask') })).rejects.toThrow('E-rightEye: layer/mask must retain only its own native reference pixels');
    await cp(sourceDirectory, copied, { recursive: true });
    const mirrored = profileFaceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring.json'), 'utf8'))); mirrored.frames.E.reference = mirrored.frames.W.reference; await writeFile(resolve(copied, 'authoring.json'), JSON.stringify(mirrored));
    await expect(prepareProfileFaceReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'mirrored') })).rejects.toThrow('Facing reference ownership cannot be substituted or mirrored');
    await cp(sourceDirectory, copied, { recursive: true });
    const wrongSide = profileFaceReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring.json'), 'utf8'))); wrongSide.frames.E.features.eye.side = 'left'; await writeFile(resolve(copied, 'authoring.json'), JSON.stringify(wrongSide));
    await expect(prepareProfileFaceReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'wrong-side') })).rejects.toThrow('Native profile facing, physical side, feature plane or anchor changed');
    for (const source of before) { expect(sha256(await readFile(source.path))).toBe(source.hash); expect((await stat(source.path)).mtimeMs).toBe(source.mtime); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 300_000);
