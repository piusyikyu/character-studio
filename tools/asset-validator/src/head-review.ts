import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { DIRECTIONS, DIRECTION_PLANE_ORDER, directionSchema } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, decorateExport, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { alphaStatistics, characterBounds } from './audit';
import { checkerPreview, fitDraftLabel, overview } from './inspection';
import { headReviewSchema } from './head-review-schema';
import { hairReviewSchema } from './hair-review-schema';
import { sha256 } from './reference-import';

const nested = (parent: string, child: string) => { const p = relative(parent, child); return p === '' || (!p.startsWith('..') && !isAbsolute(p)); };
const approvalSchema = z.object({ configSha256: z.string(), layers: z.array(z.object({ direction: directionSchema, part: z.enum(['rear', 'front']), sourceSha256: z.string(), cleanedSha256: z.string() })) });
export interface HeadReviewOptions {
  readonly sourceDirectory: string;
  readonly hairDirectory: string;
  readonly referenceDirectory: string;
  readonly outputDirectory: string;
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
  const configBytes = await read(sourceDirectory, 'authoring-v1.json');
  const draft = headReviewSchema.parse(JSON.parse(configBytes.toString('utf8')));
  const hairBytes = await read(hairDirectory, draft.hairConfig.source, draft.hairConfig.sourceSha256);
  const hair = hairReviewSchema.parse(JSON.parse(hairBytes.toString('utf8')));
  if (!('S' in hair.frames)) throw new Error('Head S/N review needs the approved S/N hair pair.');
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
  const measurements: { direction: 'S' | 'N'; part: 'head' | 'neck'; sourceSha256: string; outputSha256: string; pixelCount: number; bounds: ReturnType<typeof characterBounds>; origin: { x: number; y: number }; position: { x: number; y: number }; greenCandidates: number }[] = [];
  const masters: { direction: 'S' | 'N'; sourceSha256: string; cleanedSha256: string; noisePixelsCleared: number; bounds: ReturnType<typeof characterBounds> }[] = [];
  const hairMeasurements: { direction: 'S' | 'N'; part: 'rear' | 'front'; sourceSha256: string; cleanedSha256: string }[] = [];
  const fitMeasurements: { direction: 'S' | 'N'; headPixelsOverlappedByHair: number; headPixelsWithoutHairOverlap: number; outputSha256: string }[] = [];
  const closeups = blankImage(1152, 880), fullContact = blankImage(3072, 3072);
  const crop = (image: RgbaImage) => {
    const result = blankImage(384, 440);
    for (let y = 0; y < 440; y++) result.data.set(image.data.subarray(((y + 40) * 1024 + 320) * 4, ((y + 40) * 1024 + 704) * 4), y * 384 * 4);
    return result;
  };
  for (const [row, direction] of (['S', 'N'] as const).entries()) {
    const frame = draft.frames[direction], hairFrame = hair.frames[direction];
    if (frame.reference !== hairFrame.reference || frame.referenceSha256 !== hairFrame.referenceSha256 || frame.candidateHeadAnchor.x !== hairFrame.candidateHeadAnchor.x || frame.candidateHeadAnchor.y !== hairFrame.candidateHeadAnchor.y) throw new Error(`${direction}: reference/head anchor must match the accepted hair study.`);
    const reference = await load(referenceDirectory, frame.reference, frame.referenceSha256);
    await load(sourceDirectory, frame.guide.source, frame.guide.sourceSha256);
    const master = await load(sourceDirectory, frame.master.source, frame.master.sourceSha256);
    const noisePixelsCleared = normalize(master), bounds = characterBounds(master), allowed = frame.allowedBounds;
    if (!bounds || !alphaStatistics(master).transparent || bounds.x < allowed.x || bounds.y < allowed.y || bounds.x + bounds.width > allowed.x + allowed.width || bounds.y + bounds.height > allowed.y + allowed.height) throw new Error(`${direction}: anatomy exceeds the native authoring envelope; inspect placement, never resize.`);
    masters.push({ direction, sourceSha256: frame.master.sourceSha256, cleanedSha256: sha256(encodePng(master)), noisePixelsCleared, bounds });
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
    const fit = blankImage(1024, 1536);
    for (const plane of DIRECTION_PLANE_ORDER[direction]) { const image = layers.get(plane); if (image) drawRgba(fit, image, 0, 0); }
    // Report actual head-pixel occlusion, without claiming anatomical correctness.
    let headPixelsOverlappedByHair = 0, headPixelsWithoutHairOverlap = 0;
    const head = layers.get('head')!, coveringHair = layers.get(direction === 'N' ? 'hair-rear' : 'hair-front')!;
    for (let i = 3; i < head.data.length; i += 4) if (head.data[i]) { if (coveringHair.data[i]! >= 8) headPixelsOverlappedByHair++; else headPixelsWithoutHairOverlap++; }
    fitMeasurements.push({ direction, headPixelsOverlappedByHair, headPixelsWithoutHairOverlap, outputSha256: sha256(encodePng(fit)) });
    pending.push({ path: `master/${direction}.png`, image: master }, { path: `assembled/${direction}.png`, image: reconstructed }, { path: `fit/${direction}.png`, image: fit }, { path: `inspection/green/${direction}-fit.png`, image: fitDraftLabel(decorateExport(fit, direction)) });
    const comparison = blankImage(1152, 440), full = blankImage(3072, 1536);
    for (const [column, image] of [reference, master, fit].entries()) {
      drawRgba(comparison, checkerPreview(crop(image), direction), column * 384, 0);
      drawRgba(full, checkerPreview(image, direction), column * 1024, 0);
    }
    drawRgba(closeups, comparison, 0, row * 440); drawRgba(fullContact, full, 0, row * 1536);
    pending.push({ path: `inspection/head-comparison/${direction}.png`, image: comparison }, { path: `inspection/full-comparison/${direction}.png`, image: full });
  }
  pending.push({ path: 'overview.png', image: closeups }, { path: 'full-overview.png', image: overview(fullContact) });
  const report = { schemaVersion: 1, id: draft.id, assetVersion: draft.assetVersion, target: draft.target, status: draft.status, sourcePose: draft.sourcePose, intendedRuntimePose: draft.intendedRuntimePose, rigCompatibility: draft.rigCompatibility, anatomyApproved: false, paletteReady: false, published: false, featurePolicy: draft.featurePolicy, earPolicy: draft.earPolicy, minimumVisibleAlpha: draft.minimumVisibleAlpha, configSha256: sha256(configBytes), supportedReviewDirections: ['S', 'N'], missingDirections: DIRECTIONS.filter((d) => d !== 'S' && d !== 'N'), knownReviewIssues: draft.knownReviewIssues, measurements, masters, hairMeasurements, fitMeasurements, masterReconstruction: 'exact-normalized-head-neck-partition', previewColumns: ['reference', 'bare-head-neck-skin-base', 'accepted-hair+head+neck'], closeupRegion: { x: 320, y: 40, width: 384, height: 440, sampling: 'native-copy' }, hiddenFacialLayers: ['eyes', 'eyebrows', 'mouth'], outputs: pending.map(({ path, image }) => ({ path, sha256: sha256(encodePng(image)) })), reviewRequired: ['New scalp/jaw/nape anatomy and ear placement', 'N has no visible face or eyes; S skin underlay has no baked eye/brow/mouth layers', 'Native head/neck/hair geometry and posterior scalp coverage', 'Independent human-ear layers and six other head facings', 'Complete body/clothing and production T-pose fit', 'Final Step6C approval before Step6D'] };
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
