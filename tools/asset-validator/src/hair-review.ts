import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { DIRECTIONS, DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { Direction } from '@character-studio/core';
import { blankImage, decodePng, decorateExport, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { alphaStatistics, characterBounds } from './audit';
import { checkerPreview, overview } from './inspection';
import { hairReviewSchema } from './hair-review-schema';
import { sha256 } from './reference-import';

const nested = (parent: string, child: string) => { const path = relative(parent, child); return path === '' || (!path.startsWith('..') && !isAbsolute(path)); };

export interface HairReviewOptions {
  readonly sourceDirectory: string;
  readonly referenceDirectory: string;
  readonly outputDirectory: string;
  readonly configFilename?: 'authoring-v1.json' | 'profiles-authoring-v1.json';
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
  const pending: { path: string; image: RgbaImage }[] = [];
  const measurements: { direction: Direction; part: 'rear' | 'front'; sourceSha256: string; outputSha256: string; bounds: ReturnType<typeof characterBounds>; alpha: ReturnType<typeof alphaStatistics>; sourceAlpha: ReturnType<typeof alphaStatistics>; noisePixelsCleared: number; greenCandidates: number; plane: string; position: { x: number; y: number } }[] = [];
  const comparisons: RgbaImage[] = [];
  const frames = Object.entries(draft.frames).map(([direction, frame]) => ({ direction: direction as Direction, frame }));
  for (const { direction, frame } of frames) {
    const reference = await load(referenceDirectory, frame.reference, frame.referenceSha256);
    const layers = new Map<'hair-rear' | 'hair-front', RgbaImage>();
    for (const [part, artwork] of [['rear', frame.rear], ...(frame.front.visibility === 'visible' ? [['front', frame.front.artwork] as const] : [])] as const) {
      const image = await load(sourceDirectory, artwork.source, artwork.sourceSha256);
      const sourceAlpha = alphaStatistics(image);
      let noisePixelsCleared = 0;
      // Built-in authoring outputs may contain near-zero alpha speckles far from hair.
      // Preserve raw source PNGs, and record this versioned <8/255 cleanup explicitly.
      for (let i = 3; i < image.data.length; i += 4) if (image.data[i]! < draft.minimumVisibleAlpha) {
        if (image.data[i]) noisePixelsCleared++;
        image.data.fill(0, i - 3, i + 1);
      }
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
      const plane = part === 'rear' ? 'hair-rear' : 'hair-front';
      layers.set(plane, image);
      measurements.push({ direction, part, sourceSha256: artwork.sourceSha256, outputSha256: sha256(encodePng(image)), bounds, alpha, sourceAlpha, noisePixelsCleared, greenCandidates, plane, position: { x: 0, y: 0 } });
      pending.push({ path: `layers/${direction}-${part}.png`, image }, { path: `inspection/checker/${direction}-${part}.png`, image: checkerPreview(image, direction) }, { path: `inspection/green/${direction}-${part}.png`, image: decorateExport(image, direction) });
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
    comparisons.push(comparison);
    pending.push({ path: `inspection/comparison/${direction}.png`, image: comparison });
  }
  const contact = blankImage(2048, 3072);
  comparisons.forEach((image, index) => drawRgba(contact, image, 0, index * 1536));
  pending.push({ path: 'overview.png', image: overview(contact) });
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
