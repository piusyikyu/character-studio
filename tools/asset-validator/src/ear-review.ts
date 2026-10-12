import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { assetSourceSchema, DIRECTIONS, DIRECTION_PLANE_ORDER } from '@character-studio/core';
import { blankImage, decodePng, decorateExport, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { checkerPreview, fitDraftLabel } from './inspection';
import { headReviewSchema } from './head-review-schema';
import { sha256 } from './reference-import';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const pin = z.strictObject({ source: assetSourceSchema, sourceSha256: hash });
const polygon = z.array(z.tuple([z.number().int(), z.number().int()])).length(4);
const ear = pin.extend({ region: polygon, selection: pin, origin: z.strictObject({ x: z.literal(511), y: z.literal(169) }), pixelCount: z.number().int().positive() });
const regions = { right: [[422, 183], [455, 183], [455, 241], [422, 241]], left: [[568, 183], [603, 183], [603, 241], [568, 241]] } as const;
export const earReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('ears.human.v1'), assetVersion: z.union([z.literal(1), z.literal(2)]), target: z.literal('detailed'), status: z.literal('draft-needs-human-review'),
  sourcePose: z.literal('standing-reference'), intendedRuntimePose: z.literal('tpose'), rigCompatibility: z.literal('unverified'), paletteReady: z.literal(false), published: z.literal(false),
  nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }), minimumVisibleAlpha: z.literal(8), direction: z.literal('S'),
  method: z.enum(['native-ear-patches/authored-concealed-skin/variant-retention', 'locally-authored-smaller-ears/retained-concealed-skin/variant-retention']),
  headConfig: z.strictObject({ source: z.literal('authoring-v5.json'), sourceSha256: hash }), headApproval: z.strictObject({ source: z.literal('review-fit-v5.json'), sourceSha256: hash }),
  study: pin, baseline: z.strictObject({ source: z.literal('authoring-v1.json'), sourceSha256: hash }).optional(), underlayStudy: pin.optional(), repairSelection: pin.optional(),
  settings: z.strictObject({ source: z.enum(['inputs/ownership-v1.json', 'inputs/ownership-v2.json']), sourceSha256: hash }), head: pin, headRetention: pin,
  sides: z.strictObject({ right: ear, left: ear }), knownReviewIssues: z.array(z.string().min(1)).min(1),
}).refine((d) => (['right', 'left'] as const).every((side) => JSON.stringify(d.sides[side].region) === JSON.stringify(regions[side])), 'S ears must retain their independently selected native attachment windows.')
  .refine((d) => d.assetVersion === 1
    ? d.method === 'native-ear-patches/authored-concealed-skin/variant-retention' && !d.baseline && !d.underlayStudy && !d.repairSelection && d.settings.source === 'inputs/ownership-v1.json'
    : d.method === 'locally-authored-smaller-ears/retained-concealed-skin/variant-retention' && d.baseline?.source === 'authoring-v1.json' && !!d.underlayStudy && !!d.repairSelection && d.settings.source === 'inputs/ownership-v2.json', 'Ear revision must declare its matching method and pinned derivation baseline.');

export interface EarReviewOptions {
  readonly sourceDirectory: string;
  readonly headDirectory: string;
  readonly referenceDirectory: string;
  readonly outputDirectory: string;
  readonly configFile?: 'authoring-v1.json' | 'authoring-v2.json';
}

const nested = (parent: string, child: string) => { const p = relative(parent, child); return p === '' || (!p.startsWith('..') && !isAbsolute(p)); };
const normalize = (image: RgbaImage) => { for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4); return image; };
const approvalSchema = z.object({ configSha256: hash, fitMeasurements: z.array(z.object({ direction: z.string(), outputSha256: hash })) });
const crop = (image: RgbaImage) => {
  const out = blankImage(384, 440);
  for (let y = 0; y < 440; y++) out.data.set(image.data.subarray(((y + 40) * 1024 + 320) * 4, ((y + 40) * 1024 + 704) * 4), y * 384 * 4);
  return out;
};

/** S-only offline human-ear authoring review; does not publish or choose recipe traits. */
export async function prepareEarReview(options: EarReviewOptions) {
  const [sourceDirectory, headDirectory, referenceDirectory] = await Promise.all([realpath(options.sourceDirectory), realpath(options.headDirectory), realpath(options.referenceDirectory)]);
  const outputDirectory = resolve(options.outputDirectory);
  for (const input of [sourceDirectory, headDirectory, referenceDirectory]) if (nested(input, outputDirectory) || nested(outputDirectory, input)) throw new Error('Ear staging and input paths must be disjoint.');
  let ancestor = outputDirectory;
  while (true) {
    try { if (await realpath(ancestor) !== ancestor) throw new Error('Ear staging cannot traverse symlinks.'); break; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; ancestor = resolve(ancestor, '..'); }
  }
  const inputs = new Map<string, string>();
  const read = async (directory: string, source: string, expected?: string) => {
    const path = resolve(directory, source);
    if (!nested(directory, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error(`${source}: expected an ordinary input without symlinks.`);
    const bytes = await readFile(path), digest = sha256(bytes);
    if (expected && digest !== expected) throw new Error(`${source}: input hash changed; create a reviewed new version.`);
    inputs.set(path, digest); return bytes;
  };
  const load = async (directory: string, input: z.infer<typeof pin>) => {
    const image = decodePng(await read(directory, input.source, input.sourceSha256));
    if (image.width !== 1024 || image.height !== 1536) throw new Error(`${input.source}: expected native 1024 × 1536 without transformations.`);
    return normalize(image);
  };
  const bytes = await read(sourceDirectory, options.configFile ?? 'authoring-v1.json');
  const config = earReviewSchema.parse(JSON.parse(bytes.toString('utf8')));
  if (config.assetVersion === 2) {
    const baseline = earReviewSchema.parse(JSON.parse((await read(sourceDirectory, config.baseline!.source, config.baseline!.sourceSha256)).toString('utf8')));
    if (baseline.assetVersion !== 1 || JSON.stringify(config.head) !== JSON.stringify(baseline.head) || JSON.stringify(config.headRetention) !== JSON.stringify(baseline.headRetention) || JSON.stringify(config.underlayStudy) !== JSON.stringify(baseline.study) || JSON.stringify(config.headConfig) !== JSON.stringify(baseline.headConfig) || JSON.stringify(config.headApproval) !== JSON.stringify(baseline.headApproval)) throw new Error('Smaller ears must preserve the pinned original concealed skin, mask and accepted S baseline.');
  }
  const headBytes = await read(headDirectory, config.headConfig.source, config.headConfig.sourceSha256);
  const accepted = headReviewSchema.parse(JSON.parse(headBytes.toString('utf8')));
  const approval = approvalSchema.parse(JSON.parse((await read(headDirectory, config.headApproval.source, config.headApproval.sourceSha256)).toString('utf8')));
  if (approval.configSha256 !== sha256(headBytes) || !accepted.coherentFit) throw new Error('Ear separation requires the accepted coherent S revision-5 fit.');
  const settings = JSON.parse((await read(sourceDirectory, config.settings.source, config.settings.sourceSha256)).toString('utf8')) as { method: string; regions: unknown };
  if (settings.method !== config.method || JSON.stringify(settings.regions) !== JSON.stringify(regions)) throw new Error('Ear ownership differs from its pinned native settings.');
  const [original, study, underlayStudy, underlay, retention, neck, rear, front, reference, repairSelection] = await Promise.all([
    load(headDirectory, accepted.frames.S.head), load(sourceDirectory, config.study), load(sourceDirectory, config.underlayStudy ?? config.study), load(sourceDirectory, config.head), load(sourceDirectory, config.headRetention),
    load(headDirectory, accepted.frames.S.neck), load(headDirectory, accepted.coherentFit.rear), load(headDirectory, accepted.coherentFit.front),
    load(referenceDirectory, { source: accepted.frames.S.reference, sourceSha256: accepted.frames.S.referenceSha256 }),
    config.repairSelection ? load(sourceDirectory, config.repairSelection) : undefined,
  ]);
  const expected = { ...original, data: original.data.slice() }, revised = { ...original, data: original.data.slice() }, maskedHead = { ...underlay, data: underlay.data.slice() };
  const earPair = blankImage(1024, 1536), layers: { side: 'right' | 'left'; image: RgbaImage; mask: RgbaImage; pixelCount: number }[] = [];
  const inRegion = (p: number, side: 'right' | 'left') => { const [[x0, y0], , [x1, y1]] = regions[side]; return p % 1024 >= x0 && p % 1024 < x1 && Math.floor(p / 1024) >= y0 && Math.floor(p / 1024) < y1; };
  if (repairSelection) for (let i = 0; i < repairSelection.data.length; i += 4) {
    const x = (i / 4) % 1024, y = Math.floor(i / 4 / 1024);
    const selected = y >= 184 && y < 224 && ((x >= 424 && x < 451) || (x >= 574 && x < 600));
    if (repairSelection.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0))) throw new Error('Smaller-ear study mask must retain its bounded native ear/root selection.');
  }
  for (const side of ['right', 'left'] as const) {
    const [image, mask] = await Promise.all([load(sourceDirectory, config.sides[side]), load(sourceDirectory, config.sides[side].selection)]); let pixelCount = 0;
    for (let i = 0; i < image.data.length; i += 4) {
      const selected = inRegion(i / 4, side);
      const owner = config.assetVersion === 1 ? original : repairSelection!.data[i + 3] === 255 ? study : underlay;
      if (mask.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0)) || image.data.subarray(i, i + 4).some((v, c) => v !== (selected ? owner.data[i + c] : 0))) throw new Error(`${side}: ear pixels must retain their own accepted native side ownership or selected local study ownership.`);
      if (selected) { expected.data.set(underlayStudy.data.subarray(i, i + 4), i); revised.data.set(owner.data.subarray(i, i + 4), i); if (image.data[i + 3]! >= 8) pixelCount++; }
    }
    if (pixelCount !== config.sides[side].pixelCount) throw new Error(`${side}: native ear coverage changed.`);
    drawRgba(earPair, image, 0, 0); layers.push({ side, image, mask, pixelCount });
  }
  if (sha256(expected.data) !== sha256(underlay.data)) throw new Error('Concealed head must preserve all accepted skin outside the local ear windows.');
  for (let i = 0; i < retention.data.length; i += 4) {
    const selected = inRegion(i / 4, 'right') || inRegion(i / 4, 'left');
    if (retention.data.subarray(i, i + 4).some((v) => v !== (selected ? 0 : 255))) throw new Error('Human head retention mask must match its selected ear windows.');
    if (selected) maskedHead.data.fill(0, i, i + 4);
  }
  const reconstructed = blankImage(1024, 1536); drawRgba(reconstructed, maskedHead, 0, 0); drawRgba(reconstructed, earPair, 0, 0);
  if (sha256(reconstructed.data) !== sha256(revised.data)) throw new Error('Separate human ears and masked head must reconstruct their selected native head exactly.');
  const compose = (head: RgbaImage, ears?: RgbaImage) => {
    const out = blankImage(1024, 1536), parts = new Map([['hair-rear', rear], ['neck', neck], ['head', head], ['hair-front', front], ...(ears ? [['ears', ears] as const] : [])]);
    for (const plane of DIRECTION_PLANE_ORDER.S) { const part = parts.get(plane); if (part) drawRgba(out, part, 0, 0); }
    return out;
  };
  const baselineFit = compose(original), humanFit = compose(maskedHead, earPair), earlessFit = compose(underlay);
  const expectedFit = approval.fitMeasurements.find((m) => m.direction === 'S')?.outputSha256;
  const matchesAcceptedHead = sha256(reconstructed.data) === sha256(original.data), matchesAcceptedFit = sha256(humanFit.data) === sha256(baselineFit.data);
  if (sha256(encodePng(baselineFit)) !== expectedFit || (config.assetVersion === 1 && !matchesAcceptedFit) || (config.assetVersion === 2 && matchesAcceptedHead)) throw new Error('Ear review must preserve its accepted S baseline and distinguish the local revision.');
  const originalSkin = blankImage(1024, 1536), bareSkin = blankImage(1024, 1536), humanSkin = blankImage(1024, 1536);
  for (const [out, head] of [[originalSkin, original], [bareSkin, underlay], [humanSkin, reconstructed]] as const) { drawRgba(out, neck, 0, 0); drawRgba(out, head, 0, 0); }
  const overview = blankImage(1152, 440), anatomy = blankImage(1536, 440);
  for (const [column, image] of [reference, baselineFit, humanFit].entries()) drawRgba(overview, checkerPreview(crop(image), 'S'), column * 384, 0);
  for (const [column, image] of [originalSkin, bareSkin, earPair, humanSkin].entries()) drawRgba(anatomy, checkerPreview(crop(image), 'S'), column * 384, 0);
  const pending = [
    { path: 'layers/S-head-underlay.png', image: underlay }, { path: 'masks/S-human-head-retention.png', image: retention },
    ...layers.flatMap(({ side, image, mask }) => [{ path: `layers/S-${side}-ear.png`, image }, { path: `masks/S-${side}-ear.png`, image: mask }, { path: `inspection/S-${side}-ear.png`, image: checkerPreview(image, 'S') }]),
    { path: 'assembled/S-head-human.png', image: reconstructed }, { path: 'fit/S-human.png', image: humanFit }, { path: 'fit/S-earless.png', image: earlessFit },
    { path: 'inspection/S-head-underlay.png', image: checkerPreview(underlay, 'S') }, { path: 'inspection/S-human-green.png', image: fitDraftLabel(decorateExport(humanFit, 'S')) },
    { path: 'overview.png', image: overview }, { path: 'anatomy-overview.png', image: anatomy },
  ];
  const report = { schemaVersion: 1, id: config.id, assetVersion: config.assetVersion, configSha256: sha256(bytes), target: 'detailed', sourcePose: config.sourcePose, status: config.status, supportedReviewDirections: ['S'], missingDirections: DIRECTIONS.filter((d) => d !== 'S'), published: false, paletteReady: false, anatomyApproved: false,
    humanAssemblyMatchesAcceptedHead: matchesAcceptedHead, humanFitMatchesAcceptedS5: matchesAcceptedFit, humanFitSha256: sha256(encodePng(humanFit)), earlessFitSha256: sha256(encodePng(earlessFit)), sideConvention: 'physical character right=screen-left; left=screen-right in S',
    anatomyColumns: ['accepted-skin', 'ear-free-concealed-skin', 'native-human-ear-pair', 'reconstructed-human-skin'], previewColumns: ['reference', 'accepted-S5-fit', `separate-human-ear-fit-v${config.assetVersion}`], closeupRegion: { x: 320, y: 40, width: 384, height: 440, sampling: 'native-copy' },
    measurements: layers.map(({ side, pixelCount }) => ({ side, pixelCount, origin: config.sides[side].origin, position: { x: 0, y: 0 } })), knownReviewIssues: config.knownReviewIssues,
    reviewRequired: ['Concealed scalp/root surfaces and ear-free contour', 'Native attachment collars and actual front/rear hair depth', 'Other facings and ancestry variants; independent facial features', 'Real body/clothing occlusion and production T-pose', 'Final Step 6C approval before Step 6D'], outputs: pending.map(({ path, image }) => ({ path, sha256: sha256(encodePng(image)) })),
  };
  for (const [path, before] of inputs) if (sha256(await readFile(path)) !== before) throw new Error(`${path}: input changed during ear review.`);
  for (const { path, image } of pending) {
    const destination = resolve(outputDirectory, path); await mkdir(resolve(destination, '..'), { recursive: true });
    if (await realpath(resolve(destination, '..')) !== resolve(destination, '..')) throw new Error('Ear inspection paths cannot traverse symlinks.');
    try { if ((await lstat(destination)).isSymbolicLink()) throw new Error('Ear inspection symlinks are forbidden.'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
    await writeFile(destination, encodePng(image));
  }
  const metadata = resolve(outputDirectory, 'metadata.json');
  try { if ((await lstat(metadata)).isSymbolicLink()) throw new Error('Ear metadata symlinks are forbidden.'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
  await writeFile(metadata, `${JSON.stringify(report, null, 2)}\n`); return report;
}
