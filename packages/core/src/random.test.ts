import { describe, expect, it, vi } from 'vitest';
import { ANATOMY_PRESETS, characterRecipeSchema, generateRandomCharacter, getRecipeCompatibilityIssues, RANDOM_GENERATION_VERSION, serializeCharacterRecipe } from './index';

describe('seeded character generation', () => {
  it.each([0, -7, Number.MAX_SAFE_INTEGER, '', 'studio', 'elf-vampire', 'character-🧝'])('reproduces the exact serialized recipe for seed %j', (seed) => {
    const first = generateRandomCharacter(seed);
    generateRandomCharacter('unrelated call');
    const second = generateRandomCharacter(seed);
    expect(serializeCharacterRecipe(second)).toBe(serializeCharacterRecipe(first));
    expect(second).not.toBe(first);
    expect(getRecipeCompatibilityIssues(second)).toEqual([]);
  });

  it('does not use Math.random or external RNG state', () => {
    const spy = vi.spyOn(Math, 'random').mockImplementation(() => { throw new Error('Global randomness is forbidden'); });
    try {
      expect(characterRecipeSchema.safeParse(generateRandomCharacter('local-state')).success).toBe(true);
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });

  it('generates compatible bodies, outfit fits, pure ancestries and hybrids over many seeds', () => {
    const primaries = new Set<string>();
    const bodies = new Set<string>();
    const recipes = new Set<string>();
    let hybridCount = 0;
    let independentEyes = 0;
    for (let seed = 0; seed < 256; seed++) {
      const recipe = generateRandomCharacter(seed);
      expect(characterRecipeSchema.safeParse(recipe).success).toBe(true);
      expect(getRecipeCompatibilityIssues(recipe)).toEqual([]);
      expect(recipe.anatomy.height).toBe(ANATOMY_PRESETS[recipe.anatomy.bodyPreset].height);
      expect(recipe.outfit.fit).toBe(recipe.anatomy.bodyPreset);
      expect(recipe.ancestry.secondary).not.toBe(recipe.ancestry.primary);
      primaries.add(recipe.ancestry.primary);
      bodies.add(recipe.anatomy.bodyPreset);
      recipes.add(serializeCharacterRecipe(recipe));
      if (recipe.ancestry.secondary) hybridCount++;
      if (recipe.eyes.leftColour !== recipe.eyes.rightColour) independentEyes++;
    }
    expect([...primaries].sort()).toEqual(['elf', 'human', 'vampire']);
    expect([...bodies].sort()).toEqual(['balanced', 'slender']);
    expect(hybridCount).toBeGreaterThan(0);
    expect(hybridCount).toBeLessThan(256);
    expect(independentEyes).toBeGreaterThan(0);
    expect(recipes.size).toBeGreaterThan(128);
  });

  it('distinguishes numeric and string seed namespaces', () => {
    expect(serializeCharacterRecipe(generateRandomCharacter(42))).not.toBe(serializeCharacterRecipe(generateRandomCharacter('42')));
  });

  it.each([NaN, Infinity, -Infinity, 1.5, Number.MAX_SAFE_INTEGER + 1])('rejects unsafe numeric seed %j', (seed) => {
    expect(() => generateRandomCharacter(seed)).toThrow(RangeError);
  });

  it('rejects unsupported runtime seed types', () => {
    for (const seed of [null, undefined, {}, true]) expect(() => generateRandomCharacter(seed as never)).toThrow(TypeError);
  });

  it('retains the version-1 regression recipe for a known seed', () => {
    expect(RANDOM_GENERATION_VERSION).toBe(1);
    expect(generateRandomCharacter('female-character-studio')).toEqual({
      schemaVersion: 1,
      anatomy: { family: 'female-humanoid-v1', bodyPreset: 'slender', chestSize: 'small', bodyProportions: 'slender', height: 'tall', headShape: 'angular' },
      ancestry: { primary: 'vampire' }, visibleTraits: ['rounded-ears'],
      hair: { style: 'long-waves', colour: 'hair.gold' }, skinTone: 'skin.light', expression: 'stern',
      eyes: { leftColour: 'eyes.green', rightColour: 'eyes.brown' },
      outfit: { id: 'starter-outfit', fit: 'slender', colour: 'outfit.charcoal' },
    });
  });
});
