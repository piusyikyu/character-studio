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
import { repairSeHandSilhouettes } from './body-diagonal-hand-repair';
import { repairSouthwestEyeAndHair } from './body-southwest-fit-repair';
import { repairSouthwestHairFit } from './body-southwest-hair-fit';
import { repairSouthwestQuality, southwestRearDetailGuide } from './body-southwest-quality';
import { repairWestProfileHair } from './body-profile-hair-repair';
import { selectFrontDiagonalBody, selectProfileBody } from './body-silhouette';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
export const profileBodyReviewSchema = northBodyReviewSchema.omit({ headConfiguration: true, hairConfiguration: true, originalHead: true, originalNeck: true, rearHair: true, reference: true }).extend({
  id: z.literal('body.profiles.v1'), direction: z.literal('E'), browConfiguration: pin, browApproval: pin,
  footwearCompatibilityApproved: z.literal(false), futureFootwearFitObligations: z.array(z.string().min(1)).min(1),
});
export const westBodyReviewSchema = profileBodyReviewSchema.extend({ direction: z.literal('W') });
export const westBodyReviewV2Schema = westBodyReviewSchema.extend({ assetVersion: z.literal(2), previous: pin, hairRepair: z.strictObject({ front: pin, rear: pin, toRear: pin, discard: pin, settings: pin, provenance: pin }) });
export const frontDiagonalBodyReviewSchema = profileBodyReviewSchema.extend({ id: z.literal('body.front-diagonals.v1'), direction: z.literal('SE') });
export const frontDiagonalBodyReviewV2Schema = frontDiagonalBodyReviewSchema.extend({ assetVersion: z.literal(2), previous: pin, handRepair: z.strictObject({ settings: pin, provenance: pin }) });
export const southwestBodyReviewSchema = frontDiagonalBodyReviewSchema.extend({ direction: z.literal('SW') });
export const southwestBodyReviewV2Schema = southwestBodyReviewSchema.extend({ assetVersion: z.literal(2), previous: pin, bodyStudyFeedback: pin, fitRepair: z.strictObject({ front: pin, rear: pin, eye: pin, eyeSelection: pin, hairSelection: pin, frontEraseSelection: pin, rearEraseSelection: pin, study: pin, guide: pin, reference: pin, settings: pin, provenance: pin }) });
export const southwestBodyReviewV3Schema = southwestBodyReviewV2Schema.extend({ assetVersion: z.literal(3), eyeFeedback: pin, hairFit: z.strictObject({ front: pin, rear: pin, frontEraseSelection: pin, frontSelection: pin, rearEraseSelection: pin, rearSelection: pin, study: pin, guide: pin, settings: pin, provenance: pin }) });
export const southwestBodyReviewV4Schema = southwestBodyReviewV3Schema.extend({ assetVersion: z.literal(4), quality: z.strictObject({ head: pin, front: pin, rear: pin, rearStudy: pin, rearGuide: pin, rearEraseSelection: pin, rearSelection: pin, headEraseSelection: pin, headSelection: pin, frontEraseSelection: pin, frontSelection: pin, headStudy: pin, hairReference: pin, guide: pin, settings: pin, provenance: pin }) });
export interface FrontDiagonalBodyReviewOptions extends NorthBodyReviewOptions, Pick<ProfileBodyReviewOptions, 'bodyParts'> { readonly configFile?: 'authoring.json' | 'authoring-v2.json' | 'authoring-sw-v1.json' | 'authoring-sw-v2.json' | 'authoring-sw-v3.json' | 'authoring-sw-v4.json' }
export interface ProfileBodyReviewOptions extends NorthBodyReviewOptions { readonly bodyParts?: readonly { readonly plane: RenderPlane; readonly image: RgbaImage }[]; readonly configFile?: 'authoring.json' | 'authoring-w-v1.json' | 'authoring-w-v2.json' }
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && p !== '..' && !p.startsWith('../')); };

/** Independent E/W anatomy studies; accepted facial/hair sources stay native and immutable. */
export async function prepareProfileBodyReview(options: ProfileBodyReviewOptions) {
  const configFile = options.configFile ?? 'authoring.json';
  if (configFile !== 'authoring.json' && configFile !== 'authoring-w-v1.json' && configFile !== 'authoring-w-v2.json') throw new Error('Supported profile body configurations are authoring.json (E) and authoring-w-v1.json / authoring-w-v2.json (W).');
  return prepareFacialBodyReview(options, configFile, configFile === 'authoring.json' ? 'E' : 'W');
}
export async function prepareFrontDiagonalBodyReview(options: FrontDiagonalBodyReviewOptions) {
  const configFile = options.configFile ?? 'authoring-v2.json';
  if (!['authoring.json', 'authoring-v2.json', 'authoring-sw-v1.json', 'authoring-sw-v2.json', 'authoring-sw-v3.json', 'authoring-sw-v4.json'].includes(configFile)) throw new Error('Supported front-diagonal body configurations are authoring.json / authoring-v2.json (SE) and authoring-sw-v1.json / authoring-sw-v2.json / authoring-sw-v3.json / authoring-sw-v4.json (SW).');
  return prepareFacialBodyReview(options, configFile, configFile.startsWith('authoring-sw-') ? 'SW' : 'SE');
}
async function prepareFacialBodyReview(options: NorthBodyReviewOptions & Pick<ProfileBodyReviewOptions, 'bodyParts'>, configFile: 'authoring.json' | 'authoring-w-v1.json' | 'authoring-w-v2.json' | 'authoring-v2.json' | 'authoring-sw-v1.json' | 'authoring-sw-v2.json' | 'authoring-sw-v3.json' | 'authoring-sw-v4.json', direction: 'E' | 'W' | 'SE' | 'SW') {
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
  const bytes = await read(root!, { source: configFile }), parsed: unknown = JSON.parse(bytes.toString('utf8'));
  const config = direction === 'SW' ? configFile === 'authoring-sw-v4.json' ? southwestBodyReviewV4Schema.parse(parsed) : configFile === 'authoring-sw-v3.json' ? southwestBodyReviewV3Schema.parse(parsed) : configFile === 'authoring-sw-v2.json' ? southwestBodyReviewV2Schema.parse(parsed) : southwestBodyReviewSchema.parse(parsed) : direction === 'SE' ? configFile === 'authoring-v2.json' ? frontDiagonalBodyReviewV2Schema.parse(parsed) : frontDiagonalBodyReviewSchema.parse(parsed) : direction === 'E' ? profileBodyReviewSchema.parse(parsed) : configFile === 'authoring-w-v2.json' ? westBodyReviewV2Schema.parse(parsed) : westBodyReviewSchema.parse(parsed);
  const diagonal = direction === 'SE' || direction === 'SW';
  const earDirectory = diagonal ? 'ears/human-v1/front-diagonals-v1' : 'ears/human-v1/profiles-v1', packKey = diagonal ? 'frontDiagonals' : 'profiles';
  const paths = { headSelection: 'head/assembly-v1/review-selection.json', headApproval: 'head/assembly-v1/review-fit-v1.json', browConfiguration: 'face/reference-v1/brows-v1/authoring.json', browApproval: 'face/reference-v1/brows-v1/review-fit-v1.json', earConfiguration: earDirectory + '/authoring.json', earApproval: earDirectory + '/review-fit-v1.json' } as const;
  for (const [key, path] of Object.entries(paths)) if (config[key as keyof typeof paths].source !== path) throw new Error('Profile body requires the accepted native profile head/ear/brow selection.');
  const pack = z.object({ directory: z.literal(earDirectory), configuration: pin, approval: pin });
  const selected = z.object({ packs: z.object({ [packKey]: pack }), frames: z.object({ [direction]: z.literal(packKey) }), browCompletion: pin, browApproval: pin });
  const selection = selected.parse(await json(assets!, config.headSelection));
  const approval = z.object({ decision: z.literal('approved-standing-reference-head-set'), standingReferenceHeadSetApproved: z.literal(true), selectedState: selected, frames: z.array(z.object({ direction: z.string(), fitSha256: hash, bareSha256: hash })), futureBodyFitObligations: z.array(z.string()), futureHairstyleFitObligations: z.array(z.string()) }).parse(await json(assets!, config.headApproval));
  const browApproval = z.object({ configSha256: hash, decision: z.literal('approved-standing-reference-fit'), fitMeasurements: z.array(z.object({ direction: z.string(), outputSha256: hash, bareSha256: hash })) }).parse(await json(assets!, config.browApproval));
  await read(assets!, config.earConfiguration);
  const earApproval = z.object({ configSha256: hash, decision: z.literal('approved-standing-reference-fit') }).parse(await json(assets!, config.earApproval));
  const accepted = approval.frames.find(f => f.direction === direction), browFit = browApproval.fitMeasurements.find(f => f.direction === direction);
  if (JSON.stringify(selection) !== JSON.stringify(approval.selectedState) || selection.packs[packKey]!.configuration.sourceSha256 !== config.earConfiguration.sourceSha256 || selection.packs[packKey]!.approval.sourceSha256 !== config.earApproval.sourceSha256 || earApproval.configSha256 !== config.earConfiguration.sourceSha256 || selection.browCompletion.sourceSha256 !== config.browConfiguration.sourceSha256 || selection.browApproval.sourceSha256 !== config.browApproval.sourceSha256 || browApproval.configSha256 !== config.browConfiguration.sourceSha256 || accepted?.fitSha256 !== config.approvedHeadFitSha256 || accepted.bareSha256 !== config.approvedHeadBareSha256 || browFit?.outputSha256 !== config.approvedHeadFitSha256 || browFit.bareSha256 !== config.approvedHeadBareSha256) throw new Error('Profile body approvals must match accepted same-facing facial and hair hashes.');
  const browBytes = await read(assets!, config.browConfiguration);
  const brow = await loadBrowReview({ sourceDirectory: resolve(assets!, 'face/reference-v1/brows-v1'), assetDirectory: assets!, referenceDirectory: refs!, configuration: { source: 'authoring.json', sourceSha256: sha256(browBytes) } });
  const frame = brow.frames.get(direction)!, baseline = brow.config.frames[direction];
  if (sha256(encodePng(frame.fit)) !== config.approvedHeadFitSha256 || sha256(encodePng(frame.bare)) !== config.approvedHeadBareSha256) throw new Error('Profile body must preserve the actual accepted same-facing native head/hair composition.');
  const [guide, study, body, mask, posedNeck, neckMask] = await Promise.all([load(root!, config.headGuide), load(root!, config.study, false), load(root!, config.body), load(root!, config.selection, false), load(root!, config.posedNeck), load(root!, config.neckSelection, false)]);
  const settings = await json(root!, config.settings); await read(root!, config.provenance);
  let expected = direction === 'SE' || direction === 'SW' ? selectFrontDiagonalBody(study!, settings, direction) : selectProfileBody(study!, settings, direction);
  let originalHandBody = body!, handRepairMeasurements: ReturnType<typeof repairSeHandSilhouettes>['measurements'] | undefined;
  if (config.direction === 'SE' && config.assetVersion === 2) {
    if (config.previous.source !== 'authoring.json') throw new Error('SE hand repair requires its pinned revision-1 baseline.');
    const previous = frontDiagonalBodyReviewSchema.parse(await json(root!, config.previous));
    for (const key of Object.keys(previous) as (keyof typeof previous)[]) if (!['assetVersion', 'body', 'selection', 'knownReviewIssues'].includes(key) && JSON.stringify(config[key]) !== JSON.stringify(previous[key])) throw new Error('SE hand repair must preserve all non-hand anatomy and native head/neck/hair baselines.');
    const [oldBody, oldMask] = await Promise.all([load(root!, previous.body), load(root!, previous.selection, false)]);
    if (oldBody!.data.some((v, i) => v !== expected.body.data[i]) || oldMask!.data.some((v, i) => v !== expected.mask.data[i])) throw new Error('Pinned SE hand baseline must preserve native study ownership.');
    const provenance = z.object({ tool: z.literal('manual native mask authoring'), baseline: pin, generatedAnatomy: z.literal(false), shiftedScaledOrMirrored: z.literal(false), globalColorKey: z.literal(false) }).parse(await json(root!, config.handRepair.provenance));
    if (JSON.stringify(provenance.baseline) !== JSON.stringify(config.previous)) throw new Error('SE hand repair provenance must pin revision 1.');
    const repaired = repairSeHandSilhouettes(study!, oldBody!, oldMask!, await json(root!, config.handRepair.settings));
    originalHandBody = oldBody!; expected = repaired; handRepairMeasurements = repaired.measurements;
  }
  if (body!.data.some((v, i) => v !== expected.body.data[i]) || mask!.data.some((v, i) => v !== expected.mask.data[i])) throw new Error(direction + ' body must retain native study ownership in the authored silhouette.');
  if (sha256(encodePng(guide!)) !== config.approvedHeadBareSha256) throw new Error(direction + ' guide must preserve the exact accepted head/neck/ear/facial pixels.');
  let neckTransferredPixels = 0;
  const cutY = direction === 'SE' ? 274 : direction === 'SW' ? 294 : direction === 'E' ? 300 : 306, neckEndY = direction === 'SE' ? 298 : direction === 'E' ? 311 : 317;
  for (let i = 0; i < frame.neck.data.length; i += 4) {
    const y = Math.floor(i / 4096), selected = y >= cutY && y < neckEndY && frame.neck.data[i + 3]! >= 8 && body!.data[i + 3]! >= 8;
    if (selected) neckTransferredPixels++;
    for (let c = 0; c < 4; c++) if (neckMask!.data[i + c] !== (selected ? 255 : 0) || posedNeck!.data[i + c] !== (selected ? 0 : frame.neck.data[i + c])) throw new Error('Profile posed neck must preserve every pixel outside its bounded attachment rows.');
  }
  if (!neckTransferredPixels) throw new Error('Profile body must supply skin at its bounded neck attachment.');
  let fittedFront = frame.front, fittedRear = frame.rear;
  let hairRepairMeasurements: ReturnType<typeof repairWestProfileHair>['measurements'] | undefined;
  if (config.direction === 'W' && config.assetVersion === 2) {
    if (config.previous.source !== 'authoring-w-v1.json') throw new Error('W hair repair requires its pinned revision-1 baseline.');
    const previous = westBodyReviewSchema.parse(await json(root!, config.previous));
    for (const key of Object.keys(previous) as (keyof typeof previous)[]) if (key !== 'assetVersion' && key !== 'knownReviewIssues' && JSON.stringify(config[key]) !== JSON.stringify(previous[key])) throw new Error('W hair repair must preserve the native body, neck, head, face and study baselines.');
    const [front, rear, toRear, discard] = await Promise.all([load(root!, config.hairRepair.front), load(root!, config.hairRepair.rear), load(root!, config.hairRepair.toRear, false), load(root!, config.hairRepair.discard, false)]);
    const provenance = z.object({ tool: z.literal('manual native mask authoring'), baseline: pin, generatedArtwork: z.literal(false), transforms: z.literal(false), globalColorKey: z.literal(false) }).parse(await json(root!, config.hairRepair.provenance));
    if (JSON.stringify(provenance.baseline) !== JSON.stringify(config.previous)) throw new Error('W hair repair provenance must pin the same revision-1 baseline.');
    const expectedHair = repairWestProfileHair(frame.front, frame.rear, await json(root!, config.hairRepair.settings));
    for (const [actual, expected] of [[front!, expectedHair.front], [rear!, expectedHair.rear], [toRear!, expectedHair.toRear], [discard!, expectedHair.discard]]) if (actual!.data.some((v, i) => v !== expected!.data[i])) throw new Error('W hair repair must retain native ownership inside its bounded masks.');
    fittedFront = front!; fittedRear = rear!; hairRepairMeasurements = expectedHair.measurements;
  }
  const features = await Promise.all(baseline.baseline.features.filter(f => f.plane !== 'eyebrows').map(async f => ({ plane: f.plane, image: await load(assets!, f) })));
  let fittedFeatures = features;
  let fitRepairMeasurements: ReturnType<typeof repairSouthwestEyeAndHair>['measurements'] | undefined;
  let swHairConfig = config.direction === 'SW' && config.assetVersion === 3 ? config : undefined;
  if (config.direction === 'SW' && config.assetVersion === 4) {
    if (config.previous.source !== 'authoring-sw-v3.json') throw new Error('SW quality repair requires its pinned revision-3 baseline.');
    const previous = southwestBodyReviewV3Schema.parse(await json(root!, config.previous));
    for (const key of Object.keys(previous) as (keyof typeof previous)[]) if (!['assetVersion', 'previous', 'knownReviewIssues'].includes(key) && JSON.stringify(config[key]) !== JSON.stringify(previous[key])) throw new Error('SW quality repair must preserve every body, eye and prior hair baseline.');
    swHairConfig = previous;
  }
  let swRepairConfig = config.direction === 'SW' && config.assetVersion === 2 ? config : undefined;
  if (swHairConfig) {
    const config = swHairConfig;
    if (config.previous.source !== 'authoring-sw-v2.json') throw new Error('SW hair fit requires its pinned revision-2 eye/body baseline.');
    const previous = southwestBodyReviewV2Schema.parse(await json(root!, config.previous));
    for (const key of Object.keys(previous) as (keyof typeof previous)[]) if (!['assetVersion', 'previous', 'knownReviewIssues'].includes(key) && JSON.stringify(config[key]) !== JSON.stringify(previous[key])) throw new Error('SW hair fit must preserve every eye/body and facial baseline.');
    swRepairConfig = previous;
  }
  if (swRepairConfig) {
    const config = swRepairConfig;
    if (config.previous.source !== 'authoring-sw-v1.json') throw new Error('SW eye/hair repair requires its pinned revision-1 baseline.');
    const previous = southwestBodyReviewSchema.parse(await json(root!, config.previous));
    for (const key of Object.keys(previous) as (keyof typeof previous)[]) if (key !== 'assetVersion' && key !== 'knownReviewIssues' && JSON.stringify(config[key]) !== JSON.stringify(previous[key])) throw new Error('SW repair must preserve body, neck, hands and accepted head baselines.');
    const feedback = z.object({ decision: z.literal('generally-good-body-eye-and-hair-corrections-required'), configuration: pin, body: pin, posedNeck: pin, eyeHairFitApproved: z.literal(false) }).parse(await json(root!, config.bodyStudyFeedback));
    if (JSON.stringify(feedback.configuration) !== JSON.stringify(config.previous) || JSON.stringify(feedback.body) !== JSON.stringify(previous.body) || JSON.stringify(feedback.posedNeck) !== JSON.stringify(previous.posedNeck)) throw new Error('SW body feedback must pin its unchanged native study.');
    const provenance = z.object({ previous: pin, bodyChanged: z.literal(false), shiftedScaledOrMirrored: z.literal(false), globalColorKey: z.literal(false) }).parse(await json(root!, config.fitRepair.provenance));
    if (JSON.stringify(provenance.previous) !== JSON.stringify(config.previous) || JSON.stringify(config.fitRepair.reference) !== JSON.stringify(baseline.reference)) throw new Error('SW correction must retain same-facing reference and revision-1 provenance.');
    const repaired = repairSouthwestEyeAndHair(frame.front, frame.rear, frame.reference, await load(root!, config.fitRepair.study), await json(root!, config.fitRepair.settings));
    await load(root!, config.fitRepair.guide);
    for (const [key, expected] of Object.entries({ front: repaired.front, rear: repaired.rear, eye: repaired.eye, eyeSelection: repaired.eyeMask, hairSelection: repaired.hairMask, frontEraseSelection: repaired.eraseMask, rearEraseSelection: repaired.rearEraseMask }) as [keyof Pick<typeof config.fitRepair, 'front' | 'rear' | 'eye' | 'eyeSelection' | 'hairSelection' | 'frontEraseSelection' | 'rearEraseSelection'>, RgbaImage][]) {
      const actual = await load(root!, config.fitRepair[key], !key.endsWith('Selection'));
      if (actual.data.some((v, i) => v !== expected.data[i])) throw new Error('SW eye/hair correction must retain native ownership inside its permitted masks.');
    }
    fittedFront = repaired.front; fittedRear = repaired.rear; fitRepairMeasurements = repaired.measurements;
    fittedFeatures = features.map((feature, index) => baseline.baseline.features.filter(f => f.plane !== 'eyebrows')[index]!.name === 'rightEye' ? { plane: feature.plane, image: repaired.eye } : feature);
  }
  const previousFront = fittedFront, previousRear = fittedRear;
  let hairFitMeasurements: ReturnType<typeof repairSouthwestHairFit>['measurements'] | undefined;
  if (swHairConfig) {
    const config = swHairConfig;
    const provenance = z.object({ previous: pin, anatomyChanged: z.literal(false), shiftedScaledOrMirrored: z.literal(false), globalColorKey: z.literal(false) }).parse(await json(root!, config.hairFit.provenance));
    if (JSON.stringify(provenance.previous) !== JSON.stringify(config.previous)) throw new Error('SW hair fit provenance must pin revision 2.');
    const repaired = repairSouthwestHairFit(previousFront, previousRear, await load(root!, config.hairFit.study), await json(root!, config.hairFit.settings));
    for (const [key, expected] of Object.entries({ front: repaired.front, rear: repaired.rear, frontEraseSelection: repaired.frontErase, frontSelection: repaired.frontSelection, rearEraseSelection: repaired.rearErase, rearSelection: repaired.rearSelection }) as [keyof Pick<typeof config.hairFit, 'front' | 'rear' | 'frontEraseSelection' | 'frontSelection' | 'rearEraseSelection' | 'rearSelection'>, RgbaImage][]) {
      const actual = await load(root!, config.hairFit[key], !key.endsWith('Selection'));
      if (actual.data.some((v, i) => v !== expected.data[i])) throw new Error('SW hair fit must retain native ownership inside its permitted masks.');
    }
    fittedFront = repaired.front; fittedRear = repaired.rear; hairFitMeasurements = repaired.measurements;
  }
  const qualityPreviousFront = fittedFront, qualityPreviousRear = fittedRear;
  let fittedHead = frame.head, qualityMeasurements: ReturnType<typeof repairSouthwestQuality>['measurements'] | undefined;
  if (config.direction === 'SW' && config.assetVersion === 4) {
    const provenance = z.object({ previous: pin, bodyAndEyesChanged: z.literal(false), shiftedScaledOrMirrored: z.literal(false), globalColorKey: z.literal(false) }).parse(await json(root!, config.quality.provenance));
    if (JSON.stringify(provenance.previous) !== JSON.stringify(config.previous) || JSON.stringify(config.quality.hairReference) !== JSON.stringify(baseline.reference)) throw new Error('SW quality repair must pin revision 3 and its own reference.');
    if (sha256(encodePng(await load(root!, config.quality.rearGuide))) !== sha256(encodePng(southwestRearDetailGuide(fittedRear)))) throw new Error('SW rear detail guide must preserve its explicit original crop and sampling.');
    const repaired = repairSouthwestQuality(frame.head, fittedFront, fittedRear, await load(root!, config.quality.headStudy), await load(refs!, config.quality.hairReference), await load(root!, config.quality.rearStudy), await json(root!, config.quality.settings));
    for (const [key, expected] of Object.entries({ head: repaired.head, front: repaired.front, rear: repaired.rear, rearEraseSelection: repaired.rearErase, rearSelection: repaired.rearSelection, headEraseSelection: repaired.headErase, headSelection: repaired.headSelection, frontEraseSelection: repaired.frontErase, frontSelection: repaired.frontSelection }) as [keyof Pick<typeof config.quality, 'head' | 'front' | 'rear' | 'rearEraseSelection' | 'rearSelection' | 'headEraseSelection' | 'headSelection' | 'frontEraseSelection' | 'frontSelection'>, RgbaImage][]) {
      const actual = await load(root!, config.quality[key], !key.endsWith('Selection'));
      if (actual.data.some((v, i) => v !== expected.data[i])) throw new Error('SW quality repair must retain native ownership inside its permitted masks.');
    }
    fittedHead = repaired.head; fittedFront = repaired.front; fittedRear = repaired.rear; qualityMeasurements = repaired.measurements;
  }
  if (options.bodyParts) {
    const required = ['body-torso', 'body-front-arm', 'body-back-arm', 'body-front-leg', 'body-back-leg'];
    if (!['E', 'W', 'SE'].includes(direction) || options.bodyParts.length !== 5 || new Set(options.bodyParts.map(p => p.plane)).size !== 5 || options.bodyParts.some(p => !required.includes(p.plane) || p.image.width !== 1024 || p.image.height !== 1536)) throw new Error('Five explicitly assigned native facing body planes required.');
    const reconstructed = blankImage(1024, 1536);
    for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const part of options.bodyParts) if (part.plane === plane) drawRgba(reconstructed, part.image, 0, 0);
    if (reconstructed.data.some((v, i) => v !== body!.data[i])) throw new Error('Body planes must reconstruct the accepted native body exactly.');
  }
  const compose = (withBody: boolean, withHair: boolean, repaired: boolean | 'previous' | 'quality-previous' = true) => {
    const image = blankImage(1024, 1536), planes = new Map<RenderPlane, RgbaImage[]>([['head', [repaired === true ? fittedHead : frame.head]], ['neck', [withBody ? posedNeck! : frame.neck]], ['eyebrows', frame.brows]]);
    for (const f of repaired ? fittedFeatures : features) planes.set(f.plane, [...planes.get(f.plane) ?? [], f.image]);
    if (withBody) {
      if (options.bodyParts) for (const part of options.bodyParts) planes.set(part.plane, [part.image]);
      else planes.set('body-torso', [body!]);
    }
    if (withHair) { planes.set('hair-rear', [repaired === 'quality-previous' ? qualityPreviousRear : repaired === 'previous' ? previousRear : repaired ? fittedRear : frame.rear]); planes.set('hair-front', [repaired === 'quality-previous' ? qualityPreviousFront : repaired === 'previous' ? previousFront : repaired ? fittedFront : frame.front]); }
    for (const plane of DIRECTION_PLANE_ORDER[direction]) for (const layer of planes.get(plane) ?? []) drawRgba(image, layer, 0, 0);
    return image;
  };
  const bodyFree = compose(false, true, false), anatomy = compose(true, false), fit = compose(true, true);
  if (swHairConfig) {
    const config = swHairConfig;
    const guide = await load(root!, config.hairFit.guide);
    const feedback = z.object({ direction: z.literal('SW'), configuration: pin, eye: pin, bareSha256: hash, retainCurrentEyeAndBody: z.literal(true), hairFitApproved: z.literal(false) }).parse(await json(root!, config.eyeFeedback));
    if (sha256(encodePng(guide)) !== sha256(encodePng(compose(true, true, 'previous'))) || JSON.stringify(feedback.configuration) !== JSON.stringify(config.previous) || JSON.stringify(feedback.eye) !== JSON.stringify(config.fitRepair.eye) || feedback.bareSha256 !== sha256(encodePng(compose(true, false, 'quality-previous')))) throw new Error('SW hair fit must preserve the exact previous bare anatomy and eye/body guide.');
  }
  if (config.direction === 'SW' && config.assetVersion === 4 && sha256(encodePng(await load(root!, config.quality.guide))) !== sha256(encodePng(compose(true, false, 'quality-previous')))) throw new Error('SW quality study must use the exact previous anatomy guide.');
  if (sha256(encodePng(bodyFree)) !== config.approvedHeadFitSha256) throw new Error('Profile body-free composition must retain the accepted posterior/front hair and facial planes.');
  let pixels = 0, boundaryPixels = 0, frontOverlap = 0, rearOverlap = 0, left = 1024, top = 1536, right = 0, bottom = 0;
  for (let i = 0; i < body!.data.length; i += 4) if (body!.data[i + 3]) {
    const p = i / 4, x = p % 1024, y = Math.floor(p / 1024);
    if (y < cutY) throw new Error('Profile body cannot replace head/face above the bounded neck attachment.');
    pixels++; left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
    if (x === 0 || x === 1023 || y === 1535) boundaryPixels++;
    if (fittedFront.data[i + 3]) frontOverlap++; if (fittedRear.data[i + 3]) rearOverlap++;
  }
  if (pixels < 80_000 || boundaryPixels || !frontOverlap || !rearOverlap) throw new Error('Complete unclipped profile study and actual same-facing hair overlap required.');
  const overview = blankImage(3072, 1536);
  for (const [j, image] of [frame.reference, anatomy, fit].entries()) drawRgba(overview, checkerPreview(image, direction), j * 1024, 0);
  const join = blankImage(1140, 200);
  for (const [j, image] of [frame.reference, anatomy, fit].entries()) {
    const crop = blankImage(380, 200); for (let y = 0; y < 200; y++) crop.data.set(image.data.subarray(((y + 260) * 1024 + 400) * 4, ((y + 260) * 1024 + 780) * 4), y * 380 * 4);
    drawRgba(join, checkerPreview(crop, direction), j * 380, 0);
  }
  const pending = [{ path: `fit/${direction}-anatomy.png`, image: anatomy }, { path: `fit/${direction}.png`, image: fit }, { path: 'overview.png', image: overview }, { path: `inspection/${direction}-neck-shoulder-comparison.png`, image: join }];
  if (config.direction === 'SW' && config.assetVersion !== 1) {
    const comparison = blankImage(2160, 1440);
    for (const [row, images] of [[frame.reference, compose(true, false, config.assetVersion === 4 ? 'quality-previous' : config.assetVersion === 3 ? 'previous' : false), anatomy], [frame.reference, compose(true, true, config.assetVersion === 4 ? 'quality-previous' : config.assetVersion === 3 ? 'previous' : false), fit]].entries()) for (const [column, image] of images.entries()) {
      const crop = blankImage(240, 240);
      for (let y = 0; y < 240; y++) crop.data.set(image.data.subarray(((y + 160) * 1024 + 325) * 4, ((y + 160) * 1024 + 565) * 4), y * 240 * 4);
      const checker = checkerPreview(crop, 'SW');
      for (let y = 0; y < 720; y++) for (let x = 0; x < 720; x++) comparison.data.set(checker.data.subarray((Math.floor(y / 3) * 240 + Math.floor(x / 3)) * 4, (Math.floor(y / 3) * 240 + Math.floor(x / 3)) * 4 + 4), ((row * 720 + y) * 2160 + column * 720 + x) * 4);
    }
    pending.push({ path: 'inspection/SW-eye-hair-comparison.png', image: comparison });
  }
  let nativeHandMeasurements: { retainedInteriors: number; sourceAlphaPreserved: true } | undefined;
  if (direction === 'SW') {
    // Native source alpha supplies finger contours and gaps inside the local envelopes.
    const inspection = blankImage(1170, 1500), regions = [{ x: 0, y: 330 }, { x: 850, y: 330 }];
    let retainedInteriors = 0;
    for (const region of regions) for (let y = 0; y < 125; y++) for (let x = 0; x < 195 && region.x + x < 1024; x++) {
      const p = ((region.y + y) * 1024 + region.x + x) * 4;
      if (study!.data[p + 3]! < 245) continue;
      for (let c = 0; c < 4; c++) if (body!.data[p + c] !== study!.data[p + c]) throw new Error('SW hand envelopes must preserve every native near-opaque finger/palm pixel.');
      if (anatomy.data[p + 3] !== study!.data[p + 3]) throw new Error('SW native anatomy export must retain intact hand interiors.');
      retainedInteriors++;
    }
    if (retainedInteriors < 1000) throw new Error('Complete independent SW hands required.');
    nativeHandMeasurements = { retainedInteriors, sourceAlphaPreserved: true };
    for (const [row, bg] of [48, 245].entries()) for (const [side, region] of regions.entries()) for (const [column, image] of [study!, anatomy].entries()) {
      for (let y = 0; y < 125; y++) for (let x = 0; x < 195; x++) {
        const i = ((region.y + y) * 1024 + region.x + x) * 4, alpha = region.x + x < 1024 ? image.data[i + 3]! / 255 : 0;
        for (let sy = 0; sy < 3; sy++) for (let sx = 0; sx < 3; sx++) {
          const p = (((row * 2 + side) * 375 + y * 3 + sy) * inspection.width + column * 585 + x * 3 + sx) * 4;
          for (let c = 0; c < 3; c++) inspection.data[p + c] = Math.round((alpha ? image.data[i + c]! : 0) * alpha + bg * (1 - alpha));
          inspection.data[p + 3] = 255;
        }
      }
    }
    pending.push({ path: 'inspection/SW-hand-alpha-comparison.png', image: inspection });
  }
  if (config.direction === 'W' && config.assetVersion === 2) {
    const comparison = blankImage(2048, 1536);
    drawRgba(comparison, checkerPreview(compose(true, true, false), direction), 0, 0);
    drawRgba(comparison, checkerPreview(fit, direction), 1024, 0);
    pending.push({ path: 'inspection/W-hair-fit-comparison.png', image: comparison });
  }
  if (config.direction === 'SE' && config.assetVersion === 2) {
    // Study / old export / repaired export; both hands on dark and light backgrounds.
    const inspection = blankImage(1920, 1440), regions = [{ x: 35, y: 315 }, { x: 875, y: 330 }];
    for (const [row, bg] of [48, 245].entries()) for (const [side, region] of regions.entries()) for (const [column, source] of [study!, originalHandBody, body!].entries()) {
      for (let y = 0; y < 90; y++) for (let x = 0; x < 160; x++) {
        const i = ((region.y + y) * 1024 + region.x + x) * 4, alpha = region.x + x < 1024 ? source.data[i + 3]! / 255 : 0;
        for (let sy = 0; sy < 4; sy++) for (let sx = 0; sx < 4; sx++) {
          const p = (((row * 2 + side) * 360 + y * 4 + sy) * inspection.width + column * 640 + x * 4 + sx) * 4;
          for (let c = 0; c < 3; c++) inspection.data[p + c] = Math.round((alpha ? source.data[i + c]! : 0) * alpha + bg * (1 - alpha));
          inspection.data[p + 3] = 255;
        }
      }
    }
    pending.push({ path: 'inspection/SE-hand-alpha-comparison.png', image: inspection });
  }
  const report = { schemaVersion: 1, id: config.id, assetVersion: config.assetVersion, hairRepairMeasurements, handRepairMeasurements, nativeHandMeasurements, fitRepairMeasurements, hairFitMeasurements, qualityMeasurements, eyeHairComparisonColumns: direction === 'SW' && config.assetVersion === 4 ? ['same-facing reference', 'revision 3 extracted contours', 'revision 4 native jaw and hair contour repair'] : direction === 'SW' && config.assetVersion === 3 ? ['same-facing reference', 'revision 2 improved eye/body with marked hair defects', 'revision 3 local hair fit on identical anatomy'] : undefined, configuration: configFile, configSha256: sha256(bytes), status: config.status, supportedReviewDirections: [direction], sourcePose: config.sourcePose, nativePosition: config.nativePosition, independentlyAuthored: true, underlayer: config.underlayer, partitionStatus: config.partitionStatus, compositionOrder: DIRECTION_PLANE_ORDER[direction], preservedHeadBareSha256: config.approvedHeadBareSha256, bodyFreeAssemblySha256: sha256(encodePng(bodyFree)), bareSha256: sha256(encodePng(anatomy)), fitSha256: sha256(encodePng(fit)), posedNeckSha256: sha256(encodePng(posedNeck!)), measurements: { selectedBodyPixels: pixels, boundaryPixels, neckTransferredPixels, frontHairOverlapPixels: frontOverlap, rearHairOverlapPixels: rearOverlap, bounds: { left, top, right, bottom } }, comparisonColumns: ['same-facing standing reference', `independent ${direction} body with accepted facial layers and local neck attachment`, 'actual same-facing front/rear hair fit'], previewSampling: 'native-copy-no-transforms', handComparisonColumns: direction === 'SW' ? ['native generated study', 'native SW anatomy export'] : config.direction === 'SE' && config.assetVersion === 2 ? ['native generated study', 'revision 1 exported hands with missing interiors', 'revision 2 native hand masks'] : undefined, hairComparisonColumns: config.direction === 'W' && config.assetVersion === 2 ? ['revision 1 hair overlap and reference clothing fragment', 'revision 2 bounded hair depth and fragment repair'] : undefined, published: false, paletteReady: false, productionAnatomyApproved: false, bodyOcclusionVerified: false, footwearCompatibilityApproved: false, tposeApproved: false, finalStep6CAccepted: false, step6DStarted: false, futureFootwearFitObligations: config.futureFootwearFitObligations, futureBodyFitObligations: approval.futureBodyFitObligations, futureHairstyleFitObligations: approval.futureHairstyleFitObligations, knownReviewIssues: config.knownReviewIssues, outputs: pending.map(p => ({ path: p.path, sha256: sha256(encodePng(p.image)) })) };
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
