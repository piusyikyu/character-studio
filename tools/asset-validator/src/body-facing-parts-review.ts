import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { z } from 'zod';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import { eastBodyPartLayout, eastBodyPartsGeometry, partitionEastBody, westBodyPartLayout, westBodyPartsGeometry, partitionWestBody } from './body-profile-parts';
import { prepareProfileBodyReview, prepareFrontDiagonalBodyReview, profileBodyReviewSchema, westBodyReviewV2Schema, frontDiagonalBodyReviewV2Schema } from './body-profile-review';
import type { BodyPartsReviewOptions } from './body-parts-review';
import { southeastBodyPartLayout, southeastBodyPartsGeometry, partitionSoutheastBody } from './body-diagonal-parts';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
const identity = z.strictObject({ id: z.enum(['torso','right-arm','left-arm','right-leg','left-leg']), plane: z.enum(['body-torso','body-front-arm','body-back-arm','body-front-leg','body-back-leg']), characterSide: z.enum(['center','right','left']) });
const partSchema = <T extends string>(reason: T) => z.discriminatedUnion('visibility', [identity.extend({ visibility: z.literal('visible'), artwork: pin }), identity.extend({ visibility: z.literal('occluded-unavailable'), reason: z.literal(reason) })]);
export const eastBodyPartsReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('body.parts.east.v1'), assetVersion: z.literal(1), direction: z.literal('E'), target: z.literal('detailed'),
  sourcePose: z.literal('tpose-study'), status: z.literal('draft-needs-human-review'), published: z.literal(false), paletteReady: z.literal(false),
  productionAnatomyApproved: z.literal(false), concealedJointsApproved: z.literal(false), separateUnderwearAuthored: z.literal(false), tposeApproved: z.literal(false), finalStep6CAccepted: z.literal(false),
  baselineConfiguration: pin, baselineApproval: pin, wholeBody: pin, settings: pin, provenance: pin, parts: z.array(partSchema('No separately recoverable far-side artwork in the accepted E study.')).length(5),
});
export const westBodyPartsReviewSchema = eastBodyPartsReviewSchema.extend({ id: z.literal('body.parts.west.v1'), direction: z.literal('W'), parts: z.array(partSchema('No separately recoverable far-side artwork in the accepted W study.')).length(5) });
export const southeastBodyPartsReviewSchema = eastBodyPartsReviewSchema.extend({ id: z.literal('body.parts.southeast.v1'), direction: z.literal('SE'), parts: z.array(identity.extend({ visibility: z.literal('visible'), artwork: pin })).length(5) });
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };
const missing = (e: unknown) => (e as NodeJS.ErrnoException).code === 'ENOENT';

/** Visible source ownership only. Far-side geometry stays explicitly unavailable. */
export const prepareEastBodyPartsReview = (options: BodyPartsReviewOptions) => prepareNativeFacingPartsReview(options, 'E');
export const prepareWestBodyPartsReview = (options: BodyPartsReviewOptions) => prepareNativeFacingPartsReview(options, 'W');
export const prepareSoutheastBodyPartsReview = (options: BodyPartsReviewOptions) => prepareNativeFacingPartsReview(options, 'SE');
async function prepareNativeFacingPartsReview(options: BodyPartsReviewOptions, direction: 'E' | 'W' | 'SE') {
  const schema = direction === 'E' ? eastBodyPartsReviewSchema : direction === 'W' ? westBodyPartsReviewSchema : southeastBodyPartsReviewSchema;
  const layout = direction === 'E' ? eastBodyPartLayout : direction === 'W' ? westBodyPartLayout : southeastBodyPartLayout;
  const geometry = direction === 'E' ? eastBodyPartsGeometry : direction === 'W' ? westBodyPartsGeometry : southeastBodyPartsGeometry;
  const partition = direction === 'E' ? partitionEastBody : direction === 'W' ? partitionWestBody : partitionSoutheastBody;
  const baselineFile = direction === 'E' ? 'authoring.json' as const : direction === 'W' ? 'authoring-w-v2.json' as const : 'authoring-v2.json' as const;
  const baselineDirectory = direction === 'SE' ? 'body/front-diagonals-v1' : 'body/profiles-v1';
  const approvalFile = direction === 'E' ? 'review-fit-v1.json' : direction === 'W' ? 'review-fit-w-v2.json' : 'review-fit-v2.json';
  const decision = direction === 'E' ? 'approved-independent-e-profile-body-study' : direction === 'W' ? 'approved-independent-w-profile-body-study-with-local-hair-repair' : 'approved-independent-se-body-study-with-native-hand-repair';
  const [root, assets, refs] = await Promise.all([options.sourceDirectory, options.assetDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error(`${direction} body part outputs and inputs must be disjoint.`);
  for (let p = out; ; p = dirname(p)) {
    try { if (await realpath(p) !== p) throw new Error(`${direction} body part output symlinks forbidden.`); break; }
    catch (e) { if (!missing(e)) throw e; }
  }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error(`Ordinary pinned ${direction} part inputs required.`);
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && digest !== p.sourceSha256) throw new Error(`Pinned ${direction} part input changed: ` + p.source);
    inputs.set(path, digest); return bytes;
  };
  const configBytes = await read(root!, { source: 'authoring.json' }), config = schema.parse(JSON.parse(configBytes.toString('utf8')));
  if (config.baselineConfiguration.source !== baselineDirectory + '/' + baselineFile || config.baselineApproval.source !== baselineDirectory + '/' + approvalFile) throw new Error(`${direction} parts require the accepted same-facing checkpoint.`);
  const baseline = (direction === 'E' ? profileBodyReviewSchema : direction === 'W' ? westBodyReviewV2Schema : frontDiagonalBodyReviewV2Schema).parse(JSON.parse((await read(assets!, config.baselineConfiguration)).toString('utf8')));
  if (config.wholeBody.source !== baselineDirectory + '/' + baseline.body.source || config.wholeBody.sourceSha256 !== baseline.body.sourceSha256) throw new Error(`${direction} parts must preserve accepted native body selection.`);
  const approval = z.object({ decision: z.literal(decision), direction: z.literal(direction), configuration: z.literal(baselineFile), configurationSha256: hash, bareSha256: hash, fitSha256: hash, currentStudyFitApproved: z.literal(true) }).parse(JSON.parse((await read(assets!, config.baselineApproval)).toString('utf8')));
  if (approval.configurationSha256 !== config.baselineConfiguration.sourceSha256) throw new Error(`${direction} parts approval must match its selected configuration.`);
  const settings = JSON.parse((await read(root!, config.settings)).toString('utf8'));
  const provenance = z.object({ replay: pin }).parse(JSON.parse((await read(root!, config.provenance)).toString('utf8')));
  await read(root!, provenance.replay);
  if (settings.method !== `native-exclusive-${direction.toLowerCase()}-visible-body-parts` || settings.minimumAlpha !== 8 || settings.sourceBody !== config.wholeBody.source || JSON.stringify(settings.geometry) !== JSON.stringify(geometry)) throw new Error(`${direction} visible ownership contours changed.`);
  const body = decodePng(await read(assets!, config.wholeBody)), expected = partition(body);
  for (let p = 0; p < body.data.length; p += 4) if (body.data[p + 3]! < 8) body.data.fill(0, p, p + 4);
  const parts = [];
  for (const [i, selected] of config.parts.entries()) {
    const expectedLayout = layout[i]!;
    if (selected.id !== expectedLayout.id || selected.plane !== expectedLayout.plane || selected.characterSide !== expectedLayout.characterSide || selected.visibility !== expectedLayout.visibility) throw new Error(`${direction} part identity, plane or visibility changed.`);
    const image = selected.visibility === 'visible' ? decodePng(await read(root!, selected.artwork)) : blankImage(1024, 1536);
    if (image.width !== 1024 || image.height !== 1536 || image.data.some((v, p) => v !== expected.parts[i]!.data[p])) throw new Error(`${direction} part native ownership changed: ` + selected.id);
    if (selected.visibility === 'visible' && !expected.pixelCounts[i]) throw new Error(`Visible ${direction} parts require native source pixels.`);
    parts.push({ plane: selected.plane, image });
  }
  const recomposed = blankImage(1024, 1536);
  for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const p of parts) if (p.plane === plane) drawRgba(recomposed, p.image, 0, 0);
  if (recomposed.data.some((v, i) => v !== body.data[i])) throw new Error(`${direction} parts must reconstruct the accepted native body.`);
  const temporary = await mkdtemp(resolve(tmpdir(), `character-${direction.toLowerCase()}-parts-`));
  try {
    const common = { sourceDirectory: resolve(assets!, baselineDirectory), assetDirectory: assets!, referenceDirectory: refs! };
    const prepare = (outputDirectory: string, bodyParts?: Parameters<typeof prepareProfileBodyReview>[0]['bodyParts']) => direction === 'SE'
      ? prepareFrontDiagonalBodyReview({ ...common, configFile: 'authoring-v2.json', ...(bodyParts ? { bodyParts } : {}), outputDirectory })
      : prepareProfileBodyReview({ ...common, configFile: direction === 'E' ? 'authoring.json' : 'authoring-w-v2.json', ...(bodyParts ? { bodyParts } : {}), outputDirectory });
    const accepted = await prepare(resolve(temporary, 'accepted'));
    const actual = await prepare(resolve(temporary, 'parts'), parts);
    if ([accepted, actual].some(r => r.bareSha256 !== approval.bareSha256 || r.fitSha256 !== approval.fitSha256)) throw new Error(`Actual ${direction} body planes with head/face/hair must reproduce the approved fit exactly.`);
    const fit = decodePng(await readFile(resolve(temporary, `parts/fit/${direction}.png`))), anatomy = decodePng(await readFile(resolve(temporary, `parts/fit/${direction}-anatomy.png`)));
    const overview = blankImage(3072, 1536);
    const acceptedFit = decodePng(await readFile(resolve(temporary, `accepted/fit/${direction}.png`)));
    for (const [i, im] of [anatomy, acceptedFit, fit].entries()) drawRgba(overview, checkerPreview(im, direction), i * 1024, 0);
    const sheet = blankImage(3072, 3072);
    for (const [i, im] of [recomposed, ...parts.map(p => p.image)].entries()) drawRgba(sheet, checkerPreview(im, direction), i % 3 * 1024, Math.floor(i / 3) * 1536);
    const pending = [{ path: `fit/${direction}-body-only.png`, image: recomposed }, { path: `fit/${direction}-anatomy.png`, image: anatomy }, { path: `fit/${direction}.png`, image: fit }, { path: 'overview.png', image: overview }, { path: 'parts-overview.png', image: sheet }].map(p => ({ path: p.path, bytes: encodePng(p.image) }));
    const report = {
      schemaVersion: 1, id: config.id, assetVersion: 1, configuration: 'authoring.json', configSha256: sha256(configBytes), status: config.status, supportedReviewDirections: [direction], target: 'detailed', sourcePose: config.sourcePose,
      baselineConfiguration: config.baselineConfiguration, baselineApproval: config.baselineApproval, compositionOrder: DIRECTION_PLANE_ORDER[direction],
      measurements: { parts: layout.map((p, i) => ({ ...p, selectedPixels: expected.pixelCounts[i], nativePosition: { x: 0, y: 0 } })), overlapPixels: 0, unownedPixels: 0, generatedAnatomy: false },
      unavailableGeometry: layout.filter(p => p.visibility === 'occluded-unavailable').map(p => p.id), allFivePartsAuthored: layout.every(p => p.visibility === 'visible'), bodySha256: sha256(encodePng(recomposed)), bareSha256: actual.bareSha256, fitSha256: actual.fitSha256, exactApprovedFit: true,
      published: false, paletteReady: false, productionAnatomyApproved: false, concealedJointsApproved: false, separateUnderwearAuthored: false, footwearCompatibilityApproved: false, tposeApproved: false, finalStep6CAccepted: false, step6DStarted: false,
      overviewColumns: ['recomposed visible body plus accepted head', `accepted ${direction} whole-body fit`, `actual ${direction} body planes plus accepted head/face/hair`],
      partSheetCells: ['recomposed visible body', 'torso with underwear', ...layout.slice(1).map(p => `${direction === 'SE' ? p.characterSide === 'right' ? 'near' : 'far' : p.visibility === 'visible' ? 'near' : 'far'} physical-${p.characterSide} ${p.id.endsWith('arm') ? 'arm' : 'leg'}${p.visibility === 'visible' ? '' : ': occluded, no source geometry'}`)],
      futureFootwearFitObligations: actual.futureFootwearFitObligations, futureBodyFitObligations: actual.futureBodyFitObligations, futureHairstyleFitObligations: actual.futureHairstyleFitObligations,
      reviewRequired: [`Review ${direction} shoulder and brief-opening cut locations at native resolution.`, 'Concealed limb and joint coverage require independently authored geometry before reusable limb or alternate-pose acceptance.', 'Underwear remains baked into the torso study; no separate garment or material approval.'],
      outputs: pending.map(p => ({ path: p.path, sha256: sha256(p.bytes) })),
    };
    const files = [...pending, { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }];
    for (const file of files) for (let p = resolve(out, file.path); inside(out, p); p = dirname(p)) {
      try { if ((await lstat(p)).isSymbolicLink()) throw new Error(`${direction} body part output symlinks forbidden.`); }
      catch (e) { if (!missing(e)) throw e; }
      if (p === out) break;
    }
    for (const [p, digest] of inputs) if (sha256(await readFile(p)) !== digest) throw new Error(`${direction} body part input changed during review.`);
    for (const f of files) { const p = resolve(out, f.path); await mkdir(dirname(p), { recursive: true }); await writeFile(p, f.bytes); }
    return report;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
