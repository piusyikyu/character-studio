import { z } from 'zod';
import type { RgbaImage } from '@character-studio/render-utils';
import { encodePng } from '@character-studio/render-utils';
import { headProfilesReviewSchema, headReviewSchema } from './head-review-schema';
import type { HeadProfilesReviewDraft, HeadReviewDraft, NativeHairPartition } from './head-review-schema';
import { sha256 } from './reference-import';

const coordinate = z.tuple([z.number().int().min(0).max(1023), z.number().int().min(0).max(1535)]);
const polygon = z.array(coordinate).min(3);
const settingsSchema = z.strictObject({
  method: z.literal('single-study/native-hair-partition'),
  studySha256: z.string().regex(/^[a-f0-9]{64}$/), minimumVisibleAlpha: z.literal(8),
  skinRegion: polygon, skinMinimumRedMinusBlue: z.literal(18),
  excludedPixels: z.array(coordinate), posteriorEarRegion: polygon, rearFromY: z.literal(350),
  hairRegions: z.array(polygon).min(1).optional(),
  excludedRegions: z.array(polygon).optional(),
  note: z.string().min(1),
});
function inside(x: number, y: number, polygon: number[][]) {
  let selected = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!, [xj, yj] = polygon[j]!;
    if ((yi! > y) !== (yj! > y) && x < (xj! - xi!) * (y - yi!) / (yj! - yi!) + xi!) selected = !selected;
  }
  return selected;
}

/** A single continuous drawing owns all S hair; anatomy and approved N are immutable. */
export async function inspectCoherentHeadFit(
  draft: HeadReviewDraft, sourceDirectory: string,
  read: (directory: string, source: string, hash?: string) => Promise<Buffer>,
  load: (directory: string, source: string, hash: string) => Promise<RgbaImage>,
  head: RgbaImage,
) {
  const fit = draft.coherentFit!;
  const baselineBytes = await read(sourceDirectory, fit.baseline.source, fit.baseline.sourceSha256);
  const baseline = headReviewSchema.parse(JSON.parse(baselineBytes.toString('utf8')));
  const approval = JSON.parse((await read(sourceDirectory, fit.approval.source, fit.approval.sourceSha256)).toString('utf8')) as { configSha256: string; status: string };
  if (baseline.assetVersion !== 2 || approval.configSha256 !== sha256(baselineBytes) || approval.status !== 'approved-standing-reference-fit-candidate' || JSON.stringify(draft.frames) !== JSON.stringify(baseline.frames)) throw new Error('Coherent S fit must preserve approved baseline anatomy and N.');
  const settings = settingsSchema.parse(JSON.parse((await read(sourceDirectory, fit.settings.source, fit.settings.sourceSha256)).toString('utf8')));
  if (settings.studySha256 !== fit.study.sourceSha256) throw new Error('Coherent fit settings do not match the single study.');
  if (fit.ownershipBaseline) {
    const previous = headReviewSchema.parse(JSON.parse((await read(sourceDirectory, fit.ownershipBaseline.source, fit.ownershipBaseline.sourceSha256)).toString('utf8')));
    if (previous.assetVersion !== 4) throw new Error('Ear depth correction requires the revision-4 ownership baseline.');
    const prior = previous.coherentFit!;
    const priorSettings = settingsSchema.parse(JSON.parse((await read(sourceDirectory, prior.settings.source, prior.settings.sourceSha256)).toString('utf8')));
    const matteSettings = (value: z.infer<typeof settingsSchema>) => Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'posteriorEarRegion' && key !== 'note'));
    if (JSON.stringify(prior.master) !== JSON.stringify(fit.master) || JSON.stringify(prior.study) !== JSON.stringify(fit.study) || JSON.stringify(matteSettings(priorSettings)) !== JSON.stringify(matteSettings(settings))) throw new Error('Ear depth correction must preserve the complete revision-4 hair drawing and matte.');
  }
  return inspectNativeHairPartition(fit, settings, sourceDirectory, load, head, fit.facialLandmarks);
}

/** A separate same-facing study fits each profile; localized anatomy repair is explicit. */
export async function inspectProfileHeadFit(
  draft: HeadProfilesReviewDraft, direction: 'E' | 'W', sourceDirectory: string,
  read: (directory: string, source: string, hash?: string) => Promise<Buffer>,
  load: (directory: string, source: string, hash: string) => Promise<RgbaImage>,
  head: RgbaImage,
) {
  const baseline = headProfilesReviewSchema.parse(JSON.parse((await read(sourceDirectory, draft.profileFit!.baseline.source, draft.profileFit!.baseline.sourceSha256)).toString('utf8')));
  if (baseline.assetVersion !== 1 || (!draft.earRepair && JSON.stringify(draft.frames) !== JSON.stringify(baseline.frames)) || JSON.stringify(draft.hairConfig) !== JSON.stringify(baseline.hairConfig) || JSON.stringify(draft.hairApproval) !== JSON.stringify(baseline.hairApproval)) throw new Error('Profile hair fit must preserve its native anatomy and approved hair baseline.');
  const fit = draft.profileFit!.frames[direction];
  if (fit.study.sourceSha256 !== draft.frames[direction].referenceSha256) throw new Error('Visible profile hair must use its own native reference, never another facing.');
  const settings = settingsSchema.parse(JSON.parse((await read(sourceDirectory, fit.settings.source, fit.settings.sourceSha256)).toString('utf8')));
  if (settings.studySha256 !== fit.study.sourceSha256) throw new Error('Profile fit settings do not match its same-facing study.');
  if (!settings.hairRegions) throw new Error('Profile fit requires manually traced hair regions.');
  if (draft.earRepair) {
    const previous = headProfilesReviewSchema.parse(JSON.parse((await read(sourceDirectory, draft.earRepair.baseline.source, draft.earRepair.baseline.sourceSha256)).toString('utf8')));
    const priorFit = previous.profileFit!.frames[direction];
    const priorSettings = settingsSchema.parse(JSON.parse((await read(sourceDirectory, priorFit.settings.source, priorFit.settings.sourceSha256)).toString('utf8')));
    const matte = (value: z.infer<typeof settingsSchema>) => Object.fromEntries(Object.entries(value).filter(([key]) => !['posteriorEarRegion', 'excludedPixels', 'note'].includes(key)));
    const repair = draft.earRepair.frames[direction];
    const additionalExclusions = repair.referenceHighlights.map(({ x, y }) => [x, y]);
    if (JSON.stringify(fit.study) !== JSON.stringify(priorFit.study) || JSON.stringify(matte(settings)) !== JSON.stringify(matte(priorSettings)) || JSON.stringify(settings.excludedPixels) !== JSON.stringify([...priorSettings.excludedPixels, ...additionalExclusions]) || !settings.posteriorEarRegion.every(([x, y]) => inside(x, y, repair.referenceEarRegion))) throw new Error('Profile ear fit must preserve its visible hair study and matte outside reference ear highlights.');
  }
  return inspectNativeHairPartition(fit, settings, sourceDirectory, load, head, fit.facialLandmarks, !!draft.earRepair);
}

async function inspectNativeHairPartition(
  fit: NativeHairPartition, settings: z.infer<typeof settingsSchema>, sourceDirectory: string,
  load: (directory: string, source: string, hash: string) => Promise<RgbaImage>, head: RgbaImage,
  landmarks: { name: string; position: { x: number; y: number } }[],
  allowEmptyPosteriorEar = false,
) {
  const study = await load(sourceDirectory, fit.study.source, fit.study.sourceSha256);
  const master = await load(sourceDirectory, fit.master.source, fit.master.sourceSha256);
  const front = await load(sourceDirectory, fit.front.source, fit.front.sourceSha256), rear = await load(sourceDirectory, fit.rear.source, fit.rear.sourceSha256);
  const frontMask = await load(sourceDirectory, fit.frontSelection.source, fit.frontSelection.sourceSha256), rearMask = await load(sourceDirectory, fit.rearSelection.source, fit.rearSelection.sourceSha256);
  const exclusions = new Set(settings.excludedPixels.map(([x, y]) => y * 1024 + x));
  let frontPixelCount = 0, rearPixelCount = 0, posteriorEarHairOverHead = 0;
  for (let p = 0; p < 1024 * 1536; p++) {
    const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
    const skin = inside(x + 0.5, y + 0.5, settings.skinRegion) && study.data[i]! - study.data[i + 2]! > settings.skinMinimumRedMinusBlue;
    const selected = !settings.hairRegions || settings.hairRegions.some((region) => inside(x + 0.5, y + 0.5, region));
    const excludedRegion = settings.excludedRegions?.some((region) => inside(x + 0.5, y + 0.5, region));
    const owned = study.data[i + 3]! >= 8 && selected && !skin && !excludedRegion && !exclusions.has(p);
    const posteriorEar = inside(x + 0.5, y + 0.5, settings.posteriorEarRegion);
    const rearOwned = owned && (y >= settings.rearFromY || posteriorEar), frontOwned = owned && !rearOwned;
    for (let c = 0; c < 4; c++) if (master.data[i + c] !== (owned ? study.data[i + c] : 0) || front.data[i + c] !== (frontOwned ? study.data[i + c] : 0) || rear.data[i + c] !== (rearOwned ? study.data[i + c] : 0) || frontMask.data[i + c] !== (frontOwned ? 255 : 0) || rearMask.data[i + c] !== (rearOwned ? 255 : 0)) throw new Error('Coherent hair must preserve its single study with an exact disjoint native partition.');
    if (frontOwned) frontPixelCount++;
    if (rearOwned) { rearPixelCount++; if (posteriorEar && head.data[i + 3]! >= 8) posteriorEarHairOverHead++; }
  }
  if (frontPixelCount !== fit.frontPixelCount || rearPixelCount !== fit.rearPixelCount || (!allowEmptyPosteriorEar && !posteriorEarHairOverHead)) throw new Error('Coherent hair coverage or posterior ear depth changed.');
  const facialLandmarks = landmarks.map(({ name, position }) => {
    const i = (position.y * 1024 + position.x) * 4;
    if (front.data[i + 3] || rear.data[i + 3] || !head.data[i + 3]) throw new Error(`Coherent hair fit obstructs or misses ${name}.`);
    return { name, position, hairAlpha: 0 };
  });
  return { master, front, rear, frontMask, rearMask, measurement: { studySha256: fit.study.sourceSha256, masterSha256: sha256(encodePng(master)), frontPixelCount, rearPixelCount, posteriorEarHairOverHead, facialLandmarks, reconstruction: 'exact-disjoint-single-study-partition' as const } };
}
