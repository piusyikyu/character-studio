import { describe, expect, it } from 'vitest';
import { characterRecipeSchema, createCharacterRecipe, deserializeCharacterRecipe, EXAMPLE_CHARACTER_RECIPES, generateRandomCharacter, serializeCharacterRecipe } from './index';

describe('character core workflows', () => {
  it('creates a default character, selects a hybrid appearance and saves/loads it', () => {
    const original = createCharacterRecipe();
    const edited = createCharacterRecipe({
      ancestry: { primary: 'elf', secondary: 'vampire' },
      anatomy: { bodyPreset: 'slender', headShape: 'angular' },
      hair: { style: 'long-waves', colour: 'hair.silver' }, skinTone: 'skin.deep', expression: 'stern',
      eyes: { leftColour: 'eyes.blue', rightColour: 'eyes.crimson' }, outfit: { colour: 'outfit.ink' },
    });
    const json = serializeCharacterRecipe(edited);
    expect(deserializeCharacterRecipe(json)).toEqual({
      schemaVersion: 1,
      anatomy: { family: 'female-humanoid-v1', bodyPreset: 'slender', chestSize: 'small', bodyProportions: 'slender', height: 'tall', headShape: 'angular' },
      ancestry: { primary: 'elf', secondary: 'vampire' }, visibleTraits: ['pointed-ears', 'fangs'],
      hair: { style: 'long-waves', colour: 'hair.silver' }, skinTone: 'skin.deep', expression: 'stern',
      eyes: { leftColour: 'eyes.blue', rightColour: 'eyes.crimson' },
      outfit: { id: 'starter-outfit', fit: 'slender', colour: 'outfit.ink' },
    });
    const reordered = { ...Object.fromEntries(Object.entries(edited).reverse()), visibleTraits: ['fangs', 'pointed-ears'] };
    expect(serializeCharacterRecipe(reordered)).toBe(json);
    expect(createCharacterRecipe()).toEqual(original);
  });

  it('makes the supplied pure and hybrid example characters usable through save/load', () => {
    expect(EXAMPLE_CHARACTER_RECIPES.length).toBeGreaterThanOrEqual(5);
    for (const { recipe } of EXAMPLE_CHARACTER_RECIPES) {
      expect(deserializeCharacterRecipe(serializeCharacterRecipe(recipe))).toEqual(recipe);
    }
    const hybridPairs = EXAMPLE_CHARACTER_RECIPES.filter(({ recipe }) => recipe.ancestry.secondary)
      .map(({ recipe }) => [recipe.ancestry.primary, recipe.ancestry.secondary].sort().join('+')).sort();
    expect(hybridPairs).toEqual(['elf+human', 'elf+vampire', 'human+vampire']);
  });

  it('rejects corrupted, unsupported-version and foreign-field recipe imports', () => {
    const recipe = createCharacterRecipe();
    expect(() => deserializeCharacterRecipe('{')).toThrow(SyntaxError);
    for (const data of [null, { schemaVersion: 1 }, { ...recipe, schemaVersion: 2 }, { ...recipe, image: 'body.png' }]) {
      expect(() => deserializeCharacterRecipe(JSON.stringify(data))).toThrow();
    }
  });

  it('reports actionable ancestry, body and outfit incompatibilities when loading recipes', () => {
    const recipe = createCharacterRecipe();
    const incompatible = [
      { data: { ...recipe, visibleTraits: ['rounded-ears', 'fangs'] }, path: ['visibleTraits', 1], code: 'trait-ancestry-mismatch' },
      { data: { ...recipe, anatomy: { ...recipe.anatomy, height: 'tall' } }, path: ['anatomy', 'height'], code: 'anatomy-preset-mismatch' },
      { data: { ...recipe, outfit: { ...recipe.outfit, fit: 'slender' } }, path: ['outfit', 'fit'], code: 'outfit-fit-mismatch' },
    ];
    for (const { data, path, code } of incompatible) {
      expect(() => deserializeCharacterRecipe(JSON.stringify(data))).toThrow();
      const result = characterRecipeSchema.safeParse(data);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toContainEqual(expect.objectContaining({
          path, code: 'custom', message: expect.any(String), params: { compatibilityCode: code },
        }));
      }
    }
  });

  it('reproduces saved random characters independent of intervening generation calls', () => {
    for (const seed of [0, -7, 'studio', 'character-🧝']) {
      const saved = serializeCharacterRecipe(generateRandomCharacter(seed));
      generateRandomCharacter('another character');
      expect(serializeCharacterRecipe(generateRandomCharacter(seed))).toBe(saved);
      expect(serializeCharacterRecipe(deserializeCharacterRecipe(saved))).toBe(saved);
    }
    // Protect the documented version-2 seed contract against accidental drift.
    expect(generateRandomCharacter('character-studio')).toEqual({
      schemaVersion: 1,
      anatomy: { family: 'female-humanoid-v1', bodyPreset: 'slender', chestSize: 'small', bodyProportions: 'slender', height: 'tall', headShape: 'soft-oval' },
      ancestry: { primary: 'human' }, visibleTraits: ['rounded-ears'],
      hair: { style: 'short-bob', colour: 'hair.chestnut' }, skinTone: 'skin.warm', expression: 'stern',
      eyes: { leftColour: 'eyes.green', rightColour: 'eyes.green' },
      outfit: { id: 'starter-outfit', fit: 'slender', colour: 'outfit.charcoal' },
    });
  });

  it('generates varied compatible characters that survive save/load over a range of seeds', () => {
    const appearances = new Set<string>();
    for (let seed = 0; seed < 64; seed++) {
      const recipe = generateRandomCharacter(seed);
      const saved = serializeCharacterRecipe(recipe);
      expect(deserializeCharacterRecipe(saved)).toEqual(recipe);
      appearances.add(saved);
    }
    expect(appearances.size).toBeGreaterThan(1);
  });
});
