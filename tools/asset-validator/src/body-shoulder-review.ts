import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { bodyPartsReviewSchema, prepareBodyPartsReview } from './body-parts-review';
import type { BodyPartsReviewOptions } from './body-parts-review';
import { completeSouthShoulders, southShoulderGeometry } from './body-shoulders';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
export const shoulderReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('body.shoulders.s.v1'), assetVersion: z.literal(1), target: z.literal('detailed'), direction: z.literal('S'), sourcePose: z.literal('tpose-study'), status: z.literal('draft-needs-human-review'),
  published: z.literal(false), productionAnatomyApproved: z.literal(false), concealedJointsApproved: z.literal(false), separateUnderwearAuthored: z.literal(false), footwearCompatibilityApproved: z.literal(false), tposeApproved: z.literal(false), finalStep6CAccepted: z.literal(false),
  baselineConfiguration: pin, baselineApproval: pin, combinedApproval: pin, study: pin, settings: pin, provenance: pin, rightArm: pin, leftArm: pin, rightRetention: pin, leftRetention: pin,
});
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };
const missing = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT';

/** New concealed arm pixels and explicit pose masks; no changes to the accepted visible study. */
export async function prepareShoulderReview(options: BodyPartsReviewOptions) {
  const [root, assets, refs] = await Promise.all([options.sourceDirectory, options.assetDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('Shoulder review outputs and inputs must be disjoint.');
  for (const name of ['fit/S.png', 'inspection/shoulder-comparison.png', 'metadata.json']) for (let p = resolve(out, name); ; p = dirname(p)) {
    try { if ((await lstat(p)).isSymbolicLink() || await realpath(p) !== p) throw new Error('Shoulder output symlinks forbidden.'); }
    catch (e) { if (!missing(e)) throw e; }
    if (dirname(p) === p) break;
  }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Ordinary pinned shoulder inputs required.');
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && digest !== p.sourceSha256) throw new Error('Shoulder pinned input changed: ' + p.source);
    inputs.set(path, digest); return bytes;
  };
  const bytes = await read(root!, { source: 'authoring.json' }), config = shoulderReviewSchema.parse(JSON.parse(bytes.toString('utf8')));
  if (config.baselineConfiguration.source !== 'body/parts-v1/authoring.json' || config.baselineApproval.source !== 'body/parts-v1/review-fit-v1.json' || config.combinedApproval.source !== 'body/parts-assembly-v1/review-fit-v1.json') throw new Error('S shoulders require their exact accepted part checkpoints.');
  const baseline = bodyPartsReviewSchema.parse(JSON.parse((await read(assets!, config.baselineConfiguration)).toString('utf8')));
  const approval = z.object({ configurationSha256: hash, decision: z.literal('approved-native-s-body-part-study'), direction: z.literal('S'), currentStudyPartsApproved: z.literal(true), bodySha256: hash, bareSha256: hash, fitSha256: hash }).parse(JSON.parse((await read(assets!, config.baselineApproval)).toString('utf8')));
  const combined = z.object({ configuration: z.literal('review-selection.json'), configurationSha256: hash, decision: z.literal('approved-eight-facing-visible-body-part-studies-and-isolation-review'), crossFacingPartSetApproved: z.literal(true), frames: z.array(z.object({ direction: z.string(), directory: z.string(), configuration: pin, approval: pin, bodySha256: hash, bareSha256: hash, fitSha256: hash })) }).parse(JSON.parse((await read(assets!, config.combinedApproval)).toString('utf8')));
  await read(assets!, { source: 'body/parts-assembly-v1/' + combined.configuration, sourceSha256: combined.configurationSha256 });
  const selectedS = combined.frames.find(f => f.direction === 'S');
  if (approval.configurationSha256 !== config.baselineConfiguration.sourceSha256 || !selectedS || selectedS.directory !== 'body/parts-v1' || selectedS.configuration.source !== 'authoring.json' || selectedS.configuration.sourceSha256 !== config.baselineConfiguration.sourceSha256 || selectedS.approval.source !== 'review-fit-v1.json' || selectedS.approval.sourceSha256 !== config.baselineApproval.sourceSha256 || ['bodySha256','bareSha256','fitSha256'].some(k => selectedS[k as 'bodySha256'] !== approval[k as 'bodySha256'])) throw new Error('S shoulder baseline must match the individual and combined approvals.');
  const settings = JSON.parse((await read(root!, config.settings)).toString('utf8'));
  if (settings.method !== 'native-s-concealed-shoulder-roots' || settings.study !== config.study.source || !isDeepStrictEqual(settings.geometry, southShoulderGeometry)) throw new Error('S shoulder native root contours changed.');
  const provenance = z.object({ tool: z.literal('built-in imagegen'), selectedStudy: z.literal(config.study.source), prompts: pin, replay: pin }).parse(JSON.parse((await read(root!, config.provenance)).toString('utf8')));
  await read(root!, provenance.prompts); await read(root!, provenance.replay);
  const load = async (base: string, pin: { source: string; sourceSha256: string }) => decodePng(await read(base, pin));
  const [study, ...parts] = await Promise.all([load(root!, config.study), ...baseline.parts.map(p => load(resolve(assets!, 'body/parts-v1'), p))]);
  const expected = completeSouthShoulders(study!, parts[0]!, parts[1]!, parts[2]!);
  const [right, left, rightMask, leftMask] = await Promise.all([config.rightArm, config.leftArm, config.rightRetention, config.leftRetention].map(p => load(root!, p)));
  for (const [actual, wanted] of [[right, expected.right], [left, expected.left], [rightMask, expected.rightRetention], [leftMask, expected.leftRetention]] as const) if (actual!.width !== 1024 || actual!.height !== 1536 || actual!.data.some((v, p) => v !== wanted!.data[p])) throw new Error('S shoulder native completion or pose-retention mask changed.');
  const retain = (arm: RgbaImage, mask: RgbaImage) => {
    const image = { ...arm, data: arm.data.slice() };
    for (let p = 0; p < image.data.length; p += 4) { image.data[p + 3] = Math.round(arm.data[p + 3]! * mask.data[p + 3]! / 255); if (!image.data[p + 3]) image.data.fill(0, p, p + 4); }
    return image;
  };
  const maskedRight = retain(right!, rightMask!), maskedLeft = retain(left!, leftMask!);
  if ([maskedRight, maskedLeft].some((im, j) => im.data.some((v, p) => v !== parts[j + 1]!.data[p]))) throw new Error('S pose masks must retain all approved arm RGBA exactly.');
  const [head, front, rear] = await Promise.all([baseline.head, baseline.frontHair, baseline.rearHair].map(p => load(assets!, p)));
  const compose = (withHead: boolean, withHair: boolean, masked = true) => {
    const image = blankImage(1024, 1536), layers = new Map<RenderPlane, RgbaImage>();
    for (const [i, p] of baseline.parts.entries()) layers.set(p.plane, i === 1 ? masked ? maskedRight : right! : i === 2 ? masked ? maskedLeft : left! : parts[i]!);
    if (withHead) layers.set('head', head!);
    if (withHair) { layers.set('hair-front', front!); layers.set('hair-rear', rear!); }
    for (const plane of DIRECTION_PLANE_ORDER.S) { const layer = layers.get(plane); if (layer) drawRgba(image, layer, 0, 0); }
    return image;
  };
  const body = compose(false, false), anatomy = compose(true, false), fit = compose(true, true), bodySha256 = sha256(encodePng(body)), bareSha256 = sha256(encodePng(anatomy)), fitSha256 = sha256(encodePng(fit));
  if (bodySha256 !== approval.bodySha256 || bareSha256 !== approval.bareSha256 || fitSha256 !== approval.fitSha256) throw new Error('S shoulder composition must reproduce the approved body, anatomy and actual hair fit.');
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-shoulder-baseline-'));
  try {
    const accepted = await prepareBodyPartsReview({ ...options, sourceDirectory: resolve(assets!, 'body/parts-v1'), outputDirectory: temporary });
    if (accepted.configSha256 !== config.baselineConfiguration.sourceSha256 || accepted.bodySha256 !== bodySha256 || accepted.bareSha256 !== bareSha256 || accepted.fitSha256 !== fitSha256) throw new Error('Actual accepted S pipeline no longer matches its shoulder-study checkpoint.');
  } finally { await rm(temporary, { recursive: true, force: true }); }
  const unmasked = compose(false, false, false); let unmaskedChangedPixels = 0;
  for (let p = 0; p < body.data.length; p += 4) if (unmasked.data.subarray(p, p + 4).some((v, c) => v !== body.data[p + c])) unmaskedChangedPixels++;
  if (unmaskedChangedPixels < 500) throw new Error('S shoulder study must exercise explicit native root occlusion.');
  // Three-times nearest inspection only; source arms and actual full fit stay native.
  const comparison = blankImage(1584, 960);
  for (const [row, x] of [336, 512].entries()) for (const [column, image] of [parts[row + 1]!, [right!, left!][row]!, anatomy].entries()) {
    const checker = checkerPreview(image, 'S');
    for (let y = 0; y < 160; y++) for (let xx = 0; xx < 176; xx++) for (let dy = 0; dy < 3; dy++) for (let dx = 0; dx < 3; dx++) comparison.data.set(checker.data.subarray(((288 + y) * 1024 + x + xx) * 4, ((288 + y) * 1024 + x + xx) * 4 + 4), ((row * 480 + y * 3 + dy) * 1584 + column * 528 + xx * 3 + dx) * 4);
  }
  const pending = [{ path: 'fit/S.png', bytes: encodePng(fit) }, { path: 'inspection/shoulder-comparison.png', bytes: encodePng(comparison) }];
  const report = { schemaVersion: 1, id: config.id, configSha256: sha256(bytes), status: config.status, target: 'detailed', sourcePose: config.sourcePose, supportedReviewDirections: ['S'], baselineConfiguration: config.baselineConfiguration, baselineApproval: config.baselineApproval, combinedApproval: config.combinedApproval, compositionOrder: DIRECTION_PLANE_ORDER.S,
    bodySha256, bareSha256, fitSha256, exactApprovedFit: true, measurements: { addedRootPixels: { right: expected.addedPixels[0], left: expected.addedPixels[1] }, changedApprovedArmPixels: 0, unmaskedChangedPixels, poseMasksRequired: ['right-arm','left-arm'], generatedVisiblePixels: 0 },
    comparison: { rows: ['physical-right arm / screen-left', 'physical-left arm / screen-right'], columns: ['approved visible cut', 'new complete proximal root without pose mask', 'actual retained arm and torso fit'], inspectionScale: 3, sampling: 'nearest-inspection-only' },
    published: false, paletteReady: false, productionAnatomyApproved: false, concealedJointsApproved: false, separateUnderwearAuthored: false, footwearCompatibilityApproved: false, tposeApproved: false, finalStep6CAccepted: false, step6DStarted: false,
    reviewRequired: ['Review each newly painted proximal shoulder cap and its junction with the retained visible arm.', 'Only a bounded S shoulder-root study; full concealed joint/torso/limb geometry and rig acceptance remain unfinished.'], outputs: pending.map(p => ({ path: p.path, sha256: sha256(p.bytes) })) };
  for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error('Shoulder input changed during review.');
  for (const file of [...pending, { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) { await mkdir(dirname(resolve(out, file.path)), { recursive: true }); await writeFile(resolve(out, file.path), file.bytes); }
  return report;
}
