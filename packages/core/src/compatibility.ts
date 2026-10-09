import { ANATOMY_PRESETS } from './anatomy';
import { getAvailableVisibleTraits } from './ancestry';
import type { CharacterRecipeData } from './recipe';

export interface RecipeCompatibilityIssue {
  readonly code: 'anatomy-preset-mismatch' | 'outfit-fit-mismatch' | 'duplicate-trait' | 'ear-trait-conflict' | 'trait-ancestry-mismatch';
  readonly path: readonly (string | number)[];
  readonly message: string;
}

// Accepts structurally validated data. Untrusted data should go through the recipe parser.
export function getRecipeCompatibilityIssues(recipe: CharacterRecipeData): readonly RecipeCompatibilityIssue[] {
  const issues: RecipeCompatibilityIssue[] = [];
  const preset = ANATOMY_PRESETS[recipe.anatomy.bodyPreset];
  for (const field of ['family', 'chestSize', 'bodyProportions', 'height'] as const) {
    if (recipe.anatomy[field] !== preset[field]) {
      issues.push({
        code: 'anatomy-preset-mismatch', path: ['anatomy', field],
        message: `Body preset "${preset.bodyPreset}" requires ${field} "${preset[field]}"; choose that value or a matching authored body preset.`,
      });
    }
  }

  if (recipe.outfit.fit !== recipe.anatomy.bodyPreset) {
    issues.push({
      code: 'outfit-fit-mismatch', path: ['outfit', 'fit'],
      message: `Starter outfit fit "${recipe.outfit.fit}" does not fit body "${recipe.anatomy.bodyPreset}"; select fit "${recipe.anatomy.bodyPreset}".`,
    });
  }

  const traits = new Set(recipe.visibleTraits);
  if (traits.size !== recipe.visibleTraits.length) {
    issues.push({ code: 'duplicate-trait', path: ['visibleTraits'], message: 'Visible traits must be unique; remove duplicate entries.' });
  }
  const earCount = Number(traits.has('rounded-ears')) + Number(traits.has('pointed-ears'));
  if (earCount !== 1) {
    issues.push({ code: 'ear-trait-conflict', path: ['visibleTraits'], message: 'Select exactly one supported ear shape: rounded-ears or pointed-ears.' });
  }
  const available = getAvailableVisibleTraits(recipe.ancestry);
  recipe.visibleTraits.forEach((trait, index) => {
    if (!available.includes(trait)) {
      issues.push({
        code: 'trait-ancestry-mismatch', path: ['visibleTraits', index],
        message: `Trait "${trait}" is not inherited from the selected ancestry; select a supported trait or ancestry that provides it.`,
      });
    }
  });
  return issues;
}
