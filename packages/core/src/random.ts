import { BODY_PRESETS } from './anatomy';
import { getAvailableVisibleTraits, SPECIES } from './ancestry';
import type { Ancestry, VisibleTrait } from './ancestry';
import { EYE_COLOURS, FACIAL_EXPRESSIONS, HAIR_COLOURS, HAIR_STYLES, HEAD_SHAPES, OUTFIT_COLOURS, SKIN_TONES } from './domains';
import { createCharacterRecipe } from './recipe';
import type { CharacterRecipe } from './recipe';

export const RANDOM_GENERATION_VERSION = 1;
export type RandomSeed = string | number;

function createSeededRandom(seed: RandomSeed): () => number {
  if (typeof seed !== 'string' && typeof seed !== 'number') throw new TypeError('A character seed must be a string or a safe integer.');
  if (typeof seed === 'number' && !Number.isSafeInteger(seed)) throw new RangeError('A numeric character seed must be a safe integer.');
  const text = `female-character-studio:${RANDOM_GENERATION_VERSION}:${typeof seed}:${seed}`;
  // FNV-1a over UTF-16 code units followed by a 32-bit Mulberry-style sequence.
  // Math.imul/bitwise arithmetic makes this independent of platform and global RNG state.
  let state = 0x811c9dc5;
  for (let index = 0; index < text.length; index++) state = Math.imul(state ^ text.charCodeAt(index), 0x01000193) >>> 0;

  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 0x100000000;
  };
}

function pick<T>(values: readonly T[], next: () => number): T {
  const value = values[Math.floor(next() * values.length)];
  if (value === undefined) throw new Error('Cannot choose from an empty character option set.');
  return value;
}

export function generateRandomCharacter(seed: RandomSeed): CharacterRecipe {
  const next = createSeededRandom(seed);
  const primary = pick(SPECIES, next);
  const secondary = next() < 0.5 ? pick(SPECIES.filter((species) => species !== primary), next) : undefined;
  const ancestry: Ancestry = secondary ? { primary, secondary } : { primary };
  const bodyPreset = pick(BODY_PRESETS, next);
  const available = getAvailableVisibleTraits(ancestry);
  const visibleTraits: VisibleTrait[] = [pick(available.filter((trait) => trait !== 'fangs'), next)];
  if (available.includes('fangs') && next() < 0.75) visibleTraits.push('fangs');

  return createCharacterRecipe({
    ancestry,
    visibleTraits,
    anatomy: { bodyPreset, headShape: pick(HEAD_SHAPES, next) },
    hair: { style: pick(HAIR_STYLES, next), colour: pick(HAIR_COLOURS, next) },
    skinTone: pick(SKIN_TONES, next),
    expression: pick(FACIAL_EXPRESSIONS, next),
    eyes: { leftColour: pick(EYE_COLOURS, next), rightColour: pick(EYE_COLOURS, next) },
    outfit: { colour: pick(OUTFIT_COLOURS, next) },
  });
}
