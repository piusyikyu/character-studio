import { z } from 'zod';
import { ANATOMY_PRESETS, anatomySchema, bodyPresetSchema } from './anatomy';
import type { Anatomy } from './anatomy';
import { ancestrySchema, resolveAncestryTraits, visibleTraitSchema, VISIBLE_TRAITS } from './ancestry';
import type { Ancestry, VisibleTrait } from './ancestry';
import { getRecipeCompatibilityIssues } from './compatibility';
import { eyeColourSchema, facialExpressionSchema, hairColourSchema, hairStyleSchema, outfitColourSchema, skinToneSchema } from './domains';

export const CHARACTER_RECIPE_VERSION = 1;

// Internal structural contract, separated from semantic compatibility validation.
const characterRecipeDataSchema = z.strictObject({
  schemaVersion: z.literal(CHARACTER_RECIPE_VERSION),
  anatomy: anatomySchema,
  ancestry: ancestrySchema,
  visibleTraits: z.array(visibleTraitSchema).max(VISIBLE_TRAITS.length).readonly(),
  hair: z.strictObject({ style: hairStyleSchema, colour: hairColourSchema }).readonly(),
  skinTone: skinToneSchema,
  expression: facialExpressionSchema,
  eyes: z.strictObject({ leftColour: eyeColourSchema, rightColour: eyeColourSchema }).readonly(),
  outfit: z.strictObject({ id: z.literal('starter-outfit'), fit: bodyPresetSchema, colour: outfitColourSchema }).readonly(),
});

export type CharacterRecipeData = z.infer<typeof characterRecipeDataSchema>;

export const characterRecipeSchema = characterRecipeDataSchema.superRefine((recipe, ctx) => {
  for (const issue of getRecipeCompatibilityIssues(recipe)) {
    ctx.addIssue({ code: 'custom', path: [...issue.path], message: issue.message, params: { compatibilityCode: issue.code } });
  }
}).transform((recipe) => ({
  ...recipe,
  visibleTraits: Object.freeze(VISIBLE_TRAITS.filter((trait) => recipe.visibleTraits.includes(trait))),
})).readonly();

export type CharacterRecipe = z.infer<typeof characterRecipeSchema>;

export interface CharacterRecipeOptions {
  readonly anatomy?: Partial<Anatomy>;
  readonly ancestry?: Ancestry;
  readonly visibleTraits?: readonly VisibleTrait[];
  readonly hair?: Partial<CharacterRecipeData['hair']>;
  readonly skinTone?: CharacterRecipeData['skinTone'];
  readonly expression?: CharacterRecipeData['expression'];
  readonly eyes?: Partial<CharacterRecipeData['eyes']>;
  readonly outfit?: Partial<CharacterRecipeData['outfit']>;
}

export function createCharacterRecipe(options: CharacterRecipeOptions = {}): CharacterRecipe {
  const bodyPreset = bodyPresetSchema.parse(options.anatomy?.bodyPreset ?? 'balanced');
  const ancestry = ancestrySchema.parse(options.ancestry ?? { primary: 'human' });
  return characterRecipeSchema.parse({
    schemaVersion: CHARACTER_RECIPE_VERSION,
    anatomy: { ...ANATOMY_PRESETS[bodyPreset], headShape: 'soft-oval', ...options.anatomy },
    ancestry,
    visibleTraits: options.visibleTraits ?? resolveAncestryTraits(ancestry),
    hair: { style: 'short-bob', colour: 'hair.chestnut', ...options.hair },
    skinTone: options.skinTone ?? 'skin.warm',
    expression: options.expression ?? 'neutral',
    eyes: { leftColour: 'eyes.brown', rightColour: 'eyes.brown', ...options.eyes },
    outfit: { id: 'starter-outfit', fit: bodyPreset, colour: 'outfit.charcoal', ...options.outfit },
  });
}
