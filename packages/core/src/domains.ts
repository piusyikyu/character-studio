import { z } from 'zod';

export const DIRECTIONS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
export const RENDER_TARGETS = ['detailed', 'pixel'] as const;
export const directionSchema = z.enum(DIRECTIONS);
export const renderTargetSchema = z.enum(RENDER_TARGETS);
export type Direction = z.infer<typeof directionSchema>;
export type RenderTarget = z.infer<typeof renderTargetSchema>;

export const RENDER_TARGET_SPECS = Object.freeze({
  detailed: Object.freeze({ width: 1024, height: 1536, pose: 'tpose' as const }),
  pixel: Object.freeze({ width: 128, height: 192, pose: 'idle' as const }),
});

export const HAIR_STYLES = ['short-bob', 'long-waves'] as const;
export const HEAD_SHAPES = ['soft-oval', 'angular'] as const;
export const FACIAL_EXPRESSIONS = ['neutral', 'stern'] as const;
export const SKIN_TONES = ['skin.light', 'skin.warm', 'skin.deep'] as const;
export const HAIR_COLOURS = ['hair.black', 'hair.chestnut', 'hair.gold', 'hair.silver'] as const;
export const EYE_COLOURS = ['eyes.brown', 'eyes.blue', 'eyes.green', 'eyes.gold', 'eyes.crimson'] as const;
export const OUTFIT_COLOURS = ['outfit.charcoal', 'outfit.ink'] as const;

export const hairStyleSchema = z.enum(HAIR_STYLES);
export const headShapeSchema = z.enum(HEAD_SHAPES);
export const facialExpressionSchema = z.enum(FACIAL_EXPRESSIONS);
export const skinToneSchema = z.enum(SKIN_TONES);
export const hairColourSchema = z.enum(HAIR_COLOURS);
export const eyeColourSchema = z.enum(EYE_COLOURS);
export const outfitColourSchema = z.enum(OUTFIT_COLOURS);
