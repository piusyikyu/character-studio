import { lstat, mkdir, readFile, realpath, writeFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { checkerPreview } from './inspection';
import { sha256 } from './reference-import';
import { validateBodyRepair } from './body-repair';
import { validateBodyJoint, validateNeckShading } from './body-joint';
import { validateCurlEdges, validateCurlSpill } from './body-curl';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const source = z.string().regex(/^(?:[a-zA-Z0-9_.-]+\/)*[a-zA-Z0-9_.-]+$/).refine(p => p.split('/').every(s => s !== '.' && s !== '..'));
const pin = z.strictObject({ source, sourceSha256: hash });
const bodyReviewV1Schema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('body.reference.v1'), assetVersion: z.literal(1), direction: z.literal('S'), target: z.literal('detailed'),
  nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }), sourcePose: z.literal('tpose-study'), intendedRuntimePose: z.literal('tpose'),
  status: z.literal('draft-needs-human-review'), published: z.literal(false), paletteReady: z.literal(false), nativePosition: z.strictObject({ x: z.literal(0), y: z.literal(0) }),
  headSelection: pin, headApproval: pin, headGuide: pin, approvedHeadBareSha256: hash, approvedHeadFitSha256: hash,
  reference: pin, frontHair: pin, rearHair: pin, study: pin, body: pin, selection: pin, settings: pin, provenance: pin,
  bodyPlane: z.literal('body-torso'), partitionStatus: z.literal('whole-body-study-not-final-limb-partition'),
  productionAnatomyApproved: z.literal(false), bodyOcclusionVerified: z.literal(false), tposeApproved: z.literal(false), finalStep6CAccepted: z.literal(false),
  knownReviewIssues: z.array(z.string().min(1)).min(1),
});
const bodyReviewV2Schema = bodyReviewV1Schema.extend({ assetVersion: z.literal(2), previous: pin, torsoRepair: z.strictObject({ study: pin, selection: pin, settings: pin, underlayer: z.literal('ordinary-daily-bra-and-panties') }), hairOwnership: z.strictObject({ front: pin, rear: pin, toRear: pin, toFront: pin }) });
const bodyReviewV3Schema = bodyReviewV2Schema.extend({ assetVersion: z.literal(3), jointRepair: z.strictObject({ study: pin, guide: pin, selection: pin, skinSelection: pin, head: pin, headSelection: pin, settings: pin }) });
const bodyReviewV4Schema = bodyReviewV3Schema.extend({ assetVersion: z.literal(4), neckRepair: z.strictObject({ study: pin, guide: pin, selection: pin, head: pin, settings: pin }) });
const bodyReviewV5Schema = bodyReviewV4Schema.extend({ assetVersion: z.literal(5), previousReview: pin, curlRepair: z.strictObject({ front: pin, rear: pin, toRear: pin, toFront: pin, settings: pin }) });
const bodyReviewV6Schema = bodyReviewV5Schema.extend({ assetVersion: z.literal(6), spillRepair: z.strictObject({ front: pin, rear: pin, selection: pin, settings: pin }) });
export const bodyReviewSchema = z.discriminatedUnion('assetVersion', [bodyReviewV1Schema, bodyReviewV2Schema, bodyReviewV3Schema, bodyReviewV4Schema, bodyReviewV5Schema, bodyReviewV6Schema]);
const inside = (base: string, path: string) => { const p = relative(base, path); return p === '' || (!isAbsolute(p) && !p.startsWith('..')); };
export interface BodyReviewOptions { readonly sourceDirectory: string; readonly assetDirectory: string; readonly referenceDirectory: string; readonly outputDirectory: string; readonly configFile?: 'authoring.json' | 'authoring-v2.json' | 'authoring-v3.json' | 'authoring-v4.json' | 'authoring-v5.json' | 'authoring-v6.json' }

/** First native S body study. No runtime catalog publication or approval is performed. */
export async function prepareBodyReview(options: BodyReviewOptions) {
  const [root, assets, refs] = await Promise.all([options.sourceDirectory, options.assetDirectory, options.referenceDirectory].map(p => realpath(p)));
  const out = resolve(options.outputDirectory), inputs = new Map<string, string>();
  if ([root!, assets!, refs!].some(p => inside(p, out) || inside(out, p))) throw new Error('Body review output and inputs must be disjoint.');
  for (let p = out; ; p = dirname(p)) { try { if (await realpath(p) !== p) throw new Error('Body output cannot traverse symlinks.'); break; } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; } }
  const read = async (base: string, p: { source: string; sourceSha256?: string }) => {
    const path = resolve(base, p.source);
    if (!inside(base, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error('Ordinary pinned body-review inputs required.');
    const bytes = await readFile(path), digest = sha256(bytes);
    if (p.sourceSha256 && digest !== p.sourceSha256) throw new Error(p.source + ': pinned body input changed; author a new revision.');
    inputs.set(path, digest); return bytes;
  };
  const configBytes = await read(root!, { source: options.configFile ?? 'authoring-v6.json' }), config = bodyReviewSchema.parse(JSON.parse(configBytes.toString('utf8')));
  const headApproval = z.object({ decision: z.literal('approved-standing-reference-head-set'), standingReferenceHeadSetApproved: z.literal(true), frames: z.array(z.object({ direction: z.string(), fitSha256: hash, bareSha256: hash })).length(8), futureBodyFitObligations: z.array(z.string()).min(1), futureHairstyleFitObligations: z.array(z.string()).min(1) }).parse(JSON.parse((await read(assets!, config.headApproval)).toString('utf8')));
  const headSelection = z.object({ standingReferenceApproval: pin }).parse(JSON.parse((await read(assets!, config.headSelection)).toString('utf8'))), approvedS = headApproval.frames.find(f => f.direction === 'S');
  if (config.headApproval.source !== 'head/assembly-v1/review-fit-v1.json' || config.headSelection.source !== 'head/assembly-v1/review-selection.json' || headSelection.standingReferenceApproval.sourceSha256 !== config.headApproval.sourceSha256 || !approvedS || approvedS.bareSha256 !== config.approvedHeadBareSha256 || approvedS.fitSha256 !== config.approvedHeadFitSha256) throw new Error('Body study must retain the accepted native S head checkpoint.');
  const settings = JSON.parse((await read(root!, config.settings)).toString('utf8')), provenance = JSON.parse((await read(root!, config.provenance)).toString('utf8'));
  const validProvenance = config.assetVersion === 6 ? provenance.tool === 'manual native mask authoring' && provenance.baseline === 'authoring-v5.json' && JSON.stringify(provenance.selectedHairSources) === JSON.stringify([config.curlRepair.front.source, config.curlRepair.rear.source]) : config.assetVersion === 5 ? provenance.tool === 'manual native mask authoring' && provenance.baseline === 'authoring-v4.json' && JSON.stringify(provenance.selectedHairSources) === JSON.stringify([config.frontHair.source, config.rearHair.source]) : provenance.tool === 'built-in imagegen' && provenance.selectedStudy === (config.assetVersion === 4 ? config.neckRepair.study.source : config.assetVersion === 3 ? config.jointRepair.study.source : config.assetVersion === 2 ? config.torsoRepair.study.source : config.study.source);
  if (settings.method !== 'native-body-study-silhouette' || settings.coverageSamples !== 4 || settings.contourTolerancePixels !== 8 || settings.minimumStudyAlpha !== 8 || !validProvenance) throw new Error('Pinned independent S study and local native masks required.');
  const load = async (base: string, p: { source: string; sourceSha256: string }) => {
    const image = decodePng(await read(base, p));
    if (image.width !== 1024 || image.height !== 1536) throw new Error('Body review requires native 1024x1536 inputs.');
    for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4);
    return image;
  };
  const [head, front, rear, body, mask, study, reference] = await Promise.all([load(root!, config.headGuide), load(assets!, config.frontHair), load(assets!, config.rearHair), load(root!, config.body), load(root!, config.selection), load(root!, config.study), load(refs!, config.reference)]);
  let originalBody = body, baselineBody = body, selectedHead = head, baselineHead = head, selectedFront = front, selectedRear = rear, baselineFront = front, baselineRear = rear;
  let neckRepairMeasurements: ReturnType<typeof validateNeckShading> | undefined;
  let curlRepairMeasurements: ReturnType<typeof validateCurlEdges> | undefined;
  let spillRepairMeasurements: ReturnType<typeof validateCurlSpill> | undefined;
  let qualifiedFitSha256: string | undefined;
  let bodyReviewApproval: { bareSha256: string; fitSha256: string } | undefined;
  let repairMeasurements: ReturnType<typeof validateBodyRepair> | ReturnType<typeof validateBodyJoint> | undefined;
  const inheritedKeys = ['id','direction','nativeSize','nativePosition','headSelection','headApproval','headGuide','approvedHeadBareSha256','approvedHeadFitSha256','reference','frontHair','rearHair','study','selection','settings'] as const;
  if (config.assetVersion !== 1) {
    const curlConfig = config.assetVersion === 6 ? bodyReviewV5Schema.parse(JSON.parse((await read(root!, config.previous)).toString('utf8'))) : config.assetVersion === 5 ? config : undefined;
    if (config.assetVersion === 6) {
      if (config.previous.source !== 'authoring-v5.json' || !curlConfig) throw new Error('Spill repair requires the retained revision-5 hair baseline.');
      for (const key of [...inheritedKeys, 'body', 'torsoRepair', 'jointRepair', 'neckRepair', 'hairOwnership', 'curlRepair', 'previousReview'] as const) if (JSON.stringify(config[key]) !== JSON.stringify(curlConfig[key])) throw new Error('Spill repair must preserve accepted body anatomy and native curl baselines.');
    }
    const neckConfig = curlConfig ? bodyReviewV4Schema.parse(JSON.parse((await read(root!, curlConfig.previous)).toString('utf8'))) : config.assetVersion === 4 ? config : undefined;
    if (curlConfig) {
      if (curlConfig.previous.source !== 'authoring-v4.json' || !neckConfig) throw new Error('Curl repair requires the retained revision-4 body/neck checkpoint.');
      for (const key of [...inheritedKeys, 'body', 'torsoRepair', 'jointRepair', 'neckRepair', 'hairOwnership'] as const) if (JSON.stringify(curlConfig[key]) !== JSON.stringify(neckConfig[key])) throw new Error('Curl repair must preserve the accepted local body, neck, face and native hair baselines.');
      const approval = z.object({ decision: z.literal('mostly-approved-local-body-fit-with-hair-edge-nitpick'), configuration: z.literal('authoring-v4.json'), configurationSha256: hash, bareSha256: hash, fitSha256: hash, bodyStudyAcceptedForCurrentReview: z.literal(true), neckShadingAccepted: z.literal(true), hairEdgesApproved: z.literal(false), productionAnatomyApproved: z.literal(false), tposeApproved: z.literal(false), finalStep6CAccepted: z.literal(false) }).parse(JSON.parse((await read(root!, curlConfig.previousReview)).toString('utf8')));
      if (approval.configurationSha256 !== curlConfig.previous.sourceSha256) throw new Error('Curl repair must pin the qualified local body approval.');
      bodyReviewApproval = approval;
    }
    const jointConfig = neckConfig ? bodyReviewV3Schema.parse(JSON.parse((await read(root!, neckConfig.previous)).toString('utf8'))) : config.assetVersion === 3 ? config : undefined;
    if (neckConfig) {
      if (neckConfig.previous.source !== 'authoring-v3.json' || !jointConfig) throw new Error('Neck shading requires the retained revision-3 shoulder anatomy.');
      for (const key of [...inheritedKeys, 'torsoRepair', 'jointRepair', 'hairOwnership'] as const) if (JSON.stringify(neckConfig[key]) !== JSON.stringify(jointConfig[key])) throw new Error('Neck shading must preserve native proportions, shoulder anatomy and hair ownership.');
    }
    const revision2 = config.assetVersion === 2 ? config : bodyReviewV2Schema.parse(JSON.parse((await read(root!, jointConfig!.previous)).toString('utf8')));
    if (jointConfig) {
      if (jointConfig.previous.source !== 'authoring-v2.json' || JSON.stringify(jointConfig.torsoRepair) !== JSON.stringify(revision2.torsoRepair)) throw new Error('Joint repair requires the unchanged revision-2 torso and underwear baseline.');
      for (const key of inheritedKeys) if (JSON.stringify(revision2[key]) !== JSON.stringify(jointConfig[key])) throw new Error('Joint repair must preserve native head, pose, reference and original body/hair baselines.');
    }
    const previous = bodyReviewV1Schema.parse(JSON.parse((await read(root!, revision2.previous)).toString('utf8')));
    if (revision2.previous.source !== 'authoring.json') throw new Error('Revision 2 requires the retained original S body study.');
    for (const key of inheritedKeys) if (JSON.stringify(previous[key]) !== JSON.stringify(revision2[key])) throw new Error('Torso repair must preserve native head, pose, reference and original body/hair baselines.');
    const [baseline, body2, repairStudy, torsoMask, fittedFront, fittedRear, toRear, toFront] = await Promise.all([load(root!, previous.body), load(root!, revision2.body), load(root!, revision2.torsoRepair.study), load(root!, revision2.torsoRepair.selection), load(root!, revision2.hairOwnership.front), load(root!, revision2.hairOwnership.rear), load(root!, revision2.hairOwnership.toRear), load(root!, revision2.hairOwnership.toFront)]);
    const repairSettings = JSON.parse((await read(root!, revision2.torsoRepair.settings)).toString('utf8'));
    repairMeasurements = validateBodyRepair({ original: baseline, stencil: mask, study: repairStudy, body: body2, torsoMask, front: fittedFront, rear: fittedRear, oldFront: front, oldRear: rear, toRear, toFront, settings: repairSettings });
    originalBody = baseline; baselineBody = baseline; selectedFront = fittedFront; selectedRear = fittedRear;
    if (jointConfig) {
      const [jointBody, jointStudy, jointMask, skinMask, posedHead, headMask, jointFront, jointRear, jointToRear, jointToFront] = await Promise.all([load(root!, jointConfig.body), load(root!, jointConfig.jointRepair.study), load(root!, jointConfig.jointRepair.selection), load(root!, jointConfig.jointRepair.skinSelection), load(root!, jointConfig.jointRepair.head), load(root!, jointConfig.jointRepair.headSelection), load(root!, jointConfig.hairOwnership.front), load(root!, jointConfig.hairOwnership.rear), load(root!, jointConfig.hairOwnership.toRear), load(root!, jointConfig.hairOwnership.toFront)]);
      await read(root!, jointConfig.jointRepair.guide);
      const jointSettings = JSON.parse((await read(root!, jointConfig.jointRepair.settings)).toString('utf8'));
      repairMeasurements = validateBodyJoint({ original: body2, originalHead: head, study: jointStudy, body: jointBody, head: posedHead, jointMask, skinMask, headMask, oldFront: front, oldRear: rear, front: jointFront, rear: jointRear, toRear: jointToRear, toFront: jointToFront, settings: jointSettings });
      baselineBody = body2; baselineFront = fittedFront; baselineRear = fittedRear; selectedHead = posedHead; selectedFront = jointFront; selectedRear = jointRear;
      if (neckConfig) {
        const [neckStudy, neckMask, neckHead] = await Promise.all([load(root!, neckConfig.neckRepair.study), load(root!, neckConfig.neckRepair.selection), load(root!, neckConfig.neckRepair.head)]);
        await read(root!, neckConfig.neckRepair.guide);
        const neckSettings = JSON.parse((await read(root!, neckConfig.neckRepair.settings)).toString('utf8'));
        neckRepairMeasurements = validateNeckShading({ originalBody: jointBody, originalHead: posedHead, study: neckStudy, body, head: neckHead, mask: neckMask, settings: neckSettings });
        baselineBody = jointBody; baselineHead = posedHead; baselineFront = jointFront; baselineRear = jointRear; selectedHead = neckHead;
        if (curlConfig) {
          const qualifiedFit = blankImage(1024, 1536);
          for (const layer of [jointRear, body, neckHead, jointFront]) drawRgba(qualifiedFit, layer, 0, 0);
          qualifiedFitSha256 = sha256(encodePng(qualifiedFit));
          const [curlFront, curlRear, curlToRear, curlToFront] = await Promise.all([load(root!, curlConfig.curlRepair.front), load(root!, curlConfig.curlRepair.rear), load(root!, curlConfig.curlRepair.toRear), load(root!, curlConfig.curlRepair.toFront)]);
          const curlSettings = JSON.parse((await read(root!, curlConfig.curlRepair.settings)).toString('utf8'));
          curlRepairMeasurements = validateCurlEdges({ oldFront: front, oldRear: rear, front: curlFront, rear: curlRear, toRear: curlToRear, toFront: curlToFront, settings: curlSettings });
          baselineBody = body; baselineHead = neckHead; selectedFront = curlFront; selectedRear = curlRear;
          if (config.assetVersion === 6) {
            const [spillFront, spillRear, spillMask] = await Promise.all([load(root!, config.spillRepair.front), load(root!, config.spillRepair.rear), load(root!, config.spillRepair.selection)]);
            const spillSettings = JSON.parse((await read(root!, config.spillRepair.settings)).toString('utf8'));
            spillRepairMeasurements = validateCurlSpill({ oldFront: curlFront, oldRear: curlRear, front: spillFront, rear: spillRear, mask: spillMask, settings: spillSettings });
            baselineFront = curlFront; baselineRear = curlRear; selectedFront = spillFront; selectedRear = spillRear;
          }
        }
      }
    }
  }
  if (sha256(encodePng(head)) !== config.approvedHeadBareSha256) throw new Error('Body guide must preserve the exact approved head/neck pixels.');
  let pixels = 0, boundaryPixels = 0, left = 1024, right = 0, top = 1536, bottom = 0;
  for (let i = 0; i < body.data.length; i += 4) {
    const alpha = Math.round(study.data[i + 3]! * mask.data[i + 3]! / 255), expectedAlpha = alpha < 8 ? 0 : alpha;
    if (originalBody.data[i + 3] !== expectedAlpha || originalBody.data.subarray(i, i + 3).some((value, c) => value !== (expectedAlpha ? study.data[i + c]! : 0))) throw new Error('Body pixels must retain native study ownership inside the selected mask.');
    if (body.data[i + 3]) {
      const p = i / 4, x = p % 1024, y = Math.floor(p / 1024);
      if (y < (config.assetVersion >= 3 ? 280 : 300)) throw new Error('Body selection cannot replace approved head anatomy.');
      pixels++; left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y);
      if (x === 0 || x === 1023 || y === 1535) boundaryPixels++;
    }
  }
  if (!pixels || boundaryPixels) throw new Error('Body study is empty or clipped by the native canvas.');
  const compose = (withBody: boolean, withHair: boolean, useBaseline = false) => {
    const image = blankImage(1024, 1536), planes = new Map<RenderPlane, RgbaImage>([['head', useBaseline ? baselineHead : selectedHead]]);
    if (withBody) planes.set('body-torso', useBaseline ? baselineBody : body);
    if (withHair) { planes.set('hair-rear', useBaseline ? baselineRear : selectedRear); planes.set('hair-front', useBaseline ? baselineFront : selectedFront); }
    for (const plane of DIRECTION_PLANE_ORDER.S) { const layer = planes.get(plane); if (layer) drawRgba(image, layer, 0, 0); }
    return image;
  };
  const standingFit = blankImage(1024, 1536);
  for (const layer of [rear, head, front]) drawRgba(standingFit, layer, 0, 0);
  if (sha256(encodePng(standingFit)) !== config.approvedHeadFitSha256) throw new Error('Retained standing composition must match the accepted S head/hair fit.');
  const anatomy = compose(true, false), fit = compose(true, true), overview = blankImage(3072, 1536);
  for (const [column, image] of [reference, anatomy, fit].entries()) drawRgba(overview, checkerPreview(image, 'S'), column * 1024, 0);
  const join = blankImage(900, 220);
  for (const [column, image] of [reference, anatomy, fit].entries()) {
    const crop = blankImage(300, 220);
    for (let y = 0; y < 220; y++) crop.data.set(image.data.subarray(((y + 245) * 1024 + 360) * 4, ((y + 245) * 1024 + 660) * 4), y * 300 * 4);
    drawRgba(join, checkerPreview(crop, 'S'), column * 300, 0);
  }
  const revisionComparison = blankImage(990, 480), baselineFit = compose(true, true, true);
  if (bodyReviewApproval && (sha256(encodePng(anatomy)) !== bodyReviewApproval.bareSha256 || (qualifiedFitSha256 ?? sha256(encodePng(baselineFit))) !== bodyReviewApproval.fitSha256)) throw new Error('Curl repair must preserve the qualified body/neck checkpoint and its exact preceding fit.');
  for (const [column, image] of [reference, baselineFit, fit].entries()) {
    const crop = blankImage(330, 480); for (let y = 0; y < 480; y++) crop.data.set(image.data.subarray(((y + 280) * 1024 + 350) * 4, ((y + 280) * 1024 + 680) * 4), y * 330 * 4);
    drawRgba(revisionComparison, checkerPreview(crop, 'S'), column * 330, 0);
  }
  const curlComparison = blankImage(2400, 380);
  if (config.assetVersion >= 5) for (const [column, image] of [reference, baselineFit, fit].entries()) {
    const crop = blankImage(200, 95);
    for (let y = 0; y < 95; y++) crop.data.set(image.data.subarray(((y + 275) * 1024 + 420) * 4, ((y + 275) * 1024 + 620) * 4), y * 200 * 4);
    const decorated = checkerPreview(crop, 'S');
    for (let y = 0; y < 380; y++) for (let x = 0; x < 800; x++) { const i = (Math.floor(y / 4) * 200 + Math.floor(x / 4)) * 4; curlComparison.data.set(decorated.data.subarray(i, i + 4), (y * 2400 + column * 800 + x) * 4); }
  }
  const pending = [{ path: 'fit/S-anatomy.png', image: anatomy }, { path: 'fit/S.png', image: fit }, { path: 'overview.png', image: overview }, { path: 'inspection/S-neck-shoulder-comparison.png', image: join }, ...(config.assetVersion !== 1 ? [{ path: 'inspection/S-body-fit-comparison.png', image: revisionComparison }] : []), ...(config.assetVersion >= 5 ? [{ path: 'inspection/S-curl-edge-comparison.png', image: curlComparison }] : [])];
  const report = { schemaVersion: 1, id: config.id, assetVersion: config.assetVersion, configuration: options.configFile ?? 'authoring-v6.json', repairMeasurements, neckRepairMeasurements, curlRepairMeasurements, spillRepairMeasurements, bodyStudyMostlyApproved: !!bodyReviewApproval, baselineFitSha256: sha256(encodePng(baselineFit)), underlayer: config.assetVersion !== 1 ? config.torsoRepair.underlayer : 'historical-one-piece-unitard', configSha256: sha256(configBytes), status: config.status, supportedReviewDirections: ['S'], sourcePose: config.sourcePose, nativePosition: config.nativePosition, published: false, paletteReady: false, productionAnatomyApproved: false, bodyOcclusionVerified: false, tposeApproved: false, finalStep6CAccepted: false, partitionStatus: config.partitionStatus, compositionOrder: DIRECTION_PLANE_ORDER.S, preservedHeadBareSha256: config.approvedHeadBareSha256, preservedHeadFitSha256: config.approvedHeadFitSha256, assemblyHeadSha256: sha256(encodePng(selectedHead)), bodyFreeAssemblySha256: sha256(encodePng(compose(false, true))), baselineAssetVersion: config.assetVersion === 6 ? 5 : config.assetVersion === 5 ? 4 : config.assetVersion === 4 ? 3 : config.assetVersion === 3 ? 2 : 1, measurements: { selectedBodyPixels: pixels, boundaryPixels, bounds: { left, top, right, bottom } }, fitSha256: sha256(encodePng(fit)), bareSha256: sha256(encodePng(anatomy)), comparisonColumns: ['same-facing standing reference', config.assetVersion >= 3 ? 'new S T-pose body with approved face/skull and local neck-base ownership' : 'new S T-pose body with exact approved head/neck', 'actual retained hair plus new body'], previewSampling: 'native-copy-no-transforms', curlInspection: config.assetVersion >= 5 ? { path: 'inspection/S-curl-edge-comparison.png', magnification: 4, sampling: 'nearest-neighbour-inspection-only', columns: config.assetVersion === 6 ? ['same-facing reference', 'revision 5 with remaining colour spill', 'revision 6 local rear-ownership repair'] : ['same-facing reference', 'qualified revision 4 with binary curl masks', 'revision 5 with rounded antialiased masks'] } : undefined, knownReviewIssues: config.knownReviewIssues, futureBodyFitObligations: headApproval.futureBodyFitObligations, futureHairstyleFitObligations: headApproval.futureHairstyleFitObligations, outputs: pending.map(p => ({ path: p.path, sha256: sha256(encodePng(p.image)) })) };
  for (const p of [...pending.map(p => ({ path: p.path, bytes: encodePng(p.image) })), { path: 'metadata.json', bytes: Buffer.from(JSON.stringify(report, null, 2) + '\n') }]) {
    const path = resolve(out, p.path);
    for (let parent = path; inside(out, parent); parent = dirname(parent)) { try { if ((await lstat(parent)).isSymbolicLink()) throw new Error('Body output symlinks forbidden.'); } catch (e) { if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e; } if (parent === out) break; }
    await mkdir(dirname(path), { recursive: true }); await writeFile(path, p.bytes);
  }
  for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error('Body input changed during review.');
  return report;
}
