import { z } from 'zod';
import { DIRECTIONS } from '@character-studio/core';

const point = z.strictObject({ x: z.number().int().min(0).max(1023), y: z.number().int().min(0).max(1535) });
export const rectangleSchema = z.strictObject({ x: z.number().int().nonnegative(), y: z.number().int().nonnegative(), width: z.number().int().positive(), height: z.number().int().positive() });
const labelRectangle = rectangleSchema.refine((r) => r.x + r.width <= 180 && r.y + r.height <= 110, 'Label exclusions must stay in the reviewed top-left 180 × 110 margin.');
const backgroundCorrection = z.strictObject({
  id: z.string().regex(/^[a-z0-9-]+-v[1-9][0-9]*$/),
  region: rectangleSchema.refine((r) => r.x + r.width <= 1024 && r.y + r.height <= 1536, 'Background correction must fit the native canvas.'),
  maxRedBlue: z.number().int().min(80).max(180),
  note: z.string().min(1),
});
const anchor = z.strictObject({
  id: z.enum(['head_center', 'neck_base', 'shoulder_screen_left', 'shoulder_screen_right', 'waist_center', 'hip_screen_left', 'hip_screen_right', 'foot_screen_left', 'foot_screen_right']),
  position: point.nullable(), confidence: z.enum(['low', 'medium']),
  evidence: z.enum(['visible-landmark', 'garment-silhouette', 'hair-silhouette', 'occluded']),
  note: z.string().min(1),
}).refine((a) => (a.position === null) === (a.evidence === 'occluded'), 'Occluded landmarks must have null positions; do not reconstruct hidden anatomy.');
const frame = z.strictObject({
  sourceSha256: z.string().regex(/^[a-f0-9]{64}$/),
  backgroundCorrections: z.array(backgroundCorrection).max(8).default([]),
  labelExclusions: z.array(labelRectangle).max(1), anchors: z.array(anchor).length(9),
  footSearchRegions: z.array(rectangleSchema.refine((r) => r.x + r.width <= 1024 && r.y + r.height <= 1536 && r.y >= 1300, 'Foot search regions must fit the bottom of the native canvas.')).min(1).max(2),
}).refine((f) => new Set(f.anchors.map((a) => a.id)).size === 9, 'Anchor candidate IDs must be unique.');
export const referenceImportSettingsSchema = z.strictObject({
  schemaVersion: z.literal(1), packId: z.literal('heroine-v1'), pipelineVersion: z.literal(1),
  processingRevision: z.number().int().positive().default(1),
  target: z.literal('detailed'), sourceKind: z.literal('flattened-reference'), pose: z.literal('standing-reference'),
  nativeSize: z.strictObject({ width: z.literal(1024), height: z.literal(1536) }),
  reviewStatus: z.literal('needs-human-review'),
  matte: z.strictObject({
    edgeRadius: z.number().int().min(2).max(8), greenExcess: z.number().int().min(0).max(20),
    backgroundMinGreen: z.number().int().min(120).max(240), backgroundMaxRedBlue: z.number().int().min(20).max(80),
    minimumCoverage: z.number().min(0).max(0.05), baselineTolerance: z.number().int().min(0).max(100),
  }),
  frames: z.record(z.enum(DIRECTIONS), frame),
});
export type ReferenceImportSettings = z.infer<typeof referenceImportSettingsSchema>;
export type AnchorCandidate = z.infer<typeof anchor>;
export type Rectangle = z.infer<typeof rectangleSchema>;
export type BackgroundCorrection = z.infer<typeof backgroundCorrection>;
