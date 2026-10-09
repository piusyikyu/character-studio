import { describe, expect, it } from 'vitest';
import { characterRecipeSchema, deserializeCharacterRecipe, EXAMPLE_CHARACTER_RECIPES, serializeCharacterRecipe } from './index';

describe('example character recipes', () => {
  it('provides at least five distinct complete recipes, including all three hybrid pairs', () => {
    expect(EXAMPLE_CHARACTER_RECIPES.length).toBeGreaterThanOrEqual(5);
    expect(new Set(EXAMPLE_CHARACTER_RECIPES.map((example) => example.id)).size).toBe(EXAMPLE_CHARACTER_RECIPES.length);
    expect(new Set(EXAMPLE_CHARACTER_RECIPES.map((example) => serializeCharacterRecipe(example.recipe))).size).toBe(EXAMPLE_CHARACTER_RECIPES.length);
    const hybrids = EXAMPLE_CHARACTER_RECIPES.filter(({ recipe }) => recipe.ancestry.secondary)
      .map(({ recipe }) => [recipe.ancestry.primary, recipe.ancestry.secondary].sort().join('+')).sort();
    expect(hybrids).toEqual(['elf+human', 'elf+vampire', 'human+vampire']);
  });

  it.each(EXAMPLE_CHARACTER_RECIPES)('validates and JSON-round-trips $id', ({ recipe }) => {
    expect(characterRecipeSchema.parse(recipe)).toEqual(recipe);
    expect(deserializeCharacterRecipe(serializeCharacterRecipe(recipe))).toEqual(recipe);
  });
});
