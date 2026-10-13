import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decode } from 'fast-png';
import { expect, it } from 'vitest';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { prepareEarReview, earReviewSchema } from './ear-review';
import { matteReference } from './matte';
import { referenceImportSettingsSchema } from './schema';
import { sha256 } from './reference-import';

const repository = fileURLToPath(new URL('../../../', import.meta.url));

it('reviews separate S human ears and smaller revision with concealed skin, bounded native ownership and immutable sources', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-ear-review-'));
  try {
    const sourceDirectory = resolve(repository, 'assets/source/heroine-v1/ears/human-v1'), headDirectory = resolve(repository, 'assets/source/heroine-v1/head/soft-oval-v1');
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

it('reviews independent E/W ears with authored root skin, exact approved facial fit, retained alpha and immutable native ownership', async () => {
  const { prepareProfileEarReview, profileEarReviewSchema, profileEarRegions } = await import('./ear-profile-review');
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-profile-ear-review-'));
  try {
    const sourceDirectory = resolve(repository, 'assets/source/heroine-v1/ears/human-v1/profiles-v1'), headDirectory = resolve(repository, 'assets/source/heroine-v1/head/soft-oval-v1'), faceDirectory = resolve(repository, 'assets/source/heroine-v1/face/reference-v1/profiles-v1'), hairDirectory = resolve(repository, 'assets/source/heroine-v1/hair/long-waves-v1'), referenceDirectory = resolve(temporary, 'references');
    await mkdir(referenceDirectory);
    const settings = referenceImportSettingsSchema.parse(JSON.parse(await readFile(resolve(repository, 'assets/references/heroine-v1/import-v1.json'), 'utf8')));
    for (const direction of ['E', 'W'] as const) {
      const raw = decode(await readFile(resolve(repository, `assets/references/heroine-v1/detailed/${direction}.png`)), { checkCrc: true }), image = blankImage(1024, 1536);
      for (let p = 0; p < 1024 * 1536; p++) { image.data.set(raw.data.subarray(p * raw.channels, p * raw.channels + 3), p * 4); image.data[p * 4 + 3] = raw.channels === 4 ? raw.data[p * 4 + 3]! : 255; }
      await writeFile(resolve(referenceDirectory, `${direction}.png`), encodePng(matteReference(image, settings.frames[direction].labelExclusions, settings.matte, settings.frames[direction].backgroundCorrections).image));
    }
    const files: string[] = [];
    for (const root of [headDirectory, hairDirectory, resolve(repository, 'assets/source/heroine-v1/ears/human-v1'), resolve(repository, 'assets/source/heroine-v1/face/reference-v1')]) for (const path of await readdir(root, { recursive: true })) if ((await stat(resolve(root, path))).isFile()) files.push(resolve(root, path));
    const before = await Promise.all(files.map(async path => ({ path, hash: sha256(await readFile(path)), mtime: (await stat(path)).mtimeMs })));
    const options = { sourceDirectory, headDirectory, faceDirectory, hairDirectory, referenceDirectory, outputDirectory: resolve(temporary, 'review') }, report = await prepareProfileEarReview(options);
    expect(report).toMatchObject({ supportedReviewDirections: ['E', 'W'], published: false, anatomyApproved: false, bodyOcclusionVerified: false, humanAssemblyMatchesApprovedHead: true, humanFitMatchesApprovedFacialFit: true, originalAlphaPreservedOutsideRootMasks: true, nativePosition: { x: 0, y: 0 } });
    const config = profileEarReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring.json'), 'utf8'))), face = JSON.parse(await readFile(resolve(faceDirectory, 'authoring.json'), 'utf8')), faceApproval = JSON.parse(await readFile(resolve(faceDirectory, 'review-fit-v1.json'), 'utf8'));
    const load = async (root: string, file: string) => { const image = decodePng(await readFile(resolve(root, file))); for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4); return image; };
    for (const direction of ['E', 'W'] as const) {
      const f = config.frames[direction], original = await load(headDirectory, f.originalHead.source), underlay = await load(sourceDirectory, f.head.source), retention = await load(sourceDirectory, f.headRetention.source), ear = await load(sourceDirectory, f.ear.source), study = await load(sourceDirectory, f.study.source), masked = { ...underlay, data: underlay.data.slice() }, [[x0, y0], , [x1, y1]] = profileEarRegions[direction];
      let changed = 0, replacedPartialEarMarks = 0; const originalAlpha = new Uint8Array(1024 * 1536), underlayAlpha = new Uint8Array(1024 * 1536), rootMask = await load(sourceDirectory, f.rootSelection.source);
      for (let p = 0; p < 1024 * 1536; p++) {
        const i = p * 4, selected = p % 1024 >= x0 && p % 1024 < x1 && Math.floor(p / 1024) >= y0 && Math.floor(p / 1024) < y1;
        originalAlpha[p] = rootMask.data[i + 3] ? 0 : original.data[i + 3]!; underlayAlpha[p] = rootMask.data[i + 3] ? 0 : underlay.data[i + 3]!;
        if (!retention.data[i + 3]) masked.data.fill(0, i, i + 4);
        if (underlay.data.subarray(i, i + 4).some((v, c) => v !== original.data[i + c])) { expect(selected).toBe(true); expect(rootMask.data[i + 3]).toBe(255); expect(underlay.data.slice(i, i + 4)).toEqual(study.data.slice(i, i + 4)); changed++; }
        if (rootMask.data[i + 3] && original.data[i + 3]! > 0 && original.data[i + 3]! < 255 && underlay.data.subarray(i, i + 4).some((v, c) => v !== original.data[i + c])) replacedPartialEarMarks++;
      }
      expect(sha256(underlayAlpha)).toBe(sha256(originalAlpha));
      expect(changed).toBeGreaterThan(0);
      expect(replacedPartialEarMarks).toBeGreaterThan(0);
      const reconstructed = blankImage(1024, 1536); drawRgba(reconstructed, masked, 0, 0); drawRgba(reconstructed, ear, 0, 0);
      expect(sha256(reconstructed.data)).toBe(sha256(original.data));
      expect(sha256((await load(options.outputDirectory, `assembled/${direction}-head-human.png`)).data)).toBe(sha256(original.data));
      const [rootX, rootY] = direction === 'E' ? [522, 186] : [489, 193], rootPixel = (rootY! * 1024 + rootX!) * 4;
      expect(underlay.data.slice(rootPixel, rootPixel + 3)).toEqual(study.data.slice(rootPixel, rootPixel + 3));
      expect(underlay.data.slice(rootPixel, rootPixel + 3)).not.toEqual(original.data.slice(rootPixel, rootPixel + 3));
      const layers = new Map<RenderPlane, RgbaImage[]>([['head', [masked]], ['ears', [ear]], ['neck', [await load(options.outputDirectory, `layers/${direction}-neck.png`)]], ['hair-front', [await load(options.outputDirectory, `layers/${direction}-front-hair.png`)]], ['hair-rear', [await load(options.outputDirectory, `layers/${direction}-rear-hair.png`)]]]);
      for (const feature of Object.values(face.frames[direction].features) as { source: string; plane: RenderPlane }[]) { const image = await load(faceDirectory, feature.source); layers.set(feature.plane, [...layers.get(feature.plane) ?? [], image]); }
      const human = blankImage(1024, 1536); for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const image of layers.get(plane) ?? []) drawRgba(human, image, 0, 0);
      const measurement = report.fitMeasurements.find(m => m.direction === direction)!;
      expect(sha256(encodePng(human))).toBe(measurement.humanFitSha256);
      expect(measurement.humanFitSha256).toBe(faceApproval.fitMeasurements.find((m: { direction: string }) => m.direction === direction).outputSha256);
      expect(measurement.earlessFitSha256).not.toBe(measurement.humanFitSha256);
    }
    expect(await prepareProfileEarReview({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    const copied = resolve(temporary, 'forged'); await cp(sourceDirectory, copied, { recursive: true });
    const altered = await load(copied, config.frames.E.head.source); altered.data.set([255, 255, 255, 255], (400 * 1024 + 511) * 4);
    const alteredBytes = encodePng(altered); await writeFile(resolve(copied, config.frames.E.head.source), alteredBytes); config.frames.E.head.sourceSha256 = sha256(alteredBytes); await writeFile(resolve(copied, 'authoring.json'), JSON.stringify(config));
    await expect(prepareProfileEarReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'outside-window') })).rejects.toThrow('root underlay must preserve bounded native RGBA ownership');
    await cp(sourceDirectory, copied, { recursive: true });
    const earConfig = profileEarReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring.json'), 'utf8'))), changedEar = await load(copied, earConfig.frames.W.ear.source), earPixel = (193 * 1024 + 489) * 4; changedEar.data[earPixel] = changedEar.data[earPixel]! ^ 1;
    const earBytes = encodePng(changedEar); await writeFile(resolve(copied, earConfig.frames.W.ear.source), earBytes); earConfig.frames.W.ear.sourceSha256 = sha256(earBytes); await writeFile(resolve(copied, 'authoring.json'), JSON.stringify(earConfig));
    await expect(prepareProfileEarReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'changed-ear') })).rejects.toThrow('ear must retain exact original native RGBA');
    await cp(sourceDirectory, copied, { recursive: true });
    const sideConfig = profileEarReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring.json'), 'utf8'))); sideConfig.frames.E.side = 'left'; await writeFile(resolve(copied, 'authoring.json'), JSON.stringify(sideConfig));
    await expect(prepareProfileEarReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'wrong-side') })).rejects.toThrow('Native profile ear side, geometry, source or anchor changed');
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.hash); expect((await stat(file.path)).mtimeMs).toBe(file.mtime); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 300_000);

it('reviews independent SE/SW ears with authored ear-free contour, exact approved facial fit, hidden far ears and immutable native ownership', async () => {
  const { prepareDiagonalEarReview, diagonalEarReviewSchema, diagonalEarRegions } = await import('./ear-diagonal-review');
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-diagonal-ear-review-'));
  try {
    const sourceDirectory = resolve(repository, 'assets/source/heroine-v1/ears/human-v1/front-diagonals-v1'), headDirectory = resolve(repository, 'assets/source/heroine-v1/head/soft-oval-v1'), faceDirectory = resolve(repository, 'assets/source/heroine-v1/face/reference-v1/front-diagonals-v1'), hairDirectory = resolve(repository, 'assets/source/heroine-v1/hair/long-waves-v1'), referenceDirectory = resolve(temporary, 'references');
    await mkdir(referenceDirectory);
    const settings = referenceImportSettingsSchema.parse(JSON.parse(await readFile(resolve(repository, 'assets/references/heroine-v1/import-v1.json'), 'utf8')));
    for (const direction of ['SE', 'SW'] as const) {
      const raw = decode(await readFile(resolve(repository, `assets/references/heroine-v1/detailed/${direction}.png`)), { checkCrc: true }), image = blankImage(1024, 1536);
      for (let p = 0; p < 1024 * 1536; p++) { image.data.set(raw.data.subarray(p * raw.channels, p * raw.channels + 3), p * 4); image.data[p * 4 + 3] = raw.channels === 4 ? raw.data[p * 4 + 3]! : 255; }
      await writeFile(resolve(referenceDirectory, `${direction}.png`), encodePng(matteReference(image, settings.frames[direction].labelExclusions, settings.matte, settings.frames[direction].backgroundCorrections).image));
    }
    const files: string[] = [];
    for (const root of [headDirectory, hairDirectory, resolve(repository, 'assets/source/heroine-v1/ears/human-v1'), resolve(repository, 'assets/source/heroine-v1/face/reference-v1')]) for (const path of await readdir(root, { recursive: true })) if ((await stat(resolve(root, path))).isFile()) files.push(resolve(root, path));
    const before = await Promise.all(files.map(async path => ({ path, hash: sha256(await readFile(path)), mtime: (await stat(path)).mtimeMs })));
    const options = { sourceDirectory, headDirectory, faceDirectory, hairDirectory, referenceDirectory, outputDirectory: resolve(temporary, 'review') }, report = await prepareDiagonalEarReview(options);
    expect(report).toMatchObject({ supportedReviewDirections: ['SE', 'SW'], published: false, anatomyApproved: false, bodyOcclusionVerified: false, humanAssemblyMatchesApprovedHead: true, humanFitMatchesApprovedFacialFit: true, originalRgbaPreservedOutsideEarWindows: true, hiddenEars: { SE: 'left', SW: 'right' }, nativePosition: { x: 0, y: 0 } });
    const config = diagonalEarReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring.json'), 'utf8'))), face = JSON.parse(await readFile(resolve(faceDirectory, 'authoring-v2.json'), 'utf8')), faceApproval = JSON.parse(await readFile(resolve(faceDirectory, 'review-fit-v2.json'), 'utf8'));
    const load = async (root: string, file: string) => { const image = decodePng(await readFile(resolve(root, file))); for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4); return image; };
    for (const direction of ['SE', 'SW'] as const) {
      const f = config.frames[direction], original = await load(headDirectory, f.originalHead.source), underlay = await load(sourceDirectory, f.head.source), retention = await load(sourceDirectory, f.headRetention.source), ear = await load(sourceDirectory, f.ear.source), study = await load(sourceDirectory, f.study.source), masked = { ...underlay, data: underlay.data.slice() }, [[x0, y0], , [x1, y1]] = diagonalEarRegions[direction];
      let changed = 0; const outsideOriginal = original.data.slice(), outsideUnderlay = underlay.data.slice();
      for (let p = 0; p < 1024 * 1536; p++) {
        const i = p * 4, selected = p % 1024 >= x0 && p % 1024 < x1 && Math.floor(p / 1024) >= y0 && Math.floor(p / 1024) < y1;
        if (selected) { outsideOriginal.fill(0, i, i + 4); outsideUnderlay.fill(0, i, i + 4); }
        if (!retention.data[i + 3]) masked.data.fill(0, i, i + 4);
        if (underlay.data.subarray(i, i + 4).some((v, c) => v !== original.data[i + c])) { expect(selected).toBe(true); changed++; }
      }
      expect(sha256(outsideUnderlay)).toBe(sha256(outsideOriginal));
      expect(changed).toBeGreaterThan(0);
      const reconstructed = blankImage(1024, 1536); drawRgba(reconstructed, masked, 0, 0); drawRgba(reconstructed, ear, 0, 0);
      expect(sha256(reconstructed.data)).toBe(sha256(original.data));
      expect(sha256((await load(options.outputDirectory, `assembled/${direction}-head-human.png`)).data)).toBe(sha256(original.data));
      const [rootX, rootY] = direction === 'SE' ? [498, 170] : [522, 176], rootPixel = (rootY! * 1024 + rootX!) * 4;
      expect(underlay.data.slice(rootPixel, rootPixel + 3)).toEqual(study.data.slice(rootPixel, rootPixel + 3));
      expect(underlay.data.slice(rootPixel, rootPixel + 3)).not.toEqual(original.data.slice(rootPixel, rootPixel + 3));
      const layers = new Map<RenderPlane, RgbaImage[]>([['head', [masked]], ['ears', [ear]], ['neck', [await load(options.outputDirectory, `layers/${direction}-neck.png`)]], ['hair-front', [await load(options.outputDirectory, `layers/${direction}-front-hair.png`)]], ['hair-rear', [await load(options.outputDirectory, `layers/${direction}-rear-hair.png`)]]]);
      for (const feature of Object.values(face.frames[direction].features) as { source: string; plane: RenderPlane }[]) { const image = await load(faceDirectory, feature.source); layers.set(feature.plane, [...layers.get(feature.plane) ?? [], image]); }
      const human = blankImage(1024, 1536); for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const image of layers.get(plane) ?? []) drawRgba(human, image, 0, 0);
      const measurement = report.fitMeasurements.find(m => m.direction === direction)!;
      expect(sha256(encodePng(human))).toBe(measurement.humanFitSha256);
      expect(measurement.humanFitSha256).toBe(faceApproval.fitMeasurements.find((m: { direction: string }) => m.direction === direction).outputSha256);
      expect(measurement.earlessFitSha256).not.toBe(measurement.humanFitSha256);
      const [removedX, removedY] = direction === 'SE' ? [477, 160] : [541, 170], removedPixel = (removedY! * 1024 + removedX!) * 4;
      expect(original.data[removedPixel + 3]!).toBeGreaterThanOrEqual(8); expect(underlay.data[removedPixel + 3]).toBe(0);
      const [noseX, noseY] = direction === 'SE' ? [592, 202] : [421, 223], nosePixel = (noseY! * 1024 + noseX!) * 4;
      expect(underlay.data.slice(nosePixel, nosePixel + 4)).toEqual(original.data.slice(nosePixel, nosePixel + 4));
    }
    expect(report.futureBodyFitObligations.length).toBeGreaterThan(0);
    expect(await prepareDiagonalEarReview({ ...options, outputDirectory: resolve(temporary, 'repeat') })).toEqual(report);
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    const copied = resolve(temporary, 'forged'); await cp(sourceDirectory, copied, { recursive: true });
    const altered = await load(copied, config.frames.SE.head.source); altered.data.set([255, 255, 255, 255], (400 * 1024 + 511) * 4);
    const alteredBytes = encodePng(altered); await writeFile(resolve(copied, config.frames.SE.head.source), alteredBytes); config.frames.SE.head.sourceSha256 = sha256(alteredBytes); await writeFile(resolve(copied, 'authoring.json'), JSON.stringify(config));
    await expect(prepareDiagonalEarReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'outside-window') })).rejects.toThrow('root underlay must preserve bounded native RGBA ownership');
    await cp(sourceDirectory, copied, { recursive: true });
    const earConfig = diagonalEarReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring.json'), 'utf8'))), changedEar = await load(copied, earConfig.frames.SW.ear.source), earPixel = (176 * 1024 + 522) * 4; changedEar.data[earPixel] = changedEar.data[earPixel]! ^ 1;
    const earBytes = encodePng(changedEar); await writeFile(resolve(copied, earConfig.frames.SW.ear.source), earBytes); earConfig.frames.SW.ear.sourceSha256 = sha256(earBytes); await writeFile(resolve(copied, 'authoring.json'), JSON.stringify(earConfig));
    await expect(prepareDiagonalEarReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'changed-ear') })).rejects.toThrow('ear must retain exact original native RGBA');
    await cp(sourceDirectory, copied, { recursive: true });
    const sideConfig = diagonalEarReviewSchema.parse(JSON.parse(await readFile(resolve(copied, 'authoring.json'), 'utf8'))); sideConfig.frames.SE.side = 'left'; await writeFile(resolve(copied, 'authoring.json'), JSON.stringify(sideConfig));
    await expect(prepareDiagonalEarReview({ ...options, sourceDirectory: copied, outputDirectory: resolve(temporary, 'wrong-side') })).rejects.toThrow('Native diagonal ear side, geometry, source or anchor changed');
    for (const file of before) { expect(sha256(await readFile(file.path))).toBe(file.hash); expect((await stat(file.path)).mtimeMs).toBe(file.mtime); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 300_000);
