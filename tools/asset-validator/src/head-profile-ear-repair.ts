import type { RgbaImage } from '@character-studio/render-utils';
import { headProfilesReviewSchema } from './head-review-schema';
import type { HeadProfilesReviewDraft } from './head-review-schema';

function inside(x: number, y: number, polygon: number[][]) {
  let selected = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]!, [xj, yj] = polygon[j]!;
    if ((yi! > y) !== (yj! > y) && x < (xj! - xi!) * (y - yi!) / (yj! - yi!) + xi!) selected = !selected;
  }
  return selected;
}

/** Changes are confined to independently authored ear regions; visible ears retain reference RGBA. */
export async function inspectProfileEarRepair(
  draft: HeadProfilesReviewDraft, direction: 'E' | 'W', sourceDirectory: string,
  read: (directory: string, source: string, hash?: string) => Promise<Buffer>,
  load: (directory: string, source: string, hash: string) => Promise<RgbaImage>,
  master: RgbaImage, reference: RgbaImage,
) {
  const repair = draft.earRepair!, specification = repair.frames[direction];
  const baseline = headProfilesReviewSchema.parse(JSON.parse((await read(sourceDirectory, repair.baseline.source, repair.baseline.sourceSha256)).toString('utf8')));
  const frame = draft.frames[direction], priorFrame = baseline.frames[direction];
  const unchangedFrame = (value: typeof frame) => Object.fromEntries(Object.entries(value).filter(([key]) => key !== 'master' && key !== 'head'));
  if (baseline.assetVersion !== 2 || JSON.stringify(unchangedFrame(frame)) !== JSON.stringify(unchangedFrame(priorFrame)) || JSON.stringify(frame.head.origin) !== JSON.stringify(priorFrame.head.origin) || JSON.stringify(draft.hairConfig) !== JSON.stringify(baseline.hairConfig) || JSON.stringify(draft.hairApproval) !== JSON.stringify(baseline.hairApproval)) throw new Error('Profile ear repair must preserve neck, anchors, guides and approved hair.');
  const regionLimit = direction === 'E' ? [505, 140, 570, 232] : [455, 150, 520, 235];
  for (const region of [specification.repairRegion, specification.earEnvelope, specification.referenceEarRegion]) for (const [x, y] of region) if (x < regionLimit[0]! || x > regionLimit[2]! || y < regionLimit[1]! || y > regionLimit[3]!) throw new Error('Profile ear repair exceeds its local anatomical region.');
  const prior = await load(sourceDirectory, priorFrame.master.source, priorFrame.master.sourceSha256);
  const skin = await load(sourceDirectory, specification.skinStudy.source, specification.skinStudy.sourceSha256);
  const ear = await load(sourceDirectory, specification.earStudy.source, specification.earStudy.sourceSha256);
  const mask = await load(sourceDirectory, specification.selection.source, specification.selection.sourceSha256);
  const referenceMask = await load(sourceDirectory, specification.referenceSelection.source, specification.referenceSelection.sourceSha256);
  const highlights = new Set(specification.referenceHighlights.map(({ x, y }) => y * 1024 + x));
  let changedPixelCount = 0, referencePixelCount = 0, selectedPixelCount = 0;
  for (let p = 0; p < 1024 * 1536; p++) {
    const i = p * 4, x = p % 1024, y = Math.floor(p / 1024);
    const selected = inside(x + 0.5, y + 0.5, specification.repairRegion) && prior.data[i + 3]! >= 8;
    const fromReference = inside(x + 0.5, y + 0.5, specification.referenceEarRegion) && reference.data[i + 3]! >= 8 && (reference.data[i]! - reference.data[i + 2]! > specification.referenceSkinMinimumRedMinusBlue || highlights.has(p));
    if (fromReference && !selected) throw new Error('Reference ear selection must be inside the local skin repair.');
    const expected = fromReference ? reference : selected ? (inside(x + 0.5, y + 0.5, specification.earEnvelope) ? ear : skin) : prior;
    const visible = expected.data[i + 3]! >= 8;
    let changed = false;
    for (let c = 0; c < 4; c++) {
      if (mask.data[i + c] !== (selected ? 255 : 0) || referenceMask.data[i + c] !== (fromReference ? 255 : 0) || master.data[i + c] !== (visible ? expected.data[i + c] : 0)) throw new Error('Profile ear repair must preserve native source ownership and all anatomy outside its local mask.');
      if (master.data[i + c] !== (prior.data[i + 3]! >= 8 ? prior.data[i + c] : 0)) changed = true;
    }
    if (changed) changedPixelCount++;
    if (fromReference) referencePixelCount++;
    if (selected) selectedPixelCount++;
  }
  if (changedPixelCount !== specification.changedPixelCount || referencePixelCount !== specification.referencePixelCount) throw new Error('Profile ear repair coverage changed.');
  return { mask, referenceMask, baseline, measurement: { direction, changedPixelCount, selectedPixelCount, referencePixelCount, referenceEarRegion: specification.referenceEarRegion, concealedEarEnvelope: specification.earEnvelope, sourceOwnership: 'native-reference-visible-ear/local-authored-concealed-skin' as const } };
}
