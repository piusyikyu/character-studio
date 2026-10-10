import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { DIRECTIONS, DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { Direction } from '@character-studio/core';
import { blankImage, decodePng, decorateExport, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { alphaStatistics, characterBounds } from './audit';
import { checkerPreview, fitDraftLabel, overview } from './inspection';
import { hairReviewSchema } from './hair-review-schema';
import { headNeckFixture } from './hair-fit-fixture';
import { sha256 } from './reference-import';

const nested = (parent: string, child: string) => { const path = relative(parent, child); return path === '' || (!path.startsWith('..') && !isAbsolute(path)); };

export interface HairReviewOptions {
  readonly sourceDirectory: string;
  readonly referenceDirectory: string;
  readonly outputDirectory: string;
  readonly configFilename?: 'authoring-v1.json' | 'profiles-authoring-v1.json' | 'front-diagonals-authoring-v4.json' | 'front-diagonals-authoring-v5.json';
}

/** Offline review only: no runtime catalog, publication, recolouring or inferred rig. */
export async function prepareHairReview(options: HairReviewOptions) {
  const sourceDirectory = await realpath(options.sourceDirectory), referenceDirectory = await realpath(options.referenceDirectory);
  const outputDirectory = resolve(options.outputDirectory);
  if (nested(sourceDirectory, outputDirectory) || nested(outputDirectory, sourceDirectory) || nested(referenceDirectory, outputDirectory) || nested(outputDirectory, referenceDirectory)) throw new Error('Hair staging and source/reference paths must be disjoint.');
  // Every existing ancestor must be real: staging cannot redirect into source art.
  let ancestor = outputDirectory;
  while (true) {
    try { if ((await realpath(ancestor)) !== ancestor) throw new Error('Staging path must not traverse symlinks.'); break; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; ancestor = resolve(ancestor, '..'); }
  }
  const configPath = resolve(sourceDirectory, options.configFilename ?? 'authoring-v1.json');
  const configBytes = await readFile(configPath);
  const draft = hairReviewSchema.parse(JSON.parse(configBytes.toString('utf8')));
  const inputs = new Map<string, string>([[configPath, sha256(configBytes)]]);
  const load = async (directory: string, source: string, expectedHash: string) => {
    const path = resolve(directory, source);
    // Reject symlinked files AND symlinked parent folders before reading.
    if ((await realpath(path)) !== path || !(await lstat(path)).isFile()) throw new Error(`${source}: expected an ordinary source file without symlinks.`);
    const bytes = await readFile(path);
    if (sha256(bytes) !== expectedHash) throw new Error(`${source}: authoring/source hash changed; create a reviewed new version.`);
    inputs.set(path, expectedHash);
    const image = decodePng(bytes);
    if (image.width !== 1024 || image.height !== 1536) throw new Error(`${source}: expected native 1024 × 1536; no resampling is allowed.`);
    return image;
  };
  const normalize = (image: RgbaImage) => {
    let noisePixelsCleared = 0;
    for (let i = 3; i < image.data.length; i += 4) if (image.data[i]! < draft.minimumVisibleAlpha) {
      if (image.data[i]) noisePixelsCleared++;
      image.data.fill(0, i - 3, i + 1);
    }
    return noisePixelsCleared;
  };
  const pending: { path: string; image: RgbaImage }[] = [];
  const measurements: { direction: Direction; part: 'rear' | 'front'; sourceSha256: string; outputSha256: string; bounds: ReturnType<typeof characterBounds>; alpha: ReturnType<typeof alphaStatistics>; sourceAlpha: ReturnType<typeof alphaStatistics>; noisePixelsCleared: number; greenCandidates: number; plane: string; position: { x: number; y: number } }[] = [];
  const comparisons: RgbaImage[] = [];
  const hairOnlyComparisons: RgbaImage[] = [];
  const fixtureMeasurements: { direction: Direction; purpose: 'review-only-head-neck'; anatomyApproved: false; bounds: ReturnType<typeof characterBounds>; outputSha256: string; sourceSha256?: string; position: { x: number; y: number } }[] = [];
  const designMasterMeasurements: { direction: Direction; sourceSha256: string; outputSha256: string; bounds: ReturnType<typeof characterBounds> }[] = [];
  const restoredReferenceHairMeasurements: { direction: Direction; maskSha256: string; pixelCount: number }[] = [];
  const rearCompletionMeasurements: { direction: Direction; baselineSha256: string; artworkSha256: string; maskSha256: string; pixelCount: number; addedPixels: number; changedPixels: number; repairedReferencePixels: number }[] = [];
  const frames = Object.entries(draft.frames).map(([direction, frame]) => ({ direction: direction as Direction, frame }));
  for (const { direction, frame } of frames) {
    const reference = await load(referenceDirectory, frame.reference, frame.referenceSha256);
    const layers = new Map<'hair-rear' | 'hair-front' | 'head', RgbaImage>();
    for (const [part, artwork] of [['rear', frame.rear], ...(frame.front.visibility === 'visible' ? [['front', frame.front.artwork] as const] : []), ...(frame.fitHead ? [['head', frame.fitHead.artwork] as const] : [])] as const) {
      const image = await load(sourceDirectory, artwork.source, artwork.sourceSha256);
      const sourceAlpha = alphaStatistics(image);
      // Built-in authoring outputs may contain near-zero alpha speckles far from hair.
      // Preserve raw source PNGs, and record this versioned <8/255 cleanup explicitly.
      const noisePixelsCleared = normalize(image);
      const bounds = characterBounds(image);
      const alpha = alphaStatistics(image), allowed = artwork.allowedBounds;
      if (!bounds || !alpha.transparent) throw new Error(`${direction}-${part}: needs isolated visible hair and genuine transparency.`);
      if (bounds.x < allowed.x || bounds.y < allowed.y || bounds.x + bounds.width > allowed.x + allowed.width || bounds.y + bounds.height > allowed.y + allowed.height) throw new Error(`${direction}-${part}: artwork exceeds the declared authoring envelope; inspect scale/position, never silently resize.`);
      let greenCandidates = 0;
      for (let p = 0; p < image.width * image.height; p++) {
        const i = p * 4;
        if (!image.data[i + 3]) image.data.fill(0, i, i + 4); // Normalize invisible RGB only.
        else {
          if (p % 1024 < 180 && Math.floor(p / 1024) < 110) throw new Error(`${direction}-${part}: visible artwork in label margin.`);
          if (image.data[i + 1]! - Math.max(image.data[i]!, image.data[i + 2]!) > 20) greenCandidates++;
        }
      }
      const plane = part === 'rear' ? 'hair-rear' : part === 'front' ? 'hair-front' : 'head';
      layers.set(plane, image);
      if (part === 'head') {
        fixtureMeasurements.push({ direction, purpose: 'review-only-head-neck', anatomyApproved: false, sourceSha256: artwork.sourceSha256, outputSha256: sha256(encodePng(image)), bounds, position: { x: 0, y: 0 } });
        pending.push({ path: `fixtures/${direction}-head-neck-fixture.png`, image }, { path: `inspection/checker/${direction}-head-neck-fixture.png`, image: fitDraftLabel(checkerPreview(image, direction)) }, { path: `inspection/green/${direction}-head-neck-fixture.png`, image: fitDraftLabel(decorateExport(image, direction)) });
      } else {
        measurements.push({ direction, part, sourceSha256: artwork.sourceSha256, outputSha256: sha256(encodePng(image)), bounds, alpha, sourceAlpha, noisePixelsCleared, greenCandidates, plane, position: { x: 0, y: 0 } });
        pending.push({ path: `layers/${direction}-${part}.png`, image }, { path: `inspection/checker/${direction}-${part}.png`, image: checkerPreview(image, direction) }, { path: `inspection/green/${direction}-${part}.png`, image: decorateExport(image, direction) });
      }
    }
    const assembled = blankImage(1024, 1536);
    // Follow core's actual facing-specific plane order even for detached hair review.
    for (const plane of DIRECTION_PLANE_ORDER[direction]) {
      const image = plane === 'hair-rear' || plane === 'hair-front' ? layers.get(plane) : undefined;
      if (image) drawRgba(assembled, image, 0, 0);
    }
    pending.push({ path: `assembled/${direction}.png`, image: assembled }, { path: `inspection/checker/${direction}-assembled.png`, image: checkerPreview(assembled, direction) }, { path: `inspection/green/${direction}-assembled.png`, image: decorateExport(assembled, direction) });
    const comparison = blankImage(2048, 1536);
    drawRgba(comparison, checkerPreview(reference, direction), 0, 0);
    drawRgba(comparison, checkerPreview(assembled, direction), 1024, 0);
    pending.push({ path: `inspection/comparison/${direction}.png`, image: comparison });
    hairOnlyComparisons.push(comparison);
    if (frame.fitFixture || frame.fitHead) {
      if (frame.fitFixture) {
        const fixture = headNeckFixture(frame.fitFixture);
        layers.set('head', fixture);
        fixtureMeasurements.push({ direction, purpose: frame.fitFixture.purpose, anatomyApproved: false, bounds: characterBounds(fixture), outputSha256: sha256(encodePng(fixture)), position: { x: 0, y: 0 } });
        pending.push({ path: `fixtures/${direction}-head-neck-fixture.png`, image: fixture }, { path: `inspection/checker/${direction}-head-neck-fixture.png`, image: fitDraftLabel(checkerPreview(fixture, direction)) }, { path: `inspection/green/${direction}-head-neck-fixture.png`, image: fitDraftLabel(decorateExport(fixture, direction)) });
      }
      const fit = blankImage(1024, 1536);
      for (const plane of DIRECTION_PLANE_ORDER[direction]) {
        const image = plane === 'hair-rear' || plane === 'hair-front' || plane === 'head' ? layers.get(plane) : undefined;
        if (image) drawRgba(fit, image, 0, 0);
      }
      const checker = fitDraftLabel(checkerPreview(fit, direction));
      const fitComparison = blankImage(2048, 1536);
      drawRgba(fitComparison, checkerPreview(reference, direction), 0, 0);
      drawRgba(fitComparison, checker, 1024, 0);
      pending.push({ path: `fit/${direction}.png`, image: fit }, { path: `inspection/checker/${direction}-fit.png`, image: checker }, { path: `inspection/green/${direction}-fit.png`, image: fitDraftLabel(decorateExport(fit, direction)) }, { path: `inspection/fit-comparison/${direction}.png`, image: fitComparison });
      if (frame.designMaster) {
        const master = await load(sourceDirectory, frame.designMaster.source, frame.designMaster.sourceSha256);
        normalize(master);
        const bounds = characterBounds(master), allowed = frame.designMaster.allowedBounds;
        if (!bounds || !alphaStatistics(master).transparent || bounds.x < allowed.x || bounds.y < allowed.y || bounds.x + bounds.width > allowed.x + allowed.width || bounds.y + bounds.height > allowed.y + allowed.height) throw new Error(`${direction}: whole-facing master exceeds its native authoring envelope.`);
        let baselineRear = layers.get('hair-rear')!, completionMask: RgbaImage | undefined;
        if (frame.rearCompletion) {
          const completion = frame.rearCompletion;
          baselineRear = await load(sourceDirectory, completion.base.source, completion.base.sourceSha256);
          normalize(baselineRear);
          const artwork = await load(sourceDirectory, completion.artwork.source, completion.artwork.sourceSha256);
          normalize(artwork);
          completionMask = await load(sourceDirectory, completion.selection.source, completion.selection.sourceSha256);
          const selected = blankImage(1024, 1536), rear = layers.get('hair-rear')!;
          let pixelCount = 0, addedPixels = 0, changedPixels = 0;
          for (let i = 0; i < rear.data.length; i += 4) {
            const owned = completionMask.data[i + 3] === 255;
            if (completionMask.data.subarray(i, i + 4).some((value) => value !== (owned ? 255 : 0))) throw new Error(`${direction}: completion mask must be binary RGBA.`);
            const expected = owned ? artwork : baselineRear;
            if (rear.data.subarray(i, i + 4).some((value, channel) => value !== expected.data[i + channel])) throw new Error(`${direction}: rear completion changed pixels outside its selection or differs from its own authored pixels.`);
            if (owned) {
              if (artwork.data[i + 3]! < draft.minimumVisibleAlpha) throw new Error(`${direction}: rear completion cannot erase existing hair or select transparent backdrop.`);
              selected.data.set(artwork.data.subarray(i, i + 4), i);
              pixelCount++;
              if (baselineRear.data[i + 3]) changedPixels++;
              else addedPixels++;
            }
          }
          if (pixelCount !== completion.pixelCount || addedPixels !== completion.addedPixels || changedPixels !== completion.changedPixels) throw new Error(`${direction}: rear completion coverage or repair counts changed.`);
          rearCompletionMeasurements.push({ direction, baselineSha256: completion.base.sourceSha256, artworkSha256: completion.artwork.sourceSha256, maskSha256: completion.selection.sourceSha256, pixelCount, addedPixels, changedPixels, repairedReferencePixels: 0 });
          pending.push({ path: `completion/${direction}-selected-hair.png`, image: selected }, { path: `inspection/checker/${direction}-selected-completion.png`, image: checkerPreview(selected, direction) });
        }
        if (frame.restoredReferenceHair) {
          const mask = await load(sourceDirectory, frame.restoredReferenceHair.source, frame.restoredReferenceHair.sourceSha256);
          const restored = blankImage(1024, 1536), rear = layers.get('hair-rear')!;
          let pixelCount = 0;
          for (let i = 0; i < mask.data.length; i += 4) {
            const owned = mask.data[i + 3] === 255;
            if (mask.data.subarray(i, i + 4).some((value) => value !== (owned ? 255 : 0))) throw new Error(`${direction}: restoration mask must be binary RGBA.`);
            if (!owned) continue;
            const repaired = completionMask?.data[i + 3] === 255;
            if (reference.data[i + 3]! < draft.minimumVisibleAlpha || master.data.subarray(i, i + 4).some((value, channel) => value !== reference.data[i + channel]) || baselineRear.data.subarray(i, i + 4).some((value, channel) => value !== reference.data[i + channel]) || (repaired ? rear.data[i + 3]! < draft.minimumVisibleAlpha : rear.data.subarray(i, i + 4).some((value, channel) => value !== reference.data[i + channel]))) throw new Error(`${direction}: restored reference hair is missing or altered.`);
            if (repaired) rearCompletionMeasurements.at(-1)!.repairedReferencePixels++;
            restored.data.set(reference.data.subarray(i, i + 4), i);
            pixelCount++;
          }
          if (pixelCount !== frame.restoredReferenceHair.pixelCount) throw new Error(`${direction}: restored reference hair coverage changed.`);
          restoredReferenceHairMeasurements.push({ direction, maskSha256: frame.restoredReferenceHair.sourceSha256, pixelCount });
          pending.push({ path: `restored/${direction}-reference-hair.png`, image: restored }, { path: `inspection/checker/${direction}-restored-reference-hair.png`, image: checkerPreview(restored, direction) });
        }
        if (frame.partitionMasks) {
          const parts = ['rear', 'front', 'head'] as const;
          const masks = await Promise.all(parts.map((part) => load(sourceDirectory, frame.partitionMasks![part].source, frame.partitionMasks![part].sourceSha256)));
          for (let i = 0; i < master.data.length; i += 4) {
            let owners = 0;
            for (const [index, part] of parts.entries()) {
              const mask = masks[index]!, owned = mask.data[i + 3] === 255;
              if (owned) owners++;
              if (mask.data.subarray(i, i + 4).some((value) => value !== (owned ? 255 : 0))) throw new Error(`${direction}: partition masks must be binary RGBA.`);
              const image = part === 'rear' ? baselineRear : layers.get(part === 'head' ? 'head' : 'hair-front')!;
              if (image.data.subarray(i, i + 4).some((value, channel) => value !== (owned ? master.data[i + channel] : 0))) throw new Error(`${direction}: masked layers must preserve their own master pixels exactly.`);
            }
            if (owners !== (master.data[i + 3] ? 1 : 0)) throw new Error(`${direction}: master partition has overlapping or missing pixels.`);
          }
          const reconstruction = blankImage(1024, 1536);
          for (const image of [baselineRear, layers.get('head')!, layers.get('hair-front')!]) drawRgba(reconstruction, image, 0, 0);
          if (sha256(reconstruction.data) !== sha256(master.data)) throw new Error(`${direction}: masked reconstruction differs from the whole-facing master.`);
        }
        designMasterMeasurements.push({ direction, sourceSha256: frame.designMaster.sourceSha256, outputSha256: sha256(encodePng(master)), bounds });
        const masterComparison = blankImage(3072, 1536);
        drawRgba(masterComparison, checkerPreview(reference, direction), 0, 0);
        drawRgba(masterComparison, fitDraftLabel(checkerPreview(master, direction)), 1024, 0);
        drawRgba(masterComparison, checker, 2048, 0);
        pending.push({ path: `masters/${direction}.png`, image: master }, { path: `inspection/checker/${direction}-master.png`, image: fitDraftLabel(checkerPreview(master, direction)) }, { path: `inspection/green/${direction}-master.png`, image: fitDraftLabel(decorateExport(master, direction)) }, { path: `inspection/master-comparison/${direction}.png`, image: masterComparison });
        comparisons.push(masterComparison);
      } else comparisons.push(fitComparison);
    } else comparisons.push(comparison);
  }
  const contact = blankImage((draft.reviewRevision ?? 0) >= 3 ? 3072 : 2048, 3072);
  comparisons.forEach((image, index) => drawRgba(contact, image, 0, index * 1536));
  pending.push({ path: 'overview.png', image: overview(contact) });
  if (fixtureMeasurements.length) {
    const hairOnlyContact = blankImage(2048, 3072);
    hairOnlyComparisons.forEach((image, index) => drawRgba(hairOnlyContact, image, 0, index * 1536));
    pending.push({ path: 'hair-only-overview.png', image: overview(hairOnlyContact) });
  }
  const report = {
    schemaVersion: 1, id: draft.id, assetVersion: draft.assetVersion, status: draft.status,
    target: draft.target, sourcePose: draft.sourcePose, intendedRuntimePose: draft.intendedRuntimePose,
    authoringMethod: draft.authoringMethod, configSha256: sha256(configBytes),
    minimumVisibleAlpha: draft.minimumVisibleAlpha,
    knownReviewIssues: draft.knownReviewIssues,
    modularDraft: true, published: false, paletteReady: false, rigCompatibility: 'unverified',
    supportedReviewDirections: frames.map(({ direction }) => direction), missingDirections: DIRECTIONS.filter((d) => !frames.some(({ direction }) => d === direction)),
    hiddenLayers: frames.filter(({ frame }) => frame.front.visibility === 'hidden').map(({ direction, frame }) => ({ direction, part: 'front', reason: frame.front.visibility === 'hidden' ? frame.front.reason : '' })),
    measurements,
    ...(draft.reviewRevision ? { reviewRevision: draft.reviewRevision, overviewContent: draft.reviewRevision === 5 ? 'reference / approved-visible-master / candidate-rear+review-head+front-hair' : (draft.reviewRevision ?? 0) >= 3 ? 'reference / whole-facing-master / rear-hair+review-head+front-hair' : 'rear-hair/head-neck-review-fixture/front-hair', fixtureAnatomyApproved: false, fixtureMeasurements } : {}),
    ...((draft.reviewRevision ?? 0) >= 3 ? { designMasterMeasurements, syntheticFitGuides: false, masterReconstruction: draft.reviewRevision === 5 ? 'exact-baseline-partition-plus-masked-rear-completion' : 'exact-visible-rgba-partition', hiddenRootCompletion: draft.reviewRevision === 5 ? 'authored-needs-human-review' : 'pending', reviewHeadCompleteness: 'visible-study-pixels-only' } : {}),
    ...((draft.reviewRevision ?? 0) >= 4 ? { restoredReferenceHairMeasurements } : {}),
    ...(draft.reviewRevision === 5 ? { rearCompletionMeasurements } : {}),
    outputs: pending.map(({ path, image }) => ({ path, sha256: sha256(encodePng(image)) })),
    reviewRequired: ['Visible hair silhouette, curls and source identity', 'No skin, eyes, clothing, glow or painted background in hair layers', 'Newly authored occluded hair surfaces and front/rear junction', 'Candidate head attachments; actual rig/body/T-pose compatibility remains unverified', 'Pair design approval before further authoring; Step 6C approval before 6D'],
  };
  // Validate ALL inputs before writing, and never overwrite a symlinked output.
  for (const { path, image } of pending) {
    const destination = resolve(outputDirectory, path);
    let parent = destination;
    while (nested(outputDirectory, parent)) {
      try { if ((await lstat(parent)).isSymbolicLink()) throw new Error('Staging symlinks are forbidden.'); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      if (parent === outputDirectory) break; parent = resolve(parent, '..');
    }
    await mkdir(resolve(destination, '..'), { recursive: true });
    await writeFile(destination, encodePng(image));
  }
  for (const [path, hash] of inputs) if (sha256(await readFile(path)) !== hash) throw new Error('Authoring/reference input changed during review generation.');
  const reportPath = resolve(outputDirectory, 'metadata.json');
  try { if ((await lstat(reportPath)).isSymbolicLink()) throw new Error('Staging metadata symlinks are forbidden.'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  return report;
}
