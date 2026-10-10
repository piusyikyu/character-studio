import { cp, mkdir, mkdtemp, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decode } from 'fast-png';
import { expect, it } from 'vitest';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import { prepareHeadReview } from './head-review';
import { headProfilesReviewSchema, headReviewSchema } from './head-review-schema';
import { matteReference } from './matte';
import { referenceImportSettingsSchema } from './schema';
import { sha256 } from './reference-import';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const sourceDirectory = resolve(repository, 'assets/source/heroine-v1/head-soft-oval-v1');
const hairDirectory = resolve(repository, 'assets/source/heroine-v1/hair-long-waves-v1');

it('reviews authored S/N anatomy with exact partitions, approved hair, native depth, repeatable exports and immutable sources', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-head-review-'));
  try {
    // Recreate reference copies from tracked inputs, independently of ignored staging.
    const referenceDirectory = resolve(temporary, 'references'); await mkdir(referenceDirectory);
    const settings = referenceImportSettingsSchema.parse(JSON.parse(await readFile(resolve(repository, 'assets/references/heroine-v1/import-v1.json'), 'utf8')));
    for (const direction of ['S', 'N'] as const) {
      const raw = decode(await readFile(resolve(repository, `assets/references/heroine-v1/detailed/${direction}.png`)), { checkCrc: true }), image = blankImage(1024, 1536);
      for (let p = 0; p < 1024 * 1536; p++) { image.data.set(raw.data.subarray(p * raw.channels, p * raw.channels + 3), p * 4); image.data[p * 4 + 3] = raw.channels === 4 ? raw.data[p * 4 + 3]! : 255; }
      const frame = settings.frames[direction];
      await writeFile(resolve(referenceDirectory, `${direction}.png`), encodePng(matteReference(image, frame.labelExclusions, settings.matte, frame.backgroundCorrections).image));
    }
    const files = [];
    for (const directory of [sourceDirectory, hairDirectory]) for (const path of await readdir(directory, { recursive: true })) if ((await stat(resolve(directory, path))).isFile()) files.push(resolve(directory, path));
    const before = await Promise.all(files.map(async (path) => ({ path, hash: sha256(await readFile(path)), mtime: (await stat(path)).mtimeMs })));
    const options = { sourceDirectory, hairDirectory, referenceDirectory, outputDirectory: resolve(temporary, 'review') };
    const report = await prepareHeadReview(options);
    expect(report).toMatchObject({ published: false, paletteReady: false, anatomyApproved: false, rigCompatibility: 'unverified', supportedReviewDirections: ['S', 'N'], missingDirections: ['NE', 'E', 'SE', 'SW', 'W', 'NW'], hiddenFacialLayers: ['eyes', 'eyebrows', 'mouth'], masterReconstruction: 'exact-normalized-head-neck-partition' });
    expect(report.measurements).toHaveLength(4);
    expect(report.hairMeasurements).toHaveLength(3);
    for (const item of report.measurements) expect(item).toMatchObject({ greenCandidates: 0, position: { x: 0, y: 0 } });
    for (const direction of ['S', 'N'] as const) {
      const head = decodePng(await readFile(resolve(options.outputDirectory, `layers/${direction}-head.png`))), neck = decodePng(await readFile(resolve(options.outputDirectory, `layers/${direction}-neck.png`)));
      expect([head.width, head.height, neck.width, neck.height]).toEqual([1024, 1536, 1024, 1536]);
      for (const image of [head, neck]) for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8 && image.data.subarray(i, i + 4).some((v) => v !== 0)) throw new Error('Normalized transparent anatomy must have zero RGBA.');
      const reconstructed = blankImage(1024, 1536); drawRgba(reconstructed, neck, 0, 0); drawRgba(reconstructed, head, 0, 0);
      expect(sha256(encodePng(reconstructed))).toBe(report.masters.find((m) => m.direction === direction)!.cleanedSha256);
      const layers = new Map([['head', head], ['neck', neck]]);
      for (const hair of report.hairMeasurements.filter((m) => m.direction === direction)) {
        const image = decodePng(await readFile(resolve(hairDirectory, `${direction}-${hair.part}.png`)));
        for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4);
        expect(sha256(encodePng(image))).toBe(hair.cleanedSha256); layers.set(`hair-${hair.part}`, image);
      }
      const composed = blankImage(1024, 1536);
      for (const plane of DIRECTION_PLANE_ORDER[direction]) { const image = layers.get(plane); if (image) drawRgba(composed, image, 0, 0); }
      expect(sha256(encodePng(composed))).toBe(report.fitMeasurements.find((m) => m.direction === direction)!.outputSha256);
      const wrongOrder = blankImage(1024, 1536);
      // A real overlap boundary: S front hair and N rear hair must cover the head.
      for (const image of [...layers.values()].reverse()) drawRgba(wrongOrder, image, 0, 0);
      expect(sha256(wrongOrder.data)).not.toBe(sha256(composed.data));
      expect(report.fitMeasurements.find((m) => m.direction === direction)!.headPixelsOverlappedByHair).toBeGreaterThan(1000);
      const green = decodePng(await readFile(resolve(options.outputDirectory, `inspection/green/${direction}-fit.png`)));
      expect([...green.data.slice(0, 4)]).toEqual([0, 255, 0, 255]);
      expect([...green.data.slice((8 * 1024 + 8) * 4, (8 * 1024 + 8) * 4 + 4)]).toEqual([255, 255, 0, 255]);
    }
    const s = decodePng(await readFile(resolve(options.outputDirectory, 'master/S.png'))), n = decodePng(await readFile(resolve(options.outputDirectory, 'master/N.png'))), mirrored = blankImage(1024, 1536);
    for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) mirrored.data.set(n.data.subarray((y * 1024 + x) * 4, (y * 1024 + x) * 4 + 4), (y * 1024 + 1023 - x) * 4);
    expect(sha256(s.data)).not.toBe(sha256(n.data)); expect(sha256(s.data)).not.toBe(sha256(mirrored.data));
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    // The fit revision changes the S hair pair, preserving all anatomy and N.
    const revisedOptions = { ...options, configSource: 'authoring-v2.json' as const, outputDirectory: resolve(temporary, 'fit-v2') };
    const revised = await prepareHeadReview(revisedOptions);
    expect(revised.masters).toEqual(report.masters);
    expect(revised.measurements).toEqual(report.measurements);
    expect(revised.hairMeasurements).toEqual(report.hairMeasurements);
    expect(revised.fitMeasurements.find((m) => m.direction === 'N')).toEqual(report.fitMeasurements.find((m) => m.direction === 'N'));
    expect(revised.fringeFitMeasurement!.facialLandmarks).toHaveLength(4);
    expect(revised.fringeFitMeasurement!.facialLandmarks.every((p) => p.hairAlpha === 0)).toBe(true);
    const originalFront = decodePng(await readFile(resolve(hairDirectory, 'S-front.png')));
    expect(originalFront.data[(224 * 1024 + 511) * 4 + 3]).toBeGreaterThan(8); // Actual reported nose occlusion.
    const correctedFront = decodePng(await readFile(resolve(revisedOptions.outputDirectory, 'layers/S-front-fit.png')));
    const correctedFit = decodePng(await readFile(resolve(revisedOptions.outputDirectory, 'fit/S.png')));
    const nativeHead = decodePng(await readFile(resolve(revisedOptions.outputDirectory, 'layers/S-head.png')));
    const rear = decodePng(await readFile(resolve(revisedOptions.outputDirectory, 'layers/S-rear-fit.png')));
    for (let i = 0; i < rear.data.length; i += 4) if (rear.data[i + 3]! < 8) rear.data.fill(0, i, i + 4);
    const assembledFit = blankImage(1024, 1536);
    for (const image of [rear, decodePng(await readFile(resolve(revisedOptions.outputDirectory, 'layers/S-neck.png'))), nativeHead]) drawRgba(assembledFit, image, 0, 0);
    // Authored skin has alpha 253 internally; compare against its real rear-backed composition.
    for (const { position: { x, y } } of revised.fringeFitMeasurement!.facialLandmarks) {
      const i = (y * 1024 + x) * 4;
      expect([...correctedFit.data.slice(i, i + 4)]).toEqual([...assembledFit.data.slice(i, i + 4)]);
    }
    drawRgba(assembledFit, correctedFront, 0, 0);
    expect(sha256(assembledFit.data)).toBe(sha256(correctedFit.data));
    for (const output of revised.outputs) expect(sha256(await readFile(resolve(revisedOptions.outputDirectory, output.path)))).toBe(output.sha256);
    // Current candidate partitions one continuous S drawing; no patched contours.
    const coherentOptions = { ...options, configSource: 'authoring-v5.json' as const, outputDirectory: resolve(temporary, 'fit-v5') };
    const coherent = await prepareHeadReview(coherentOptions);
    expect(coherent.measurements).toEqual(revised.measurements);
    expect(coherent.masters).toEqual(revised.masters);
    expect(coherent.fitMeasurements.find((m) => m.direction === 'N')).toEqual(revised.fitMeasurements.find((m) => m.direction === 'N'));
    expect(coherent.coherentFitMeasurement!.posteriorEarHairOverHead).toBeGreaterThan(0);
    expect(coherent.coherentFitMeasurement!.facialLandmarks.every((p) => p.hairAlpha === 0)).toBe(true);
    const coherentFront = decodePng(await readFile(resolve(coherentOptions.outputDirectory, 'layers/S-front-coherent.png')));
    const coherentRear = decodePng(await readFile(resolve(coherentOptions.outputDirectory, 'layers/S-rear-coherent.png')));
    const coherentMaster = decodePng(await readFile(resolve(coherentOptions.outputDirectory, 'master/S-hair-coherent.png')));
    const wholeHair = blankImage(1024, 1536);
    drawRgba(wholeHair, coherentRear, 0, 0); drawRgba(wholeHair, coherentFront, 0, 0);
    expect(sha256(wholeHair.data)).toBe(sha256(coherentMaster.data));
    const previousFront = decodePng(await readFile(resolve(sourceDirectory, 'S-front-fit-v4.png')));
    const previousRear = decodePng(await readFile(resolve(sourceDirectory, 'S-rear-fit-v4.png')));
    expect(sha256(coherentMaster.data)).toBe(sha256(decodePng(await readFile(resolve(sourceDirectory, 'S-hair-coherent-master-v4.png'))).data));
    let changedOwners = 0;
    for (let i = 0; i < wholeHair.data.length; i += 4) {
      let changedOwner = false;
      for (let c = 0; c < 4; c++) if (previousFront.data[i + c] !== coherentFront.data[i + c] || previousRear.data[i + c] !== coherentRear.data[i + c]) changedOwner = true;
      if (!changedOwner) continue;
      const x = i / 4 % 1024, y = Math.floor(i / 4 / 1024);
      if (x < 568 || x >= 584 || y < 200 || y >= 239) throw new Error('Ear-depth correction changed unrelated hair ownership.');
      expect([...coherentFront.data.slice(i, i + 4)]).toEqual([0, 0, 0, 0]);
      expect([...coherentRear.data.slice(i, i + 4)]).toEqual([...previousFront.data.slice(i, i + 4)]);
      expect(previousRear.data[i + 3]).toBe(0);
      changedOwners++;
    }
    expect(changedOwners).toBe(247);
    for (let i = 0; i < wholeHair.data.length; i += 4) if (coherentFront.data[i + 3] && coherentRear.data[i + 3]) throw new Error('Coherent hair owners overlap.');
    const coherentComposition = blankImage(1024, 1536);
    for (const image of [coherentRear, decodePng(await readFile(resolve(coherentOptions.outputDirectory, 'layers/S-neck.png'))), nativeHead]) drawRgba(coherentComposition, image, 0, 0);
    const skinWithoutFront = coherentComposition.data.slice();
    drawRgba(coherentComposition, coherentFront, 0, 0);
    const coherentFit = decodePng(await readFile(resolve(coherentOptions.outputDirectory, 'fit/S.png')));
    expect(sha256(coherentComposition.data)).toBe(sha256(coherentFit.data));
    // Previously cropped cheek areas and a pale skin highlight must stay skin.
    for (const [x, y] of [[550, 245], [470, 240], [516, 222]]) {
      const i = (y! * 1024 + x!) * 4;
      expect(nativeHead.data[i + 3]).toBeGreaterThan(8);
      expect(coherentFront.data[i + 3]).toBe(0);
      expect([...coherentFit.data.slice(i, i + 4)]).toEqual([...skinWithoutFront.slice(i, i + 4)]);
    }
    // These real inner-ear/lobe pixels were covered in v4, despite a sound hair partition.
    for (const [x, y] of [[580, 220], [578, 225], [575, 228], [573, 231]]) {
      const i = (y! * 1024 + x!) * 4;
      expect(previousFront.data[i + 3]).toBeGreaterThan(8);
      expect(nativeHead.data[i + 3]).toBeGreaterThan(8);
      expect(coherentFront.data[i + 3]).toBe(0);
      expect([...coherentFit.data.slice(i, i + 4)]).toEqual([...skinWithoutFront.slice(i, i + 4)]);
    }
    expect(await prepareHeadReview(coherentOptions)).toEqual(coherent);
    for (const output of coherent.outputs) expect(sha256(await readFile(resolve(coherentOptions.outputDirectory, output.path)))).toBe(output.sha256);
    const copy = resolve(temporary, 'invalid-source'); await cp(sourceDirectory, copy, { recursive: true });
    const draft = headReviewSchema.parse(JSON.parse(await readFile(resolve(copy, 'authoring-v1.json'), 'utf8')));
    // Re-pinning an altered partition must still fail semantic pixel preservation.
    const source = resolve(copy, draft.frames.S.head.source), changed = decodePng(await readFile(source));
    const pixel = changed.data.findIndex((v, i) => i % 4 === 3 && v >= 8) - 3;
    changed.data[pixel] = (changed.data[pixel]! + 1) % 256;
    const edited = encodePng(changed); await writeFile(source, edited); draft.frames.S.head.sourceSha256 = sha256(edited);
    await writeFile(resolve(copy, 'authoring-v1.json'), JSON.stringify(draft));
    await expect(prepareHeadReview({ ...options, sourceDirectory: copy, outputDirectory: resolve(temporary, 'rejected') })).rejects.toThrow('preserve its own master pixels exactly');
    const badAttachment = headReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, 'authoring-v1.json'), 'utf8'))); badAttachment.frames.N.neck.origin.y++;
    await writeFile(resolve(copy, 'authoring-v1.json'), JSON.stringify(badAttachment));
    await expect(prepareHeadReview({ ...options, sourceDirectory: copy, outputDirectory: resolve(temporary, 'rejected') })).rejects.toThrow('no translation');
    await expect(prepareHeadReview({ ...options, outputDirectory: resolve(hairDirectory, 'unsafe') })).rejects.toThrow('must be disjoint');
    // Re-pinning a forged fit source and its provenance must not bypass native reference ownership.
    const fitDraft = headReviewSchema.parse(JSON.parse(await readFile(resolve(copy, 'authoring-v2.json'), 'utf8')));
    await writeFile(resolve(copy, fitDraft.frames.S.head.source), await readFile(resolve(sourceDirectory, fitDraft.frames.S.head.source)));
    const frontSource = resolve(copy, fitDraft.fringeFit!.front.source), forgedFront = decodePng(await readFile(frontSource));
    const selectedPixel = forgedFront.data.findIndex((v, i) => i % 4 === 3 && v >= 8) - 3;
    forgedFront.data[selectedPixel] = (forgedFront.data[selectedPixel]! + 1) % 256;
    const forged = encodePng(forgedFront); await writeFile(frontSource, forged);
    fitDraft.fringeFit!.front.sourceSha256 = sha256(forged);
    const provenancePath = resolve(copy, fitDraft.fringeFit!.provenance.source);
    const provenance = JSON.parse(await readFile(provenancePath, 'utf8')) as { sourceSha256: string };
    provenance.sourceSha256 = sha256(forged); const provenanceBytes = JSON.stringify(provenance);
    await writeFile(provenancePath, provenanceBytes); fitDraft.fringeFit!.provenance.sourceSha256 = sha256(Buffer.from(provenanceBytes));
    await writeFile(resolve(copy, 'authoring-v2.json'), JSON.stringify(fitDraft));
    await expect(prepareHeadReview({ ...revisedOptions, sourceDirectory: copy, outputDirectory: resolve(temporary, 'forged-fit') })).rejects.toThrow('preserve selected reference RGBA');
    // Re-pinning an altered new layer cannot bypass single-study ownership.
    await cp(sourceDirectory, copy, { recursive: true });
    const coherentDraft = headReviewSchema.parse(JSON.parse(await readFile(resolve(copy, 'authoring-v5.json'), 'utf8')));
    const coherentSource = resolve(copy, coherentDraft.coherentFit!.front.source), forgedHair = decodePng(await readFile(coherentSource));
    const crownPixel = (100 * 1024 + 500) * 4;
    expect(forgedHair.data[crownPixel + 3]).toBeGreaterThan(8);
    forgedHair.data[crownPixel] = (forgedHair.data[crownPixel]! + 1) % 256;
    const coherentBytes = encodePng(forgedHair); await writeFile(coherentSource, coherentBytes);
    coherentDraft.coherentFit!.front.sourceSha256 = sha256(coherentBytes);
    await writeFile(resolve(copy, 'authoring-v5.json'), JSON.stringify(coherentDraft));
    await expect(prepareHeadReview({ ...coherentOptions, sourceDirectory: copy, outputDirectory: resolve(temporary, 'forged-coherent-fit') })).rejects.toThrow('exact disjoint native partition');
    for (const item of before) { expect(sha256(await readFile(item.path))).toBe(item.hash); expect((await stat(item.path)).mtimeMs).toBe(item.mtime); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 180_000);

it('reviews independent E/W anatomy, native reference ear fit, historical defects and immutable sources', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-profile-head-review-'));
  try {
    const referenceDirectory = resolve(temporary, 'references'); await mkdir(referenceDirectory);
    const settings = referenceImportSettingsSchema.parse(JSON.parse(await readFile(resolve(repository, 'assets/references/heroine-v1/import-v1.json'), 'utf8')));
    for (const direction of ['E', 'W'] as const) {
      const raw = decode(await readFile(resolve(repository, `assets/references/heroine-v1/detailed/${direction}.png`)), { checkCrc: true }), image = blankImage(1024, 1536);
      for (let p = 0; p < 1024 * 1536; p++) { image.data.set(raw.data.subarray(p * raw.channels, p * raw.channels + 3), p * 4); image.data[p * 4 + 3] = raw.channels === 4 ? raw.data[p * 4 + 3]! : 255; }
      const frame = settings.frames[direction];
      await writeFile(resolve(referenceDirectory, `${direction}.png`), encodePng(matteReference(image, frame.labelExclusions, settings.matte, frame.backgroundCorrections).image));
    }
    const before = [];
    for (const directory of [sourceDirectory, hairDirectory]) for (const file of await readdir(directory, { recursive: true })) {
      const path = resolve(directory, file), info = await stat(path);
      if (info.isFile()) before.push({ path, hash: sha256(await readFile(path)), mtime: info.mtimeMs });
    }
    const options = { sourceDirectory, hairDirectory, referenceDirectory, outputDirectory: resolve(temporary, 'review'), configSource: 'profiles-authoring-v1.json' as const };
    const draft = headProfilesReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, options.configSource), 'utf8')));
    const report = await prepareHeadReview(options);
    expect(report).toMatchObject({ published: false, anatomyApproved: false, rigCompatibility: 'unverified', supportedReviewDirections: ['E', 'W'], masterReconstruction: 'exact-normalized-head-neck-partition' });
    expect(report.measurements).toHaveLength(4);
    expect(report.hairMeasurements).toHaveLength(4);
    const masters = new Map<'E' | 'W', ReturnType<typeof blankImage>>();
    for (const direction of ['E', 'W'] as const) {
      const head = decodePng(await readFile(resolve(options.outputDirectory, `layers/${direction}-head.png`))), neck = decodePng(await readFile(resolve(options.outputDirectory, `layers/${direction}-neck.png`)));
      const master = decodePng(await readFile(resolve(options.outputDirectory, `master/${direction}.png`))), reconstructed = blankImage(1024, 1536);
      expect([head.width, head.height, neck.width, neck.height]).toEqual([1024, 1536, 1024, 1536]);
      drawRgba(reconstructed, neck, 0, 0); drawRgba(reconstructed, head, 0, 0);
      expect(sha256(reconstructed.data)).toBe(sha256(master.data)); masters.set(direction, master);
      const layers = new Map([['head', head], ['neck', neck]]);
      for (const part of ['rear', 'front'] as const) {
        const measurement = report.hairMeasurements.find((m) => m.direction === direction && m.part === part)!;
        const image = decodePng(await readFile(resolve(hairDirectory, `${direction}-${part === 'rear' ? 'rear-drape' : 'front'}.png`)));
        for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4);
        expect(sha256(encodePng(image))).toBe(measurement.cleanedSha256); layers.set(`hair-${part}`, image);
      }
      const composition = blankImage(1024, 1536);
      for (const plane of DIRECTION_PLANE_ORDER[direction]) { const image = layers.get(plane); if (image) drawRgba(composition, image, 0, 0); }
      const fit = decodePng(await readFile(resolve(options.outputDirectory, `fit/${direction}.png`)));
      expect(sha256(composition.data)).toBe(sha256(fit.data));
      expect(sha256(encodePng(composition))).toBe(report.fitMeasurements.find((m) => m.direction === direction)!.outputSha256);
      // These are diagnostic failures, not a claim that the existing hair fit is approved.
      const [x, y] = direction === 'E' ? [627, 202] : [380, 209], i = (y! * 1024 + x!) * 4;
      expect(head.data[i + 3]).toBeGreaterThan(8);
      expect(layers.get('hair-front')!.data[i + 3]).toBeGreaterThan(8);
      expect([...fit.data.slice(i, i + 4)]).not.toEqual([...head.data.slice(i, i + 4)]);
    }
    const e = masters.get('E')!, w = masters.get('W')!, mirrored = blankImage(1024, 1536);
    for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) mirrored.data.set(w.data.subarray((y * 1024 + x) * 4, (y * 1024 + x) * 4 + 4), (y * 1024 + 1023 - x) * 4);
    expect(sha256(e.data)).not.toBe(sha256(w.data)); expect(sha256(e.data)).not.toBe(sha256(mirrored.data));
    const correctedOptions = { ...options, configSource: 'profiles-authoring-v2.json' as const, outputDirectory: resolve(temporary, 'corrected') };
    const corrected = await prepareHeadReview(correctedOptions);
    expect(corrected.masters).toEqual(report.masters);
    expect(corrected.measurements).toEqual(report.measurements);
    expect(corrected.hairMeasurements).toEqual(report.hairMeasurements);
    expect(corrected.profileFitMeasurements).toHaveLength(2);
    for (const direction of ['E', 'W'] as const) {
      const front = decodePng(await readFile(resolve(correctedOptions.outputDirectory, `layers/${direction}-front-coherent.png`))), rear = decodePng(await readFile(resolve(correctedOptions.outputDirectory, `layers/${direction}-rear-coherent.png`)));
      const matte = decodePng(await readFile(resolve(correctedOptions.outputDirectory, `master/${direction}-hair-coherent.png`))), hair = blankImage(1024, 1536);
      drawRgba(hair, rear, 0, 0); drawRgba(hair, front, 0, 0);
      expect(sha256(hair.data)).toBe(sha256(matte.data));
      const measurement = corrected.profileFitMeasurements!.find((m) => m.direction === direction)!;
      expect(measurement.studySha256).toBe(draft.frames[direction].referenceSha256);
      expect(measurement.posteriorEarHairOverHead).toBeGreaterThan(0);
      const skin = blankImage(1024, 1536);
      drawRgba(skin, rear, 0, 0);
      drawRgba(skin, decodePng(await readFile(resolve(correctedOptions.outputDirectory, `layers/${direction}-neck.png`))), 0, 0);
      drawRgba(skin, decodePng(await readFile(resolve(correctedOptions.outputDirectory, `layers/${direction}-head.png`))), 0, 0);
      const skinWithoutFront = skin.data.slice(); drawRgba(skin, front, 0, 0);
      const fit = decodePng(await readFile(resolve(correctedOptions.outputDirectory, `fit/${direction}.png`)));
      expect(sha256(skin.data)).toBe(sha256(fit.data));
      for (const landmark of measurement.facialLandmarks) {
        const i = (landmark.position.y * 1024 + landmark.position.x) * 4;
        expect(front.data[i + 3]).toBe(0); expect(rear.data[i + 3]).toBe(0);
        expect([...fit.data.slice(i, i + 4)]).toEqual([...skinWithoutFront.slice(i, i + 4)]);
      }
      const [x, y] = direction === 'E' ? [558, 80] : [451, 100];
      expect(front.data[(y! * 1024 + x!) * 4 + 3]).toBeGreaterThan(8);
    }
    // The size/position repair must change the actual assembled ears, not just metadata.
    const earOptions = { ...options, configSource: 'profiles-authoring-v3.json' as const, outputDirectory: resolve(temporary, 'ear-fit') };
    const earDraft = headProfilesReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, earOptions.configSource), 'utf8')));
    const ears = await prepareHeadReview(earOptions);
    expect(ears.profileEarMeasurements).toHaveLength(2);
    expect(ears.hairMeasurements).toEqual(corrected.hairMeasurements);
    for (const direction of ['E', 'W'] as const) {
      const reference = decodePng(await readFile(resolve(referenceDirectory, `${direction}.png`)));
      const actual = decodePng(await readFile(resolve(earOptions.outputDirectory, `fit/${direction}.png`)));
      const oldFit = decodePng(await readFile(resolve(correctedOptions.outputDirectory, `fit/${direction}.png`)));
      const mask = decodePng(await readFile(resolve(earOptions.outputDirectory, `masks/${direction}-reference-ear.png`)));
      const repairMask = decodePng(await readFile(resolve(earOptions.outputDirectory, `masks/${direction}-ear-repair.png`)));
      const master = decodePng(await readFile(resolve(earOptions.outputDirectory, `master/${direction}.png`)));
      const oldMaster = masters.get(direction)!;
      const hair = decodePng(await readFile(resolve(earOptions.outputDirectory, `master/${direction}-hair-coherent.png`)));
      const oldHair = decodePng(await readFile(resolve(correctedOptions.outputDirectory, `master/${direction}-hair-coherent.png`)));
      const exclusions = new Set(earDraft.earRepair!.frames[direction].referenceHighlights.map(({ x, y }) => (y * 1024 + x) * 4));
      let referencePixels = 0, changedVisibleEarPixels = 0;
      for (let i = 0; i < mask.data.length; i += 4) {
        if (mask.data[i + 3] === 255) {
          referencePixels++;
          if (actual.data.subarray(i, i + 4).some((v, c) => v !== reference.data[i + c])) throw new Error('Visible ear size and placement must match native reference pixels.');
          if (oldFit.data.subarray(i, i + 4).some((v, c) => v !== actual.data[i + c])) changedVisibleEarPixels++;
        }
        if (!repairMask.data[i + 3] && master.data.subarray(i, i + 4).some((v, c) => v !== oldMaster.data[i + c])) throw new Error('Ear correction changed unrelated anatomy.');
        if (!exclusions.has(i) && hair.data.subarray(i, i + 4).some((v, c) => v !== oldHair.data[i + c])) throw new Error('Ear correction changed unrelated hair drawing.');
      }
      expect(referencePixels).toBe(earDraft.earRepair!.frames[direction].referencePixelCount);
      expect(referencePixels).toBeGreaterThan(100);
      expect(changedVisibleEarPixels).toBeGreaterThan(50);
      for (const [x, y] of direction === 'E' ? [[522, 183], [526, 198]] : [[491, 188], [483, 210]]) expect(mask.data[(y! * 1024 + x!) * 4 + 3]).toBe(255);
      // Check the full native visible skin extent, beyond sparse landmarks or
      // an incomplete hand-drawn selection (the W rim previously lost 18 pixels).
      const [left, top, right, bottom] = direction === 'E' ? [512, 175, 532, 205] : [476, 180, 503, 220];
      for (let y = top!; y < bottom!; y++) for (let x = left!; x < right!; x++) {
        const i = (y * 1024 + x) * 4;
        if (reference.data[i]! - reference.data[i + 2]! <= 18) continue;
        expect(mask.data[i + 3]).toBe(255);
        expect([...actual.data.slice(i, i + 4)]).toEqual([...reference.data.slice(i, i + 4)]);
      }
      expect(await readFile(resolve(earOptions.outputDirectory, `layers/${direction}-neck.png`))).toEqual(await readFile(resolve(correctedOptions.outputDirectory, `layers/${direction}-neck.png`)));
      const assembled = blankImage(1024, 1536);
      for (const layer of [`${direction}-rear-coherent`, `${direction}-neck`, `${direction}-head`, `${direction}-front-coherent`]) drawRgba(assembled, decodePng(await readFile(resolve(earOptions.outputDirectory, `layers/${layer}.png`))), 0, 0);
      expect(sha256(assembled.data)).toBe(sha256(actual.data));
    }
    expect(await prepareHeadReview(earOptions)).toEqual(ears);
    for (const output of ears.outputs) expect(sha256(await readFile(resolve(earOptions.outputDirectory, output.path)))).toBe(output.sha256);
    for (const output of corrected.outputs) expect(sha256(await readFile(resolve(correctedOptions.outputDirectory, output.path)))).toBe(output.sha256);
    for (const output of report.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
    const copy = resolve(temporary, 'forged-source'); await cp(sourceDirectory, copy, { recursive: true });
    const path = resolve(copy, draft.frames.E.head.source), forged = decodePng(await readFile(path));
    const pixel = forged.data.findIndex((v, i) => i % 4 === 3 && v >= 8) - 3;
    forged.data[pixel] = (forged.data[pixel]! + 1) % 256;
    const bytes = encodePng(forged); await writeFile(path, bytes); draft.frames.E.head.sourceSha256 = sha256(bytes);
    await writeFile(resolve(copy, options.configSource), JSON.stringify(draft));
    await expect(prepareHeadReview({ ...options, sourceDirectory: copy, outputDirectory: resolve(temporary, 'rejected') })).rejects.toThrow('preserve its own master pixels exactly');
    await writeFile(path, await readFile(resolve(sourceDirectory, draft.frames.E.head.source)));
    await writeFile(resolve(copy, options.configSource), await readFile(resolve(sourceDirectory, options.configSource)));
    const fitDraft = headProfilesReviewSchema.parse(JSON.parse(await readFile(resolve(copy, correctedOptions.configSource), 'utf8')));
    const fitSource = resolve(copy, fitDraft.profileFit!.frames.E.front.source), changedHair = decodePng(await readFile(fitSource));
    const hairPixel = changedHair.data.findIndex((v, i) => i % 4 === 3 && v >= 8) - 3;
    changedHair.data[hairPixel] = (changedHair.data[hairPixel]! + 1) % 256;
    const hairBytes = encodePng(changedHair); await writeFile(fitSource, hairBytes);
    fitDraft.profileFit!.frames.E.front.sourceSha256 = sha256(hairBytes);
    await writeFile(resolve(copy, correctedOptions.configSource), JSON.stringify(fitDraft));
    await expect(prepareHeadReview({ ...correctedOptions, sourceDirectory: copy, outputDirectory: resolve(temporary, 'forged-fit') })).rejects.toThrow('exact disjoint native partition');
    await writeFile(fitSource, await readFile(resolve(sourceDirectory, fitDraft.profileFit!.frames.E.front.source)));
    await writeFile(resolve(copy, correctedOptions.configSource), await readFile(resolve(sourceDirectory, correctedOptions.configSource)));
    // Re-pin both master and head after an unrelated edit: even a coherent forged
    // partition must fail the local ear source-preservation boundary.
    for (const part of ['master', 'head'] as const) {
      const input = earDraft.frames.E[part], image = decodePng(await readFile(resolve(copy, input.source)));
      const i = (145 * 1024 + 585) * 4;
      expect(image.data[i + 3]).toBeGreaterThan(8);
      image.data[i] = (image.data[i]! + 1) % 256;
      const bytes = encodePng(image); await writeFile(resolve(copy, input.source), bytes); input.sourceSha256 = sha256(bytes);
    }
    await writeFile(resolve(copy, earOptions.configSource), JSON.stringify(earDraft));
    await expect(prepareHeadReview({ ...earOptions, sourceDirectory: copy, outputDirectory: resolve(temporary, 'forged-ear') })).rejects.toThrow('all anatomy outside its local mask');
    for (const item of before) { expect(sha256(await readFile(item.path))).toBe(item.hash); expect((await stat(item.path)).mtimeMs).toBe(item.mtime); }
  } finally { await rm(temporary, { recursive: true, force: true }); }
}, 180_000);
