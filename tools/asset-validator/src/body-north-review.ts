import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';
import { selectNorthBody } from './body-silhouette';
import { headReviewSchema } from './head-review-schema';
import { northEarReviewSchema } from './ear-north-review';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
export const northBodyReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('body.north.v1'), assetVersion: z.literal(1), direction: z.literal('N'), target: z.literal('detailed'),
  nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }), nativePosition: z.strictObject({ x: z.literal(0), y: z.literal(0) }),
  sourcePose: z.literal('tpose-study'), intendedRuntimePose: z.literal('tpose'), status: z.literal('draft-needs-human-review'),
  published: z.literal(false), paletteReady: z.literal(false), productionAnatomyApproved: z.literal(false), bodyOcclusionVerified: z.literal(false), tposeApproved: z.literal(false), finalStep6CAccepted: z.literal(false),
  underlayer: z.literal('ordinary-daily-bra-and-panties'), bodyPlane: z.literal('body-torso'), partitionStatus: z.literal('whole-body-study-not-final-limb-partition'),
  headConfiguration: pin, hairConfiguration: pin, headSelection: pin, headApproval: pin, earConfiguration: pin, earApproval: pin,
  originalHead: pin, originalNeck: pin, rearHair: pin, headGuide: pin, approvedHeadBareSha256: hash, approvedHeadFitSha256: hash,
  reference: pin.extend({ source: z.literal('N.png') }), study: pin, body: pin, selection: pin, settings: pin, provenance: pin, posedNeck: pin, neckSelection: pin, knownReviewIssues: z.array(z.string().min(1)).min(1),
});
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };
export interface NorthBodyReviewOptions { readonly sourceDirectory: string; readonly assetDirectory: string; readonly referenceDirectory: string; readonly outputDirectory: string }

/** Independently authored full-back anatomy and real N hair depth, offline only. */
export async function prepareNorthBodyReview(options: NorthBodyReviewOptions) {
  const [root, assets, refs] = await Promise.all([options.sourceDirectory, options.assetDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('North body outputs and inputs must be disjoint.');
  for (let p = out; ; p = dirname(p)) {
    try { if (await realpath(p) !== p) throw new Error('North body outputs cannot traverse symlinks.'); break; }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
  }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Ordinary pinned native N inputs required.');
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && digest !== p.sourceSha256) throw new Error(p.source + ': pinned N input changed; author a new revision.');
    inputs.set(path, digest); return bytes;
  };
  const json = async (base: string, p: { source: string; sourceSha256?: string }) => JSON.parse((await read(base, p)).toString('utf8')) as unknown;
  const load = async (base: string, p: { source: string; sourceSha256: string }, normalize = true) => {
    const im = decodePng(await read(base, p));
    if (im.width !== 1024 || im.height !== 1536) throw new Error('Native 1024x1536 N body inputs required.');
    if (normalize) for (let i = 0; i < im.data.length; i += 4) if (im.data[i + 3]! < 8) im.data.fill(0, i, i + 4);
    return im;
  };
  const bytes = await read(root!, { source: 'authoring.json' }), config = northBodyReviewSchema.parse(JSON.parse(bytes.toString('utf8')));
  const paths = { headConfiguration: 'head/soft-oval-v1/authoring-v5.json', hairConfiguration: 'hair/long-waves-v1/authoring-v1.json', headSelection: 'head/assembly-v1/review-selection.json', headApproval: 'head/assembly-v1/review-fit-v1.json', earConfiguration: 'ears/human-v1/north-v1/authoring.json', earApproval: 'ears/human-v1/north-v1/review-fit-v1.json' } as const;
  for (const [key, path] of Object.entries(paths)) if (config[key as keyof typeof paths].source !== path) throw new Error('Accepted independently authored N head/hair selection required.');
  const headConfig = headReviewSchema.parse(await json(assets!, config.headConfiguration));
  const earConfig = northEarReviewSchema.parse(await json(assets!, config.earConfiguration));
  const hairConfig = z.object({ frames: z.object({ N: z.object({ rear: z.object({ source, sourceSha256: hash }), front: z.object({ visibility: z.literal('hidden') }) }) }) }).parse(await json(assets!, config.hairConfiguration));
  const approval = z.object({ decision: z.literal('approved-standing-reference-head-set'), standingReferenceHeadSetApproved: z.literal(true), selectedState: z.object({ packs: z.object({ north: z.object({ directory: z.literal('ears/human-v1/north-v1'), configuration: pin, approval: pin }) }), frames: z.object({ N: z.literal('north') }) }), frames: z.array(z.object({ direction: z.string(), bareSha256: hash, fitSha256: hash })), futureBodyFitObligations: z.array(z.string()), futureHairstyleFitObligations: z.array(z.string()) }).parse(await json(assets!, config.headApproval));
  const selection = z.object({ packs: z.object({ north: z.object({ directory: z.literal('ears/human-v1/north-v1'), configuration: pin, approval: pin }) }), frames: z.object({ N: z.literal('north') }) }).parse(await json(assets!, config.headSelection));
  const earApproval = z.object({ configSha256: hash, decision: z.literal('approved-standing-reference-fit'), fitMeasurements: z.array(z.object({ direction: z.literal('N'), humanFitSha256: hash })).length(1) }).parse(await json(assets!, config.earApproval));
  const selected = selection.packs.north, accepted = approval.selectedState.packs.north, frame = approval.frames.find(f => f.direction === 'N');
  if (JSON.stringify(selected) !== JSON.stringify(accepted) || selected.configuration.sourceSha256 !== config.earConfiguration.sourceSha256 || selected.approval.sourceSha256 !== config.earApproval.sourceSha256 || earApproval.configSha256 !== config.earConfiguration.sourceSha256 || earConfig.headConfig.sourceSha256 !== config.headConfiguration.sourceSha256 || headConfig.hairConfig.sourceSha256 !== config.hairConfiguration.sourceSha256 || frame?.bareSha256 !== config.approvedHeadBareSha256 || frame.fitSha256 !== config.approvedHeadFitSha256 || earApproval.fitMeasurements[0]!.humanFitSha256 !== config.approvedHeadFitSha256) throw new Error('N body must pin the accepted native head and posterior fit approvals.');
  for (const [selectedPin, original, prefix] of [[config.originalHead, headConfig.frames.N.head, 'head/soft-oval-v1/'], [config.originalNeck, headConfig.frames.N.neck, 'head/soft-oval-v1/'], [config.rearHair, hairConfig.frames.N.rear, 'hair/long-waves-v1/']] as const) {
    if (selectedPin.source !== prefix + original.source || selectedPin.sourceSha256 !== original.sourceSha256) throw new Error('N body must preserve same-facing native head, neck and rear hair.');
  }
  const [head, neck, rear, guide, study, body, mask, reference, posedNeck, neckMask] = await Promise.all([load(assets!, config.originalHead), load(assets!, config.originalNeck), load(assets!, config.rearHair), load(root!, config.headGuide), load(root!, config.study, false), load(root!, config.body), load(root!, config.selection, false), load(refs!, config.reference), load(root!, config.posedNeck), load(root!, config.neckSelection, false)]);
  await read(root!, config.provenance);
  const expected = selectNorthBody(study!, await json(root!, config.settings));
  if (mask!.data.some((v, i) => v !== expected.mask.data[i]) || body!.data.some((v, i) => v !== expected.body.data[i])) throw new Error('N body must retain native study ownership in the authored silhouette.');
  let neckTransferredPixels = 0;
  for (let i = 0; i < neck!.data.length; i += 4) {
    const y = Math.floor(i / 4096), selected = y >= 312 && y < 314 && neck!.data[i + 3]! >= 8 && body!.data[i + 3]! >= 8;
    if (selected) neckTransferredPixels++;
    for (let c = 0; c < 4; c++) if (neckMask!.data[i + c] !== (selected ? 255 : 0) || posedNeck!.data[i + c] !== (selected ? 0 : neck!.data[i + c])) throw new Error('N posed neck must preserve every pixel outside its two native attachment rows.');
  }
  if (!neckTransferredPixels) throw new Error('N body must supply skin at its bounded neck attachment.');
  const nativeHead = blankImage(1024, 1536); drawRgba(nativeHead, neck!, 0, 0); drawRgba(nativeHead, head!, 0, 0);
  if (sha256(encodePng(nativeHead)) !== config.approvedHeadBareSha256 || sha256(encodePng(guide!)) !== config.approvedHeadBareSha256) throw new Error('N body guide must preserve accepted head and neck pixels exactly.');
  const compose = (withBody: boolean, withHair: boolean) => {
    const im = blankImage(1024, 1536), planes = new Map<RenderPlane, RgbaImage>([['head', head!], ['neck', withBody ? posedNeck! : neck!]]);
    if (withBody) planes.set('body-torso', body!); if (withHair) planes.set('hair-rear', rear!);
    for (const plane of DIRECTION_PLANE_ORDER.N) { const layer = planes.get(plane); if (layer) drawRgba(im, layer, 0, 0); }
    return im;
  };
  const bodyFree = compose(false, true), anatomy = compose(true, false), fit = compose(true, true);
  if (sha256(encodePng(bodyFree)) !== config.approvedHeadFitSha256) throw new Error('N body-free actual composition must match the accepted posterior fit.');
  let pixels = 0, boundaryPixels = 0, overlapPixels = 0, left = 1024, top = 1536, right = 0, bottom = 0;
  for (let i = 0; i < body!.data.length; i += 4) if (body!.data[i + 3]) {
    const p = i / 4, x = p % 1024, y = Math.floor(p / 1024);
    if (y < 312) throw new Error('N body cannot replace the approved head/neck above the native attachment.');
    pixels++; left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    if (x === 0 || x === 1023 || y === 1535) boundaryPixels++;
    if (rear!.data[i + 3]) overlapPixels++;
  }
  if (pixels < 100_000 || boundaryPixels || !overlapPixels) throw new Error('Complete unclipped N body and actual posterior hair overlap required.');
  const overview = blankImage(3072, 1536);
  for (const [j, im] of [reference!, anatomy, fit].entries()) drawRgba(overview, checkerPreview(im, 'N'), j * 1024, 0);
  const join = blankImage(1200, 170);
  for (const [j, im] of [reference!, anatomy, fit].entries()) {
    const crop = blankImage(400, 170);
    for (let y = 0; y < 170; y++) crop.data.set(im.data.subarray(((y + 270) * 1024 + 312) * 4, ((y + 270) * 1024 + 712) * 4), y * 400 * 4);
    drawRgba(join, checkerPreview(crop, 'N'), j * 400, 0);
  }
  const pending = [{ path: 'fit/N-anatomy.png', image: anatomy }, { path: 'fit/N.png', image: fit }, { path: 'overview.png', image: overview }, { path: 'inspection/N-neck-shoulder-comparison.png', image: join }];
  const report = { schemaVersion: 1, id: config.id, assetVersion: 1, configuration: 'authoring.json', configSha256: sha256(bytes), status: config.status, supportedReviewDirections: ['N'], sourcePose: config.sourcePose, nativePosition: config.nativePosition, underlayer: config.underlayer, partitionStatus: config.partitionStatus, compositionOrder: DIRECTION_PLANE_ORDER.N, hiddenFrontalLayers: ['eyes', 'eyebrows', 'mouth', 'hair-front'], independentlyAuthored: true, preservedHeadBareSha256: config.approvedHeadBareSha256, bodyFreeAssemblySha256: sha256(encodePng(bodyFree)), posedNeckSha256: sha256(encodePng(posedNeck!)), bareSha256: sha256(encodePng(anatomy)), fitSha256: sha256(encodePng(fit)), measurements: { selectedBodyPixels: pixels, boundaryPixels, hairOverlapPixels: overlapPixels, neckTransferredPixels, bounds: { left, top, right, bottom } }, comparisonColumns: ['same-facing standing reference', 'independent N body plus accepted head and local neck attachment', 'actual retained posterior hair plus new N body'], previewSampling: 'native-copy-no-transforms', published: false, paletteReady: false, productionAnatomyApproved: false, bodyOcclusionVerified: false, tposeApproved: false, finalStep6CAccepted: false, step6DStarted: false, futureBodyFitObligations: approval.futureBodyFitObligations, futureHairstyleFitObligations: approval.futureHairstyleFitObligations, knownReviewIssues: config.knownReviewIssues, outputs: pending.map(p => ({ path: p.path, sha256: sha256(encodePng(p.image)) })) };
  for (const p of [...pending.map(p => ({ path: p.path, bytes: encodePng(p.image) })), { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) {
    const destination = resolve(out, p.path);
    for (let parent = destination; inside(out, parent); parent = dirname(parent)) {
      try { if ((await lstat(parent)).isSymbolicLink()) throw new Error('N body output symlinks forbidden.'); }
      catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
      if (parent === out) break;
    }
    await mkdir(dirname(destination), { recursive: true }); await writeFile(destination, p.bytes);
  }
  for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error('N body inputs changed during review.');
  return report;
}
