import { z } from 'zod';
import { headShapeSchema } from './domains';

export const ANATOMY_FAMILIES = ['female-humanoid-v1'] as const;
export const BODY_PRESETS = ['balanced', 'slender'] as const;
export const CHEST_SIZES = ['medium', 'small'] as const;
export const BODY_PROPORTIONS = ['balanced', 'slender'] as const;
export const HEIGHTS = ['average', 'tall'] as const;

export const anatomyFamilySchema = z.enum(ANATOMY_FAMILIES);
export const bodyPresetSchema = z.enum(BODY_PRESETS);
export const chestSizeSchema = z.enum(CHEST_SIZES);
export const bodyProportionsSchema = z.enum(BODY_PROPORTIONS);
export const heightSchema = z.enum(HEIGHTS);
export type BodyPresetId = z.infer<typeof bodyPresetSchema>;

export const ANATOMY_PRESETS = Object.freeze({
  balanced: Object.freeze({
    family: 'female-humanoid-v1', bodyPreset: 'balanced',
    chestSize: 'medium', bodyProportions: 'balanced', height: 'average',
  } as const),
  slender: Object.freeze({
    family: 'female-humanoid-v1', bodyPreset: 'slender',
    chestSize: 'small', bodyProportions: 'slender', height: 'tall',
  } as const),
});

export const anatomySchema = z.strictObject({
  family: anatomyFamilySchema,
  bodyPreset: bodyPresetSchema,
  chestSize: chestSizeSchema,
  bodyProportions: bodyProportionsSchema,
  height: heightSchema,
  headShape: headShapeSchema,
}).readonly();

export type Anatomy = z.infer<typeof anatomySchema>;
