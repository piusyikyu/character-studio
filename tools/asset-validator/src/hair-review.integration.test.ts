import { cp, mkdtemp, readFile, readdir, rm, stat, writeFile, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { decode } from 'fast-png';
import { describe, expect, it } from 'vitest';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { Direction } from '@character-studio/core';
import { prepareHairReview } from './hair-review';
import { hairReviewSchema } from './hair-review-schema';
import { overview } from './inspection';
import { matteReference } from './matte';
import { referenceImportSettingsSchema } from './schema';
import { sha256 } from './reference-import';

const repository = fileURLToPath(new URL('../../../', import.meta.url));
const sourceDirectory = resolve(repository, 'assets/source/heroine-v1/hair/long-waves-v1');

// Recreate the requested facings from tracked inputs; never depend on ignored staging.
async function references(directory: string, directions: readonly Direction[] = ['S', 'N']) {
  await mkdir(directory, { recursive: true });
  const settings = referenceImportSettingsSchema.parse(JSON.parse(await readFile(resolve(repository, 'assets/references/heroine-v1/import-v1.json'), 'utf8')));
  for (const direction of directions) {
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

describe('Modular hair authoring review', () => {
  it.each([
    { configFilename: 'authoring-v1.json' as const, directions: ['S', 'N'] as const, hidden: ['N'], missing: ['NE', 'E', 'SE', 'SW', 'W', 'NW'], count: 3, approvalFile: 'review-v1.json' },
    { configFilename: 'back-diagonals-authoring-v1.json' as const, directions: ['NE', 'NW'] as const, hidden: ['NE', 'NW'], missing: ['N', 'E', 'SE', 'S', 'SW', 'W'], count: 2, approvalFile: 'back-diagonals-review-v1.json' },
  ])('prepares $configFilename with native attachments, hidden rear fringe and immutable inputs', async ({ configFilename, directions, hidden, missing, count, approvalFile }) => {
    const temporary = await mkdtemp(resolve(tmpdir(), 'character-hair-review-'));
    try {
      const referenceDirectory = resolve(temporary, 'references');
      await references(referenceDirectory, directions);
      const draft = hairReviewSchema.parse(JSON.parse(await readFile(resolve(sourceDirectory, configFilename), 'utf8')));
      const parts = Object.values(draft.frames).flatMap((frame) => [frame.rear, ...(frame.front.visibility === 'visible' ? [frame.front.artwork] : [])]);
      const before = await Promise.all(parts.map(async (part) => ({ path: resolve(sourceDirectory, part.source), hash: sha256(await readFile(resolve(sourceDirectory, part.source))), mtime: (await stat(resolve(sourceDirectory, part.source))).mtimeMs })));
      const options = { sourceDirectory, referenceDirectory, outputDirectory: resolve(temporary, 'staging'), configFilename };
      const first = await prepareHairReview(options);
      if (approvalFile) {
        const approval = JSON.parse(await readFile(resolve(sourceDirectory, approvalFile), 'utf8'));
        expect(first.configSha256).toBe(approval.configSha256);
        for (const approved of approval.layers) expect(first.measurements.find((m) => m.direction === approved.direction && m.part === approved.part)).toMatchObject({ sourceSha256: approved.sourceSha256, outputSha256: approved.cleanedSha256 });
      }
      expect(first.published).toBe(false);
      expect(first.paletteReady).toBe(false);
      expect(first.sourcePose).toBe('standing-reference');
      expect(first.rigCompatibility).toBe('unverified');
      expect(first.supportedReviewDirections).toEqual(directions);
      expect(first.missingDirections).toEqual(missing);
      expect(first.hiddenLayers).toMatchObject(hidden.map((direction) => ({ direction, part: 'front' })));
      expect(first.measurements).toHaveLength(count);
      for (const layer of first.measurements) {
        expect(layer.position).toEqual({ x: 0, y: 0 });
        expect(layer.alpha.transparent).toBeGreaterThan(0);
        expect(layer.greenCandidates).toBe(0);
        const image = decodePng(await readFile(resolve(options.outputDirectory, `layers/${layer.direction}-${layer.part}.png`)));
        expect([image.width, image.height]).toEqual([1024, 1536]);
        for (let i = 0; i < image.data.length; i += 4) if (!image.data[i + 3] && (image.data[i] || image.data[i + 1] || image.data[i + 2])) throw new Error('Invisible RGB was not normalized.');
      }
      for (const direction of hidden) expect(sha256(await readFile(resolve(options.outputDirectory, `assembled/${direction}.png`)))).toBe(first.measurements.find((m) => m.direction === direction)!.outputSha256);
      const green = decodePng(await readFile(resolve(options.outputDirectory, `inspection/green/${directions[0]}-assembled.png`)));
      expect([...green.data.slice(0, 4)]).toEqual([0, 255, 0, 255]);
      expect([...green.data.slice((8 * 1024 + 8) * 4, (8 * 1024 + 8) * 4 + 4)]).toEqual([255, 255, 0, 255]);
      const outputs = new Map<string, string>();
      for (const path of await readdir(options.outputDirectory, { recursive: true })) if ((await stat(resolve(options.outputDirectory, path))).isFile()) outputs.set(path, sha256(await readFile(resolve(options.outputDirectory, path))));
      expect(await prepareHairReview(options)).toEqual(first);
      for (const [path, hash] of outputs) expect(sha256(await readFile(resolve(options.outputDirectory, path)))).toBe(hash);
      if ('NE' in draft.frames) {
        const approval = JSON.parse(await readFile(resolve(sourceDirectory, 'back-diagonals-ne-review-v1.json'), 'utf8'));
        expect(draft.frames.NE).toEqual(approval.frame);
        expect(first.measurements.find((m) => m.direction === 'NE')).toMatchObject({ sourceSha256: approval.layers[0].sourceSha256, outputSha256: approval.layers[0].cleanedSha256 });
        const restoration = JSON.parse(await readFile(resolve(sourceDirectory, 'inputs/back-diagonals-v2/restoration-v2.json'), 'utf8'));
        const pairApproval = JSON.parse(await readFile(resolve(sourceDirectory, 'back-diagonals-review-v1.json'), 'utf8'));
        expect(restoration).toEqual(pairApproval.shoulderRestoration);
        const baseBytes = await readFile(resolve(sourceDirectory, restoration.baseline.source));
        const refBytes = await readFile(resolve(referenceDirectory, restoration.reference.source));
        const maskBytes = await readFile(resolve(sourceDirectory, restoration.selection.source));
        const outputBytes = await readFile(resolve(sourceDirectory, restoration.output.source));
        for (const [bytes, hash] of [[baseBytes, restoration.baseline.sha256], [refBytes, restoration.reference.sha256], [maskBytes, restoration.selection.sha256], [outputBytes, restoration.output.sha256]] as const) expect(sha256(bytes)).toBe(hash);
        expect(draft.frames.NW.rear.sourceSha256).toBe(restoration.output.sha256);
        const base = decodePng(baseBytes), reference = decodePng(refBytes), mask = decodePng(maskBytes), corrected = decodePng(outputBytes);
        const staged = decodePng(await readFile(resolve(options.outputDirectory, 'layers/NW-rear.png')));
        let selectedPixels = 0, addedPixels = 0;
        for (let i = 0; i < corrected.data.length; i += 4) {
          const selected = mask.data[i + 3] === 255;
          if (mask.data.subarray(i, i + 4).some((value) => value !== (selected ? 255 : 0))) throw new Error('Shoulder mask is not binary RGBA.');
          const expected = selected ? reference : base;
          if (corrected.data.subarray(i, i + 4).some((value, channel) => value !== expected.data[i + channel])) throw new Error('NW shoulder restoration changed its reference pixels or pixels outside the mask.');
          if (selected) {
            selectedPixels++;
            if (base.data[i + 3]! < 8) addedPixels++;
            if (reference.data[i + 3]! < 8 || staged.data.subarray(i, i + 4).some((value, channel) => value !== reference.data[i + channel])) throw new Error('NW shoulder curl is missing from review output.');
          }
        }
        expect({ selectedPixels, addedPixels, replacedPixels: selectedPixels - addedPixels }).toEqual({ selectedPixels: restoration.pixelCount, addedPixels: restoration.addedPixels, replacedPixels: restoration.replacedPixels });
        const ne = decodePng(await readFile(resolve(options.outputDirectory, 'layers/NE-rear.png')));
        const nw = decodePng(await readFile(resolve(options.outputDirectory, 'layers/NW-rear.png')));
        const mirrored = blankImage(1024, 1536);
        for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) mirrored.data.set(nw.data.subarray((y * 1024 + x) * 4, (y * 1024 + x) * 4 + 4), (y * 1024 + 1023 - x) * 4);
        expect(sha256(ne.data)).not.toBe(sha256(nw.data));
        expect(sha256(ne.data)).not.toBe(sha256(mirrored.data));
        const copy = resolve(temporary, 'invalid-source');
        await mkdir(copy);
        for (const part of parts) await cp(resolve(sourceDirectory, part.source), resolve(copy, part.source));
        const invalid = structuredClone(draft.frames);
        invalid.NW.rear = structuredClone(invalid.NE.rear);
        invalid.NW.rear.origin = invalid.NW.candidateHeadAnchor;
        await writeFile(resolve(copy, configFilename), JSON.stringify({ ...draft, frames: invalid }));
        await expect(prepareHairReview({ ...options, sourceDirectory: copy, outputDirectory: resolve(temporary, 'rejected') })).rejects.toThrow('independently authored rear layers');
        const visible = structuredClone(draft.frames);
        visible.NE.front = { visibility: 'visible', artwork: visible.NE.rear };
        await writeFile(resolve(copy, configFilename), JSON.stringify({ ...draft, frames: visible }));
        await expect(prepareHairReview({ ...options, sourceDirectory: copy, outputDirectory: resolve(temporary, 'rejected') })).rejects.toThrow('hide the frontal fringe');
      }
      for (const input of before) {
        expect(sha256(await readFile(input.path))).toBe(input.hash);
        expect((await stat(input.path)).mtimeMs).toBe(input.mtime);
      }
    } finally { await rm(temporary, { recursive: true, force: true }); }
  }, 120_000);

  it.each([
    { directions: ['E', 'W'] as const, configFilename: 'profiles-authoring-v1.json' as const, missing: ['N', 'NE', 'SE', 'S', 'SW', 'NW'], approvalFile: 'profiles-review-v1.json' },
    { directions: ['SE', 'SW'] as const, configFilename: 'front-diagonals-authoring-v4.json' as const, missing: ['N', 'NE', 'E', 'S', 'W', 'NW'], approvalFile: 'front-diagonals-review-v1.json' },
    { directions: ['SE', 'SW'] as const, configFilename: 'front-diagonals-authoring-v5.json' as const, missing: ['N', 'NE', 'E', 'S', 'W', 'NW'], approvalFile: 'front-diagonals-review-v2.json' },
  ])('reviews $configFilename pieces reproducibly without changing approved inputs', async ({ directions, configFilename, missing, approvalFile }) => {
    const temporary = await mkdtemp(resolve(tmpdir(), 'character-hair-profiles-'));
    try {
      const referenceDirectory = resolve(temporary, 'references');
      await references(referenceDirectory, directions);
      const draftBytes = await readFile(resolve(sourceDirectory, configFilename));
      const draft = hairReviewSchema.parse(JSON.parse(draftBytes.toString('utf8')));
      if ('S' in draft.frames || 'NE' in draft.frames) throw new Error('Expected independently authored side or front-diagonal artwork.');
      const profileSources = Object.values(draft.frames).flatMap((frame) => [frame.rear.source, ...(frame.front.visibility === 'visible' ? [frame.front.artwork.source] : []), ...(frame.designMaster ? [frame.designMaster.source] : []), ...(frame.fitHead ? [frame.fitHead.artwork.source] : []), ...(frame.rearCompletion ? [frame.rearCompletion.base.source, frame.rearCompletion.artwork.source, frame.rearCompletion.selection.source] : [])]);
      const immutable = ['authoring-v1.json', 'review-v1.json', 'S-front.png', 'S-rear.png', 'N-rear.png', 'profiles-authoring-v1.json', 'profiles-review-v1.json', 'E-front.png', 'E-rear-drape.png', 'W-front.png', 'W-rear-drape.png', 'front-diagonals-authoring-v4.json', 'front-diagonals-review-v1.json', 'SE-master-v3.png', 'SW-master-v3.png', configFilename, ...profileSources];
      const before = await Promise.all(immutable.map(async (path) => ({ path, hash: sha256(await readFile(resolve(sourceDirectory, path))), mtime: (await stat(resolve(sourceDirectory, path))).mtimeMs })));
      const options = { sourceDirectory, referenceDirectory, outputDirectory: resolve(temporary, 'staging'), configFilename };
      const first = await prepareHairReview(options);
      expect(first.supportedReviewDirections).toEqual(directions);
      expect(first.missingDirections).toEqual(missing);
      if (approvalFile) {
        const approval = JSON.parse(await readFile(resolve(sourceDirectory, approvalFile), 'utf8'));
        expect(first.configSha256).toBe(approval.configSha256);
        if (approval.rearCompletion) expect(first.rearCompletionMeasurements).toEqual(approval.rearCompletion);
        for (const approved of approval.layers) expect(first.measurements.find((m) => m.direction === approved.direction && m.part === approved.part)).toMatchObject({ sourceSha256: approved.sourceSha256, outputSha256: approved.cleanedSha256 });
      }
      expect(first.hiddenLayers).toEqual([]);
      expect(first.measurements).toHaveLength(4);
      expect(first).toMatchObject({ published: false, paletteReady: false, rigCompatibility: 'unverified' });
      for (const part of ['front', 'rear']) {
        const east = decodePng(await readFile(resolve(options.outputDirectory, `layers/${directions[0]}-${part}.png`)));
        const west = decodePng(await readFile(resolve(options.outputDirectory, `layers/${directions[1]}-${part}.png`)));
        expect([east.width, east.height, west.width, west.height]).toEqual([1024, 1536, 1024, 1536]);
        const mirroredWest = blankImage(1024, 1536);
        for (let y = 0; y < 1536; y++) for (let x = 0; x < 1024; x++) mirroredWest.data.set(west.data.subarray((y * 1024 + x) * 4, (y * 1024 + x) * 4 + 4), (y * 1024 + 1023 - x) * 4);
        expect(sha256(east.data)).not.toBe(sha256(west.data));
        expect(sha256(east.data)).not.toBe(sha256(mirroredWest.data));
      }
      for (const layer of first.measurements) expect(layer).toMatchObject({ greenCandidates: 0, position: { x: 0, y: 0 } });
      for (const direction of directions) {
        const assembled = blankImage(1024, 1536);
        for (const plane of DIRECTION_PLANE_ORDER[direction]) {
          if (plane === 'hair-front' || plane === 'hair-rear') drawRgba(assembled, decodePng(await readFile(resolve(options.outputDirectory, `layers/${direction}-${plane.slice(5)}.png`))), 0, 0);
        }
        expect(sha256(await readFile(resolve(options.outputDirectory, `assembled/${direction}.png`)))).toBe(sha256(encodePng(assembled)));
        const green = decodePng(await readFile(resolve(options.outputDirectory, `inspection/green/${direction}-assembled.png`)));
        expect([...green.data.slice(0, 4)]).toEqual([0, 255, 0, 255]);
        expect([...green.data.slice((8 * 1024 + 8) * 4, (8 * 1024 + 8) * 4 + 4)]).toEqual([255, 255, 0, 255]);
      }
      if (draft.reviewRevision) {
        expect(first).toMatchObject({ reviewRevision: draft.reviewRevision, fixtureAnatomyApproved: false });
        expect(first.fixtureMeasurements).toHaveLength(2);
        const contact = blankImage((draft.reviewRevision ?? 0) >= 3 ? 3072 : 2048, 3072), hairOnlyContact = blankImage(2048, 3072);
        for (const [index, direction] of directions.entries()) {
          const rear = decodePng(await readFile(resolve(options.outputDirectory, `layers/${direction}-rear.png`)));
          const front = decodePng(await readFile(resolve(options.outputDirectory, `layers/${direction}-front.png`)));
          const head = decodePng(await readFile(resolve(options.outputDirectory, `fixtures/${direction}-head-neck-fixture.png`)));
          const expectedFit = blankImage(1024, 1536);
          // Expected public contract: head occludes rear, bangs occlude head.
          for (const image of [rear, head, front]) drawRgba(expectedFit, image, 0, 0);
          const fit = decodePng(await readFile(resolve(options.outputDirectory, `fit/${direction}.png`)));
          expect(sha256(fit.data)).toBe(sha256(expectedFit.data));
          if (draft.reviewRevision === 4) {
            // Reconstruction alone missed these original far-side curls in revision 3.
            const reference = decodePng(await readFile(resolve(referenceDirectory, `${direction}.png`)));
            const prior = decodePng(await readFile(resolve(sourceDirectory, `${direction}-master-v3.png`)));
            const frame = Object.entries(draft.frames).find(([facing]) => facing === direction)![1];
            const restoration = frame.restoredReferenceHair!;
            const mask = decodePng(await readFile(resolve(sourceDirectory, restoration.source)));
            const samples = direction === 'SE' ? [[659, 420], [699, 500], [728, 550], [747, 600], [740, 650]] : [[320, 425], [343, 450], [311, 480], [325, 520], [305, 580], [334, 625]];
            for (const [x, y] of samples) {
              const i = (y! * 1024 + x!) * 4;
              expect(mask.data[i + 3]).toBe(255);
              expect(reference.data[i + 3]).toBeGreaterThanOrEqual(8);
              expect(prior.data[i + 3]).toBe(0);
              expect([...rear.data.subarray(i, i + 4)]).toEqual([...reference.data.subarray(i, i + 4)]);
              expect([...fit.data.subarray(i, i + 4)]).toEqual([...reference.data.subarray(i, i + 4)]);
            }
            // Restoration is additive: no original study pixel changes anywhere.
            let restoredCount = 0;
            for (let i = 0; i < prior.data.length; i += 4) {
              if (mask.data[i + 3]) restoredCount++;
              else if (fit.data.subarray(i, i + 4).some((value, channel) => value !== prior.data[i + channel])) throw new Error('Restoration changed existing facing geometry.');
            }
            expect(restoredCount).toBe(restoration.pixelCount);
            expect(restoredCount).toBeGreaterThan(direction === 'SE' ? 10_000 : 4_000);
          }
          const wrongOrder = blankImage(1024, 1536);
          const misplaced = draft.reviewRevision === 5 ? [head, rear, front] : [rear, front, head];
          for (const image of misplaced) drawRgba(wrongOrder, image, 0, 0);
          if (draft.reviewRevision === 2 || draft.reviewRevision === 5) expect(sha256(fit.data)).not.toBe(sha256(wrongOrder.data));
          else {
            // Revision 3 partitions visible master pixels; it does not fake hidden anatomy.
            const master = decodePng(await readFile(resolve(options.outputDirectory, `masters/${direction}.png`)));
            expect(sha256(fit.data)).toBe(sha256(master.data));
            expect(sha256(wrongOrder.data)).toBe(sha256(master.data));
          }
          let rearOccluded = 0, bangsOverHead = 0;
          for (let i = 0; i < head.data.length; i += 4) {
            if (head.data[i + 3] && rear.data[i + 3] && front.data[i + 3] === 0) {
              if (head.data[i + 3] === 255 && fit.data.subarray(i, i + 4).some((value, c) => value !== head.data[i + c])) throw new Error('Rear hair leaked through the opaque face/neck.');
              rearOccluded++;
            }
            if (front.data[i + 3]! > 0 && head.data[i + 3]! > 0) {
              if (head.data[i + 3] === 255) {
                const alpha = front.data[i + 3]!;
                for (let c = 0; c < 3; c++) if (fit.data[i + c] !== Math.round((front.data[i + c]! * alpha + head.data[i + c]! * (255 - alpha)) / 255)) throw new Error('Head covered the front bangs.');
                if (fit.data[i + 3] !== 255) throw new Error('Alpha blend changed opaque fixture coverage.');
              }
              bangsOverHead++;
            }
          }
          if (draft.reviewRevision === 2) {
            expect(rearOccluded).toBeGreaterThan(100);
            expect(bangsOverHead).toBeGreaterThan(100);
          } else if (draft.reviewRevision === 5) {
            expect(rearOccluded).toBeGreaterThan(100);
            expect(bangsOverHead).toBe(0); // The unchanged partial head/front are still disjoint.
          } else {
            expect(rearOccluded).toBe(0);
            expect(bangsOverHead).toBe(0);
          }
          const checker = decodePng(await readFile(resolve(options.outputDirectory, `inspection/checker/${direction}-fit.png`)));
          expect([...checker.data.slice((40 * 1024 + 8) * 4, (40 * 1024 + 8) * 4 + 4)]).toEqual([255, 255, 0, 255]);
          expect([...fit.data.slice((40 * 1024 + 8) * 4, (40 * 1024 + 8) * 4 + 4)]).toEqual([0, 0, 0, 0]);
          drawRgba(contact, decodePng(await readFile(resolve(options.outputDirectory, `inspection/${(draft.reviewRevision ?? 0) >= 3 ? 'master-comparison' : 'fit-comparison'}/${direction}.png`))), 0, index * 1536);
          drawRgba(hairOnlyContact, decodePng(await readFile(resolve(options.outputDirectory, `inspection/comparison/${direction}.png`))), 0, index * 1536);
        }
        expect(sha256(await readFile(resolve(options.outputDirectory, 'overview.png')))).toBe(sha256(encodePng(overview(contact))));
        expect(sha256(await readFile(resolve(options.outputDirectory, 'hair-only-overview.png')))).toBe(sha256(encodePng(overview(hairOnlyContact))));
        if ((draft.reviewRevision ?? 0) >= 3) {
          expect(first).toMatchObject({ syntheticFitGuides: false, masterReconstruction: draft.reviewRevision === 5 ? 'exact-baseline-partition-plus-masked-rear-completion' : 'exact-visible-rgba-partition', hiddenRootCompletion: draft.reviewRevision === 5 ? 'authored-needs-human-review' : 'pending', reviewHeadCompleteness: 'visible-study-pixels-only' });
          expect(first.designMasterMeasurements).toHaveLength(2);
          for (const measurement of first.designMasterMeasurements!) expect(sha256(await readFile(resolve(options.outputDirectory, `masters/${measurement.direction}.png`)))).toBe(measurement.outputSha256);
        }
        if (draft.reviewRevision === 5) {
          expect(first.rearCompletionMeasurements).toHaveLength(2);
          for (const [direction, frame] of Object.entries(draft.frames)) {
            const completion = frame.rearCompletion!;
            const rear = decodePng(await readFile(resolve(options.outputDirectory, `layers/${direction}-rear.png`)));
            const baseline = decodePng(await readFile(resolve(sourceDirectory, completion.base.source)));
            const authored = decodePng(await readFile(resolve(sourceDirectory, completion.artwork.source)));
            const mask = decodePng(await readFile(resolve(sourceDirectory, completion.selection.source)));
            let addedPixels = 0, changedPixels = 0;
            for (let i = 0; i < rear.data.length; i += 4) {
              if (mask.data[i + 3]) {
                if (baseline.data[i + 3]) changedPixels++;
                else addedPixels++;
                if (authored.data[i + 3]! < 8 || rear.data.subarray(i, i + 4).some((value, channel) => value !== authored.data[i + channel])) throw new Error('Completion lost authored native pixels.');
              } else if (rear.data.subarray(i, i + 4).some((value, channel) => value !== baseline.data[i + channel])) throw new Error('Completion changed accepted pixels outside its mask.');
            }
            expect(first.rearCompletionMeasurements!.find((measurement) => measurement.direction === direction)).toMatchObject({ addedPixels, changedPixels, pixelCount: completion.pixelCount });
            expect(addedPixels).toBeGreaterThan(30_000);
            expect(changedPixels).toBeLessThan(4_000);
            const restoration = decodePng(await readFile(resolve(sourceDirectory, frame.restoredReferenceHair!.source)));
            for (let i = 3; i < rear.data.length; i += 4) if (restoration.data[i] && rear.data[i]! < 8) throw new Error('Completion dropped visible reference curls.');
          }
        }
      }
      for (const output of first.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
      expect(await prepareHairReview(options)).toEqual(first);
      for (const output of first.outputs) expect(sha256(await readFile(resolve(options.outputDirectory, output.path)))).toBe(output.sha256);
      for (const input of before) {
        expect(sha256(await readFile(resolve(sourceDirectory, input.path)))).toBe(input.hash);
        expect((await stat(resolve(sourceDirectory, input.path))).mtimeMs).toBe(input.mtime);
      }
      // Profile visibility cannot be silently omitted or filled with reused artwork.
      const copy = resolve(temporary, 'source');
      await cp(sourceDirectory, copy, { recursive: true });
      const path = resolve(copy, options.configFilename), invalid = JSON.parse(draftBytes.toString('utf8'));
      if (draft.reviewRevision) {
        const missingFixture = JSON.parse(draftBytes.toString('utf8'));
        if (draft.reviewRevision === 2) delete missingFixture.frames.SW.fitFixture;
        else delete missingFixture.frames.SW.fitHead;
        await writeFile(path, JSON.stringify(missingFixture));
        const rejectedFit = resolve(temporary, 'rejected-fit');
        await expect(prepareHairReview({ ...options, sourceDirectory: copy, outputDirectory: rejectedFit })).rejects.toThrow(draft.reviewRevision === 2 ? 'requires separate SE/SW' : 'whole-facing master and authored review head');
        await expect(stat(rejectedFit)).rejects.toThrow('ENOENT');
        if ((draft.reviewRevision ?? 0) >= 3) {
          const mismatched = JSON.parse(draftBytes.toString('utf8'));
          mismatched.frames.SW.rear.authoringMasterSha256 = mismatched.frames.SE.designMaster.sourceSha256;
          await writeFile(path, JSON.stringify(mismatched));
          await expect(prepareHairReview({ ...options, sourceDirectory: copy, outputDirectory: rejectedFit })).rejects.toThrow('same facing-specific authoring master');
          await expect(stat(rejectedFit)).rejects.toThrow('ENOENT');
          // Even a freshly pinned layer hash cannot disguise artwork from another facing.
          const corrupted = JSON.parse(draftBytes.toString('utf8'));
          const artworkPath = resolve(copy, corrupted.frames.SW.front.artwork.source);
          const artwork = decodePng(await readFile(artworkPath));
          const pixel = artwork.data.findIndex((_, index) => index % 4 === 3 && artwork.data[index]! >= 8) - 3;
          artwork.data[pixel] = (artwork.data[pixel]! + 1) % 256;
          const changed = encodePng(artwork);
          await writeFile(artworkPath, changed);
          corrupted.frames.SW.front.artwork.sourceSha256 = sha256(changed);
          await writeFile(path, JSON.stringify(corrupted));
          await expect(prepareHairReview({ ...options, sourceDirectory: copy, outputDirectory: rejectedFit })).rejects.toThrow('preserve their own master pixels exactly');
          await expect(stat(rejectedFit)).rejects.toThrow('ENOENT');
          await cp(resolve(sourceDirectory, corrupted.frames.SW.front.artwork.source), artworkPath);
          if (draft.reviewRevision === 5) {
            // Re-pinning a changed rear cannot legitimize edits outside the manual mask.
            const escaped = JSON.parse(draftBytes.toString('utf8'));
            const frame = escaped.frames.SW;
            const rearPath = resolve(copy, frame.rear.source);
            const rear = decodePng(await readFile(rearPath));
            const selection = decodePng(await readFile(resolve(copy, frame.rearCompletion.selection.source)));
            const pixel = rear.data.findIndex((value, index) => index % 4 === 3 && value >= 8 && selection.data[index] === 0) - 3;
            rear.data[pixel] = (rear.data[pixel]! + 1) % 256;
            const bytes = encodePng(rear);
            await writeFile(rearPath, bytes);
            frame.rear.sourceSha256 = sha256(bytes);
            await writeFile(path, JSON.stringify(escaped));
            await expect(prepareHairReview({ ...options, sourceDirectory: copy, outputDirectory: rejectedFit })).rejects.toThrow('rear completion changed pixels outside its selection');
            await expect(stat(rejectedFit)).rejects.toThrow('ENOENT');
            await cp(resolve(sourceDirectory, frame.rear.source), rearPath);
          }
          if (draft.reviewRevision === 4) {
            // A consistent master/layer repartition still fails if it drops reference hair.
            const missingHair = JSON.parse(draftBytes.toString('utf8'));
            const frame = missingHair.frames.SW;
            const restoration = decodePng(await readFile(resolve(copy, frame.restoredReferenceHair.source)));
            const pixel = restoration.data.findIndex((value, index) => index % 4 === 3 && value === 255) - 3;
            const changedSources = [frame.designMaster, frame.rear, frame.partitionMasks.rear];
            for (const source of changedSources) {
              const image = decodePng(await readFile(resolve(copy, source.source)));
              image.data.fill(0, pixel, pixel + 4);
              const bytes = encodePng(image);
              source.sourceSha256 = sha256(bytes);
              await writeFile(resolve(copy, source.source), bytes);
            }
            for (const part of [frame.rear, frame.front.artwork, frame.fitHead.artwork]) part.authoringMasterSha256 = frame.designMaster.sourceSha256;
            await writeFile(path, JSON.stringify(missingHair));
            await expect(prepareHairReview({ ...options, sourceDirectory: copy, outputDirectory: rejectedFit })).rejects.toThrow('restored reference hair is missing or altered');
            await expect(stat(rejectedFit)).rejects.toThrow('ENOENT');
            for (const source of changedSources) await cp(resolve(sourceDirectory, source.source), resolve(copy, source.source));
          }
        }
      }
      invalid.frames[directions[1]].front = { visibility: 'hidden', reason: 'Missing facing draft' };
      await writeFile(path, JSON.stringify(invalid));
      const rejectedOutput = resolve(temporary, 'rejected');
      await expect(prepareHairReview({ ...options, sourceDirectory: copy, outputDirectory: rejectedOutput })).rejects.toThrow('own visible front hair');
      await expect(stat(rejectedOutput)).rejects.toThrow('ENOENT');
      const reused = JSON.parse(draftBytes.toString('utf8'));
      reused.frames[directions[1]].rear = reused.frames[directions[0]].rear;
      await writeFile(path, JSON.stringify(reused));
      await expect(prepareHairReview({ ...options, sourceDirectory: copy, outputDirectory: rejectedOutput })).rejects.toThrow('distinct independently authored layers');
      await expect(stat(rejectedOutput)).rejects.toThrow('ENOENT');
    } finally { await rm(temporary, { recursive: true, force: true }); }
  }, 180_000);

  it('rejects changed inputs, non-native geometry, painted haze and label contamination before creating outputs', async () => {
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
      // A real authoring failure painted a semitransparent backdrop; the fixed
      // cleanup threshold must not silently remove it or accept it as hair.
      const haze = blankImage(1024, 1536);
      for (let i = 0; i < haze.data.length; i += 4) haze.data.set([1, 1, 1, 45], i);
      const hazeBytes = encodePng(haze);
      await writeFile(source, hazeBytes);
      draft.frames.S.rear.sourceSha256 = sha256(hazeBytes);
      await writeFile(path, JSON.stringify(draft));
      await expect(prepareHairReview({ sourceDirectory: copy, referenceDirectory, outputDirectory })).rejects.toThrow('genuine transparency');
      await expect(stat(outputDirectory)).rejects.toThrow('ENOENT');
      await writeFile(source, original);
      await expect(prepareHairReview({ sourceDirectory, referenceDirectory, outputDirectory: sourceDirectory })).rejects.toThrow('disjoint');
    } finally { await rm(temporary, { recursive: true, force: true }); }
  }, 30_000);
});
