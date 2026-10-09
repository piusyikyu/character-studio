import { characterRecipeSchema } from './recipe';
import type { CharacterRecipe } from './recipe';

// Parsing fixes object key and trait order, so semantically equivalent recipes
// produce canonical compact JSON regardless of input key ordering.
export function serializeCharacterRecipe(recipe: unknown): string {
  return JSON.stringify(characterRecipeSchema.parse(recipe));
}

export function deserializeCharacterRecipe(json: string): CharacterRecipe {
  return characterRecipeSchema.parse(JSON.parse(json));
}
