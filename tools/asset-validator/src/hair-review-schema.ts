import { z } from 'zod';
import { assetSourceSchema } from '@character-studio/core';

const point = z.strictObject({ x: z.number().int().min(0).max(1023), y: z.number().int().min(0).max(1535) });
const hash = z.string().regex(/^[a-f0-9]{64}$/);
const layer = z.strictObject({
  source: assetSourceSchema, sourceSha256: hash,
  // Full-canvas authoring keeps positioning explicit without transforming pixels.
  origin: point,
  allowedBounds: z.strictObject({ x: z.number().int().nonnegative(), y: z.number().int().nonnegative(), width: z.number().int().positive(), height: z.number().int().positive() })
    .refine((b) => b.x + b.width <= 1024 && b.y + b.height <= 1536, 'Hair bounds must fit the native canvas.'),
});
const frame = z.strictObject({
  reference: assetSourceSchema, referenceSha256: hash,
  candidateHeadAnchor: point,
  rear: layer,
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
  authoringMethod: z.literal('imagegen-reference-edit'),
  nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }),
  referenceProcessingRevision: z.literal(2),
  minimumVisibleAlpha: z.literal(8),
  knownReviewIssues: z.array(z.string().min(1)).min(1),
  frames: z.strictObject({ S: frame, N: frame }),
}).superRefine((draft, ctx) => {
  if (draft.frames.S.front.visibility !== 'visible') ctx.addIssue({ code: 'custom', path: ['frames', 'S', 'front'], message: 'S needs an independently authored visible fringe.' });
  if (draft.frames.N.front.visibility !== 'hidden') ctx.addIssue({ code: 'custom', path: ['frames', 'N', 'front'], message: 'The front fringe is explicitly hidden in N; do not invent rear-facing bangs.' });
  for (const [direction, frame] of Object.entries(draft.frames)) {
    for (const part of [frame.rear, ...(frame.front.visibility === 'visible' ? [frame.front.artwork] : [])]) {
      if (part.origin.x !== frame.candidateHeadAnchor.x || part.origin.y !== frame.candidateHeadAnchor.y) ctx.addIssue({ code: 'custom', path: ['frames', direction], message: 'Full-canvas origins must match the provisional head anchor; native top-left stays at (0,0).' });
    }
  }
});
export type HairReviewDraft = z.infer<typeof hairReviewSchema>;
