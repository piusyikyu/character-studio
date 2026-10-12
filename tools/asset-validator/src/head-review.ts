import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { DIRECTIONS, DIRECTION_PLANE_ORDER, directionSchema } from '@character-studio/core';
import type { Direction, RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, decorateExport, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { alphaStatistics, characterBounds } from './audit';
import { checkerPreview, fitDraftLabel, overview } from './inspection';
import { headBackDiagonalsReviewSchema, headFrontDiagonalsRepairSchema, headFrontDiagonalsReviewSchema, headProfilesReviewSchema, headReviewSchema } from './head-review-schema';
import type { HeadReviewFrame } from './head-review-schema';
import { hairReviewSchema } from './hair-review-schema';
import type { HairReviewFrame } from './hair-review-schema';
import { inspectHeadFitRepair } from './head-fit-repair';
import { inspectCoherentHeadFit, inspectProfileHeadFit } from './head-coherent-fit';
import { inspectProfileEarRepair } from './head-profile-ear-repair';
import { inspectDiagonalHeadRepair } from './head-diagonal-fit-repair';
import { sha256 } from './reference-import';

const nested = (parent: string, child: string) => { const p = relative(parent, child); return p === '' || (!p.startsWith('..') && !isAbsolute(p)); };
const approvalSchema = z.object({ configSha256: z.string(), layers: z.array(z.object({ direction: directionSchema, part: z.enum(['rear', 'front']), sourceSha256: z.string(), cleanedSha256: z.string() })) });
export interface HeadReviewOptions {
  readonly sourceDirectory: string;
  readonly hairDirectory: string;
  readonly referenceDirectory: string;
  readonly outputDirectory: string;
  readonly configSource?: 'authoring-v1.json' | 'authoring-v2.json' | 'authoring-v3.json' | 'authoring-v4.json' | 'authoring-v5.json' | 'profiles-authoring-v1.json' | 'profiles-authoring-v2.json' | 'profiles-authoring-v3.json' | 'front-diagonals-authoring-v1.json' | 'front-diagonals-authoring-v2.json' | 'front-diagonals-authoring-v3.json' | 'front-diagonals-authoring-v4.json' | 'back-diagonals-authoring-v1.json';
}

/** Authored anatomy review only; preserves approved hair and does not publish a catalog. */
export async function prepareHeadReview(options: HeadReviewOptions) {
  const [sourceDirectory, hairDirectory, referenceDirectory] = await Promise.all([realpath(options.sourceDirectory), realpath(options.hairDirectory), realpath(options.referenceDirectory)]);
  const outputDirectory = resolve(options.outputDirectory);
  for (const input of [sourceDirectory, hairDirectory, referenceDirectory]) if (nested(input, outputDirectory) || nested(outputDirectory, input)) throw new Error('Anatomy staging and all source/reference paths must be disjoint.');
  let ancestor = outputDirectory;
  while (true) {
    try { if (await realpath(ancestor) !== ancestor) throw new Error('Anatomy staging cannot traverse symlinks.'); break; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; ancestor = resolve(ancestor, '..'); }
  }
  const inputs = new Map<string, string>();
  const read = async (directory: string, source: string, expectedHash?: string) => {
    const path = resolve(directory, source);
    if (!nested(directory, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error(`${source}: expected an ordinary source file without symlinks.`);
    const bytes = await readFile(path), hash = sha256(bytes);
    if (expectedHash && expectedHash !== hash) throw new Error(`${source}: source hash changed; create a reviewed new version.`);
    inputs.set(path, hash); return bytes;
  };
  const configSource = options.configSource ?? 'authoring-v1.json';
  if (!['authoring-v1.json', 'authoring-v2.json', 'authoring-v3.json', 'authoring-v4.json', 'authoring-v5.json', 'profiles-authoring-v1.json', 'profiles-authoring-v2.json', 'profiles-authoring-v3.json', 'front-diagonals-authoring-v1.json', 'front-diagonals-authoring-v2.json', 'front-diagonals-authoring-v3.json', 'front-diagonals-authoring-v4.json', 'back-diagonals-authoring-v1.json'].includes(configSource)) throw new Error('Unsupported anatomy review configuration.');
  const configBytes = await read(sourceDirectory, configSource);
  const profileDraft = configSource.startsWith('profiles-') ? headProfilesReviewSchema.parse(JSON.parse(configBytes.toString('utf8'))) : undefined;
  const diagonalDraft = configSource === 'front-diagonals-authoring-v1.json' ? headFrontDiagonalsReviewSchema.parse(JSON.parse(configBytes.toString('utf8'))) : undefined;
  const diagonalRepairDraft = (configSource === 'front-diagonals-authoring-v2.json' || configSource === 'front-diagonals-authoring-v3.json' || configSource === 'front-diagonals-authoring-v4.json') ? headFrontDiagonalsRepairSchema.parse(JSON.parse(configBytes.toString('utf8'))) : undefined;
  const backDraft = configSource === 'back-diagonals-authoring-v1.json' ? headBackDiagonalsReviewSchema.parse(JSON.parse(configBytes.toString('utf8'))) : undefined;
  const frontBackDraft = profileDraft || diagonalDraft || diagonalRepairDraft || backDraft ? undefined : headReviewSchema.parse(JSON.parse(configBytes.toString('utf8')));
  const draft = frontBackDraft ?? profileDraft ?? diagonalDraft ?? diagonalRepairDraft ?? backDraft!;
  const reviewDirections = frontBackDraft ? ['S', 'N'] as const : profileDraft ? ['E', 'W'] as const : backDraft ? ['NE', 'NW'] as const : ['SE', 'SW'] as const;
  const hairBytes = await read(hairDirectory, draft.hairConfig.source, draft.hairConfig.sourceSha256);
  const hair = hairReviewSchema.parse(JSON.parse(hairBytes.toString('utf8')));
  if (reviewDirections.some((direction) => !(direction in hair.frames))) throw new Error(`Head ${reviewDirections.join('/')} review needs its approved hair pair.`);
  const frames: Partial<Record<Direction, HeadReviewFrame>> = draft.frames;
  const hairFrames: Partial<Record<Direction, HairReviewFrame>> = hair.frames;
  if (backDraft && reviewDirections.some((direction) => hairFrames[direction]!.front.visibility !== 'hidden')) throw new Error('NE/NW posterior anatomy requires explicitly hidden frontal fringe; no front-facing fallback.');
  const approval = approvalSchema.parse(JSON.parse((await read(hairDirectory, draft.hairApproval.source, draft.hairApproval.sourceSha256)).toString('utf8')));
  if (approval.configSha256 !== sha256(hairBytes)) throw new Error('Hair configuration does not match its design approval.');
  const load = async (directory: string, source: string, hash: string) => {
    const image = decodePng(await read(directory, source, hash));
    if (image.width !== 1024 || image.height !== 1536) throw new Error(`${source}: expected native 1024 × 1536; no resampling is allowed.`);
    return image;
  };
  const normalize = (image: RgbaImage) => {
    let cleared = 0;
    for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < draft.minimumVisibleAlpha) { if (image.data[i + 3]) cleared++; image.data.fill(0, i, i + 4); }
    return cleared;
  };
  const pending: { path: string; image: RgbaImage }[] = [];
  const measurements: { direction: Direction; part: 'head' | 'neck'; sourceSha256: string; outputSha256: string; pixelCount: number; bounds: ReturnType<typeof characterBounds>; origin: { x: number; y: number }; position: { x: number; y: number }; greenCandidates: number }[] = [];
  const masters: { direction: Direction; sourceSha256: string; cleanedSha256: string; noisePixelsCleared: number; bounds: ReturnType<typeof characterBounds> }[] = [];
  const hairMeasurements: { direction: Direction; part: 'rear' | 'front'; sourceSha256: string; cleanedSha256: string }[] = [];
  const fitMeasurements: { direction: Direction; headPixelsOverlappedByHair: number; headPixelsWithoutHairOverlap: number; outputSha256: string }[] = [];
  let fringeFitMeasurement: { sourceSha256: string; cleanedSha256: string; pixelCount: number; rearSourceSha256: string; rearCleanedSha256: string; rearPixelCount: number; facialLandmarks: { name: string; position: { x: number; y: number }; hairAlpha: number }[] } | undefined;
  let seamRepairMeasurement: Awaited<ReturnType<typeof inspectHeadFitRepair>>['measurement'] | undefined;
  let coherentFitMeasurement: Awaited<ReturnType<typeof inspectCoherentHeadFit>>['measurement'] | undefined;
  const profileFitMeasurements: ({ direction: 'E' | 'W' } & Awaited<ReturnType<typeof inspectProfileHeadFit>>['measurement'])[] = [];
  const profileEarMeasurements: Awaited<ReturnType<typeof inspectProfileEarRepair>>['measurement'][] = [];
  const diagonalRepairMeasurements: Awaited<ReturnType<typeof inspectDiagonalHeadRepair>>['measurement'][] = [];
  const closeups = blankImage(1152, 880), fullContact = blankImage(3072, 3072);
  const crop = (image: RgbaImage) => {
    const result = blankImage(384, 440);
    for (let y = 0; y < 440; y++) result.data.set(image.data.subarray(((y + 40) * 1024 + 320) * 4, ((y + 40) * 1024 + 704) * 4), y * 384 * 4);
    return result;
  };
  for (const [row, direction] of reviewDirections.entries()) {
    const frame = frames[direction]!, hairFrame = hairFrames[direction]!;
    if (frame.reference !== hairFrame.reference || frame.referenceSha256 !== hairFrame.referenceSha256 || frame.candidateHeadAnchor.x !== hairFrame.candidateHeadAnchor.x || frame.candidateHeadAnchor.y !== hairFrame.candidateHeadAnchor.y) throw new Error(`${direction}: reference/head anchor must match the accepted hair study.`);
    const reference = await load(referenceDirectory, frame.reference, frame.referenceSha256);
    let baselineFit: RgbaImage | undefined;
    await load(sourceDirectory, frame.guide.source, frame.guide.sourceSha256);
    const master = await load(sourceDirectory, frame.master.source, frame.master.sourceSha256);
    const noisePixelsCleared = normalize(master), bounds = characterBounds(master), allowed = frame.allowedBounds;
    const diagonalRepair = (direction === 'SE' || direction === 'SW') && diagonalRepairDraft ? await inspectDiagonalHeadRepair(diagonalRepairDraft, direction, hairFrame, sourceDirectory, hairDirectory, read, load, master) : undefined;
    if ((direction === 'SE' || direction === 'SW') && diagonalDraft) {
      const ownership = diagonalDraft.nativeEarOwnership.frames[direction];
      const study = await load(sourceDirectory, ownership.study.source, ownership.study.sourceSha256);
      const mask = await load(sourceDirectory, ownership.selection.source, ownership.selection.sourceSha256);
      const repair = await load(sourceDirectory, ownership.repairStudy.source, ownership.repairStudy.sourceSha256);
      const repairMask = await load(sourceDirectory, ownership.repairSelection.source, ownership.repairSelection.sourceSha256);
      if (!hairFrame.designMaster) throw new Error(`${direction}: visible-ear ownership requires the same-facing approved study.`);
      const baseline = await load(hairDirectory, hairFrame.designMaster.source, hairFrame.designMaster.sourceSha256);
      normalize(study); normalize(repair); let selectedCount = 0;
      for (let i = 0; i < master.data.length; i += 4) {
        const x = i / 4 % 1024 + 0.5, y = Math.floor(i / 4 / 1024) + 0.5;
        let inside = false;
        for (let a = 0, b = ownership.region.length - 1; a < ownership.region.length; b = a++) {
          const [xa, ya] = ownership.region[a]!, [xb, yb] = ownership.region[b]!;
          if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) inside = !inside;
        }
        const selected = inside && baseline.data[i + 3]! >= 8 && baseline.data[i]! - baseline.data[i + 2]! > 18;
        if (mask.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0))) throw new Error(`${direction}: visible-ear mask differs from its manual region.`);
        let repaired = false;
        for (let a = 0, b = ownership.repairRegion.length - 1; a < ownership.repairRegion.length; b = a++) {
          const [xa, ya] = ownership.repairRegion[a]!, [xb, yb] = ownership.repairRegion[b]!;
          if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) repaired = !repaired;
        }
        if (repairMask.data.subarray(i, i + 4).some((v) => v !== (repaired ? 255 : 0))) throw new Error(`${direction}: ear repair mask differs from its manual region.`);
        const expected = selected ? baseline : repaired ? repair : study;
        if (master.data.subarray(i, i + 4).some((v, c) => v !== expected.data[i + c])) throw new Error(`${direction}: native skin/ear ownership changed outside its selected study pixels.`);
        if (selected) selectedCount++;
      }
      if (selectedCount !== ownership.pixelCount) throw new Error(`${direction}: visible-ear ownership count changed.`);
      pending.push({ path: `masks/${direction}-visible-ear.png`, image: mask }, { path: `masks/${direction}-ear-repair.png`, image: repairMask });
    }
    if (!bounds || !alphaStatistics(master).transparent || bounds.x < allowed.x || bounds.y < allowed.y || bounds.x + bounds.width > allowed.x + allowed.width || bounds.y + bounds.height > allowed.y + allowed.height) throw new Error(`${direction}: anatomy exceeds the native authoring envelope; inspect placement, never resize.`);
    masters.push({ direction, sourceSha256: frame.master.sourceSha256, cleanedSha256: sha256(encodePng(master)), noisePixelsCleared, bounds });
    if ((direction === 'E' || direction === 'W') && profileDraft?.earRepair) {
      const repaired = await inspectProfileEarRepair(profileDraft, direction, sourceDirectory, read, load, master, reference);
      profileEarMeasurements.push(repaired.measurement);
      pending.push({ path: `masks/${direction}-ear-repair.png`, image: repaired.mask }, { path: `masks/${direction}-reference-ear.png`, image: repaired.referenceMask });
      // Compare the actual rejected v2 fit, using its old anatomy and old ownership.
      baselineFit = blankImage(1024, 1536);
      const priorFrame = repaired.baseline.frames[direction], priorHair = repaired.baseline.profileFit!.frames[direction];
      const previousLayers = new Map<RenderPlane, RgbaImage>();
      for (const [plane, input] of [['hair-rear', priorHair.rear], ['neck', priorFrame.neck], ['head', priorFrame.head], ['hair-front', priorHair.front]] as const) {
        const image = await load(sourceDirectory, input.source, input.sourceSha256); normalize(image); previousLayers.set(plane, image);
      }
      for (const plane of DIRECTION_PLANE_ORDER[direction]) { const image = previousLayers.get(plane); if (image) drawRgba(baselineFit, image, 0, 0); }
    }
    const layers = new Map<RenderPlane, RgbaImage>();
    for (const part of ['head', 'neck'] as const) {
      const artwork = frame[part], image = await load(sourceDirectory, artwork.source, artwork.sourceSha256), mask = await load(sourceDirectory, artwork.selection.source, artwork.selection.sourceSha256);
      normalize(image); layers.set(part, image);
      let pixelCount = 0, greenCandidates = 0;
      for (let i = 0; i < image.data.length; i += 4) {
        const owned = mask.data[i + 3] === 255;
        if (mask.data.subarray(i, i + 4).some((v) => v !== (owned ? 255 : 0))) throw new Error(`${direction}: anatomy masks must be binary RGBA.`);
        const shouldOwn = master.data[i + 3]! >= 8 && (Math.floor(i / 4 / 1024) < frame.cutY) === (part === 'head');
        if (owned !== shouldOwn || image.data.subarray(i, i + 4).some((v, c) => v !== (owned ? master.data[i + c] : 0))) throw new Error(`${direction}: head/neck partition must preserve its own master pixels exactly.`);
        if (owned) { pixelCount++; if (image.data[i + 1]! - Math.max(image.data[i]!, image.data[i + 2]!) > 20) greenCandidates++; }
      }
      if (pixelCount !== artwork.pixelCount || !pixelCount) throw new Error(`${direction}-${part}: anatomy partition coverage changed.`);
      measurements.push({ direction, part, sourceSha256: artwork.sourceSha256, outputSha256: sha256(encodePng(image)), pixelCount, bounds: characterBounds(image), origin: artwork.origin, position: { x: 0, y: 0 }, greenCandidates });
      pending.push({ path: `layers/${direction}-${part}.png`, image }, { path: `inspection/checker/${direction}-${part}.png`, image: checkerPreview(image, direction) }, { path: `masks/${direction}-${part}.png`, image: mask });
    }
    const reconstructed = blankImage(1024, 1536);
    drawRgba(reconstructed, layers.get('neck')!, 0, 0); drawRgba(reconstructed, layers.get('head')!, 0, 0);
    if (sha256(reconstructed.data) !== sha256(master.data)) throw new Error(`${direction}: reconstructed anatomy differs from its master.`);
    for (const [part, artwork] of [['rear', hairFrame.rear], ...(hairFrame.front.visibility === 'visible' ? [['front', hairFrame.front.artwork] as const] : [])] as const) {
      const image = await load(hairDirectory, artwork.source, artwork.sourceSha256); normalize(image);
      const approved = approval.layers.find((a) => a.direction === direction && a.part === part), cleanedSha256 = sha256(encodePng(image));
      if (!approved || approved.sourceSha256 !== artwork.sourceSha256 || approved.cleanedSha256 !== cleanedSha256) throw new Error(`${direction}-${part}: hair source or cleaned artwork does not match design approval.`);
      layers.set(part === 'rear' ? 'hair-rear' : 'hair-front', image);
      hairMeasurements.push({ direction, part, sourceSha256: artwork.sourceSha256, cleanedSha256 });
    }
    if (diagonalRepair) {
      layers.set('hair-front', diagonalRepair.front); baselineFit = diagonalRepair.baselineFit;
      if (diagonalRepair.rear) { layers.set('hair-rear', diagonalRepair.rear); pending.push({ path: `layers/${direction}-rear-fit.png`, image: diagonalRepair.rear }); }
      diagonalRepairMeasurements.push(diagonalRepair.measurement);
      pending.push({ path: `layers/${direction}-front-fit.png`, image: diagonalRepair.front }, { path: `masks/${direction}-front-cleanup.png`, image: diagonalRepair.cleanupMask });
      for (const mask of diagonalRepair.masks) pending.push({ path: `masks/${direction}-${mask.name}.png`, image: mask.image });
    }
    if (direction === 'S' && frontBackDraft?.fringeFit) {
      const correction = frontBackDraft.fringeFit;
      const provenance = JSON.parse((await read(sourceDirectory, correction.provenance.source, correction.provenance.sourceSha256)).toString('utf8')) as { referenceSha256?: string; sourceSha256?: string; selectionSha256?: string };
      if (provenance.referenceSha256 !== frame.referenceSha256 || provenance.sourceSha256 !== correction.front.sourceSha256 || provenance.selectionSha256 !== correction.selection.sourceSha256) throw new Error('S fringe-fit provenance does not match its native sources.');
      const front = await load(sourceDirectory, correction.front.source, correction.front.sourceSha256), mask = await load(sourceDirectory, correction.selection.source, correction.selection.sourceSha256);
      let pixelCount = 0;
      for (let i = 0; i < front.data.length; i += 4) {
        const selected = mask.data[i + 3] === 255;
        if (mask.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0))) throw new Error('S fringe-fit mask must be binary RGBA.');
        if ((selected && reference.data[i + 3]! < 8) || front.data.subarray(i, i + 4).some((v, c) => v !== (selected ? reference.data[i + c] : 0))) throw new Error('S fringe-fit must preserve selected reference RGBA at native coordinates exactly.');
        if (selected) pixelCount++;
      }
      if (pixelCount !== correction.pixelCount) throw new Error('S fringe-fit mask coverage changed.');
      const rearProvenance = JSON.parse((await read(sourceDirectory, correction.rearProvenance.source, correction.rearProvenance.sourceSha256)).toString('utf8')) as { referenceSha256?: string; masterSha256?: string; sourceSha256?: string; selectionSha256?: string; referenceEnvelopeUntilY?: number; exclusions?: unknown };
      if (rearProvenance.referenceSha256 !== frame.referenceSha256 || rearProvenance.masterSha256 !== correction.rearMaster.sourceSha256 || rearProvenance.sourceSha256 !== correction.rear.sourceSha256 || rearProvenance.selectionSha256 !== correction.rearSelection.sourceSha256 || rearProvenance.referenceEnvelopeUntilY !== correction.referenceEnvelopeUntilY) throw new Error('S rear-fit provenance does not match its native sources.');
      if (JSON.stringify(rearProvenance.exclusions) !== JSON.stringify(correction.rearExclusions)) throw new Error('S rear-fit fragment exclusions differ from their provenance.');
      const rear = await load(sourceDirectory, correction.rear.source, correction.rear.sourceSha256), rearMaster = await load(sourceDirectory, correction.rearMaster.source, correction.rearMaster.sourceSha256), rearMask = await load(sourceDirectory, correction.rearSelection.source, correction.rearSelection.sourceSha256);
      let rearPixelCount = 0;
      for (let i = 0; i < rear.data.length; i += 4) {
        const y = Math.floor(i / 4 / 1024);
        const x = (i / 4) % 1024;
        const selected = rearMaster.data[i + 3]! >= 8 && (y >= correction.referenceEnvelopeUntilY || reference.data[i + 3]! >= 8) && !correction.rearExclusions.some((r) => x >= r.x && x < r.x + r.width && y >= r.y && y < r.y + r.height);
        if (rearMask.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0)) || rear.data.subarray(i, i + 4).some((v, c) => v !== (selected ? rearMaster.data[i + c] : 0))) throw new Error('S rear-fit must preserve its authored master inside the native reference envelope exactly.');
        if (selected) rearPixelCount++;
      }
      if (rearPixelCount !== correction.rearPixelCount) throw new Error('S rear-fit mask coverage changed.');
      const rearBounds = characterBounds(rear);
      if (!rearBounds || !alphaStatistics(rear).transparent || rearBounds.y + rearBounds.height > 1000) throw new Error('S rear-fit exceeds its upper-canvas hair envelope.');
      const facialLandmarks = correction.facialLandmarks.map(({ name, position }) => {
        const i = (position.y * 1024 + position.x) * 4;
        if (front.data[i + 3] !== 0 || !layers.get('head')!.data[i + 3]) throw new Error(`S fringe-fit obstructs or misses ${name}; inspect the native facial landmarks.`);
        return { name, position, hairAlpha: front.data[i + 3]! };
      });
      layers.set('hair-front', front);
      layers.set('hair-rear', rear);
      fringeFitMeasurement = { sourceSha256: correction.front.sourceSha256, cleanedSha256: sha256(encodePng(front)), pixelCount, rearSourceSha256: correction.rear.sourceSha256, rearCleanedSha256: sha256(encodePng(rear)), rearPixelCount, facialLandmarks };
      pending.push({ path: 'layers/S-front-fit.png', image: front }, { path: 'masks/S-front-fit.png', image: mask }, { path: 'inspection/checker/S-front-fit.png', image: checkerPreview(front, 'S') });
      pending.push({ path: 'layers/S-rear-fit.png', image: rear }, { path: 'masks/S-rear-fit.png', image: rearMask }, { path: 'inspection/checker/S-rear-fit.png', image: checkerPreview(rear, 'S') });
      if (frontBackDraft.seamRepair) {
        baselineFit = blankImage(1024, 1536);
        for (const plane of DIRECTION_PLANE_ORDER.S) { const image = layers.get(plane); if (image) drawRgba(baselineFit, image, 0, 0); }
        const repaired = await inspectHeadFitRepair(frontBackDraft, sourceDirectory, read, load, front, rear, layers.get('head')!, layers.get('neck')!, reference);
        layers.set('hair-front', repaired.front); layers.set('hair-rear', repaired.rear);
        seamRepairMeasurement = repaired.measurement;
        pending.push({ path: 'layers/S-front-repaired.png', image: repaired.front }, { path: 'layers/S-rear-repaired.png', image: repaired.rear }, { path: 'masks/S-seam-repair.png', image: repaired.mask }, { path: 'masks/S-left-ear-hair.png', image: repaired.earMask }, { path: 'masks/S-neck-hair.png', image: repaired.neckMask });
      }
    }
    if (direction === 'S' && frontBackDraft?.coherentFit) {
      const coherent = await inspectCoherentHeadFit(frontBackDraft, sourceDirectory, read, load, layers.get('head')!);
      layers.set('hair-front', coherent.front); layers.set('hair-rear', coherent.rear);
      coherentFitMeasurement = coherent.measurement;
      pending.push({ path: 'layers/S-front-coherent.png', image: coherent.front }, { path: 'layers/S-rear-coherent.png', image: coherent.rear }, { path: 'master/S-hair-coherent.png', image: coherent.master }, { path: 'masks/S-front-coherent.png', image: coherent.frontMask }, { path: 'masks/S-rear-coherent.png', image: coherent.rearMask });
      const partition = blankImage(1152, 440);
      for (const [column, image] of [coherent.front, coherent.rear, coherent.master].entries()) drawRgba(partition, checkerPreview(crop(image), 'S'), column * 384, 0);
      pending.push({ path: 'inspection/S-coherent-partition.png', image: partition });
    }
    if ((direction === 'E' || direction === 'W') && profileDraft?.profileFit) {
      if (!baselineFit) {
        baselineFit = blankImage(1024, 1536);
        for (const plane of DIRECTION_PLANE_ORDER[direction]) { const image = layers.get(plane); if (image) drawRgba(baselineFit, image, 0, 0); }
      }
      const coherent = await inspectProfileHeadFit(profileDraft, direction, sourceDirectory, read, load, layers.get('head')!);
      layers.set('hair-front', coherent.front); layers.set('hair-rear', coherent.rear);
      profileFitMeasurements.push({ direction, ...coherent.measurement });
      pending.push({ path: `layers/${direction}-front-coherent.png`, image: coherent.front }, { path: `layers/${direction}-rear-coherent.png`, image: coherent.rear }, { path: `master/${direction}-hair-coherent.png`, image: coherent.master }, { path: `masks/${direction}-front-coherent.png`, image: coherent.frontMask }, { path: `masks/${direction}-rear-coherent.png`, image: coherent.rearMask });
      const partition = blankImage(1152, 440);
      for (const [column, image] of [coherent.front, coherent.rear, coherent.master].entries()) drawRgba(partition, checkerPreview(crop(image), direction), column * 384, 0);
      pending.push({ path: `inspection/${direction}-coherent-partition.png`, image: partition });
    }
    const fit = blankImage(1024, 1536);
    for (const plane of DIRECTION_PLANE_ORDER[direction]) { const image = layers.get(plane); if (image) drawRgba(fit, image, 0, 0); }
    if ((direction === 'E' || direction === 'W') && profileDraft?.earRepair) {
      const input = profileDraft.earRepair.frames[direction].referenceSelection;
      const mask = await load(sourceDirectory, input.source, input.sourceSha256);
      for (let i = 0; i < mask.data.length; i += 4) if (mask.data[i + 3] === 255 && fit.data.subarray(i, i + 4).some((v, c) => v !== reference.data[i + c])) throw new Error(`${direction}: assembled visible ear must match reference RGBA at native coordinates.`);
    }
    // Report actual head-pixel occlusion, without claiming anatomical correctness.
    let headPixelsOverlappedByHair = 0, headPixelsWithoutHairOverlap = 0;
    const head = layers.get('head')!, coveringHair = layers.get(direction === 'N' || backDraft ? 'hair-rear' : 'hair-front')!;
    for (let i = 3; i < head.data.length; i += 4) if (head.data[i]) { if (coveringHair.data[i]! >= 8) headPixelsOverlappedByHair++; else headPixelsWithoutHairOverlap++; }
    fitMeasurements.push({ direction, headPixelsOverlappedByHair, headPixelsWithoutHairOverlap, outputSha256: sha256(encodePng(fit)) });
    pending.push({ path: `master/${direction}.png`, image: master }, { path: `assembled/${direction}.png`, image: reconstructed }, { path: `fit/${direction}.png`, image: fit }, { path: `inspection/green/${direction}-fit.png`, image: fitDraftLabel(decorateExport(fit, direction)) });
    const comparison = blankImage(1152, 440), full = blankImage(3072, 1536);
    if (baselineFit) {
      const seamComparison = blankImage(1152, 440);
      for (const [column, image] of [reference, baselineFit, fit].entries()) drawRgba(seamComparison, checkerPreview(crop(image), direction), column * 384, 0);
      pending.push({ path: direction === 'S' ? 'inspection/S-seam-comparison.png' : `inspection/${direction}-fit-comparison.png`, image: seamComparison });
    }
    for (const [column, image] of [reference, master, fit].entries()) {
      drawRgba(comparison, checkerPreview(crop(image), direction), column * 384, 0);
      drawRgba(full, checkerPreview(image, direction), column * 1024, 0);
    }
    drawRgba(closeups, comparison, 0, row * 440); drawRgba(fullContact, full, 0, row * 1536);
    pending.push({ path: `inspection/head-comparison/${direction}.png`, image: comparison }, { path: `inspection/full-comparison/${direction}.png`, image: full });
  }
  pending.push({ path: 'overview.png', image: closeups }, { path: 'full-overview.png', image: overview(fullContact) });
  const report = { schemaVersion: 1, id: draft.id, assetVersion: draft.assetVersion, configSource, target: draft.target, status: draft.status, sourcePose: draft.sourcePose, intendedRuntimePose: draft.intendedRuntimePose, rigCompatibility: draft.rigCompatibility, anatomyApproved: false, paletteReady: false, published: false, featurePolicy: draft.featurePolicy, earPolicy: draft.earPolicy, minimumVisibleAlpha: draft.minimumVisibleAlpha, configSha256: sha256(configBytes), supportedReviewDirections: reviewDirections, missingDirections: DIRECTIONS.filter((d) => !new Set<Direction>(reviewDirections).has(d)), knownReviewIssues: draft.knownReviewIssues, measurements, masters, hairMeasurements, fringeFitMeasurement, seamRepairMeasurement, coherentFitMeasurement, ...(profileFitMeasurements.length ? { profileFitMeasurements } : {}), ...(profileEarMeasurements.length ? { profileEarMeasurements } : {}), ...(diagonalRepairMeasurements.length ? { diagonalRepairMeasurements } : {}), fitMeasurements, masterReconstruction: 'exact-normalized-head-neck-partition', previewColumns: ['reference', 'bare-head-neck-skin-base', (draft.fringeFit || draft.coherentFit || profileDraft?.profileFit || diagonalRepairDraft) ? 'candidate-hair-fit+head+neck' : 'accepted-hair+head+neck'], closeupRegion: { x: 320, y: 40, width: 384, height: 440, sampling: 'native-copy' }, hiddenFacialLayers: ['eyes', 'eyebrows', 'mouth'], outputs: pending.map(({ path, image }) => ({ path, sha256: sha256(encodePng(image)) })), reviewRequired: ['New scalp/jaw/nape anatomy and ear placement', backDraft ? 'NE/NW are posterior three-quarter views with no visible eyes, brows, mouth or frontal fringe' : frontBackDraft ? 'N has no visible face or eyes; S skin underlay has no baked eye/brow/mouth layers' : diagonalDraft || diagonalRepairDraft ? 'SE faces three-quarter front-right; SW faces three-quarter front-left; no baked eye/brow/mouth layers' : 'E faces right; W faces left; profile skin has no baked eye/brow/mouth layers', 'Native head/neck/hair geometry and posterior scalp coverage', 'Independent human-ear layers and remaining head facings', 'Complete body/clothing and production T-pose fit', 'Final Step6C approval before Step6D'] };
  for (const { path, image } of pending) {
    const destination = resolve(outputDirectory, path);
    for (let parent = destination; nested(outputDirectory, parent); parent = resolve(parent, '..')) {
      try { if ((await lstat(parent)).isSymbolicLink()) throw new Error('Anatomy staging output symlinks are forbidden.'); }
      catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      if (parent === outputDirectory) break;
    }
    await mkdir(resolve(destination, '..'), { recursive: true }); await writeFile(destination, encodePng(image));
  }
  for (const [path, hash] of inputs) if (sha256(await readFile(path)) !== hash) throw new Error('Anatomy review input changed during generation.');
  const metadata = resolve(outputDirectory, 'metadata.json');
  try { if ((await lstat(metadata)).isSymbolicLink()) throw new Error('Anatomy metadata symlinks are forbidden.'); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  await writeFile(metadata, `${JSON.stringify(report, null, 2)}\n`); return report;
}
