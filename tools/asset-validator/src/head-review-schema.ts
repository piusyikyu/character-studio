import { z } from 'zod';
import { assetSourceSchema } from '@character-studio/core';

const hash = z.string().regex(/^[a-f0-9]{64}$/);
const input = z.strictObject({ source: assetSourceSchema, sourceSha256: hash });
const point = z.strictObject({ x: z.number().int().min(0).max(1023), y: z.number().int().min(0).max(1535) });
const part = input.extend({ origin: point, selection: input, pixelCount: z.number().int().positive() });
const frame = z.strictObject({
  reference: assetSourceSchema, referenceSha256: hash,
  candidateHeadAnchor: point, candidateNeckAnchor: point,
  master: input, guide: input,
  cutY: z.number().int().min(240).max(300),
  allowedBounds: z.strictObject({ x: z.number().int().min(180), y: z.number().int().nonnegative(), width: z.number().int().positive(), height: z.number().int().positive() })
    .refine((b) => b.x + b.width <= 1024 && b.y + b.height <= 400, 'Head/neck artwork must fit its upper-canvas authoring envelope.'),
  head: part, neck: part,
}).superRefine((f, ctx) => {
  for (const [part, anchor] of [[f.head, f.candidateHeadAnchor], [f.neck, f.candidateNeckAnchor]] as const) if (part.origin.x !== anchor.x || part.origin.y !== anchor.y) ctx.addIssue({ code: 'custom', message: 'Native full-canvas origins must match their provisional attachments; no translation.' });
});

/** Offline anatomy evidence; deliberately not a runtime manifest or approved rig. */
export const headReviewSchema = z.strictObject({
  schemaVersion: z.literal(1), id: z.literal('head.soft-oval.v1'), assetVersion: z.literal(1),
  target: z.literal('detailed'), status: z.literal('draft-needs-human-review'),
  sourcePose: z.literal('standing-reference'), intendedRuntimePose: z.literal('tpose'),
  rigCompatibility: z.literal('unverified'), paletteReady: z.literal(false), anatomyApproved: z.literal(false),
  authoringMethod: z.literal('imagegen-guide/manual-native-partition'),
  featurePolicy: z.literal('skin-base-no-eyes-brows-mouth'), earPolicy: z.literal('human-ears-in-head-base-needs-separation'),
  minimumVisibleAlpha: z.literal(8), nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }),
  hairConfig: z.strictObject({ source: z.literal('authoring-v1.json'), sourceSha256: hash }),
  hairApproval: z.strictObject({ source: z.literal('review-v1.json'), sourceSha256: hash }),
  knownReviewIssues: z.array(z.string().min(1)).min(1),
  frames: z.strictObject({ S: frame, N: frame }),
}).refine((d) => d.frames.S.master.sourceSha256 !== d.frames.N.master.sourceSha256, 'S/N need distinct independently authored anatomy masters.');
export type HeadReviewDraft = z.infer<typeof headReviewSchema>;
