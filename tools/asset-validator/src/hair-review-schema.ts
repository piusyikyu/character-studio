import { z } from 'zod';
import { assetSourceSchema } from '@character-studio/core';

const point = z.strictObject({ x: z.number().int().min(0).max(1023), y: z.number().int().min(0).max(1535) });
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const mask = z.strictObject({ source: assetSourceSchema, sourceSha256: hash });
const layer = z.strictObject({
  source: assetSourceSchema, sourceSha256: hash,
  authoringMasterSha256: hash.optional(),
  // Full-canvas authoring keeps positioning explicit without transforming pixels.
  origin: point,
  allowedBounds: z.strictObject({ x: z.number().int().nonnegative(), y: z.number().int().nonnegative(), width: z.number().int().positive(), height: z.number().int().positive() })
    .refine((b) => b.x + b.width <= 1024 && b.y + b.height <= 1536, 'Hair bounds must fit the native canvas.'),
});
const frame = z.strictObject({
  reference: assetSourceSchema, referenceSha256: hash,
  candidateHeadAnchor: point,
  rear: layer,
  designMaster: layer.optional(),
  fitHead: z.strictObject({ purpose: z.literal('review-only-head-neck'), anatomyApproved: z.literal(false), artwork: layer }).optional(),
  partitionMasks: z.strictObject({ rear: mask, front: mask, head: mask }).optional(),
  restoredReferenceHair: mask.extend({ pixelCount: z.number().int().min(100) }).optional(),
  rearCompletion: z.strictObject({
    base: mask, artwork: mask, selection: mask,
    pixelCount: z.number().int().min(100),
    addedPixels: z.number().int().min(100), changedPixels: z.number().int().nonnegative(),
  }).refine((completion) => completion.pixelCount === completion.addedPixels + completion.changedPixels, 'Rear completion counts must match the selected coverage.').optional(),
  fitFixture: z.strictObject({
    purpose: z.literal('review-only-head-neck'),
    anatomyApproved: z.literal(false),
    // Native polygons are a synthetic fit aid, never production anatomy.
    scalp: z.array(point).min(3),
    neck: z.array(point).min(3),
  }).optional(),
  front: z.discriminatedUnion('visibility', [
    z.strictObject({ visibility: z.literal('visible'), artwork: layer }),
    z.strictObject({ visibility: z.literal('hidden'), reason: z.string().min(1) }),
  ]),
});

/** Authoring evidence, deliberately distinct from a runtime manifest/approved rig. */
export const hairReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('hair.long-waves.v1'), assetVersion: z.literal(1),
  status: z.literal('draft-needs-human-review'), target: z.literal('detailed'),
  sourcePose: z.literal('standing-reference'), intendedRuntimePose: z.literal('tpose'),
  rigCompatibility: z.literal('unverified'), paletteReady: z.literal(false),
  authoringMethod: z.enum(['imagegen-reference-edit', 'imagegen-study/manual-mask-partition', 'imagegen-study/manual-mask-completion']),
  nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }),
  referenceProcessingRevision: z.literal(2),
  minimumVisibleAlpha: z.literal(8),
  reviewRevision: z.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).optional(),
  knownReviewIssues: z.array(z.string().min(1)).min(1),
  frames: z.union([
    z.strictObject({ S: frame, N: frame }),
    z.strictObject({ E: frame, W: frame }),
    z.strictObject({ SE: frame, SW: frame }),
  ]),
}).superRefine((draft, ctx) => {
  const fixtures = Object.values(draft.frames).filter((frame) => frame.fitFixture);
  if (draft.reviewRevision === 2 && (!('SE' in draft.frames) || fixtures.length !== 2)) ctx.addIssue({ code: 'custom', path: ['frames'], message: 'Revision 2 requires separate SE/SW head-neck review fixtures.' });
  if (fixtures.length && draft.reviewRevision !== 2) ctx.addIssue({ code: 'custom', path: ['reviewRevision'], message: 'Head-neck fit inspection requires an explicit review revision.' });
  for (const [direction, frame] of Object.entries(draft.frames)) {
    if (((draft.reviewRevision ?? 0) >= 4) !== Boolean(frame.restoredReferenceHair)) ctx.addIssue({ code: 'custom', path: ['frames', direction, 'restoredReferenceHair'], message: 'Revision 4 and later require each facing to preserve its restored reference hair coverage.' });
    if ((draft.reviewRevision === 5) !== Boolean(frame.rearCompletion)) ctx.addIssue({ code: 'custom', path: ['frames', direction, 'rearCompletion'], message: 'Revision 5 requires a pinned baseline rear, completion artwork and selection mask for each facing.' });
    if ((draft.reviewRevision ?? 0) >= 3) {
      if (!('SE' in draft.frames) || !frame.designMaster || !frame.fitHead || !frame.partitionMasks || frame.fitFixture) ctx.addIssue({ code: 'custom', path: ['frames', direction], message: 'Master-partition review requires each diagonal to have its own whole-facing master and authored review head with partition masks, without synthetic fit guides.' });
      for (const part of [frame.rear, ...(frame.front.visibility === 'visible' ? [frame.front.artwork] : []), ...(frame.fitHead ? [frame.fitHead.artwork] : [])]) if (!frame.designMaster || part.authoringMasterSha256 !== frame.designMaster.sourceSha256) ctx.addIssue({ code: 'custom', path: ['frames', direction], message: 'Hair and review-head layers must name the same facing-specific authoring master.' });
    } else if (frame.designMaster || frame.fitHead || frame.partitionMasks) ctx.addIssue({ code: 'custom', path: ['frames', direction], message: 'Whole-facing master review requires revision 3 or later.' });
  }
  const expectedMethod = draft.reviewRevision === 5 ? 'imagegen-study/manual-mask-completion' : (draft.reviewRevision ?? 0) >= 3 ? 'imagegen-study/manual-mask-partition' : 'imagegen-reference-edit';
  if (draft.authoringMethod !== expectedMethod) ctx.addIssue({ code: 'custom', path: ['authoringMethod'], message: 'The authoring method must match the partition/completion review revision.' });
  if ('SE' in draft.frames && (draft.reviewRevision ?? 0) >= 3 && draft.frames.SE.designMaster?.sourceSha256 === draft.frames.SW.designMaster?.sourceSha256) ctx.addIssue({ code: 'custom', path: ['frames'], message: 'SE/SW must have independently authored whole-facing masters.' });
  if ('S' in draft.frames) {
    if (draft.frames.S.front.visibility !== 'visible') ctx.addIssue({ code: 'custom', path: ['frames', 'S', 'front'], message: 'S needs an independently authored visible fringe.' });
    if (draft.frames.N.front.visibility !== 'hidden') ctx.addIssue({ code: 'custom', path: ['frames', 'N', 'front'], message: 'The front fringe is explicitly hidden in N; do not invent rear-facing bangs.' });
  } else if ('E' in draft.frames) {
    for (const direction of ['E', 'W'] as const) if (draft.frames[direction].front.visibility !== 'visible') ctx.addIssue({ code: 'custom', path: ['frames', direction, 'front'], message: 'Each profile needs its own visible front hair; do not mirror or skip it.' });
    if (draft.frames.E.rear.sourceSha256 === draft.frames.W.rear.sourceSha256 || (draft.frames.E.front.visibility === 'visible' && draft.frames.W.front.visibility === 'visible' && draft.frames.E.front.artwork.sourceSha256 === draft.frames.W.front.artwork.sourceSha256)) ctx.addIssue({ code: 'custom', path: ['frames'], message: 'E/W must reference distinct independently authored layers.' });
  } else {
    for (const direction of ['SE', 'SW'] as const) if (draft.frames[direction].front.visibility !== 'visible') ctx.addIssue({ code: 'custom', path: ['frames', direction, 'front'], message: 'Each front diagonal needs its own visible front hair; do not mirror or skip it.' });
    if (draft.frames.SE.rear.sourceSha256 === draft.frames.SW.rear.sourceSha256 || (draft.frames.SE.front.visibility === 'visible' && draft.frames.SW.front.visibility === 'visible' && draft.frames.SE.front.artwork.sourceSha256 === draft.frames.SW.front.artwork.sourceSha256)) ctx.addIssue({ code: 'custom', path: ['frames'], message: 'SE/SW must reference distinct independently authored layers.' });
  }
  for (const [direction, frame] of Object.entries(draft.frames)) {
    for (const part of [frame.rear, ...(frame.front.visibility === 'visible' ? [frame.front.artwork] : []), ...(frame.designMaster ? [frame.designMaster] : []), ...(frame.fitHead ? [frame.fitHead.artwork] : [])]) {
      if (part.origin.x !== frame.candidateHeadAnchor.x || part.origin.y !== frame.candidateHeadAnchor.y) ctx.addIssue({ code: 'custom', path: ['frames', direction], message: 'Full-canvas origins must match the provisional head anchor; native top-left stays at (0,0).' });
    }
  }
});
export type HairReviewDraft = z.infer<typeof hairReviewSchema>;
