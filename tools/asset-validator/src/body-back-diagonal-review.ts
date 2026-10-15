import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';
import { selectBackDiagonalBody } from './body-silhouette';
import { headBackDiagonalsReviewSchema } from './head-review-schema';
import { backEarReviewSchema } from './ear-back-review';
import { northBodyReviewSchema } from './body-north-review';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
export const backDiagonalBodyReviewSchema = northBodyReviewSchema.extend({ id: z.literal('body.back-diagonals.v1'), direction: z.enum(['NE', 'NW']), reference: pin.extend({ source: z.enum(['NE.png', 'NW.png']) }), footwearCompatibilityApproved: z.literal(false), futureFootwearFitObligations: z.array(z.string().min(1)).min(1), proportionComparison: z.strictObject({ north: pin, previous: pin, southeast: pin }).optional(), backProportionComparison: z.strictObject({ north: pin, northeast: pin }).optional() });
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };
export interface BackDiagonalBodyReviewOptions { readonly sourceDirectory: string; readonly assetDirectory: string; readonly referenceDirectory: string; readonly outputDirectory: string; readonly bodyParts?: readonly { readonly plane: RenderPlane; readonly image: RgbaImage }[]; readonly configuration?: 'authoring-ne-v1.json' | 'authoring-ne-v2.json' | 'authoring-nw-v1.json' }

/** Independently authored rear-diagonal anatomy and native posterior hair depth, offline only. */
export async function prepareBackDiagonalBodyReview(options: BackDiagonalBodyReviewOptions) {
  const configuration = options.configuration ?? 'authoring-ne-v1.json';
  const direction = configuration === 'authoring-nw-v1.json' ? 'NW' : 'NE', cutY = direction === 'NW' ? 288 : 294, neckEndY = direction === 'NW' ? 303 : 308;
  const unavailable = (error: unknown): never => { if ((error as NodeJS.ErrnoException).code === 'ENOENT') throw new Error(`${direction} body study is unavailable; independently author its native study and selections before exporting. No opposite-facing substitute or mirror is supplied.`); throw error; };
  const [root, assets, refs] = await Promise.all([realpath(options.sourceDirectory).catch(unavailable), realpath(options.assetDirectory), realpath(options.referenceDirectory)]);
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('Back-diagonal body outputs and inputs must be disjoint.');
  for (let p = out; ; p = dirname(p)) {
    try { if (await realpath(p) !== p) throw new Error('Back-diagonal body outputs cannot traverse symlinks.'); break; }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
  }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error(`Ordinary pinned native ${direction} inputs required.`);
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && digest !== p.sourceSha256) throw new Error(`${p.source}: pinned ${direction} input changed; author a new revision.`);
    inputs.set(path, digest); return bytes;
  };
  const json = async (base: string, p: { source: string; sourceSha256?: string }) => JSON.parse((await read(base, p)).toString('utf8')) as unknown;
  const load = async (base: string, p: { source: string; sourceSha256: string }, normalize = true) => {
    const im = decodePng(await read(base, p));
    if (im.width !== 1024 || im.height !== 1536) throw new Error(`Native 1024x1536 ${direction} body inputs required.`);
    if (normalize) for (let i = 0; i < im.data.length; i += 4) if (im.data[i + 3]! < 8) im.data.fill(0, i, i + 4);
    return im;
  };
  const bytes = await read(root!, { source: configuration }).catch(unavailable), config = backDiagonalBodyReviewSchema.parse(JSON.parse(bytes.toString('utf8')));
  if (config.direction !== direction || config.reference.source !== `${direction}.png`) throw new Error('Rear-diagonal configuration must match its independently authored facing.');
  const paths = { headConfiguration: 'head/soft-oval-v1/back-diagonals-authoring-v1.json', hairConfiguration: 'hair/long-waves-v1/back-diagonals-authoring-v1.json', headSelection: 'head/assembly-v1/review-selection.json', headApproval: 'head/assembly-v1/review-fit-v1.json', earConfiguration: 'ears/human-v1/back-diagonals-v1/authoring.json', earApproval: 'ears/human-v1/back-diagonals-v1/review-fit-v1.json' } as const;
  for (const [key, path] of Object.entries(paths)) if (config[key as keyof typeof paths].source !== path) throw new Error(`Accepted independently authored ${direction} head/hair selection required.`);
  const headConfig = headBackDiagonalsReviewSchema.parse(await json(assets!, config.headConfiguration));
  const earConfig = backEarReviewSchema.parse(await json(assets!, config.earConfiguration));
  const hairFrame = z.object({ rear: z.object({ source, sourceSha256: hash }), front: z.object({ visibility: z.literal('hidden') }) });
  const hairConfig = z.object({ frames: z.object({ NE: hairFrame, NW: hairFrame }) }).parse(await json(assets!, config.hairConfiguration));
  const selectedState = z.object({ packs: z.object({ backDiagonals: z.object({ directory: z.literal('ears/human-v1/back-diagonals-v1'), configuration: pin, approval: pin }) }), frames: z.object({ NE: z.literal('backDiagonals'), NW: z.literal('backDiagonals') }) });
  const approval = z.object({ decision: z.literal('approved-standing-reference-head-set'), standingReferenceHeadSetApproved: z.literal(true), selectedState, frames: z.array(z.object({ direction: z.string(), bareSha256: hash, fitSha256: hash })), futureBodyFitObligations: z.array(z.string()), futureHairstyleFitObligations: z.array(z.string()) }).parse(await json(assets!, config.headApproval));
  const selection = selectedState.parse(await json(assets!, config.headSelection));
  const earApproval = z.object({ configSha256: hash, decision: z.literal('approved-standing-reference-fit'), fitMeasurements: z.array(z.object({ direction: z.string(), humanFitSha256: hash })) }).parse(await json(assets!, config.earApproval));
  const selected = selection.packs.backDiagonals, accepted = approval.selectedState.packs.backDiagonals, frame = approval.frames.find(f => f.direction === direction);
  if (JSON.stringify(selected) !== JSON.stringify(accepted) || selected.configuration.sourceSha256 !== config.earConfiguration.sourceSha256 || selected.approval.sourceSha256 !== config.earApproval.sourceSha256 || earApproval.configSha256 !== config.earConfiguration.sourceSha256 || earConfig.headConfig.sourceSha256 !== config.headConfiguration.sourceSha256 || headConfig.hairConfig.sourceSha256 !== config.hairConfiguration.sourceSha256 || frame?.bareSha256 !== config.approvedHeadBareSha256 || frame.fitSha256 !== config.approvedHeadFitSha256 || earApproval.fitMeasurements.find(f => f.direction === direction)?.humanFitSha256 !== config.approvedHeadFitSha256) throw new Error(`${direction} body must pin the accepted native head and posterior fit approvals.`);
  for (const [selectedPin, original, prefix] of [[config.originalHead, headConfig.frames[direction].head, 'head/soft-oval-v1/'], [config.originalNeck, headConfig.frames[direction].neck, 'head/soft-oval-v1/'], [config.rearHair, hairConfig.frames[direction].rear, 'hair/long-waves-v1/']] as const) {
    if (selectedPin.source !== prefix + original.source || selectedPin.sourceSha256 !== original.sourceSha256) throw new Error(`${direction} body must preserve same-facing native head, neck and rear hair.`);
  }
  if (earConfig.frames[direction].originalHead.sourceSha256 !== config.originalHead.sourceSha256) throw new Error(`${direction} body requires its original approved complete ear geometry.`);
  const [head, neck, rear, guide, study, body, mask, reference, posedNeck, neckMask] = await Promise.all([load(assets!, config.originalHead), load(assets!, config.originalNeck), load(assets!, config.rearHair), load(root!, config.headGuide), load(root!, config.study, false), load(root!, config.body), load(root!, config.selection, false), load(refs!, config.reference), load(root!, config.posedNeck), load(root!, config.neckSelection, false)]);
  await read(root!, config.provenance);
  const expected = selectBackDiagonalBody(study!, await json(root!, config.settings), direction);
  if (mask!.data.some((v, i) => v !== expected.mask.data[i]) || body!.data.some((v, i) => v !== expected.body.data[i])) throw new Error(`${direction} body must retain native study ownership in the authored silhouette.`);
  let neckTransferredPixels = 0;
  for (let i = 0; i < neck!.data.length; i += 4) {
    const y = Math.floor(i / 4096), selected = y >= cutY && y < neckEndY && neck!.data[i + 3]! >= 8 && body!.data[i + 3]! >= 8;
    if (selected) neckTransferredPixels++;
    for (let c = 0; c < 4; c++) if (neckMask!.data[i + c] !== (selected ? 255 : 0) || posedNeck!.data[i + c] !== (selected ? 0 : neck!.data[i + c])) throw new Error(`${direction} posed neck must preserve every pixel outside its ${direction === 'NE' ? 'fourteen' : 'fifteen'} native attachment rows.`);
  }
  if (!neckTransferredPixels) throw new Error(`${direction} body must supply skin at its bounded neck attachment.`);
  const nativeHead = blankImage(1024, 1536); drawRgba(nativeHead, neck!, 0, 0); drawRgba(nativeHead, head!, 0, 0);
  if (sha256(encodePng(nativeHead)) !== config.approvedHeadBareSha256 || sha256(encodePng(guide!)) !== config.approvedHeadBareSha256) throw new Error(`${direction} body guide must preserve accepted head and neck pixels exactly.`);
  if (options.bodyParts) {
    const required = ['body-torso', 'body-front-arm', 'body-back-arm', 'body-front-leg', 'body-back-leg'];
    if (options.bodyParts.length !== 5 || new Set(options.bodyParts.map(p => p.plane)).size !== 5 || options.bodyParts.some(p => !required.includes(p.plane) || p.image.width !== 1024 || p.image.height !== 1536)) throw new Error('Five explicitly assigned native posterior body planes required; frontal feature planes are forbidden.');
    const reconstructed = blankImage(1024, 1536);
    for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const part of options.bodyParts) if (part.plane === plane) drawRgba(reconstructed, part.image, 0, 0);
    if (reconstructed.data.some((v, i) => v !== body!.data[i])) throw new Error('Posterior body planes must reconstruct the accepted native body exactly.');
  }
  const compose = (withBody: boolean, withHair: boolean) => {
    const im = blankImage(1024, 1536), planes = new Map<RenderPlane, RgbaImage>([['head', head!], ['neck', withBody ? posedNeck! : neck!]]);
    if (withBody) {
      if (options.bodyParts) for (const part of options.bodyParts) planes.set(part.plane, part.image);
      else planes.set('body-torso', body!);
    }
    if (withHair) planes.set('hair-rear', rear!);
    for (const plane of DIRECTION_PLANE_ORDER[direction]) { const layer = planes.get(plane); if (layer) drawRgba(im, layer, 0, 0); }
    return im;
  };
  const bodyFree = compose(false, true), anatomy = compose(true, false), fit = compose(true, true);
  if (sha256(encodePng(bodyFree)) !== config.approvedHeadFitSha256) throw new Error(`${direction} body-free actual composition must match the accepted posterior fit.`);
  let pixels = 0, boundaryPixels = 0, overlapPixels = 0, left = 1024, top = 1536, right = 0, bottom = 0;
  for (let i = 0; i < body!.data.length; i += 4) if (body!.data[i + 3]) {
    const p = i / 4, x = p % 1024, y = Math.floor(p / 1024);
    if (y < cutY) throw new Error(`${direction} body cannot replace the approved head/neck above the native attachment.`);
    pixels++; left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    if (x === 0 || x === 1023 || y === 1535) boundaryPixels++;
    if (rear!.data[i + 3]) overlapPixels++;
  }
  if (pixels < 100_000 || boundaryPixels || !overlapPixels) throw new Error(`Complete unclipped ${direction} body and actual posterior hair overlap required.`);
  const overview = blankImage(3072, 1536);
  for (const [j, im] of [reference!, anatomy, fit].entries()) drawRgba(overview, checkerPreview(im, direction), j * 1024, 0);
  const join = blankImage(1200, 170);
  for (const [j, im] of [reference!, anatomy, fit].entries()) {
    const crop = blankImage(400, 170);
    for (let y = 0; y < 170; y++) crop.data.set(im.data.subarray(((y + 270) * 1024 + 312) * 4, ((y + 270) * 1024 + 712) * 4), y * 400 * 4);
    drawRgba(join, checkerPreview(crop, direction), j * 400, 0);
  }
  const pending = [{ path: `fit/${direction}-anatomy.png`, image: anatomy }, { path: `fit/${direction}.png`, image: fit }, { path: 'overview.png', image: overview }, { path: `inspection/${direction}-neck-shoulder-comparison.png`, image: join }];
  const handRegions = [{ x: 0, y: 300 }, { x: 824, y: 300 }], handInspection = blankImage(1200, 2280);
  let retainedInteriors = 0;
  for (const region of handRegions) for (let y = 0; y < 190; y++) for (let x = 0; x < 200; x++) {
    const i = ((region.y + y) * 1024 + region.x + x) * 4;
    if (study!.data[i + 3]! < 245) continue;
    for (let c = 0; c < 4; c++) if (body!.data[i + c] !== study!.data[i + c]) throw new Error(`${direction} hand envelopes must preserve every native near-opaque finger/palm pixel.`);
    if (anatomy.data[i + 3] !== study!.data[i + 3]) throw new Error(`${direction} native anatomy export must retain intact hand interiors.`);
    retainedInteriors++;
  }
  if (retainedInteriors < 1000) throw new Error(`Complete independent ${direction} hands required.`);
  for (const [row, bg] of [48, 245].entries()) for (const [side, region] of handRegions.entries()) for (const [column, im] of [study!, anatomy].entries()) for (let y = 0; y < 190; y++) for (let x = 0; x < 200; x++) {
    const i = ((region.y + y) * 1024 + region.x + x) * 4, alpha = im.data[i + 3]! / 255;
    for (let sy = 0; sy < 3; sy++) for (let sx = 0; sx < 3; sx++) {
      const p = (((row * 2 + side) * 570 + y * 3 + sy) * 1200 + column * 600 + x * 3 + sx) * 4;
      for (let c = 0; c < 3; c++) handInspection.data[p + c] = Math.round(im.data[i + c]! * alpha + bg * (1 - alpha)); handInspection.data[p + 3] = 255;
    }
  }
  pending.push({ path: `inspection/${direction}-hand-alpha-comparison.png`, image: handInspection });
  if (config.proportionComparison) {
    const comparisons = await Promise.all([load(root!, config.proportionComparison.north), load(root!, config.proportionComparison.previous), load(root!, config.proportionComparison.southeast)]);
    const comparison = blankImage(4096, 1536);
    for (const [column, entry] of [[comparisons[0]!, 'N'], [comparisons[1]!, 'NE'], [anatomy, 'NE'], [comparisons[2]!, 'SE']].entries()) {
      drawRgba(comparison, checkerPreview(entry[0] as RgbaImage, entry[1] as 'N' | 'NE' | 'SE'), column * 1024, 0);
    }
    pending.push({ path: 'inspection/NE-proportion-comparison.png', image: comparison });
  }
  if (config.backProportionComparison) {
    if (direction !== 'NW') throw new Error('NW proportion comparison requires an independently authored NW body.');
    const north = await load(root!, config.backProportionComparison.north), northeast = await load(root!, config.backProportionComparison.northeast);
    const comparison = blankImage(3072, 1536);
    const columns: readonly (readonly [RgbaImage, 'N' | 'NE' | 'NW'])[] = [[north, 'N'], [northeast, 'NE'], [anatomy, 'NW']];
    for (const [column, [im, label]] of columns.entries()) drawRgba(comparison, checkerPreview(im, label), column * 1024, 0);
    pending.push({ path: 'inspection/NW-proportion-comparison.png', image: comparison });
  }
  const report = { nativeHandMeasurements: { retainedInteriors, sourceAlphaPreserved: true }, missingBodyDirections: direction === 'NW' ? [] : ['NW'], footwearCompatibilityApproved: false, futureFootwearFitObligations: config.futureFootwearFitObligations, schemaVersion: 1, id: config.id, assetVersion: 1, configuration, configSha256: sha256(bytes), status: config.status, supportedReviewDirections: [direction], sourcePose: config.sourcePose, nativePosition: config.nativePosition, underlayer: config.underlayer, partitionStatus: config.partitionStatus, compositionOrder: DIRECTION_PLANE_ORDER[direction], hiddenFrontalLayers: ['eyes', 'eyebrows', 'mouth', 'hair-front'], independentlyAuthored: true, preservedHeadBareSha256: config.approvedHeadBareSha256, bodyFreeAssemblySha256: sha256(encodePng(bodyFree)), posedNeckSha256: sha256(encodePng(posedNeck!)), bareSha256: sha256(encodePng(anatomy)), fitSha256: sha256(encodePng(fit)), measurements: { selectedBodyPixels: pixels, boundaryPixels, hairOverlapPixels: overlapPixels, neckTransferredPixels, bounds: { left, top, right, bottom } }, comparisonColumns: ['same-facing standing reference', `independent ${direction} body plus accepted head and local neck attachment`, `actual retained posterior hair plus new ${direction} body`], previewSampling: 'native-copy-no-transforms', published: false, paletteReady: false, productionAnatomyApproved: false, bodyOcclusionVerified: false, tposeApproved: false, finalStep6CAccepted: false, step6DStarted: false, futureBodyFitObligations: approval.futureBodyFitObligations, futureHairstyleFitObligations: approval.futureHairstyleFitObligations, knownReviewIssues: config.knownReviewIssues, outputs: pending.map(p => ({ path: p.path, sha256: sha256(encodePng(p.image)) })) };
  for (const p of [...pending.map(p => ({ path: p.path, bytes: encodePng(p.image) })), { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) {
    const destination = resolve(out, p.path);
    for (let parent = destination; inside(out, parent); parent = dirname(parent)) {
      try { if ((await lstat(parent)).isSymbolicLink()) throw new Error(`${direction} body output symlinks forbidden.`); }
      catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
      if (parent === out) break;
    }
    await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, p.bytes);
  }
  for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error(`${direction} body inputs changed during review.`);
  return report;
}
