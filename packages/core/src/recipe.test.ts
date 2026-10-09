import { describe, expect, it } from 'vitest';
import { ANATOMY_PRESETS, characterRecipeSchema, createCharacterRecipe, DIRECTIONS, directionSchema, getRecipeCompatibilityIssues, RENDER_TARGET_SPECS, renderTargetSchema } from './index';

describe('character recipe validation', () => {
  it('creates a complete versioned default recipe with independent eye colours', () => {
    const recipe = createCharacterRecipe({ eyes: { rightColour: 'eyes.blue' } });
    expect(recipe).toEqual({
      schemaVersion: 1,
      anatomy: { ...ANATOMY_PRESETS.balanced, headShape: 'soft-oval' },
      ancestry: { primary: 'human' }, visibleTraits: ['rounded-ears'],
      hair: { style: 'short-bob', colour: 'hair.chestnut' }, skinTone: 'skin.warm', expression: 'neutral',
      eyes: { leftColour: 'eyes.brown', rightColour: 'eyes.blue' },
      outfit: { id: 'starter-outfit', fit: 'balanced', colour: 'outfit.charcoal' },
    });
    expect(characterRecipeSchema.parse(recipe)).toEqual(recipe);
  });

  it('derives body dimensions and matching outfit fit from the authored preset', () => {
    expect(createCharacterRecipe({ anatomy: { bodyPreset: 'slender' } }).anatomy).toEqual({ ...ANATOMY_PRESETS.slender, headShape: 'soft-oval' });
    expect(createCharacterRecipe({ anatomy: { bodyPreset: 'slender' } }).outfit.fit).toBe('slender');
  });

  it.each([
    { schemaVersion: 2 }, { schemaVersion: undefined },
    { direction: 'N' }, { target: 'pixel' }, { image: 'body.png' },
    { skinTone: '#00FF00' }, { skinTone: 'skin.unknown' }, { expression: 'smiling' },
    { hair: { style: 'unknown', colour: 'hair.black' } },
    { hair: { style: 'short-bob', colour: 'eyes.blue' } },
    { eyes: { leftColour: 'eyes.blue', rightColour: 'hair.black' } },
    { outfit: { id: 'unknown', fit: 'balanced', colour: 'outfit.charcoal' } },
  ])('rejects invalid or unsupported recipe fields: %j', (override) => {
    expect(characterRecipeSchema.safeParse({ ...createCharacterRecipe(), ...override }).success).toBe(false);
  });

  it('rejects missing fields, unknown nested keys, malformed ancestry and unknown traits', () => {
    expect(characterRecipeSchema.safeParse({ schemaVersion: 1 }).success).toBe(false);
    expect(characterRecipeSchema.safeParse({ ...createCharacterRecipe(), anatomy: { ...createCharacterRecipe().anatomy, scale: 1.5 } }).success).toBe(false);
    expect(() => createCharacterRecipe({ ancestry: { primary: 'elf', secondary: 'elf' } })).toThrow('Secondary ancestry');
    expect(characterRecipeSchema.safeParse({ ...createCharacterRecipe(), ancestry: { primary: 'dragon' } }).success).toBe(false);
    expect(characterRecipeSchema.safeParse({ ...createCharacterRecipe(), visibleTraits: ['wings'] }).success).toBe(false);
  });

  it('returns fresh deeply immutable recipes without altering input choices', () => {
    const choices: { hair: { style: 'short-bob' | 'long-waves' } } = { hair: { style: 'long-waves' } };
    const first = createCharacterRecipe(choices);
    choices.hair.style = 'short-bob';
    expect(first.hair.style).toBe('long-waves');
    const second = createCharacterRecipe();
    expect(second.hair.style).toBe('short-bob');
    expect(first).not.toBe(second);
    expect(Object.isFrozen(first)).toBe(true);
    for (const value of [first.anatomy, first.ancestry, first.hair, first.eyes, first.outfit, first.visibleTraits]) expect(Object.isFrozen(value)).toBe(true);
  });
});

describe('anatomy and outfit compatibility', () => {
  it.each([
    { chestSize: 'small' }, { bodyProportions: 'slender' }, { height: 'tall' }, { height: 170 }, { family: 'unknown' },
  ])('rejects invalid balanced anatomy combinations: %j', (override) => {
    const recipe = createCharacterRecipe();
    expect(characterRecipeSchema.safeParse({ ...recipe, anatomy: { ...recipe.anatomy, ...override } }).success).toBe(false);
  });

  it('reports actionable body and outfit mismatch paths and codes', () => {
    const recipe = createCharacterRecipe();
    const invalid = { ...recipe, anatomy: { ...recipe.anatomy, height: 'tall' as const }, outfit: { ...recipe.outfit, fit: 'slender' as const }, visibleTraits: [...recipe.visibleTraits] };
    expect(getRecipeCompatibilityIssues(invalid)).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'anatomy-preset-mismatch', path: ['anatomy', 'height'] }),
      expect.objectContaining({ code: 'outfit-fit-mismatch', path: ['outfit', 'fit'] }),
    ]));
    const parsed = characterRecipeSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
    if (!parsed.success) expect(parsed.error.issues.map((issue) => issue.path)).toContainEqual(['outfit', 'fit']);
    expect(getRecipeCompatibilityIssues(invalid).find((issue) => issue.code === 'outfit-fit-mismatch')?.message).toContain('select fit "balanced"');
    expect(() => createCharacterRecipe({ outfit: { fit: 'slender' } })).toThrow('does not fit body');
  });
});

describe('render vocabulary', () => {
  it('defines the exact canonical direction order and two independent native targets', () => {
    expect(DIRECTIONS).toEqual(['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW']);
    for (const direction of DIRECTIONS) expect(directionSchema.parse(direction)).toBe(direction);
    expect(directionSchema.safeParse('north').success).toBe(false);
    expect(RENDER_TARGET_SPECS).toEqual({ detailed: { width: 1024, height: 1536, pose: 'tpose' }, pixel: { width: 128, height: 192, pose: 'idle' } });
    expect(renderTargetSchema.safeParse('canvas').success).toBe(false);
    expect(renderTargetSchema.parse('detailed')).toBe('detailed');
    expect(renderTargetSchema.parse('pixel')).toBe('pixel');
  });
});
