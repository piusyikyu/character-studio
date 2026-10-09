import { createCharacterRecipe } from './recipe';
import type { CharacterRecipeOptions } from './recipe';

function example(id: string, options: CharacterRecipeOptions) {
  return Object.freeze({ id, recipe: createCharacterRecipe(options) });
}

export const EXAMPLE_CHARACTER_RECIPES = Object.freeze([
  example('human-balanced', {
    ancestry: { primary: 'human' },
    hair: { style: 'short-bob', colour: 'hair.chestnut' }, skinTone: 'skin.warm',
  }),
  example('elf-slender', {
    ancestry: { primary: 'elf' }, anatomy: { bodyPreset: 'slender' },
    hair: { style: 'long-waves', colour: 'hair.gold' }, skinTone: 'skin.light',
    eyes: { leftColour: 'eyes.blue', rightColour: 'eyes.green' },
  }),
  example('vampire-balanced', {
    ancestry: { primary: 'vampire' }, anatomy: { headShape: 'angular' },
    hair: { colour: 'hair.silver' }, expression: 'stern',
    eyes: { leftColour: 'eyes.crimson', rightColour: 'eyes.crimson' }, outfit: { colour: 'outfit.ink' },
  }),
  example('human-elf', {
    ancestry: { primary: 'human', secondary: 'elf' }, visibleTraits: ['pointed-ears'],
    hair: { style: 'long-waves', colour: 'hair.black' }, skinTone: 'skin.deep',
    eyes: { leftColour: 'eyes.brown', rightColour: 'eyes.gold' },
  }),
  example('elf-vampire', {
    ancestry: { primary: 'elf', secondary: 'vampire' }, visibleTraits: ['pointed-ears', 'fangs'],
    anatomy: { bodyPreset: 'slender', headShape: 'angular' },
    hair: { style: 'long-waves', colour: 'hair.silver' }, expression: 'stern',
    eyes: { leftColour: 'eyes.blue', rightColour: 'eyes.crimson' }, outfit: { colour: 'outfit.ink' },
  }),
  example('human-vampire', {
    ancestry: { primary: 'human', secondary: 'vampire' }, visibleTraits: ['rounded-ears', 'fangs'],
    hair: { style: 'short-bob', colour: 'hair.black' }, skinTone: 'skin.deep',
    eyes: { leftColour: 'eyes.green', rightColour: 'eyes.crimson' },
  }),
]);
