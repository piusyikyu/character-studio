import { describe, expect, it } from 'vitest';
import { characterSchema, createCharacter, DIRECTION_LABEL_RGBA, EXPORT_BACKGROUND, EXPORT_BACKGROUND_RGBA, INTERNAL_BACKGROUND_RGBA, NATIVE_SIZE, pixelPointSchema, pixelSizeSchema } from './index';

describe('character contracts', () => {
  it('creates independent, validated empty characters', () => {
    const first = createCharacter();
    first.layers.push({ slot: 'body', assetId: 'body.base', offset: { x: 0, y: 0 } });
    expect(createCharacter().layers).toEqual([]);
    expect(createCharacter().direction).toBe('south');
  });

  it('rejects duplicate slots, unknown directions and fractional offsets', () => {
    const layer = { slot: 'hair', assetId: 'hair.base', offset: { x: 0, y: 0 } };
    expect(characterSchema.safeParse({ ...createCharacter(), layers: [layer, layer] }).success).toBe(false);
    expect(characterSchema.safeParse({ ...createCharacter(), direction: 'up' }).success).toBe(false);
    expect(pixelPointSchema.safeParse({ x: 0.5, y: 0 }).success).toBe(false);
    expect(pixelPointSchema.parse({ x: -1, y: 2 })).toEqual({ x: -1, y: 2 });
  });

  it('requires integer native dimensions and exact RGBA policy values', () => {
    expect(NATIVE_SIZE).toEqual({ width: 64, height: 96 });
    expect(pixelSizeSchema.safeParse({ width: 64.5, height: 96 }).success).toBe(false);
    expect(pixelSizeSchema.safeParse({ width: 0, height: 96 }).success).toBe(false);
    expect(EXPORT_BACKGROUND).toBe('#00FF00');
    expect(EXPORT_BACKGROUND_RGBA).toEqual([0, 255, 0, 255]);
    expect(DIRECTION_LABEL_RGBA).toEqual([255, 255, 0, 255]);
    expect(INTERNAL_BACKGROUND_RGBA).toEqual([0, 0, 0, 0]);
  });
});
