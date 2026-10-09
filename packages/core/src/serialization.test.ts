import { describe, expect, it } from 'vitest';
import { createCharacterRecipe, deserializeCharacterRecipe, serializeCharacterRecipe } from './index';

describe('recipe serialization', () => {
  it('round-trips hybrid appearance, version, anatomy and independent eye palettes', () => {
    const recipe = createCharacterRecipe({
      ancestry: { primary: 'elf', secondary: 'vampire' }, anatomy: { bodyPreset: 'slender', headShape: 'angular' },
      hair: { style: 'long-waves', colour: 'hair.silver' }, eyes: { leftColour: 'eyes.blue', rightColour: 'eyes.crimson' },
      expression: 'stern', skinTone: 'skin.deep', outfit: { colour: 'outfit.ink' },
    });
    expect(deserializeCharacterRecipe(serializeCharacterRecipe(recipe))).toEqual(recipe);
    expect(deserializeCharacterRecipe(serializeCharacterRecipe(recipe)).schemaVersion).toBe(1);
  });

  it('produces canonical JSON from reordered input keys and visible traits', () => {
    const recipe = createCharacterRecipe({ ancestry: { primary: 'elf', secondary: 'vampire' } });
    const reordered = Object.fromEntries(Object.entries(recipe).reverse());
    reordered.visibleTraits = ['fangs', 'pointed-ears'];
    expect(serializeCharacterRecipe(reordered)).toBe(serializeCharacterRecipe(recipe));
    expect(serializeCharacterRecipe(deserializeCharacterRecipe(serializeCharacterRecipe(recipe)))).toBe(serializeCharacterRecipe(recipe));
  });

  it('rejects malformed JSON, unsupported versions and semantic errors on import/export', () => {
    expect(() => deserializeCharacterRecipe('{')).toThrow(SyntaxError);
    for (const json of ['null', '[]', '{"schemaVersion":2}']) expect(() => deserializeCharacterRecipe(json)).toThrow();
    const invalid = { ...createCharacterRecipe(), visibleTraits: ['pointed-ears'] };
    expect(() => serializeCharacterRecipe(invalid)).toThrow('not inherited');
    expect(() => deserializeCharacterRecipe(JSON.stringify(invalid))).toThrow('not inherited');
  });
});
