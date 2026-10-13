import { lstat, mkdir, mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { isAbsolute, relative, resolve } from 'node:path';
import { z } from 'zod';
import { assetSourceSchema, DIRECTIONS, DIRECTION_PLANE_ORDER } from '@character-studio/core';
import { blankImage, decodePng, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { checkerPreview } from './inspection';
import { prepareEarReview, earReviewSchema } from './ear-review';
import { headReviewSchema } from './head-review-schema';
import { sha256 } from './reference-import';
import { faceProportionSchema, validateFaceProportionRepair } from './face-proportion-repair';
import { prepareFaceOverlayInspection } from './face-overlay-inspection';
import { faceAlignmentRepairSchema, faceAlignmentGeometry, validateFaceAlignmentRepair } from './face-alignment-repair';
import { faceNeckEdgeRepairSchema, faceNeckEdgeGeometry, validateFaceNeckEdgeRepair, faceNeckEdgeComparison } from './face-neck-edge-repair';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const pin = z.strictObject({ source: assetSourceSchema, sourceSha256: hash });
const origin = z.strictObject({ x: z.literal(511), y: z.literal(169) });
const layer = pin.extend({ selection: pin, origin, pixelCount: z.number().int().positive(), owner: z.enum(['reference', 'study']).optional() });
const featureNames = ['rightEye', 'leftEye', 'rightBrow', 'leftBrow', 'mouth'] as const;
const sides = { rightEye: 'right', leftEye: 'left', rightBrow: 'right', leftBrow: 'left', mouth: 'center' } as const;
const planes = { rightEye: 'eyes', leftEye: 'eyes', rightBrow: 'eyebrows', leftBrow: 'eyebrows', mouth: 'mouth' } as const;
export const faceReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('face.reference.v1'), assetVersion: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]), direction: z.literal('S'), target: z.literal('detailed'),
  sourcePose: z.literal('standing-reference'), intendedRuntimePose: z.literal('tpose'), published: z.literal(false), paletteReady: z.literal(false), status: z.literal('draft-needs-human-review'),
  method: z.enum(['manually-selected-native-S-reference-features', 'locally-authored-native-S-eye-fit', 'reference-proportioned-native-S-head-fit']), nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }),
  earConfig: z.strictObject({ source: z.literal('authoring-v2.json'), sourceSha256: hash }), earApproval: z.strictObject({ source: z.literal('review-fit-v2.json'), sourceSha256: hash }),
  reference: pin, settings: z.strictObject({ source: z.enum(['inputs/feature-selections-v2.json', 'inputs/eye-fit-selections-v2.json', 'inputs/slim-face-features-v3.json']), sourceSha256: hash }),
  baseline: z.strictObject({ source: z.literal('authoring-v1.json'), sourceSha256: hash }).optional(), study: pin.optional(),
  previous: z.strictObject({ source: z.enum(['authoring-v2.json', 'authoring-v3.json', 'authoring-v4.json']), sourceSha256: hash }).optional(), headFit: faceProportionSchema.optional(), alignmentRepair: faceAlignmentRepairSchema.optional(), neckEdgeRepair: faceNeckEdgeRepairSchema.optional(),
  features: z.strictObject({
    rightEye: layer.extend({ plane: z.literal('eyes'), side: z.literal('right') }), leftEye: layer.extend({ plane: z.literal('eyes'), side: z.literal('left') }),
    rightBrow: layer.extend({ plane: z.literal('eyebrows'), side: z.literal('right') }), leftBrow: layer.extend({ plane: z.literal('eyebrows'), side: z.literal('left') }),
    mouth: layer.extend({ plane: z.literal('mouth'), side: z.literal('center') }),
  }), knownReviewIssues: z.array(z.string().min(1)).min(1),
}).refine((d) => (d.assetVersion === 5 ? !!d.neckEdgeRepair && !!d.alignmentRepair && d.previous?.source === 'authoring-v4.json'
  : !d.neckEdgeRepair && (d.assetVersion === 4 ? !!d.alignmentRepair && d.previous?.source === 'authoring-v3.json' : !d.alignmentRepair && (!d.previous || d.previous.source === 'authoring-v2.json'))) && (d.assetVersion === 1
  ? d.method === 'manually-selected-native-S-reference-features' && !d.baseline && !d.study && !d.previous && !d.headFit && d.settings.source === 'inputs/feature-selections-v2.json' && featureNames.every((name) => !d.features[name].owner || d.features[name].owner === 'reference')
  : d.assetVersion === 2
    ? d.method === 'locally-authored-native-S-eye-fit' && !!d.baseline && !!d.study && !d.previous && !d.headFit && d.settings.source === 'inputs/eye-fit-selections-v2.json' && featureNames.every((name) => d.features[name].owner === (name === 'mouth' ? 'reference' : 'study'))
    : d.method === 'reference-proportioned-native-S-head-fit' && !!d.baseline && !!d.study && !!d.previous && !!d.headFit && d.settings.source === 'inputs/slim-face-features-v3.json' && featureNames.every((name) => d.features[name].owner === 'reference')), 'Facial revision must declare its pinned baseline and native pixel ownership.');
const selection = z.strictObject({ plane: z.enum(['eyes', 'eyebrows', 'mouth']), side: z.enum(['left', 'right', 'center']), polygon: z.array(z.tuple([z.number().int(), z.number().int()])).min(3).max(32) });
const settingsSchema = z.strictObject({ schemaVersion: z.literal(1), method: z.enum(['manually-selected-native-S-reference-features', 'locally-authored-native-S-eye-fit', 'reference-proportioned-native-S-head-fit']), sideConvention: z.string(), features: z.strictObject({ rightEye: selection, leftEye: selection, rightBrow: selection, leftBrow: selection, mouth: selection }), limitations: z.array(z.string()) });
const bounds = { rightEye: [448, 187, 501, 219], leftEye: [517, 173, 571, 209], rightBrow: [456, 181, 488, 191], leftBrow: [520, 175, 549, 189], mouth: [496, 228, 535, 247] } as const;
const fittedBounds = { rightEye: [450, 186, 506, 225], leftEye: [517, 182, 572, 223], rightBrow: [457, 173, 500, 192], leftBrow: [521, 172, 568, 192], mouth: bounds.mouth } as const;
const contains = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => {
  let selected = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [ax, ay] = polygon[a]!, [bx, by] = polygon[b]!;
    if ((ay > y) !== (by > y) && x < (bx - ax) * (y - ay) / (by - ay) + ax) selected = !selected;
  }
  return selected;
};
const nested = (parent: string, child: string) => { const p = relative(parent, child); return p === '' || (!p.startsWith('..') && !isAbsolute(p)); };
const crop = (image: RgbaImage) => {
  const out = blankImage(384, 440);
  for (let y = 0; y < 440; y++) out.data.set(image.data.subarray(((y + 40) * 1024 + 320) * 4, ((y + 40) * 1024 + 704) * 4), y * 384 * 4);
  return out;
};
export interface FaceReviewOptions {
  readonly sourceDirectory: string;
  readonly earDirectory: string;
  readonly headDirectory: string;
  readonly referenceDirectory: string;
  readonly outputDirectory: string;
  readonly configFile?: 'authoring-v1.json' | 'authoring-v2.json' | 'authoring-v3.json' | 'authoring-v4.json' | 'authoring-v5.json';
}

/** Local S facial-feature review over approved modular ears; never publishes runtime assets. */
export async function prepareFaceReview(options: FaceReviewOptions) {
  const [sourceDirectory, earDirectory, headDirectory, referenceDirectory] = await Promise.all([options.sourceDirectory, options.earDirectory, options.headDirectory, options.referenceDirectory].map((p) => realpath(p)));
  const outputDirectory = resolve(options.outputDirectory);
  for (const input of [sourceDirectory!, earDirectory!, headDirectory!, referenceDirectory!]) if (nested(input, outputDirectory) || nested(outputDirectory, input)) throw new Error('Face staging and input paths must be disjoint.');
  let ancestor = outputDirectory;
  while (true) {
    try { if (await realpath(ancestor) !== ancestor) throw new Error('Face staging cannot traverse symlinks.'); break; }
    catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; ancestor = resolve(ancestor, '..'); }
  }
  const inputs = new Map<string, string>();
  const read = async (directory: string, source: string, expected?: string) => {
    const path = resolve(directory, source);
    if (!nested(directory, path) || await realpath(path) !== path || !(await lstat(path)).isFile()) throw new Error(`${source}: ordinary native input required.`);
    const bytes = await readFile(path), digest = sha256(bytes);
    if (expected && digest !== expected) throw new Error(`${source}: pinned source changed; author a new revision.`);
    inputs.set(path, digest); return bytes;
  };
  const load = async (directory: string, input: z.infer<typeof pin>) => {
    const image = decodePng(await read(directory, input.source, input.sourceSha256));
    if (image.width !== 1024 || image.height !== 1536) throw new Error(`${input.source}: native 1024 × 1536 required without transforms.`);
    for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4);
    return image;
  };
  const configBytes = await read(sourceDirectory!, options.configFile ?? 'authoring-v5.json'), config = faceReviewSchema.parse(JSON.parse(configBytes.toString('utf8')));
  const prior = config.baseline ? faceReviewSchema.parse(JSON.parse((await read(sourceDirectory!, config.baseline.source, config.baseline.sourceSha256)).toString('utf8'))) : undefined;
  const unchangedMouth = { ...config.features.mouth }; delete unchangedMouth.owner;
  if (prior && (prior.assetVersion !== 1 || JSON.stringify(prior.reference) !== JSON.stringify(config.reference) || JSON.stringify(prior.earConfig) !== JSON.stringify(config.earConfig) || JSON.stringify(prior.earApproval) !== JSON.stringify(config.earApproval) || JSON.stringify(prior.features.mouth) !== JSON.stringify(unchangedMouth))) throw new Error('Eye fit must preserve the pinned reference, approved ears and original mouth layer.');
  const previous = config.previous ? faceReviewSchema.parse(JSON.parse((await read(sourceDirectory!, config.previous.source, config.previous.sourceSha256)).toString('utf8'))) : prior;
  if (config.assetVersion >= 3 && featureNames.some((name) => { const current = { ...config.features[name] }; delete current.owner; return JSON.stringify(current) !== JSON.stringify(prior!.features[name]); })) throw new Error('Face proportion revision must restore exact original reference feature layers.');
  if (config.assetVersion === 4 && (previous?.assetVersion !== 3 || ['headFit', 'study', 'settings'].some(key => JSON.stringify(config[key as 'headFit' | 'study' | 'settings']) !== JSON.stringify(previous[key as 'headFit' | 'study' | 'settings'])))) throw new Error('Alignment repair must preserve its exact pinned revision-3 anatomy baseline.');
  if (config.assetVersion === 5 && (previous?.assetVersion !== 4 || (['headFit', 'study', 'settings', 'alignmentRepair', 'reference', 'earConfig', 'earApproval', 'baseline', 'features'] as const).some(key => JSON.stringify(config[key]) !== JSON.stringify(previous[key])))) throw new Error('Neck-edge repair must preserve its exact pinned revision-4 anatomy and feature baseline.');
  const settings = settingsSchema.parse(JSON.parse((await read(sourceDirectory!, config.settings.source, config.settings.sourceSha256)).toString('utf8')));
  if (settings.method !== config.method) throw new Error('Facial study ownership method differs from its configuration.');
  const earBytes = await read(earDirectory!, config.earConfig.source, config.earConfig.sourceSha256), ears = earReviewSchema.parse(JSON.parse(earBytes.toString('utf8')));
  const approval = z.object({ decision: z.literal('approved-standing-reference-fit'), configSha256: hash, fitMeasurements: z.array(z.object({ direction: z.literal('S'), outputSha256: hash })) }).parse(JSON.parse((await read(earDirectory!, config.earApproval.source, config.earApproval.sourceSha256)).toString('utf8')));
  if (approval.configSha256 !== sha256(earBytes)) throw new Error('Facial review requires the approved S ear revision.');
  const head = headReviewSchema.parse(JSON.parse((await read(headDirectory!, ears.headConfig.source, ears.headConfig.sourceSha256)).toString('utf8')));
  if (config.reference.source !== head.frames.S.reference || config.reference.sourceSha256 !== head.frames.S.referenceSha256) throw new Error('Facial features must use their own S reference.');
  const temporary = await mkdtemp(resolve(tmpdir(), 'character-face-ear-baseline-'));
  try {
    const baseline = await prepareEarReview({ sourceDirectory: earDirectory!, headDirectory: headDirectory!, referenceDirectory: referenceDirectory!, outputDirectory: resolve(temporary, 'ears'), configFile: 'authoring-v2.json' });
    if (baseline.humanFitSha256 !== approval.fitMeasurements[0]?.outputSha256) throw new Error('Approved ear composition changed.');
    const [reference, skin, earless, retention, rightEar, leftEar, neck, rear, front, study] = await Promise.all([
      load(referenceDirectory!, config.reference), decodePng(await readFile(resolve(temporary, 'ears/assembled/S-head-human.png'))),
      load(earDirectory!, ears.head), load(earDirectory!, ears.headRetention), load(earDirectory!, ears.sides.right), load(earDirectory!, ears.sides.left),
      load(headDirectory!, head.frames.S.neck), load(headDirectory!, head.coherentFit!.rear), load(headDirectory!, head.coherentFit!.front),
      config.study ? load(sourceDirectory!, config.study) : undefined,
    ]);
    let maskedHead = { ...earless, data: earless.data.slice() };
    for (let i = 0; i < maskedHead.data.length; i += 4) if (retention.data[i + 3] === 0) maskedHead.data.fill(0, i, i + 4);
    let earPair = blankImage(1024, 1536); drawRgba(earPair, rightEar, 0, 0); drawRgba(earPair, leftEar, 0, 0);
    const approvedMaskedHead = maskedHead, approvedEarPair = earPair;
    let composedNeck = neck;
    let composedFront = front, composedRear = rear;
    const proportionOutputs: { path: string; image: RgbaImage }[] = [];
    let retainedEarPixels: { right: number; left: number } | undefined;
    if (config.headFit) {
      const fit = config.headFit;
      const [corrected, localMask, noseMask, activeRetention, right, rightMask, left, leftMask] = await Promise.all([
        load(sourceDirectory!, fit), load(sourceDirectory!, fit.selection), load(sourceDirectory!, fit.noseSelection), load(sourceDirectory!, fit.retention),
        load(sourceDirectory!, fit.rightEar), load(sourceDirectory!, fit.rightEar.selection), load(sourceDirectory!, fit.leftEar), load(sourceDirectory!, fit.leftEar.selection),
      ]);
      const [joinStudy, headJoinSelection, joinedNeck, neckSelection] = await Promise.all([fit.joinStudy ? load(sourceDirectory!, fit.joinStudy) : undefined, fit.headJoinSelection ? load(sourceDirectory!, fit.headJoinSelection) : undefined, fit.neck ? load(sourceDirectory!, fit.neck) : undefined, fit.neckSelection ? load(sourceDirectory!, fit.neckSelection) : undefined]);
      retainedEarPixels = validateFaceProportionRepair({ original: earless, study: study!, reference, head: corrected, selection: localMask, noseSelection: noseMask, retention: activeRetention, rightEar: right, rightSelection: rightMask, originalRightEar: rightEar, leftEar: left, leftSelection: leftMask, originalLeftEar: leftEar, originalNeck: neck, joinStudy, headJoinSelection, neck: joinedNeck, neckSelection });
      if (joinedNeck) composedNeck = joinedNeck;
      maskedHead = { ...corrected, data: corrected.data.slice() };
      for (let i = 0; i < maskedHead.data.length; i += 4) if (activeRetention.data[i + 3] === 0) maskedHead.data.fill(0, i, i + 4);
      earPair = blankImage(1024, 1536); drawRgba(earPair, right, 0, 0); drawRgba(earPair, left, 0, 0);
      proportionOutputs.push({ path: 'layers/S-head-underlay.png', image: corrected }, { path: 'masks/S-face-correction.png', image: localMask }, { path: 'masks/S-native-nose.png', image: noseMask }, { path: 'masks/S-head-retention.png', image: activeRetention }, { path: 'layers/S-right-ear.png', image: right }, { path: 'layers/S-left-ear.png', image: left });
      if (joinedNeck) proportionOutputs.push({ path: 'layers/S-neck.png', image: joinedNeck }, { path: 'masks/S-head-join.png', image: headJoinSelection! }, { path: 'masks/S-neck-join.png', image: neckSelection! });
    }
    const layers: { name: typeof featureNames[number]; image: RgbaImage; mask: RgbaImage; plane: 'eyes' | 'eyebrows' | 'mouth'; pixels: number; occluded: number }[] = [];
    for (const name of featureNames) {
      const selection = settings.features[name], [x0, y0, x1, y1] = (config.assetVersion === 2 ? fittedBounds : bounds)[name];
      if (selection.plane !== planes[name] || selection.side !== sides[name] || selection.polygon.some(([x, y]) => x < x0 || x > x1 || y < y0 || y > y1)) throw new Error(`${name}: selection violates native facing/side/feature ownership.`);
      const part = config.features[name], [image, mask] = await Promise.all([load(sourceDirectory!, part), load(sourceDirectory!, part.selection)]); let pixels = 0, occluded = 0;
      const owner = part.owner === 'study' ? study! : reference;
      for (let p = 0; p < 1024 * 1536; p++) {
        const i = p * 4, x = p % 1024, y = Math.floor(p / 1024), selected = x >= x0 && x <= x1 && y >= y0 && y <= y1 && contains(x + 0.5, y + 0.5, selection.polygon);
        if (mask.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0)) || image.data.subarray(i, i + 4).some((v, c) => v !== (selected ? owner.data[i + c] : 0))) throw new Error(`${name}: layer/mask must retain only its own native reference pixels or selected local study pixels.`);
        if (image.data[i + 3]! >= 8) { pixels++; if (front.data[i + 3]! >= 8) occluded++; }
      }
      if (pixels !== part.pixelCount) throw new Error(`${name}: feature coverage changed.`);
      layers.push({ name, image, mask, plane: part.plane, pixels, occluded });
    }
    const compose = (withFeatures: boolean, withHair: boolean, selectedLayers = layers, nativeHead = maskedHead, nativeEars = earPair, nativeNeck = composedNeck, nativeFront = composedFront, nativeRear = composedRear) => {
      const out = blankImage(1024, 1536), parts = new Map<string, RgbaImage[]>([['neck', [nativeNeck]], ['head', [nativeHead]], ['ears', [nativeEars]]]);
      if (withHair) { parts.set('hair-rear', [nativeRear]); parts.set('hair-front', [nativeFront]); }
      if (withFeatures) for (const layer of selectedLayers) parts.set(layer.plane, [...(parts.get(layer.plane) ?? []), layer.image]);
      for (const plane of DIRECTION_PLANE_ORDER.S) for (const image of parts.get(plane) ?? []) drawRgba(out, image, 0, 0);
      return out;
    };
    const unrepairedFit = compose(true, true);
    let alignmentMeasurements: ReturnType<typeof validateFaceAlignmentRepair> | undefined;
    let neckEdgeMeasurements: ReturnType<typeof validateFaceNeckEdgeRepair> | undefined;
    let neckEdgePreviousFit: RgbaImage | undefined;
    if (config.alignmentRepair) {
      const r = config.alignmentRepair, ownership = JSON.parse((await read(sourceDirectory!, r.settings.source, r.settings.sourceSha256)).toString('utf8'));
      if (ownership.schemaVersion !== 1 || Object.entries(faceAlignmentGeometry).some(([key, value]) => JSON.stringify(ownership[key]) !== JSON.stringify(value))) throw new Error('Alignment masks must preserve the reviewed native geometry.');
      const [repairStudy, alignedHead, headSelection, alignedNeck, neckSelection, neckReferenceSelection, alignedLeft, earSelection, earReferenceSelection, alignedRetention, alignedFront, frontSelection, alignedRear, rearSelection] = await Promise.all([
        load(sourceDirectory!, r.study), load(sourceDirectory!, r.head), load(sourceDirectory!, r.head.selection), load(sourceDirectory!, r.neck), load(sourceDirectory!, r.neck.selection), load(sourceDirectory!, r.neck.referenceSelection),
        load(sourceDirectory!, r.leftEar), load(sourceDirectory!, r.leftEar.selection), load(sourceDirectory!, r.leftEar.referenceSelection), load(sourceDirectory!, r.retention), load(sourceDirectory!, r.front), load(sourceDirectory!, r.front.selection), load(sourceDirectory!, r.rear), load(sourceDirectory!, r.rear.selection),
      ]);
      const nativeRight = await load(sourceDirectory!, config.headFit!.rightEar);
      const alignedMaskedHead = { ...alignedHead, data: alignedHead.data.slice() };
      for (let i = 0; i < alignedHead.data.length; i += 4) if (alignedRetention.data[i + 3] === 0) alignedMaskedHead.data.fill(0, i, i + 4);
      const alignedEars = blankImage(1024, 1536); drawRgba(alignedEars, nativeRight, 0, 0); drawRgba(alignedEars, alignedLeft, 0, 0);
      const originalHead = await load(sourceDirectory!, config.headFit!);
      const beforeHairRepair = compose(true, true, layers, alignedMaskedHead, alignedEars, alignedNeck, front, rear);
      alignmentMeasurements = validateFaceAlignmentRepair({ study: repairStudy, reference, originalHead, originalNeck: composedNeck, originalFront: front, originalRear: rear, previousFit: unrepairedFit, beforeHairRepair, rightEar: nativeRight,
        head: alignedHead, headSelection, neck: alignedNeck, neckSelection, neckReferenceSelection, leftEar: alignedLeft, earSelection, earReferenceSelection, retention: alignedRetention, front: alignedFront, frontSelection, rear: alignedRear, rearSelection });
      maskedHead = alignedMaskedHead; earPair = alignedEars; composedNeck = alignedNeck; composedFront = alignedFront; composedRear = alignedRear;
      proportionOutputs.splice(0, proportionOutputs.length, ...proportionOutputs.map(out => ({ ...out, path: `baseline-v3/${out.path}` })),
        { path: 'layers/S-head-underlay.png', image: alignedHead }, { path: 'layers/S-neck.png', image: alignedNeck }, { path: 'layers/S-right-ear.png', image: nativeRight }, { path: 'layers/S-left-ear.png', image: alignedLeft },
        { path: 'layers/S-front-hair.png', image: alignedFront }, { path: 'layers/S-rear-hair.png', image: alignedRear }, { path: 'masks/S-head-retention.png', image: alignedRetention },
        ...[{ path: 'head', image: headSelection }, { path: 'neck', image: neckSelection }, { path: 'reference-neck', image: neckReferenceSelection }, { path: 'left-ear', image: earSelection }, { path: 'reference-left-ear', image: earReferenceSelection }, { path: 'front-hair', image: frontSelection }, { path: 'rear-hair', image: rearSelection }].map(out => ({ ...out, path: `masks/S-aligned-${out.path}.png` })));
    }
    if (config.neckEdgeRepair) {
      const r = config.neckEdgeRepair;
      const ownership = JSON.parse((await read(sourceDirectory!, r.settings.source, r.settings.sourceSha256)).toString('utf8'));
      if (ownership.schemaVersion !== 1 || Object.entries(faceNeckEdgeGeometry).some(([key, value]) => JSON.stringify(ownership[key]) !== JSON.stringify(value))) throw new Error('Neck-edge masks must preserve the manually reviewed native geometry.');
      const [backingStudy, correctedFront, frontSelection, correctedRear, rearSelection, correctedNeck, neckSelection, anatomyStudy, previousRearSelection, previousNeckSelection] = await Promise.all([
        load(sourceDirectory!, r.study), load(sourceDirectory!, r.front), load(sourceDirectory!, r.front.selection), load(sourceDirectory!, r.rear), load(sourceDirectory!, r.rear.selection), load(sourceDirectory!, r.neck), load(sourceDirectory!, r.neck.selection),
        load(sourceDirectory!, config.alignmentRepair!.study), load(sourceDirectory!, config.alignmentRepair!.rear.selection), load(sourceDirectory!, config.alignmentRepair!.neck.referenceSelection),
      ]);
      neckEdgePreviousFit = compose(true, true);
      neckEdgeMeasurements = validateFaceNeckEdgeRepair({ study: backingStudy, anatomyStudy, originalRear: rear, previousFront: composedFront, previousRear: composedRear, previousNeck: composedNeck, previousRearSelection, previousNeckSelection,
        front: correctedFront, frontSelection, rear: correctedRear, rearSelection, neck: correctedNeck, neckSelection });
      composedFront = correctedFront; composedRear = correctedRear; composedNeck = correctedNeck;
      for (const output of proportionOutputs) {
        if (output.path === 'layers/S-front-hair.png') output.image = correctedFront;
        if (output.path === 'layers/S-rear-hair.png') output.image = correctedRear;
        if (output.path === 'layers/S-neck.png') output.image = correctedNeck;
      }
      proportionOutputs.push({ path: 'masks/S-neck-edge-front-clear.png', image: frontSelection }, { path: 'masks/S-neck-edge-rear-backing.png', image: rearSelection }, { path: 'masks/S-neck-edge-skin-reset.png', image: neckSelection });
    }
    const baselineFit = compose(false, true, [], approvedMaskedHead, approvedEarPair, neck, front, rear), bareFit = compose(true, false), faceFit = compose(true, true), features = blankImage(1024, 1536);
    for (const layer of layers) drawRgba(features, layer.image, 0, 0);
    const previousLayers = previous ? await Promise.all(featureNames.map(async (name) => ({ name, image: await load(sourceDirectory!, previous.features[name]), mask: await load(sourceDirectory!, previous.features[name].selection), plane: previous.features[name].plane, pixels: previous.features[name].pixelCount, occluded: 0 }))) : layers;
    const previousFit = neckEdgePreviousFit ?? (config.assetVersion === 4 ? unrepairedFit : compose(true, true, previousLayers, approvedMaskedHead, approvedEarPair, neck, front, rear)), comparison = blankImage(1152, 440);
    for (const [column, image] of [reference, previousFit, faceFit].entries()) drawRgba(comparison, checkerPreview(crop(image), 'S'), column * 384, 0);
    if (sha256(encodePng(baselineFit)) !== baseline.humanFitSha256) throw new Error('Facial assembly must preserve approved ear/head/hair composition.');
    const overview = blankImage(1152, 440), anatomy = blankImage(1152, 440);
    for (const [column, image] of [reference, baselineFit, faceFit].entries()) drawRgba(overview, checkerPreview(crop(image), 'S'), column * 384, 0);
    for (const [column, image] of [skin, features, bareFit].entries()) drawRgba(anatomy, checkerPreview(crop(image), 'S'), column * 384, 0);
    const nativeHead = blankImage(1024, 1536); drawRgba(nativeHead, maskedHead, 0, 0); drawRgba(nativeHead, earPair, 0, 0);
    const overlayInspection = config.assetVersion >= 3 ? prepareFaceOverlayInspection(reference, nativeHead, faceFit, config.assetVersion) : undefined;
    const pending = [
      ...layers.flatMap(({ name, image, mask }) => [{ path: `layers/S-${name}.png`, image }, { path: `masks/S-${name}.png`, image: mask }]),
      { path: 'fit/S.png', image: faceFit }, { path: 'fit/S-bare.png', image: bareFit }, { path: 'fit/S-approved-ear-baseline.png', image: baselineFit },
      { path: 'layers/S-feature-pair-and-mouth.png', image: features }, { path: 'overview.png', image: overview }, { path: 'anatomy-overview.png', image: anatomy },
      ...(prior ? [{ path: 'inspection/eye-fit-comparison.png', image: comparison }] : []),
      ...proportionOutputs,
      ...(config.headFit ? [{ path: 'inspection/face-size-comparison.png', image: comparison }] : []),
      ...(config.assetVersion >= 4 ? [{ path: 'inspection/head-ear-fit-comparison.png', image: comparison }] : []),
      ...(neckEdgePreviousFit ? [{ path: 'inspection/neck-edge-comparison.png', image: faceNeckEdgeComparison(reference, neckEdgePreviousFit, faceFit) }] : []),
      ...(overlayInspection?.images ?? []),
    ].filter(({ path }) => config.assetVersion < 5 || (!path.startsWith('baseline-v3/') && !['inspection/eye-fit-comparison.png', 'inspection/face-size-comparison.png'].includes(path)));
    const report = { schemaVersion: 1, id: config.id, assetVersion: config.assetVersion, configSha256: sha256(configBytes), status: config.status, anatomyApproved: false, published: false, paletteReady: false, supportedReviewDirections: ['S'], missingDirections: DIRECTIONS.filter((d) => d !== 'S'),
      earApprovalSha256: config.earApproval.sourceSha256, approvedEarFitSha256: baseline.humanFitSha256, faceFitSha256: sha256(encodePng(faceFit)), nativePosition: { x: 0, y: 0 },
      previewColumns: ['S-reference', 'approved-smaller-ear-fit', `native-feature-fit-v${config.assetVersion}`], comparisonColumns: ['reference', config.assetVersion === 5 ? 'previous-native-fit-v4' : config.assetVersion === 4 ? 'previous-native-fit-v3' : config.assetVersion === 3 ? 'rejected-eye-fit-on-broad-face' : 'rejected-original-placement', config.assetVersion === 5 ? 'continuous-neck-edge-fit-v5' : config.assetVersion === 4 ? 'aligned-head-left-ear-fit-v4' : config.assetVersion === 3 ? 'slimmer-face-with-reference-features' : 'local-eye-fit'], previousFitSha256: sha256(encodePng(previousFit)), retainedEarPixels: alignmentMeasurements ? { right: retainedEarPixels!.right, left: alignmentMeasurements.leftEar } : retainedEarPixels, alignmentMeasurements, neckEdgeMeasurements,
      neckEdgeInspection: neckEdgePreviousFit ? { path: 'inspection/neck-edge-comparison.png', columns: ['reference', 'revision-4', 'revision-5'], crop: { x: 455, y: 242, width: 120, height: 76 }, displayMagnification: 4, sampling: 'native-copy' } : undefined,
      alignmentMeasurementsScope: config.neckEdgeRepair ? 'Pinned revision-4 baseline, before the ordered neck-edge overrides' : 'Current aligned fit',
      anatomyColumns: ['approved-head', 'isolated-native-features', 'bare-head-with-features'], closeupRegion: { x: 320, y: 40, width: 384, height: 440, sampling: 'native-copy' },
      measurements: layers.map(({ name, pixels, occluded }) => ({ name, side: config.features[name].side, plane: config.features[name].plane, owner: config.features[name].owner ?? 'reference', pixels, foregroundHairOverlapPixels: occluded, origin: config.features[name].origin })),
      knownReviewIssues: config.knownReviewIssues, reviewRequired: ['Native eye/brow/mouth fit and mask edges', 'Skin colour joins and facial proportions', 'Concealed eye/brow surfaces and independent expression variants', 'Other facings, materials and production T-pose', 'Final Step 6C approval before Step 6D'],
      overlayInspection: overlayInspection?.metadata, interactiveInspection: overlayInspection ? { path: 'inspection/head-reference-overlay.html', sha256: sha256(new TextEncoder().encode(overlayInspection.html)) } : undefined,
      outputs: pending.map(({ path, image }) => ({ path, sha256: sha256(encodePng(image)) })),
    };
    for (const [path, digest] of inputs) if (sha256(await readFile(path)) !== digest) throw new Error(`${path}: source changed during facial review.`);
    const save = async (path: string, bytes: Uint8Array) => {
      const destination = resolve(outputDirectory, path), parent = resolve(destination, '..'); await mkdir(parent, { recursive: true });
      if (await realpath(parent) !== parent) throw new Error('Face staging cannot traverse symlinks.');
      try { if ((await lstat(destination)).isSymbolicLink()) throw new Error('Face staging symlinks are forbidden.'); } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
      await writeFile(destination, bytes);
    };
    for (const { path, image } of pending) await save(path, encodePng(image));
    if (overlayInspection) await save('inspection/head-reference-overlay.html', new TextEncoder().encode(overlayInspection.html));
    await save('metadata.json', new TextEncoder().encode(`${JSON.stringify(report, null, 2)}\n`)); return report;
  } finally { await rm(temporary, { recursive: true, force: true }); }
}
