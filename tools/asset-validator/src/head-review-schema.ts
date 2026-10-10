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
  schemaVersion: z.literal(1), id: z.literal('head.soft-oval.v1'), assetVersion: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]),
  target: z.literal('detailed'), status: z.literal('draft-needs-human-review'),
  sourcePose: z.literal('standing-reference'), intendedRuntimePose: z.literal('tpose'),
  rigCompatibility: z.literal('unverified'), paletteReady: z.literal(false), anatomyApproved: z.literal(false),
  authoringMethod: z.literal('imagegen-guide/manual-native-partition'),
  featurePolicy: z.literal('skin-base-no-eyes-brows-mouth'), earPolicy: z.literal('human-ears-in-head-base-needs-separation'),
  minimumVisibleAlpha: z.literal(8), nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }),
  hairConfig: z.strictObject({ source: z.literal('authoring-v1.json'), sourceSha256: hash }),
  hairApproval: z.strictObject({ source: z.literal('review-v1.json'), sourceSha256: hash }),
  knownReviewIssues: z.array(z.string().min(1)).min(1),
  fringeFit: z.strictObject({
    direction: z.literal('S'), method: z.literal('reference-front/authored-rear-native-fit'),
    front: input, selection: input, pixelCount: z.number().int().positive(),
    provenance: z.strictObject({ source: z.literal('inputs/front-fit-v2-provenance.json'), sourceSha256: hash }),
    rear: input, rearMaster: input, rearSelection: input, rearPixelCount: z.number().int().positive(),
    rearProvenance: z.strictObject({ source: z.literal('inputs/rear-fit-v2-provenance.json'), sourceSha256: hash }),
    referenceEnvelopeUntilY: z.literal(290),
    rearExclusions: z.array(z.strictObject({ x: z.number().int().nonnegative(), y: z.number().int().nonnegative(), width: z.number().int().positive().max(32), height: z.number().int().positive().max(32) }).refine((r) => r.x + r.width <= 1024 && r.y + r.height < 290)).max(4),
    facialLandmarks: z.array(z.strictObject({ name: z.enum(['screen-left-eye-center', 'screen-right-eye-center', 'nose-tip', 'chin']), position: point })).length(4),
    approved: z.literal(false),
  }).optional(),
  seamRepair: z.strictObject({
    direction: z.literal('S'), method: z.literal('shared-study/native-local-seam-ownership'),
    baseline: z.strictObject({ source: z.literal('authoring-v2.json'), sourceSha256: hash }),
    approval: z.strictObject({ source: z.literal('review-fit-v2.json'), sourceSha256: hash }),
    settings: z.strictObject({ source: z.literal('inputs/seam-repair-v3.json'), sourceSha256: hash }),
    study: input, selection: input, earSelection: input, neckSelection: input, front: input, rear: input,
    pixelCount: z.number().int().positive(), earPixelCount: z.number().int().positive(), neckPixelCount: z.number().int().positive(), approved: z.literal(false),
  }).optional(),
  coherentFit: z.strictObject({
    direction: z.literal('S'), method: z.literal('single-study/native-hair-partition'),
    baseline: z.strictObject({ source: z.literal('authoring-v2.json'), sourceSha256: hash }),
    approval: z.strictObject({ source: z.literal('review-fit-v2.json'), sourceSha256: hash }),
    study: input, settings: z.strictObject({ source: z.enum(['inputs/coherent-fit-v4.json', 'inputs/coherent-fit-v5.json']), sourceSha256: hash }),
    ownershipBaseline: z.strictObject({ source: z.literal('authoring-v4.json'), sourceSha256: hash }).optional(),
    master: input, front: input, rear: input, frontSelection: input, rearSelection: input,
    frontPixelCount: z.number().int().positive(), rearPixelCount: z.number().int().positive(),
    facialLandmarks: z.array(z.strictObject({ name: z.string().min(1), position: point })).length(4),
    approved: z.literal(false),
  }).optional(),
  frames: z.strictObject({ S: frame, N: frame }),
}).refine((d) => d.frames.S.master.sourceSha256 !== d.frames.N.master.sourceSha256, 'S/N need distinct independently authored anatomy masters.')
  .refine((d) => (d.assetVersion === 2 || d.assetVersion === 3) === !!d.fringeFit, 'Only revisions 2 and 3 require the explicit S fringe-fit candidate.')
  .refine((d) => (d.assetVersion === 3) === !!d.seamRepair, 'Only revision 3 requires the explicit local seam repair.')
  .refine((d) => (d.assetVersion >= 4) === !!d.coherentFit, 'Revisions 4 and 5 require the coherent S hair partition.')
  .refine((d) => !d.coherentFit || d.coherentFit.settings.source === `inputs/coherent-fit-v${d.assetVersion}.json`, 'Coherent fit settings must match the artwork revision.')
  .refine((d) => (d.assetVersion === 5) === !!d.coherentFit?.ownershipBaseline, 'Revision 5 must pin the unchanged revision-4 hair drawing.')
  .refine((d) => !d.fringeFit || new Set(d.fringeFit.facialLandmarks.map((p) => p.name)).size === 4, 'Fringe-fit review needs four distinct facial landmarks.');
export type HeadReviewDraft = z.infer<typeof headReviewSchema>;
