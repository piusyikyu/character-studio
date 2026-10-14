import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { northBodyReviewSchema } from './body-north-review';
import type { NorthBodyReviewOptions } from './body-north-review';
import { loadBrowReview } from './brow-review';
import { selectProfileBody } from './body-silhouette';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
export const profileBodyReviewSchema = northBodyReviewSchema.omit({ headConfiguration: true, hairConfiguration: true, originalHead: true, originalNeck: true, rearHair: true, reference: true }).extend({
  id: z.literal('body.profiles.v1'), direction: z.literal('E'), browConfiguration: pin, browApproval: pin,
  footwearCompatibilityApproved: z.literal(false), futureFootwearFitObligations: z.array(z.string().min(1)).min(1),
});
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };

/** Independent E anatomy study; accepted facial/hair sources stay native and immutable. */
export async function prepareProfileBodyReview(options: NorthBodyReviewOptions) {
  const [root, assets, refs] = await Promise.all([options.sourceDirectory, options.assetDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('Profile body outputs and inputs must be disjoint.');
  for (let p = out; ; p = dirname(p)) {
    try { if (await realpath(p) !== p) throw new Error('Profile body outputs cannot traverse symlinks.'); break; }
    catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
  }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Ordinary pinned profile body inputs required.');
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && digest !== p.sourceSha256) throw new Error(p.source + ': pinned profile body source changed; author a new revision.');
    inputs.set(path, digest); return bytes;
  };
  const json = async (base: string, p: { source: string; sourceSha256?: string }) => JSON.parse((await read(base, p)).toString('utf8')) as unknown;
  const load = async (base: string, p: { source: string; sourceSha256: string }, normalize = true) => {
    const image = decodePng(await read(base, p));
    if (image.width !== 1024 || image.height !== 1536) throw new Error('Native 1024x1536 profile body input required.');
    if (normalize) for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4);
    return image;
  };
  const bytes = await read(root!, { source: 'authoring.json' }), config = profileBodyReviewSchema.parse(JSON.parse(bytes.toString('utf8')));
  const paths = { headSelection: 'head/assembly-v1/review-selection.json', headApproval: 'head/assembly-v1/review-fit-v1.json', browConfiguration: 'face/reference-v1/brows-v1/authoring.json', browApproval: 'face/reference-v1/brows-v1/review-fit-v1.json', earConfiguration: 'ears/human-v1/profiles-v1/authoring.json', earApproval: 'ears/human-v1/profiles-v1/review-fit-v1.json' } as const;
  for (const [key, path] of Object.entries(paths)) if (config[key as keyof typeof paths].source !== path) throw new Error('Profile body requires the accepted native E head/ear/brow selection.');
  const pack = z.object({ directory: z.literal('ears/human-v1/profiles-v1'), configuration: pin, approval: pin });
  const selected = z.object({ packs: z.object({ profiles: pack }), frames: z.object({ E: z.literal('profiles') }), browCompletion: pin, browApproval: pin });
  const selection = selected.parse(await json(assets!, config.headSelection));
  const approval = z.object({ decision: z.literal('approved-standing-reference-head-set'), standingReferenceHeadSetApproved: z.literal(true), selectedState: selected, frames: z.array(z.object({ direction: z.string(), fitSha256: hash, bareSha256: hash })), futureBodyFitObligations: z.array(z.string()), futureHairstyleFitObligations: z.array(z.string()) }).parse(await json(assets!, config.headApproval));
  const browApproval = z.object({ configSha256: hash, decision: z.literal('approved-standing-reference-fit'), fitMeasurements: z.array(z.object({ direction: z.string(), outputSha256: hash, bareSha256: hash })) }).parse(await json(assets!, config.browApproval));
  await read(assets!, config.earConfiguration);
  const earApproval = z.object({ configSha256: hash, decision: z.literal('approved-standing-reference-fit') }).parse(await json(assets!, config.earApproval));
  const accepted = approval.frames.find(f => f.direction === 'E'), browFit = browApproval.fitMeasurements.find(f => f.direction === 'E');
  if (JSON.stringify(selection) !== JSON.stringify(approval.selectedState) || selection.packs.profiles.configuration.sourceSha256 !== config.earConfiguration.sourceSha256 || selection.packs.profiles.approval.sourceSha256 !== config.earApproval.sourceSha256 || earApproval.configSha256 !== config.earConfiguration.sourceSha256 || selection.browCompletion.sourceSha256 !== config.browConfiguration.sourceSha256 || selection.browApproval.sourceSha256 !== config.browApproval.sourceSha256 || browApproval.configSha256 !== config.browConfiguration.sourceSha256 || accepted?.fitSha256 !== config.approvedHeadFitSha256 || accepted.bareSha256 !== config.approvedHeadBareSha256 || browFit?.outputSha256 !== config.approvedHeadFitSha256 || browFit.bareSha256 !== config.approvedHeadBareSha256) throw new Error('Profile body approvals must match accepted E facial and hair hashes.');
  const browBytes = await read(assets!, config.browConfiguration);
  const brow = await loadBrowReview({ sourceDirectory: resolve(assets!, 'face/reference-v1/brows-v1'), assetDirectory: assets!, referenceDirectory: refs!, configuration: { source: 'authoring.json', sourceSha256: sha256(browBytes) } });
  const frame = brow.frames.get('E')!, baseline = brow.config.frames.E;
  if (sha256(encodePng(frame.fit)) !== config.approvedHeadFitSha256 || sha256(encodePng(frame.bare)) !== config.approvedHeadBareSha256) throw new Error('Profile body must preserve the actual accepted E native head/hair composition.');
  const [guide, study, body, mask, posedNeck, neckMask] = await Promise.all([load(root!, config.headGuide), load(root!, config.study, false), load(root!, config.body), load(root!, config.selection, false), load(root!, config.posedNeck), load(root!, config.neckSelection, false)]);
  const settings = await json(root!, config.settings); await read(root!, config.provenance);
  const expected = selectProfileBody(study!, settings);
  if (body!.data.some((v, i) => v !== expected.body.data[i]) || mask!.data.some((v, i) => v !== expected.mask.data[i])) throw new Error('E body must retain native study ownership in the authored silhouette.');
  if (sha256(encodePng(guide!)) !== config.approvedHeadBareSha256) throw new Error('E guide must preserve the exact accepted head/neck/ear/facial pixels.');
  let neckTransferredPixels = 0;
  for (let i = 0; i < frame.neck.data.length; i += 4) {
    const y = Math.floor(i / 4096), selected = y >= 300 && y < 311 && frame.neck.data[i + 3]! >= 8 && body!.data[i + 3]! >= 8;
    if (selected) neckTransferredPixels++;
    for (let c = 0; c < 4; c++) if (neckMask!.data[i + c] !== (selected ? 255 : 0) || posedNeck!.data[i + c] !== (selected ? 0 : frame.neck.data[i + c])) throw new Error('E posed neck must preserve every pixel outside its bounded attachment rows.');
  }
  if (!neckTransferredPixels) throw new Error('E body must supply skin at its bounded neck attachment.');
  const features = await Promise.all(baseline.baseline.features.filter(f => f.plane !== 'eyebrows').map(async f => ({ plane: f.plane, image: await load(assets!, f) })));
  const compose = (withBody: boolean, withHair: boolean) => {
    const image = blankImage(1024, 1536), planes = new Map<RenderPlane, RgbaImage[]>([['head', [frame.head]], ['neck', [withBody ? posedNeck! : frame.neck]], ['eyebrows', frame.brows]]);
    for (const f of features) planes.set(f.plane, [...planes.get(f.plane) ?? [], f.image]);
    if (withBody) planes.set('body-torso', [body!]); if (withHair) { planes.set('hair-rear', [frame.rear]); planes.set('hair-front', [frame.front]); }
    for (const plane of DIRECTION_PLANE_ORDER.E) for (const layer of planes.get(plane) ?? []) drawRgba(image, layer, 0, 0);
    return image;
  };
  const bodyFree = compose(false, true), anatomy = compose(true, false), fit = compose(true, true);
  if (sha256(encodePng(bodyFree)) !== config.approvedHeadFitSha256) throw new Error('E body-free composition must retain the accepted posterior/front hair and facial planes.');
  let pixels = 0, boundaryPixels = 0, frontOverlap = 0, rearOverlap = 0, left = 1024, top = 1536, right = 0, bottom = 0;
  for (let i = 0; i < body!.data.length; i += 4) if (body!.data[i + 3]) {
    const p = i / 4, x = p % 1024, y = Math.floor(p / 1024);
    if (y < 300) throw new Error('E body cannot replace head/face above the bounded neck attachment.');
    pixels++; left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    if (x === 0 || x === 1023 || y === 1535) boundaryPixels++;
    if (frame.front.data[i + 3]) frontOverlap++; if (frame.rear.data[i + 3]) rearOverlap++;
  }
  if (pixels < 80_000 || boundaryPixels || !frontOverlap || !rearOverlap) throw new Error('Complete unclipped E study and actual same-facing hair overlap required.');
  const overview = blankImage(3072, 1536);
  for (const [j, image] of [frame.reference, anatomy, fit].entries()) drawRgba(overview, checkerPreview(image, 'E'), j * 1024, 0);
  const join = blankImage(1140, 200);
  for (const [j, image] of [frame.reference, anatomy, fit].entries()) {
    const crop = blankImage(380, 200); for (let y = 0; y < 200; y++) crop.data.set(image.data.subarray(((y + 260) * 1024 + 400) * 4, ((y + 260) * 1024 + 780) * 4), y * 380 * 4);
    drawRgba(join, checkerPreview(crop, 'E'), j * 380, 0);
  }
  const pending = [{ path: 'fit/E-anatomy.png', image: anatomy }, { path: 'fit/E.png', image: fit }, { path: 'overview.png', image: overview }, { path: 'inspection/E-neck-shoulder-comparison.png', image: join }];
  const report = { schemaVersion: 1, id: config.id, assetVersion: 1, configuration: 'authoring.json', configSha256: sha256(bytes), status: config.status, supportedReviewDirections: ['E'], sourcePose: config.sourcePose, nativePosition: config.nativePosition, independentlyAuthored: true, underlayer: config.underlayer, partitionStatus: config.partitionStatus, compositionOrder: DIRECTION_PLANE_ORDER.E, preservedHeadBareSha256: config.approvedHeadBareSha256, bodyFreeAssemblySha256: sha256(encodePng(bodyFree)), bareSha256: sha256(encodePng(anatomy)), fitSha256: sha256(encodePng(fit)), posedNeckSha256: sha256(encodePng(posedNeck!)), measurements: { selectedBodyPixels: pixels, boundaryPixels, neckTransferredPixels, frontHairOverlapPixels: frontOverlap, rearHairOverlapPixels: rearOverlap, bounds: { left, top, right, bottom } }, comparisonColumns: ['same-facing standing reference', 'independent E body with accepted facial layers and local neck attachment', 'actual same-facing front/rear hair fit'], previewSampling: 'native-copy-no-transforms', published: false, paletteReady: false, productionAnatomyApproved: false, bodyOcclusionVerified: false, footwearCompatibilityApproved: false, tposeApproved: false, finalStep6CAccepted: false, step6DStarted: false, futureFootwearFitObligations: config.futureFootwearFitObligations, futureBodyFitObligations: approval.futureBodyFitObligations, futureHairstyleFitObligations: approval.futureHairstyleFitObligations, knownReviewIssues: config.knownReviewIssues, outputs: pending.map(p => ({ path: p.path, sha256: sha256(encodePng(p.image)) })) };
  for (const p of [...pending.map(p => ({ path: p.path, bytes: encodePng(p.image) })), { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) {
    const path = resolve(out, p.path);
    for (let parent = path; inside(out, parent); parent = dirname(parent)) {
      try { if ((await lstat(parent)).isSymbolicLink()) throw new Error('Profile body output symlinks forbidden.'); }
      catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; }
      if (parent === out) break;
    }
    await mkdir(dirname(path), { recursive: true }); await writeFile(path, p.bytes);
  }
  await brow.verifyInputs(); for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error('Profile body inputs changed during review.');
  return report;
}
