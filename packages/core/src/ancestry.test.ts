import { describe, expect, it } from 'vitest';
import { characterRecipeSchema, createCharacterRecipe, getAvailableVisibleTraits, resolveAncestryTraits } from './index';

describe('composable ancestry', () => {
  it.each([
    ['human', ['rounded-ears']], ['elf', ['pointed-ears']], ['vampire', ['rounded-ears', 'fangs']],
  ] as const)('resolves %s defaults into semantic visible traits', (primary, expected) => {
    expect(resolveAncestryTraits({ primary })).toEqual(expected);
    expect(createCharacterRecipe({ ancestry: { primary } }).visibleTraits).toEqual(expected);
  });

  it('combines elf and vampire traits independent of ancestry order without blending', () => {
    const first = { primary: 'elf', secondary: 'vampire' } as const;
    const reverse = { primary: 'vampire', secondary: 'elf' } as const;
    expect(getAvailableVisibleTraits(first)).toEqual(['rounded-ears', 'pointed-ears', 'fangs']);
    expect(resolveAncestryTraits(first)).toEqual(['pointed-ears', 'fangs']);
    expect(resolveAncestryTraits(reverse)).toEqual(resolveAncestryTraits(first));
    expect(createCharacterRecipe({ ancestry: first, visibleTraits: ['rounded-ears', 'fangs'] }).visibleTraits).toEqual(['rounded-ears', 'fangs']);
  });

  it('allows compatible inherited subsets for hybrids', () => {
    const recipe = createCharacterRecipe({ ancestry: { primary: 'human', secondary: 'elf' }, visibleTraits: ['rounded-ears'] });
    expect(recipe.visibleTraits).toEqual(['rounded-ears']);
    expect(createCharacterRecipe({ ancestry: { primary: 'human', secondary: 'vampire' }, visibleTraits: ['rounded-ears'] }).visibleTraits).toEqual(['rounded-ears']);
  });

  it.each([
    ['human', ['rounded-ears', 'fangs']], ['human', ['pointed-ears']], ['elf', ['rounded-ears']],
    ['vampire', ['pointed-ears', 'fangs']], ['human', []], ['elf', ['fangs']],
    ['elf', ['pointed-ears', 'pointed-ears']], ['vampire', ['rounded-ears', 'pointed-ears']],
  ] as const)('rejects incompatible %s traits %j', (primary, visibleTraits) => {
    const recipe = createCharacterRecipe();
    expect(characterRecipeSchema.safeParse({ ...recipe, ancestry: { primary }, visibleTraits }).success).toBe(false);
  });
});
