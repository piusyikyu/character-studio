import { DIRECTION_PLANE_ORDER } from '@character-studio/core';
import type { RenderPlane } from '@character-studio/core';
import { blankImage, drawRgba, encodePng } from '@character-studio/render-utils';
import type { RgbaImage } from '@character-studio/render-utils';
import { headFrontDiagonalsRepairSchema, headFrontDiagonalsReviewSchema } from './head-review-schema';
import type { HeadFrontDiagonalsRepairDraft } from './head-review-schema';
import type { HairReviewFrame } from './hair-review-schema';
import { sha256 } from './reference-import';
import { z } from 'zod';

const neckApprovalSchema = z.object({ status: z.literal('approved-standing-reference-fit-candidate'), configSha256: z.string().regex(/^[a-f0-9]{64}$/) });

const inside = (x: number, y: number, polygon: readonly (readonly [number, number])[]) => {
  let result = false;
  for (let a = 0, b = polygon.length - 1; a < polygon.length; b = a++) {
    const [xa, ya] = polygon[a]!, [xb, yb] = polygon[b]!;
    if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) result = !result;
  }
  return result;
};
const normalize = (image: RgbaImage) => {
  for (let i = 0; i < image.data.length; i += 4) if (image.data[i + 3]! < 8) image.data.fill(0, i, i + 4);
  return image;
};

/** Replay only selected native study pixels; a re-pinned unrelated edit still fails. */
export async function inspectDiagonalHeadRepair(
  draft: HeadFrontDiagonalsRepairDraft, direction: 'SE' | 'SW', hairFrame: HairReviewFrame,
  sourceDirectory: string, hairDirectory: string,
  read: (directory: string, source: string, hash?: string) => Promise<Buffer>,
  load: (directory: string, source: string, hash: string) => Promise<RgbaImage>, master: RgbaImage,
) {
  const config = draft.localFitRepair, repair = config.frames[direction];
  const baseline = headFrontDiagonalsReviewSchema.parse(JSON.parse((await read(sourceDirectory, config.baseline.source, config.baseline.sourceSha256)).toString('utf8')));
  const old = baseline.frames[direction], frame = draft.frames[direction];
  if (JSON.stringify(baseline.hairConfig) !== JSON.stringify(draft.hairConfig) || JSON.stringify(baseline.hairApproval) !== JSON.stringify(draft.hairApproval) || JSON.stringify([old.candidateHeadAnchor, old.candidateNeckAnchor, old.cutY, old.guide, old.allowedBounds, old.referenceSha256]) !== JSON.stringify([frame.candidateHeadAnchor, frame.candidateNeckAnchor, frame.cutY, frame.guide, frame.allowedBounds, frame.referenceSha256])) throw new Error(`${direction}: local repair must retain baseline geometry and approved hair pins.`);
  const settings = JSON.parse((await read(sourceDirectory, config.settings.source, config.settings.sourceSha256)).toString('utf8')) as { method: string; frames: Record<'SE' | 'SW', { patches: { name: string; directory: string; source: string; region: number[][]; minimumRedMinusBlue?: number }[]; frontRegions: number[][][] }> };
  const plan = settings.frames[direction];
  const descriptors = repair.patches.map(({ name, directory, study, region, minimumRedMinusBlue }) => ({ name, directory, source: study.source, region, ...(minimumRedMinusBlue === undefined ? {} : { minimumRedMinusBlue }) }));
  if (settings.method !== config.method || JSON.stringify(descriptors) !== JSON.stringify(plan.patches) || JSON.stringify(repair.frontRegions) !== JSON.stringify(plan.frontRegions)) throw new Error(`${direction}: repair masks differ from the pinned authoring settings.`);
  const expected = normalize(await load(sourceDirectory, old.master.source, old.master.sourceSha256));
  const masks: { name: string; image: RgbaImage }[] = [];
  for (const patch of repair.patches) {
    if (patch.name === 'native-nose' && (!hairFrame.designMaster || patch.study.source !== hairFrame.designMaster.source || patch.study.sourceSha256 !== hairFrame.designMaster.sourceSha256)) throw new Error('SE: native nose must come from its approved design study.');
    const study = normalize(await load(patch.directory === 'head' ? sourceDirectory : hairDirectory, patch.study.source, patch.study.sourceSha256));
    const mask = await load(sourceDirectory, patch.selection.source, patch.selection.sourceSha256); let pixelCount = 0;
    for (let i = 0; i < master.data.length; i += 4) {
      const p = i / 4;
      const selected = inside(p % 1024 + 0.5, Math.floor(p / 1024) + 0.5, patch.region) && (patch.minimumRedMinusBlue === undefined || study.data[i + 3]! >= 8 && study.data[i]! - study.data[i + 2]! > patch.minimumRedMinusBlue);
      if (mask.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0))) throw new Error(`${direction}: local anatomy mask differs from its manual region.`);
      if (selected) { expected.data.set(study.data.subarray(i, i + 4), i); pixelCount++; }
    }
    if (pixelCount !== patch.pixelCount) throw new Error(`${direction}: local anatomy selection coverage changed.`);
    masks.push({ name: patch.name, image: mask });
  }
  if (hairFrame.front.visibility !== 'visible') throw new Error(`${direction}: front hair is required for the local cleanup.`);
  const originalFront = normalize(await load(hairDirectory, hairFrame.front.artwork.source, hairFrame.front.artwork.sourceSha256));
  const front = normalize(await load(sourceDirectory, repair.front.source, repair.front.sourceSha256));
  const cleanupMask = await load(sourceDirectory, repair.frontSelection.source, repair.frontSelection.sourceSha256); let removedPixelCount = 0;
  for (let i = 0; i < front.data.length; i += 4) {
    const selected = originalFront.data[i + 3]! >= 8 && repair.frontRegions.some((p) => inside(i / 4 % 1024 + 0.5, Math.floor(i / 4 / 1024) + 0.5, p));
    if (cleanupMask.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0)) || front.data.subarray(i, i + 4).some((v, c) => v !== (selected ? 0 : originalFront.data[i + c]))) throw new Error(`${direction}: front-hair cleanup must preserve every unselected approved pixel.`);
    if (selected) removedPixelCount++;
  }
  if (removedPixelCount !== repair.removedPixelCount) throw new Error(`${direction}: front cleanup coverage changed.`);
  const baselineFit = blankImage(1024, 1536), layers = new Map<RenderPlane, RgbaImage>();
  layers.set('hair-front', originalFront);
  for (const [plane, input, directory] of [['hair-rear', hairFrame.rear, hairDirectory], ['neck', old.neck, sourceDirectory], ['head', old.head, sourceDirectory]] as const) layers.set(plane, normalize(await load(directory, input.source, input.sourceSha256)));
  let rear: RgbaImage | undefined;
  let swOperations: { name: string; plane: string; pixelCount: number; changedPixelCount: number }[] | undefined;
  if (draft.swCorrection) {
    const correction = draft.swCorrection;
    const prior = headFrontDiagonalsRepairSchema.parse(JSON.parse((await read(sourceDirectory, correction.baseline.source, correction.baseline.sourceSha256)).toString('utf8')));
    if (prior.assetVersion !== 2 || JSON.stringify(prior.localFitRepair) !== JSON.stringify(draft.localFitRepair) || JSON.stringify(prior.frames.SE) !== JSON.stringify(draft.frames.SE)) throw new Error('SW correction must retain the pinned v2 repair and unchanged SE anatomy.');
    const unchanged = (f: typeof frame) => [f.referenceSha256, f.guide, f.candidateHeadAnchor, f.candidateNeckAnchor, f.cutY, f.allowedBounds];
    if (JSON.stringify(unchanged(prior.frames.SW)) !== JSON.stringify(unchanged(draft.frames.SW))) throw new Error('SW correction must retain native anchors, guides and authoring envelope.');
    layers.set('hair-front', { ...front, data: new Uint8Array(front.data) });
    for (const part of ['head', 'neck'] as const) layers.set(part, normalize(await load(sourceDirectory, prior.frames[direction][part].source, prior.frames[direction][part].sourceSha256)));
    if (direction === 'SW') {
      const previousMaster = normalize(await load(sourceDirectory, prior.frames.SW.master.source, prior.frames.SW.master.sourceSha256));
      if (sha256(previousMaster.data) !== sha256(expected.data)) throw new Error('SW: correction baseline differs from its v2 native source ownership.');
      const settings = JSON.parse((await read(sourceDirectory, correction.settings.source, correction.settings.sourceSha256)).toString('utf8')) as { operations: unknown[] };
      const descriptors = correction.operations.map(({ name, plane, directory, study, region, excludeRegions, color }) => ({ name, plane, directory, source: study.source, region, excludeRegions, color }));
      if (JSON.stringify(descriptors) !== JSON.stringify(settings.operations)) throw new Error('SW: corrections differ from their pinned manual settings.');
      rear = { ...layers.get('hair-rear')!, data: new Uint8Array(layers.get('hair-rear')!.data) };
      const correctedPlanes = { skin: expected, 'hair-front': front, 'hair-rear': rear };
      swOperations = [];
      for (const op of correction.operations) {
        const canonical = op.name === 'jaw' ? hairFrame.fitHead?.artwork : hairFrame.designMaster;
        if (op.directory === 'hair' && (!canonical || op.study.source !== canonical.source || op.study.sourceSha256 !== canonical.sourceSha256)) throw new Error('SW: canonical repair pixels must come from their approved same-facing study.');
        const study = normalize(await load(op.directory === 'head' ? sourceDirectory : hairDirectory, op.study.source, op.study.sourceSha256));
        const mask = await load(sourceDirectory, op.selection.source, op.selection.sourceSha256), target = correctedPlanes[op.plane];
        let pixelCount = 0, changedPixelCount = 0;
        for (let i = 0; i < target.data.length; i += 4) {
          const x = i / 4 % 1024 + 0.5, y = Math.floor(i / 4 / 1024) + 0.5;
          const selected = inside(x, y, op.region) && !op.excludeRegions.some((p) => inside(x, y, p)) && (op.color === 'all' || study.data[i + 3]! >= 8 && (study.data[i]! - study.data[i + 2]! > 18) === (op.color === 'skin'));
          if (mask.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0))) throw new Error('SW: corrected ownership mask differs from its manual region.');
          if (selected) { if (target.data.subarray(i, i + 4).some((v, c) => v !== study.data[i + c])) changedPixelCount++; target.data.set(study.data.subarray(i, i + 4), i); pixelCount++; }
        }
        if (pixelCount !== op.pixelCount) throw new Error('SW: corrected source selection coverage changed.');
        masks.push({ name: `v3-${op.name}`, image: mask }); swOperations.push({ name: op.name, plane: op.plane, pixelCount, changedPixelCount });
      }
      for (const [plane, specification] of [['hair-front', correction.front], ['hair-rear', correction.rear]] as const) {
        const image = normalize(await load(sourceDirectory, specification.source, specification.sourceSha256));
        if (sha256(image.data) !== sha256(correctedPlanes[plane].data)) throw new Error('SW: corrected hair must preserve native ownership and all unselected pixels.');
      }
    }
  }
  if (sha256(expected.data) !== sha256(master.data)) throw new Error(`${direction}: native skin/ear ownership changed outside its selected study pixels.`);
  let neckOwnershipMeasurement: { pixelCount: number; frontSha256: string; rearUnchanged: true } | undefined;
  if (draft.neckOwnership) {
    const ownership = draft.neckOwnership;
    const baselineBytes = await read(sourceDirectory, ownership.baseline.source, ownership.baseline.sourceSha256);
    const prior = headFrontDiagonalsRepairSchema.parse(JSON.parse(baselineBytes.toString('utf8')));
    const approval = neckApprovalSchema.parse(JSON.parse((await read(sourceDirectory, ownership.approval.source, ownership.approval.sourceSha256)).toString('utf8')));
    if (prior.assetVersion !== 3 || approval.configSha256 !== sha256(baselineBytes) || JSON.stringify([prior.frames, prior.localFitRepair, prior.swCorrection, prior.hairConfig, prior.hairApproval]) !== JSON.stringify([draft.frames, draft.localFitRepair, draft.swCorrection, draft.hairConfig, draft.hairApproval])) throw new Error('SW: neck ownership must retain the approved revision-3 anatomy and hair baseline.');
    if (direction === 'SW') {
      // The comparison must show the actual v3 fit, not its earlier v2 baseline.
      for (const part of ['head', 'neck'] as const) layers.set(part, normalize(await load(sourceDirectory, prior.frames.SW[part].source, prior.frames.SW[part].sourceSha256)));
      layers.set('hair-front', { ...front, data: new Uint8Array(front.data) });
      layers.set('hair-rear', rear!);
      const settings = JSON.parse((await read(sourceDirectory, ownership.settings.source, ownership.settings.sourceSha256)).toString('utf8')) as { method: string; region: unknown };
      if (settings.method !== ownership.method || JSON.stringify(settings.region) !== JSON.stringify(ownership.region)) throw new Error('SW: neck ownership differs from its pinned manual settings.');
      const mask = await load(sourceDirectory, ownership.selection.source, ownership.selection.sourceSha256);
      let pixelCount = 0;
      for (let i = 0; i < front.data.length; i += 4) {
        const selected = front.data[i + 3]! >= 8 && inside(i / 4 % 1024 + 0.5, Math.floor(i / 4 / 1024) + 0.5, ownership.region);
        if (mask.data.subarray(i, i + 4).some((v) => v !== (selected ? 255 : 0))) throw new Error('SW: neck ownership mask differs from its native fragment.');
        if (selected) {
          if (rear!.data.subarray(i, i + 4).some((v, c) => v !== front.data[i + c]) || (!layers.get('head')!.data[i + 3] && !layers.get('neck')!.data[i + 3])) throw new Error('SW: a removed foreground fragment must already exist behind head/neck skin.');
          front.data.fill(0, i, i + 4); pixelCount++;
        }
      }
      if (pixelCount !== ownership.pixelCount) throw new Error('SW: neck ownership coverage changed.');
      const authored = normalize(await load(sourceDirectory, ownership.front.source, ownership.front.sourceSha256));
      if (sha256(authored.data) !== sha256(front.data)) throw new Error('SW: neck ownership must preserve every unselected foreground pixel.');
      masks.push({ name: 'v4-neck-ownership', image: mask });
      neckOwnershipMeasurement = { pixelCount, frontSha256: sha256(encodePng(front)), rearUnchanged: true };
    }
  }
  for (const plane of DIRECTION_PLANE_ORDER[direction]) { const image = layers.get(plane); if (image) drawRgba(baselineFit, image, 0, 0); }
  return { front, rear, cleanupMask, masks, baselineFit, measurement: { direction, patches: repair.patches.map(({ name, pixelCount, study }) => ({ name, pixelCount, sourceSha256: study.sourceSha256 })), removedPixelCount, frontSha256: sha256(encodePng(front)), ...(swOperations ? { swOperations, rearSha256: sha256(encodePng(rear!)) } : {}), ...(neckOwnershipMeasurement ? { neckOwnership: neckOwnershipMeasurement } : {}) } };
}
