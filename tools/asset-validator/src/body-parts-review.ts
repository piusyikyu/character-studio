import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { z } from 'zod';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { bodyReviewSchema, prepareBodyReview } from './body-review';
import { northBodyReviewSchema, prepareNorthBodyReview } from './body-north-review';
import { bodyPartLayout, northBodyPartLayout, validateNativeBodyParts } from './body-parts';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
const position = z.strictObject({ x: z.literal(0), y: z.literal(0) });
export const bodyPartsReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('body.parts.v1'), assetVersion: z.literal(1), direction: z.literal('S'), target: z.literal('detailed'),
  nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }), nativePosition: position, sourcePose: z.literal('tpose-study'), status: z.literal('draft-needs-human-review'),
  published: z.literal(false), paletteReady: z.literal(false), productionAnatomyApproved: z.literal(false), concealedJointsApproved: z.literal(false), separateUnderwearAuthored: z.literal(false), tposeApproved: z.literal(false), finalStep6CAccepted: z.literal(false),
  baselineConfiguration: pin, baselineApproval: pin, wholeBody: pin, head: pin, frontHair: pin, rearHair: pin, settings: pin, provenance: pin,
  parts: z.array(pin.extend({ id: z.enum(['torso','right-arm','left-arm','right-leg','left-leg']), plane: z.enum(['body-torso','body-back-arm','body-front-arm','body-back-leg','body-front-leg']), characterSide: z.enum(['center','right','left']), screenSide: z.enum(['center','right','left']), nativePosition: position })).length(5),
});
export const northBodyPartsReviewSchema = bodyPartsReviewSchema.omit({ frontHair: true }).extend({ direction: z.literal('N'), neck: pin });
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };
export interface BodyPartsReviewOptions { readonly sourceDirectory: string; readonly assetDirectory: string; readonly referenceDirectory: string; readonly outputDirectory: string }

/** Test actual body planes against the accepted S artwork; no new geometry or runtime publication. */
export async function prepareBodyPartsReview(options: BodyPartsReviewOptions) {
  return prepareNativeBodyPartsReview(options, 'S');
}
export async function prepareNorthBodyPartsReview(options: BodyPartsReviewOptions) {
  return prepareNativeBodyPartsReview(options, 'N');
}
async function prepareNativeBodyPartsReview(options: BodyPartsReviewOptions, direction: 'S' | 'N') {
  const [root, assets, refs] = await Promise.all([options.sourceDirectory, options.assetDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('Body part outputs and inputs must be disjoint.');
  for (let p = out; ; p = dirname(p)) { try { if (await realpath(p) !== p) throw new Error('Body part outputs cannot traverse symlinks.'); break; } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; } }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Ordinary pinned body part inputs required.');
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && digest !== p.sourceSha256) throw new Error(p.source + ': body part source changed; author a new revision.');
    inputs.set(path, digest); return bytes;
  };
  const configBytes = await read(root!, { source: 'authoring.json' }), parsed: unknown = JSON.parse(configBytes.toString('utf8'));
  const config = direction === 'S' ? bodyPartsReviewSchema.parse(parsed) : northBodyPartsReviewSchema.parse(parsed);
  const layout = direction === 'S' ? bodyPartLayout : northBodyPartLayout;
  for (const [j, part] of config.parts.entries()) { const expected = layout[j]!; if (part.id !== expected.id || part.plane !== expected.plane || part.characterSide !== expected.characterSide || part.screenSide !== expected.screenSide) throw new Error('Native body part identity and plane assignment changed.'); }
  const baselineDirectory = config.direction === 'S' ? 'body/reference-v1' : 'body/north-v1';
  const baselineFile = config.direction === 'S' ? 'authoring-v6.json' : 'authoring.json';
  if (config.baselineConfiguration.source !== baselineDirectory + '/' + baselineFile || config.baselineApproval.source !== baselineDirectory + (config.direction === 'S' ? '/review-fit-v6.json' : '/review-fit-v1.json')) throw new Error('Body parts require the accepted same-facing checkpoint.');
  const baselineJson: unknown = JSON.parse((await read(assets!, config.baselineConfiguration)).toString('utf8'));
  const requireSelection = (selected: { source: string; sourceSha256: string }, original: { source: string; sourceSha256: string }, prefix: string) => {
    if (selected.source !== prefix + original.source || selected.sourceSha256 !== original.sourceSha256) throw new Error('Body parts must preserve the accepted native anatomy/head/hair selection.');
  };
  if (config.direction === 'S') {
    const baselineConfig = bodyReviewSchema.parse(baselineJson);
    if (baselineConfig.assetVersion !== 6) throw new Error('Accepted revision-6 native body required.');
    for (const [selected, original] of [[config.wholeBody, baselineConfig.body], [config.head, baselineConfig.neckRepair.head], [config.frontHair, baselineConfig.spillRepair.front], [config.rearHair, baselineConfig.spillRepair.rear]]) requireSelection(selected!, original!, baselineDirectory + '/');
  } else {
    const baselineConfig = northBodyReviewSchema.parse(baselineJson);
    requireSelection(config.wholeBody, baselineConfig.body, baselineDirectory + '/');
    requireSelection(config.neck, baselineConfig.posedNeck, baselineDirectory + '/');
    requireSelection(config.head, baselineConfig.originalHead, '');
    requireSelection(config.rearHair, baselineConfig.rearHair, '');
  }
  const approval = z.object({ decision: z.literal(config.direction === 'S' ? 'approved-s-body-head-hair-study-fit' : 'approved-independent-n-body-study'), direction: z.literal(config.direction), configuration: z.literal(baselineFile), configurationSha256: hash, bareSha256: hash, fitSha256: hash, currentStudyFitApproved: z.literal(true), productionAnatomyApproved: z.literal(false), tposeApproved: z.literal(false), finalStep6CAccepted: z.literal(false) }).parse(JSON.parse((await read(assets!, config.baselineApproval)).toString('utf8')));
  if (approval.configurationSha256 !== config.baselineConfiguration.sourceSha256) throw new Error('Body parts must pin the accepted configuration approval.');
  const settings = JSON.parse((await read(root!, config.settings)).toString('utf8')); await read(root!, config.provenance);
  if (settings.sourceBody !== config.wholeBody.source) throw new Error('Native part settings must select the accepted whole body.');
  const load = async (base: string, p: { source: string; sourceSha256: string }) => { const im = decodePng(await read(base, p)); if (im.width !== 1024 || im.height !== 1536) throw new Error('Native 1024x1536 body part inputs required.'); for (let i = 0; i < im.data.length; i += 4) if (im.data[i + 3]! < 8) im.data.fill(0, i, i + 4); return im; };
  const [body, head, rear, ...parts] = await Promise.all([load(assets!, config.wholeBody), load(assets!, config.head), load(assets!, config.rearHair), ...config.parts.map(p => load(root!, p))]);
  const front = config.direction === 'S' ? await load(assets!, config.frontHair) : undefined;
  const neck = config.direction === 'N' ? await load(assets!, config.neck) : undefined;
  const measurements = validateNativeBodyParts(body!, parts, settings, direction);
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-body-parts-baseline-'));
  let baselineReport: Pick<Awaited<ReturnType<typeof prepareBodyReview>>, 'fitSha256' | 'bareSha256' | 'futureBodyFitObligations' | 'futureHairstyleFitObligations'>;
  let acceptedFit: RgbaImage;
  try {
    const baselineOptions = { sourceDirectory: resolve(assets!, baselineDirectory), assetDirectory: assets!, referenceDirectory: refs!, outputDirectory: temporary };
    baselineReport = config.direction === 'S' ? await prepareBodyReview({ ...baselineOptions, configFile: 'authoring-v6.json' }) : await prepareNorthBodyReview(baselineOptions);
    acceptedFit = decodePng(await readFile(resolve(temporary, `fit/${direction}.png`)));
  }
  finally { await rm(temporary, { recursive: true, force: true }); }
  if (baselineReport.fitSha256 !== approval.fitSha256 || baselineReport.bareSha256 !== approval.bareSha256) throw new Error('Current baseline no longer matches its accepted actual composition.');
  const compose = (withHead: boolean, withHair: boolean) => {
    const im = blankImage(1024, 1536), layers = new Map<RenderPlane, RgbaImage>();
    for (const [j, part] of config.parts.entries()) layers.set(part.plane, parts[j]!);
    if (withHead) { layers.set('head', head!); if (neck) layers.set('neck', neck); }
    if (withHair) { if (front) layers.set('hair-front', front); layers.set('hair-rear', rear!); }
    for (const plane of DIRECTION_PLANE_ORDER[direction]) { const layer = layers.get(plane); if (layer) drawRgba(im, layer, 0, 0); }
    return im;
  };
  const recomposed = compose(false, false), anatomy = compose(true, false), fit = compose(true, true);
  if (recomposed.data.some((v, i) => v !== body!.data[i]) || sha256(encodePng(anatomy)) !== approval.bareSha256 || sha256(encodePng(fit)) !== approval.fitSha256) throw new Error('Actual body plane composition must reproduce the accepted pixels exactly.');
  const overview = blankImage(3072, 1536);
  for (const [j, image] of [anatomy, acceptedFit, fit].entries()) drawRgba(overview, checkerPreview(image, direction), j * 1024, 0);
  const partSheet = blankImage(3072, 3072);
  for (const [j, image] of [recomposed, ...parts].entries()) drawRgba(partSheet, checkerPreview(image, direction), j % 3 * 1024, Math.floor(j / 3) * 1536);
  const pending = [{ path: `fit/${direction}-body-only.png`, image: recomposed }, { path: `fit/${direction}-anatomy.png`, image: anatomy }, { path: `fit/${direction}.png`, image: fit }, { path: 'overview.png', image: overview }, { path: 'parts-overview.png', image: partSheet }];
  const report = { schemaVersion: 1, id: config.id, assetVersion: config.assetVersion, configSha256: sha256(configBytes), configuration: 'authoring.json', status: config.status, baselineApproval: config.baselineApproval, supportedReviewDirections: [direction], target: 'detailed', sourcePose: config.sourcePose, nativePosition: config.nativePosition, compositionOrder: DIRECTION_PLANE_ORDER[direction], measurements, bodySha256: sha256(encodePng(recomposed)), bareSha256: sha256(encodePng(anatomy)), fitSha256: sha256(encodePng(fit)), acceptedBareSha256: approval.bareSha256, acceptedFitSha256: approval.fitSha256, exactApprovedFit: true, published: false, paletteReady: false, productionAnatomyApproved: false, concealedJointsApproved: false, separateUnderwearAuthored: false, tposeApproved: false, finalStep6CAccepted: false, step6DStarted: false, overviewColumns: ['recomposed body parts plus accepted head', config.direction === 'S' ? 'accepted revision-6 S fit' : 'accepted N body study fit', 'actual five body planes plus head/hair'], partSheetCells: ['recomposed body', 'torso with underwear', ...layout.slice(1).map(p => `character ${p.characterSide} ${p.id.endsWith('arm') ? 'arm' : 'leg'} / screen ${p.screenSide}`)], previewSampling: 'native-copy-no-transforms', futureBodyFitObligations: baselineReport.futureBodyFitObligations, futureHairstyleFitObligations: baselineReport.futureHairstyleFitObligations, outputs: pending.map(p => ({ path: p.path, sha256: sha256(encodePng(p.image)) })) };
  for (const p of [...pending.map(p => ({ path: p.path, bytes: encodePng(p.image) })), { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) {
    const path = resolve(out, p.path);
    for (let parent = path; inside(out, parent); parent = dirname(parent)) { try { if ((await lstat(parent)).isSymbolicLink()) throw new Error('Body part output symlinks forbidden.'); } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; } if (parent === out) break; }
    await mkdir(dirname(path), { recursive: true }); await writeFile(path, p.bytes);
  }
  for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error('Body part inputs changed during review.');
  return report;
}
